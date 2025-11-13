// src/SessionPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TranscriptView from "./components/TranscriptView.jsx";
import NotesView from "./components/NotesView.jsx";
import ChatbotView from "./components/ChatbotView.jsx";
import { getSession, saveSession } from "./sessionStorage";

export default function SessionPage() {
  const { sessionId } = useParams();

  const stored = sessionId ? getSession(sessionId) || {} : {};

  const [activeTab, setActiveTab] = useState("transcript"); // "transcript" | "notes" | "chat"

  const [transcript, setTranscript] = useState(stored.transcript || "");
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(
    !stored.transcript
  );

  const [notes, setNotes] = useState(stored.notes || "");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const [messages, setMessages] = useState(stored.messages || []);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [error, setError] = useState("");

  const originalFileName = stored.originalFileName || "";

  // If we don't have a stored transcript (e.g. user opened a random URL),
  // show a placeholder. Normally all real sessions will come from HomePage upload.
  useEffect(() => {
    const maybeLoadFallback = async () => {
      if (stored.transcript) {
        setIsLoadingTranscript(false);
        return;
      }
      try {
        setIsLoadingTranscript(true);
        setError("");

        setTranscript(
          `Transcript for session "${sessionId}".\n\nNo transcript was found in local history. This is placeholder text.`
        );
        setIsLoadingTranscript(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load transcript.");
        setIsLoadingTranscript(false);
      }
    };

    if (sessionId) {
      maybeLoadFallback();
    }
  }, [sessionId, stored.transcript]);

  // Always keep the latest transcript / metadata saved
  useEffect(() => {
    if (sessionId && transcript) {
      saveSession({
        id: sessionId,
        transcript,
        originalFileName,
      });
    }
  }, [sessionId, transcript, originalFileName]);

  // Generate notes from transcript via mini API
  const handleGenerateNotes = async () => {
    if (!transcript.trim() || isGeneratingNotes) return;

    try {
      setIsGeneratingNotes(true);
      setError("");

      const res = await fetch("http://localhost:8000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          sessionId,
        }),
      });

      if (!res.ok) {
        throw new Error("Notes request failed");
      }

      const data = await res.json();
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
      console.error(err);
      setError(
        "Failed to generate notes. Make sure the local API server is running."
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
      {/* Top navbar with tabs */}
      <div className="border-b border-slate-800 px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            Session: <span className="text-blue-300">{sessionId}</span>
          </h2>
          {originalFileName && (
            <span className="text-xs text-slate-400">
              ({originalFileName})
            </span>
          )}
        </div>

        <div className="flex gap-2 text-sm">
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
