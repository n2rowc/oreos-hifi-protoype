import React from "react";

export default function NotesView({ notes, onGenerateNotes, isGenerating }) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">Generated Notes</h3>
        <button
          type="button"
          onClick={onGenerateNotes}
          disabled={isGenerating}
          className={[
            "px-3 py-1.5 rounded-full text-xs font-semibold",
            "transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
            isGenerating
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400",
          ].join(" ")}
        >
          {isGenerating ? "Generating…" : "Generate notes"}
        </button>
      </div>

      {!notes && !isGenerating && (
        <p className="text-sm text-slate-400">
          No notes yet. Click “Generate notes” to create a summary from this
          session’s transcript.
        </p>
      )}

      {notes && (
        <pre className="text-sm text-slate-100 whitespace-pre-wrap bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3">
          {notes}
        </pre>
      )}
    </div>
  );
}
