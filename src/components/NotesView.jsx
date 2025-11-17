// src/components/NotesView.jsx
import React, { useState } from "react";

export default function NotesView({
  notes,
  onGenerateNotes,   // (userRequests?: string) => void
  isGenerating,
}) {
  const [userRequests, setUserRequests] = useState("");

  const handleClick = () => {
    onGenerateNotes(userRequests);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-2">
        Generated Notes
      </h3>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-300">
          Optional: tell the AI how you want the notes formatted
        </label>
        <textarea
          value={userRequests}
          onChange={(e) => setUserRequests(e.target.value)}
          placeholder="Example: Make these notes concise with clear section headers and add definitions for technical terms."
          className="w-full h-28 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-200 p-3 focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
        <button
          type="button"
          onClick={handleClick}
          disabled={isGenerating}
          className={[
            "self-start px-4 py-2 rounded-full text-sm font-medium transition",
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

      <div className="mt-4 bg-slate-900/60 border border-slate-800 rounded-lg p-3 min-h-[100px] text-sm text-slate-200 whitespace-pre-wrap">
        {notes || "No notes yet. Click Generate Notes to create them."}
      </div>
    </div>
  );
}
