import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronDown, FileText, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { DocIcon } from "@/components/DocIcon";
import { navigate, useRoute, matchRoute } from "@/lib/router";
import { useAuth } from "@/lib/auth";

export type LandingContent = {
  slug: string;
  docId?: string;
  emoji: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sampleExcerpt?: {
    title: string;
    lines: string[];
  };
  sections: { heading: string; body: string }[];
  faqs?: { question: string; answer: string }[];
  cta: string;
  ctaLink: string;
};

export const LANDINGS: Record<string, LandingContent> = {
  cv: {
    slug: "cv",
    docId: "cv",
    emoji: "📄",
    title: "CV Maker Zambia",
    h1: "CV Maker Zambia — Professional Zambian CV Format & Free Template",
    metaTitle: "CV Maker Zambia — Free CV Format & Template Online | Zalemba",
    metaDescription: "Create a professional CV in the standard Zambian format online. Free CV maker for job seekers, school leavers, and graduates in Zambia with instant PDF download.",
    intro: "A professional Curriculum Vitae (CV) is the single most important document for job seekers in Zambia. Unlike Western resumes that omit personal particulars, Zambian employers expect a clear, chronological document detailing your identity (including NRC number and marital status), career objective, educational background, work experience, key skills, and traceable referees.",
    sampleExcerpt: {
      title: "Typical Zambian CV Structure",
      lines: [
        "CURRICULUM VITAE",
        "MWILA BANDA | Plot 14, Kabwata, Lusaka | Cell: 0977 123 456",
        "1. PERSONAL DETAILS: NRC: 247874/77/1 | D.O.B: 14/05/1998 | Nationality: Zambian | Languages: English, Bemba, Nyanja",
        "2. CAREER OBJECTIVE: Dedicated professional seeking to contribute to retail customer service and operations...",
        "3. EDUCATIONAL BACKGROUND: 2018 - 2020: Diploma in Business Administration, Evelyn Hone College | 2013 - 2017: Grade 12 Certificate, Kabulonga Girls Secondary School",
        "4. WORK EXPERIENCE: 2021 - 2024: Cashier & Sales Assistant, Lusaka Retailers Ltd",
        "5. KEY SKILLS: Cash Handling, Point of Sale (POS), Customer Service, Stock Management",
        "6. REFEREES: Available on request or 2-3 traceable contacts with verified Zambian numbers",
      ],
    },
    sections: [
      {
        heading: "The standard Zambian CV format and headings",
        body: "In Zambia, professional recruiters and HR managers look for specific standardized sections. Start with CURRICULUM VITAE at the top, followed by your full name, location, and phone number. Next, include PERSONAL DETAILS (Date of Birth, Gender, Marital Status, NRC Number, Nationality, and Languages Spoken). Follow this with CAREER OBJECTIVE, EDUCATIONAL BACKGROUND in reverse chronological order, WORK EXPERIENCE detailing your duties and achievements, KEY SKILLS, and 2 to 3 traceable REFEREES.",
      },
      {
        heading: "CV format for Grade 12 school leavers & graduates in Zambia",
        body: "If you have recently completed Grade 12 or graduated from university with limited formal work experience, do not worry. Emphasize your academic qualifications (such as your ECZ Grade 12 passes or certificate/diploma courses), computer literacy, volunteer work, and responsibilities held at school (such as prefect, team captain, or club leader). Zambian employers value honesty, dedication, and a willingness to learn.",
      },
      {
        heading: "Crucial formatting tips to get shortlisted by Zambian employers",
        body: "Keep your CV clean and easy to read. Zambian hiring managers prefer 1 to 2 pages with consistent bullet points and no excessive graphic elements that complicate printing or digital reading. Double-check your phone number (Airtel, MTN, or Zamtel) so recruiters can reach you directly for interviews.",
      },
    ],
    faqs: [
      {
        question: "Do Zambian employers require an NRC number on a CV?",
        answer: "Yes. In Zambia, including your National Registration Card (NRC) number under Personal Details is standard professional practice to confirm your identity and legal right to work.",
      },
      {
        question: "What should school leavers write under work experience?",
        answer: "If you have not held formal employment, mention internships, community work, assisting in a family business, or school responsibilities. Highlight your skills and practical abilities.",
      },
      {
        question: "How many referees should I include on my Zambian CV?",
        answer: "Include 2 to 3 traceable referees with active contact numbers and job titles (such as former teachers, lecturers, supervisors, or respected community members).",
      },
    ],
    cta: "Build your Zambian CV now",
    ctaLink: "/create/cv",
  },
  "job-application": {
    slug: "job-application",
    docId: "job-application",
    emoji: "💼",
    title: "Job Application Letter",
    h1: "Application Letter for a Job in Zambia — Format, Sample & Free Generator",
    metaTitle: "Job Application Letter in Zambia — Format, Sample & Generator | Zalemba",
    metaDescription: "How to write an application letter for a job in Zambia. Get the standard Zambian format, sample wording, and generate a ready-to-send letter PDF free.",
    intro: "An application letter (commonly known as a formal cover letter) is required for virtually all employment vacancies in Zambia. Zambian hiring managers expect a formal, respectful business letter that strictly follows standard Zambian address and correspondence etiquette.",
    sampleExcerpt: {
      title: "Sample Zambian Job Application Letter Format",
      lines: [
        "Plot 24, Woodlands, Lusaka",
        "Cell: 0966 234 567",
        "15th October 2025",
        "The Human Resources Manager",
        "Shoprite Zambia Limited, Cairo Road Branch, Lusaka",
        "Dear Sir/Madam,",
        "RE: APPLICATION FOR EMPLOYMENT AS A SHOP ASSISTANT",
        "I am writing to express my interest in the Shop Assistant position advertised on your Facebook page on 10th October 2025...",
        "I am a Zambian female aged 22, holder of NRC No. 247874/77/1, with a Grade 12 School Certificate and two years of customer service experience...",
        "Yours faithfully,",
        "[Signature]",
        "Mwila Banda",
      ],
    },
    sections: [
      {
        heading: "Standard Zambian application letter structure",
        body: "Place your address and contact details at the top right or left, followed by the date in standard Zambian format (e.g. 15th October 2025). Address the letter to The Human Resources Manager or Managing Director with the company's full address. Use the formal salutation 'Dear Sir/Madam,' and provide a clear, capitalized reference line beginning with 'RE: APPLICATION FOR EMPLOYMENT AS...'.",
      },
      {
        heading: "Introducing yourself and referencing the vacancy",
        body: "In your opening paragraph, introduce your name, age, Zambian citizenship, and NRC number, and clearly cite where you saw the job advertisement (e.g., Zambia Daily Mail, Job Search Zambia, Facebook, or company website). This immediate clarity helps the hiring team route your file to the correct department.",
      },
      {
        heading: "Applying without prior work experience",
        body: "If you are an entry-level candidate or recent school leaver, focus on your educational achievements, practical skills, fast learning capability, and strong work ethic. Employers in Zambia appreciate humble, honest enthusiasm over exaggerated claims.",
      },
      {
        heading: "Difference between Zambian letters and Western cover letters",
        body: "Zambian professional culture values respectful, formal, and structured language. Avoid casual Western phrasing like 'I am thrilled to apply.' Close with 'Yours faithfully,' followed by your signature, full printed name, and mobile number.",
      },
    ],
    faqs: [
      {
        question: "What salutation should I use if I do not know the recipient's name?",
        answer: "Use 'Dear Sir/Madam,' which is the universal standard for formal business and government applications across Zambia.",
      },
      {
        question: "What documents should I attach to my application letter in Zambia?",
        answer: "Typically attach certified copies of your NRC, Grade 12 certificate, professional diplomas/degrees, and your updated curriculum vitae (CV).",
      },
    ],
    cta: "Generate your application letter",
    ctaLink: "/create/job-application",
  },
  helsb: {
    slug: "helsb",
    docId: "helsb",
    emoji: "🎓",
    title: "HELSB Appeal Letter",
    h1: "HELSB Appeal Letter Zambia — Sample, Format & Student Loan Appeal Guide",
    metaTitle: "HELSB Appeal Letter Zambia — Sample, Format & Guide | Zalemba",
    metaDescription: "Write a formal HELSB student loan appeal letter in Zambia. Learn the correct format, CEO address in Lusaka, vulnerability grounds, and generate your letter free.",
    intro: "The Higher Education Loans and Scholarships Board (HELSB) awards government student loans and bursaries to eligible students accepted into public universities such as UNZA, CBU, Mukuba, Mulungushi, and others. If your initial application was omitted from the award list, submitting a well-structured appeal letter during the official appeal window can make a decisive difference.",
    sampleExcerpt: {
      title: "Sample HELSB Appeal Letter Heading & Subject",
      lines: [
        "To: The Chief Executive Officer",
        "Higher Education Loans and Scholarships Board (HELSB)",
        "P.O. Box 320298, LUSAKA.",
        "Dear Sir/Madam,",
        "REF: APPEAL FOR A 100% STUDENT LOAN",
        "I am a female Zambian aged 20, holder of NRC No. 123456/78/1, admitted to the Copperbelt University (CBU) for the Bachelor of Banking and Finance programme...",
        "I write to humbly appeal against the non-awarding of a student loan for the 2025/2026 academic year...",
      ],
    },
    sections: [
      {
        heading: "Official address & correct HELSB letter format",
        body: "Your letter must be formally addressed to: The Chief Executive Officer, Higher Education Loans and Scholarships Board, P.O. Box 320298, LUSAKA. Use 'Dear Sir/Madam,' and specify a clear subject line indicating the loan percentage requested (e.g. 'REF: APPEAL FOR A 100% STUDENT LOAN' or '75% STUDENT LOAN').",
      },
      {
        heading: "Grounds for appeal & proving vulnerability",
        body: "The HELSB committee evaluates appeals based on genuine vulnerability. Sincerely state your family situation: whether you are a single or double orphan, whether your parents or guardians are peasant farmers, retired, or without reliable income. Provide authentic facts without exaggeration, as HELSB verifies supporting evidence.",
      },
      {
        heading: "Mandatory supporting documents to attach",
        body: "Always attach certified photocopies of your university admission letter, ECZ Grade 12 statement of results or certificate, student NRC, parent/guardian NRC, certified death certificates (if applicable), and your official NATSAVE deposit receipt.",
      },
      {
        heading: "Submission guidelines and deadlines",
        body: "Appeals are strictly time-bound, usually within 7 to 14 days following the publication of the loan award list. Submit your appeal physically to HELSB offices in Lusaka, Kitwe, or Kabwe, or via their verified email. Note: Zalemba is an independent letter-formatting tool and is not affiliated with HELSB.",
      },
    ],
    faqs: [
      {
        question: "Can I type my HELSB appeal letter?",
        answer: "Yes. HELSB accepts both typed and legible handwritten letters. A typed letter ensures your NRC number and family details are completely clear and error-free.",
      },
      {
        question: "What loan percentage should I apply or appeal for?",
        answer: "HELSB awards loans in tiers: 100%, 75%, and 50%. Request the percentage that reflects your family's verified financial capacity.",
      },
    ],
    cta: "Create your HELSB appeal letter",
    ctaLink: "/create/helsb",
  },
  "internship-application": {
    slug: "internship-application",
    docId: "job-application",
    emoji: "🎓",
    title: "Internship & Attachment Letter",
    h1: "Internship & Industrial Attachment Application Letter in Zambia — Format & Sample",
    metaTitle: "Internship Application Letter Zambia — Attachment Letter Format | Zalemba",
    metaDescription: "Write an industrial attachment or internship application letter for Zambian companies and ministries. Correct Zambian student format with free instant generation.",
    intro: "Students enrolled in Zambian universities and colleges (such as UNZA, CBU, Evelyn Hone, NORTEC, Mulungushi, and Cavendish) must complete an industrial attachment or internship as part of their academic curriculum. A professional, respectful attachment application letter addressed to company management or government ministries is essential for securing a placement.",
    sampleExcerpt: {
      title: "Sample Attachment Letter Heading & Opening",
      lines: [
        "The Human Resources Manager",
        "ZESCO Limited, Stand No. 6949, Great East Road, Lusaka",
        "Dear Sir/Madam,",
        "RE: APPLICATION FOR INDUSTRIAL ATTACHMENT IN ELECTRICAL ENGINEERING",
        "I am a third-year student pursuing a Bachelor of Engineering at Copperbelt University. In partial fulfillment of my degree programme, I am required to complete a 3-month industrial attachment...",
        "I kindly request an attachment placement within your engineering department commencing in June...",
      ],
    },
    sections: [
      {
        heading: "What to include in your attachment application letter",
        body: "Specify your tertiary institution, exact programme of study, current academic year, the required attachment duration (e.g. 3 months from June to August), and the specific department you are applying to. Highlight your academic foundation and eagerness to gain practical industry exposure.",
      },
      {
        heading: "Addressing corporate companies vs government ministries",
        body: "For private and parastatal companies, address The Human Resources Manager. For government ministries or provincial departments in Zambia, address The Permanent Secretary followed by the relevant ministry name and city.",
      },
      {
        heading: "Supporting documents to attach",
        body: "Attach an official introductory letter from your university Dean or Head of Department, a certified copy of your student ID, your NRC copy, and a concise 1-page student CV.",
      },
      {
        heading: "When to apply in Zambia",
        body: "Apply at least 8 to 12 weeks before your university or college break begins, as corporate HR departments review applications in quarterly cycles.",
      },
    ],
    faqs: [
      {
        question: "Is an introductory letter from the university compulsory?",
        answer: "Yes. Almost all Zambian organizations require an official institutional recommendation letter confirming that you are an active student requiring attachment.",
      },
      {
        question: "Can I apply to multiple companies for attachment?",
        answer: "Yes, you should apply to multiple relevant companies in Lusaka, the Copperbelt, or your home district to increase your chances of placement.",
      },
    ],
    cta: "Create attachment letter now",
    ctaLink: "/create/job-application",
  },
  "resignation-letter": {
    slug: "resignation-letter",
    docId: "other-letter",
    emoji: "📝",
    title: "Resignation Letter",
    h1: "Resignation Letter Format & Sample for Zambia — Professional Notice",
    metaTitle: "Resignation Letter Sample & Format Zambia — Professional Notice | Zalemba",
    metaDescription: "Write a professional resignation letter complying with Zambian employment standards. Free resignation letter sample, notice period format, and instant generator.",
    intro: "Resigning from your job in Zambia requires formal written notification in compliance with the Zambian Employment Code Act and your employment contract. A polite, well-structured resignation letter protects your professional standing, ensures smooth transition, and guarantees positive future references.",
    sampleExcerpt: {
      title: "Sample Zambian Resignation Letter",
      lines: [
        "The Branch Manager",
        "First National Bank (FNB) Zambia, Lusaka Branch",
        "Dear Sir/Madam,",
        "RE: NOTICE OF RESIGNATION AS CUSTOMER SERVICE OFFICER",
        "Please accept this letter as formal notification that I am resigning from my position as Customer Service Officer, with my final working day being 30th November 2025...",
        "I would like to thank you for the professional guidance and opportunities provided to me during my three years with the bank...",
        "Yours faithfully,",
        "[Signature]",
        "Chanda Musonda",
      ],
    },
    sections: [
      {
        heading: "Notice period rules under Zambian employment law",
        body: "Under the Zambian Employment Code Act No. 3 of 2019, employees on contracts with monthly pay typically provide 30 days or one calendar month written notice, unless your contract specifies a longer duration. Check your contract carefully before submitting your letter.",
      },
      {
        heading: "Essential components of a professional resignation letter",
        body: "State your official job title, clear and unambiguous notice of resignation, your exact last working day, an expression of gratitude for the opportunity, and an offer to assist with handover duties.",
      },
      {
        heading: "Maintaining positive professional relationships",
        body: "Keep your letter strictly professional, courteous, and constructive. Even if you are leaving under challenging circumstances, do not vent grievances in your resignation letter. A positive departure ensures you receive your accrued leave benefits and favorable reference letters.",
      },
    ],
    faqs: [
      {
        question: "Can an employee resign with immediate effect in Zambia?",
        answer: "Resigning with immediate effect without contractually specified justification may require you to pay salary in lieu of notice. It is usually best to serve your required notice or agree mutually with management.",
      },
      {
        question: "Will proper notice protect my terminal benefits?",
        answer: "Yes. Adhering to your contract's notice provisions protects your entitlement to accrued leave pay and proper clearance from your employer.",
      },
    ],
    cta: "Write your resignation letter",
    ctaLink: "/create/other-letter",
  },
  "image-to-text": {
    slug: "image-to-text",
    emoji: "📷",
    title: "Image to Text Converter",
    h1: "Image to Text Converter Online Zambia — Free Photo & Screenshot OCR",
    metaTitle: "Image to Text Converter Online — Free OCR Scanner in Zambia | Zalemba",
    metaDescription: "Extract text from photos, documents, and screenshots instantly in Zambia. Free online OCR converter — copy, edit, or transform printed letters into editable text.",
    intro: "Convert photos of printed letters, Grade 12 certificates, newspaper job adverts, and phone screenshots into editable text online. Zalemba's in-browser OCR scanner extracts words instantly without uploading your private documents to third-party servers.",
    sampleExcerpt: {
      title: "Common Zambian OCR Use Cases",
      lines: [
        "1. Extracting requirements from newspaper job adverts (Zambia Daily Mail / Times of Zambia)",
        "2. Digitizing typed letters, school notices, and church announcements",
        "3. Converting paper quotation and invoice items into editable text",
        "4. Copying text from WhatsApp document screenshots directly into your CV",
      ],
    },
    sections: [
      {
        heading: "How the OCR converter works",
        body: "Select any JPEG, PNG, or WebP photo from your phone or computer. The optical character recognition engine reads the text characters directly in your browser. You can then copy, edit, download, or transfer the text into Zalemba's document creators.",
      },
      {
        heading: "Tips for highest scanning accuracy",
        body: "Take clear photos in good lighting, keep the camera straight, avoid shadows, and ensure the text is right-side up. Clear photos produce near-perfect text extraction.",
      },
      {
        heading: "Fast, private, and 100% free",
        body: "Unlike tools that require payment or account signups, Zalemba's image to text converter runs directly on your device with no limits on the number of pages you can scan.",
      },
    ],
    faqs: [
      {
        question: "Is the Image to Text converter free in Zambia?",
        answer: "Yes, it is completely free with no restrictions. You can scan as many documents and images as needed.",
      },
      {
        question: "Can I edit the text after extraction?",
        answer: "Yes. The extracted text is placed in an editable text area where you can correct typos, copy the content, or send it to a document creator.",
      },
    ],
    cta: "Open Image to Text tool",
    ctaLink: "/image-to-text",
  },
};

export function Landing() {
  const route = useRoute();
  const match = matchRoute("/landing/$slug", route.path);
  const slug = match?.slug ?? "";
  const content = LANDINGS[slug];
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Inject Breadcrumb and FAQPage JSON-LD schema into head dynamically
  useEffect(() => {
    if (!content) return;

    const schemaId = "landing-json-ld";
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }

    const currentUrl = typeof window !== "undefined" ? window.location.href : `https://zalemba.vercel.app/landing/${content.slug}`;

    const schemaData: Record<string, any> = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": typeof window !== "undefined" ? window.location.origin : "https://zalemba.vercel.app",
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "Guides",
              "item": `${typeof window !== "undefined" ? window.location.origin : "https://zalemba.vercel.app"}/#guides`,
            },
            {
              "@type": "ListItem",
              "position": 3,
              "name": content.title,
              "item": currentUrl,
            },
          ],
        },
        {
          "@type": "Article",
          "headline": content.h1,
          "description": content.metaDescription,
          "mainEntityOfPage": currentUrl,
          "inLanguage": "en-ZM",
          "publisher": {
            "@type": "Organization",
            "name": "Zalemba",
            "url": typeof window !== "undefined" ? window.location.origin : "https://zalemba.vercel.app",
          },
        },
      ],
    };

    if (content.faqs && content.faqs.length > 0) {
      schemaData["@graph"].push({
        "@type": "FAQPage",
        "mainEntity": content.faqs.map((f) => ({
          "@type": "Question",
          "name": f.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.answer,
          },
        })),
      });
    }

    script.textContent = JSON.stringify(schemaData);

    return () => {
      const el = document.getElementById(schemaId);
      if (el) el.remove();
    };
  }, [content]);

  const handleCta = (link: string) => {
    if (!user && link.startsWith("/create")) {
      toast.info("Please sign in or create an account to start creating documents.");
      navigate(`/login?redirect=${encodeURIComponent(link)}`);
      return;
    }
    navigate(link);
  };

  if (!content) {
    return (
      <div className="min-h-screen bg-hero">
        <Header />
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Guide not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The requested document guide could not be located.</p>
          <Button className="mt-6 rounded-2xl bg-gradient-primary" onClick={() => navigate("/")}>Go home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-20">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <button onClick={() => navigate("/")} className="hover:text-foreground">Home</button>
          <span>/</span>
          <button onClick={() => navigate("/")} className="hover:text-foreground">Guides</button>
          <span>/</span>
          <span className="font-medium text-foreground">{content.title}</span>
        </nav>

        <button onClick={() => navigate("/")} className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="size-4" /> Back to home
        </button>

        <article className="mt-6">
          <span className="text-4xl">{content.emoji}</span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{content.h1}</h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{content.intro}</p>

          {/* Primary Action Card */}
          <div className="mt-8 rounded-3xl border bg-card p-5 shadow-soft sm:p-7">
            {content.docId && (
              <div className="flex items-center gap-3">
                <DocIcon id={content.docId} emoji={content.emoji} className="size-12 shrink-0" />
                <div>
                  <p className="font-semibold">{content.title}</p>
                  <p className="text-sm text-muted-foreground">Answer simple questions — generate, preview, and download your PDF free</p>
                </div>
              </div>
            )}
            <Button className="mt-4 h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold" onClick={() => handleCta(content.ctaLink)}>
              {content.cta} <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>

          {/* Sample Excerpt Preview Box */}
          {content.sampleExcerpt && (
            <div className="mt-8 rounded-3xl border bg-card/60 p-5 shadow-soft">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <FileText className="size-4" />
                <span>{content.sampleExcerpt.title}</span>
              </div>
              <div className="mt-3 space-y-1.5 rounded-2xl bg-muted/60 p-4 font-mono text-xs text-foreground/90 leading-relaxed border">
                {content.sampleExcerpt.lines.map((line, idx) => (
                  <p key={idx} className={idx === 0 ? "font-bold text-primary" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Educational Content Sections */}
          {content.sections.map((s, i) => (
            <section key={i} className="mt-8">
              <h2 className="font-display text-xl font-bold sm:text-2xl">{s.heading}</h2>
              <p className="mt-2.5 leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}

          {/* FAQ Accordion Section */}
          {content.faqs && content.faqs.length > 0 && (
            <section className="mt-12 rounded-3xl border bg-card p-5 sm:p-7 shadow-soft">
              <div className="flex items-center gap-2">
                <HelpCircle className="size-5 text-primary" />
                <h2 className="font-display text-xl font-bold sm:text-2xl">Frequently Asked Questions</h2>
              </div>
              <div className="mt-4 divide-y">
                {content.faqs.map((f, i) => {
                  const isOpen = openFaq === i;
                  return (
                    <div key={i} className="py-3.5">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : i)}
                        className="flex w-full items-center justify-between text-left font-semibold text-sm sm:text-base text-foreground"
                      >
                        <span>{f.question}</span>
                        <ChevronDown className={`size-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                          {f.answer}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Bottom Conversion Card */}
          <div className="mt-10 rounded-2xl bg-secondary p-5 border">
            <p className="flex items-center gap-2 font-semibold">
              <Check className="size-4 text-primary" /> Ready to create your document?
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in or create a free account to generate, save, and download your document anytime.
            </p>
            <Button className="mt-3 rounded-2xl bg-gradient-primary font-medium" onClick={() => handleCta(content.ctaLink)}>
              Get started for free <ArrowRight className="size-4 ml-1" />
            </Button>
          </div>

          {/* Internal Links to other guides */}
          <section className="mt-12 border-t pt-8">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Explore More Zambian Document Guides &amp; Tools
            </h3>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {Object.values(LANDINGS).filter((l) => l.slug !== slug).map((l) => (
                <button
                  key={l.slug}
                  onClick={() => navigate(`/landing/${l.slug}`)}
                  className="rounded-full border bg-card px-4 py-2 text-sm font-medium transition hover:border-primary/40 hover:shadow-soft"
                >
                  {l.emoji} {l.title}
                </button>
              ))}
            </div>
          </section>
        </article>
      </main>
    </div>
  );
}
