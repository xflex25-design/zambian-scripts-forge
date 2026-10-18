import { useState } from "react";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2, Lock, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { navigate } from "@/lib/router";

export function ResetPassword() {
  const { updatePassword, signOut, session, loading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Use at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");

    setBusy(true);
    try {
      const { error } = await updatePassword(password);
      if (error) throw new Error(error);
      setSuccess(true);
      toast.success("Password updated successfully.");
      await signOut();
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  // If auth is loaded and there is no active session or recovery token
  const hasTokenInHash = typeof window !== "undefined" && window.location.hash.includes("access_token=");
  const hasActiveSession = Boolean(session || hasTokenInHash);

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/")} className="font-display text-xl font-bold">
          Zalemba
        </button>
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to log in
        </button>
      </header>

      <main className="mx-auto max-w-md px-5 pb-20 pt-6">
        <div className="rounded-3xl border bg-card p-6 shadow-paper sm:p-8">
          {success ? (
            <div className="text-center py-4 space-y-3">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-secondary text-primary">
                <CheckCircle2 className="size-6" />
              </div>
              <h1 className="font-display text-2xl font-bold">Password Updated</h1>
              <p className="text-sm text-muted-foreground">
                Your password has been changed. Redirecting you to login...
              </p>
              <Button
                className="mt-4 h-12 w-full rounded-2xl bg-gradient-primary"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </Button>
            </div>
          ) : !loading && !hasActiveSession ? (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
                <ShieldAlert className="size-6" />
              </div>
              <h1 className="font-display text-xl font-bold">Reset link expired or missing</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Password reset links are single-use and expire after some time. Please request a new link to reset your password.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <Button
                  className="h-12 w-full rounded-2xl bg-gradient-primary"
                  onClick={() => navigate("/login?mode=forgot")}
                >
                  <KeyRound className="size-4 mr-2" /> Request new reset link
                </Button>
                <Button
                  variant="outline"
                  className="h-12 w-full rounded-2xl bg-card"
                  onClick={() => navigate("/login")}
                >
                  Return to Login
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold">Choose a new password</h1>
              <p className="mt-1 text-sm text-muted-foreground">Enter a new secure password for your account.</p>

              <form onSubmit={submit} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1 block text-sm font-semibold">New password</span>
                  <span className="flex items-center gap-2 rounded-2xl border bg-background px-3 focus-within:border-primary">
                    <Lock className="size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                <label className="block">
                  <span className="mb-1 block text-sm font-semibold">Confirm password</span>
                  <span className="flex items-center gap-2 rounded-2xl border bg-background px-3 focus-within:border-primary">
                    <Lock className="size-4 text-muted-foreground" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="Repeat your password"
                      className="h-12 w-full bg-transparent text-base outline-none"
                    />
                  </span>
                </label>

                <Button
                  type="submit"
                  className="h-12 w-full rounded-2xl bg-gradient-primary text-base font-semibold"
                  disabled={busy}
                >
                  {busy ? <Loader2 className="animate-spin size-5" /> : null} Update password
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
