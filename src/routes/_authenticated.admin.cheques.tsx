import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminChequesQuery, adminProfileLookupQuery } from "@/lib/admin-queries";
import { formatUSD } from "@/lib/queries";
import { SignedDoc } from "@/components/admin-doc";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendCustomerNotification } from "@/lib/mail.functions";

export const Route = createFileRoute("/_authenticated/admin/cheques")({
  component: ChequeQueue,
});

const FILTERS = ["pending", "accepted", "rejected", "all"] as const;

function ChequeQueue() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("pending");
  const { data: rows } = useQuery(adminChequesQuery);
  const { data: people } = useQuery(adminProfileLookupQuery);
  const list = (rows ?? []).filter((c) => filter === "all" || c.status === filter);

  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Deposits</p>
      <h1 className="font-display text-3xl">Cheque approval queue</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`rounded-full border px-3 py-1 text-xs capitalize ${filter === f ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{f}</button>
        ))}
      </div>
      <div className="mt-6 space-y-4">
        {list.map((c) => (
          <ChequeCard key={c.id} c={c as never} who={people?.get(c.user_id)} onDone={() => qc.invalidateQueries({ queryKey: ["admin"] })} />
        ))}
        {list.length === 0 && <p className="rounded-xl border bg-card px-5 py-10 text-center text-sm text-muted-foreground">Nothing in this queue.</p>}
      </div>
    </div>
  );
}

type Cheque = {
  id: string; user_id: string; amount: number | string; status: string; admin_notes: string | null;
  front_url: string | null; back_url: string | null; created_at: string;
};

function ChequeCard({ c, who, onDone }: { c: Cheque; who?: { email: string; full_name: string | null; username: string | null }; onDone: () => void }) {
  const [notes, setNotes] = useState("");

  const decide = useMutation({
    mutationFn: async (approve: boolean) => {
      const { error } = await (supabase.rpc as any)("admin_decide_cheque", { _id: c.id, _approve: approve, _notes: notes || null });
      if (error) throw error;
      void sendCustomerNotification({
        data: {
          userId: c.user_id,
          template: "cheque_decision",
          subject: approve ? "Cheque deposit accepted" : "Cheque deposit rejected",
          title: approve ? "Your cheque deposit cleared" : "We could not accept your cheque",
          intro: approve
            ? "Your mobile cheque deposit was reviewed and credited to your account."
            : "Your mobile cheque deposit was reviewed and could not be accepted.",
          rows: [
            ["Amount", formatUSD(c.amount)],
            ["Submitted", new Date(c.created_at).toLocaleString()],
            ["Notes", notes || "—"],
          ] as [string, string][],
        },
      }).catch(() => {});
      return approve;
    },
    onSuccess: (approve) => { toast.success(approve ? "Deposit accepted and credited" : "Deposit rejected"); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Decision failed"),
  });

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{formatUSD(c.amount)}</p>
          <p className="font-mono text-xs text-muted-foreground">
            {who?.full_name ?? who?.email ?? c.user_id.slice(0, 8)} · @{who?.username ?? "—"} · {new Date(c.created_at).toLocaleString()}
          </p>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-[11px] capitalize">{c.status}</span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:max-w-lg">
        <SignedDoc bucket="deposits" path={c.front_url} label="Cheque front" />
        <SignedDoc bucket="deposits" path={c.back_url} label="Cheque back" />
      </div>
      {c.status === "pending" ? (
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
          <div><Label>Notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => decide.mutate(true)} disabled={decide.isPending}>Accept &amp; credit</Button>
            <Button size="sm" variant="destructive" onClick={() => decide.mutate(false)} disabled={decide.isPending}>Reject</Button>
          </div>
        </div>
      ) : (
        c.admin_notes && <p className="mt-3 text-sm text-muted-foreground">Notes: {c.admin_notes}</p>
      )}
    </div>
  );
}
