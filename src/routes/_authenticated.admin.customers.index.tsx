import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { adminCustomersQuery, statusTone } from "@/lib/admin-queries";
import { formatUSD } from "@/lib/queries";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/customers/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(adminCustomersQuery("")),
  component: Customers,
});

function Customers() {
  const [search, setSearch] = useState("");
  const { data } = useSuspenseQuery(adminCustomersQuery(search));

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Customer lifecycle
          </p>
          <h1 className="font-display text-3xl">Customers</h1>
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search email, username, name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">Customer</th>
              <th className="px-4 py-3 text-left">Username</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">KYC</th>
              <th className="px-4 py-3 text-right">Daily limit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3">
                  <Link
                    to="/admin/customers/$id"
                    params={{ id: c.id }}
                    className="font-medium hover:underline"
                  >
                    {c.full_name ?? "Unnamed"}
                  </Link>
                  <p className="text-xs text-muted-foreground">{c.email}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{c.username ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${statusTone(c.status)}`}
                  >
                    {c.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs capitalize text-muted-foreground">
                  {c.kyc_status}
                </td>
                <td className="px-4 py-3 text-right font-mono">{formatUSD(c.transaction_limit)}</td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
