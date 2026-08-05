import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { adminTicketQuery, adminProfileLookupQuery } from "@/lib/admin-queries";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/tickets/$id")({
  component: AdminTicket,
});

const STATUSES = ["open", "pending", "resolved", "closed"];
const PRIORITIES = ["low", "normal", "high", "urgent"];

function AdminTicket() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery(adminTicketQuery(id));
  const { data: people } = useQuery(adminProfileLookupQuery);
  const [body, setBody] = useState("");
  const ticket = data?.ticket;
  const msgs = data?.messages ?? [];

  const invalidate = () => qc.invalidateQueries({ queryKey: ["admin"] });

  useEffect(() => {
    const ch = supabase
      .channel(`admin-ticket:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${id}`,
        },
        invalidate,
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const reply = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase
        .from("ticket_messages")
        .insert({ ticket_id: id, author_id: u.id, body, is_staff: true });
      if (error) throw error;
      await supabase.from("support_tickets").update({ status: "pending" }).eq("id", id);
    },
    onSuccess: () => {
      setBody("");
      toast.success("Reply sent");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const patch = useMutation({
    mutationFn: async (values: { status?: string; priority?: string }) => {
      const { error } = await supabase.from("support_tickets").update(values).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Ticket updated");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const assignToMe = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase
        .from("support_tickets")
        .update({ assigned_to: u.id })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Assigned to you");
      invalidate();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!ticket) return <div className="p-8 text-sm text-muted-foreground">Loading ticket…</div>;
  const who = people?.get(ticket.user_id);
  const closed = ticket.status === "closed";

  return (
    <div className="p-4 md:p-8">
      <Link
        to="/admin/tickets"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Tickets
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{ticket.subject}</h1>
        <span className="rounded-full border px-2 py-0.5 text-[11px] capitalize">
          {ticket.status}
        </span>
        <span className="rounded-full border px-2 py-0.5 text-[11px] capitalize">
          {ticket.priority}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">
        {who?.full_name ?? who?.email ?? ticket.user_id.slice(0, 8)} · @{who?.username ?? "—"} ·{" "}
        {ticket.category} · opened {new Date(ticket.created_at).toLocaleString()}
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border bg-card p-5">
          <div className="space-y-3">
            {msgs.map((m) => (
              <div
                key={m.id}
                className={`max-w-[85%] rounded-xl p-3 text-sm ${m.is_staff ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"}`}
              >
                <p className="whitespace-pre-wrap">{m.body}</p>
                <p className="mt-1 text-xs opacity-70">
                  {m.is_staff ? "Staff" : "Customer"} · {new Date(m.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {msgs.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
          </div>
          {closed ? (
            <p className="mt-6 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
              This ticket is closed. Reopen it to continue the conversation.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (body.trim()) reply.mutate();
              }}
              className="mt-6 space-y-2"
            >
              <Label>Reply as staff</Label>
              <Textarea
                rows={3}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Write a reply to the customer…"
              />
              <Button type="submit" disabled={reply.isPending || !body.trim()}>
                {reply.isPending ? "Sending…" : "Send reply"}
              </Button>
            </form>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5">
            <h2 className="font-display text-lg">Triage</h2>
            <div className="mt-3 grid gap-3">
              <div>
                <Label>Status</Label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={ticket.status}
                  onChange={(e) => patch.mutate({ status: e.target.value })}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Priority</Label>
                <select
                  className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                  value={ticket.priority}
                  onChange={(e) => patch.mutate({ priority: e.target.value })}
                >
                  {PRIORITIES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => assignToMe.mutate()}
                disabled={assignToMe.isPending}
              >
                Assign to me
              </Button>
              {closed ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => patch.mutate({ status: "open" })}
                  disabled={patch.isPending}
                >
                  Reopen ticket
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => patch.mutate({ status: "resolved" })}
                    disabled={patch.isPending}
                  >
                    Mark resolved
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => patch.mutate({ status: "closed" })}
                    disabled={patch.isPending}
                  >
                    Close ticket
                  </Button>
                </>
              )}
            </div>
          </div>
          <Link
            to="/admin/customers/$id"
            params={{ id: ticket.user_id }}
            className="block rounded-xl border bg-card p-5 text-sm hover:bg-muted/40"
          >
            View customer record →
          </Link>
        </div>
      </div>
    </div>
  );
}
