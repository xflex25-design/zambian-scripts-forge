import { useMemo, useState } from "react";
import { MessageCircle, ArrowLeft, ArrowRight, Check, Copy, Download, Loader2, Mic, Pencil, RotateCcw, Save, Sparkles, Undo2, ScanText } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Paper } from "@/components/Paper";
import { Button } from "@/components/Button";
import { DocIcon } from "@/components/DocIcon";
import { getDocType, previewDoc, visibleQuestions, docToText, type Answers, type ZDoc } from "@/lib/documents";
import { generateDocument, improveDocument } from "@/lib/docs";
import { useSpeech } from "@/hooks/use-speech";
import { cn } from "@/lib/utils";
import { navigate, useRoute, matchRoute } from "@/lib/router";
import { useAuth } from "@/lib/auth";
import { saveDocument } from "@/lib/saved";

const IMPROVE = ["More professional", "Shorter", "More confident", "Simpler", "More polite", "Add more detail"];

export function Create() {
  const route = useRoute();
  const match = matchRoute("/create/$type", route.path);
  const type = match?.type ?? "";
  const note = route.search.get("note") ?? undefined;
  const ocrText = route.search.get("ocr") ?? undefined;
  const t = getDocType(type);

  const [answers, setAnswers] = useState<Answers>(ocrText ? { extra: ocrText } : {});
  const [step, setStep] = useState(0);
  const [doc, setDoc] = useState<ZDoc | null>(null);
  const [history, setHistory] = useState<ZDoc[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  const qs = t ? visibleQuestions(t, answers) : [];
  const q = qs[Math.min(step, qs.length - 1)];
  const value = q ? answers[q.id] ?? "" : "";
  const set = (v: string) => setAnswers((a) => ({ ...a, [q.id]: v }));
  const speech = useSpeech((txt) => set((value ? value + " " : "") + txt));
  const preview = useMemo(() => (t ? previewDoc(t, answers) : null), [t, answers]);

  if (!t) {
    return (
      <div className="min-h-screen bg-hero">
        <Header />
        <div className="mx-auto max-w-md px-5 py-20 text-center">
          <h1 className="font-display text-3xl font-bold">Document not found</h1>
          <p className="mt-2 text-muted-foreground">That document type doesn't exist.</p>
          <Button className="mt-6 rounded-2xl bg-gradient-primary" onClick={() => navigate("/")}>Go home</Button>
        </div>
      </div>
    );
  }

  const create = async () => {
    setBusy("Writing your document…");
    try {
      const d = await generateDocument(type, answers, note);
      setDoc(d);
      window.scrollTo({ top: 0 });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const next = (v = value) => {
    if (!v.trim() && !q.optional) return void toast.error("Please answer this question, or go back.");
    if (step >= qs.length - 1) return void create();
    setStep(step + 1);
  };

  const choose = (opt: string) => {
    const a = { ...answers, [q.id]: opt };
    setAnswers(a);
    const n = visibleQuestions(t, a);
    if (step >= n.length - 1) {
      setTimeout(() => createWith(a), 0);
    } else setStep(step + 1);
  };

  const createWith = async (a: Answers) => {
    setBusy("Writing your document…");
    try {
      const d = await generateDocument(type, a, note);
      setDoc(d);
      window.scrollTo({ top: 0 });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  const runImprove = async (instruction: string) => {
    if (!doc) return;
    setBusy(`Making it ${instruction.toLowerCase()}…`);
    try {
      const d = await improveDocument(doc, instruction);
      setHistory((h) => [...h, doc]);
      setDoc(d);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  if (doc) {
    const text = docToText(doc);
    const saveToAccount = async () => {
      if (!user) {
        toast.info("Log in to save this document to your account.");
        navigate("/login");
        return;
      }
      setSaving(true);
      try {
        await saveDocument(doc.subject || t.title, text);
        toast.success("Saved to your account.");
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setSaving(false);
      }
    };
    return (
      <div className="min-h-screen bg-hero">
        <Header />
        <main className="mx-auto max-w-6xl px-5 pb-20">
          <div className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-gradient-primary text-primary-foreground shadow-soft"><Check /></span>
            <h1 className="mt-3 font-display text-3xl font-bold">Your document is ready!</h1>
            <p className="text-sm text-muted-foreground">Personalised using your information.</p>
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="relative">
              {editing ? <Editor doc={doc} onSave={(d) => { setHistory((h) => [...h, doc]); setDoc(d); setEditing(false); }} /> : <Paper doc={doc} className="max-w-[720px]" />}
              {busy && <div className="absolute inset-0 grid place-items-center rounded-lg bg-background/70 backdrop-blur-sm"><span className="flex items-center gap-2 font-medium"><Loader2 className="animate-spin" />{busy}</span></div>}
            </div>
            <aside className="space-y-2.5">
              <Button className="h-12 w-full rounded-2xl bg-gradient-primary" onClick={() => window.print()}><Download /> Download PDF</Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl bg-card" onClick={saveToAccount} disabled={saving} data-testid="create-save-btn">
                {saving ? <Loader2 className="animate-spin" /> : <Save />} {user ? "Save to my account" : "Log in to save"}
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl bg-card" onClick={() => { navigator.clipboard.writeText(text); toast.success("Copied"); }}><Copy /> Copy text</Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl bg-card" onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"); }}>
                <MessageCircle /> Share on WhatsApp
              </Button>
              <Button variant="outline" className="h-11 w-full justify-start rounded-2xl bg-card" onClick={() => setEditing(!editing)}><Pencil /> {editing ? "Cancel edit" : "Edit"}</Button>
              {history.length > 0 && (
                <Button variant="outline" className="h-11 w-full justify-start rounded-2xl bg-card" onClick={() => { setDoc(history[history.length - 1] ?? doc); setHistory((h) => h.slice(0, -1)); }}><Undo2 /> Undo last change</Button>
              )}
              <div className="rounded-2xl border bg-card p-4">
                <p className="flex items-center gap-2 font-semibold"><Sparkles className="size-4 text-accent" /> Improve</p>
                <p className="text-xs text-muted-foreground">Your facts stay the same.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {IMPROVE.map((i) => (
                    <button key={i} disabled={!!busy} onClick={() => runImprove(i)} className="rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground hover:bg-primary hover:text-primary-foreground disabled:opacity-50">{i}</button>
                  ))}
                </div>
              </div>
              <Button variant="ghost" className="w-full rounded-2xl" onClick={() => { setDoc(null); setStep(0); setHistory([]); }}><RotateCcw /> Change my answers</Button>
              <Button variant="ghost" className="w-full rounded-2xl" onClick={() => navigate("/")}>Create another document</Button>
            </aside>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 lg:grid-cols-2">
        <section>
          <button onClick={() => (step ? setStep(step - 1) : window.history.back())} className="flex items-center gap-2 text-sm font-semibold">
            <ArrowLeft className="size-4" /> {t.title}
          </button>
          <p className="mt-3 text-xs font-medium text-primary">Step {step + 1} of {qs.length}</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-gradient-primary transition-all duration-500" style={{ width: `${((step + 1) / qs.length) * 100}%` }} />
          </div>

          <div key={q.id} className="animate-step-in mt-5 rounded-3xl border bg-card p-5 shadow-soft sm:p-7">
            <DocIcon id={t.id} emoji={t.emoji} className="text-xl" />
            <h1 className="mt-4 font-display text-2xl font-bold">{q.question}</h1>
            {q.help && <p className="mt-1 text-sm text-muted-foreground">{q.help}</p>}

            {q.kind === "choice" ? (
              <div className="mt-5 grid grid-cols-2 gap-2.5">
                {q.options!.map((o) => (
                  <button key={o} onClick={() => choose(o)} className={cn("rounded-2xl border px-3 py-3 text-sm font-semibold transition", value === o ? "border-primary bg-primary text-primary-foreground" : "bg-muted/50 hover:border-primary/40")}>{o}</button>
                ))}
              </div>
            ) : (
              <>
                {q.kind === "textarea" ? (
                  <textarea autoFocus rows={4} value={value} onChange={(e) => set(e.target.value)} placeholder={q.placeholder} className="mt-5 w-full rounded-2xl border bg-background p-3 text-base outline-none focus:border-primary" />
                ) : (
                  <input autoFocus value={value} onChange={(e) => set(e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()} placeholder={q.placeholder} className="mt-5 h-12 w-full rounded-2xl border bg-background px-4 text-base outline-none focus:border-primary" />
                )}
                <Button className="mt-4 h-12 w-full rounded-2xl bg-gradient-primary text-base" onClick={() => next()} disabled={!!busy}>
                  {busy ? <><Loader2 className="animate-spin" /> {busy}</> : step >= qs.length - 1 ? <>Create my document <Sparkles /></> : <>Continue <ArrowRight /></>}
                </Button>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" className="flex-1 rounded-2xl" onClick={speech.toggle}>
                    <Mic className={speech.listening ? "animate-pulse text-destructive" : ""} /> {speech.listening ? "Listening…" : "Tap to speak"}
                  </Button>
                  {q.optional && <Button variant="ghost" className="rounded-2xl" onClick={() => next("skip")}>Skip</Button>}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="lg:pt-16">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Check className="size-4 text-primary" /> Your document <span className="font-normal text-muted-foreground">(live preview)</span></p>
          {preview && <Paper doc={preview} live className="max-w-[560px] origin-top" />}
        </section>
      </main>
    </div>
  );
}

function Editor({ doc, onSave }: { doc: ZDoc; onSave: (d: ZDoc) => void }) {
  const [d, setD] = useState(doc);
  const field = "w-full rounded-xl border bg-background p-3 text-sm outline-none focus:border-primary";
  const L = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <label className="block"><span className="mb-1 block text-xs font-semibold text-muted-foreground">{label}</span>{children}</label>
  );
  if (d.text !== undefined)
    return (
      <div className="space-y-3 rounded-3xl border bg-card p-5">
        <textarea rows={24} className={cn(field, "font-doc")} value={d.text} onChange={(e) => setD({ ...d, text: e.target.value })} />
        <Button className="rounded-2xl" onClick={() => onSave(d)}>Save changes</Button>
      </div>
    );
  return (
    <div className="space-y-4 rounded-3xl border bg-card p-5">
      <L label="Your details"><textarea rows={4} className={field} value={d.from.join("\n")} onChange={(e) => setD({ ...d, from: e.target.value.split("\n") })} /></L>
      <L label="Date"><input className={field} value={d.date} onChange={(e) => setD({ ...d, date: e.target.value })} /></L>
      <L label="Recipient"><textarea rows={4} className={field} value={d.to.join("\n")} onChange={(e) => setD({ ...d, to: e.target.value.split("\n") })} /></L>
      <L label="Subject"><input className={field} value={d.subject} onChange={(e) => setD({ ...d, subject: e.target.value })} /></L>
      <L label="Body (leave a blank line between paragraphs)"><textarea rows={12} className={field} value={d.paragraphs.join("\n\n")} onChange={(e) => setD({ ...d, paragraphs: e.target.value.split(/\n\s*\n/) })} /></L>
      <L label="Closing"><input className={field} value={d.closing} onChange={(e) => setD({ ...d, closing: e.target.value })} /></L>
      <Button className="rounded-2xl bg-gradient-primary" onClick={() => onSave({ ...d, paragraphs: d.paragraphs.filter((p) => p.trim()) })}>Save changes</Button>
    </div>
  );
}
