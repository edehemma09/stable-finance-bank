import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myLoansQuery, myAccountsQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { notifyByEmail } from "@/lib/notify";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/loans")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myLoansQuery);
    context.queryClient.ensureQueryData(myAccountsQuery);
  },
  head: () => ({
    meta: [
      { title: "Loans — Stable Finance Bank" },
      { name: "description", content: "Apply for auto, personal, mortgage and student loans, track balances and make payments." },
    ],
  }),
  component: Loans,
});

const PRODUCTS: Record<string, { label: string; rate: number; term: number }> = {
  auto: { label: "Auto loan", rate: 0.0649, term: 60 },
  personal: { label: "Personal loan", rate: 0.0899, term: 36 },
  mortgage: { label: "Mortgage", rate: 0.0625, term: 360 },
  student: { label: "Student loan", rate: 0.0549, term: 120 },
};

function payment(principal: number, rate: number, months: number) {
  const r = rate / 12;
  return r === 0 ? principal / months : (principal * r) / (1 - Math.pow(1 + r, -months));
}

const STATUS_TONE: Record<string, string> = {
  pending: "bg-warning/15 text-warning-foreground border-warning/40",
  active: "bg-success/10 text-success border-success/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  closed: "bg-muted text-muted-foreground border-border",
  paid: "bg-muted text-muted-foreground border-border",
};

function Loans() {
  const { data: loans } = useSuspenseQuery(myLoansQuery);
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const qc = useQueryClient();
  const [kind, setKind] = useState("auto");
  const [amount, setAmount] = useState("15000");
  const [funding, setFunding] = useState("");

  const p = PRODUCTS[kind];
  const est = payment(Number(amount) || 0, p.rate, p.term);
  const active = loans.filter((l) => l.status === "active");
  const totalDebt = active.reduce((s, l) => s + Number(l.balance), 0);
  const deposit = accounts.filter((a) => a.type === "checking" || a.type === "savings");

  const apply = useMutation({
    mutationFn: async () => {
      const principal = Number(amount);
      if (!principal || principal <= 0) throw new Error("Enter a valid amount");
      if (!funding) throw new Error("Choose an account to receive the funds");
      const { error } = await (supabase.rpc as never as (n: string, a: unknown) => Promise<{ error: Error | null }>)("apply_for_loan", {
        _kind: kind,
        _nickname: p.label,
        _principal: principal,
        _rate: p.rate,
        _term: p.term,
        _monthly: Number(est.toFixed(2)),
        _funding: funding,
      });
      if (error) throw error;
      notifyByEmail({
        template: "loan_application",
        subject: "Loan application received",
        title: "We received your application",
        intro: `Your ${p.label.toLowerCase()} application is under review. We will email you as soon as a decision is made.`,
        rows: [
          ["Product", p.label],
          ["Amount requested", formatUSD(principal)],
          ["Rate", `${(p.rate * 100).toFixed(2)}% APR`],
          ["Term", `${p.term} months`],
          ["Estimated payment", formatUSD(est)],
        ],
        footnote: "Applications are typically reviewed within one business day.",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Application submitted for review");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const pay = useMutation({
    mutationFn: async (loan: (typeof loans)[number]) => {
      const from = accounts.find((a) => a.type === "checking") ?? accounts[0];
      if (!from) throw new Error("No funding account");
      const amt = Math.min(Number(loan.monthly_payment), Number(loan.balance));
      const { error } = await (supabase.rpc as never as (n: string, a: unknown) => Promise<{ error: Error | null }>)("pay_loan", {
        _loan_id: loan.id,
        _from: from.id,
        _amount: amt,
      });
      if (error) throw error;
      notifyByEmail({
        template: "loan_payment",
        subject: "Loan payment posted",
        title: "Your payment was posted",
        intro: `We applied your payment to ${loan.nickname ?? loan.kind}.`,
        rows: [
          ["Loan", loan.nickname ?? loan.kind],
          ["Amount", formatUSD(amt)],
          ["Paid from", `${from.nickname ?? from.type} ••${from.account_number.slice(-4)}`],
          ["Remaining balance", formatUSD(Number(loan.balance) - amt)],
        ],
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      toast.success("Payment posted");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold text-primary">Loans</h1>
      <p className="mt-1 text-sm text-muted-foreground">Apply, track balances, and make payments.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {loans.length === 0 && (
            <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center">
              <Landmark className="mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No loans yet. Use the calculator to apply.</p>
            </div>
          )}
          {loans.map((l) => {
            const paid = 1 - Number(l.balance) / Math.max(Number(l.principal), 1);
            const isActive = l.status === "active";
            return (
              <div key={l.id} className="rounded-2xl border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-bold text-primary">{l.nickname ?? l.kind}</p>
                    <p className="text-xs text-muted-foreground">
                      {(Number(l.rate) * 100).toFixed(2)}% APR · {l.term_months} mo
                      {isActive && l.next_payment_date ? ` · next ${l.next_payment_date}` : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-display text-2xl font-bold text-primary">{formatUSD(isActive ? l.balance : l.principal)}</p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STATUS_TONE[l.status] ?? STATUS_TONE.closed}`}>
                      {l.status}
                    </span>
                  </div>
                </div>
                {isActive && (
                  <>
                    <div className="mt-4 h-2 rounded-full bg-muted">
                      <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.min(100, Math.max(0, paid * 100))}%` }} />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Monthly {formatUSD(l.monthly_payment)}</span>
                      <Button size="sm" onClick={() => pay.mutate(l)} disabled={pay.isPending || Number(l.balance) <= 0}>
                        Make payment
                      </Button>
                    </div>
                  </>
                )}
                {l.status === "pending" && (
                  <p className="mt-4 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                    Under review by our lending team. You'll be emailed when a decision is made.
                  </p>
                )}
                {l.status === "rejected" && (
                  <p className="mt-4 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    This application was declined. Contact support for details.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-2xl border bg-card p-5">
          <h2 className="font-display text-lg font-bold text-primary">Apply for a loan</h2>
          <div className="mt-4 space-y-3">
            <div>
              <Label>Loan type</Label>
              <Select value={kind} onValueChange={setKind}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PRODUCTS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Amount</Label><Input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></div>
            <div>
              <Label>Deposit funds to</Label>
              <Select value={funding} onValueChange={setFunding}>
                <SelectTrigger><SelectValue placeholder="Choose account" /></SelectTrigger>
                <SelectContent>
                  {deposit.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.nickname ?? a.type} ••{a.account_number.slice(-4)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-xl bg-muted p-4 text-sm">
              <p className="text-muted-foreground">Estimated monthly payment</p>
              <p className="font-display text-2xl font-bold text-primary">{formatUSD(est)}</p>
              <p className="text-xs text-muted-foreground">{(p.rate * 100).toFixed(2)}% APR · {p.term} months</p>
            </div>
            <Button className="w-full" onClick={() => apply.mutate()} disabled={apply.isPending || !funding}>
              {apply.isPending ? "Submitting…" : "Submit application"}
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Total outstanding debt: {formatUSD(totalDebt)}</p>
        </div>
      </div>
    </div>
  );
}
