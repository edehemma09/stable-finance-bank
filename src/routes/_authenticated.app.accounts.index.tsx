import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { myAccountsQuery, formatUSD } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/app/accounts/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myAccountsQuery),
  component: Accounts,
});

function Accounts() {
  const { data: accounts } = useSuspenseQuery(myAccountsQuery);
  const groups: Record<string, typeof accounts> = {};
  accounts.forEach((a) => {
    (groups[a.type] ??= []).push(a);
  });
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="font-display text-3xl md:text-4xl">Accounts</h1>
      <p className="mt-1 text-sm text-muted-foreground">All your accounts in one place.</p>
      <div className="mt-6 space-y-8">
        {Object.entries(groups).map(([type, list]) => (
          <section key={type}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {type}
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((a) => (
                <Link
                  key={a.id}
                  to="/app/accounts/$id"
                  params={{ id: a.id }}
                  className="rounded-2xl border bg-card p-5 transition hover:border-accent"
                >
                  <p className="text-sm text-muted-foreground">{a.nickname ?? a.type}</p>
                  <p className="mt-2 font-display text-3xl">{formatUSD(a.balance)}</p>
                  <p className="mt-2 font-mono text-xs text-muted-foreground">
                    •••• {a.account_number.slice(-4)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ))}
        {accounts.length === 0 && (
          <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
            No accounts yet.
          </p>
        )}
      </div>
    </div>
  );
}
