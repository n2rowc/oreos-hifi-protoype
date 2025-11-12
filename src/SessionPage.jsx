import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import TranscriptView from "./components/TranscriptView.jsx";
import NotesView from "./components/NotesView.jsx";
import ChatbotView from "./components/ChatbotView.jsx";

export default function SessionPage() {
  const { sessionId } = useParams();

  const [activeTab, setActiveTab] = useState("transcript"); // "transcript" | "notes" | "chat"
  const [transcript, setTranscript] = useState("");
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(true);

  const [notes, setNotes] = useState("");
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  const [messages, setMessages] = useState([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const [error, setError] = useState("");

  // Fetch transcript when sessionId changes
  useEffect(() => {
    const fetchTranscript = async () => {
      try {
        setIsLoadingTranscript(true);
        setError("");

        // TODO: call your real backend:
        // const res = await fetch(`/api/session/${sessionId}/transcript`);
        // const data = await res.json();
        // setTranscript(data.transcript);

        // Temporary fake data:
        setTimeout(() => {
          setTranscript(
            `Transcript for session "${sessionId}".\n\nThis is where your real transcript text will appear.`
          );
          setIsLoadingTranscript(false);
        }, 400);
      } catch (err) {
        console.error(err);
        setError("Failed to load transcript.");
        setIsLoadingTranscript(false);
      }
    };

    if (sessionId) {
      fetchTranscript();
    }
  }, [sessionId]);

  // Generate notes handler
  const handleGenerateNotes = async () => {
    try {
      setIsGeneratingNotes(true);
      setError("");

      // TODO: call your real backend:
      // const res = await fetch(`/api/session/${sessionId}/notes`, { method: "POST" });
      // const data = await res.json();
      // setNotes(data.notes);

      // Fake notes for now:
      setTimeout(() => {
        setNotes(
          `• Key idea 1 about session "${sessionId}".\n• Key idea 2.\n• Summary bullet 3.`
        );
        setIsGeneratingNotes(false);
      }, 400);
    } catch (err) {
      console.error(err);
      setError("Failed to generate notes.");
      setIsGeneratingNotes(false);
    }
  };

  // Chat handler
  const handleSendMessage = async (userText) => {
    if (!userText.trim()) return;

    const newUserMessage = { role: "user", content: userText };
    setMessages((prev) => [...prev, newUserMessage]);
    setIsSendingMessage(true);
    setError("");

    try {
      // TODO: call your real backend:
      // const res = await fetch(`/api/session/${sessionId}/chat`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ messages: [...messages, newUserMessage] }),
      // });
      // const data = await res.json();
      // const assistantMessage = { role: "assistant", content: data.reply };

      // Fake reply:
      const assistantMessage = {
        role: "assistant",
        content: `This is a placeholder answer about session "${sessionId}".`,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setError("Failed to send message.");
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
