import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/queries";
import { ArrowLeft } from "lucide-react";

const accountQuery = (id: string) =>
  queryOptions({
    queryKey: ["account", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
const accountTxQuery = (id: string) =>
  queryOptions({
    queryKey: ["account", id, "tx"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .eq("account_id", id)
        .order("created_at", { ascending: false })
        .limit(100);
      return data ?? [];
    },
  });

export const Route = createFileRoute("/_authenticated/app/accounts/$id")({
  loader: ({ context, params }) => {
    context.queryClient.ensureQueryData(accountQuery(params.id));
    context.queryClient.ensureQueryData(accountTxQuery(params.id));
  },
  component: AccountDetail,
});

function AccountDetail() {
  const { id } = Route.useParams();
  const { data: acc } = useSuspenseQuery(accountQuery(id));
  const { data: tx } = useSuspenseQuery(accountTxQuery(id));
  if (!acc) return <div className="container-page py-10">Account not found.</div>;
  return (
    <div className="container-page py-6 md:py-10">
      <Link
        to="/app/accounts"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Accounts
      </Link>
      <div className="rounded-2xl bg-primary p-8 text-primary-foreground">
        <p className="text-xs uppercase tracking-widest opacity-70">{acc.type}</p>
        <p className="mt-1 text-lg opacity-90">{acc.nickname ?? acc.type}</p>
        <p className="mt-2 font-display text-5xl">{formatUSD(acc.balance)}</p>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="opacity-60">Available</p>
            <p className="font-medium">{formatUSD(acc.available_balance)}</p>
          </div>
          <div>
            <p className="opacity-60">Account #</p>
            <p className="font-mono">{acc.account_number}</p>
          </div>
          <div>
            <p className="opacity-60">Routing #</p>
            <p className="font-mono">{acc.routing_number}</p>
          </div>
          <div>
            <p className="opacity-60">Status</p>
            <p>{acc.status}</p>
          </div>
        </div>
      </div>
      <h2 className="mt-8 font-display text-2xl">Transactions</h2>
      <div className="mt-3 divide-y rounded-xl border bg-card">
        {tx.length === 0 && (
          <p className="p-6 text-sm text-muted-foreground">No transactions on this account.</p>
        )}
        {tx.map((t) => (
          <div key={t.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium">{t.description}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleString()} · {t.type}
              </p>
            </div>
            <p
              className={`font-medium ${Number(t.amount) < 0 ? "text-foreground" : "text-success"}`}
            >
              {Number(t.amount) < 0 ? "-" : "+"}
              {formatUSD(Math.abs(Number(t.amount)))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
