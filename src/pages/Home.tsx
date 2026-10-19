import { useState } from "react";
import { ArrowRight, Loader2, Mic, Search, ScanText } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { DocIcon } from "@/components/DocIcon";
import { Button } from "@/components/Button";
import { TemplateBrowser } from "@/components/TemplateBrowser";
import { DOC_TYPES, FINDER } from "@/lib/documents";
import { recommendDocument } from "@/lib/docs";
import { useSpeech } from "@/hooks/use-speech";
import { navigate } from "@/lib/router";
import { useAuth } from "@/lib/auth";

const hero = "https://images.pexels.com/photos/7971558/pexels-photo-7971558.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

export function Home() {
  const [need, setNeed] = useState("");
  const [busy, setBusy] = useState(false);
  const [finder, setFinder] = useState(false);
  const { user } = useAuth();
  const speech = useSpeech((t) => setNeed((v) => (v ? v + " " : "") + t));

  const startCreate = (targetUrl: string) => {
    if (!user) {
      toast.info("Please sign in or create an account to start creating documents.");
      navigate(`/login?redirect=${encodeURIComponent(targetUrl)}`);
      return;
    }
    navigate(targetUrl);
  };

  const go = async () => {
    if (need.trim().length < 3) return setFinder(true);
    setBusy(true);
    try {
      const r = await recommendDocument(need);
      toast.success(`You probably need a ${r.label}`);
      const target = `/create/${r.type}?note=${encodeURIComponent(need)}`;
      startCreate(target);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-6xl px-5 pb-20">
        <section className="grid items-center gap-8 pt-6 md:grid-cols-[1.1fr_0.9fr] md:pt-10">
          <div className="animate-rise">
            <p className="text-sm font-medium text-primary">Useful documents, made simple</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              What document do you need?
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">Answer a few simple questions and we'll create it for you.</p>

            <div className="mt-6 rounded-3xl border bg-card p-3 shadow-soft transition focus-within:border-primary/50 focus-within:shadow-paper focus-within:ring-4 focus-within:ring-primary/10">
              <label className="flex items-start gap-3 px-2 pt-2">
                <Search className="mt-1 size-4 shrink-0 text-muted-foreground" />
                <textarea
                  value={need}
                  onChange={(e) => setNeed(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); go(); } }}
                  rows={2}
                  placeholder="e.g. I want to apply for a job at a shop…"
                  className="w-full resize-none bg-transparent text-base outline-none placeholder:text-muted-foreground"
                />
              </label>
              <div className="mt-2 flex items-center justify-between gap-2">
                <Button variant="secondary" className="rounded-full transition active:scale-95" onClick={speech.toggle}>
                  <Mic className={speech.listening ? "animate-pulse text-destructive" : ""} />
                  {speech.listening ? "Listening…" : "Speak"}
                </Button>
                <Button className="group h-11 rounded-full bg-gradient-primary px-6 transition hover:shadow-paper active:scale-95" onClick={go} disabled={busy}>
                  {busy ? <Loader2 className="animate-spin" /> : null} Continue <ArrowRight className="transition group-hover:translate-x-0.5" />
                </Button>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {["Apply for a job at a bank", "HELSB loan application", "Quotation for my shop"].map((ex) => (
                <button
                  key={ex}
                  onClick={() => setNeed(ex)}
                  className="rounded-full border bg-card/70 px-3 py-1 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground active:scale-95"
                >
                  {ex}
                </button>
              ))}
            </div>
            <button onClick={() => setFinder(true)} className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline">
              <Search className="size-4" /> I don't know what document I need
            </button>
          </div>
          <div className="relative hidden animate-rise [animation-delay:150ms] md:block">
            <img src={hero} alt="A young Zambian woman creating a document on her phone" width={1024} height={1024} className="rounded-[2rem] shadow-paper" />
            <div className="animate-float absolute -left-6 top-10 rounded-2xl bg-card px-4 py-2 text-sm font-medium shadow-soft">✓ Your document is ready</div>
            <div className="animate-float absolute -right-4 bottom-12 rounded-2xl bg-card px-4 py-2 text-sm font-medium shadow-soft [animation-delay:1.5s]">Personalised for you</div>
          </div>
        </section>

        {/* Most Used Quick Actions */}
        <section className="mt-16">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">Most used</p>
          <h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">Popular in Zambia</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            {DOC_TYPES.filter((d) => d.popular).map((d) => (
              <button
                key={d.id}
                onClick={() => startCreate(`/create/${d.id}`)}
                className="group relative overflow-hidden rounded-3xl border bg-card p-4 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-paper active:scale-[0.98] sm:p-5"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-0 transition group-hover:opacity-100" />
                <DocIcon id={d.id} emoji={d.emoji} className="size-12" />
                <span className="mt-3 block font-semibold">{d.title}</span>
                <span className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
                  {d.short} <ArrowRight className="size-4 text-primary opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
                </span>
              </button>
            ))}
            <button
              onClick={() => navigate("/image-to-text")}
              className="group relative overflow-hidden rounded-3xl border bg-card p-4 text-left shadow-soft transition duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-paper active:scale-[0.98] sm:p-5"
            >
              <span className="absolute inset-x-0 top-0 h-1 bg-gradient-primary opacity-0 transition group-hover:opacity-100" />
              <span className="grid size-12 place-items-center rounded-2xl bg-secondary">
                <ScanText className="size-6 text-primary" />
              </span>
              <span className="mt-3 block font-semibold">Image to Text</span>
              <span className="mt-0.5 flex items-center justify-between text-xs text-muted-foreground">
                Extract text from images <ArrowRight className="size-4 text-primary opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
            </button>
          </div>
        </section>

        {/* Template Browser with Interactive Thumbnails and Samples */}
        <TemplateBrowser onSelectTemplate={(typeId) => startCreate(`/create/${typeId}`)} />

        {/* Quick Guide Links */}
        <section className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <a href="#/landing/helsb" className="rounded-2xl border bg-card p-4 text-sm shadow-soft transition hover:border-primary/40 hover:shadow-paper">
            <p className="font-semibold text-primary">HELSB Appeal Letter</p>
            <p className="mt-1 text-xs text-muted-foreground">Sample & format for student loan applications</p>
          </a>
          <a href="#/landing/job-application" className="rounded-2xl border bg-card p-4 text-sm shadow-soft transition hover:border-primary/40 hover:shadow-paper">
            <p className="font-semibold text-primary">Job Application Letter</p>
            <p className="mt-1 text-xs text-muted-foreground">Zambia job application letter sample & format</p>
          </a>
          <a href="#/landing/cv" className="rounded-2xl border bg-card p-4 text-sm shadow-soft transition hover:border-primary/40 hover:shadow-paper">
            <p className="font-semibold text-primary">CV Generator</p>
            <p className="mt-1 text-xs text-muted-foreground">Create a professional Zambian CV online</p>
          </a>
          <a href="#/landing/image-to-text" className="rounded-2xl border bg-card p-4 text-sm shadow-soft transition hover:border-primary/40 hover:shadow-paper">
            <p className="font-semibold text-primary">Image to Text Converter</p>
            <p className="mt-1 text-xs text-muted-foreground">Extract text from photos and screenshots</p>
          </a>
        </section>

        <p className="mt-16 text-center text-xs text-muted-foreground">
          Letters follow the format used in real Zambian applications. Always check your details before sending.
        </p>
      </main>

      {finder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setFinder(false)}>
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-paper" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-bold">What are you trying to do?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Select the option that best describes your situation.</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {FINDER.map((f) => (
                <button
                  key={f.label}
                  onClick={() => {
                    setFinder(false);
                    startCreate(`/create/${f.to}`);
                  }}
                  className="rounded-2xl border bg-muted/50 p-3 text-left transition hover:border-primary/40 hover:bg-secondary"
                >
                  {f.to === "helsb" ? <DocIcon id="helsb" emoji={f.emoji} className="size-9 bg-card" /> : <span className="text-2xl">{f.emoji}</span>}
                  <span className="mt-2 block text-sm font-semibold">{f.label}</span>
                  <span className="text-xs text-muted-foreground">{f.hint}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setFinder(false)} className="mt-4 w-full rounded-2xl border py-2 text-sm font-medium hover:bg-secondary">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
