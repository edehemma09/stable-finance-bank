import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bot, CheckCircle2, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { analyzeErrorEvent, approveErrorAction } from "@/lib/diagnostics.functions";
import { errorText } from "@/lib/error-text";

export const Route = createFileRoute("/_authenticated/admin/errors")({
  component: Diagnostics,
  head: () => ({
    meta: [
      { title: "Diagnostics | Stable Finance Admin" },
      { name: "description", content: "Review application incidents and approved remediation guidance." },
      { property: "og:title", content: "Stable Finance Admin Diagnostics" },
      { property: "og:description", content: "Secure application incident review." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function Diagnostics() {
  const qc = useQueryClient();
  const events = useQuery({
    queryKey: ["admin", "error_events"],
    queryFn: async () => {
      const { data, error } = await supabase.from("error_events").select("*").order("last_seen_at", { ascending: false }).limit(100);
      if (error) throw error;
      return data ?? [];
    },
  });
  const analyze = useMutation({
    mutationFn: (id: string) => analyzeErrorEvent({ data: { id } }),
    onSuccess: () => { toast.success("Analysis ready"); qc.invalidateQueries({ queryKey: ["admin", "error_events"] }); },
    onError: (error) => toast.error(errorText(error)),
  });
  const approve = useMutation({
    mutationFn: (id: string) => approveErrorAction({ data: { id } }),
    onSuccess: (result) => { toast.success(result.message); qc.invalidateQueries({ queryKey: ["admin", "error_events"] }); },
    onError: (error) => toast.error(errorText(error)),
  });

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Operations</p>
          <h1 className="font-display text-3xl">Diagnostics</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Sanitized incidents are grouped by cause. AI can diagnose and propose an action, but an administrator must approve it.</p>
        </div>
        <Button variant="outline" size="icon" aria-label="Refresh incidents" title="Refresh incidents" onClick={() => events.refetch()} disabled={events.isFetching}>
          <RefreshCw className={events.isFetching ? "animate-spin" : ""} />
        </Button>
      </div>

      <div className="mt-6 grid gap-4">
        {(events.data ?? []).map((event) => (
          <article key={event.id} className="rounded-lg border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{event.incident_code}</span>
                  <span className="rounded border px-2 py-0.5 capitalize">{event.severity}</span>
                  <span>{event.occurrence_count} occurrence{event.occurrence_count === 1 ? "" : "s"}</span>
                </div>
                <h2 className="mt-2 break-words font-medium">{event.message}</h2>
                <p className="mt-1 text-xs text-muted-foreground">{event.source}{event.action ? ` · ${event.action}` : ""}{event.route ? ` · ${event.route}` : ""} · {new Date(event.last_seen_at).toLocaleString()}</p>
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${event.status === "resolved" ? "text-success" : "text-destructive"}`}>
                {event.status === "resolved" ? <CheckCircle2 /> : <AlertTriangle />}{event.status}
              </span>
            </div>

            {event.ai_status === "ready" ? (
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center gap-2 text-sm font-medium"><Bot /> AI diagnosis · {event.ai_confidence ?? "unknown"} confidence</div>
                <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                  <div><p className="font-medium">Likely cause</p><div className="prose prose-sm mt-1 max-w-none text-muted-foreground"><ReactMarkdown>{event.ai_cause ?? ""}</ReactMarkdown></div></div>
                  <div><p className="font-medium">Recommended action</p><div className="prose prose-sm mt-1 max-w-none text-muted-foreground"><ReactMarkdown>{event.ai_recommendation ?? ""}</ReactMarkdown></div></div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Button onClick={() => approve.mutate(event.id)} disabled={approve.isPending || Boolean(event.action_approved_at)}>
                    {event.action_approved_at ? "Action approved" : "Approve recommended action"}
                  </Button>
                  <span className="font-mono text-xs text-muted-foreground">{event.ai_action_kind}</span>
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t pt-4">
                <Button variant="outline" onClick={() => analyze.mutate(event.id)} disabled={analyze.isPending || event.ai_status === "analyzing"}>
                  <Bot />{event.ai_status === "analyzing" ? "Analyzing…" : event.ai_status === "failed" ? "Retry analysis" : "Analyze incident"}
                </Button>
                {event.ai_error && <p className="mt-2 text-xs text-destructive">{event.ai_error}</p>}
              </div>
            )}
          </article>
        ))}
        {!events.isLoading && (events.data ?? []).length === 0 && (
          <div className="rounded-lg border border-dashed px-6 py-14 text-center text-sm text-muted-foreground">No incidents recorded.</div>
        )}
      </div>
    </div>
  );
}