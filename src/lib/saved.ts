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

function getLocalSessionUser(): { id: string; email?: string } | null {
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
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Fallback to local session if present
        const localUser = getLocalSessionUser();
        if (!localUser) return [];
        const docs = getLocalDocs();
        return docs
          .filter((d) => d.user_id === localUser.id)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      }

      const { data, error } = await supabase
        .from("saved_documents")
        .select("id,user_id,title,content,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        // If table doesn't exist yet, warn and fallback to local
        if (error.code === "42P01" || error.message?.includes("does not exist")) {
          console.warn("[Zalemba] 'saved_documents' table not yet created in Supabase. Using local store.");
          const docs = getLocalDocs();
          return docs
            .filter((d) => d.user_id === user.id)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }
        throw new Error(error.message);
      }
      return (data ?? []) as SavedDoc[];
    } catch (err) {
      console.warn("Supabase listDocuments error:", err);
      throw err;
    }
  }

  // Local storage mode
  const user = getLocalSessionUser();
  if (!user) return [];
  const docs = getLocalDocs();
  return docs
    .filter((d) => d.user_id === user.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function saveDocument(title: string, content: string): Promise<SavedDoc> {
  const cleanTitle = title.trim() || "Untitled Document";
  const cleanContent = content.trim();

  if (isSupabaseConfigured) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const localUser = getLocalSessionUser();
      if (!localUser) throw new Error("Please sign in to save documents.");
      const docs = getLocalDocs();
      const newDoc: SavedDoc = {
        id: "doc_" + Math.random().toString(36).substring(2, 10),
        user_id: localUser.id,
        title: cleanTitle,
        content: cleanContent,
        created_at: new Date().toISOString(),
      };
      docs.unshift(newDoc);
      saveLocalDocs(docs);
      return newDoc;
    }

    const { data, error } = await supabase
      .from("saved_documents")
      .insert({ user_id: user.id, title: cleanTitle, content: cleanContent })
      .select()
      .single();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        console.warn("[Zalemba] 'saved_documents' table missing in Supabase. Falling back to local storage.");
        const docs = getLocalDocs();
        const newDoc: SavedDoc = {
          id: "doc_" + Math.random().toString(36).substring(2, 10),
          user_id: user.id,
          title: cleanTitle,
          content: cleanContent,
          created_at: new Date().toISOString(),
        };
        docs.unshift(newDoc);
        saveLocalDocs(docs);
        return newDoc;
      }
      throw new Error(error.message);
    }
    return data as SavedDoc;
  }

  // Local storage mode
  const user = getLocalSessionUser();
  if (!user) throw new Error("Please sign in to save documents.");
  const docs = getLocalDocs();
  const newDoc: SavedDoc = {
    id: "doc_" + Math.random().toString(36).substring(2, 10),
    user_id: user.id,
    title: cleanTitle,
    content: cleanContent,
    created_at: new Date().toISOString(),
  };
  docs.unshift(newDoc);
  saveLocalDocs(docs);
  return newDoc;
}

export async function updateDocument(id: string, title: string, content: string): Promise<SavedDoc> {
  const cleanTitle = title.trim() || "Untitled Document";
  const cleanContent = content.trim();

  if (isSupabaseConfigured) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const localUser = getLocalSessionUser();
      if (!localUser) throw new Error("Please sign in to update documents.");
      const docs = getLocalDocs();
      const idx = docs.findIndex((d) => d.id === id);
      if (idx !== -1) {
        docs[idx] = { ...docs[idx], title: cleanTitle, content: cleanContent };
        saveLocalDocs(docs);
        return docs[idx];
      }
      throw new Error("Document not found");
    }

    const { data, error } = await supabase
      .from("saved_documents")
      .update({ title: cleanTitle, content: cleanContent })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "42P01" || error.message?.includes("does not exist")) {
        const docs = getLocalDocs();
        const idx = docs.findIndex((d) => d.id === id);
        if (idx !== -1) {
          docs[idx] = { ...docs[idx], title: cleanTitle, content: cleanContent };
          saveLocalDocs(docs);
          return docs[idx];
        }
      }
      throw new Error(error.message);
    }
    return data as SavedDoc;
  }

  // Local storage mode
  const docs = getLocalDocs();
  const idx = docs.findIndex((d) => d.id === id);
  if (idx !== -1) {
    docs[idx] = {
      ...docs[idx],
      title: cleanTitle,
      content: cleanContent,
    };
    saveLocalDocs(docs);
    return docs[idx];
  }
  throw new Error("Document not found");
}

export async function deleteDocument(id: string): Promise<void> {
  if (isSupabaseConfigured) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase
        .from("saved_documents")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error && error.code !== "42P01" && !error.message?.includes("does not exist")) {
        throw new Error(error.message);
      }
    }
  }

  // Always sync local storage removal as well
  const docs = getLocalDocs();
  const filtered = docs.filter((d) => d.id !== id);
  saveLocalDocs(filtered);
}

export async function countDocuments(): Promise<number> {
  if (isSupabaseConfigured) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const localUser = getLocalSessionUser();
        if (!localUser) return 0;
        const docs = getLocalDocs();
        return docs.filter((d) => d.user_id === localUser.id).length;
      }

      const { count, error } = await supabase
        .from("saved_documents")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (error) {
        const docs = getLocalDocs();
        return docs.filter((d) => d.user_id === user.id).length;
      }
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
