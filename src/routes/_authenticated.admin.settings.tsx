import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { smtpSettingsQuery, adminEmailLogQuery } from "@/lib/admin-queries";
import { sendTestEmail } from "@/lib/mail.functions";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SiteSettings,
});

function SiteSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () =>
      (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const [f, setF] = useState({
    brand_name: "",
    tagline: "",
    logo_url: "",
    contact_email: "",
    contact_phone: "",
    address: "",
  });
  useEffect(() => {
    if (!data) return;
    setF({
      brand_name: data.brand_name,
      tagline: data.tagline,
      logo_url: data.logo_url ?? "",
      contact_email: data.contact_email,
      contact_phone: data.contact_phone,
      address: data.address,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update(f).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Site settings saved");
      qc.invalidateQueries();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Brand
      </p>
      <h1 className="font-display text-3xl">Site settings</h1>
      <div className="mt-6 grid max-w-xl gap-3 rounded-xl border bg-card p-5">
        <div>
          <Label>Brand name</Label>
          <Input
            value={f.brand_name}
            onChange={(e) => setF({ ...f, brand_name: e.target.value })}
          />
        </div>
        <div>
          <Label>Tagline</Label>
          <Input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} />
        </div>
        <div>
          <Label>Logo URL</Label>
          <Input value={f.logo_url} onChange={(e) => setF({ ...f, logo_url: e.target.value })} />
        </div>
        <div>
          <Label>Contact email</Label>
          <Input
            value={f.contact_email}
            onChange={(e) => setF({ ...f, contact_email: e.target.value })}
          />
        </div>
        <div>
          <Label>Contact phone</Label>
          <Input
            value={f.contact_phone}
            onChange={(e) => setF({ ...f, contact_phone: e.target.value })}
          />
        </div>
        <div>
          <Label>Address</Label>
          <Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} />
        </div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save settings"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Brand name, logo and contact details flow through the marketing site, dashboards, printed
          receipts and every outgoing email.
        </p>
      </div>

      <SmtpPanel />
      <EmailLogPanel />
    </div>
  );
}

function SmtpPanel() {
  const qc = useQueryClient();
  const { data } = useQuery(smtpSettingsQuery);
  const [s, setS] = useState({
    host: "",
    port: 465,
    secure: true,
    username: "",
    password: "",
    from_name: "",
    from_email: "",
    enabled: true,
  });
  const [testTo, setTestTo] = useState("");

  useEffect(() => {
    if (!data) return;
    setS({
      host: data.host,
      port: data.port,
      secure: data.secure,
      username: data.username,
      password: "",
      from_name: data.from_name ?? "",
      from_email: data.from_email,
      enabled: data.enabled,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const patch: Record<string, unknown> = {
        host: s.host,
        port: Number(s.port),
        secure: s.secure,
        username: s.username,
        from_name: s.from_name,
        from_email: s.from_email,
        enabled: s.enabled,
      };
      if (s.password.trim()) patch.password = s.password.trim();
      const { error } = await supabase
        .from("smtp_settings")
        .update(patch as never)
        .eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("SMTP credentials saved");
      setS((v) => ({ ...v, password: "" }));
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const test = useMutation({
    mutationFn: async () => {
      const res = await sendTestEmail({ data: { to: testTo.trim() } });
      if (!res?.sent) throw new Error(res?.error ?? "Send failed");
    },
    onSuccess: () => {
      toast.success("Test email sent");
      qc.invalidateQueries({ queryKey: ["admin", "email_log"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <div className="mt-8 max-w-xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Delivery
      </p>
      <h2 className="font-display text-2xl">Email / SMTP</h2>
      <div className="mt-4 grid gap-3 rounded-xl border bg-card p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>Host</Label>
            <Input value={s.host} onChange={(e) => setS({ ...s, host: e.target.value })} />
          </div>
          <div>
            <Label>Port</Label>
            <Input
              type="number"
              value={s.port}
              onChange={(e) => setS({ ...s, port: Number(e.target.value) })}
            />
          </div>
        </div>
        <div>
          <Label>Username</Label>
          <Input value={s.username} onChange={(e) => setS({ ...s, username: e.target.value })} />
        </div>
        <div>
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Leave blank to keep current password"
            value={s.password}
            onChange={(e) => setS({ ...s, password: e.target.value })}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label>From name</Label>
            <Input
              value={s.from_name}
              onChange={(e) => setS({ ...s, from_name: e.target.value })}
            />
          </div>
          <div>
            <Label>From email</Label>
            <Input
              value={s.from_email}
              onChange={(e) => setS({ ...s, from_email: e.target.value })}
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.secure}
            onChange={(e) => setS({ ...s, secure: e.target.checked })}
          />{" "}
          Use TLS/SSL (implicit, port 465)
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={s.enabled}
            onChange={(e) => setS({ ...s, enabled: e.target.checked })}
          />{" "}
          Email delivery enabled
        </label>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>
          {save.isPending ? "Saving…" : "Save SMTP settings"}
        </Button>
        <div className="mt-2 border-t pt-3">
          <Label>Send a test email</Label>
          <div className="mt-1 flex gap-2">
            <Input
              type="email"
              placeholder="you@example.com"
              value={testTo}
              onChange={(e) => setTestTo(e.target.value)}
            />
            <Button
              variant="outline"
              onClick={() => test.mutate()}
              disabled={test.isPending || !testTo.trim()}
            >
              {test.isPending ? "Sending…" : "Send test"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailLogPanel() {
  const { data } = useQuery(adminEmailLogQuery);
  const rows = data ?? [];
  return (
    <div className="mt-8 max-w-3xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        Observability
      </p>
      <h2 className="font-display text-2xl">Email log</h2>
      <div className="mt-4 overflow-x-auto rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-4 py-3 text-left">To</th>
              <th className="px-4 py-3 text-left">Subject</th>
              <th className="px-4 py-3 text-left">Template</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Sent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id} className="border-b last:border-0">
                <td className="px-4 py-3">{e.to_email}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.subject}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  {e.template ?? "—"}
                </td>
                <td
                  className={`px-4 py-3 capitalize ${e.status === "sent" ? "text-success" : "text-destructive"}`}
                >
                  {e.status}
                  {e.error ? ` — ${e.error.slice(0, 60)}` : ""}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(e.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No emails sent yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
