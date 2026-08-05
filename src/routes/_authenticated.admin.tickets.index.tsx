import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { adminProfileLookupQuery } from "@/lib/admin-queries";

export const Route = createFileRoute("/_authenticated/admin/tickets/")({
  component: Tickets,
});

function Tickets() {
  const { data } = useQuery({
    queryKey: ["admin", "tickets"],
    queryFn: async () =>
      (await supabase.from("support_tickets").select("*").order("updated_at", { ascending: false }))
        .data ?? [],
  });
  const { data: people } = useQuery(adminProfileLookupQuery);
  const rows = data ?? [];
  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Service desk
      </p>
      <h1 className="font-display text-3xl">Support tickets</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Priority</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Updated</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const who = people?.get(t.user_id);
              return (
                <tr key={t.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link
                      to="/admin/tickets/$id"
                      params={{ id: t.id }}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {t.subject}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {who?.full_name ?? who?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3 capitalize text-muted-foreground">{t.category}</td>
                  <td className="px-4 py-3 capitalize">{t.priority}</td>
                  <td className="px-4 py-3 capitalize">{t.status}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(t.updated_at).toLocaleString()}
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                  No tickets yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
