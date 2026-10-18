/** AI text generation via OpenRouter (client-side, key from env). */

const DEFAULT_MODELS = [
  "google/gemini-2.5-flash",
  "openai/gpt-4o-mini",
  "meta-llama/llama-3.3-70b-instruct",
];

function getModels(): string[] {
  const custom = import.meta.env["VITE_OPENROUTER_MODELS"]?.split(",").map((m: string) => m.trim()).filter(Boolean);
  return custom && custom.length ? custom : DEFAULT_MODELS;
}

export async function writeText(system: string, prompt: string): Promise<string> {
  const apiKey = import.meta.env["VITE_OPENROUTER_API_KEY"];
  if (!apiKey) {
    throw new Error(
      "The writer is not configured yet. Add VITE_OPENROUTER_API_KEY to your environment variables.",
    );
  }

  let response: Response;
  try {
    response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin,
        "X-Title": "Zalemba",
      },
      body: JSON.stringify({
        models: getModels(),
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
        temperature: 0.4,
        max_tokens: 8192,
      }),
    });
  } catch {
    throw new Error("Could not reach the writer. Check your connection and try again.");
  }

  if (!response.ok) {
    let providerMessage = "";
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      providerMessage = body.error?.message ?? "";
    } catch {
      // ignore non-JSON errors
    }
    if (response.status === 401) throw new Error("OpenRouter rejected the API key. Check VITE_OPENROUTER_API_KEY.");
    if (response.status === 402) throw new Error("Your OpenRouter account is out of credits. Add credits on openrouter.ai.");
    if (response.status === 429) throw new Error("The writer is busy right now. Please try again in a minute.");
    throw new Error(`Couldn't write your document (HTTP ${response.status}). Please try again.`);
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = result.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("The writer returned an empty response. Please try again.");
  return text;
}

export function parseJson<T>(text: string): T {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return JSON.parse(text.slice(start, end + 1)) as T;
}

export const ZAMBIAN_STYLE = `
You write documents exactly the way real, well-written Zambian formal letters are laid out and phrased.
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

HELSB student loans: address to "The Chief Executive Officer, Higher Education Loans and Scholarships Board, P.O. Box 320298, LUSAKA." Explain the family financial situation honestly (e.g. parent(s) late, peasant farmer, small business, salary only covers part), the programme and university, and the loan percentage requested. Mention attached results, NRC, and supporting documents (death certificates, payslips) only if the user mentioned them.

CVs (real Zambian CVs):
- Title "CURRICULUM VITAE" at the top, then name, phone (e.g. +260961209599 or 0968997568) and email.
- PERSONAL DETAILS as aligned "Label : Value" lines.
- CAREER OBJECTIVE (or "Aim"): one short line.
- EDUCATION BACKGROUND as "Period    School    Achievement" rows, newest first.
- PROFESSIONAL QUALIFICATIONS only if given.
- SKILLS / COMPETENCES as bullet points, WORK EXPERIENCE, then REFEREES.

Invoices and quotations (ZRA-style Zambian tax invoices):
- Heading "TAX INVOICE" / "INVOICE" / "QUOTATION", with Invoice Number, Date, Due Date.
- FROM block and TO block.
- Item table columns: Description | Quantity | Unit Price | VAT % | Amount, amounts in ZMW or K with two decimals.
- Totals: Total Exclusive, Total VAT, Grand Total / Balance Due.
- Bank details block and Terms & Conditions.

STRICT RULES: Never invent names, qualifications, experience, employers, dates, NRC numbers, TPIN numbers, addresses, certificates or achievements. If something is missing, leave it out. Do not write placeholders like [Your Name] unless absolutely required.
`;
