import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { DocIcon } from "@/components/DocIcon";
import { navigate, useRoute, matchRoute } from "@/lib/router";
import { useAuth } from "@/lib/auth";

type LandingContent = {
  slug: string;
  docId?: string;
  emoji: string;
  title: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  sections: { heading: string; body: string }[];
  cta: string;
  ctaLink: string;
};

const LANDINGS: Record<string, LandingContent> = {
  helsb: {
    slug: "helsb",
    docId: "helsb",
    emoji: "🎓",
    title: "HELSB Appeal Letter",
    h1: "HELSB Appeal Letter — Sample & Format for Zambia",
    metaTitle: "Zambian HELSB Appeal Letter Sample & Format | Zalemba",
    metaDescription: "Write a HELSB appeal letter for a student loan in Zambia. Free sample and format — answer a few questions and get a ready-to-send letter addressed to HELSB.",
    intro: "The Higher Education Loans and Scholarships Board (HELSB) provides student loans for tuition and other expenses. If your application was declined or you need to appeal, a well-written letter can make a difference.",
    sections: [
      {
        heading: "What to include in your HELSB appeal letter",
        body: "Your full name, address, phone number, NRC number, the programme and university you have been accepted to, the loan percentage you are requesting (100%, 75%, or 50%), and a sincere explanation of your family's financial situation. Mention any supporting documents you are attaching, such as death certificates, payslips, or Grade 12 results.",
      },
      {
        heading: "How to address the letter",
        body: "Address your letter to: The Chief Executive Officer, Higher Education Loans and Scholarships Board, P.O. Box 320298, LUSAKA. Use 'Dear Sir/Madam,' and close with 'Yours faithfully,' followed by your full name and phone number.",
      },
      {
        heading: "Tips for a strong appeal",
        body: "Be honest about your family situation. If a parent is late, say so. If your parents are alive but cannot afford the fees, explain what they do and why they cannot help. Keep your letter clear and respectful. Don't exaggerate — HELSB verifies information.",
      },
    ],
    cta: "Create your HELSB letter now",
    ctaLink: "/create/helsb",
  },
  "job-application": {
    slug: "job-application",
    docId: "job-application",
    emoji: "💼",
    title: "Job Application Letter",
    h1: "Zambia Job Application Letter — Sample & Format",
    metaTitle: "Zambia Job Application Letter Sample & Format | Zalemba",
    metaDescription: "Write a professional job application letter in the correct Zambian format. Answer a few questions and get a ready-to-send letter saved directly to your account.",
    intro: "A well-written job application letter is essential when applying for work in Zambia. Most employers expect a formal letter following the standard Zambian format, even for entry-level positions.",
    sections: [
      {
        heading: "What to include in your job application letter",
        body: "Your full name, address, and phone number at the top. The employer's name and address. A clear subject line starting with 'RE: APPLICATION FOR EMPLOYMENT AS...' Include your education, any work experience, skills, and why you want the job. Close with 'Yours faithfully,' and your name.",
      },
      {
        heading: "Common mistakes to avoid",
        body: "Don't use American-style cover letters with phrases like 'I am thrilled to apply.' Zambian letters are respectful and humble. Don't forget to mention where you saw the job advert. Always include your phone number so the employer can contact you.",
      },
      {
        heading: "What if I have no work experience?",
        body: "Focus on your skills, attitude, and willingness to learn. Mention any informal experience like helping at a family shop or volunteering. Employers in Zambia value honesty and a strong work ethic over exaggerated claims.",
      },
    ],
    cta: "Create your job application letter",
    ctaLink: "/create/job-application",
  },
  cv: {
    slug: "cv",
    docId: "cv",
    emoji: "📄",
    title: "CV Generator",
    h1: "Zambia CV Generator — Create Your CV Online",
    metaTitle: "Zambian CV Generator & Maker — Free CV Template | Zalemba",
    metaDescription: "Create a professional CV in the standard Zambian format. Answer simple questions and download your CV in minutes saved to your account.",
    intro: "A professional CV (Curriculum Vitae) is your first chance to make an impression on a potential employer. In Zambia, CVs follow a standard format with personal details, education, work experience, skills, and referees.",
    sections: [
      {
        heading: "What a Zambian CV should include",
        body: "Start with 'CURRICULUM VITAE' at the top, followed by your name and contact details. Include sections for PERSONAL DETAILS (date of birth, sex, nationality, NRC, languages), CAREER OBJECTIVE, EDUCATION BACKGROUND, WORK EXPERIENCE, SKILLS, and REFEREES. If you don't have referees, write 'Available on request.'",
      },
      {
        heading: "Tips for a strong CV",
        body: "List your most recent education and experience first. Be specific about what you did at each job. Include languages you speak — this is valued in Zambia. Keep your CV to one or two pages. Make sure your phone number is correct so employers can reach you.",
      },
      {
        heading: "No work experience yet?",
        body: "That's fine. Focus on your education, skills, and any informal experience. Mention volunteer work, helping at a family business, or community involvement. Everyone starts somewhere — employers appreciate honesty and potential.",
      },
    ],
    cta: "Create your CV now",
    ctaLink: "/create/cv",
  },
  "image-to-text": {
    slug: "image-to-text",
    emoji: "📷",
    title: "Image to Text Converter",
    h1: "Image to Text Converter — Extract Text from Photos",
    metaTitle: "Image to Text Converter — Free OCR Online | Zalemba",
    metaDescription: "Upload an image or screenshot and extract its text instantly. Free image to text converter with OCR — edit, copy, download, or use the text to create a document.",
    intro: "Our Image to Text converter uses OCR (Optical Character Recognition) technology to read text from photos, screenshots, and images. It works right in your browser — no installation needed.",
    sections: [
      {
        heading: "How it works",
        body: "Upload a JPEG, PNG, or WebP image from your phone or computer. Press 'Extract Text' and the tool reads the text in your image. You can then edit, copy, download, or send the text into Zalemba's document generator.",
      },
      {
        heading: "What images work best",
        body: "Clear, well-lit images with dark text on a light background give the best results. Screenshots of text messages, documents, or forms work well. If the image is blurry or the text is small, try zooming in or retaking the photo in better lighting.",
      },
      {
        heading: "Review your results",
        body: "OCR technology is good but not perfect. Always review the extracted text for spelling mistakes, missing punctuation, or misread characters. You can edit the text directly in the text area before using it.",
      },
    ],
    cta: "Open Image to Text converter",
    ctaLink: "/image-to-text",
  },
};

export function Landing() {
  const route = useRoute();
  const match = matchRoute("/landing/$slug", route.path);
  const slug = match?.slug ?? "";
  const content = LANDINGS[slug];
  const { user } = useAuth();

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
          <h1 className="font-display text-3xl font-bold">Page not found</h1>
          <Button className="mt-6 rounded-2xl bg-gradient-primary" onClick={() => navigate("/")}>Go home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-20">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft className="size-4" /> Back to home
        </button>

        <article className="mt-6">
          <span className="text-4xl">{content.emoji}</span>
          <h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-4xl">{content.h1}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{content.intro}</p>

          <div className="mt-8 rounded-3xl border bg-card p-5 shadow-soft sm:p-7">
            {content.docId && (
              <div className="flex items-center gap-3">
                <DocIcon id={content.docId} emoji={content.emoji} className="size-12" />
                <div>
                  <p className="font-semibold">{content.title}</p>
                  <p className="text-sm text-muted-foreground">Answer a few questions — saved directly to your account</p>
                </div>
              </div>
            )}
            <Button className="mt-4 h-12 w-full rounded-2xl bg-gradient-primary text-base" onClick={() => handleCta(content.ctaLink)}>
              {content.cta} <ArrowRight />
            </Button>
          </div>

          {content.sections.map((s, i) => (
            <section key={i} className="mt-8">
              <h2 className="font-display text-xl font-bold sm:text-2xl">{s.heading}</h2>
              <p className="mt-2 leading-relaxed text-muted-foreground">{s.body}</p>
            </section>
          ))}

          <div className="mt-10 rounded-2xl bg-secondary p-5">
            <p className="flex items-center gap-2 font-semibold">
              <Check className="size-4 text-primary" /> {content.cta}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to save and download your documents anytime.</p>
            <Button className="mt-3 rounded-2xl bg-gradient-primary" onClick={() => handleCta(content.ctaLink)}>
              Get started <ArrowRight />
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
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
        </article>
      </main>
    </div>
  );
}

export { LANDINGS };
