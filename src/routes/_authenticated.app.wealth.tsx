import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myHoldingsQuery, myAccountsQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, LineChart, Plus } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/wealth")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myHoldingsQuery);
    context.queryClient.ensureQueryData(myAccountsQuery);
  },
  component: Wealth,
});

const STARTER = [
  { symbol: "VTI", name: "Total Market ETF", asset_class: "equity", shares: 12.5, price: 268.4, day_change: 0.62 },
  { symbol: "BND", name: "Total Bond ETF", asset_class: "fixed income", shares: 40, price: 73.1, day_change: -0.14 },
  { symbol: "MSFT", name: "Microsoft Corp.", asset_class: "equity", shares: 6, price: 421.2, day_change: 1.08 },
  { symbol: "CASH", name: "Cash & Sweep", asset_class: "cash", shares: 1, price: 1450, day_change: 0 },
];

function Wealth() {
  const { data: holdings } = useSuspenseQuery(myHoldingsQuery);
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const qc = useQueryClient();
  const brokerage = accounts.find((a) => a.type === "investment");
  const total = holdings.reduce((s, h) => s + Number(h.shares) * Number(h.price), 0);
  const dayPnl = holdings.reduce((s, h) => s + Number(h.shares) * Number(h.price) * (Number(h.day_change) / 100), 0);

  const open = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const { error } = await supabase.from("holdings").insert(STARTER.map((h) => ({ ...h, user_id: u.id, account_id: brokerage?.id ?? null })));
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me", "holdings"] }); toast.success("Managed portfolio opened"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const byClass: Record<string, number> = {};
  holdings.forEach((h) => { byClass[h.asset_class] = (byClass[h.asset_class] ?? 0) + Number(h.shares) * Number(h.price); });

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-10 lg:py-10">
      <h1 className="font-display text-3xl font-bold text-primary">Wealth management</h1>
      <p className="mt-1 text-sm text-muted-foreground">Portfolio, allocation, and advisory in one place.</p>

      <div className="mt-6 rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Portfolio value</p>
        <p className="mt-2 font-display text-4xl font-bold">{formatUSD(total)}</p>
        <p className={`mt-1 flex items-center gap-1 text-sm ${dayPnl >= 0 ? "text-accent" : "text-primary-foreground/70"}`}>
          {dayPnl >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          {formatUSD(Math.abs(dayPnl))} today
        </p>
      </div>

      {holdings.length === 0 ? (
        <div className="mt-6 grid place-items-center rounded-2xl border border-dashed p-10 text-center">
          <LineChart className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No investments yet. Open a managed portfolio to get started.</p>
          <Button className="mt-4" onClick={() => open.mutate()} disabled={open.isPending}><Plus className="mr-2 h-4 w-4" />Open managed portfolio</Button>
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {Object.entries(byClass).map(([k, v]) => (
              <div key={k} className="rounded-2xl border bg-card p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{k}</p>
                <p className="mt-1 font-display text-xl font-bold text-primary">{formatUSD(v)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-accent" style={{ width: `${total ? (v / total) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>

          <div className="mt-6 divide-y rounded-2xl border bg-card">
            {holdings.map((h) => {
              const val = Number(h.shares) * Number(h.price);
              const up = Number(h.day_change) >= 0;
              return (
                <div key={h.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-primary">{h.symbol} · {h.name}</p>
                    <p className="text-xs text-muted-foreground">{Number(h.shares)} @ {formatUSD(h.price)}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-bold">{formatUSD(val)}</p>
                    <p className={`text-xs font-semibold ${up ? "text-success" : "text-destructive"}`}>{up ? "+" : ""}{Number(h.day_change)}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
