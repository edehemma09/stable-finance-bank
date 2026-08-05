import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminLoansQuery, adminProfileLookupQuery } from "@/lib/admin-queries";
import { formatUSD } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendCustomerNotification } from "@/lib/mail.functions";

export const Route = createFileRoute("/_authenticated/admin/loans")({
  component: LoanQueue,
});

const FILTERS = ["pending", "active", "rejected", "paid", "all"] as const;

function LoanQueue() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const { data: rows } = useQuery(adminLoansQuery);
  const { data: people } = useQuery(adminProfileLookupQuery);
  const list = (rows ?? []).filter((l) => filter === "all" || l.status === filter);

  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Credit
      </p>
      <h1 className="font-display text-3xl">Loan decisions</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1 text-xs capitalize ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {list.map((l) => (
          <LoanCard
            key={l.id}
            l={l as never}
            who={people?.get(l.user_id)}
            onDone={() => qc.invalidateQueries({ queryKey: ["admin"] })}
          />
        ))}
        {list.length === 0 && (
          <p className="rounded-xl border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
            Nothing in this queue.
          </p>
        )}
      </div>
    </div>
  );
}

type Loan = {
  id: string;
  user_id: string;
  kind: string;
  nickname: string | null;
  principal: number | string;
  balance: number | string;
  rate: number | string;
  term_months: number;
  monthly_payment: number | string;
  status: string;
  created_at: string;
  decision_notes: string | null;
};

function LoanCard({
  l,
  who,
  onDone,
}: {
  l: Loan;
  who?: { email: string; full_name: string | null; username: string | null };
  onDone: () => void;
}) {
  const [notes, setNotes] = useState("");

  const decide = useMutation({
    mutationFn: async (approve: boolean) => {
      const { error } = await (supabase.rpc as any)("admin_decide_loan", {
        _loan_id: l.id,
        _approve: approve,
        _notes: notes || null,
      });
      if (error) throw error;
      void sendCustomerNotification({
        data: {
          userId: l.user_id,
          template: "loan_decision",
          subject: approve ? "Your loan is approved" : "Your loan application was declined",
          title: approve ? "Loan approved and funded" : "Loan application declined",
          intro: approve
            ? "Your application has been approved and the funds were deposited into your account."
            : "After review we are unable to approve this application at this time.",
          rows: [
            ["Product", l.nickname ?? l.kind],
            ["Amount", formatUSD(l.principal)],
            ["Rate", `${Number(l.rate)}%`],
            ["Term", `${l.term_months} months`],
            ["Notes", notes || "—"],
          ] as [string, string][],
        },
      }).catch(() => {});
      return approve;
    },
    onSuccess: (approve) => {
      toast.success(approve ? "Loan approved and funded" : "Loan declined");
      onDone();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Decision failed"),
  });

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">
            {l.nickname ?? l.kind} · {formatUSD(l.principal)}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {who?.full_name ?? who?.email ?? l.user_id.slice(0, 8)} · @{who?.username ?? "—"} ·
            applied {new Date(l.created_at).toLocaleDateString()}
          </p>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-[11px] capitalize">{l.status}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Rate</p>
          <p className="font-mono">{Number(l.rate)}%</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Term</p>
          <p className="font-mono">{l.term_months} mo</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Monthly</p>
          <p className="font-mono">{formatUSD(l.monthly_payment)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="font-mono">{formatUSD(l.balance)}</p>
        </div>
      </div>
      {l.status === "pending" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <Label>Decision notes</Label>
            <Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => decide.mutate(true)} disabled={decide.isPending}>
              Approve &amp; fund
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => decide.mutate(false)}
              disabled={decide.isPending}
            >
              Decline
            </Button>
          </div>
        </div>
      ) : (
        l.decision_notes && (
          <p className="mt-3 text-sm text-muted-foreground">Notes: {l.decision_notes}</p>
        )
      )}
    </div>
  );
}
