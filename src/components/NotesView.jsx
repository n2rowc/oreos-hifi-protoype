import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function NotesView({
  notes,
  onGenerateNotes, // takes userRequests (string)
  isGenerating,
}) {
  const [userRequests, setUserRequests] = useState("");

  const handleGenerate = () => {
    onGenerateNotes(userRequests);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-50">
            AI-Generated Lecture Notes
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Customize how the notes look and feel, then let the AI format them
            for you.
          </p>
        </div>
      </div>

      {/* User request input */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 md:p-5 space-y-3">
        <label className="block text-sm font-medium text-slate-200">
          Optional: Tell the AI how you want the notes formatted
        </label>

        <p className="text-xs text-slate-400">
          Examples:
          <br />
          – <span className="italic">Give me a 10-word summary.</span>
          <br />
          – <span className="italic">Make the notes concise and exam-friendly.</span>
          <br />
          – <span className="italic">
            Break into short sections with mini-summaries.
          </span>
          <br />
          – <span className="italic">Use a very beginner-friendly teaching tone.</span>
        </p>

        <textarea
          placeholder="Type your preferences here..."
          value={userRequests}
          onChange={(e) => setUserRequests(e.target.value)}
          className="w-full h-28 md:h-32 bg-slate-950/70 border border-slate-700 rounded-lg 
                     text-sm text-slate-100 p-3 focus:outline-none focus:ring-1 
                     focus:ring-blue-400 placeholder:text-slate-600 resize-none"
        />

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className={[
            "inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition",
            isGenerating
              ? "bg-slate-800 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/20",
          ].join(" ")}
        >
          {isGenerating ? (
            <>
              <span className="inline-block h-3 w-3 rounded-full border-2 border-t-transparent border-white animate-spin" />
              Generating…
            </>
          ) : notes ? (
            "Regenerate Notes With These Settings"
          ) : (
            "Generate Notes"
          )}
        </button>
      </div>

      {/* Notes output */}
      <div
        className="rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:p-6 
                   max-h-[70vh] overflow-y-auto"
      >
        <div
          className="prose prose-invert max-w-none
                     prose-headings:text-slate-50 
                     prose-p:text-slate-200 
                     prose-li:text-slate-200 
                     prose-strong:text-slate-50 
                     prose-h2:mt-4 prose-h2:mb-2
                     prose-h3:mt-3 prose-h3:mb-1"
        >
          {notes ? (
            <ReactMarkdown>{notes}</ReactMarkdown>
          ) : (
            <p className="text-slate-400 text-sm">
              No notes have been generated yet. Add formatting preferences above
              (optional) and click{" "}
              <span className="font-medium text-slate-200">Generate Notes</span>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
