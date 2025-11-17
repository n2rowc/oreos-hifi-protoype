// src/SessionPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TranscriptView from "./components/TranscriptView.jsx";
import NotesView from "./components/NotesView.jsx";
import ChatbotView from "./components/ChatbotView.jsx";
import { getSession, saveSession } from "./sessionStorage";

export default function SessionPage() {
  const { sessionId } = useParams();

  const [activeTab, setActiveTab] = useState("transcript"); // "transcript" | "notes" | "chat"

  const [transcript, setTranscript] = useState("");
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(true);

  const [notes, setNotes] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const [messages, setMessages] = useState([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [originalFileName, setOriginalFileName] = useState("");
  const [title, setTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [error, setError] = useState("");

  // Load session data whenever the sessionId changes
  useEffect(() => {
    if (!sessionId) return;

    setIsLoadingTranscript(true);
    setError("");

    const stored = getSession(sessionId);

    if (stored) {
      setTranscript(stored.transcript || "");
      setNotes(stored.notes || "");
      setMessages(stored.messages || []);
      setOriginalFileName(stored.originalFileName || "");
      setTitle(
        stored.title ||
          stored.originalFileName ||
          sessionId
      );
    } else {
      // Fallback if user opens a random URL
      setTranscript(
        `Transcript for session "${sessionId}".\n\nNo transcript was found in local history. This is placeholder text.`
      );
      setNotes("");
      setMessages([]);
      setOriginalFileName("");
      setTitle(sessionId);
    }

    setIsLoadingTranscript(false);
    setActiveTab("transcript");
  }, [sessionId]);

  // Save edited title to localStorage
  const handleTitleSave = () => {
    if (!sessionId) return;

    const trimmed = title.trim() || originalFileName || sessionId;
    setTitle(trimmed);
    setIsEditingTitle(false);

    saveSession({
      id: sessionId,
      title: trimmed,
    });
  };

  // Generate / regenerate notes from transcript via mini API
  // Generate / regenerate notes from transcript via mini API
  const handleGenerateNotes = async (userRequests = "") => {
    if (!transcript.trim() || isGeneratingNotes) return;

    try {
      setIsGeneratingNotes(true);
      setError("");

      // 🔒 Coerce everything to safe types
      const safeTranscript = typeof transcript === "string" ? transcript : String(transcript ?? "");
      const safeSessionId = typeof sessionId === "string" ? sessionId : String(sessionId ?? "");
      const safeUserRequests =
        typeof userRequests === "string" ? userRequests : "";

      const payload = {
        transcript: safeTranscript,
        sessionId: safeSessionId,
        userRequests: safeUserRequests,
      };

      console.log("Calling /api/notes with payload:", {
        ...payload,
        transcriptLength: safeTranscript.length,
      });

      const res = await fetch("http://localhost:8000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Notes HTTP error:", res.status, text);
        throw new Error(`Notes request failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("Notes response JSON:", data);
      const newNotes = data.notes || "";
      setNotes(newNotes);

      // Persist notes for this session
      if (sessionId) {
        saveSession({
          id: sessionId,
          notes: newNotes,
        });
      }
    } catch (err) {
      console.error("handleGenerateNotes error:", err);
      setError(
        "Failed to generate notes. Check the browser console and server logs for details."
      );
    } finally {
      setIsGeneratingNotes(false);
    }
  };


  // Chat handler using /api/chat
  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isSendingMessage) return;

    const newUserMessage = { role: "user", content: userText };
    const updatedMessages = [...messages, newUserMessage];

    setMessages(updatedMessages);
    setIsSendingMessage(true);
    setError("");

    try {
      const res = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          sessionId,
          messages: updatedMessages,
        }),
      });

      if (!res.ok) {
        throw new Error("Chat request failed");
      }

      const data = await res.json();
      const assistantMessage = {
        role: "assistant",
        content: data.reply || "",
      };

      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Persist chat history for this session
      if (sessionId) {
        saveSession({
          id: sessionId,
          messages: finalMessages,
        });
      }
    } catch (err) {
      console.error(err);
      setError(
        "Failed to send message. Make sure the local API server is running."
      );
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Top header: title, file name, then tabs */}
      <div className="border-b border-slate-800 px-6 pt-4 pb-3 flex flex-col gap-2">
        {/* Title row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {isEditingTitle ? (
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleTitleSave();
                  if (e.key === "Escape") {
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="bg-slate-900/80 border border-slate-700 rounded px-2 py-1 text-sm text-slate-50 w-full focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            ) : (
              <h2 className="text-lg font-semibold text-slate-50 truncate">
                {title}
              </h2>
            )}

            {!isEditingTitle && (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="text-[11px] px-2 py-0.5 rounded-full border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-500 transition-shadows"
              >
                Edit title
              </button>
            )}
          </div>
        </div>

        {/* Subtitle row: original file name */}
        <div className="flex items-center justify-between gap-4">
          <div className="text-xs text-slate-400 truncate">
            {originalFileName
              ? `Original file: ${originalFileName}`
              : `Session ID: ${sessionId}`}
          </div>
        </div>

        {/* Tabs row */}
        <div className="flex gap-2 text-sm mt-1">
          {["transcript", "notes", "chat"].map((tab) => {
            const label =
              tab === "transcript"
                ? "Transcript"
                : tab === "notes"
                ? "Generated Notes"
                : "Chatbot";

            const isActive = activeTab === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  "px-3 py-1.5 rounded-full border text-xs font-medium transition",
                  isActive
                    ? "bg-blue-500 border-blue-400 text-white"
                    : "border-slate-700 text-slate-300 hover:bg-slate-800",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="px-6 py-2 text-sm text-red-400 bg-red-950/40 border-b border-red-900">
          {error}
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {activeTab === "transcript" && (
          <TranscriptView
            transcript={transcript}
            isLoading={isLoadingTranscript}
          />
        )}

        {activeTab === "notes" && (
          <NotesView
            notes={notes}
            onGenerateNotes={handleGenerateNotes}
            isGenerating={isGeneratingNotes}
          />
        )}

        {activeTab === "chat" && (
          <ChatbotView
            messages={messages}
            onSendMessage={handleSendMessage}
            isSending={isSendingMessage}
          />
        )}
      </div>
    </div>
  );
}
