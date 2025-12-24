"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  PointerEvent,
} from "react";
import ChatMessage from "./ChatMessage";

/**
 * -------------------------
 * Types
 * -------------------------
 */
type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

/**
 * -------------------------
 * Constants (UX constraints)
 * -------------------------
 */
const MIN_W = 280;
const MIN_H = 260;
const MAX_W = 520;
const MAX_H = 640;

const STORAGE_KEY = "h2-physics-chat-widget";

/**
 * -------------------------
 * Helper: clamp value
 * -------------------------
 */
function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

/**
 * -------------------------
 * ChatWidget
 * -------------------------
 */
export default function ChatWidget() {
  /**
   * -------------------------
   * Chat state (unchanged logic)
   * -------------------------
   */
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hi! Ask me an H2 Physics question. I will only answer within the H2 syllabus and based on your site notes.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const canSend = useMemo(
    () => input.trim().length > 0 && !loading,
    [input, loading]
  );

  async function send() {
    if (!canSend) return;

    const userMsg: Msg = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Request failed");
      }

      const data: { reply: string } = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Sorry — something went wrong.\n\nDebug hint: ${err.message}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  /**
   * -------------------------
   * UI state: open / size
   * -------------------------
   */
  const [open, setOpen] = useState(false);
  const [size, setSize] = useState({ width: 320, height: 360 });

  /**
   * Restore persisted state
   */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.size) setSize(parsed.size);
      if (typeof parsed?.open === "boolean") setOpen(parsed.open);
    } catch {
      /* ignore */
    }
  }, []);

  /**
   * Persist state
   */
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ open, size })
    );
  }, [open, size]);

  /**
   * -------------------------
   * Resize logic (Pointer Events)
   * -------------------------
   */
  const resizingRef = useRef(false);
  const startRef = useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
  });

  function onResizeStart(e: PointerEvent<HTMLDivElement>) {
    e.preventDefault();
    resizingRef.current = true;
    startRef.current = {
      x: e.clientX,
      y: e.clientY,
      w: size.width,
      h: size.height,
    };

    // Capture pointer so dragging continues outside handle
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.userSelect = "none";
  }

  function onResizeMove(e: PointerEvent<HTMLDivElement>) {
    if (!resizingRef.current) return;

    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;

    const vw = window.innerWidth * 0.9;
    const vh = window.innerHeight * 0.8;

    setSize({
      width: clamp(
        startRef.current.w + dx,
        MIN_W,
        Math.min(MAX_W, vw)
      ),
      height: clamp(
        startRef.current.h + dy,
        MIN_H,
        Math.min(MAX_H, vh)
      ),
    });
  }

  function onResizeEnd(e: PointerEvent<HTMLDivElement>) {
    resizingRef.current = false;
    document.body.style.userSelect = "";
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }

  /**
   * -------------------------
   * Collapsed button (default)
   * -------------------------
   */
  if (!open) {
    return (
      <button
        aria-label="Open chat"
        onClick={() => setOpen(true)}
        className="
          fixed bottom-4 right-4
          h-12 w-12
          rounded-full
          bg-slate-900 text-white
          border border-slate-700
          shadow-lg
          hover:bg-slate-800
          focus:outline-none focus:ring-2 focus:ring-white
        "
      >
        Chat
      </button>
    );
  }

  /**
   * -------------------------
   * Expanded panel
   * -------------------------
   */
  return (
    <div
      className="fixed bottom-4 right-4 bg-slate-900 text-white shadow-xl border border-slate-700 rounded-2xl flex flex-col overflow-hidden"
      style={{
        width: size.width,
        height: size.height,
        maxWidth: "90vw",
        maxHeight: "80vh",
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-slate-700 flex items-center justify-between">
        <span className="font-semibold text-sm">
          H2 Physics Tutor
        </span>
        <button
          aria-label="Close chat"
          onClick={() => setOpen(false)}
          className="text-slate-400 hover:text-white focus:outline-none"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        {loading && (
          <ChatMessage
            role="assistant"
            content="Thinking… (checking your notes)"
          />
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-700 flex gap-2">
        <input
          className="
            flex-1 rounded-xl
            bg-slate-800 border border-slate-700
            px-3 py-2
            outline-none
            focus:ring-2 focus:ring-white
          "
          placeholder="Type an H2 Physics question…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
          disabled={loading}
        />
        <button
          onClick={send}
          disabled={!canSend}
          className="
            rounded-xl bg-white text-slate-900
            px-4 py-2 font-semibold
            disabled:opacity-50
            focus:outline-none focus:ring-2 focus:ring-white
          "
        >
          Send
        </button>
      </div>

      {/* Resize handle */}
      <div
        aria-hidden
        className="
          absolute bottom-1 right-1
          h-4 w-4
          cursor-se-resize
          bg-slate-600/40
          rounded-sm
        "
        onPointerDown={onResizeStart}
        onPointerMove={onResizeMove}
        onPointerUp={onResizeEnd}
        onPointerCancel={onResizeEnd}
      />
    </div>
  );
}
