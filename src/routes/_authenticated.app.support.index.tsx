import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { myTicketsQuery } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/support/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myTicketsQuery),
  component: Support,
});

function Support() {
  const { data: tickets } = useSuspenseQuery(myTicketsQuery);
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const create = useMutation({
    mutationFn: async (v: { subject: string; category: string; body: string }) => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { data: t, error } = await supabase.from("support_tickets").insert({ user_id: u.id, subject: v.subject, category: v.category }).select().single();
      if (error) throw error;
      await supabase.from("ticket_messages").insert({ ticket_id: t.id, author_id: u.id, body: v.body, is_staff: false });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me","tickets"] }); setOpen(false); toast.success("Ticket submitted"); },
  });

  return (
    <div className="container-page py-6 md:py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl md:text-4xl">Support</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" />New ticket</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Contact support</DialogTitle></DialogHeader>
            <NewTicketForm onSubmit={create.mutate} pending={create.isPending} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-6 space-y-3">
        {tickets.length === 0 && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No tickets yet.</p>}
        {tickets.map((t) => (
          <Link key={t.id} to="/app/support/$id" params={{ id: t.id }} className="flex items-center justify-between rounded-xl border bg-card p-4 hover:border-accent">
            <div><p className="font-medium">{t.subject}</p><p className="text-xs text-muted-foreground">{t.category} · {new Date(t.updated_at).toLocaleDateString()}</p></div>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">{t.status}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function NewTicketForm({ onSubmit, pending }: { onSubmit: (v: { subject: string; category: string; body: string }) => void; pending: boolean }) {
  const [s, setS] = useState(""); const [c, setC] = useState("general"); const [b, setB] = useState("");
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ subject: s, category: c, body: b }); }} className="space-y-3">
      <div><Label>Subject</Label><Input value={s} onChange={(e) => setS(e.target.value)} required /></div>
      <div><Label>Category</Label>
        <Select value={c} onValueChange={setC}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
          {["general","account","transfer","card","dispute","technical"].map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
        </SelectContent></Select>
      </div>
      <div><Label>Message</Label><Textarea rows={5} value={b} onChange={(e) => setB(e.target.value)} required /></div>
      <DialogFooter><Button type="submit" disabled={pending}><MessageSquare className="mr-2 h-4 w-4" />{pending ? "Sending…" : "Send"}</Button></DialogFooter>
    </form>
  );
}
