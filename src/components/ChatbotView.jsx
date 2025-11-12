import React, { useState, useRef, useEffect } from "react";

export default function ChatbotView({ messages, onSendMessage, isSending }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-160px)]">
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto border border-slate-800 rounded-xl p-3 bg-slate-900/70 space-y-2 text-sm"
      >
        {messages.length === 0 && (
          <p className="text-slate-400">
            Ask a question about this session’s transcript.
          </p>
        )}

        {messages.map((m, idx) => (
          <div
            key={idx}
            className={[
              "max-w-[80%] rounded-xl px-3 py-2",
              m.role === "user"
                ? "bg-blue-600 text-white ml-auto"
                : "bg-slate-800 text-slate-50 mr-auto",
            ].join(" ")}
          >
            {m.content}
          </div>
        ))}
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-3 flex items-center gap-2"
      >
        <input
          type="text"
          className="flex-1 text-sm px-3 py-2 rounded-full bg-slate-900 border border-slate-700 text-slate-50 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Ask a question about the lecture…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={isSending}
          className={[
            "px-4 py-2 rounded-full text-xs font-semibold",
            "transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
            isSending
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400",
          ].join(" ")}
        >
          {isSending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
