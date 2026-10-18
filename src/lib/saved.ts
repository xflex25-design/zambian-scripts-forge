import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type SavedDoc = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
};

export async function listDocuments(): Promise<SavedDoc[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("saved_documents")
    .select("id,user_id,title,content,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SavedDoc[];
}

export async function saveDocument(title: string, content: string): Promise<void> {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured yet. Connect your Supabase project in settings.");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to save.");
  const { error } = await supabase
    .from("saved_documents")
    .insert({ user_id: user.id, title, content });
  if (error) throw new Error(error.message);
}

export async function deleteDocument(id: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("saved_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function countDocuments(): Promise<number> {
  if (!isSupabaseConfigured) return 0;
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
