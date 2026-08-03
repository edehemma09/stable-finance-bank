import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminKycQuery, adminProfileLookupQuery } from "@/lib/admin-queries";
import { SignedDoc } from "@/components/admin-doc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { sendCustomerNotification } from "@/lib/mail.functions";

export const Route = createFileRoute("/_authenticated/admin/kyc")({
  component: KycQueue,
});

const FILTERS = ["submitted", "pending", "verified", "rejected", "all"] as const;

function KycQueue() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("submitted");
  const { data: rows } = useQuery(adminKycQuery);
  const { data: people } = useQuery(adminProfileLookupQuery);

  const list = (rows ?? []).filter((r) => filter === "all" || r.status === filter);

  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Compliance</p>
      <h1 className="font-display text-3xl">KYC review queue</h1>
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
        {list.map((s) => (
          <KycCard key={s.id} s={s} who={people?.get(s.user_id)} onDone={() => qc.invalidateQueries({ queryKey: ["admin"] })} />
        ))}
        {list.length === 0 && (
          <p className="rounded-xl border bg-card px-5 py-10 text-center text-sm text-muted-foreground">Nothing in this queue.</p>
        )}
      </div>
    </div>
  );
}

type Submission = {
  id: string; user_id: string; doc_type: string; status: string; notes: string | null;
  doc_front_url: string | null; doc_back_url: string | null; selfie_url: string | null; submitted_at: string;
};

function KycCard({ s, who, onDone }: { s: Submission; who?: { email: string; full_name: string | null; username: string | null }; onDone: () => void }) {
  const [notes, setNotes] = useState(s.notes ?? "");
  const [limit, setLimit] = useState("");

  const decide = useMutation({
    mutationFn: async (status: "verified" | "rejected") => {
      const { error } = await (supabase.rpc as any)("admin_decide_kyc", {
        _submission_id: s.id,
        _status: status,
        _notes: notes || null,
        _limit: limit ? Number(limit) : null,
      });

      if (error) throw error;
      void sendCustomerNotification({
        data: {
          userId: s.user_id,
          template: "kyc_decision",
          subject: `Identity verification ${status}`,
          title: status === "verified" ? "Your identity is verified" : "We could not verify your identity",
          intro: status === "verified"
            ? "Your documents passed review. Your account limits have been updated."
            : "Our compliance team could not verify the documents you submitted.",
          rows: [
            ["Status", status],
            ["Reviewed", new Date().toLocaleString()],
            ["Notes", notes || "—"],
          ],
        },
      }).catch(() => {});
      return status;
    },
    onSuccess: (status) => { toast.success(`Submission ${status}`); onDone(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Decision failed"),
  });

  const pending = s.status === "submitted" || s.status === "pending";

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{who?.full_name ?? who?.email ?? s.user_id.slice(0, 8)}</p>
          <p className="font-mono text-xs text-muted-foreground">
            @{who?.username ?? "—"} · {s.doc_type} · {new Date(s.submitted_at).toLocaleString()}
          </p>
        </div>
        <span className="rounded-full border px-2 py-0.5 text-[11px] capitalize">{s.status}</span>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SignedDoc bucket="kyc" path={s.doc_front_url} label="Document front" />
        <SignedDoc bucket="kyc" path={s.doc_back_url} label="Document back" />
        <SignedDoc bucket="kyc" path={s.selfie_url} label="Selfie" />
      </div>

      {pending ? (
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_200px]">
          <div><Label>Reviewer notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div>
            <Label>New daily limit (optional)</Label>
            <Input type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="e.g. 25000" />
            <div className="mt-2 flex gap-2">
              <Button size="sm" onClick={() => decide.mutate("verified")} disabled={decide.isPending}>Approve</Button>
              <Button size="sm" variant="destructive" onClick={() => decide.mutate("rejected")} disabled={decide.isPending}>Reject</Button>
            </div>
          </div>
        </div>
      ) : (
        s.notes && <p className="mt-4 text-sm text-muted-foreground">Notes: {s.notes}</p>
      )}
    </div>
  );
}
