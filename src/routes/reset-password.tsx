import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/brand";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset your password — Stable Finance Bank" },
      { name: "description", content: "Choose a new password for your Stable Finance Bank online banking profile." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Reset your password — Stable Finance Bank" },
      { property: "og:description", content: "Choose a new password for your online banking profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPasswordPage,
});

type PageState = "loading" | "ready" | "invalid" | "done";

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>("loading");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    let settled = false;
    const settle = (s: PageState) => {
      if (!settled) {
        settled = true;
        setState(s);
      }
    };

    // Supabase processes the recovery token from the URL automatically and
    // fires PASSWORD_RECOVERY once the recovery session is established.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) settle("ready");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) settle("ready");
    });

    // If no token/session materializes, the link is invalid or expired.
    const timer = setTimeout(() => settle("invalid"), 3500);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setSaving(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);
    if (updateError) {
      setError(updateError.message);
      return;
    }
    setState("done");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm">
        <div className="mb-8">
          <BrandMark />
        </div>

        {state === "loading" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
            <p className="text-sm text-muted-foreground">Verifying your secure link…</p>
          </div>
        )}

        {state === "invalid" && (
          <div>
            <h1 className="font-display text-3xl">Link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This password-reset link is invalid or has expired. Reset links are valid for one hour and can only be
              used once.
            </p>
            <Button
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate({ to: "/auth" })}
            >
              Back to sign in
            </Button>
          </div>
        )}

        {state === "ready" && (
          <div>
            <h1 className="font-display text-3xl">Choose a new password</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter a new password for your online banking profile.
            </p>
            <form onSubmit={submit} className="mt-6 space-y-3">
              <div>
                <Label htmlFor="np">New password</Label>
                <Input
                  id="np"
                  className="bg-card"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide new password" : "Show new password"} title={showPassword ? "Hide new password" : "Show new password"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <div>
                <Label htmlFor="cp">Confirm password</Label>
                <Input
                  id="cp"
                  className="bg-card"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-9 w-9" onClick={() => setShowConfirm((value) => !value)} aria-label={showConfirm ? "Hide password confirmation" : "Show password confirmation"} title={showConfirm ? "Hide password confirmation" : "Show password confirmation"}>
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {error && (
                <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </p>
              )}
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={saving}
              >
                {saving ? "Updating…" : "Update password"}
              </Button>
            </form>
          </div>
        )}

        {state === "done" && (
          <div>
            <h1 className="font-display text-3xl">Password updated</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your password was updated successfully. You can now sign in with your new password.
            </p>
            <Button
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate({ to: "/auth" })}
            >
              Log in
            </Button>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-muted-foreground">
          <a href="/" className="hover:underline">
            ← Back to site
          </a>
        </p>
      </div>
    </div>
  );
}
