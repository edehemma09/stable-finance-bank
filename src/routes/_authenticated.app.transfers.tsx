import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { myAccountsQuery, siteSettingsQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { notifyByEmail } from "@/lib/notify";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/transfers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myAccountsQuery),
  component: Transfers,
});

function Transfers() {
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const [receipt, setReceipt] = useState<{ id: string; amount: number; kind: string; to: string } | null>(null);
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="font-display text-3xl md:text-4xl">Transfer money</h1>
      <p className="mt-1 text-sm text-muted-foreground">Move money between your accounts, to another Meridian member, or externally.</p>
      {receipt ? <Receipt r={receipt} onDone={() => setReceipt(null)} /> : (
        <Tabs defaultValue="same" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="same">Between mine</TabsTrigger>
            <TabsTrigger value="intra">To member</TabsTrigger>
            <TabsTrigger value="ach">ACH</TabsTrigger>
            <TabsTrigger value="wire">Wire</TabsTrigger>
          </TabsList>
          <TabsContent value="same"><SameForm accounts={accounts} onSuccess={setReceipt} /></TabsContent>
          <TabsContent value="intra"><IntraForm accounts={accounts} onSuccess={setReceipt} /></TabsContent>
          <TabsContent value="ach"><ExternalForm kind="ach" accounts={accounts} onSuccess={setReceipt} /></TabsContent>
          <TabsContent value="wire"><ExternalForm kind="wire" accounts={accounts} onSuccess={setReceipt} /></TabsContent>
        </Tabs>
      )}
    </div>
  );
}

type Acc = { id: string; nickname: string | null; type: string; account_number: string; balance: number | string };

function useTransfer(onSuccess: (r: { id: string; amount: number; kind: string; to: string }) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: { from: string; to?: string; external?: Record<string, string>; kind: string; amount: number; memo?: string }) => {
      const { data, error } = await (supabase.rpc as any)("execute_transfer", {
        _from: v.from, _to: v.to ?? null, _external: v.external ?? null, _kind: v.kind, _amount: v.amount, _memo: v.memo ?? null,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: (id, v) => {
      qc.invalidateQueries({ queryKey: ["me"] });
      qc.invalidateQueries({ queryKey: ["account"] });
      toast.success("Transfer completed");
      const to = v.external?.name ?? (accountsCache.get(v.to ?? "") ?? "your account");
      notifyByEmail({
        template: "transfer_receipt",
        subject: "Transfer receipt",
        title: "Your transfer is complete",
        intro: `We processed your ${v.kind.toUpperCase()} transfer. Keep this receipt for your records.`,
        rows: [
          ["Receipt", id.slice(0, 8).toUpperCase()],
          ["Amount", formatUSD(v.amount)],
          ["To", to],
          ["From", accountsCache.get(v.from) ?? "—"],
          ["Method", v.kind.toUpperCase()],
          ["Date", new Date().toLocaleString()],
          ["Memo", v.memo || "—"],
        ],
      });
      onSuccess({ id, amount: v.amount, kind: v.kind, to });
    },

    onError: (e) => toast.error(e instanceof Error ? e.message : "Transfer failed"),
  });
}
const accountsCache = new Map<string, string>();

function AccountSelect({ accounts, value, onChange, label = "From" }: { accounts: Acc[]; value: string; onChange: (v: string) => void; label?: string }) {
  accounts.forEach(a => accountsCache.set(a.id, `${a.nickname ?? a.type} ••${a.account_number.slice(-4)}`));
  return (
    <div><Label>{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Choose account" /></SelectTrigger>
        <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.nickname ?? a.type} ••{a.account_number.slice(-4)} — {formatUSD(a.balance)}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

function SameForm({ accounts, onSuccess }: { accounts: Acc[]; onSuccess: (r: { id: string; amount: number; kind: string; to: string }) => void }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [amt, setAmt] = useState(""); const [memo, setMemo] = useState("");
  const m = useTransfer(onSuccess);
  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate({ from, to, kind: "same", amount: Number(amt), memo }); }} className="mt-4 space-y-4 rounded-xl border bg-card p-6">
      <AccountSelect accounts={accounts} value={from} onChange={setFrom} label="From" />
      <AccountSelect accounts={accounts.filter(a => a.id !== from)} value={to} onChange={setTo} label="To" />
      <div><Label>Amount</Label><Input type="number" step="0.01" min="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} required /></div>
      <div><Label>Memo (optional)</Label><Textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} /></div>
      <Button type="submit" disabled={!from || !to || !amt || m.isPending} className="w-full">{m.isPending ? "Sending…" : "Transfer"}</Button>
    </form>
  );
}

function IntraForm({ accounts, onSuccess }: { accounts: Acc[]; onSuccess: (r: { id: string; amount: number; kind: string; to: string }) => void }) {
  const [from, setFrom] = useState(""); const [target, setTarget] = useState(""); const [amt, setAmt] = useState(""); const [memo, setMemo] = useState("");
  const [found, setFound] = useState<{ account_id: string; display_name: string; masked_account: string } | null>(null);
  const [looking, setLooking] = useState(false);
  const { data: site } = useQuery(siteSettingsQuery);
  const m = useTransfer(onSuccess);

  async function lookup() {
    const q = target.trim();
    if (!q) return;
    setLooking(true);
    const { data, error } = await (supabase.rpc as any)("resolve_transfer_recipient", { _query: q });
    setLooking(false);
    const hit = Array.isArray(data) ? data[0] : data;
    if (error || !hit) { setFound(null); toast.error("No active Meridian member found for that account number or username"); return; }
    setFound(hit as { account_id: string; display_name: string; masked_account: string });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    let dest = found;
    if (!dest) {
      await lookup();
      dest = found;
      if (!dest) return;
    }
    accountsCache.set(dest.account_id, `${dest.display_name} ${dest.masked_account}`);
    m.mutate({ from, to: dest.account_id, kind: "intra", amount: Number(amt), memo });
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4 rounded-xl border bg-card p-6">
      <AccountSelect accounts={accounts} value={from} onChange={setFrom} />
      <div>
        <Label>Recipient account number or username</Label>
        <div className="flex gap-2">
          <Input
            value={target}
            onChange={(e) => { setTarget(e.target.value); setFound(null); }}
            onBlur={() => { if (target.trim() && !found) void lookup(); }}
            required
            placeholder="10-digit account # or @username"
          />
          <Button type="button" variant="outline" onClick={() => void lookup()} disabled={!target.trim() || looking}>
            {looking ? "Checking…" : "Verify"}
          </Button>
        </div>
        {found ? (
          <p className="mt-2 flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Sending to <span className="font-medium">{found.display_name}</span> · {found.masked_account}
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Routing number {site?.routing_number ?? ""} identifies {site?.brand_name ?? "the bank"} — use the member&apos;s account number or username to pick the recipient.
          </p>
        )}
      </div>
      <div><Label>Amount</Label><Input type="number" step="0.01" min="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} required /></div>
      <div><Label>Memo</Label><Textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} /></div>
      <Button type="submit" disabled={!from || !target || !amt || m.isPending} className="w-full">{m.isPending ? "Sending…" : "Send"}</Button>
    </form>
  );
}


function ExternalForm({ accounts, kind, onSuccess }: { accounts: Acc[]; kind: "ach" | "wire"; onSuccess: (r: { id: string; amount: number; kind: string; to: string }) => void }) {
  const [from, setFrom] = useState(""); const [name, setName] = useState(""); const [bank, setBank] = useState(""); const [account, setAccount] = useState(""); const [routing, setRouting] = useState(""); const [amt, setAmt] = useState(""); const [memo, setMemo] = useState("");
  const m = useTransfer(onSuccess);
  return (
    <form onSubmit={(e) => { e.preventDefault(); m.mutate({ from, kind, amount: Number(amt), memo, external: { name, bank, account_number: account, routing_number: routing } }); }} className="mt-4 space-y-4 rounded-xl border bg-card p-6">
      <AccountSelect accounts={accounts} value={from} onChange={setFrom} />
      <div className="grid gap-4 md:grid-cols-2">
        <div><Label>Recipient name</Label><Input value={name} onChange={(e) => setName(e.target.value)} required /></div>
        <div><Label>Bank name</Label><Input value={bank} onChange={(e) => setBank(e.target.value)} required /></div>
        <div><Label>Account number</Label><Input value={account} onChange={(e) => setAccount(e.target.value)} required /></div>
        <div><Label>Routing / SWIFT</Label><Input value={routing} onChange={(e) => setRouting(e.target.value)} required /></div>
      </div>
      <div><Label>Amount</Label><Input type="number" step="0.01" min="0.01" value={amt} onChange={(e) => setAmt(e.target.value)} required /></div>
      <div><Label>Memo</Label><Textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={2} /></div>
      <p className="text-xs text-muted-foreground">{kind === "wire" ? "Wire transfers settle same-day when submitted before 4:00 PM ET." : "ACH transfers typically settle in 1–3 business days."}</p>
      <Button type="submit" disabled={!from || !name || !account || !amt || m.isPending} className="w-full">{m.isPending ? "Sending…" : `Send ${kind.toUpperCase()}`}</Button>
    </form>
  );
}

function Receipt({ r, onDone }: { r: { id: string; amount: number; kind: string; to: string }; onDone: () => void }) {
  const { data: site } = useQuery(siteSettingsQuery);
  const brand = site?.brand_name ?? "Meridian Bank";
  return (
    <div className="mt-6 rounded-2xl border bg-card p-8 text-center">
      <div className="mx-auto flex max-w-sm items-center justify-center gap-2 border-b pb-4">
        {site?.logo_url ? (
          <img src={site.logo_url} alt={brand} className="h-8 w-8 rounded object-cover" />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded bg-primary font-display text-lg text-primary-foreground">
            {brand.charAt(0)}
          </span>
        )}
        <span className="font-display text-xl text-primary">{brand}</span>
      </div>
      <CheckCircle2 className="mx-auto mt-6 h-12 w-12 text-success" />
      <h2 className="mt-4 font-display text-2xl">Transfer complete</h2>
      <p className="mt-1 text-sm text-muted-foreground">Receipt · {r.id.slice(0, 8).toUpperCase()}</p>
      <div className="mx-auto mt-6 max-w-sm space-y-2 rounded-xl border bg-surface p-5 text-left text-sm">
        <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-medium">{formatUSD(r.amount)}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">To</span><span className="font-medium">{r.to}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="font-medium uppercase">{r.kind}</span></div>
        <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span className="font-medium">{new Date().toLocaleString()}</span></div>
      </div>
      <p className="mx-auto mt-4 max-w-sm text-xs text-muted-foreground">
        {brand} · {site?.contact_phone ?? ""} · {site?.contact_email ?? ""}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <Button variant="outline" onClick={() => window.print()}>Print receipt</Button>
        <Button onClick={onDone}>Done</Button>
      </div>
    </div>
  );
}

