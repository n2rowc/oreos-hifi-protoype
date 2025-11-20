// server.mjs
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

// ---------- OpenAI client ----------
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------- Helper: build messages for notes ----------
function buildNotesMessages(transcript, userRequests = "") {
  const trimmedRequests = (userRequests || "").trim();

  const studentInstructions = trimmedRequests || "(none – use your best judgment)";

  const systemContent = `
You are an AI assistant generating high-quality lecture notes for a college student.

GENERAL BEHAVIOR
- Analyze the lecture transcript in full.
- Do NOT transcribe or quote the lecture verbatim.
- Instead, create *student notes* that explain the concepts, ideas, and reasoning.
- You may add brief, accurate related context, definitions, or examples only when they help understanding.
- Aim for a collegiate, study-friendly style: organized, readable, and not overly verbose.

OUTPUT FORMAT
- Default: Return notes in **Markdown**.
- Use clear section headers (##, ###).
- Use bullet points and short paragraphs for readability.
- Maintain logical flow that roughly matches how the material would be taught in class.

PRIORITY RULE (VERY IMPORTANT)
- The student's explicit instructions about length, word count, tone, or formatting ALWAYS take precedence.
- If the student asks for a specific **word count** (e.g., "Give me a 10-word summary"),
  you MUST:
  - Respond with exactly that many words,
  - And nothing else (no headings, no bullets, no intro text).
- If the student asks for a "short summary", "one paragraph", "exam-style bullets", etc.,
  you MUST follow that shape instead of generating full, long-form notes.
- Never ignore, dilute, or override the student's explicit instructions, even if they conflict with the default behavior.
`.trim();

  const userContent = `
Student instructions:
"""
${studentInstructions}
"""

Lecture transcript:
"""
${transcript}
"""

Now produce your final answer, strictly following the priority rules above.
`.trim();

  return [
    { role: "system", content: systemContent },
    { role: "user", content: userContent },
  ];
}

// ---------- Express setup ----------
const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Multer for handling incoming audio files
const upload = multer({ dest: "uploads/" });

// ---------- POST /api/transcribe ----------
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
    "audio/mpeg", // mp3
    "audio/mp3",
    "audio/mp4", // m4a/mp4
    "audio/x-m4a",
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

  // Get the original extension (e.g., ".m4a")
  const ext = path.extname(req.file.originalname) || "";
  const newPath = req.file.path + ext;

  // Rename temp file so it has an extension that OpenAI can use
  fs.renameSync(req.file.path, newPath);

  try {
    const audioStream = fs.createReadStream(newPath);

    const transcription = await client.audio.transcriptions.create({
      file: audioStream,
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

// ---------- POST /api/chat ----------
// Accepts: { transcript, messages }
// Returns: { reply }
app.post("/api/chat", async (req, res) => {
  try {
    const { transcript, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
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
        ...messages,
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

// ---------- POST /api/notes ----------
// Accepts: { transcript, sessionId, userRequests }
// Returns: { notes }
app.post("/api/notes", async (req, res) => {
  try {
    const { transcript, sessionId, userRequests } = req.body;

    if (!transcript || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const messages = buildNotesMessages(transcript, userRequests);
    console.log("Notes messages:", JSON.stringify(messages, null, 2));

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    const notes = completion.choices[0]?.message?.content || "";
    console.log("Notes output:\n", notes);
    res.json({ notes });
  } catch (err) {
    console.error("Notes error:", err);
    res.status(500).json({ error: "Failed to generate notes." });
  }
});

// ---------- Start server ----------
app.listen(port, () => {
  console.log(`Local mini API running at http://localhost:${port}`);
});
