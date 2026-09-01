import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandMark } from "@/components/brand";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/email-verified")({
  head: () => ({
    meta: [
      { title: "Email verified — Stable Finance Bank" },
      { name: "description", content: "Confirm your email address to activate your Stable Finance Bank accounts." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Email verified — Stable Finance Bank" },
      { property: "og:description", content: "Your email address has been confirmed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EmailVerifiedPage,
});

type PageState = "loading" | "verified" | "invalid";

function EmailVerifiedPage() {
  const navigate = useNavigate();
  const [state, setState] = useState<PageState>("loading");
  const [email, setEmail] = useState("");
  const [resending, setResending] = useState(false);

  useEffect(() => {
    let settled = false;
    const settle = (s: PageState) => {
      if (!settled) {
        settled = true;
        setState(s);
      }
    };

    // Supabase processes the verification token in the URL automatically.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session) settle("verified");
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) settle("verified");
    });

    const timer = setTimeout(() => settle("invalid"), 3500);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter the email address you enrolled with.");
      return;
    }
    setResending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: `${window.location.origin}/email-verified` },
    });
    setResending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("A fresh confirmation link is on its way.");
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
            <p className="text-sm text-muted-foreground">Confirming your email address…</p>
          </div>
        )}

        {state === "verified" && (
          <div>
            <h1 className="font-display text-3xl">Email verified</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your email address has been confirmed and your Stable Finance Bank accounts are now active.
            </p>
            <Button
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => navigate({ to: "/app" })}
            >
              Continue to my accounts
            </Button>
            <Button variant="outline" className="mt-2 w-full" onClick={() => navigate({ to: "/auth" })}>
              Go to sign in
            </Button>
          </div>
        )}

        {state === "invalid" && (
          <div>
            <h1 className="font-display text-3xl">Link expired</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              This confirmation link is invalid or has expired. Enter your email below and we'll send a fresh one.
            </p>
            <form onSubmit={resend} className="mt-6 space-y-3">
              <Input
                type="email"
                className="bg-card"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <Button
                type="submit"
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                disabled={resending}
              >
                {resending ? "Sending…" : "Resend verification email"}
              </Button>
            </form>
            <Button variant="outline" className="mt-2 w-full" onClick={() => navigate({ to: "/auth" })}>
              Back to sign in
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
