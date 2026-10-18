import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured, getSupabaseConfig } from "@/lib/supabase";
import { navigate } from "@/lib/router";

type AuthValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  isLocalMode: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null; needsConfirm: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
};

const Ctx = createContext<AuthValue | null>(null);

const LOCAL_USERS_KEY = "zalemba_local_users";
const LOCAL_SESSION_KEY = "zalemba_local_session";

type LocalUser = {
  id: string;
  email: string;
  passwordHash: string;
  created_at: string;
};

function getLocalUsers(): LocalUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalUsers(users: LocalUser[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
  } catch {
    // ignore
  }
}

function getStoredLocalSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveStoredLocalSession(session: Session | null): void {
  if (typeof window === "undefined") return;
  try {
    if (session) {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(LOCAL_SESSION_KEY);
    }
  } catch {
    // ignore
  }
}

function createLocalSession(user: { id: string; email: string }): Session {
  return {
    access_token: "local_session_" + user.id,
    token_type: "bearer",
    expires_in: 3600 * 24 * 30,
    refresh_token: "local_refresh_" + user.id,
    user: {
      id: user.id,
      email: user.email,
      app_metadata: { provider: "local" },
      user_metadata: {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
    } as unknown as User,
  };
}

export function formatAuthError(msg: string): string {
  const lower = msg.toLowerCase();
  if (
    lower.includes("forbidden use of secret api key in browser") ||
    lower.includes("secret api key") ||
    lower.includes("service_role")
  ) {
    return "Forbidden use of secret API key in browser: You are using a Supabase 'service_role' (secret) key. Web browsers only permit the 'anon' (public) key for security reasons. Please update your key in the Supabase settings below or use local offline mode.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Incorrect email or password. Please verify your details.";
  }
  if (lower.includes("email not confirmed")) {
    return "Please verify your email address. Check your inbox for the confirmation link.";
  }
  if (lower.includes("user already registered") || lower.includes("already registered")) {
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
      // Load local session
      const local = getStoredLocalSession();
      if (mounted) {
        setSession(local);
        setLoading(false);
      }
      return;
    }

    // Supabase auth
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
        console.warn("Failed to get Supabase session:", err);
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
        if (window.location.hash.includes("access_token=")) {
          const isRecovery = window.location.hash.includes("type=recovery");
          if (!isRecovery) {
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
    isLocalMode: !isSupabaseConfigured,

    signUp: async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        return { error: "Please enter a valid email address.", needsConfirm: false };
      }
      if (password.length < 6) {
        return { error: "Password must be at least 6 characters.", needsConfirm: false };
      }

      // 1. Supabase Mode
      if (isSupabaseConfigured) {
        try {
          const { data, error } = await supabase.auth.signUp({
            email: cleanEmail,
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
      }

      // 2. Local Auth Mode (Offline / In-App storage)
      const users = getLocalUsers();
      if (users.some((u) => u.email === cleanEmail)) {
        return {
          error: "An account with this email already exists. Please log in instead.",
          needsConfirm: false,
        };
      }

      const newUser: LocalUser = {
        id: "usr_" + Math.random().toString(36).substring(2, 10),
        email: cleanEmail,
        passwordHash: btoa(password),
        created_at: new Date().toISOString(),
      };

      users.push(newUser);
      saveLocalUsers(users);

      const newSession = createLocalSession({ id: newUser.id, email: newUser.email });
      saveStoredLocalSession(newSession);
      setSession(newSession);

      return { error: null, needsConfirm: false };
    },

    signIn: async (email, password) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { error: "Please enter your email address." };
      }

      // 1. Supabase Mode
      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email: cleanEmail,
            password,
          });
          return { error: error ? formatAuthError(error.message) : null };
        } catch (e) {
          return { error: formatAuthError((e as Error).message) };
        }
      }

      // 2. Local Auth Mode
      const users = getLocalUsers();
      const found = users.find((u) => u.email === cleanEmail);

      if (!found) {
        // If no user exists with this email, provide clear hint
        return { error: "No account found with this email. Please click 'Create an account' below." };
      }

      if (found.passwordHash !== btoa(password)) {
        return { error: "Incorrect password. Please try again or reset your password." };
      }

      const newSession = createLocalSession({ id: found.id, email: found.email });
      saveStoredLocalSession(newSession);
      setSession(newSession);

      return { error: null };
    },

    signOut: async () => {
      if (isSupabaseConfigured) {
        try {
          await supabase.auth.signOut({ scope: "local" });
        } catch (e) {
          console.warn("Sign out warning:", e);
        }
      }
      saveStoredLocalSession(null);
      setSession(null);
    },

    resetPassword: async (email) => {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail) {
        return { error: "Please enter your email address." };
      }

      if (isSupabaseConfigured) {
        try {
          const redirectUrl = `${window.location.origin}/#reset-password`;
          const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
            redirectTo: redirectUrl,
          });
          return { error: error ? formatAuthError(error.message) : null };
        } catch (e) {
          return { error: formatAuthError((e as Error).message) };
        }
      }

      // Local Mode: Verify user exists and allow simulated reset
      const users = getLocalUsers();
      const found = users.find((u) => u.email === cleanEmail);
      if (!found) {
        // Security best practice: don't reveal non-existent emails
        return { error: null };
      }
      return { error: null };
    },

    updatePassword: async (password) => {
      if (password.length < 6) {
        return { error: "Password must be at least 6 characters." };
      }

      if (isSupabaseConfigured) {
        try {
          const { error } = await supabase.auth.updateUser({ password });
          return { error: error ? formatAuthError(error.message) : null };
        } catch (e) {
          return { error: formatAuthError((e as Error).message) };
        }
      }

      // Local Mode: Update current logged in local user's password
      if (!session?.user?.email) {
        return { error: "No active session found to update password." };
      }

      const users = getLocalUsers();
      const idx = users.findIndex((u) => u.email === session.user.email);
      if (idx !== -1) {
        users[idx].passwordHash = btoa(password);
        saveLocalUsers(users);
      }
      return { error: null };
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}
