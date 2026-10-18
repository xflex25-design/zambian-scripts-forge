import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type SavedDoc = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
};

const LOCAL_DOCS_KEY = "zalemba_local_documents";

function getLocalDocs(): SavedDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_DOCS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDocs(docs: SavedDoc[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_DOCS_KEY, JSON.stringify(docs));
  } catch {
    // ignore
  }
}

function getLocalSessionUser(): { id: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("zalemba_local_session");
    if (!raw) return null;
    const session = JSON.parse(raw);
    return session?.user ?? null;
  } catch {
    return null;
  }
}

export async function listDocuments(): Promise<SavedDoc[]> {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from("saved_documents")
      .select("id,user_id,title,content,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as SavedDoc[];
  }

  // Local storage mode
  const user = getLocalSessionUser();
  if (!user) return [];
  const docs = getLocalDocs();
  return docs
    .filter((d) => d.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function saveDocument(title: string, content: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Please sign in to save.");
    const { error } = await supabase
      .from("saved_documents")
      .insert({ user_id: user.id, title, content });
    if (error) throw new Error(error.message);
    return;
  }

  // Local storage mode
  const user = getLocalSessionUser();
  if (!user) throw new Error("Please sign in to save.");
  const docs = getLocalDocs();
  const newDoc: SavedDoc = {
    id: "doc_" + Math.random().toString(36).substring(2, 10),
    user_id: user.id,
    title,
    content,
    created_at: new Date().toISOString(),
  };
  docs.unshift(newDoc);
  saveLocalDocs(docs);
}

export async function deleteDocument(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from("saved_documents").delete().eq("id", id);
    if (error) throw new Error(error.message);
    return;
  }

  // Local storage mode
  const docs = getLocalDocs();
  const filtered = docs.filter((d) => d.id !== id);
  saveLocalDocs(filtered);
}

export async function countDocuments(): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      const { count, error } = await supabase
        .from("saved_documents")
        .select("*", { count: "exact", head: true });
      if (error) return 0;
      return count ?? 0;
    } catch {
      return 0;
    }
  }

  // Local storage mode
  const user = getLocalSessionUser();
  if (!user) return 0;
  const docs = getLocalDocs();
  return docs.filter((d) => d.user_id === user.id).length;
}
