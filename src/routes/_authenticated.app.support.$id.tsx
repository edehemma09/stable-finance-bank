import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ticketQuery = (id: string) =>
  queryOptions({
    queryKey: ["ticket", id],
    queryFn: async () =>
      (await supabase.from("support_tickets").select("*").eq("id", id).maybeSingle()).data,
  });
const messagesQuery = (id: string) =>
  queryOptions({
    queryKey: ["ticket", id, "msgs"],
    queryFn: async () =>
      (await supabase.from("ticket_messages").select("*").eq("ticket_id", id).order("created_at"))
        .data ?? [],
  });

export const Route = createFileRoute("/_authenticated/app/support/$id")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(ticketQuery(params.id));
    context.queryClient.ensureQueryData(messagesQuery(params.id));
  },
  component: Thread,
});

function Thread() {
  const { id } = Route.useParams();
  const { data: ticket } = useSuspenseQuery(ticketQuery(id));
  const { data: msgs } = useSuspenseQuery(messagesQuery(id));
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  useEffect(() => {
    const ch = supabase
      .channel(`ticket:${id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "ticket_messages",
          filter: `ticket_id=eq.${id}`,
        },
        () => qc.invalidateQueries({ queryKey: ["ticket", id, "msgs"] }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [id, qc]);

  const send = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase
        .from("ticket_messages")
        .insert({ ticket_id: id, author_id: u.id, body, is_staff: false });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["ticket", id, "msgs"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  if (!ticket) return <div className="container-page py-10">Ticket not found</div>;
  return (
    <div className="container-page py-6 md:py-10">
      <Link
        to="/app/support"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Support
      </Link>
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl">{ticket.subject}</h1>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs capitalize">
            {ticket.status}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{ticket.category}</p>
        <div className="mt-6 space-y-3">
          {msgs.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-xl p-3 text-sm ${m.is_staff ? "bg-primary text-primary-foreground" : "ml-auto bg-muted"}`}
            >
              <p>{m.body}</p>
              <p className="mt-1 text-xs opacity-70">{new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (body.trim()) send.mutate();
          }}
          className="mt-6 space-y-2"
        >
          <Textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a reply…"
          />
          <Button type="submit" disabled={send.isPending || !body.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
