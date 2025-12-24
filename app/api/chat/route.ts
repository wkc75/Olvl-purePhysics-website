import { NextResponse } from "next/server";
import { openai } from "@/lib/llm/openai";
import { loadAllMdxDocuments } from "@/lib/mdx/loadMdx";
import { chunkText } from "@/lib/mdx/chunkMdx";
import { retrieveTopChunksKeyword } from "@/lib/mdx/retrieveKeyword";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/llm/prompt";
import { classifyScope } from "@/lib/scope/h2Scope";
 
 
type ChatMsg = { role: "user" | "assistant"; content: string };
 
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { messages: ChatMsg[] };
    const messages = body.messages ?? [];
    const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

    // 1) Scope gate (fast heuristic MVP)
    const scope = classifyScope(lastUser);
    if (!scope.allowed) {
      return NextResponse.json({
        reply: scope.refusal,
      });
    }

    // 2) Load + chunk MDX content
    const docs = await loadAllMdxDocuments(); // [{ path, text }]
    const chunks = docs.flatMap((d) =>
      chunkText(d.text, {
        chunkSize: 900,
        chunkOverlap: 120,
        sourceLabel: d.path,
      })
    );

    // 3) Retrieve relevant chunks (keyword MVP)
    const top = retrieveTopChunksKeyword(lastUser, chunks, 6);

    // 4) Call OpenAI
    const system = buildSystemPrompt();
    const user = buildUserPrompt(lastUser, top);

    const resp = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    });

    const reply = resp.choices[0]?.message?.content ?? "No response.";
    return NextResponse.json({ reply });
  } catch (e: any) {
    return new NextResponse(e?.message ?? "Server error", { status: 500 });
  }
}
