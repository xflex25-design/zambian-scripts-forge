export type Answers = Record<string, string> & { [K in "name" | "address" | "phone" | "position" | "recipient" | "company" | "school" | "client" | "percentage" | "purpose" | "docKind" | "worked"]?: string };

export type Question = {
  id: string;
  question: string;
  help?: string;
  placeholder?: string;
  kind?: "text" | "textarea" | "choice";
  options?: string[];
  optional?: boolean;
  showIf?: (a: Answers) => boolean;
};

export type DocKind = "letter" | "freeform";

export type DocType = {
  id: string;
  title: string;
  short: string;
  emoji: string;
  kind: DocKind;
  popular?: boolean;
  defaultTo?: string[];
  seo: { title: string; description: string };
  subject: (a: Answers) => string;
  questions: Question[];
  instructions: string;
};

export type ZDoc = {
  from: string[];
  date: string;
  to: string[];
  salutation: string;
  subject: string;
  paragraphs: string[];
  closing: string;
  name: string;
  footer: string[];
  text?: string;
};

const name: Question = {
  id: "name",
  question: "What is your full name?",
  help: "This will appear on your document.",
  placeholder: "e.g. Mwila Banda",
};
const address: Question = {
  id: "address",
  question: "What is your address?",
  help: "Plot/house number, area and town. Add a P.O. Box if you have one.",
  placeholder: "e.g. Plot 12, Kabwata, Lusaka",
  kind: "textarea",
};
const phone: Question = {
  id: "phone",
  question: "What is your phone number?",
  help: "Add an email too if you have one.",
  placeholder: "e.g. 0977 123 456",
  optional: true,
};
const personal: Question = {
  id: "personal",
  question: "Any personal details to include?",
  help: "Zambian letters often mention gender, age and NRC number. Skip if you prefer.",
  placeholder: "e.g. Female, 23 years, NRC 247874/77/1",
  optional: true,
};
const extra: Question = {
  id: "extra",
  question: "Anything else you want mentioned?",
  help: "Optional. Attachments, special requests, anything important.",
  placeholder: "e.g. I have attached my Grade 12 results and NRC",
  kind: "textarea",
  optional: true,
};

const up = (s?: string) => (s || "").trim().toUpperCase();

export const DOC_TYPES: DocType[] = [
  {
    id: "job-application",
    title: "Job Application",
    short: "Apply for a job",
    emoji: "💼",
    kind: "letter",
    popular: true,
    seo: {
      title: "Job Application Letter Sample & Format — Zambia | Zalemba",
      description: "Write a professional job application letter in the correct Zambian format. Answer a few questions and get a ready-to-send letter — free, no login.",
    },
    subject: (a) => `RE: APPLICATION FOR EMPLOYMENT AS ${up(a.position) ? (/^[AEIOU]/.test(up(a.position)) ? "AN " : "A ") + up(a.position) : "..."}`,
    questions: [
      name,
      address,
      phone,
      { id: "company", question: "Which company are you applying to?", help: "Add the town or address if you know it.", placeholder: "e.g. Shoprite, Cairo Road, Lusaka" },
      { id: "recipient", question: "Who are you sending this letter to?", help: "A person's name or title. Skip if you don't know.", placeholder: "e.g. The Human Resources Manager", optional: true },
      { id: "position", question: "What position are you applying for?", placeholder: "e.g. Shop Assistant" },
      { id: "advert", question: "Where did you see the job?", placeholder: "e.g. Facebook page on 20th June 2025", optional: true },
      personal,
      { id: "education", question: "What is your highest level of education?", kind: "choice", options: ["Grade 9", "Grade 12", "Certificate", "Diploma", "Degree", "Other"] },
      { id: "educationDetail", question: "Tell us about your education", help: "School, college or course name.", placeholder: "e.g. Grade 12 at Kabulonga Girls, Certificate in Hospitality", optional: true },
      { id: "worked", question: "Do you have previous work experience?", kind: "choice", options: ["Yes", "No"] },
      { id: "experience", question: "What work have you done before?", help: "Where, for how long, and what you did.", placeholder: "e.g. 2 years at my uncle's shop serving customers and managing stock", kind: "textarea", showIf: (a) => a.worked === "Yes" },
      { id: "skills", question: "What skills or strengths do you have?", help: "Things you are good at or comfortable doing.", placeholder: "e.g. fast learner, honest, good with customers, can use a computer", kind: "textarea" },
      { id: "why", question: "Why do you want this job?", placeholder: "e.g. I enjoy helping people and want to grow in retail", kind: "textarea", optional: true },
      extra,
    ],
    instructions: "Write a formal Zambian job application letter. If the user has no work experience, focus on skills, attitude and willingness to learn without mentioning a lack of experience negatively.",
  },
  {
    id: "cv",
    title: "CV",
    short: "Build your CV",
    emoji: "📄",
    kind: "freeform",
    popular: true,
    seo: {
      title: "CV Maker & Generator in Zambia — Free CV Template | Zalemba",
      description: "Create a professional CV in the standard Zambian format. Answer simple questions and download your CV in minutes — free, no login needed.",
    },
    subject: () => "CURRICULUM VITAE",
    questions: [
      name,
      address,
      { ...phone, optional: false },
      personal,
      { id: "objective", question: "What kind of job are you looking for?", placeholder: "e.g. Shop assistant or cashier", optional: true },
      { id: "education", question: "List your education", help: "School/college, qualification and years.", placeholder: "e.g. Matero Boys Secondary, Grade 12, 2019 - 2021", kind: "textarea" },
      { id: "experience", question: "List your work experience", help: "Skip if you have not worked yet.", placeholder: "e.g. Cashier, Pick n Pay Manda Hill, 2022 - 2024", kind: "textarea", optional: true },
      { id: "skills", question: "What are your skills?", placeholder: "e.g. Customer care, Microsoft Word, driving licence", kind: "textarea" },
      { id: "languages", question: "Which languages do you speak?", placeholder: "e.g. English, Bemba, Nyanja", optional: true },
      { id: "referees", question: "Who are your referees?", help: "Name, position and phone for 2-3 people.", placeholder: "e.g. Mr J. Phiri, Head Teacher, 0966 000 000", kind: "textarea", optional: true },
    ],
    instructions: "Write a clean, standard Zambian CV in plain text with these headings in CAPITALS: PERSONAL DETAILS, CAREER OBJECTIVE (if given), EDUCATION, WORK EXPERIENCE (if given), SKILLS, LANGUAGES (if given), REFEREES (if none given write 'Available on request'). Use '- ' for list items.",
  },
  {
    id: "helsb",
    title: "Student / HELSB",
    short: "Student loan & bursary letters",
    emoji: "🎓",
    kind: "letter",
    popular: true,
    seo: {
      title: "HELSB Application Letter Sample — Student Loan Letter Zambia | Zalemba",
      description: "How to write a HELSB application letter for a student loan in Zambia. Answer a few questions and get a correctly formatted letter addressed to HELSB — free.",
    },
    defaultTo: ["The Chief Executive Officer,", "Higher Education Loans and Scholarships Board,", "P.O. Box 320298,", "LUSAKA."],
    subject: (a) => `RE: APPLICATION FOR A ${up(a.percentage) || "100%"} STUDENT LOAN`,
    questions: [
      name,
      address,
      phone,
      personal,
      { id: "school", question: "Which secondary school did you complete at?", placeholder: "e.g. Kitwe Boys Secondary School" },
      { id: "university", question: "Which university or college have you been accepted at?", placeholder: "e.g. Copperbelt University" },
      { id: "programme", question: "What programme will you study?", placeholder: "e.g. Bachelor of Banking and Finance" },
      { id: "percentage", question: "How much of a loan do you need?", kind: "choice", options: ["100%", "75%", "50%"] },
      { id: "family", question: "What is your family situation?", kind: "choice", options: ["One parent is late", "Both parents are late", "Both parents alive but cannot afford", "Parents can pay part of the fees"] },
      { id: "familyDetail", question: "Tell us a bit more", help: "Who supports you and what they do.", placeholder: "e.g. My mother is a peasant farmer in Chipata", kind: "textarea" },
      { id: "advert", question: "Where did you see the advert?", placeholder: "e.g. HELSB Facebook page dated 20th June 2025", optional: true },
      extra,
    ],
    instructions: "Write a HELSB student loan application letter in the authentic Zambian format. Explain the family situation sincerely and request the stated loan percentage.",
  },
  {
    id: "school-letter",
    title: "School Letter",
    short: "Applications & requests",
    emoji: "🏫",
    kind: "letter",
    popular: true,
    seo: {
      title: "School Application Letter Sample — Zambia | Zalemba",
      description: "Write a formal letter to a school in Zambia — place applications, requests and more. Answer a few questions and get a ready-to-send letter.",
    },
    subject: (a) => `RE: ${up(a.purpose) || "REQUEST"}`,
    questions: [
      name,
      address,
      phone,
      { id: "school", question: "Which school is this letter for?", placeholder: "e.g. Lusaka Boys Secondary School" },
      { id: "recipient", question: "Who should receive it?", placeholder: "e.g. The Head Teacher", optional: true },
      { id: "purpose", question: "What is the letter about?", placeholder: "e.g. Application for a Grade 10 place for my son", kind: "textarea" },
      { id: "details", question: "Give us the important details", placeholder: "e.g. Child's name, grade, reasons", kind: "textarea" },
      extra,
    ],
    instructions: "Write a polite formal Zambian letter to a school (as a parent, guardian or pupil, as appropriate). Make the subject line a short capitalised summary of the purpose.",
  },
  {
    id: "business",
    title: "Business",
    short: "Quotations, invoices & letters",
    emoji: "📊",
    kind: "freeform",
    popular: true,
    seo: {
      title: "Quotation & Invoice Maker — Zambia | Zalemba",
      description: "Create professional quotations, invoices and debt reminders in Kwacha for your Zambian business. Free, no login — just answer a few questions.",
    },
    subject: (a) => up(a.docKind) || "QUOTATION",
    questions: [
      { id: "docKind", question: "What do you need?", kind: "choice", options: ["Quotation", "Invoice", "Debt reminder"] },
      { id: "name", question: "What is your business name?", placeholder: "e.g. Banda General Dealers" },
      address,
      phone,
      { id: "client", question: "Who is it for?", help: "Customer name and address.", placeholder: "e.g. Chanda Lodge, Livingstone" },
      { id: "items", question: "List the items or services and prices", help: "One per line: item, quantity, price in Kwacha.", placeholder: "e.g. Cement 50kg, 20 bags, K180 each", kind: "textarea" },
      { id: "terms", question: "Any payment terms or bank details?", placeholder: "e.g. 50% deposit, Zanaco account 0123456789", kind: "textarea", optional: true },
    ],
    instructions: "Write the requested business document in clean plain text for Zambia. Use Kwacha (K) amounts, calculate line totals and the grand total correctly. Include a number like QTN-001 or INV-001, the date, From and To details, an aligned item table using spaces, totals, and terms. For a debt reminder write a polite but firm formal letter as plain text.",
  },
  {
    id: "other-letter",
    title: "Other Letter",
    short: "Any professional letter",
    emoji: "✉️",
    kind: "letter",
    popular: true,
    seo: {
      title: "Formal Letter Writer — Resignation, Complaint & Request Letters Zambia | Zalemba",
      description: "Write any formal Zambian letter — resignation, complaint, leave application, request and more. Correct format, ready in minutes, free.",
    },
    subject: (a) => `RE: ${up(a.purpose) || "..."}`,
    questions: [
      { id: "letterKind", question: "What kind of letter is it?", kind: "choice", options: ["Request letter", "Leave application", "Resignation letter", "Complaint letter", "Reference request", "Declaration / statement", "Something else"] },
      name,
      address,
      phone,
      { id: "recipient", question: "Who are you writing to?", help: "Their title and organisation.", placeholder: "e.g. The Landlord, Plot 5 Chilenje" },
      { id: "purpose", question: "In a few words, what is it about?", placeholder: "e.g. Request for more time to pay rent" },
      { id: "details", question: "Tell us what happened or what you need", placeholder: "e.g. I was paid late this month and will pay on 15th", kind: "textarea" },
      extra,
    ],
    instructions: "Write a formal Zambian letter of the chosen kind. Make the subject line a short capitalised summary.",
  },
];

export const getDocType = (id: string) => DOC_TYPES.find((d) => d.id === id);

export const visibleQuestions = (t: DocType, a: Answers) => t.questions.filter((q) => !q.showIf || q.showIf(a));

export function zambianDate(d = new Date()) {
  const day = d.getDate();
  const suf = day % 10 === 1 && day !== 11 ? "st" : day % 10 === 2 && day !== 12 ? "nd" : day % 10 === 3 && day !== 13 ? "rd" : "th";
  return `${day}${suf} ${d.toLocaleString("en-GB", { month: "long" })}, ${d.getFullYear()}`;
}

const lines = (s?: string) => (s || "").split(/\n|,\s*/).map((x) => x.trim()).filter(Boolean);

export function previewDoc(t: DocType, a: Answers): ZDoc {
  const to = t.defaultTo ?? [
    ...(a.recipient ? [a.recipient] : t.id === "job-application" && a.company ? ["The Human Resources Manager,"] : []),
    ...lines(a.company || a.school || a.client),
  ];
  return {
    from: [a.name, ...lines(a.address)].filter((x): x is string => !!x),
    date: zambianDate(),
    to,
    salutation: "Dear Sir/Madam,",
    subject: t.subject(a),
    paragraphs: [],
    closing: "Yours faithfully,",
    name: a.name || "",
    footer: a.phone ? [`Cell: ${a.phone}`] : [],
  };
}

export function docToText(d: ZDoc) {
  if (d.text) return d.text;
  return [
    d.from.join("\n"),
    d.date,
    "",
    d.to.join("\n"),
    "",
    d.salutation,
    "",
    d.subject,
    "",
    d.paragraphs.join("\n\n"),
    "",
    d.closing,
    "",
    d.name,
    d.footer.join("\n"),
  ].join("\n").trim();
}

export const FINDER = [
  { emoji: "💼", label: "Get a job", hint: "Job application, CV", to: "job-application" },
  { emoji: "🎓", label: "School / College", hint: "HELSB, bursaries", to: "helsb" },
  { emoji: "🏫", label: "Deal with a school", hint: "Places, requests", to: "school-letter" },
  { emoji: "📊", label: "Run my business", hint: "Quotes, invoices", to: "business" },
  { emoji: "🏛️", label: "Official request", hint: "Council, landlord, office", to: "other-letter" },
  { emoji: "📄", label: "Create a CV", hint: "Your work profile", to: "cv" },
];
