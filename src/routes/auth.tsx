import { createFileRoute, redirect, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand";


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
  const [mode, setMode] = useState<"signin" | "signup">(search.mode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

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
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: fullName, username: uname }, emailRedirectTo: `${window.location.origin}/app` },
        });
        if (error) throw error;
        toast.success("Account created. Signing you in…");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: search.redirect ?? "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }




  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden bg-primary p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
        <BrandMark className="text-primary-foreground [&_span]:text-primary-foreground" />
        <div>
          <p className="max-w-md font-display text-4xl leading-tight md:text-5xl">Banking with clarity, care, and craft.</p>
          <p className="mt-4 max-w-md text-sm text-primary-foreground/80">A modern bank built around your day — checking, savings, cards, loans, and human support.</p>
          <div className="mt-8 h-40 w-64 rounded-2xl bg-primary-dark p-5 ring-1 ring-primary-foreground/15">
            <p className="text-xs opacity-70">Meridian</p>
            <p className="mt-8 font-mono tracking-widest">•••• 4218</p>
            <p className="mt-1 text-xs opacity-70">Available</p>
          </div>
        </div>
        <p className="text-xs text-primary-foreground/50">Federally insured (illustrative).</p>
      </div>
      <div className="flex items-center justify-center bg-surface p-6">
        <div className="w-full max-w-sm">
          <div className="mb-6 md:hidden"><BrandMark /></div>
          <h1 className="font-display text-3xl">{mode === "signin" ? "Sign in to Meridian" : "Enroll in Meridian"}</h1>
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
            <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Enroll now"}</Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New to Meridian?" : "Already a member?"}{" "}
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
