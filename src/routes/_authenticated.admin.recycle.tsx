import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminDeletedUsersQuery } from "@/lib/admin-queries";
import { formatUSD } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/recycle")({
  component: RecycleBin,
});

function RecycleBin() {
  const qc = useQueryClient();
  const { data } = useQuery(adminDeletedUsersQuery);

  const purge = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("deleted_users").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Archive entry purged"); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const rows = data ?? [];

  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Retention</p>
      <h1 className="font-display text-3xl">Recycle bin</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Deleted customers are archived here with a snapshot of their record at deletion time. Purging an entry removes the archive permanently.
      </p>

      <div className="mt-6 space-y-3">
        {rows.map((d) => {
          const snap = (d.snapshot ?? {}) as { accounts?: { nickname: string | null; type: string; account_number: string; balance: number | string }[]; transactions_count?: number };
          return (
            <div key={d.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{d.full_name ?? d.email ?? d.user_id.slice(0, 8)}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {d.email} · @{d.username ?? "—"} · deleted {new Date(d.deleted_at).toLocaleString()}
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="destructive" disabled={purge.isPending}>Purge permanently</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Purge archive entry?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This permanently removes the archived snapshot for {d.email}. It cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => purge.mutate(d.id)}>Purge</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <div className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                {(snap.accounts ?? []).map((a, i) => (
                  <div key={i} className="flex justify-between rounded-lg border px-3 py-2">
                    <span className="capitalize">{a.nickname ?? a.type} ••{String(a.account_number).slice(-4)}</span>
                    <span className="font-mono">{formatUSD(a.balance)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{snap.transactions_count ?? 0} transactions archived</p>
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="rounded-xl border bg-card px-5 py-10 text-center text-sm text-muted-foreground">The recycle bin is empty.</p>
        )}
      </div>
    </div>
  );
}
