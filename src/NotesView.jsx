// src/components/NotesView.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function NotesView({
  notes,
  onGenerateNotes,   // (userRequests?: string) => void
  isGenerating,
}) {
  const [userRequests, setUserRequests] = useState("");

  const handleClick = () => {
    // 🔑 Always pass the string, never the event
    onGenerateNotes(userRequests);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="space-y-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-slate-300">
            Optional: Tell the AI how you want the notes formatted
          </label>
          <textarea
            placeholder={`Examples:
- Make the notes more concise and exam-focused.
- Add definitions for key terms.
- Break into sections with examples and mini-summaries.
- Write in a very beginner-friendly style.`}
            value={userRequests}
            onChange={(e) => setUserRequests(e.target.value)}
            className="w-full h-32 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 p-3 focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>

        <button
          type="button"
          onClick={handleClick}  // ✅ uses our wrapper, NOT passing event
          disabled={isGenerating}
          className={[
            "px-5 py-2 rounded-full text-sm font-medium transition",
            isGenerating
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-400",
          ].join(" ")}
        >
          {isGenerating
            ? "Generating notes..."
            : notes
            ? "Regenerate Notes With These Settings"
            : "Generate Notes"}
        </button>
      </div>

      {/* Notes display */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        {notes ? (
          <ReactMarkdown className="prose prose-invert max-w-none text-sm leading-relaxed">
            {notes}
          </ReactMarkdown>
        ) : (
          <p className="text-slate-400 text-sm">
            No notes have been generated yet. Add any preferences above (or leave it blank)
            and click <span className="font-medium text-slate-200">Generate Notes</span>.
          </p>
        )}
      </div>
    </div>
  );
}
