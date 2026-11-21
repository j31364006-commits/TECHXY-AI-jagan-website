// Techxy AI backend.
// It keeps your API key secret and talks to the AI model for the website.
import "dotenv/config";
import express from "express";
import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("Missing ANTHROPIC_API_KEY. Create a .env file (see .env.example).");
  process.exit(1);
}

const app = express();
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from .env automatically

// This is Techxy AI's personality. Change it to change how the AI behaves.
const SYSTEM_PROMPT = `You are Techxy AI, a friendly and smart assistant.
Explain things in simple, clear language. Be helpful with learning, writing,
coding and ideas. If you are not sure about something, say so honestly.`;

const MODEL = "claude-sonnet-5-5";

app.use(express.json({ limit: "100kb" }));
app.use(express.static("public"));

app.post("/api/chat", async (req, res) => {
  try {
    const incoming = Array.isArray(req.body.messages) ? req.body.messages : [];

    // Keep only valid messages and the most recent 20.
    const messages = incoming
      .filter(
        (m) =>
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim() !== ""
      )
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));

    if (messages.length === 0 || messages[0].role !== "user") {
      return res.status(400).json({ error: "Send at least one message." });
    }

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const reply = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Techxy AI could not answer right now. Please try again." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Techxy AI is running at http://localhost:${PORT}`));