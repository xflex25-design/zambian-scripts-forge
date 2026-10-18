import { useEffect, useState } from "react";
import { FileText, Loader2, Trash2, Plus, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { listDocuments, deleteDocument, type SavedDoc } from "@/lib/saved";
import { navigate } from "@/lib/router";

export function Account() {
  const { user, loading } = useAuth();
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [open, setOpen] = useState<SavedDoc | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user]);

  useEffect(() => {
    if (!user) return;
    listDocuments()
      .then(setDocs)
      .catch((e) => toast.error((e as Error).message))
      .finally(() => setLoadingDocs(false));
  }, [user]);

  const remove = async (id: string) => {
    try {
      await deleteDocument(id);
      setDocs((d) => d.filter((x) => x.id !== id));
      if (open?.id === id) setOpen(null);
      toast.success("Deleted");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center bg-hero">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <Header />
      <main className="mx-auto max-w-4xl px-5 pb-20">
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <div>
            <h1 className="font-display text-3xl font-bold">My documents</h1>
            <p className="text-sm text-muted-foreground">Signed in as {user.email}</p>
          </div>
          <Button className="rounded-2xl bg-gradient-primary" onClick={() => navigate("/")}>
            <Plus className="size-4" /> New document
          </Button>
        </div>

        {loadingDocs ? (
          <div className="mt-16 grid place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>
        ) : docs.length === 0 ? (
          <div className="mt-10 rounded-3xl border bg-card p-10 text-center shadow-soft">
            <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-secondary"><FileText className="size-7 text-primary" /></span>
            <h2 className="mt-4 font-display text-xl font-bold">No saved documents yet</h2>
            <p className="mt-1 text-sm text-muted-foreground">Create a document and tap "Save to my account" to keep it here.</p>
            <Button className="mt-5 rounded-2xl bg-gradient-primary" onClick={() => navigate("/")}>Create a document</Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {docs.map((d) => (
              <div key={d.id} className="rounded-3xl border bg-card p-5 shadow-soft transition hover:shadow-paper">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid size-10 place-items-center rounded-2xl bg-secondary"><FileText className="size-5 text-primary" /></span>
                  <button onClick={() => remove(d.id)} className="rounded-full p-2 text-destructive transition hover:bg-destructive/10" aria-label="Delete">
                    <Trash2 className="size-4" />
                  </button>
                </div>
                <h3 className="mt-3 line-clamp-2 font-semibold">{d.title}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                <Button variant="outline" className="mt-4 w-full rounded-2xl bg-card" onClick={() => setOpen(d)}>Open</Button>
              </div>
            ))}
          </div>
        )}
      </main>

      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setOpen(null)}>
          <div className="w-full max-w-2xl rounded-3xl border bg-card p-6 shadow-paper" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-xl font-bold">{open.title}</h2>
            <pre className="mt-4 max-h-[55vh] overflow-auto whitespace-pre-wrap rounded-2xl border bg-background p-4 font-doc text-sm leading-relaxed">{open.content}</pre>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-2xl bg-card" onClick={() => { navigator.clipboard.writeText(open.content); toast.success("Copied"); }}>
                <Copy className="size-4" /> Copy
              </Button>
              <Button variant="outline" className="rounded-2xl bg-card" onClick={() => {
                const blob = new Blob([open.content], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `${open.title}.txt`; a.click(); URL.revokeObjectURL(url);
              }}>
                <Download className="size-4" /> Download
              </Button>
              <Button variant="ghost" className="ml-auto rounded-2xl" onClick={() => setOpen(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
