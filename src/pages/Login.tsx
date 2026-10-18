import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, Mail, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { navigate, useRoute } from "@/lib/router";
import { saveDocument } from "@/lib/saved";
import { getSupabaseConfig, saveSupabaseConfig } from "@/lib/supabase";

type Mode = "signin" | "signup" | "forgot";

export function Login() {
  const route = useRoute();
  const { signIn, signUp, resetPassword, signOut, user, isConfigured } = useAuth();

  const initialMode: Mode =
    route.path === "/signup"
      ? "signup"
      : route.path === "/forgot-password"
      ? "forgot"
      : (route.search.get("mode") as Mode) || "signin";
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmedEmailSent, setConfirmedEmailSent] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState<string | null>(null);

  // In-app Supabase configuration modal/state for setups without .env
  const [showConfig, setShowConfig] = useState(false);
  const [customUrl, setCustomUrl] = useState(() => getSupabaseConfig().url);
  const [customKey, setCustomKey] = useState(() => getSupabaseConfig().key);

  const redirectUrl = route.search.get("redirect") || "/account";

  // Check for error parameters in URL (e.g., from expired reset or confirmation link)
  useEffect(() => {
    const errorParam = route.search.get("error_description") || route.search.get("error");
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [route.search]);

  // Handle pending document saving after login
  const handlePostLogin = async () => {
    try {
      const pendingRaw = localStorage.getItem("zalemba_pending_doc");
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        if (pending?.title && pending?.content) {
          await saveDocument(pending.title, pending.content);
          toast.success(`"${pending.title}" saved to your account.`);
        }
        localStorage.removeItem("zalemba_pending_doc");
      }
    } catch (e) {
      console.warn("Could not auto-save pending document:", e);
    }
    navigate(redirectUrl);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setConfirmedEmailSent(null);
    setResetEmailSent(null);

    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) throw new Error(error);
        setResetEmailSent(email);
        toast.success("Password reset link sent. Please check your inbox.");
        return;
      }

      if (mode === "signup") {
        const { error, needsConfirm } = await signUp(email, password);
        if (error) throw new Error(error);
        if (needsConfirm) {
          setConfirmedEmailSent(email);
          toast.success("Confirmation email sent! Please check your inbox.");
          return;
        }
        toast.success("Account created successfully!");
        await handlePostLogin();
        return;
      }

      // Default: Sign in
      const { error } = await signIn(email, password);
      if (error) throw new Error(error);
      toast.success("Welcome back.");
      await handlePostLogin();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim() || !customKey.trim()) {
      toast.error("Please enter both Supabase URL and Publishable Key.");
      return;
    }
    saveSupabaseConfig(customUrl.trim(), customKey.trim());
    toast.success("Supabase credentials saved. Reloading...");
  };

  const titles: Record<Mode, string> = {
    signin: "Log in to Zalemba",
    signup: "Create your Zalemba account",
    forgot: "Reset your password",
  };

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/")} className="font-display text-xl font-bold">
          Zalemba
        </button>
        <button
          onClick={() => navigate(redirectUrl.startsWith("/create") ? redirectUrl : "/")}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back
        </button>
      </header>

      <main className="mx-auto max-w-md px-5 pb-20 pt-6">
        <div className="rounded-3xl border bg-card p-6 shadow-paper sm:p-8">
          {/* If already logged in */}
          {user ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="font-display text-2xl font-bold">You are already signed in</h1>
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-semibold text-foreground">{user.email}</span>
              </p>
              <div className="pt-2 flex flex-col gap-2.5">
                <Button
                  className="h-12 w-full rounded-2xl bg-gradient-primary text-base"
                  onClick={() => navigate(redirectUrl)}
                >
                  Continue to {redirectUrl === "/account" ? "My documents" : "Document"}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl bg-card text-base"
                  onClick={async () => {
                    await signOut();
                    toast.success("Signed out");
                  }}
                >
                  Log out
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Missing Supabase configuration notification */}
              {!isConfigured && (
                <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs">
                  <div className="flex items-start gap-2.5 text-amber-700 dark:text-amber-300">
                    <ShieldAlert className="size-5 shrink-0" />
                    <div>
                      <p className="font-semibold">Supabase credentials required</p>
                      <p className="mt-1 text-muted-foreground">
                        To enable user authentication and document saving, connect your Supabase project.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowConfig(!showConfig)}
                        className="mt-2.5 inline-flex items-center gap-1 font-semibold text-primary underline"
                      >
                        <KeyRound className="size-3.5" />
                        {showConfig ? "Hide credentials form" : "Enter Supabase credentials"}
                      </button>
                    </div>
                  </div>

                  {showConfig && (
                    <form onSubmit={handleSaveConfig} className="mt-3.5 space-y-2.5 border-t border-amber-500/20 pt-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground">Project URL</label>
                        <input
                          type="url"
                          required
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://xyzcompany.supabase.co"
                          className="mt-1 h-9 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-foreground">Anon / Publishable Key</label>
                        <input
                          type="text"
                          required
                          value={customKey}
                          onChange={(e) => setCustomKey(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                          className="mt-1 h-9 w-full rounded-xl border bg-background px-3 text-xs outline-none focus:border-primary"
                        />
                      </div>
                      <Button type="submit" size="sm" className="w-full rounded-xl bg-primary">
                        Save and Connect
                      </Button>
                    </form>
                  )}
                </div>
              )}

              {/* Email Sent Confirmation Banners */}
              {confirmedEmailSent && (
                <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-primary">Confirmation email sent</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        We sent a verification link to <span className="font-semibold text-foreground">{confirmedEmailSent}</span>.
                        Please click the link in your email to activate your account, then log in below.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {resetEmailSent && (
                <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-sm text-foreground">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="size-5 shrink-0 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-primary">Reset link dispatched</h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        If an account exists for <span className="font-semibold text-foreground">{resetEmailSent}</span>,
                        you will receive an email with instructions to reset your password.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <h1 className="font-display text-2xl font-bold">{titles[mode]}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mode === "forgot"
                  ? "Enter your email and we'll send you a password reset link."
                  : mode === "signup"
                  ? "Sign up to save, manage, and print your documents anytime."
                  : "Save your documents and come back to them anytime."}
              </p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold">Email</span>
                  <span className="flex items-center gap-2 rounded-2xl border bg-background px-3 focus-within:border-primary">
                    <Mail className="size-4 text-muted-foreground" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      data-testid="login-email-input"
                      className="h-12 w-full bg-transparent text-base outline-none"
                    />
                  </span>
                </label>

                {mode !== "forgot" && (
                  <label className="block">
                    <span className="mb-1 block text-sm font-semibold">Password</span>
                    <span className="flex items-center gap-2 rounded-2xl border bg-background px-3 focus-within:border-primary">
                      <Lock className="size-4 text-muted-foreground" />
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        data-testid="login-password-input"
                        className="h-12 w-full bg-transparent text-base outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-muted-foreground hover:text-foreground"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </span>
                  </label>
                )}

                {mode === "signin" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedEmailSent(null);
                        setResetEmailSent(null);
                        setMode("forgot");
                      }}
                      data-testid="login-forgot-link"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  data-testid="login-submit-btn"
                  className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold"
                  disabled={busy}
                >
                  {busy ? <Loader2 className="animate-spin size-5" /> : null}
                  {mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Log in"}
                </Button>
              </form>

              <div className="mt-5 text-center text-sm text-muted-foreground">
                {mode === "signup" ? (
                  <>
                    Already have an account?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedEmailSent(null);
                        setResetEmailSent(null);
                        setMode("signin");
                      }}
                      className="font-semibold text-primary hover:underline"
                    >
                      Log in
                    </button>
                  </>
                ) : mode === "forgot" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmedEmailSent(null);
                      setResetEmailSent(null);
                      setMode("signin");
                    }}
                    className="font-semibold text-primary hover:underline"
                  >
                    Back to log in
                  </button>
                ) : (
                  <>
                    New to Zalemba?{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmedEmailSent(null);
                        setResetEmailSent(null);
                        setMode("signup");
                      }}
                      data-testid="login-mode-signup"
                      className="font-semibold text-primary hover:underline"
                    >
                      Create an account
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
