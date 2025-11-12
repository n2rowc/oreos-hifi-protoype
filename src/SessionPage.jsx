import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import TranscriptView from "./components/TranscriptView.jsx";
import NotesView from "./components/NotesView.jsx";
import ChatbotView from "./components/ChatbotView.jsx";

export default function SessionPage() {
  const { sessionId } = useParams();
  const location = useLocation();

  // If we navigated here from HomePage after transcription:
  const initialTranscript = location.state?.transcript || "";
  const originalFileName = location.state?.originalFileName || "";

  const [activeTab, setActiveTab] = useState("transcript"); // "transcript" | "notes" | "chat"

  const [transcript, setTranscript] = useState(initialTranscript);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(
    !initialTranscript
  );

  const [notes, setNotes] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const [messages, setMessages] = useState([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [error, setError] = useState("");

  // If no transcript was passed in, fall back to placeholder
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setIsLoadingTranscript(true);
        setError("");

        // Placeholder / fallback if someone hits this URL directly.
        // Later you can replace this with a real fetch from your DB by sessionId.
        setTranscript(
          `Transcript for session "${sessionId}".\n\nNo transcript was provided in navigation state. This is placeholder text.`
        );
        setIsLoadingTranscript(false);
      } catch (err) {
        console.error(err);
        setError("Failed to load transcript.");
        setIsLoadingTranscript(false);
      }
    };

    if (!initialTranscript && sessionId) {
      fetchTranscript();
    }
  }, [sessionId, initialTranscript]);

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
      setNotes(data.notes || "");
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

      setMessages((prev) => [...prev, assistantMessage]);
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
