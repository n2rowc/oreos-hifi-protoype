import React from "react";

export default function TranscriptView({ transcript, isLoading }) {
  if (isLoading) {
    return (
      <div className="text-sm text-slate-400">
        Loading transcript…
      </div>
    );
  }

  if (!transcript) {
    return (
      <div className="text-sm text-slate-400">
        No transcript available for this session yet.
      </div>
    );
  }

  return (
    <div className="prose prose-invert max-w-none text-sm">
      {transcript.split("\n").map((line, idx) => (
        <p key={idx}>{line}</p>
      ))}
    </div>
  );
}
