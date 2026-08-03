import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { myAccountsQuery, myTransactionsQuery, myProfileQuery, formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeftRight, Upload, Receipt, MoreHorizontal, Plus, ShoppingBag, Zap, MapPin, Wallet, LineChart, Landmark, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(myAccountsQuery);
    context.queryClient.ensureQueryData(myTransactionsQuery(10));
  },
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function iconFor(desc: string) {
  const d = desc?.toLowerCase() ?? "";
  if (/(payroll|deposit|salary|income)/.test(d)) return Zap;
  if (/(gas|shell|fuel|uber|lyft|transport)/.test(d)) return MapPin;
  return ShoppingBag;
}

function Dashboard() {
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const { data: tx } = useSuspenseQuery(myTransactionsQuery(6));
  const { data: profile } = useQuery(myProfileQuery);
  const qc = useQueryClient();

  const primary = accounts.find((a) => a.type === "checking") ?? accounts[0];
  const secondary = accounts.find((a) => a.type === "savings" && a.id !== primary?.id) ?? accounts.find((a) => a.id !== primary?.id);

  const seed = useMutation({
    mutationFn: async () => {
      const u = (await supabase.auth.getUser()).data.user!;
      const num = () => Math.floor(1000000000 + Math.random() * 8999999999).toString();
      const inserts = [
        { user_id: u.id, type: "checking", nickname: "Everyday Checking", account_number: num(), balance: 12450.82, available_balance: 12450.82, interest_rate: 0.001 },
        { user_id: u.id, type: "savings", nickname: "High-Yield Savings", account_number: num(), balance: 45201.0, available_balance: 45201.0, interest_rate: 0.041 },
        { user_id: u.id, type: "investment", nickname: "Brokerage", account_number: num(), balance: 8340.12, available_balance: 8340.12 },
      ];
      const { error } = await supabase.from("accounts").insert(inserts);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["me"] }); toast.success("Demo accounts opened"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const dateLabel = new Date().toLocaleDateString(undefined, { month: "long", day: "numeric" });
  const first = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto max-w-5xl px-5 py-6 lg:px-10 lg:py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">{greeting()}, {first}</h1>
          <p className="text-sm text-muted-foreground">Here is your account summary as of {dateLabel}.</p>
        </div>
        {accounts.length === 0 && (
          <Button onClick={() => seed.mutate()} disabled={seed.isPending}><Plus className="mr-2 h-4 w-4" />Open demo accounts</Button>
        )}
      </div>

      {/* Account Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Featured checking card — navy with orange CTA */}
        {primary ? (
          <div className="relative overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground shadow-lg">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary-foreground/5" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-accent">{primary.nickname ?? `${primary.type} account`}</span>
              <span className="text-xs font-medium opacity-60">…{primary.account_number.slice(-4)}</span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-bold">{formatUSD(primary.balance)}</div>
              <div className="text-xs opacity-70">Available Balance</div>
            </div>
            <div className="mt-8 flex gap-3">
              <Link to="/app/transfers" className="flex-1 rounded-lg bg-accent py-2 text-center text-xs font-bold uppercase tracking-wider text-primary transition-colors hover:brightness-105">Transfer</Link>
              <Link to="/app/accounts/$id" params={{ id: primary.id }} className="flex-1 rounded-lg bg-primary-foreground/10 py-2 text-center text-xs font-bold uppercase tracking-wider text-primary-foreground transition-colors hover:bg-primary-foreground/20">View Details</Link>
            </div>
          </div>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed p-10 text-center text-sm text-muted-foreground">
            Open your first account to get started.
          </div>
        )}

        {/* Secondary savings card with progress bar */}
        {secondary && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-primary">{secondary.nickname ?? `${secondary.type} account`}</span>
              <span className="text-xs font-medium text-muted-foreground">…{secondary.account_number.slice(-4)}</span>
            </div>
            <div className="mt-4">
              <div className="font-display text-3xl font-bold text-primary">{formatUSD(secondary.balance)}</div>
              <div className="text-xs text-muted-foreground">Available Balance</div>
            </div>
            <div className="mt-8">
              <div className="h-2 w-full rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: "75%" }} />
              </div>
              <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Savings Goal</span>
                <span>75%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Limit / KYC status */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Daily transaction limit</p>
          <p className="font-display text-xl font-bold text-primary">{formatUSD(profile?.transaction_limit ?? 5000)}</p>
        </div>
        {profile?.kyc_status === "verified" ? (
          <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-success">Identity verified</span>
        ) : (
          <Link to="/app/profile" className="rounded-lg bg-accent px-4 py-2 text-xs font-bold uppercase tracking-wider text-accent-foreground">Verify identity to raise limit</Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold text-primary">Quick Actions</h2>
        <div className="grid grid-cols-4 gap-4">
          <QA to="/app/bills" icon={Receipt} label="Pay Bill" />
          <QA to="/app/transfers" icon={ArrowLeftRight} label="Transfer" />
          <QA to="/app/deposits" icon={Upload} label="Deposit" />
          <QA to="/app/accounts" icon={MoreHorizontal} label="More" />
        </div>
      </div>

      {/* Modules */}
      <div className="mt-10">
        <h2 className="mb-4 font-display text-lg font-bold text-primary">Grow your money</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Module to="/app/wealth" icon={LineChart} title="Wealth management" copy="Portfolio, allocation & advisory." />
          <Module to="/app/loans" icon={Landmark} title="Loans" copy="Apply, track and pay down balances." />
          <Module to="/app/retirement" icon={PiggyBank} title="Retirement & IRS" copy="IRA contributions and tax forms." />
        </div>
      </div>


      {/* Recent Transactions */}
      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-primary">Recent Transactions</h2>
          <Link to="/app/accounts" className="text-sm font-semibold text-accent hover:underline">View All</Link>
        </div>
        <div className="divide-y divide-border rounded-2xl border border-border bg-card shadow-sm">
          {tx.length === 0 && <p className="p-6 text-sm text-muted-foreground">No transactions yet.</p>}
          {tx.map((t) => {
            const Icon = iconFor(t.description ?? "");
            const positive = Number(t.amount) > 0;
            return (
              <div key={t.id} className="flex items-center justify-between p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-muted text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-primary">{t.description}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {t.type}</div>
                  </div>
                </div>
                <div className={`text-sm font-bold ${positive ? "text-success" : "text-foreground"}`}>
                  {positive ? "+" : "-"}{formatUSD(Math.abs(Number(t.amount)))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function QA({ to, icon: Icon, label }: { to: string; icon: typeof Wallet; label: string }) {
  return (
    <Link to={to as never} className="flex flex-col items-center gap-2 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-muted text-primary transition-colors hover:bg-secondary">
        <Icon className="h-6 w-6" />
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">{label}</span>
    </Link>
  );
}

function Module({ to, icon: Icon, title, copy }: { to: string; icon: typeof Wallet; title: string; copy: string }) {
  return (
    <Link to={to as never} className="rounded-2xl border border-border bg-card p-5 transition hover:border-accent">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-primary"><Icon className="h-5 w-5" /></span>
      <p className="mt-3 font-display text-base font-bold text-primary">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{copy}</p>
    </Link>
  );
}
