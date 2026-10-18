import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Clean up any stale credentials stored in browser localStorage
if (typeof window !== "undefined") {
  try {
    localStorage.removeItem("zalemba_supabase_url");
    localStorage.removeItem("zalemba_supabase_key");
  } catch {
    // Ignore storage restrictions
  }
}

function getCleanString(val: unknown): string {
  if (typeof val === "string" && val.trim().length > 0) {
    return val.trim();
  }
  return "";
}

/**
 * Checks whether an API key is a secret / service_role key.
 */
export function isSecretApiKey(key: string): boolean {
  if (!key) return false;
  const clean = key.trim();
  if (
    clean.startsWith("sb_secret_") ||
    clean.startsWith("sb_sec_") ||
    clean.toLowerCase().includes("service_role")
  ) {
    return true;
  }
  const parts = clean.split(".");
  if (parts.length === 3) {
    try {
      const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
      const json = JSON.parse(atob(padded));
      if (
        json?.role === "service_role" ||
        json?.role === "supabase_admin" ||
        json?.role === "secret"
      ) {
        return true;
      }
    } catch {
      // Ignore decoding failure
    }
  }
  return false;
}

export function getSupabaseConfig(): { url: string; key: string; isConfigured: boolean } {
  // Read strictly from environment variables
  let url = getCleanString(import.meta.env.VITE_SUPABASE_URL);
  let key = getCleanString(
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  // Normalize URL by removing trailing slashes or /rest/v1
  if (url) {
    url = url.replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
  }

  const isSecret = isSecretApiKey(key);
  const isPlaceholder =
    !url ||
    !key ||
    url.includes("placeholder-project") ||
    key === "placeholder-anon-key";

  const isConfigured = Boolean(
    url &&
    key &&
    !isPlaceholder &&
    url.startsWith("http") &&
    !isSecret
  );

  return { url, key, isConfigured };
}

const config = getSupabaseConfig();
export const isSupabaseConfigured = config.isConfigured;

// Provide a valid dummy endpoint if Supabase is not configured via env
const clientUrl = config.isConfigured ? config.url : "https://placeholder-project.supabase.co";
const clientKey = config.isConfigured ? config.key : "placeholder-anon-key";

let clientInstance: SupabaseClient;
try {
  clientInstance = createClient(clientUrl, clientKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
} catch (e) {
  console.warn("[Zalemba] Supabase client initialization fallback:", e);
  clientInstance = createClient(
    "https://placeholder-project.supabase.co",
    "placeholder-anon-key"
  );
}

export const supabase: SupabaseClient = clientInstance;


