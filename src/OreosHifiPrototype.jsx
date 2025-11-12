import React, { useState } from "react";

const HISTORY_ITEMS = [
  { id: "new", title: "➕ New session", subtitle: "Start a fresh upload" },
  { id: "lecture-1", title: "Lecture 1 – Algorithms", subtitle: "Sept 20 • 52 min" },
  { id: "lecture-2", title: "Lecture 2 – HCI", subtitle: "Sept 22 • 47 min" },
  { id: "meeting-1", title: "Project check-in", subtitle: "Sept 24 • 30 min" },
];

export default function OreosHifiPrototype() {
  const [selectedHistory, setSelectedHistory] = useState("new");
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFiles = (files) => {
    const picked = files && files[0];
    if (!picked) return;

    const isAudioType =
      picked.type.startsWith("audio/") ||
      [".mp3", ".wav", ".m4a", ".aac", ".ogg"].some((ext) =>
        picked.name.toLowerCase().endsWith(ext)
      );

    if (!isAudioType) {
      setFile(null);
      setError("Please upload an audio file (.mp3, .wav, .m4a, etc.).");
      return;
    }

    setFile(picked);
    setError("");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleFileInputChange = (e) => {
    handleFiles(e.target.files);
  };

  const handleProcess = () => {
    if (!file) return;
    // hook this into your backend later
    console.log("Processing file:", file.name, "for history item:", selectedHistory);
  };

  const canProcess = !!file;

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      {/* LEFT: History list */}
      <aside className="w-72 border-r border-slate-800 bg-slate-900/90 flex flex-col">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Oreos HiFi
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            Recent uploads
          </p>
        </div>

        <div className="mt-2 flex-1 overflow-y-auto px-2 pb-4 space-y-1">
          {HISTORY_ITEMS.map((item) => {
            const isActive = item.id === selectedHistory;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedHistory(item.id)}
                className={[
                  "w-full text-left px-3 py-2 rounded-lg transition",
                  "flex flex-col gap-0.5",
                  isActive
                    ? "bg-slate-800/90 text-slate-50 border border-slate-700"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-slate-50",
                ].join(" ")}
              >
                <span className="text-sm font-medium truncate">
                  {item.title}
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  {item.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500">
          Click a past upload to revisit it, or choose
          <span className="font-semibold text-slate-300"> “New session” </span>
          and drop an audio file in the main panel.
        </div>
      </aside>

      {/* CENTER: drag/drop + Process button */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl flex flex-col flex-1">
          {/* Drag/drop zone */}
          <div className="flex-1 flex items-center justify-center">
            <label
              className={[
                "w-full max-w-xl border-2 border-dashed rounded-2xl px-6 py-12",
                "flex flex-col items-center justify-center text-center cursor-pointer transition",
                "bg-slate-900/60 shadow-lg shadow-slate-900/40",
                isDragging
                  ? "border-blue-400 bg-slate-900/90"
                  : "border-slate-700 hover:border-blue-400 hover:bg-slate-900/80",
              ].join(" ")}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={handleFileInputChange}
              />

              <div className="text-sm font-semibold mb-1">
                Drag &amp; drop an audio file here
              </div>
              <div className="text-xs text-slate-400 mb-4">
                or click to browse from your computer
              </div>

              <div className="inline-flex items-center gap-2 text-[11px] text-slate-400">
                <span className="h-px w-6 bg-slate-700" />
                Supported: .mp3, .wav, .m4a, .aac, .ogg
                <span className="h-px w-6 bg-slate-700" />
              </div>
            </label>
          </div>

          {/* File status / error */}
          <div className="mt-4 min-h-[2rem]">
            {file && (
              <p className="text-sm text-slate-200">
                Selected file:{" "}
                <span className="font-semibold text-blue-300">
                  {file.name}
                </span>
              </p>
            )}
            {error && (
              <p className="text-sm text-red-400">
                {error}
              </p>
            )}
          </div>

          {/* Process button */}
          <div className="mt-6 mb-4 flex justify-center">
            <button
              type="button"
              onClick={handleProcess}
              disabled={!canProcess}
              className={[
                "px-8 py-2.5 rounded-full text-sm font-semibold",
                "transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950",
                canProcess
                  ? "bg-blue-500 text-white hover:bg-blue-400 focus:ring-blue-400"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed",
              ].join(" ")}
            >
              Process
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
