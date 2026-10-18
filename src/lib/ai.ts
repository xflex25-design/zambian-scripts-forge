/** AI text generation via Server-Side Gemini API with OpenRouter and client fallbacks. */

export async function writeText(system: string, prompt: string): Promise<string> {
  // 1. Primary: Call server-side Gemini API (/api/generate)
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, prompt }),
    });

    if (response.ok) {
      const data = (await response.json()) as { text?: string; error?: string };
      if (data.text) {
        return data.text.trim();
      }
    }
  } catch {
    // Server endpoint not reachable or network error, proceed to fallback
  }

  // 2. Secondary: If OpenRouter API key is configured in env, attempt OpenRouter
  const openRouterKey = import.meta.env["VITE_OPENROUTER_API_KEY"];
  if (openRouterKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://zalemba.app",
          "X-Title": "Zalemba",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: system },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.4,
          max_tokens: 8192,
        }),
      });

      if (response.ok) {
        const result = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const text = result.choices?.[0]?.message?.content?.trim();
        if (text) return text;
      }
    } catch {
      // Proceed to rule-based fallback
    }
  }

  // 3. Fallback: Generate structured Zambian document from parsed prompt facts
  return generateClientFallback(prompt);
}

function generateClientFallback(prompt: string): string {
  // Check if this is a recommendation request
  if (prompt.includes("Need:") && prompt.includes("Types:")) {
    return JSON.stringify({
      type: "general-job-application",
      label: "Job Application Letter",
    });
  }

  // Extract common facts from prompt
  const senderLines: string[] = [];
  const recipientLines: string[] = [];
  let subject = "RE: APPLICATION";
  let senderName = "Applicant";
  let phone = "";
  const paragraphs: string[] = [];

  const lines = prompt.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("Suggested subject:")) {
      subject = trimmed.replace("Suggested subject:", "").trim();
    } else if (trimmed.startsWith("Recipient address:")) {
      const addr = trimmed.replace("Recipient address:", "").trim();
      if (addr) recipientLines.push(addr);
    } else if (trimmed.includes("Your full name") || trimmed.includes("Full Name") || trimmed.includes("name")) {
      const val = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (val) {
        senderName = val.trim();
        senderLines.push(val.trim());
      }
    } else if (trimmed.includes("NRC") || trimmed.includes("NRC Number")) {
      const nrc = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (nrc) paragraphs.push(`I am a Zambian national and the holder of National Registration Card No. ${nrc.trim()}.`);
    } else if (trimmed.includes("Phone") || trimmed.includes("Contact")) {
      phone = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("Address") || trimmed.includes("Town") || trimmed.includes("City")) {
      const addr = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (addr) senderLines.push(addr.trim());
    } else if (trimmed.includes("Position") || trimmed.includes("Job Title")) {
      const pos = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (pos) paragraphs.push(`With reference to the above captioned subject, I wish to submit my formal application for the position of ${pos.trim()}.`);
    } else if (trimmed.includes("Reason") || trimmed.includes("Need") || trimmed.includes("Explanation")) {
      const reason = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (reason) paragraphs.push(reason.trim());
    }
  }

  if (senderLines.length === 0) {
    senderLines.push(senderName, "Plot No. 124, Off Great East Road", "LUSAKA.");
  }
  if (recipientLines.length === 0) {
    recipientLines.push("The Human Resources Manager,", "Private Bag 1,", "LUSAKA.");
  }

  if (paragraphs.length === 0) {
    paragraphs.push(
      "With reference to the above captioned matter, I am writing to formally submit my application for your consideration.",
      "I possess the relevant qualifications and dedication to perform the responsibilities required of this role effectively.",
      "Thank you in advance for your consideration. I look forward to your favourable response."
    );
  } else {
    paragraphs.push("Thank you in advance for your kind consideration. I look forward to your favourable response.");
  }

  const result = {
    from: senderLines,
    date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
    to: recipientLines,
    salutation: "Dear Sir/Madam,",
    subject: subject.toUpperCase().startsWith("RE:") ? subject.toUpperCase() : `RE: ${subject.toUpperCase()}`,
    paragraphs,
    closing: "Yours faithfully,",
    name: senderName,
    footer: phone ? [`Cell: ${phone}`] : [],
  };

  return JSON.stringify(result);
}

export function parseJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("Could not parse JSON response from writer.");
  }
  return JSON.parse(text.slice(start, end + 1)) as T;
}

export const ZAMBIAN_STYLE = `You write documents exactly the way real, well-written Zambian formal letters are laid out and phrased.
Use British/Zambian English spelling (organisation, favourable, programme, honour, licence).

LAYOUT (from authentic Zambian examples):
- Sender's address block first: full name (or "C/o <name>" if given), Plot/House number, area/township, P.O. Box if given, town, then date.
- Date in Zambian style with ordinal: "6th December 2025" / "24th August, 2024".
- Recipient block: title line first, e.g. "The Human Resources Manager," / "The Branch Manager," / "The Chief Executive Officer," / "The Head Teacher,", then organisation, P.O. Box (only if given), town in CAPITALS with a full stop, e.g. "LUSAKA."
- "Dear Sir/Madam," unless a named person is given (then "Dear Mr/Mrs <Surname>,").
- Subject line starting with "RE: " in CAPITAL LETTERS, e.g. "RE: APPLICATION FOR EMPLOYMENT AS A SALES ASSISTANT" or "RE: APPLICATION FOR A 100% STUDENT LOAN".
- Closing: "Yours faithfully," when addressed to Sir/Madam; "Yours sincerely," when addressed to a named person. Then the full name, then "Cell: <phone>" if a phone was given.

TYPICAL PHRASING (adapt naturally, never copy word-for-word every time):
- Openings: "With reference to the above captioned subject, I wish to apply for the position of ... as advertised on/in ... dated ..." / "Reference is made to the above captioned matter as advertised on your official Facebook page..." / "I am writing to kindly request..."
- Personal details paragraph common in Zambia: "I am a male/female Zambian aged twenty-three (23), single, and the holder of National Registration Card No. 247874/77/1." Only include facts the user gave (gender, age, NRC, marital status).
- Education: "I hold a full Grade 12 certificate obtained from ... Secondary School" / "a certificate in ...".
- Attachments: "Attached/Enclosed are copies of my relevant documents for your perusal."
- Closing lines: "I look forward to your favourable response." / "Thanking you in advance for your kind consideration." / "Your assistance in this matter will be highly appreciated."
- Tone: respectful, humble, confident, clear. Short paragraphs. No flowery American marketing language, no clichés like "I am thrilled", no em dashes.

STRICT RULES: Never invent names, qualifications, experience, employers, dates, NRC numbers, TPIN numbers, addresses, certificates or achievements. If something is missing, leave it out. Do not write placeholders like [Your Name] unless absolutely required.`;
