import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/queries";
import { Search } from "lucide-react";

const statsQuery = queryOptions({
  queryKey: ["admin", "stats"],
  queryFn: async () => {
    const [profiles, accounts, transfers, tickets] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("accounts").select("balance"),
      supabase.from("transfers").select("id", { count: "exact", head: true }),
      supabase.from("support_tickets").select("id", { count: "exact", head: true }).in("status", ["open", "pending"]),
    ]);
    const totalDeposits = (accounts.data ?? []).reduce((s, a) => s + Number(a.balance ?? 0), 0);
    return {
      customers: profiles.count ?? 0,
      deposits: totalDeposits,
      transfers: transfers.count ?? 0,
      openTickets: tickets.count ?? 0,
    };
  },
});

const activityQuery = queryOptions({
  queryKey: ["admin", "activity"],
  queryFn: async () => {
    const { data } = await supabase
      .from("transfers")
      .select("id,kind,amount,memo,receipt_number,created_at,to_external,user_id")
      .order("created_at", { ascending: false })
      .limit(12);
    return data ?? [];
  },
});

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(statsQuery);
    context.queryClient.ensureQueryData(activityQuery);
  },
  component: AdminHome,
});

function statusFor(amount: number) {
  if (amount >= 1_000_000) return { label: "High Value Flag", cls: "bg-destructive/10 text-destructive border-destructive/30" };
  if (amount >= 100_000) return { label: "Verification", cls: "bg-warning/15 text-warning-foreground border-warning/40" };
  return { label: "Settled", cls: "bg-success/10 text-success border-success/30" };
}

function typeLabel(kind: string) {
  return {
    wire: "Wire Outbound",
    ach: "ACH Batch",
    intra: "Intra-bank Transfer",
    same: "Same-account Transfer",
  }[kind] ?? "Transfer";
}

function AdminHome() {
  const { data: stats } = useQuery(statsQuery);
  const { data: activity = [] } = useQuery(activityQuery);

  const kpis = [
    { label: "Total Deposits", value: formatUSD(stats?.deposits ?? 0), note: "Aggregate held balances", tone: "text-primary" },
    { label: "Open Tickets", value: String(stats?.openTickets ?? 0).padStart(2, "0"), note: stats?.openTickets ? "Awaiting response" : "Inbox clear", tone: (stats?.openTickets ?? 0) > 0 ? "text-accent" : "text-primary" },
    { label: "Transfers", value: String(stats?.transfers ?? 0), note: "Since ledger start", tone: "text-primary" },
    { label: "Customers", value: String(stats?.customers ?? 0), note: "Enrolled members", tone: "text-primary" },
  ];

  return (
    <div className="min-h-screen bg-surface p-4 md:p-8">
      <div className="mx-auto w-full max-w-6xl border border-border bg-card shadow-2xl">
        {/* Header bar */}
        <div className="flex flex-col gap-3 border-b border-border bg-primary px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="grid h-8 w-8 place-items-center rounded-sm bg-primary-foreground">
              <div className="h-5 w-5 border-2 border-primary" />
            </div>
            <h1 className="font-display text-lg font-semibold uppercase tracking-tight text-primary-foreground">
              Stable Finance <span className="font-normal opacity-80">Admin</span>
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-primary-foreground/50" />
              <input
                type="text"
                placeholder="Search transactions…"
                className="w-64 border border-transparent bg-primary-dark px-9 py-1.5 text-sm text-primary-foreground placeholder:text-primary-foreground/50 outline-none focus:border-accent"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-xs font-medium uppercase tracking-wider text-primary-foreground">System Online</span>
            </div>
          </div>
        </div>

        {/* KPI bar */}
        <div className="grid grid-cols-2 divide-border border-b border-border md:grid-cols-4 md:divide-x">
          {kpis.map((k) => (
            <div key={k.label} className="p-5">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{k.label}</p>
              <p className={`font-display text-2xl font-semibold ${k.tone}`}>{k.value}</p>
              <p className="mt-1 text-xs font-medium text-muted-foreground">{k.note}</p>
            </div>
          ))}
        </div>

        {/* Table header */}
        <div className="flex items-center justify-between border-b border-border bg-surface px-6 py-2.5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/70">Recent Operational Activity</h2>
          <div className="flex gap-2">
            <button className="border border-border bg-card px-3 py-1 text-[11px] font-bold text-primary hover:bg-muted">Export CSV</button>
            <Link to="/admin/customers" className="bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent-foreground hover:brightness-95">New Entry</Link>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-border bg-card">
              <tr>
                <Th>Timestamp</Th>
                <Th>Reference</Th>
                <Th>Type</Th>
                <Th className="text-right">Amount (USD)</Th>
                <Th>Status</Th>
                <Th />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activity.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-sm text-muted-foreground">No operational activity yet.</td></tr>
              )}
              {activity.map((row) => {
                const amt = Math.abs(Number(row.amount ?? 0));
                const st = statusFor(amt);
                const ext = (row.to_external as { name?: string } | null) ?? null;
                const name = ext?.name ?? row.memo ?? row.receipt_number ?? "Internal Transfer";
                return (
                  <tr key={row.id} className="transition-colors hover:bg-surface/60">
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(row.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                    </td>
                    <td className="px-6 py-4 font-display text-sm font-semibold text-primary">{name}</td>
                    <td className="px-6 py-4 text-xs text-muted-foreground">{typeLabel(row.kind)}</td>
                    <td className={`px-6 py-4 text-right text-sm font-bold tracking-tight ${amt >= 1_000_000 ? "text-destructive" : "text-primary"}`}>{formatUSD(amt)}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs font-bold text-accent hover:underline">Review</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border bg-card px-6 py-3">
          <div className="flex gap-4">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Version 2.8.4-stable</span>
            <span className="text-[10px] font-bold uppercase text-muted-foreground">Server: US-EAST-02</span>
          </div>
          <span className="text-[10px] font-bold uppercase text-primary">Page 1</span>
        </div>
      </div>
    </div>
  );
}

function Th({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-6 py-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground ${className}`}>{children}</th>;
}
