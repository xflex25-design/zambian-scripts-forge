import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { navigate } from "@/lib/router";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
};

const Ctx = createContext<AuthValue | null>(null);

export function formatAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password. Please verify your details.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please verify your email address. Check your inbox for the confirmation link.";
  }
  if (lower.includes("user already registered")) {
    return "An account with this email already exists. Please log in instead.";
  }
  if (lower.includes("password should be at least")) {
    return "Password must be at least 6 characters long.";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "Too many attempts. Please wait a few moments before trying again.";
  }
  if (lower.includes("token has expired") || lower.includes("invalid or has expired")) {
    return "This link has expired or has already been used. Please request a new one.";
  }
  if (lower.includes("network error") || lower.includes("failed to fetch")) {
    return "Unable to reach the authentication service. Check your internet connection.";
  }
  return msg;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          console.warn("Supabase session error:", error.message);
        }
        setSession(data?.session ?? null);
      })
      .catch((err) => {
        console.warn("Failed to get session:", err);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setLoading(false);

      if (event === "PASSWORD_RECOVERY") {
        navigate("/reset-password");
      } else if (event === "SIGNED_IN") {
        // If the URL has raw access_token parameters, clean the hash
        if (window.location.hash.includes("access_token=")) {
          const isRecovery = window.location.hash.includes("type=recovery");
          if (!isRecovery) {
            // Clean up hash so token isn't visible in address bar
            window.history.replaceState(null, "", window.location.pathname + "#/account");
          }
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const value: AuthValue = {
    session,
    user: session?.user ?? null,
    loading,
    isConfigured: isSupabaseConfigured,
    signUp: async (email, password) => {
      if (!isSupabaseConfigured) {
        return {
          error: "Supabase is not configured yet. Please enter your Supabase URL and key.",
          needsConfirm: false,
        };
      }
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/#account`,
          },
        });
        if (error) return { error: formatAuthError(error.message), needsConfirm: false };
        return { error: null, needsConfirm: !error && !data.session };
      } catch (e) {
        return { error: formatAuthError((e as Error).message), needsConfirm: false };
      }
    },
    signIn: async (email, password) => {
      if (!isSupabaseConfigured) {
        return {
          error: "Supabase is not configured yet. Please enter your Supabase URL and key.",
        };
      }
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        return { error: error ? formatAuthError(error.message) : null };
      } catch (e) {
        return { error: formatAuthError((e as Error).message) };
      }
    },
    signOut: async () => {
      if (!isSupabaseConfigured) {
        setSession(null);
        return;
      }
      try {
        await supabase.auth.signOut({ scope: "local" });
        setSession(null);
      } catch (e) {
        console.warn("Sign out warning:", e);
        setSession(null);
      }
    },
    resetPassword: async (email) => {
      if (!isSupabaseConfigured) {
        return {
          error: "Supabase is not configured yet. Please enter your Supabase URL and key.",
        };
      }
      try {
        const redirectUrl = `${window.location.origin}/#reset-password`;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: redirectUrl,
        });
        return { error: error ? formatAuthError(error.message) : null };
      } catch (e) {
        return { error: formatAuthError((e as Error).message) };
      }
    },
    updatePassword: async (password) => {
      if (!isSupabaseConfigured) {
        return {
          error: "Supabase is not configured yet. Please enter your Supabase URL and key.",
        };
      }
      try {
        const { error } = await supabase.auth.updateUser({ password });
        return { error: error ? formatAuthError(error.message) : null };
      } catch (e) {
        return { error: formatAuthError((e as Error).message) };
      }
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
