import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { myPayeesQuery, myAccountsQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { notifyByEmail } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/bills")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myPayeesQuery);
    context.queryClient.ensureQueryData(myAccountsQuery);
  },
  component: Bills,
});

function Bills() {
  const { data: payees } = useSuspenseQuery(myPayeesQuery);
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const qc = useQueryClient();
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<string | null>(null);

  const addPayee = useMutation({
    mutationFn: async (v: { name: string; category: string; account_number: string }) => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase.from("payees").insert({ ...v, user_id: u.id }); if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me","payees"] }); setAddOpen(false); toast.success("Payee added"); },
  });

  const payBill = useMutation({
    mutationFn: async (v: { payee_id: string; from_account_id: string; amount: number; memo?: string }) => {
      const payee = payees.find((p) => p.id === v.payee_id);
      const from = accounts.find((a) => a.id === v.from_account_id);
      const { error } = await (supabase.rpc as never as (n: string, a: unknown) => Promise<{ error: Error | null }>)("pay_bill", {
        _payee_id: v.payee_id,
        _from: v.from_account_id,
        _amount: v.amount,
        _memo: v.memo ?? null,
      });
      if (error) throw error;
      notifyByEmail({
        template: "bill_payment",
        subject: "Bill payment sent",
        title: "Your bill payment is on its way",
        intro: `We sent your payment to ${payee?.name ?? "your payee"}.`,
        rows: [
          ["Payee", payee?.name ?? "—"],
          ["Amount", formatUSD(v.amount)],
          ["Paid from", from ? `${from.nickname ?? from.type} ••${from.account_number.slice(-4)}` : "—"],
          ["Memo", v.memo || "—"],
          ["Date", new Date().toLocaleDateString()],
        ],
      });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); setPayOpen(null); toast.success("Bill paid"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });


  return (
    <div className="container-page py-6 md:py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl md:text-4xl">Bill pay</h1>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Add payee</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add a payee</DialogTitle></DialogHeader>
            <AddPayeeForm onSubmit={addPayee.mutate} pending={addPayee.isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-6 space-y-3">
        {payees.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No payees yet. Add one above.</p>}
        {payees.map((p) => (
          <div key={p.id} className="flex items-center justify-between rounded-xl border bg-card p-4">
            <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.category} · ••{p.account_number?.slice(-4)}</p></div>
            <Button size="sm" onClick={() => setPayOpen(p.id)}>Pay</Button>
          </div>
        ))}
      </div>
      <Dialog open={!!payOpen} onOpenChange={(v) => !v && setPayOpen(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pay {payees.find(p => p.id === payOpen)?.name}</DialogTitle></DialogHeader>
          {payOpen && <PayForm payeeId={payOpen} accounts={accounts} onSubmit={payBill.mutate} pending={payBill.isPending} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AddPayeeForm({ onSubmit, pending }: { onSubmit: (v: { name: string; category: string; account_number: string }) => void; pending: boolean }) {
  const [name, setName] = useState(""); const [cat, setCat] = useState("utility"); const [acct, setAcct] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name, category: cat, account_number: acct }); }} className="space-y-3">
      <div><Label>Payee name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
      <div><Label>Category</Label>
        <Select value={cat} onValueChange={setCat}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
          {["utility","rent","credit-card","loan","insurance","other"].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
        </SelectContent></Select>
      </div>
      <div><Label>Account number</Label><Input value={acct} onChange={(e) => setAcct(e.target.value)} required /></div>
      <DialogFooter><Button type="submit" disabled={pending}>{pending ? "Adding…" : "Add"}</Button></DialogFooter>
    </form>
  );
}
function PayForm({ payeeId, accounts, onSubmit, pending }: { payeeId: string; accounts: { id: string; nickname: string | null; type: string; account_number: string; balance: number | string }[]; onSubmit: (v: { payee_id: string; from_account_id: string; amount: number; memo?: string }) => void; pending: boolean }) {
  const [from, setFrom] = useState(""); const [amt, setAmt] = useState(""); const [memo, setMemo] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ payee_id: payeeId, from_account_id: from, amount: Number(amt), memo }); }} className="space-y-3">
      <div><Label>From</Label>
        <Select value={from} onValueChange={setFrom}><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
          <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.nickname ?? a.type} — {formatUSD(a.balance)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Amount</Label><Input type="number" step="0.01" min="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} required /></div>
      <div><Label>Memo</Label><Input value={memo} onChange={(e) => setMemo(e.target.value)} /></div>
      <DialogFooter><Button type="submit" disabled={pending || !from || !amt}>{pending ? "Sending…" : "Pay"}</Button></DialogFooter>
    </form>
  );
}
