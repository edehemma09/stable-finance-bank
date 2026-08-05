import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myAccountsQuery, myProfileQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { notifyByEmail } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PiggyBank } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/retirement")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myAccountsQuery);
    context.queryClient.ensureQueryData(myProfileQuery);
  },
  component: Retirement,
});

const IRS_LIMIT = 7000;

function Retirement() {
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const { data: profile } = useSuspenseQuery(myProfileQuery);
  const qc = useQueryClient();
  const [amount, setAmount] = useState("500");

  const ira = accounts.find((a) => a.type === "ira");
  const funding =
    accounts.find((a) => a.type === "checking") ?? accounts.find((a) => a.id !== ira?.id);
  const contributed = Number(
    ira?.metadata &&
      typeof ira.metadata === "object" &&
      "ytd" in (ira.metadata as Record<string, unknown>)
      ? (ira.metadata as Record<string, number>).ytd
      : 0,
  );
  const remaining = Math.max(0, IRS_LIMIT - contributed);

  const openIra = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const num = Math.floor(1000000000 + Math.random() * 8999999999).toString();
      const { error } = await supabase.from("accounts").insert({
        user_id: u.id,
        type: "ira",
        nickname: "Traditional IRA",
        account_number: num,
        balance: 0,
        available_balance: 0,
        interest_rate: 0.0525,
        metadata: { ytd: 0 },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("IRA opened");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const contribute = useMutation({
    mutationFn: async () => {
      const amt = Number(amount);
      if (!ira || !funding) throw new Error("Open an IRA and fund an account first");
      if (!amt || amt <= 0) throw new Error("Enter a valid amount");
      if (amt > remaining)
        throw new Error(`IRS annual limit reached — ${formatUSD(remaining)} remaining`);
      const { error } = await (
        supabase.rpc as never as (n: string, a: unknown) => Promise<{ error: Error | null }>
      )("contribute_ira", {
        _ira: ira.id,
        _from: funding.id,
        _amount: amt,
      });
      if (error) throw error;
      notifyByEmail({
        template: "ira_contribution",
        subject: "IRA contribution posted",
        title: "Your contribution was posted",
        intro: "We moved your contribution into your retirement account.",
        rows: [
          ["Amount", formatUSD(amt)],
          ["From", `${funding.nickname ?? funding.type} ••${funding.account_number.slice(-4)}`],
          ["IRA", `••${ira.account_number.slice(-4)}`],
          [
            `${new Date().getFullYear()} contributed`,
            `${formatUSD(contributed + amt)} of ${formatUSD(IRS_LIMIT)}`,
          ],
        ],
        footnote: "Keep this for your tax records. Form 5498 is issued after year-end processing.",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Contribution posted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold text-primary">Retirement & IRS center</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        IRA contributions, annual IRS limits, and tax documents.
      </p>

      {!ira ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed p-10 text-center">
          <PiggyBank className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">You don't have a retirement account yet.</p>
          <Button className="mt-4" onClick={() => openIra.mutate()} disabled={openIra.isPending}>
            Open a Traditional IRA
          </Button>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
              <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                Traditional IRA · …{ira.account_number.slice(-4)}
              </p>
              <p className="mt-2 font-display text-4xl font-bold">{formatUSD(ira.balance)}</p>
              <p className="text-xs opacity-70">
                {(Number(ira.interest_rate) * 100).toFixed(2)}% projected annual return
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-primary">
                  {new Date().getFullYear()} IRS contribution limit
                </span>
                <span className="text-muted-foreground">
                  {formatUSD(contributed)} of {formatUSD(IRS_LIMIT)}
                </span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-accent"
                  style={{ width: `${(contributed / IRS_LIMIT) * 100}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatUSD(remaining)} remaining this tax year.
              </p>
            </div>
            <div className="rounded-2xl border bg-card p-5">
              <h2 className="font-display text-lg font-bold text-primary">Tax documents</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {[
                  "Form 5498 — IRA contribution information",
                  "Form 1099-INT — interest income",
                  "Form 1099-R — retirement distributions",
                ].map((d) => (
                  <li
                    key={d}
                    className="flex items-center justify-between border-b pb-2 last:border-0"
                  >
                    <span className="min-w-0 truncate text-muted-foreground">{d}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        toast.info("Document will be available after year-end processing")
                      }
                    >
                      View
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="h-fit rounded-2xl border bg-card p-5">
            <h2 className="font-display text-lg font-bold text-primary">Make a contribution</h2>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Amount</Label>
                <Input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                From {funding?.nickname ?? "checking"} · daily limit{" "}
                {formatUSD(profile?.transaction_limit ?? 5000)}
              </p>
              <Button
                className="w-full"
                onClick={() => contribute.mutate()}
                disabled={contribute.isPending}
              >
                Contribute
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
