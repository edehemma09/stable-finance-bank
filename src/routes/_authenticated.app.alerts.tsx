import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { myAlertsQuery } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

const prefsQuery = queryOptions({
  queryKey: ["me", "alert_prefs"],
  queryFn: async () => {
    const u = (await supabase.auth.getUser()).data.user;
    if (!u) return null;
    let { data } = await supabase.from("alerts_prefs").select("*").eq("user_id", u.id).maybeSingle();
    if (!data) {
      await supabase.from("alerts_prefs").insert({ user_id: u.id });
      ({ data } = await supabase.from("alerts_prefs").select("*").eq("user_id", u.id).maybeSingle());
    }
    return data;
  },
});

export const Route = createFileRoute("/_authenticated/app/alerts")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(prefsQuery);
    context.queryClient.ensureQueryData(myAlertsQuery);
  },
  component: Alerts,
});

function Alerts() {
  const { data: prefs } = useSuspenseQuery(prefsQuery);
  const { data: alerts } = useSuspenseQuery(myAlertsQuery);
  const qc = useQueryClient();
  const [state, setState] = useState({ large: prefs?.large_txn_threshold ?? 500, low: prefs?.low_balance_threshold ?? 100, login: prefs?.login_alerts ?? true });
  useEffect(() => { if (prefs) setState({ large: prefs.large_txn_threshold, low: prefs.low_balance_threshold, login: prefs.login_alerts }); }, [prefs]);

  const save = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase.from("alerts_prefs").update({
        large_txn_threshold: Number(state.large), low_balance_threshold: Number(state.low), login_alerts: state.login,
      }).eq("user_id", u.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Preferences saved"); qc.invalidateQueries({ queryKey: ["me","alert_prefs"] }); },
  });

  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="font-display text-3xl md:text-4xl">Alerts</h1>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-6">
          <h2 className="font-display text-lg">Preferences</h2>
          <div className="mt-4 space-y-4">
            <div><Label>Large transaction threshold ($)</Label><Input type="number" value={state.large} onChange={(e) => setState(s => ({ ...s, large: Number(e.target.value) }))} /></div>
            <div><Label>Low balance threshold ($)</Label><Input type="number" value={state.low} onChange={(e) => setState(s => ({ ...s, low: Number(e.target.value) }))} /></div>
            <div className="flex items-center justify-between"><Label>New device login alerts</Label><Switch checked={state.login} onCheckedChange={(v) => setState(s => ({ ...s, login: v }))} /></div>
            <Button onClick={() => save.mutate()} disabled={save.isPending}>Save</Button>
          </div>
        </div>
        <div className="rounded-xl border bg-card">
          <div className="border-b p-4"><h2 className="font-display text-lg">Recent alerts</h2></div>
          <div className="divide-y">
            {alerts.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No alerts yet.</p>}
            {alerts.map((a) => (
              <div key={a.id} className="flex gap-3 p-4"><Bell className="mt-0.5 h-4 w-4 text-accent" /><div className="flex-1"><p className="text-sm font-medium">{a.title}</p>{a.body && <p className="text-xs text-muted-foreground">{a.body}</p>}<p className="mt-1 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</p></div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
