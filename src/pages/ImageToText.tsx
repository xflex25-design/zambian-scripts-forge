import { useRef, useState } from "react";
import { ArrowLeft, ScanText, Upload, Loader2, Copy, Download, Trash2, RefreshCw, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { DOC_TYPES } from "@/lib/documents";
import { navigate } from "@/lib/router";
import { useAuth } from "@/lib/auth";

export function ImageToText() {
  const { user } = useAuth();
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const onFile = (file: File) => {
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/i)) {
      toast.error("Please upload a JPEG, PNG, or WebP image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setText("");
    };
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  const extract = async () => {
    if (!image) return;
    setBusy(true);
    setProgress(0);
    setText("");
    try {
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker("eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      const { data } = await worker.recognize(image);
      await worker.terminate();
      setText(data.text.trim());
      if (!data.text.trim()) {
        toast.error("No text was found in this image. Try a clearer image.");
      } else {
        toast.success("Text extracted! Please review it for any mistakes.");
      }
    } catch (e) {
      toast.error("Could not extract text. Please try again with a clearer image.");
    } finally {
      setBusy(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    setImage(null);
    setText("");
    setProgress(0);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-3xl px-5 pb-20">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-semibold">
          <ArrowLeft className="size-4" /> Back to home
        </button>

        <div className="mt-5 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-soft">
            <ScanText className="size-7" />
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold sm:text-4xl">Image to Text</h1>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Upload an image or screenshot to extract its text. Edit, copy, or use the extracted text to create a document.
          </p>
        </div>

        {!image && (
          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileRef.current?.click()}
            className="mt-8 cursor-pointer rounded-3xl border-2 border-dashed border-primary/30 bg-card p-8 text-center transition hover:border-primary/50 hover:shadow-soft sm:p-12"
          >
            <Upload className="mx-auto size-12 text-primary" />
            <p className="mt-4 font-semibold">Tap to upload an image</p>
            <p className="mt-1 text-sm text-muted-foreground">JPEG, PNG, or WebP — from your phone or computer</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
            />
          </div>
        )}

        {image && (
          <div className="mt-8 space-y-4">
            <div className="relative overflow-hidden rounded-3xl border bg-card p-4 shadow-soft">
              <img src={image} alt="Uploaded image for text extraction" className="mx-auto max-h-80 rounded-2xl object-contain" />
              <button onClick={clear} className="absolute right-6 top-6 rounded-full bg-background/80 p-2 backdrop-blur transition hover:bg-background">
                <Trash2 className="size-4 text-destructive" />
              </button>
            </div>

            <Button className="h-12 w-full rounded-2xl bg-gradient-primary text-base" onClick={extract} disabled={busy}>
              {busy ? <><Loader2 className="animate-spin" /> Extracting… {progress > 0 && `${progress}%`}</> : <><ScanText /> Extract Text</>}
            </Button>

            {busy && (
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-gradient-primary transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
        )}

        {text && !busy && (
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border bg-card p-5 shadow-soft">
              <div className="mb-3 flex items-center justify-between">
                <p className="font-semibold">Extracted Text</p>
                <p className="text-xs text-muted-foreground">Review for mistakes — OCR isn't perfect</p>
              </div>
              <textarea
                rows={12}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full rounded-2xl border bg-background p-4 font-doc text-sm leading-relaxed outline-none focus:border-primary"
                placeholder="Extracted text will appear here…"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" className="rounded-2xl bg-card" onClick={copy}>
                  {copied ? <Check className="size-4 text-primary" /> : <Copy />} Copy
                </Button>
                <Button variant="outline" className="rounded-2xl bg-card" onClick={download}>
                  <Download /> Download TXT
                </Button>
                <Button variant="outline" className="rounded-2xl bg-card" onClick={clear}>
                  <RefreshCw /> Upload another
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border bg-card p-5 shadow-soft">
              <p className="font-semibold text-primary">Use This Text in Zalemba</p>
              <p className="mt-1 text-sm text-muted-foreground">Send this text into a document to edit and improve it.</p>
              <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {DOC_TYPES.filter((d) => d.popular).map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      const target = `/create/${d.id}?ocr=${encodeURIComponent(text)}`;
                      if (!user) {
                        toast.info("Please sign in or create an account to start creating documents.");
                        navigate(`/login?redirect=${encodeURIComponent(target)}`);
                        return;
                      }
                      navigate(target);
                    }}
                    className="flex items-center justify-between rounded-2xl border bg-muted/50 px-4 py-3 text-sm font-medium transition hover:border-primary/40 hover:bg-secondary"
                  >
                    {d.title}
                    <ArrowRight className="size-4 text-primary" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
