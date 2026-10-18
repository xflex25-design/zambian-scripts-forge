import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Loader2,
  Trash2,
  Plus,
  Copy,
  Download,
  Pencil,
  Search,
  MessageCircle,
  X,
  Save,
  RefreshCw,
  Clock,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { listDocuments, deleteDocument, updateDocument, type SavedDoc } from "@/lib/saved";
import { navigate } from "@/lib/router";
import { downloadDocAsTextPdf } from "@/lib/pdf";

export function Account() {
  const { user, loading } = useAuth();
  const [docs, setDocs] = useState<SavedDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modal / View & Edit states
  const [activeDoc, setActiveDoc] = useState<SavedDoc | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "az">("newest");

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [loading, user]);

  const fetchDocs = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    try {
      const data = await listDocuments();
      setDocs(data);
      if (isManualRefresh) toast.success("Documents refreshed.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoadingDocs(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocs();
    }
  }, [user]);

  const openView = (d: SavedDoc) => {
    setActiveDoc(d);
    setIsEditing(false);
    setEditTitle(d.title);
    setEditContent(d.content);
  };

  const openEdit = (d: SavedDoc) => {
    setActiveDoc(d);
    setIsEditing(true);
    setEditTitle(d.title);
    setEditContent(d.content);
  };

  const handleSaveEdit = async () => {
    if (!activeDoc) return;
    const cleanTitle = editTitle.trim();
    const cleanContent = editContent.trim();

    if (!cleanTitle) {
      toast.error("Document title cannot be empty.");
      return;
    }
    if (!cleanContent) {
      toast.error("Document content cannot be empty.");
      return;
    }

    setSavingEdit(true);
    try {
      await updateDocument(activeDoc.id, cleanTitle, cleanContent);
      const updated: SavedDoc = {
        ...activeDoc,
        title: cleanTitle,
        content: cleanContent,
      };

      setDocs((prev) => prev.map((d) => (d.id === activeDoc.id ? updated : d)));
      setActiveDoc(updated);
      setIsEditing(false);
      toast.success("Document updated successfully.");
    } catch (e) {
      toast.error("Failed to update document: " + (e as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await deleteDocument(id);
      setDocs((d) => d.filter((x) => x.id !== id));
      if (activeDoc?.id === id) setActiveDoc(null);
      toast.success("Document deleted.");
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const handleDownloadPdf = (content: string, title: string) => {
    try {
      downloadDocAsTextPdf(content, title);
      toast.success("PDF downloaded successfully!");
    } catch (e) {
      toast.error("Failed to generate PDF: " + (e as Error).message);
    }
  };

  const handleDownloadTxt = (content: string, title: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/[^a-zA-Z0-9_\-\s]/g, "").trim() || "document"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Text file downloaded.");
  };

  const filteredDocs = useMemo(() => {
    let result = [...docs];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) => d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
      );
    }
    result.sort((a, b) => {
      if (sortBy === "az") return a.title.localeCompare(b.title);
      const timeA = new Date(a.created_at).getTime();
      const timeB = new Date(b.created_at).getTime();
      if (sortBy === "oldest") return timeA - timeB;
      return timeB - timeA;
    });
    return result;
  }, [docs, searchQuery, sortBy]);

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
      <main className="mx-auto max-w-5xl px-5 pb-24 pt-4">
        {/* Top Account Overview Banner */}
        <div className="rounded-3xl border bg-card p-6 shadow-soft md:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl font-bold sm:text-3xl">Saved Documents</h1>
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                  {docs.length} {docs.length === 1 ? "document" : "documents"}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{user.email}</span>
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                className="rounded-2xl bg-card gap-1.5"
                onClick={() => fetchDocs(true)}
                disabled={refreshing}
              >
                <RefreshCw className={`size-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button
                className="rounded-2xl bg-gradient-primary gap-1.5 font-semibold"
                onClick={() => navigate("/")}
              >
                <Plus className="size-4" /> Create document
              </Button>
            </div>
          </div>

          {/* Search and Sort Toolbar */}
          {docs.length > 0 && (
            <div className="mt-6 flex flex-col gap-3 pt-5 border-t border-border/50 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title or keyword…"
                  className="h-10 w-full rounded-2xl border bg-background pl-10 pr-4 text-xs outline-none focus:border-primary transition"
                />
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "az")}
                  className="h-9 rounded-xl border bg-background px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="az">Alphabetical (A-Z)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        {loadingDocs ? (
          <div className="mt-16 grid place-items-center">
            <Loader2 className="size-7 animate-spin text-primary" />
            <p className="mt-2 text-xs text-muted-foreground">Loading your saved documents…</p>
          </div>
        ) : docs.length === 0 ? (
          <div className="mt-10 rounded-3xl border bg-card p-10 text-center shadow-soft sm:p-14">
            <span className="mx-auto grid size-16 place-items-center rounded-3xl bg-secondary text-primary">
              <FileText className="size-8" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold">No saved documents yet</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Create a formal letter, job application, CV, or HELSB appeal and click "Save to my account" to access it here anytime.
            </p>
            <Button
              className="mt-6 rounded-2xl bg-gradient-primary px-6"
              onClick={() => navigate("/")}
            >
              <Plus className="size-4" /> Create your first document
            </Button>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="mt-10 rounded-3xl border bg-card p-10 text-center shadow-soft">
            <Search className="mx-auto size-8 text-muted-foreground" />
            <h2 className="mt-3 font-display text-lg font-bold">No matching documents</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No documents match "{searchQuery}". Try a different keyword.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4 rounded-xl"
              onClick={() => setSearchQuery("")}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredDocs.map((d) => {
              const wordCount = d.content.trim().split(/\s+/).filter(Boolean).length;
              return (
                <div
                  key={d.id}
                  className="group flex flex-col justify-between rounded-3xl border bg-card p-5 shadow-soft transition hover:border-primary/40 hover:shadow-paper"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="grid size-10 place-items-center rounded-2xl bg-secondary text-primary">
                        <FileText className="size-5" />
                      </span>
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openEdit(d)}
                          className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                          title="Edit document"
                          aria-label="Edit"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          onClick={() => remove(d.id, d.title)}
                          className="rounded-full p-1.5 text-destructive hover:bg-destructive/10 transition"
                          title="Delete document"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="mt-3 line-clamp-2 font-display text-base font-bold text-foreground">
                      {d.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 font-doc text-xs leading-relaxed text-muted-foreground">
                      {d.content}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(d.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>{wordCount} words</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl bg-card text-xs font-semibold gap-1"
                        onClick={() => openView(d)}
                      >
                        <Eye className="size-3.5" /> View
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-xl bg-primary text-primary-foreground text-xs font-semibold gap-1"
                        onClick={() => handleDownloadPdf(d.content, d.title)}
                      >
                        <Download className="size-3.5" /> PDF
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Document View & Edit Modal */}
      {activeDoc && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => {
            if (!savingEdit) setActiveDoc(null);
          }}
        >
          <div
            className="w-full max-w-3xl my-6 rounded-3xl border bg-card p-6 shadow-paper flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-border/60">
              <div className="flex-1">
                {isEditing ? (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">
                      Document Title
                    </label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-10 w-full rounded-xl border bg-background px-3 font-display text-lg font-bold outline-none focus:border-primary"
                      placeholder="e.g. Job Application Letter"
                    />
                  </div>
                ) : (
                  <div>
                    <h2 className="font-display text-xl font-bold sm:text-2xl">
                      {activeDoc.title}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        Created:{" "}
                        {new Date(activeDoc.created_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        {activeDoc.content.trim().split(/\s+/).filter(Boolean).length} words
                      </span>
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl gap-1 text-xs"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                )}
                <button
                  onClick={() => setActiveDoc(null)}
                  className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="mt-4 flex-1 overflow-y-auto py-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-semibold">Edit Content (Plain Text with Zambian Format)</span>
                    <span>Separate paragraphs with empty lines</span>
                  </div>
                  <textarea
                    rows={18}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full rounded-2xl border bg-background p-4 font-doc text-sm leading-relaxed outline-none focus:border-primary transition"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border bg-background p-5 font-doc text-sm leading-relaxed whitespace-pre-wrap select-text">
                  {activeDoc.content}
                </div>
              )}
            </div>

            {/* Modal Footer Actions */}
            <div className="mt-4 pt-4 border-t border-border/60 flex flex-wrap items-center justify-between gap-2.5">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl"
                    disabled={savingEdit}
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(activeDoc.title);
                      setEditContent(activeDoc.content);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-xl bg-gradient-primary gap-1.5 font-semibold"
                    disabled={savingEdit}
                    onClick={handleSaveEdit}
                  >
                    {savingEdit ? <Loader2 className="animate-spin size-4" /> : <Save className="size-4" />}
                    Save changes
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs font-semibold"
                      onClick={() => {
                        navigator.clipboard.writeText(activeDoc.content);
                        toast.success("Document text copied to clipboard!");
                      }}
                    >
                      <Copy className="size-3.5" /> Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs font-semibold"
                      onClick={() => handleDownloadPdf(activeDoc.content, activeDoc.title)}
                    >
                      <Download className="size-3.5 text-primary" /> Download as PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs"
                      onClick={() => handleDownloadTxt(activeDoc.content, activeDoc.title)}
                    >
                      Download .txt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                      onClick={() => {
                        window.open(
                          `https://wa.me/?text=${encodeURIComponent(activeDoc.content)}`,
                          "_blank"
                        );
                      }}
                    >
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-xl text-xs ml-auto"
                    onClick={() => setActiveDoc(null)}
                  >
                    Done
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
