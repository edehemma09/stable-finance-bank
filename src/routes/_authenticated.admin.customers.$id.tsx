import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminCustomerQuery, statusTone } from "@/lib/admin-queries";
import { formatUSD } from "@/lib/queries";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Mail } from "lucide-react";


export const Route = createFileRoute("/_authenticated/admin/customers/$id")({
  loader: ({ context, params }) => context.queryClient.ensureQueryData(adminCustomerQuery(params.id)),
  component: CustomerDetail,
});

function CustomerDetail() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(adminCustomerQuery(id));
  const p = data.profile;

  const deleteUser = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase.rpc as any)("admin_delete_user", { _user_id: id });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Customer deleted and archived to the recycle bin");
      qc.invalidateQueries({ queryKey: ["admin"] });
      navigate({ to: "/admin/customers" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });


  const [form, setForm] = useState({ full_name: "", username: "", phone: "", city: "", state: "", kyc_status: "pending" });
  const [limit, setLimit] = useState("");
  const [adj, setAdj] = useState({ account_id: "", amount: "", memo: "", direction: "credit" as "credit" | "debit" });

  useEffect(() => {
    if (!p) return;
    setForm({
      full_name: p.full_name ?? "", username: p.username ?? "", phone: p.phone ?? "",
      city: p.city ?? "", state: p.state ?? "", kyc_status: p.kyc_status,
    });
    setLimit(String(p.transaction_limit));
  }, [p]);
  useEffect(() => {
    if (!adj.account_id && data.accounts[0]) setAdj((a) => ({ ...a, account_id: data.accounts[0]!.id }));
  }, [data.accounts, adj.account_id]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["admin"] });
  };

  const saveProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Customer record updated"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const setStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.rpc("admin_set_user_status", { _user_id: id, _status: status });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status updated"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const saveLimit = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("admin_set_transaction_limit", { _user_id: id, _limit: Number(limit) });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Daily limit updated"); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const adjust = useMutation({
    mutationFn: async () => {
      const amount = Number(adj.amount);
      if (!adj.account_id || !amount || amount <= 0) throw new Error("Enter a positive amount and pick an account");
      const { error } = await supabase.rpc("admin_adjust_balance", {
        _account_id: adj.account_id,
        _amount: adj.direction === "credit" ? amount : -amount,
        _memo: adj.memo,
      });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Ledger adjustment posted"); setAdj((a) => ({ ...a, amount: "", memo: "" })); invalidate(); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Adjustment failed"),
  });

  if (!p) return <div className="p-8">Customer not found.</div>;

  return (
    <div className="p-4 md:p-8">
      <Link to="/admin/customers" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Customers
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{p.full_name ?? p.email}</h1>
        <span className={`rounded-full border px-2 py-0.5 text-[11px] capitalize ${statusTone(p.status)}`}>{p.status}</span>
        <span className="font-mono text-xs text-muted-foreground">@{p.username ?? "—"}</span>
      </div>
      <p className="text-sm text-muted-foreground">{p.email} · joined {new Date(p.created_at).toLocaleDateString()}</p>
      <Link to="/admin/messages" search={{ u: id }} className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
        <Mail className="h-4 w-4" /> Email this customer
      </Link>

      {/* Full profile */}
      <div className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="font-display text-lg">Profile on file</h2>
        <dl className="mt-3 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
          {([
            ["Full name", p.full_name],
            ["Username", p.username ? `@${p.username}` : null],
            ["Email", p.email],
            ["Phone", p.phone],
            ["Date of birth", p.date_of_birth ? new Date(p.date_of_birth).toLocaleDateString() : null],
            ["SSN (last 4)", p.ssn_last4 ? `•••-••-${p.ssn_last4}` : null],
            ["Address", [p.address_line1, p.address_line2].filter(Boolean).join(", ") || null],
            ["City / State", [p.city, p.state].filter(Boolean).join(", ") || null],
            ["Postal code", p.postal_code],
            ["Country", p.country],
            ["Account status", p.status],
            ["KYC status", p.kyc_status],
            ["Daily transaction limit", formatUSD(p.transaction_limit)],
            ["Two-factor", p.two_factor_enabled ? "Enabled" : "Disabled"],
            ["Roles", data.roles.join(", ") || "customer"],
            ["Risk score", data.risk ? String(data.risk.score) : null],
            ["Customer since", new Date(p.created_at).toLocaleString()],
            ["Last updated", new Date(p.updated_at).toLocaleString()],
          ] as [string, string | null | undefined][]).map(([label, value]) => (
            <div key={label}>
              <dt className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
              <dd className="capitalize">{value && String(value).trim() ? value : "—"}</dd>
            </div>
          ))}
        </dl>
      </div>

        {/* Accounts */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg">Accounts</h2>
          <div className="mt-3 space-y-2">
            {data.accounts.map((a) => (
              <div key={a.id} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium capitalize">{a.nickname ?? a.type}</p>
                  <p className="font-mono text-xs text-muted-foreground">••{a.account_number.slice(-4)} · {a.status}</p>
                </div>
                <p className="font-mono">{formatUSD(a.balance)}</p>
              </div>
            ))}
            {data.accounts.length === 0 && <p className="text-sm text-muted-foreground">No accounts.</p>}
          </div>
        </div>

        {/* Credit / debit */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg">Credit / debit account</h2>
          <div className="mt-3 grid gap-3">
            <div>
              <Label>Account</Label>
              <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={adj.account_id} onChange={(e) => setAdj({ ...adj, account_id: e.target.value })}>
                {data.accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.nickname ?? a.type} ••{a.account_number.slice(-4)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Direction</Label>
                <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={adj.direction} onChange={(e) => setAdj({ ...adj, direction: e.target.value as "credit" | "debit" })}>
                  <option value="credit">Credit (add funds)</option>
                  <option value="debit">Debit (remove funds)</option>
                </select>
              </div>
              <div><Label>Amount</Label><Input type="number" min="0" step="0.01" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} /></div>
            </div>
            <div><Label>Memo</Label><Input value={adj.memo} onChange={(e) => setAdj({ ...adj, memo: e.target.value })} placeholder="Reason for adjustment" /></div>
            <Button onClick={() => adjust.mutate()} disabled={adjust.isPending}>{adjust.isPending ? "Posting…" : "Post adjustment"}</Button>
          </div>
        </div>

        {/* Edit record */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg">Edit customer record</h2>
          <div className="mt-3 grid gap-3">
            <div><Label>Full name</Label><Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div><Label>Username</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
            <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
              <div><Label>State</Label><Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></div>
            </div>
            <div>
              <Label>KYC status</Label>
              <select className="h-9 w-full rounded-md border bg-background px-3 text-sm" value={form.kyc_status} onChange={(e) => setForm({ ...form, kyc_status: e.target.value })}>
                {["pending", "submitted", "verified", "rejected"].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <Button variant="outline" onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending}>Save record</Button>
          </div>
        </div>

        {/* Controls */}
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-display text-lg">Access controls</h2>
          <div className="mt-3 grid gap-3">
            <div>
              <Label>Daily transaction limit</Label>
              <div className="flex gap-2">
                <Input type="number" min="0" value={limit} onChange={(e) => setLimit(e.target.value)} />
                <Button variant="outline" onClick={() => saveLimit.mutate()} disabled={saveLimit.isPending}>Set</Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button size="sm" onClick={() => setStatus.mutate("active")} disabled={setStatus.isPending}>Activate</Button>
              <Button size="sm" variant="outline" onClick={() => setStatus.mutate("suspended")} disabled={setStatus.isPending}>Suspend</Button>
              <Button size="sm" variant="destructive" onClick={() => setStatus.mutate("banned")} disabled={setStatus.isPending}>Ban</Button>
              <Button size="sm" variant="ghost" onClick={() => setStatus.mutate("closed")} disabled={setStatus.isPending}>Close account</Button>
            </div>
            <p className="text-xs text-muted-foreground">Suspending, banning or closing freezes every account owned by this customer. All actions are written to the audit log.</p>

            <div className="mt-2 border-t pt-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" disabled={deleteUser.isPending}>
                    <Trash2 className="mr-1.5 h-4 w-4" />{deleteUser.isPending ? "Deleting…" : "Delete customer"}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete {p.full_name ?? p.email}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This removes the customer&apos;s login, accounts, cards, transactions and tickets. A snapshot is archived in the
                      recycle bin and the action is written to the audit log. You cannot delete your own account.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteUser.mutate()}>Delete customer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <p className="mt-2 text-xs text-muted-foreground">Deleted customers stay recoverable as an archived snapshot in the recycle bin.</p>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-6 rounded-xl border bg-card">
        <h2 className="border-b px-5 py-4 font-display text-lg">Recent transactions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {data.transactions.map((t) => (
                <tr key={t.id} className="border-b last:border-0">
                  <td className="px-5 py-3">{t.description}<p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()} · {t.type}</p></td>
                  <td className={`px-5 py-3 text-right font-mono ${Number(t.amount) < 0 ? "text-destructive" : "text-success"}`}>{formatUSD(t.amount)}</td>
                </tr>
              ))}
              {data.transactions.length === 0 && <tr><td className="px-5 py-8 text-center text-muted-foreground">No activity yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
