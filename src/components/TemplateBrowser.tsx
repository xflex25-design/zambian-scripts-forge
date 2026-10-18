import { useState, useMemo } from "react";
import {
  FileText,
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  Copy,
  Download,
  GraduationCap,
  Briefcase,
  ScrollText,
  School,
  Building2,
  Receipt,
  Layers,
} from "lucide-react";
import { Button } from "@/components/Button";
import { toast } from "sonner";
import { downloadDocAsTextPdf } from "@/lib/pdf";

export type TemplateItem = {
  id: string;
  typeId: string;
  category: "all" | "student" | "employment" | "cv" | "school" | "business";
  categoryLabel: string;
  title: string;
  shortDesc: string;
  badge: string;
  timeEstimate: string;
  inclusions: string[];
  icon: typeof GraduationCap;
  sampleLetter: {
    from: string[];
    date: string;
    to: string[];
    salutation: string;
    subject: string;
    paragraphs: string[];
    closing: string;
    name: string;
    footer: string[];
    isText?: boolean;
    rawText?: string;
  };
};

export const TEMPLATES: TemplateItem[] = [
  {
    id: "helsb-appeal-second-selection",
    typeId: "helsb",
    category: "student",
    categoryLabel: "HELSB & Student Loans",
    title: "HELSB Student Loan Appeal (100% / Second Selection)",
    shortDesc: "Official appeal to the Higher Education Loans & Scholarships Board in Lusaka. Formatted with authentic vulnerability grounds, NRC, and attached results.",
    badge: "HELSB Standard Format",
    timeEstimate: "2 mins",
    icon: GraduationCap,
    inclusions: [
      "Addressed to CEO, HELSB Lusaka",
      "Green NRC & Age particulars",
      "Copperbelt / UNZA acceptance space",
      "Authentic peasant farmer / double orphan grounds",
      "Certified credentials enclosure note",
    ],
    sampleLetter: {
      from: [
        "C/O Mazimba Justine,",
        "Kitwe Baptist Church,",
        "P.O. Box 158,",
        "KITWE.",
      ],
      date: "9th November, 2024.",
      to: [
        "The Chief Executive Officer,",
        "Higher Education Loans and Scholarships Board,",
        "P.O. Box 320298,",
        "LUSAKA.",
      ],
      salutation: "Dear Sir/Madam,",
      subject: "RE: LETTER OF APPEAL TO BE CONSIDERED FOR A 100% STUDENT LOAN IN THE SECOND SELECTION",
      paragraphs: [
        "Reference is made to the above captioned matter. I hereby formally appeal to your able office to be considered for a 100% student loan as instructed by your Board.",
        "I am a Zambian citizen, male aged twenty-two (22) years, and the holder of Green National Registration Card No. 155028/45/1. I completed my senior secondary education and hold a full Grade Twelve (12) certificate with statement of results attached.",
        "I have been offered space at the Copperbelt University to study Bachelor of Science in Economics. However, during the initial selection, my application was not successful.",
        "As stated in my initial submission, both my parents are peasant farmers who have no financial capacity to meet my tuition and accommodation expenses. An opportunity to be considered for this loan will enable me to realize my educational aspirations and contribute to national development.",
        "Attached to this letter are copies of my acceptance letter, statement of results, NRC, and relevant supporting credentials for your perusal.",
        "Thanking you in anticipation for your kind consideration. I look forward to your favourable response.",
      ],
      closing: "Yours faithfully,",
      name: "MAZIMBA JUSTINE",
      footer: ["Cell: 0968 472 808 / 0977 805 820"],
    },
  },
  {
    id: "job-application-formal",
    typeId: "job-application",
    category: "employment",
    categoryLabel: "Employment & Jobs",
    title: "Zambian Employment Application Letter",
    shortDesc: "Traditional formal job application letter matching Zambian HR expectations. Suitable for sales assistants, clerks, cashiers, drivers, and teachers.",
    badge: "Zambian HR Standard",
    timeEstimate: "3 mins",
    icon: Briefcase,
    inclusions: [
      "Company / Branch Manager addressing",
      "Advertisement citation & date",
      "Zambian nationality & full Grade 12 certificate",
      "Practical work strengths & attitude",
      "Interview readiness & referee notification",
    ],
    sampleLetter: {
      from: [
        "Tea Estate Secondary School,",
        "P.O. Box 730188,",
        "KAWAMBWA.",
      ],
      date: "20th July, 2024.",
      to: [
        "The Branch Manager,",
        "Zambeef Plc,",
        "P.O. Box 640022,",
        "MANSA.",
      ],
      salutation: "Dear Sir or Madam,",
      subject: "REF: APPLICATION FOR EMPLOYMENT AS A SALES ASSISTANT",
      paragraphs: [
        "With reference to the advertisement that appeared on television and social media dated 15th July, 2024, I wish to apply for employment as a sales assistant in your esteemed company.",
        "I am a twenty-five-year-old Zambian citizen and the holder of National Registration Card No. 247874/77/1. I completed my secondary education and was awarded a full Grade Twelve (12) School Certificate with strong credits in English and Mathematics.",
        "I possess hands-on experience in customer care, stock keeping, and basic cash reconciliation gained through managing retail duties diligently. I am honest, hardworking, and attentive to instructions.",
        "Attached to this letter are copies of my Curriculum Vitae, statement of results, and references for your inspection. I will be ready for an interview whenever called upon.",
        "Thanking you in advance for your kind consideration. I look forward to your favourable response.",
      ],
      closing: "Yours faithfully,",
      name: "NDALIBA STEPHEN",
      footer: ["Cell: 0978 654 560"],
    },
  },
  {
    id: "zambian-curriculum-vitae",
    typeId: "cv",
    category: "cv",
    categoryLabel: "CVs & Resumes",
    title: "Official Zambian Curriculum Vitae (CV)",
    shortDesc: "Complete Zambian CV layout featuring Personal Details (NRC, Nationality, Marital Status, Languages), Education, Experience, and Referees.",
    badge: "Most Recruited CV Layout",
    timeEstimate: "4 mins",
    icon: ScrollText,
    inclusions: [
      "Full Personal Particulars & NRC Number",
      "Academic & Secondary Qualifications table",
      "Professional Training / Diplomas",
      "Key Competences & Personal Attributes",
      "Contactable local Referees with phone numbers",
    ],
    sampleLetter: {
      from: [],
      date: "",
      to: [],
      salutation: "",
      subject: "CURRICULUM VITAE",
      paragraphs: [],
      closing: "",
      name: "",
      footer: [],
      isText: true,
      rawText: `CURRICULUM VITAE

PERSONAL DETAILS
Surname             : Lishomwa
Other Names         : Enock Kalunga
Sex                 : Male
Place of Birth      : Kaoma, Western Province
Date of Birth       : 24th April, 1994
Nationality         : Zambian
Marital Status      : Single
National Reg. Card  : 163557/81/1
Contact Address     : C/O House No. 14, Riverside, Kitwe
Postal Address      : P.O. Box 21168, Kitwe
Cell Phone          : +260 974 420 757 / 0968 997 568
Email Address       : enock.lishomwa@example.com
Languages Spoken    : English, Bemba, Lozi
Religion            : Christian

CAREER OBJECTIVE
Dedicated and trustworthy professional seeking to contribute positive energy, accuracy, and strong organizational skills to your organization.

ACADEMIC QUALIFICATIONS
Period       School                              Achievement
2018 - 2021  Kaoma Secondary School              Full Grade 12 School Certificate
2011 - 2017  Mulamabila Primary School           Grade 7 Certificate

PROFESSIONAL / TERTIARY QUALIFICATIONS
Period       Institution                         Qualification
2022 - 2023  Technical & Vocational College      Certificate in Business Studies & IT

WORK EXPERIENCE
Period: 2023 - Present
Role: Stores & Accounts Assistant
Organisation: Adventure Group Zambia Ltd
Key Responsibilities:
- Reconciling daily stock records and cash receipts
- Preparing verification summaries for management
- Upholding customer service standards and maintaining workplace hygiene

SKILLS & PERSONAL ATTRIBUTES
- Honest, reliable, and attentive to detail
- Ability to work under minimum supervision with high integrity
- Computer literate (Microsoft Word, Excel, Email communications)
- Excellent verbal and written English communication

REFEREES
1. Mr. Moses Chika, Senior HR Officer, High Court of Zambia, Cell: +260 977 123 456
2. Mr. Chavwanga Vitalis, Head Teacher, Kaoma Secondary School, Cell: +260 968 456 789
3. Available upon request`,
    },
  },
  {
    id: "school-admission-letter",
    typeId: "school-letter",
    category: "school",
    categoryLabel: "School Admissions",
    title: "School Place Application & Transfer Letter",
    shortDesc: "Polite formal request from a parent or guardian to The Head Teacher applying for Grade 1, 8, or 10 admission or school transfer.",
    badge: "Ministry of Education Standard",
    timeEstimate: "2 mins",
    icon: School,
    inclusions: [
      "Addressed to The Head Teacher",
      "Pupil particulars, past school, and grade level",
      "Honest reasons for relocation / transfer",
      "Statement of previous results and transfer slip",
      "Parent / Guardian contact details",
    ],
    sampleLetter: {
      from: [
        "Plot No. 45, Kabwata Site and Service,",
        "P.O. Box 30122,",
        "LUSAKA.",
      ],
      date: "12th January, 2025.",
      to: [
        "The Head Teacher,",
        "Kabulonga Boys Secondary School,",
        "P.O. Box 31004,",
        "LUSAKA.",
      ],
      salutation: "Dear Sir/Madam,",
      subject: "RE: APPLICATION FOR A GRADE 10 PLACE FOR MY SON — CHANDA BANDA",
      paragraphs: [
        "Reference is made to the above captioned matter. I am writing to respectfully apply for a Grade 10 placement for my son, Chanda Banda, for the upcoming academic term.",
        "My son recently sat for his Junior Secondary School Leaving Examination (Grade 9) at Kamwala Secondary School and passed with a Division One aggregate score of 420 marks.",
        "Due to our family relocation from Kamwala to Kabwata, your school is now our nearest designated institution. Kabulonga Boys has an admirable tradition of discipline and academic excellence, and I am confident my son will thrive under your guidance.",
        "Enclosed with this letter are copies of his Grade 9 examination results slip, transfer letter, and birth certificate for your verification.",
        "Thanking you in anticipation for your consideration. I look forward to your favourable response.",
      ],
      closing: "Yours faithfully,",
      name: "MRS. MUTALE BANDA",
      footer: ["Cell: 0977 554 432"],
    },
  },
  {
    id: "official-government-letter",
    typeId: "other-letter",
    category: "employment",
    categoryLabel: "Official Letters",
    title: "Official Government & Council Submission",
    shortDesc: "High-level administrative letter formatted for Permanent Secretaries, Town Clerks, Early Retirement requests, and Council applications.",
    badge: "Public Service Protocol",
    timeEstimate: "3 mins",
    icon: Building2,
    inclusions: [
      "Executive addressing (Permanent Secretary / Town Clerk)",
      "Formal civil service etiquette",
      "Legal & administrative referencing",
      "Carbon Copy (C.C.) distribution list",
    ],
    sampleLetter: {
      from: [
        "C/O House No. 12,",
        "Sianjalika Road, Woodlands,",
        "LUSAKA.",
      ],
      date: "8th May, 2024.",
      to: [
        "The Permanent Secretary,",
        "Ministry of Local Government and Rural Development,",
        "P.O. Box 50027,",
        "LUSAKA.",
      ],
      salutation: "Dear Sir/Madam,",
      subject: "RE: FORMAL SUBMISSION OF PETITION AND REQUEST FOR ADMINISTRATIVE REVIEW",
      paragraphs: [
        "I wish to refer to your correspondence dated 30th April, 2024 concerning the above captioned subject matter.",
        "I hereby humbly submit this formal communication for your favourable review and consideration in the public and institutional interest.",
        "Having served dedicatedly within the public sector for over twenty-five (25) years, I uphold the highest standard of procedural compliance and respectfully request your intervention regarding the highlighted resolutions.",
        "Attached hereto are all relevant supporting documentation and prior administrative clearances for your appraisal.",
        "I remain in the service of the nation and look forward to your guidance.",
      ],
      closing: "Yours faithfully,",
      name: "JUSTICE PHILLIP MUSONDA",
      footer: [
        "Cell: 0979 123 456",
        "C.C. The Director of Human Resources, Public Service Commission, LUSAKA.",
      ],
    },
  },
  {
    id: "zra-business-quotation",
    typeId: "business",
    category: "business",
    categoryLabel: "Business & Invoices",
    title: "Zambian Kwacha (ZMW) Tax Invoice & Quotation",
    shortDesc: "Commercial quotation and tax invoice format in Zambian Kwacha (K). Includes TPIN, itemised table, VAT breakdown, and local banking details.",
    badge: "ZRA Tax Aligned",
    timeEstimate: "3 mins",
    icon: Receipt,
    inclusions: [
      "Quotation / Invoice sequence numbering",
      "Company TPIN & address headers",
      "Itemised Quantity & Unit Rate calculations in ZMW",
      "16% VAT breakdown & Total Balance Due",
      "Zanaco, Stanbic, or Mobile Money payment details",
    ],
    sampleLetter: {
      from: [],
      date: "",
      to: [],
      salutation: "",
      subject: "TAX INVOICE — INV-0084",
      paragraphs: [],
      closing: "",
      name: "",
      footer: [],
      isText: true,
      rawText: `===============================================================
                       TAX INVOICE
===============================================================
INVOICE NO   : INV-2025-0084
DATE         : 18th October, 2025
DUE DATE     : 1st November, 2025

ISSUED BY:
Banda General Hardware & Construction Supplies
Plot 104, Lumumba Road, Light Industrial Area,
P.O. Box 32410, LUSAKA.
TPIN: 1002345678 | Cell: +260 977 889 900
Email: sales@bandahardware.co.zm

BILLED TO:
Chanda Lodges & Conference Centre
Stand No. 12, Mosi-oa-Tunya Road,
LIVINGSTONE.
Attn: The Procurement Manager

---------------------------------------------------------------
ITEM  DESCRIPTION                     QTY   UNIT (ZMW)  AMOUNT (ZMW)
---------------------------------------------------------------
1.    Dangote Portland Cement 50kg    50    K 165.00    K  8,250.00
2.    Deformed High-Tensile Steel 12mm 25    K 195.00    K  4,875.00
3.    River Sand (Tri-Axle Load 20T)   1    K 3,500.00  K  3,500.00
4.    Site Delivery & Offloading       1    K 1,200.00  K  1,200.00
---------------------------------------------------------------
SUBTOTAL                                                K 17,825.00
VAT (16% Standard Rate)                                 K  2,852.00
---------------------------------------------------------------
TOTAL PAYABLE (ZMW)                                     K 20,677.00
===============================================================

PAYMENT TERMS & BANK DETAILS:
Bank Name      : Zanaco Bank Plc
Account Name   : Banda General Hardware
Account Number : 0145892300192
Branch         : Cairo Road Business Centre, Lusaka
Sort Code      : 010014
Airtel Money   : 0977 889 900 (Banda Hardware Merchant)

Notes: All goods remain the property of Banda General Hardware until paid in full.
Thank you for doing business with us!`,
    },
  },
];

export function TemplateBrowser({ onSelectTemplate }: { onSelectTemplate: (typeId: string) => void }) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  const categories = [
    { id: "all", label: "All Templates" },
    { id: "student", label: "HELSB & Appeals" },
    { id: "employment", label: "Job Applications" },
    { id: "cv", label: "Curriculum Vitae" },
    { id: "school", label: "School & Pupils" },
    { id: "business", label: "Business & Invoices" },
  ];

  const filtered = useMemo(() => {
    return TEMPLATES.filter((t) => {
      const matchesCategory = activeCategory === "all" || t.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === "" ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.inclusions.some((inc) => inc.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleCopyText = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Sample template copied to clipboard!");
  };

  const handleDownloadPdf = (content: string, title: string) => {
    try {
      downloadDocAsTextPdf(content, title);
      toast.success("Sample PDF downloaded successfully!");
    } catch {
      toast.error("Could not download sample PDF.");
    }
  };

  return (
    <section className="mt-16 rounded-[2.5rem] border bg-card/60 p-6 backdrop-blur-md shadow-soft sm:p-10">
      {/* Header & Title */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Layers className="size-3.5" /> Template Browser
          </span>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-4xl text-foreground">
            Explore Zambian Document Formats
          </h2>
          <p className="mt-1 text-sm text-muted-foreground max-w-xl">
            Browse through real Zambian document blueprints — including authentic HELSB student appeals, job applications, Curriculum Vitae, and business invoices.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates (e.g. HELSB, CV)..."
            className="h-10 w-full rounded-2xl border bg-background pl-10 pr-4 text-xs outline-none focus:border-primary transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Pills */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-border/50 pb-4">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
              activeCategory === cat.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "bg-secondary text-secondary-foreground hover:bg-primary/15"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Template Cards Grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="group relative flex flex-col justify-between rounded-3xl border bg-background p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-paper"
            >
              <div>
                {/* Card Top: Icon & Badge */}
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-primary transition group-hover:scale-105">
                    <Icon className="size-5" />
                  </span>
                  <div className="flex flex-col items-end gap-1">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      {item.badge}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" /> {item.timeEstimate}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <h3 className="mt-4 font-display text-lg font-bold text-foreground group-hover:text-primary transition">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {item.shortDesc}
                </p>

                {/* Miniature Realistic Paper Thumbnail */}
                <div
                  onClick={() => setPreviewTemplate(item)}
                  className="mt-4 cursor-pointer overflow-hidden rounded-2xl border border-border/80 bg-paper p-3 text-[10px] leading-snug text-paper-ink shadow-inner transition hover:border-primary/40 hover:bg-paper/90"
                  title="Click to preview full document sample"
                >
                  <div className="flex items-center justify-between pb-1.5 border-b border-border/40 text-[9px] font-semibold text-muted-foreground">
                    <span className="truncate max-w-[140px] uppercase tracking-wider">
                      {item.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1 text-primary">
                      <Eye className="size-3" /> Preview
                    </span>
                  </div>

                  {item.sampleLetter.isText ? (
                    <div className="mt-2 font-doc line-clamp-4 text-[10px] opacity-80 whitespace-pre-wrap">
                      {item.sampleLetter.rawText?.slice(0, 200)}…
                    </div>
                  ) : (
                    <div className="mt-2 space-y-1 font-doc opacity-85">
                      <div className="text-right text-[9px] text-muted-foreground">
                        {item.sampleLetter.from[0]} • {item.sampleLetter.date}
                      </div>
                      <div className="font-semibold text-[9px] text-foreground">
                        {item.sampleLetter.to[0]}
                      </div>
                      <div className="font-bold underline text-[9px] text-primary truncate">
                        {item.sampleLetter.subject}
                      </div>
                      <p className="line-clamp-2 text-[9px] text-muted-foreground italic">
                        "{item.sampleLetter.paragraphs[0]}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Inclusions Checklist */}
                <div className="mt-4 space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Format Inclusions:
                  </p>
                  {item.inclusions.slice(0, 3).map((inc, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs text-foreground/80">
                      <Check className="size-3.5 shrink-0 text-primary" />
                      <span className="truncate">{inc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs font-semibold gap-1.5"
                  onClick={() => setPreviewTemplate(item)}
                >
                  <Eye className="size-3.5" /> View Sample
                </Button>
                <Button
                  size="sm"
                  className="flex-1 rounded-xl bg-gradient-primary text-xs font-semibold gap-1 text-primary-foreground"
                  onClick={() => onSelectTemplate(item.typeId)}
                >
                  Use Template <ArrowRight className="size-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center">
          <Search className="mx-auto size-8 text-muted-foreground" />
          <h3 className="mt-3 font-display text-base font-bold">No templates match "{searchQuery}"</h3>
          <p className="mt-1 text-xs text-muted-foreground">Try searching for HELSB, CV, job, or invoice.</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-xl"
            onClick={() => {
              setSearchQuery("");
              setActiveCategory("all");
            }}
          >
            Reset Filters
          </Button>
        </div>
      )}

      {/* Full Sample Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="w-full max-w-2xl my-6 rounded-3xl border bg-card p-6 shadow-paper flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {previewTemplate.badge}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {previewTemplate.categoryLabel}
                  </span>
                </div>
                <h3 className="mt-1 font-display text-xl font-bold sm:text-2xl">
                  {previewTemplate.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewTemplate(null)}
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Document Body Sample */}
            <div className="mt-4 flex-1 overflow-y-auto rounded-2xl border bg-paper p-6 font-doc text-sm leading-relaxed text-paper-ink shadow-inner whitespace-pre-wrap select-text">
              {previewTemplate.sampleLetter.isText ? (
                previewTemplate.sampleLetter.rawText
              ) : (
                <div className="space-y-4">
                  {/* Sender block top right */}
                  <div className="ml-auto w-fit text-right">
                    {previewTemplate.sampleLetter.from.map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                    <div className="mt-2 font-medium">{previewTemplate.sampleLetter.date}</div>
                  </div>

                  {/* Recipient block */}
                  <div className="font-semibold">
                    {previewTemplate.sampleLetter.to.map((l, i) => (
                      <div key={i}>{l}</div>
                    ))}
                  </div>

                  {/* Salutation */}
                  <p>{previewTemplate.sampleLetter.salutation}</p>

                  {/* Subject */}
                  <p className="font-bold underline underline-offset-2">
                    {previewTemplate.sampleLetter.subject}
                  </p>

                  {/* Paragraphs */}
                  <div className="space-y-3 text-justify">
                    {previewTemplate.sampleLetter.paragraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                  </div>

                  {/* Closing */}
                  <div className="pt-2">
                    <p>{previewTemplate.sampleLetter.closing}</p>
                    <p className="mt-4 italic text-primary font-semibold">
                      {previewTemplate.sampleLetter.name}
                    </p>
                    <p className="font-semibold uppercase tracking-wider text-xs">
                      {previewTemplate.sampleLetter.name}
                    </p>
                    {previewTemplate.sampleLetter.footer.map((f, i) => (
                      <p key={i} className="text-xs text-muted-foreground mt-1">
                        {f}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1 text-xs"
                  onClick={() => {
                    const text = previewTemplate.sampleLetter.isText
                      ? previewTemplate.sampleLetter.rawText || ""
                      : [
                          previewTemplate.sampleLetter.from.join("\n"),
                          previewTemplate.sampleLetter.date,
                          "",
                          previewTemplate.sampleLetter.to.join("\n"),
                          "",
                          previewTemplate.sampleLetter.salutation,
                          previewTemplate.sampleLetter.subject,
                          "",
                          previewTemplate.sampleLetter.paragraphs.join("\n\n"),
                          "",
                          previewTemplate.sampleLetter.closing,
                          previewTemplate.sampleLetter.name,
                          previewTemplate.sampleLetter.footer.join("\n"),
                        ].join("\n");
                    handleCopyText(text);
                  }}
                >
                  <Copy className="size-3.5" /> Copy Sample
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl gap-1 text-xs"
                  onClick={() => {
                    const text = previewTemplate.sampleLetter.isText
                      ? previewTemplate.sampleLetter.rawText || ""
                      : [
                          previewTemplate.sampleLetter.from.join("\n"),
                          previewTemplate.sampleLetter.date,
                          "",
                          previewTemplate.sampleLetter.to.join("\n"),
                          "",
                          previewTemplate.sampleLetter.salutation,
                          previewTemplate.sampleLetter.subject,
                          "",
                          previewTemplate.sampleLetter.paragraphs.join("\n\n"),
                          "",
                          previewTemplate.sampleLetter.closing,
                          previewTemplate.sampleLetter.name,
                          previewTemplate.sampleLetter.footer.join("\n"),
                        ].join("\n");
                    handleDownloadPdf(text, previewTemplate.title);
                  }}
                >
                  <Download className="size-3.5 text-primary" /> Download Sample PDF
                </Button>
              </div>

              <Button
                size="sm"
                className="rounded-xl bg-gradient-primary gap-1.5 font-semibold text-primary-foreground ml-auto"
                onClick={() => {
                  const type = previewTemplate.typeId;
                  setPreviewTemplate(null);
                  onSelectTemplate(type);
                }}
              >
                Use this template <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
