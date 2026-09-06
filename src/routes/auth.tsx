import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand";
import { accountStateMessage, getBlockingAccountState } from "@/lib/account-state";
import { sendAuthEmail } from "@/lib/auth-email.functions";
import { Eye, EyeOff } from "lucide-react";

type Search = { mode?: "signin" | "signup"; redirect?: string; state?: string };

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or open an account — Stable Finance Bank" },
      {
        name: "description",
        content:
          "Sign in to Stable Finance Bank online banking, or open a new checking or savings account in minutes.",
      },
      { name: "robots", content: "noindex, follow" },
      { property: "og:title", content: "Sign in — Stable Finance Bank" },
      { property: "og:description", content: "Secure online banking sign-in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "signup" ? "signup" : "signin",
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
    state: typeof s.state === "string" ? s.state : undefined,
  }),

  beforeLoad: async ({ search }) => {
    if (typeof window === "undefined") return;
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: search.redirect ?? "/app" });
  },
  component: AuthPage,
});

function AuthPage() {
  const search = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [blockedState, setBlockedState] = useState<string | null>(search.state ?? null);
  const [showPassword, setShowPassword] = useState(false);
  const sendAuthEmailAction = useServerFn(sendAuthEmail);
  const blockedMessage = accountStateMessage(blockedState);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const uname = username.trim().toLowerCase();
        if (!/^[a-z0-9_.]{3,20}$/.test(uname)) {
          throw new Error("Username must be 3–20 characters: letters, numbers, dot or underscore.");
        }
        const { data: taken } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", uname)
          .maybeSingle();
        if (taken) throw new Error("That username is already taken.");
        const normalizedEmail = email.trim().toLowerCase();
        const result = await sendAuthEmailAction({
          data: {
            type: "signup",
            email: normalizedEmail,
            password,
            fullName: fullName.trim(),
            username: uname,
          },
        });
        if (!result.sent) throw new Error(result.error);
        setPendingEmail(normalizedEmail);
        toast.success("Account created. Check your inbox to confirm your email.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (/confirm/i.test(error.message)) setPendingEmail(email);
        throw error;
      }
      const blocked = await getBlockingAccountState();
      if (blocked) {
        await supabase.auth.signOut();
        setBlockedState(blocked);
        throw new Error(
          accountStateMessage(blocked) ?? "This account is not available. Contact support.",
        );
      }
      setBlockedState(null);
      navigate({ to: search.redirect ?? "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (!pendingEmail) return;
    setLoading(true);
    try {
      const result = await sendAuthEmailAction({
        data: { type: "resend", email: pendingEmail },
      });
      if (!result.sent) throw new Error(result.error);
      toast.success("Confirmation link sent.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not resend the confirmation email.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter your email address first, then tap “Forgot password”.");
      return;
    }
    setLoading(true);
    try {
      const result = await sendAuthEmailAction({
        data: { type: "recovery", email: email.trim().toLowerCase() },
      });
      if (!result.sent) throw new Error(result.error);
      toast.success("If that address has an account, a reset link is on its way.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not send the password reset email.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
        <BrandMark className="text-primary-foreground [&_span]:text-primary-foreground" />
        <div>
          <p className="max-w-md font-display text-4xl leading-tight md:text-5xl">
            Banking with clarity, care, and craft.
          </p>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/80">
            A modern bank built around your day — checking, savings, cards, loans, and human
            support.
          </p>
          <div className="mt-8 h-40 w-64 rounded-2xl bg-primary-dark p-5 ring-1 ring-primary-foreground/15">
            <p className="text-xs opacity-70">Stable Finance</p>
            <p className="mt-8 font-mono tracking-widest">•••• 4218</p>
            <p className="mt-1 text-xs opacity-70">Available</p>
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">Federally insured (illustrative).</p>
      </div>
      <div className="flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 md:hidden">
            <BrandMark />
          </div>
          <h1 className="font-display text-3xl">
            {mode === "signin" ? "Sign in to Stable Finance" : "Enroll in Stable Finance"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin"
              ? "Welcome back. Access your accounts securely."
              : "Open your account in less than a minute."}
          </p>

          {blockedMessage && (
            <div className="mt-5 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
              <p className="font-semibold text-destructive">Account access restricted</p>
              <p className="mt-1 text-muted-foreground">{blockedMessage}</p>
              <a href="/contact" className="mt-2 inline-block font-medium underline">
                Contact support
              </a>
            </div>
          )}

          {pendingEmail && (
            <div className="mt-5 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
              <p className="font-semibold">Confirm your email</p>
              <p className="mt-1 text-muted-foreground">
                We sent a confirmation link to{" "}
                <span className="font-medium text-foreground">{pendingEmail}</span>. Open it to
                activate your accounts and sign in.
              </p>
              <Button
                type="button"
                variant="link"
                onClick={resend}
                disabled={loading}
                className="mt-2 h-auto p-0 font-semibold text-brand-blue underline"
              >
                Resend the link
              </Button>
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <>
                <div>
                  <Label htmlFor="fn">Full name</Label>
                  <Input
                    id="fn"
                    className="bg-card"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="un">Username</Label>
                  <Input
                    id="un"
                    className="bg-card"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={20}
                    autoComplete="username"
                    placeholder="e.g. jordan_m"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    3–20 characters. Letters, numbers, dot or underscore.
                  </p>
                </div>
              </>
            )}
            <div>
              <Label htmlFor="e">Email</Label>
              <Input
                id="e"
                className="bg-card"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <div className="relative">
                <Input
                  id="p"
                  className="bg-card pr-10"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-9 w-9"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={loading}
            >
              {loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Enroll now"}
            </Button>
          </form>

          {mode === "signin" && (
            <p className="mt-3 text-center text-sm">
              <Button
                type="button"
                variant="link"
                onClick={forgotPassword}
                disabled={loading}
                className="h-auto p-0 text-muted-foreground underline hover:text-foreground"
              >
                Forgot password?
              </Button>
            </p>
          )}

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Stable Finance?" : "Already a member?"}{" "}
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 font-semibold text-brand-blue underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Enroll now" : "Sign in"}
            </Button>
          </p>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <a href="/" className="hover:underline">
              ← Back to site
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
