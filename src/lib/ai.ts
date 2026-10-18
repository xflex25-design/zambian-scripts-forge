/** AI text generation supporting server-side Gemini (/api/generate), OpenRouter, and client fallbacks. */

export async function writeText(system: string, prompt: string): Promise<string> {
  // 1. Primary: Call server-side Gemini API (/api/generate)
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ system, prompt }),
      signal: controller.signal,
    });
    clearTimeout(timer);
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
  const openRouterKey =
    typeof import.meta !== "undefined" && import.meta.env
      ? import.meta.env["VITE_OPENROUTER_API_KEY"]
      : undefined;
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
    const lower = prompt.toLowerCase();
    if (lower.includes("loan") || lower.includes("bursary") || lower.includes("helsb") || lower.includes("student")) {
      return JSON.stringify({ type: "helsb", label: "Student / HELSB Loan Letter" });
    }
    if (lower.includes("cv") || lower.includes("curriculum vitae") || lower.includes("resume")) {
      return JSON.stringify({ type: "cv", label: "Curriculum Vitae" });
    }
    if (lower.includes("school") || lower.includes("grade") || lower.includes("head teacher")) {
      return JSON.stringify({ type: "school-letter", label: "School Application / Request Letter" });
    }
    return JSON.stringify({ type: "job-application", label: "Job Application Letter" });
  }

  const isCV = prompt.toLowerCase().includes("document: cv") || prompt.toLowerCase().includes("curriculum vitae");

  // Parse facts from user input
  let senderName = "Applicant";
  const senderLines: string[] = [];
  const recipientLines: string[] = [];
  let subject = "RE: APPLICATION";
  let phone = "";
  let nrc = "";
  let gender = "";
  let age = "";
  let school = "";
  let university = "";
  let programme = "";
  let percentage = "100%";
  let position = "";
  let company = "";
  let advert = "";
  let familySituation = "";
  let familyDetail = "";
  let experience = "";
  let skills = "";
  let education = "";
  let languages = "English, Bemba, Nyanja";
  let referees = "";

  const lines = prompt.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("Suggested subject:")) {
      subject = trimmed.replace("Suggested subject:", "").trim();
    } else if (trimmed.startsWith("Recipient address:")) {
      const addr = trimmed.replace("Recipient address:", "").trim();
      if (addr) recipientLines.push(addr);
    } else if (trimmed.includes("full name") || trimmed.includes("Full name") || trimmed.includes("Full Name")) {
      const val = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (val) {
        senderName = val.trim();
        senderLines.push(val.trim());
      }
    } else if (trimmed.includes("address") || trimmed.includes("Address")) {
      const val = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (val) senderLines.push(val.trim());
    } else if (trimmed.includes("phone") || trimmed.includes("Phone") || trimmed.includes("Contact")) {
      phone = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("NRC") || trimmed.includes("National Registration Card")) {
      nrc = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("personal") || trimmed.includes("Personal details")) {
      const val = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
      if (val.toLowerCase().includes("female")) gender = "female";
      else if (val.toLowerCase().includes("male")) gender = "male";
      const ageMatch = val.match(/\b(\d{2})\b/);
      if (ageMatch) age = ageMatch[1];
      const nrcMatch = val.match(/\b\d{6}\/\d{2}\/\d\b/);
      if (nrcMatch) nrc = nrcMatch[0];
    } else if (trimmed.includes("secondary school") || trimmed.includes("School")) {
      school = trimmed.split(/:\s+|\s+-\s+/)[1] || school;
    } else if (trimmed.includes("university") || trimmed.includes("University")) {
      university = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("programme") || trimmed.includes("Programme")) {
      programme = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("percentage") || trimmed.includes("loan do you need")) {
      percentage = trimmed.split(/:\s+|\s+-\s+/)[1] || "100%";
    } else if (trimmed.includes("family situation") || trimmed.includes("family")) {
      familySituation = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("familyDetail") || trimmed.includes("supports you")) {
      familyDetail = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("position") || trimmed.includes("Position")) {
      position = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("company") || trimmed.includes("Company")) {
      company = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("advert") || trimmed.includes("see the advert") || trimmed.includes("see the job")) {
      advert = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("experience") || trimmed.includes("Experience")) {
      experience = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("skills") || trimmed.includes("Skills")) {
      skills = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("education") || trimmed.includes("Education")) {
      education = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    } else if (trimmed.includes("languages") || trimmed.includes("Languages")) {
      languages = trimmed.split(/:\s+|\s+-\s+/)[1] || languages;
    } else if (trimmed.includes("referees") || trimmed.includes("Referees")) {
      referees = trimmed.split(/:\s+|\s+-\s+/)[1] || "";
    }
  }

  // If this is a CV
  if (isCV) {
    const cvText = `CURRICULUM VITAE

PERSONAL DETAILS
Surname             : ${senderName.split(" ").slice(-1)[0] || senderName}
Other Names         : ${senderName.split(" ").slice(0, -1).join(" ") || "Applicant"}
Sex                 : ${gender ? gender.toUpperCase() : "Male"}
Nationality         : Zambian
Marital Status      : Single
National Reg. Card  : ${nrc || "Available on request"}
Residential Address : ${senderLines.join(", ") || "Lusaka, Zambia"}
Contact / Cell      : ${phone || "097X XXX XXX"}
Languages Spoken    : ${languages}
Religion            : Christian

ACADEMIC QUALIFICATIONS
Period              : 2018 - 2021
School              : ${school || "Secondary School"}
Qualification       : Full Grade Twelve (12) School Certificate

${education ? `TERTIARY / PROFESSIONAL QUALIFICATIONS\n${education}\n` : ""}
WORK EXPERIENCE
${experience || "Previous experience gained through hands-on responsibilities, team collaboration, and client service."}

SKILLS AND ATTRIBUTES
- ${skills || "Fast learner, honest, hardworking, and attentive to detail"}
- Excellent communication and interpersonal skills
- Ability to work with minimum supervision and adhere to organisational guidelines
- Strong sense of responsibility and dedication

REFEREES
${referees || "1. Mr. Chavwanga Vitalis, Senior Teacher, Cell: 0978654560\n2. Available upon request"}`;

    return JSON.stringify({ text: cvText });
  }

  // Construct Authentic Zambian Letter Format
  const dateFormatted = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (senderLines.length === 0) {
    senderLines.push(senderName, "Plot No. 124, Off Great East Road", "P.O. Box 30000", "LUSAKA.");
  } else {
    const last = senderLines[senderLines.length - 1];
    if (!last.endsWith(".") && /^[a-zA-Z\s]+$/.test(last)) {
      senderLines[senderLines.length - 1] = last.toUpperCase() + ".";
    }
  }

  const isHelsb = prompt.toLowerCase().includes("helsb") || prompt.toLowerCase().includes("student loan");

  if (recipientLines.length === 0) {
    if (isHelsb) {
      recipientLines.push(
        "The Chief Executive Officer,",
        "Higher Education Loans and Scholarships Board,",
        "P.O. Box 320298,",
        "LUSAKA."
      );
    } else {
      recipientLines.push(
        "The Human Resources Manager,",
        company ? `${company},` : "The Cherished Company,",
        "Private Bag 1,",
        "LUSAKA."
      );
    }
  }

  const paragraphs: string[] = [];

  if (isHelsb) {
    paragraphs.push(
      advert
        ? `Reference is made to the above captioned matter as advertised on ${advert}. I hereby formally write to submit my appeal and application for your consideration.`
        : "Reference is made to the above captioned matter. I hereby formally appeal to your able office to be considered for a student loan as instructed by your Board."
    );

    const personalIntro = `I am a ${gender ? `${gender} ` : ""}Zambian citizen${age ? ` aged ${age} years` : ""}${nrc ? ` and the holder of Green National Registration Card No. ${nrc}` : ""}. I completed my senior secondary education at ${school || "Secondary School"} and obtained a full Grade Twelve (12) School Certificate with statement of results attached.`;
    paragraphs.push(personalIntro);

    if (university || programme) {
      paragraphs.push(
        `I have been offered space at ${university || "the University"} to pursue ${programme || "studies"}. Due to severe financial limitations, my family is unable to sponsor my tertiary tuition fees, hence I am in dire need of a ${percentage} student loan.`
      );
    }

    if (familySituation || familyDetail) {
      paragraphs.push(
        `Regarding my family background, ${familySituation || "my parents are peasant farmers"}. ${familyDetail ? `${familyDetail}. ` : ""}We have no dependable source of financial support to meet the required tuition and accommodation expenses.`
      );
    } else {
      paragraphs.push(
        "My parents are peasant farmers who are unable to sponsor my education. An opportunity to be awarded this student loan will largely benefit my academic journey and empower me to contribute positively to our nation's development."
      );
    }

    paragraphs.push("Attached to this letter are copies of my credentials, statement of results, acceptance letter, and supporting documentation for your perusal.");
    paragraphs.push("Thanking you in anticipation for your kind consideration. I look forward to your favourable response.");
  } else {
    // Formal Job Application
    paragraphs.push(
      advert
        ? `With reference to the advertisement that appeared on ${advert}, I wish to apply for employment as a ${position || "Sales Assistant"} in your esteemed organisation.`
        : `Reference is made to the above captioned subject. I wish to respectfully submit my application for the position of ${position || "Worker"} in your organisation.`
    );

    const personalDetails = `I am a ${gender ? `${gender} ` : ""}Zambian citizen${age ? ` aged ${age} years` : ""}${nrc ? `, holder of National Registration Card No. ${nrc}` : ""}. I completed my secondary education at ${school || "Secondary School"} and was awarded a full Grade Twelve (12) certificate.`;
    paragraphs.push(personalDetails);

    if (experience) {
      paragraphs.push(`Regarding my work background, I have gained hands-on experience in: ${experience}. I am a diligent, trustworthy individual who takes pride in maintaining high standards and contributing to team productivity.`);
    } else {
      paragraphs.push("Although I am an entry-level applicant, I possess a strong work ethic, high integrity, and basic experience handling responsibilities with care and honesty. I confidently assure you that once given the opportunity, I will execute the assigned tasks to the best of my abilities.");
    }

    if (skills) {
      paragraphs.push(`I have developed strong skills including ${skills}. I am able to work under minimum supervision, communicate respectfully, and maintain strict confidentiality.`);
    }

    paragraphs.push("Attached to this letter are copies of my Curriculum Vitae, statement of results, and relevant credentials for your inspection. I will be ready for an interview whenever called upon.");
    paragraphs.push("Thanking you in advance for your kind consideration. I look forward to your favourable response.");
  }

  const result = {
    from: senderLines,
    date: dateFormatted,
    to: recipientLines,
    salutation: "Dear Sir/Madam,",
    subject: subject.toUpperCase().startsWith("RE:") || subject.toUpperCase().startsWith("REF:")
      ? subject.toUpperCase()
      : `RE: ${subject.toUpperCase()}`,
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

export const ZAMBIAN_STYLE = `You are an expert formal letter and CV writer in Zambia. You write documents that EXACTLY match authentic Zambian formal correspondence, job applications, student loan appeals, and Curriculum Vitae (CVs).

BRITISH/ZAMBIAN ENGLISH RULES:
- Spelling: organisation, favourable, programme, honour, licence, centre.
- Tone: Humble, respectful, confident, polite, and formal.
- No flowery American idioms (never use "I am thrilled", "passionate go-getter", or em dashes).

AUTHENTIC LETTER LAYOUT (from official Zambian samples):
1. SENDER BLOCK (top right or top left):
   - Full Name (or "C/O <Relative/Church/Organisation>" if given)
   - Plot/House number, township/street, P.O. Box if given
   - Town in CAPITALS followed by full stop: "KITWE.", "LUSAKA.", "NDOLA.", "MANSA."
   - Date with ordinal: "9th November, 2024", "24th August, 2024", "13th October, 2024".

2. RECIPIENT BLOCK (left):
   - Title line: "The Chief Executive Officer," / "The Human Resources Manager," / "The Branch Manager," / "The Head Teacher,"
   - Organisation / Board name: e.g. "Higher Education Loans and Scholarships Board,"
   - P.O. Box (if applicable)
   - Town in CAPITALS: "LUSAKA.", "KITWE.", "NDOLA."

3. SALUTATION:
   - "Dear Sir/Madam," (or "Dear Sir or Madam," or "Your Excellency," if head of state).

4. SUBJECT LINE:
   - Must start with "RE: " or "REF: " in all CAPITAL LETTERS, bold and underlined:
   - Examples:
     "RE: LETTER OF APPEAL TO BE CONSIDERED FOR A 100% STUDENT LOAN IN THE SECOND SELECTION"
     "REF: APPLICATION FOR EMPLOYMENT AS A SALES ASSISTANT"
     "RE: APPLICATION FOR A 100% STUDENT LOAN FOR THE 2024/2025 ACADEMIC YEAR AT THE COPPERBELT UNIVERSITY"

5. OPENING PARAGRAPHS (Authentic Zambian phrasing):
   - "Reference is made to the above captioned matter."
   - "With reference to the advertisement that appeared in/on ... dated ..., I wish to apply for..."
   - "Reference is made to the above captioned matter as advertised on your official Facebook page dated..."
   - "I am a male/female Zambian citizen aged twenty-three (23), single, and the holder of National Registration Card No. 155028/45/1." (Only include facts user provided: gender, age, NRC, marital status).
   - "I have completed my senior secondary education and hold a full Grade Twelve (12) School Certificate obtained from ... Secondary School with the statement of results attached."

6. BODY & SITUATION:
   - For HELSB student loans: Honestly state family background without exaggeration. Authentic Zambian phrasing: "My parents are peasant farmers who are unable to sponsor my tertiary fees", "Both my parents are late and I currently live with my grandmother", "Double Orphan and Financial Hardships", "Potential Breadwinner". State programme, university, and loan percentage (100%, 75%, 50%).
   - For Job Applications: Mention education, relevant skills, practical experience. If no formal experience, state: "Although I have no formal experience, I possess honesty, diligence, basic handling skills, and a strong willingness to learn."

7. ATTACHMENTS & POLITE CLOSING:
   - "Attached to this letter are copies of my credentials, statement of results, and relevant documents for your perusal."
   - "Thanking you in anticipation for your kind consideration."
   - "I look forward to your favourable response."

8. SIGN-OFF:
   - "Yours faithfully," (when Dear Sir/Madam) or "Yours sincerely," (when named).
   - Full name in CAPITALS or Title Case.
   - "Cell: <phone number(s)>"

CURRICULUM VITAE (CV) FORMAT IN ZAMBIA:
- Title centered: "CURRICULUM VITAE"
- Section 1: "PERSONAL DETAILS" (Surname, Other Names, Sex, Date of Birth, Place of Birth, Nationality, Marital Status, NRC Number, Address, Cell Phone, Email, Languages Spoken, Religion).
- Section 2: "CAREER OBJECTIVE" or "SUMMARY"
- Section 3: "ACADEMIC QUALIFICATIONS" (Table or lines: Year, School, Qualification e.g. Full Grade 12 Certificate).
- Section 4: "PROFESSIONAL / TERTIARY QUALIFICATIONS" (if any).
- Section 5: "WORK EXPERIENCE" (Role, Organisation, Responsibilities).
- Section 6: "SKILLS AND ATTRIBUTES" (Honest, hardworking, good communicator, minimum supervision).
- Section 7: "REFEREES" (2-3 referees with name, title, institution, cell phone number).

STRICT FACTUAL ACCURACY:
Never fabricate qualifications, NRC numbers, addresses, phone numbers, or achievements. Incorporate the user's facts into this authentic Zambian layout.`;
