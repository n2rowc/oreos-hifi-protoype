// server.mjs
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = 8000;

// --- OpenAI client (reads OPENAI_API_KEY from .env) ---
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Middleware ---
app.use(cors());
app.use(express.json());

// Multer for handling incoming audio files
const upload = multer({ dest: "uploads/" });

// --- POST /api/transcribe ---
// Accepts: multipart/form-data with field "file"
// Returns: { sessionId, transcript }
app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded." });
  }

  try {
    const audioStream = fs.createReadStream(req.file.path);

    const transcription = await client.audio.transcriptions.create({
      file: audioStream,
      model: "whisper-1", // Speech-to-text model :contentReference[oaicite:1]{index=1}
    });

    // Simple session id (you can later tie this to a real DB if you want)
    const sessionId = `session-${Date.now()}`;

    res.json({
      sessionId,
      transcript: transcription.text,
    });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Transcription failed." });
  } finally {
    // Clean up temp file
    fs.unlink(req.file.path, () => {});
  }
});

// --- POST /api/chat ---
// Accepts: { transcript, messages }
// Returns: { reply }
app.post("/api/chat", async (req, res) => {
  try {
    const { transcript, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini", // small, cheap chat model :contentReference[oaicite:2]{index=2}
      messages: [
        {
          role: "system",
          content:
            "You are a helpful tutor that answers questions about a lecture transcript.",
        },
        {
          role: "system",
          content: `LECTURE TRANSCRIPT:\n${transcript || "(no transcript provided)"}`,
        },
        ...messages, // includes user + previous assistant messages
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    const reply = completion.choices[0]?.message?.content || "";
    res.json({ reply });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed." });
  }
});

app.listen(port, () => {
  console.log(`Local mini API running at http://localhost:${port}`);
});

app.post("/api/notes", async (req, res) => {
  try {
    const { transcript, sessionId } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful note-taking assistant. Given a lecture transcript, produce clean, concise bullet-point notes.",
        },
        {
          role: "user",
          content: `Create detailed bullet-point notes for this lecture:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const notes = completion.choices[0]?.message?.content || "";
    res.json({ notes });
  } catch (err) {
    console.error("Notes error:", err);
    res.status(500).json({ error: "Failed to generate notes." });
  }
});
