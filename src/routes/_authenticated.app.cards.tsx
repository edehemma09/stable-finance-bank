import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { myCardsQuery, myAccountsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Eye, EyeOff, Plus, Snowflake } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/cards")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myCardsQuery);
    context.queryClient.ensureQueryData(myAccountsQuery);
  },
  component: Cards,
});

function generatePAN() {
  const grp = () => Math.floor(1000 + Math.random() * 9000).toString();
  return `4${grp().slice(1)} ${grp()} ${grp()} ${grp()}`;
}

function Cards() {
  const { data: cards } = useSuspenseQuery(myCardsQuery);
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const issue = useMutation({
    mutationFn: async (v: { account_id: string; card_type: "debit" | "credit"; cardholder_name: string }) => {
      const pan = generatePAN();
      const last4 = pan.slice(-4);
      const now = new Date();
      const { error } = await supabase.from("cards").insert({
        ...v,
        user_id: (await supabase.auth.getUser()).data.user!.id,
        pan_masked: `**** **** **** ${last4}`,
        full_pan: pan.replace(/\s/g, ""),
        last4,
        exp_month: (now.getMonth() + 1),
        exp_year: now.getFullYear() + 4,
        cvv: Math.floor(100 + Math.random() * 900).toString(),
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me","cards"] }); setOpen(false); toast.success("Card issued"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="container-page py-6 md:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-3xl md:text-4xl">Cards</h1><p className="mt-1 text-sm text-muted-foreground">Manage your Stable Finance cards.</p></div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />Request card</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Request a new card</DialogTitle></DialogHeader>
            <IssueForm accounts={accounts} onSubmit={(v) => issue.mutate(v)} pending={issue.isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {cards.length === 0 && <p className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground md:col-span-2">No cards yet.</p>}
        {cards.map((c) => <CardView key={c.id} card={c as never} />)}
      </div>
    </div>
  );
}

function IssueForm({ accounts, onSubmit, pending }: { accounts: { id: string; nickname: string | null; type: string; account_number: string }[]; onSubmit: (v: { account_id: string; card_type: "debit" | "credit"; cardholder_name: string }) => void; pending: boolean }) {
  const [acc, setAcc] = useState(""); const [type, setType] = useState<"debit" | "credit">("debit"); const [name, setName] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ account_id: acc, card_type: type, cardholder_name: name }); }} className="space-y-4">
      <div><Label>Cardholder name</Label><Input value={name} onChange={(e) => setName(e.target.value.toUpperCase())} required /></div>
      <div><Label>Linked account</Label>
        <Select value={acc} onValueChange={setAcc}><SelectTrigger><SelectValue placeholder="Choose" /></SelectTrigger>
          <SelectContent>{accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.nickname ?? a.type} ••{a.account_number.slice(-4)}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <div><Label>Type</Label>
        <Select value={type} onValueChange={(v) => setType(v as "debit" | "credit")}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="debit">Debit</SelectItem><SelectItem value="credit">Credit</SelectItem></SelectContent></Select>
      </div>
      <DialogFooter><Button type="submit" disabled={pending || !acc || !name}>{pending ? "Issuing…" : "Issue card"}</Button></DialogFooter>
    </form>
  );
}

function CardView({ card }: { card: { id: string; brand: string; card_type: string; cardholder_name: string; pan_masked: string; full_pan: string; last4: string; exp_month: number; exp_year: number; cvv: string; status: string; daily_limit: number | string; online_enabled: boolean; contactless_enabled: boolean; international_enabled: boolean } }) {
  const [reveal, setReveal] = useState(false);
  const qc = useQueryClient();
  const update = useMutation({
    mutationFn: async (v: Partial<{ status: string; online_enabled: boolean; contactless_enabled: boolean; international_enabled: boolean; daily_limit: number }>) => {
      const { error } = await supabase.from("cards").update(v).eq("id", card.id); if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me","cards"] }),
  });
  const frozen = card.status === "frozen";
  return (
    <div className="rounded-2xl border bg-card p-5">
      <div className={`aspect-[1.6/1] rounded-2xl p-5 text-primary-foreground shadow-lg ${frozen ? "bg-muted-foreground" : "bg-gradient-to-br from-primary to-primary/70"}`}>
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center justify-between"><span className="font-display text-lg">{card.brand}</span><span className="text-xs uppercase opacity-80">{card.card_type}</span></div>
          <div>
            <p className="font-mono text-lg tracking-widest">{reveal ? card.full_pan.replace(/(\d{4})(?=\d)/g, "$1 ") : card.pan_masked}</p>
            <div className="mt-2 flex justify-between text-xs uppercase opacity-90"><span>{card.cardholder_name}</span><span>{String(card.exp_month).padStart(2,"0")}/{String(card.exp_year).slice(-2)}</span><span>CVV {reveal ? card.cvv : "•••"}</span></div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={() => setReveal((v) => !v)}>{reveal ? <EyeOff className="mr-2 h-3 w-3" /> : <Eye className="mr-2 h-3 w-3" />}{reveal ? "Hide" : "Reveal"}</Button>
        <Button size="sm" variant={frozen ? "default" : "outline"} onClick={() => update.mutate({ status: frozen ? "active" : "frozen" })}><Snowflake className="mr-2 h-3 w-3" />{frozen ? "Unfreeze" : "Freeze"}</Button>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        <Row label="Online purchases"><Switch checked={card.online_enabled} onCheckedChange={(v) => update.mutate({ online_enabled: v })} /></Row>
        <Row label="Contactless"><Switch checked={card.contactless_enabled} onCheckedChange={(v) => update.mutate({ contactless_enabled: v })} /></Row>
        <Row label="International"><Switch checked={card.international_enabled} onCheckedChange={(v) => update.mutate({ international_enabled: v })} /></Row>
      </div>
    </div>
  );
}
function Row({ label, children }: { label: string; children: React.ReactNode }) { return <div className="flex items-center justify-between"><span className="text-muted-foreground">{label}</span>{children}</div>; }
