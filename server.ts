import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize the Google Gen AI client with telemetry User-Agent header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// API endpoint for AI document generation and text writing
app.post("/api/generate", async (req, res) => {
  try {
    const { system, prompt, temperature = 0.4 } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: system || "You are a professional assistant for document generation in Zambia.",
        temperature,
        responseMimeType: "application/json",
      },
    });

    const text = response.text?.trim() || "";
    if (!text) {
      return res.status(500).json({ error: "The AI model returned an empty response. Please try again." });
    }

    return res.json({ text });
  } catch (error: any) {
    console.error("AI Generation Error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate document content.",
    });
  }
});

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "zalemba" });
});

// Explicitly handle favicon.ico to ensure no icon is served
app.get("/favicon.ico", (_req, res) => {
  res.status(204).end();
});

// Dynamic robots.txt
app.get("/robots.txt", (req, res) => {
  const host = req.get("host") || "zalemba.lovable.app";
  const proto = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const content = `User-agent: *\nAllow: /\nDisallow: /account\nDisallow: /reset-password\nDisallow: /login\nDisallow: /signup\nDisallow: /forgot-password\n\nSitemap: ${proto}://${host}/sitemap.xml\n`;
  res.type("text/plain").send(content);
});

// Dynamic sitemap.xml with canonical search-indexable paths
app.get("/sitemap.xml", (req, res) => {
  const host = req.get("host") || "zalemba.lovable.app";
  const proto = req.protocol === "https" || req.get("x-forwarded-proto") === "https" ? "https" : "http";
  const base = `${proto}://${host}`;
  const routes = [
    { loc: "", priority: "1.0", changefreq: "weekly" },
    { loc: "landing/cv", priority: "0.9", changefreq: "weekly" },
    { loc: "landing/job-application", priority: "0.9", changefreq: "weekly" },
    { loc: "landing/helsb", priority: "0.9", changefreq: "weekly" },
    { loc: "landing/internship-application", priority: "0.9", changefreq: "weekly" },
    { loc: "landing/resignation-letter", priority: "0.8", changefreq: "monthly" },
    { loc: "image-to-text", priority: "0.8", changefreq: "monthly" },
    { loc: "create/cv", priority: "0.8", changefreq: "monthly" },
    { loc: "create/job-application", priority: "0.8", changefreq: "monthly" },
    { loc: "create/helsb", priority: "0.8", changefreq: "monthly" },
    { loc: "create/school-letter", priority: "0.7", changefreq: "monthly" },
    { loc: "create/business", priority: "0.7", changefreq: "monthly" },
    { loc: "create/other-letter", priority: "0.7", changefreq: "monthly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map(
    (r) => `  <url>
    <loc>${base}${r.loc ? `/${r.loc}` : "/"}</loc>
    <changefreq>${r.changefreq}</changefreq>
    <priority>${r.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  res.type("application/xml").send(xml);
});

async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`[Zalemba] Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
