// server.mjs
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import dotenv from "dotenv";
import OpenAI from "openai";


function buildNotesPrompt(transcript, userRequests = "") {
  const trimmedRequests = (userRequests || "").trim();

  const requestsText = trimmedRequests
    ? trimmedRequests
    : "No additional user requests were provided. Use your best judgment to create helpful, collegiate-level notes.";

  return `
You are an AI assistant generating high-quality lecture notes for a college student.

Your responsibilities:
- Analyze the attached lecture transcript in full.
- Do NOT transcribe or quote the lecture verbatim.
- Instead, create *student notes* that explain the concepts, ideas, and reasoning.
- You may add brief related context, definitions, or examples to help understanding,
  as long as they are accurate and relevant to the lecture topic.

Formatting requirements:
- Return the notes in **Markdown**.
- Use clear section headers (##, ###).
- Use bullet points and sub-bullets where helpful.
- Maintain logical flow that matches how the content would be taught in class.
- Aim for a collegiate, study-friendly style: organized, readable, and not overly verbose.

User requests to incorporate (tone, structure, extra content, length, etc.):
${requestsText}

Lecture transcript to analyze:
${transcript}

Your task:
Create a stylistic note guide in Markdown with section headers, bullet points,
and a natural flow that covers the material taught in this lecture. Focus on
helping the student review and learn from this class session.
`;
}

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
// --- POST /api/transcribe ---
// Accepts: multipart/form-data with field "file"
// Returns: { sessionId, transcript }
import path from "path";
// make sure this import is at the top of server.mjs with the others

// --- POST /api/transcribe ---
// Accepts: multipart/form-data with field "file"
// Returns: { sessionId, transcript }
app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No audio file uploaded." });
  }

  console.log("Incoming file:", {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  });

  // Double-check it's not empty
  if (!req.file.size || req.file.size === 0) {
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({ error: "Uploaded file is empty." });
  }

  // Only allow formats Whisper supports (by mimetype)
  const allowedMimeTypes = [
    "audio/mpeg",     // mp3
    "audio/mp3",      // sometimes used
    "audio/mp4",      // m4a/mp4
    "audio/x-m4a",    // m4a (Apple, your case)
    "audio/wav",
    "audio/x-wav",
    "audio/ogg",
    "audio/webm",
    "audio/flac",
  ];

  if (!allowedMimeTypes.includes(req.file.mimetype)) {
    console.warn("Blocked unsupported mimetype:", req.file.mimetype);
    fs.unlink(req.file.path, () => {});
    return res.status(400).json({
      error: `Unsupported audio type: ${req.file.mimetype}. Try exporting as .mp3, .m4a, or .wav.`,
    });
  }

  // Get the original extension (e.g. ".m4a")
  const ext = path.extname(req.file.originalname) || "";
  const newPath = req.file.path + ext;

  // Rename temp file so it has an extension that OpenAI can use
  fs.renameSync(req.file.path, newPath);

  try {
    const audioStream = fs.createReadStream(newPath);

    const transcription = await client.audio.transcriptions.create({
      file: audioStream,          // <- just the stream, SDK expects this
      model: "whisper-1",
    });

    const sessionId = `session-${Date.now()}`;

    res.json({
      sessionId,
      transcript: transcription.text,
    });
  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({
      error: "Transcription failed. Check server logs for details.",
    });
  } finally {
    fs.unlink(newPath, () => {});
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
    const { transcript, sessionId, userRequests } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const prompt = buildNotesPrompt(transcript, userRequests);

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert note-taking assistant that generates high-quality collegiate lecture notes in Markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const notes = completion.choices[0]?.message?.content || "";
    res.json({ notes });
  } catch (err) {
    console.error("Notes error:", err);
    res.status(500).json({ error: "Failed to generate notes." });
  }
});

