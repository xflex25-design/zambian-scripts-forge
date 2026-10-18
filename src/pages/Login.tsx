import { useState } from "react";
import { ArrowLeft, Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { navigate } from "@/lib/router";

type Mode = "signin" | "signup" | "forgot";

export function Login() {
  const { signIn, signUp, resetPassword } = useAuth();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email);
        if (error) throw new Error(error);
        toast.success("If that account exists, a reset link is on its way.");
        setMode("signin");
        return;
      }
      if (mode === "signup") {
        const { error, needsConfirm } = await signUp(email, password);
        if (error) throw new Error(error);
        if (needsConfirm) {
          toast.success("Check your email to confirm your account, then sign in.");
          setMode("signin");
          return;
        }
        toast.success("Account created.");
        navigate("/account");
        return;
      }
      const { error } = await signIn(email, password);
      if (error) throw new Error(error);
      toast.success("Welcome back.");
      navigate("/account");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
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
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to home
        </button>
      </header>

      <main className="mx-auto max-w-md px-5 pb-20 pt-6">
        <div className="rounded-3xl border bg-card p-6 shadow-paper sm:p-8">
          <h1 className="font-display text-2xl font-bold">{titles[mode]}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "forgot"
              ? "Enter your email and we'll send you a reset link."
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
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    data-testid="login-password-input"
                    className="h-12 w-full bg-transparent text-base outline-none"
                  />
                </span>
              </label>
            )}

            {mode === "signin" && (
              <button
                type="button"
                onClick={() => setMode("forgot")}
                data-testid="login-forgot-link"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </button>
            )}

            <Button type="submit" data-testid="login-submit-btn" className="h-12 w-full rounded-2xl bg-gradient-primary text-base" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null}
              {mode === "signup" ? "Sign up" : mode === "forgot" ? "Send reset link" : "Log in"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {mode === "signup" ? (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="font-semibold text-primary hover:underline">Log in</button>
              </>
            ) : mode === "forgot" ? (
              <button onClick={() => setMode("signin")} className="font-semibold text-primary hover:underline">Back to log in</button>
            ) : (
              <>New to Zalemba?{" "}
                <button onClick={() => setMode("signup")} data-testid="login-mode-signup" className="font-semibold text-primary hover:underline">Create an account</button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
