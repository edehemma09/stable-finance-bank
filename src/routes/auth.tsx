import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand";
import { signUpWithBrandedEmail, resendConfirmationEmail, sendPasswordResetEmail } from "@/lib/auth-mail.functions";




type Search = { mode?: "signin" | "signup"; redirect?: string };

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    mode: s.mode === "signup" ? "signup" : "signin",
    redirect: typeof s.redirect === "string" ? s.redirect : undefined,
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
  const signUpFn = useServerFn(signUpWithBrandedEmail);
  const resendFn = useServerFn(resendConfirmationEmail);
  const resetFn = useServerFn(sendPasswordResetEmail);
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const uname = username.trim().toLowerCase();
        if (!/^[a-z0-9_.]{3,20}$/.test(uname)) {
          throw new Error("Username must be 3–20 characters: letters, numbers, dot or underscore.");
        }
        const { data: taken } = await supabase.from("profiles").select("id").eq("username", uname).maybeSingle();
        if (taken) throw new Error("That username is already taken.");
        const res = await signUpFn({
          data: { email, password, fullName, username: uname, origin: window.location.origin },
        });
        if (!res.sent) throw new Error(res.error ?? "We couldn't send your confirmation email.");
        setPendingEmail(email);
        toast.success("Account created. Check your inbox to confirm your email.");
        return;
      }
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (/confirm/i.test(error.message)) setPendingEmail(email);
        throw error;
      }
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
    const res = await resendFn({ data: { email: pendingEmail, origin: window.location.origin } });
    setLoading(false);
    toast[res.error === "already_confirmed" ? "info" : "success"](
      res.error === "already_confirmed" ? "That address is already confirmed — just sign in." : "Confirmation link sent.",
    );
  }

  async function forgotPassword() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter your email address first, then tap “Forgot password”.");
      return;
    }
    setLoading(true);
    await resetFn({ data: { email, origin: window.location.origin } });
    setLoading(false);
    toast.success("If that address has an account, a reset link is on its way.");
  }





  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
        <BrandMark className="text-primary-foreground [&_span]:text-primary-foreground" />
        <div>
          <p className="max-w-md font-display text-4xl leading-tight md:text-5xl">Banking with clarity, care, and craft.</p>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/80">A modern bank built around your day — checking, savings, cards, loans, and human support.</p>
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
          <div className="mb-6 md:hidden"><BrandMark /></div>
          <h1 className="font-display text-3xl">{mode === "signin" ? "Sign in to Stable Finance" : "Enroll in Stable Finance"}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "signin" ? "Welcome back. Access your accounts securely." : "Open your account in less than a minute."}</p>




          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <>
                <div><Label htmlFor="fn">Full name</Label><Input id="fn" className="bg-card" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                <div>
                  <Label htmlFor="un">Username</Label>
                  <Input id="un" className="bg-card" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={20} autoComplete="username" placeholder="e.g. jordan_m" />
                  <p className="mt-1 text-xs text-muted-foreground">3–20 characters. Letters, numbers, dot or underscore.</p>
                </div>
              </>
            )}
            <div><Label htmlFor="e">Email</Label><Input id="e" className="bg-card" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
            <div><Label htmlFor="p">Password</Label><Input id="p" className="bg-card" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></div>

          {pendingEmail && (
            <div className="mt-5 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm">
              <p className="font-semibold">Confirm your email</p>
              <p className="mt-1 text-muted-foreground">
                We sent a confirmation link to <span className="font-medium text-foreground">{pendingEmail}</span>. Open it to
                activate your accounts and sign in.
              </p>
              <button type="button" onClick={resend} disabled={loading} className="mt-2 font-semibold text-brand-blue underline">
                Resend the link
              </button>
            </div>
          )}

          <form onSubmit={submit} className="mt-5 space-y-3">
            {mode === "signup" && (
              <>
                <div><Label htmlFor="fn">Full name</Label><Input id="fn" className="bg-card" value={fullName} onChange={(e) => setFullName(e.target.value)} required /></div>
                <div>
                  <Label htmlFor="un">Username</Label>
                  <Input id="un" className="bg-card" value={username} onChange={(e) => setUsername(e.target.value)} required minLength={3} maxLength={20} autoComplete="username" placeholder="e.g. jordan_m" />
                  <p className="mt-1 text-xs text-muted-foreground">3–20 characters. Letters, numbers, dot or underscore.</p>
                </div>
              </>
            )}
            <div><Label htmlFor="e">Email</Label><Input id="e" className="bg-card" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></div>
            <div><Label htmlFor="p">Password</Label><Input id="p" className="bg-card" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete={mode === "signup" ? "new-password" : "current-password"} /></div>
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Enroll now"}</Button>
          </form>

          {mode === "signin" && (
            <p className="mt-3 text-center text-sm">
              <button type="button" onClick={forgotPassword} disabled={loading} className="text-muted-foreground underline hover:text-foreground">
                Forgot password?
              </button>
            </p>
          )}


          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Stable Finance?" : "Already a member?"}{" "}
            <button className="font-semibold text-brand-blue underline" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
              {mode === "signin" ? "Enroll now" : "Sign in"}
            </button>
          </p>
          <p className="mt-6 text-center text-xs text-muted-foreground"><a href="/" className="hover:underline">← Back to site</a></p>
        </div>
      </div>
    </div>
  );
}
