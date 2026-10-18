import { supabase } from "@/lib/supabase";

export type SavedDoc = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
};

export async function listDocuments(): Promise<SavedDoc[]> {
  const { data, error } = await supabase
    .from("saved_documents")
    .select("id,user_id,title,content,created_at")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as SavedDoc[];
}

export async function saveDocument(title: string, content: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Please sign in to save.");
  const { error } = await supabase
    .from("saved_documents")
    .insert({ user_id: user.id, title, content });
  if (error) throw new Error(error.message);
}

export async function deleteDocument(id: string): Promise<void> {
  const { error } = await supabase.from("saved_documents").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function countDocuments(): Promise<number> {
  const { count, error } = await supabase
    .from("saved_documents")
    .select("*", { count: "exact", head: true });
  if (error) throw new Error(error.message);
  return count ?? 0;
}
