import { DOC_TYPES, getDocType, zambianDate, type ZDoc, type Answers } from "./documents";
import { writeText, parseJson, ZAMBIAN_STYLE } from "./ai";

const JSON_SHAPE = `Return ONLY JSON with this exact shape:
{"from":[sender address lines],"date":"string","to":[recipient lines],"salutation":"string","subject":"string","paragraphs":["..."],"closing":"string","name":"string","footer":["Cell: ..."]}`;
const FREE_SHAPE = `Return ONLY JSON: {"text":"the full document as plain text with line breaks"}`;

function normalise(raw: Partial<ZDoc>): ZDoc {
  return {
    from: raw.from ?? [],
    date: raw.date ?? "",
    to: raw.to ?? [],
    salutation: raw.salutation ?? "",
    subject: raw.subject ?? "",
    paragraphs: raw.paragraphs ?? [],
    closing: raw.closing ?? "",
    name: raw.name ?? "",
    footer: raw.footer ?? [],
    ...(raw.text ? { text: raw.text } : {}),
  };
}

export async function generateDocument(type: string, answers: Answers, note?: string): Promise<ZDoc> {
  const t = getDocType(type);
  if (!t) throw new Error("Unknown document type");
  const facts = t.questions
    .filter((q) => answers[q.id]?.trim())
    .map((q) => `- ${q.question} ${answers[q.id]}`)
    .join("\n");
  const prompt = `Document: ${t.title}
Today's date: ${zambianDate()}
Suggested subject: ${t.subject(answers)}
${t.defaultTo ? `Recipient address: ${t.defaultTo.join(" ")}` : ""}
${note ? `What the user said they need: ${note}` : ""}
Facts from the user:
${facts}

${t.instructions}
${t.kind === "letter" ? JSON_SHAPE : FREE_SHAPE}`;
  const text = await writeText(ZAMBIAN_STYLE, prompt);
  return normalise(parseJson<Partial<ZDoc>>(text));
}

export async function improveDocument(doc: ZDoc, instruction: string): Promise<ZDoc> {
  const isFree = !!doc.text;
  const prompt = `Rewrite this document: ${instruction}.
Keep every personal fact exactly the same (names, addresses, dates, numbers, NRC, employers, qualifications, amounts). Keep the Zambian layout.
Document JSON:
${JSON.stringify(doc)}
${isFree ? FREE_SHAPE : JSON_SHAPE}`;
  const text = await writeText(ZAMBIAN_STYLE, prompt);
  return normalise(parseJson<Partial<ZDoc>>(text));
}

export async function recommendDocument(need: string): Promise<{ type: string; label: string }> {
  const list = DOC_TYPES.map((d) => `${d.id}: ${d.title} (${d.short})`).join("\n");
  const text = await writeText(
    "You match a person's need to the best document type. Reply with JSON only.",
    `Need: "${need}"\nTypes:\n${list}\nReturn {"type":"<id>","label":"short friendly name of the exact document e.g. Request Letter"}`,
  );
  const r = parseJson<{ type: string; label: string }>(text);
  return { type: getDocType(r.type) ? r.type : "other-letter", label: r.label || "Letter" };
}
