import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const STORAGE_URL_KEY = "zalemba_supabase_url";
const STORAGE_KEY_KEY = "zalemba_supabase_key";

function getCleanString(val: unknown): string {
  if (typeof val === "string" && val.trim().length > 0) {
    return val.trim();
  }
  return "";
}

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  let url = getCleanString(import.meta.env.VITE_SUPABASE_URL);
  let key = getCleanString(import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

  if ((!url || !key) && typeof window !== "undefined") {
    try {
      const storedUrl = getCleanString(localStorage.getItem(STORAGE_URL_KEY));
      const storedKey = getCleanString(localStorage.getItem(STORAGE_KEY_KEY));
      if (storedUrl && storedKey) {
        url = storedUrl;
        key = storedKey;
      }
    } catch {
      // Ignore localStorage access restrictions
    }
  }

  const isConfigured = Boolean(
    url &&
    key &&
    !url.includes("placeholder-project") &&
    url.startsWith("http")
  );

  return { url, key, isConfigured };
}

export function saveSupabaseConfig(url: string, key: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, key.trim());
    window.location.reload();
  }
}

export function clearSupabaseConfig(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
    window.location.reload();
  }
}

const config = getSupabaseConfig();
export const isSupabaseConfigured = config.isConfigured;

// Provide a valid dummy endpoint if credentials aren't provided yet so the app loads smoothly
const clientUrl = config.url || "https://placeholder-project.supabase.co";
const clientKey = config.key || "placeholder-anon-key";

export const supabase: SupabaseClient = createClient(clientUrl, clientKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
