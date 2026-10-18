import { useState } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth";
import { navigate } from "@/lib/router";

export function ResetPassword() {
  const { updatePassword, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return toast.error("Use at least 6 characters.");
    if (password !== confirm) return toast.error("Passwords do not match.");
    setBusy(true);
    try {
      const { error } = await updatePassword(password);
      if (error) throw new Error(error);
      toast.success("Password updated. Please log in with your new password.");
      await signOut();
      navigate("/login");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <button onClick={() => navigate("/")} className="font-display text-xl font-bold">Zalemba</button>
        <button onClick={() => navigate("/login")} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to log in
        </button>
      </header>

      <main className="mx-auto max-w-md px-5 pb-20 pt-6">
        <div className="rounded-3xl border bg-card p-6 shadow-paper sm:p-8">
          <h1 className="font-display text-2xl font-bold">Choose a new password</h1>
          <p className="mt-1 text-sm text-muted-foreground">Enter a new password for your account.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">New password</span>
              <span className="flex items-center gap-2 rounded-2xl border bg-background px-3 focus-within:border-primary">
                <Lock className="size-4 text-muted-foreground" />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" className="h-12 w-full bg-transparent text-base outline-none" />
              </span>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold">Confirm password</span>
              <span className="flex items-center gap-2 rounded-2xl border bg-background px-3 focus-within:border-primary">
                <Lock className="size-4 text-muted-foreground" />
                <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" className="h-12 w-full bg-transparent text-base outline-none" />
              </span>
            </label>
            <Button type="submit" className="h-12 w-full rounded-2xl bg-gradient-primary text-base" disabled={busy}>
              {busy ? <Loader2 className="animate-spin" /> : null} Update password
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
