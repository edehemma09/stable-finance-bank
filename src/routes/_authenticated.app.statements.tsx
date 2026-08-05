import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatUSD } from "@/lib/queries";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const statementsQuery = queryOptions({
  queryKey: ["me", "statements"],
  queryFn: async () =>
    (
      await supabase
        .from("statements")
        .select("*, accounts(nickname,type,account_number)")
        .order("period_end", { ascending: false })
    ).data ?? [],
});

export const Route = createFileRoute("/_authenticated/app/statements")({
  loader: ({ context }) => context.queryClient.ensureQueryData(statementsQuery),
  component: Statements,
});

function Statements() {
  const { data: stmts = [] } = useQuery(statementsQuery);
  return (
    <div className="container-page py-6 md:py-10">
      <h1 className="font-display text-3xl md:text-4xl">Statements</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Download monthly statements for each account.
      </p>
      <div className="mt-6 divide-y rounded-xl border bg-card">
        {stmts.length === 0 && (
          <p className="p-8 text-center text-sm text-muted-foreground">
            Your statements will appear here at the end of each month.
          </p>
        )}
        {stmts.map((s) => {
          const acc = (
            s as unknown as {
              accounts: { nickname: string | null; type: string; account_number: string } | null;
            }
          ).accounts;
          return (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">
                    {acc?.nickname ?? acc?.type} ·{" "}
                    {new Date(s.period_start).toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Closing balance {formatUSD(s.closing_balance)}
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                <Download className="mr-2 h-3 w-3" />
                PDF
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
