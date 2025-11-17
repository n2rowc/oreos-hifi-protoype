import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function NotesView({
  notes,
  onGenerateNotes,   // takes userRequests (string)
  isGenerating,
}) {
  const [userRequests, setUserRequests] = useState("");

  const handleGenerate = () => {
    onGenerateNotes(userRequests);
  };

  return (
    <div className="space-y-6">

      {/* User request input */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-slate-300">
          Optional: Tell the AI how you want the notes formatted
        </label>

        <textarea
          placeholder={`Examples:
- Make the notes concise and exam-friendly.
- Add definitions for complex terms.
- Break into short sections with mini-summaries.
- Use a very beginner-friendly teaching tone.`}
          value={userRequests}
          onChange={(e) => setUserRequests(e.target.value)}
          className="w-full h-32 bg-slate-900/60 border border-slate-700 rounded-lg 
                     text-sm text-slate-200 p-3 focus:outline-none focus:ring-1 
                     focus:ring-blue-400"
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={[
            "self-start px-5 py-2 rounded-full text-sm font-medium transition",
            isGenerating
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-400"
          ].join(" ")}
        >
          {isGenerating
            ? "Generating..."
            : notes
              ? "Regenerate Notes With These Settings"
              : "Generate Notes"}
        </button>
      </div>

      {/* Notes output */}
      <div
        className="prose prose-invert max-w-none 
                   prose-headings:text-slate-50 
                   prose-p:text-slate-200 
                   prose-li:text-slate-200 
                   prose-strong:text-slate-50"
      >
        {notes ? (
          <ReactMarkdown>{notes}</ReactMarkdown>
        ) : (
          <p className="text-slate-400">
            No notes have been generated yet. Add formatting preferences above
            (optional) and click{" "}
            <span className="font-medium text-slate-200">Generate Notes</span>.
          </p>
        )}
      </div>
    </div>
  );
}
