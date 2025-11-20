import React, { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function NotesView({
  notes,
  onGenerateNotes, // takes userRequests (string)
  isGenerating,
}) {
  const [userRequests, setUserRequests] = useState("");
  const [isExpanded, setIsExpanded] = useState(true);       // normal expanded vs compact
  const [isFullscreen, setIsFullscreen] = useState(false); // NEW fullscreen mode

  const handleGenerate = () => {
    onGenerateNotes(userRequests);
  };

  const toggleExpand = () => setIsExpanded((prev) => !prev);
  const openFullscreen = () => setIsFullscreen(true);
  const closeFullscreen = () => setIsFullscreen(false);

  // Markdown styling reused for fullscreen & normal modes
  const markdownClasses =
    "prose prose-invert max-w-none " +
    "prose-headings:text-slate-50 prose-p:text-slate-200 prose-li:text-slate-200 " +
    "prose-strong:text-slate-50 prose-h2:mt-4 prose-h2:mb-2 prose-h3:mt-3 prose-h3:mb-1";

  return (
    <>
      {/* ========== MAIN PAGE VIEW ========== */}
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-baseline justify-between gap-4">
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
            – <i>Give me a 10-word summary.</i>
            <br />
            – <i>Make the notes concise and exam-friendly.</i>
            <br />
            – <i>Break into short sections with mini-summaries.</i>
            <br />
            – <i>Use a very beginner-friendly teaching tone.</i>
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

        {/* Notes header + toggles */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-slate-300">Generated Notes</h3>

          {notes && (
            <div className="flex items-center gap-2">
              {/* Expand/compact toggle */}
              <button
                type="button"
                onClick={toggleExpand}
                className="text-xs px-3 py-1 rounded-full border border-slate-700 
                           text-slate-300 hover:bg-slate-800 transition"
              >
                {isExpanded ? "Compact view" : "Expanded view"}
              </button>

              {/* Fullscreen button */}
              <button
                type="button"
                onClick={openFullscreen}
                className="text-xs px-3 py-1 rounded-full border border-blue-600 
                           text-blue-300 hover:bg-blue-600/20 transition"
              >
                Full Screen
              </button>
            </div>
          )}
        </div>

        {/* Notes Output */}
        <div
          className={[
            "rounded-xl border border-slate-800 bg-slate-950/70 p-4 md:p-6",
            !isExpanded ? "max-h-[70vh] overflow-y-auto" : "",
          ].join(" ")}
        >
          <div className={markdownClasses}>
            {notes ? (
              <ReactMarkdown>{notes}</ReactMarkdown>
            ) : (
              <p className="text-slate-400 text-sm">
                No notes have been generated yet. Add formatting preferences
                above and click{" "}
                <span className="font-medium text-slate-200">Generate Notes</span>.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ========== FULLSCREEN OVERLAY ========== */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col">
          {/* Close button */}
          <div className="flex justify-end p-4">
            <button
              onClick={closeFullscreen}
              className="text-slate-300 hover:text-white text-xl font-bold"
            >
              ✕
            </button>
          </div>

          {/* Fullscreen notes container */}
          <div className="flex-1 overflow-y-auto px-6 pb-10">
            <div className="max-w-4xl mx-auto bg-slate-900/70 rounded-xl border border-slate-700 p-6 shadow-xl">
              <div className={markdownClasses}>
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
