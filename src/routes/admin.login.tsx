import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administrator Sign In — Stable Finance Bank" },
      { name: "description", content: "Secure sign-in for Stable Finance Bank operations staff and administrators." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Administrator Sign In — Stable Finance Bank" },
      { property: "og:description", content: "Secure sign-in for Stable Finance Bank operations staff." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    const r = (roles ?? []).map((x) => x.role as string);
    if (r.includes("admin") || r.includes("support")) throw redirect({ to: "/admin" });
  },
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
      const r = (roles ?? []).map((x) => x.role as string);
      if (!r.includes("admin") && !r.includes("support")) {
        await supabase.auth.signOut();
        throw new Error("This account does not have administrator access.");
      }
      navigate({ to: "/admin" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-6">
      <div className="w-full max-w-sm rounded-2xl border border-primary-foreground/10 bg-card p-8 shadow-xl">
        <div className="flex items-center gap-2 text-primary">
          <ShieldCheck className="h-5 w-5" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Operations Console</span>
        </div>
        <h1 className="mt-3 font-display text-3xl">Administrator sign in</h1>
        <p className="mt-1 text-sm text-muted-foreground">Restricted access. All activity is logged.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <Label htmlFor="ae">Work email</Label>
            <Input id="ae" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="ap">Password</Label>
            <Input id="ap" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? "Verifying…" : "Sign in"}</Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Customer? <a href="/auth" className="underline">Sign in to online banking</a>
        </p>
      </div>
    </div>
  );
}
