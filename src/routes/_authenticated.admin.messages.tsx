import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { adminCustomersQuery, adminEmailLogQuery } from "@/lib/admin-queries";
import { sendCustomerNotification } from "@/lib/mail.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Trash2, Mail } from "lucide-react";
import { errorText, isTransient } from "@/lib/error-text";

export const Route = createFileRoute("/_authenticated/admin/messages")({
  validateSearch: (s: Record<string, unknown>) => ({ u: typeof s.u === "string" ? s.u : undefined }),
  component: AdminMessages,
});

type Row = { k: string; v: string };

const TEMPLATES: Record<string, { subject: string; title: string; intro: string; rows: Row[]; footnote: string }> = {
  general: {
    subject: "A message from your bank",
    title: "A message from your bank",
    intro: "",
    rows: [],
    footnote: "",
  },
  account: {
    subject: "Important notice about your account",
    title: "Account notice",
    intro: "We're reaching out about a recent update to your account. Please review the details below.",
    rows: [{ k: "Action required", v: "Sign in to review" }],
    footnote: "If you did not expect this message, contact support immediately.",
  },
  verification: {
    subject: "Identity verification follow-up",
    title: "We need a little more information",
    intro: "Your identity verification is on hold until we receive the items listed below.",
    rows: [{ k: "Outstanding item", v: "Proof of address" }],
    footnote: "Upload documents from your dashboard under Profile → Verification.",
  },
};

function AdminMessages() {
  const qc = useQueryClient();
  const { u } = Route.useSearch();
  const [search, setSearch] = useState("");
  const { data: customers } = useQuery(adminCustomersQuery(search));
  const [userId, setUserId] = useState<string>(u ?? "");
  const [f, setF] = useState({ subject: "", title: "", intro: "", footnote: "" });
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (u) setUserId(u);
  }, [u]);

  const applyTemplate = (key: keyof typeof TEMPLATES) => {
    const t = TEMPLATES[key]!;
    setF({ subject: t.subject, title: t.title, intro: t.intro, footnote: t.footnote });
    setRows(t.rows.map((r) => ({ ...r })));
  };

  const selected = (customers ?? []).find((c) => c.id === userId);

  const send = useMutation({
    retry: (count, e) => count < 1 && isTransient(e),
    retryDelay: 800,
    mutationFn: async () => {
      const res = await sendCustomerNotification({
        data: {
          userId,
          template: "admin_message",
          subject: f.subject.trim(),
          title: f.title.trim() || f.subject.trim(),
          intro: f.intro.trim(),
          rows: rows.filter((r) => r.k.trim() || r.v.trim()).map((r) => [r.k, r.v] as [string, string]),
          footnote: f.footnote.trim() || undefined,
        },
      });
      if (!res?.sent) throw new Error(res?.error ?? "Send failed");
    },
    onSuccess: () => {
      toast.success("Email sent");
      qc.invalidateQueries({ queryKey: ["admin", "email_log"] });
    },
    onError: (e) => toast.error(errorText(e)),
  });

  const canSend = Boolean(userId && f.subject.trim() && f.intro.trim());

  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Communication</p>
      <h1 className="font-display text-3xl">Email a customer</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Sends a branded message to the customer's registered address. Every send is recorded in the email log.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="grid gap-4 rounded-xl border bg-card p-5">
          <div>
            <Label>Recipient</Label>
            <Input
              className="mt-1"
              placeholder="Search by name, username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border">
              {(customers ?? []).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setUserId(c.id)}
                  className={`flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left text-sm last:border-0 ${
                    c.id === userId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <span className="truncate">{c.full_name || c.username || "Unnamed"}</span>
                  <span className="truncate text-xs opacity-70">{c.email}</span>
                </button>
              ))}
              {(customers ?? []).length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted-foreground">No customers found.</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["general", "account", "verification"] as const).map((k) => (
              <Button key={k} type="button" size="sm" variant="outline" onClick={() => applyTemplate(k)}>
                {k === "general" ? "General message" : k === "account" ? "Account notice" : "Verification follow-up"}
              </Button>
            ))}
          </div>

          <div><Label>Subject</Label><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} /></div>
          <div><Label>Heading</Label><Input placeholder="Defaults to the subject" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div><Label>Message</Label><Textarea rows={5} value={f.intro} onChange={(e) => setF({ ...f, intro: e.target.value })} /></div>

          <div>
            <div className="flex items-center justify-between">
              <Label>Detail rows (optional)</Label>
              <Button type="button" size="sm" variant="ghost" onClick={() => setRows([...rows, { k: "", v: "" }])}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add row
              </Button>
            </div>
            <div className="mt-2 grid gap-2">
              {rows.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Label" value={r.k} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, k: e.target.value } : x)))} />
                  <Input placeholder="Value" value={r.v} onChange={(e) => setRows(rows.map((x, j) => (j === i ? { ...x, v: e.target.value } : x)))} />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setRows(rows.filter((_, j) => j !== i))}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div><Label>Footnote (optional)</Label><Input value={f.footnote} onChange={(e) => setF({ ...f, footnote: e.target.value })} /></div>

          <Button onClick={() => send.mutate()} disabled={!canSend || send.isPending}>
            <Mail className="mr-2 h-4 w-4" />
            {send.isPending ? "Sending…" : selected ? `Send to ${selected.email}` : "Select a recipient"}
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Preview</p>
          <div className="mt-3 overflow-hidden rounded-lg border">
            <div className="bg-primary px-5 py-4 text-primary-foreground font-display text-lg">Stable Finance Bank</div>
            <div className="bg-background p-5">
              <h2 className="font-display text-xl">{f.title || f.subject || "Message heading"}</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{f.intro || "Your message will appear here."}</p>
              <table className="mt-4 w-full text-sm">
                <tbody>
                  {rows.filter((r) => r.k || r.v).map((r, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="py-2 text-muted-foreground">{r.k}</td>
                      <td className="py-2 text-right font-medium">{r.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {f.footnote && <p className="mt-4 text-xs text-muted-foreground">{f.footnote}</p>}
              <div className="mt-5 h-[3px] bg-accent" />
            </div>
          </div>
        </div>
      </div>

      <RecentSends />
    </div>
  );
}

function RecentSends() {
  const { data } = useQuery(adminEmailLogQuery);
  const rows = (data ?? []).slice(0, 10);
  return (
    <div className="mt-8 max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Recent</p>
      <h2 className="font-display text-2xl">Last sends</h2>
      <div className="mt-3 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="px-4 py-3">{e.to_email}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.subject}</td>
                <td className={`px-4 py-3 capitalize ${e.status === "sent" ? "text-success" : "text-destructive"}`}>{e.status}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td className="px-4 py-8 text-center text-muted-foreground">Nothing sent yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
