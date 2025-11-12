import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

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

  const handleProcess = async () => {
    if (!file || isProcessing) return;

    try {
      setIsProcessing(true);
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Transcription request failed");
      }

      const data = await res.json();

      // Navigate to SessionPage, passing transcript via route state
      navigate(`/session/${data.sessionId}`, {
        state: {
          transcript: data.transcript,
          originalFileName: file.name,
        },
      });
    } catch (err) {
      console.error(err);
      setError(
        "Failed to transcribe audio. Make sure the local API server is running."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const canProcess = !!file && !isProcessing;

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8">
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
          {error && <p className="text-sm text-red-400">{error}</p>}
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
            {isProcessing ? "Processing..." : "Process"}
          </button>
        </div>
      </div>
    </div>
  );
}
