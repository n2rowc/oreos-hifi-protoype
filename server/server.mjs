// server.mjs
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import OpenAI from "openai";
import { exec } from "child_process";

dotenv.config();

// ---------- OpenAI client ----------
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ---------- Audio Compression Helper (ffmpeg) ----------
// Compress to ~64kbps mono AAC (reduces 70MB → 3–6MB)
function compressAudio(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const cmd = `ffmpeg -y -i "${inputPath}" -ac 1 -b:a 64k "${outputPath}"`;
    exec(cmd, (err) => {
      if (err) reject(err);
      else resolve(outputPath);
    });
  });
}

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

PRIORITY RULE (VERY IMPORTANT)
- The student's explicit instructions about length, word count, tone, or formatting ALWAYS take precedence.
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
// ---------- POST /api/transcribe ----------
app.post("/api/transcribe", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No audio file uploaded." });

  console.log("Incoming file:", {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  });

  // Rename temp file so FFmpeg sees extension
  const ext = path.extname(req.file.originalname) || "";
  const originalPath = req.file.path + ext;
  fs.renameSync(req.file.path, originalPath);

  const compressedPath = originalPath.replace(ext, "_compressed.m4a");
  const chunkDir = "uploads/chunks";
  fs.mkdirSync(chunkDir, { recursive: true });

  try {
    //
    // 1. COMPRESS (64kbps mono AAC)
    //
    console.log("Compressing audio...");
    await new Promise((resolve, reject) => {
      const cmd = `ffmpeg -y -i "${originalPath}" -ac 1 -b:a 64k "${compressedPath}"`;
      exec(cmd, err => (err ? reject(err) : resolve()));
    });
    console.log("Compression complete.");

    //
    // 2. CHUNK (RE-ENCODE EACH CHUNK)
    //
    console.log("Chunking audio...");

    const chunkPattern = `${chunkDir}/chunk_%03d.m4a`;

    const chunkCmd = `
      ffmpeg -y -i "${compressedPath}" \
      -f segment -segment_time 300 \
      -ac 1 -b:a 64k \
      "${chunkPattern}"
    `;

    await new Promise((resolve, reject) => {
      exec(chunkCmd, err => (err ? reject(err) : resolve()));
    });

    console.log("Chunking complete.");

    const chunks = fs.readdirSync(chunkDir)
      .filter(f => f.startsWith("chunk_"))
      .map(f => path.join(chunkDir, f))
      .sort();

    if (chunks.length === 0) {
      throw new Error("No chunks produced!");
    }

    console.log(`Found ${chunks.length} chunks.`);

    //
    // 3. TRANSCRIBE EACH CHUNK
    //
    let finalTranscript = "";

    for (let i = 0; i < chunks.length; i++) {
      const chunkPath = chunks[i];
      console.log(`Transcribing chunk ${i+1}/${chunks.length}`);

      const result = await client.audio.transcriptions.create({
        file: fs.createReadStream(chunkPath),
        model: "gpt-4o-transcribe"
      });

      finalTranscript += result.text + "\n\n";
    }

    res.json({
      sessionId: `session-${Date.now()}`,
      transcript: finalTranscript.trim()
    });

  } catch (err) {
    console.error("Transcription error:", err);
    res.status(500).json({ error: "Transcription failed." });

  } finally {
    // cleanup
    try { fs.unlinkSync(originalPath); } catch {}
    try { fs.unlinkSync(compressedPath); } catch {}
    try {
      for (const file of fs.readdirSync(chunkDir)) {
        fs.unlinkSync(path.join(chunkDir, file));
      }
    } catch {}
  }
});



// ---------- POST /api/chat ----------
app.post("/api/chat", async (req, res) => {
  try {
    const { transcript, messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required." });
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: "You are a helpful tutor for lecture questions." },
        { role: "system", content: `LECTURE TRANSCRIPT:\n${transcript || "(none)"}` },
        ...messages,
      ],
      temperature: 0.3,
      max_tokens: 512,
    });

    res.json({ reply: completion.choices[0]?.message?.content || "" });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat failed." });
  }
});

// ---------- POST /api/notes ----------
app.post("/api/notes", async (req, res) => {
  try {
    const { transcript, sessionId, userRequests } = req.body;

    if (!transcript?.trim()) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const messages = buildNotesMessages(transcript, userRequests);

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages,
      temperature: 0.3,
      max_tokens: 1000,
    });

    res.json({ notes: completion.choices[0]?.message?.content || "" });
  } catch (err) {
    console.error("Notes error:", err);
    res.status(500).json({ error: "Failed to generate notes." });
  }
});

// ---------- Start server ----------
app.listen(port, () => {
  console.log(`Local mini API running at http://localhost:${port}`);
});
