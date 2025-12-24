import fs from "fs/promises";
import path from "path";

type Doc = { path: string; text: string };

// Change this to wherever your MDX lives
const CONTENT_DIR = path.join(process.cwd(), "app", "physics");

function stripMdx(mdx: string) {
  // MVP: remove code blocks + JSX-ish tags roughly
  return mdx
    .replace(/```[\s\S]*?```/g, "")         // remove fenced code blocks
    .replace(/<[^>]+>/g, "")               // remove JSX/HTML tags
    .replace(/\{[\s\S]*?\}/g, "")          // remove { ... } blocks (rough)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, "")  // images
    .replace(/\[[^\]]*\]\([^)]+\)/g, "$1") // links -> text
    .trim();
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(full)));
    else if (e.isFile() && (full.endsWith(".mdx") || full.endsWith(".md"))) files.push(full);
  }
  return files;
}

export async function loadAllMdxDocuments(): Promise<Doc[]> {
  const files = await walk(CONTENT_DIR);
  const docs: Doc[] = [];
  for (const f of files) {
    const raw = await fs.readFile(f, "utf8");
    docs.push({
      path: path.relative(process.cwd(), f),
      text: stripMdx(raw),
    });
  }
  return docs;
}
