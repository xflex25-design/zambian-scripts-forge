import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { system, prompt, temperature = 0.4 } = req.body || {};
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
      return res.status(500).json({ error: "Empty AI response" });
    }

    return res.status(200).json({ text });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || "Failed to generate document" });
  }
}
