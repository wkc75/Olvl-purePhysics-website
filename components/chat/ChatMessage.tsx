import React from "react";

export default function ChatMessage({
  role,
  content,
}: {
  role: "user" | "assistant";
  content: string;
}) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 whitespace-pre-wrap leading-relaxed ${
          isUser ? "bg-blue-600" : "bg-slate-800 border border-slate-700"
        }`}
      >
        {content}
      </div>
    </div>
  );
}
