import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { BrandMark } from "@/components/brand";

export const Route = createFileRoute("/auth/reset")({
  head: () => ({
    meta: [
      { title: "Choose a new password · Stable Finance Bank" },
      { name: "description", content: "Set a new password for your Stable Finance Bank online banking profile." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Choose a new password · Stable Finance Bank" },

      { property: "og:description", content: "Set a new password for your online banking profile." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPage,
});

function ResetPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) throw new Error("This reset link has expired. Request a new one from the sign-in page.");
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated.");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm">
        <BrandMark />
        <h1 className="mt-6 font-display text-3xl">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">At least 8 characters. Use something you don't reuse elsewhere.</p>
        <form onSubmit={submit} className="mt-6 space-y-3">
          <div>
            <Label htmlFor="np">New password</Label>
            <Input id="np" className="bg-card" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" />
          </div>
          <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
            {loading ? "Saving…" : "Update password"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground"><a href="/auth" className="hover:underline">← Back to sign in</a></p>
      </div>
    </div>
  );
}
