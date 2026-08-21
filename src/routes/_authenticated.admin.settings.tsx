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
/** Turns raw server errors into something an admin can act on. */
function errorText(e: unknown) {
  const raw = e instanceof Error ? e.message : typeof e === "string" ? e : "";
  if (/Missing Supabase environment variable|Failed to fetch|NetworkError|dynamically imported module/i.test(raw)) {
    return "The backend was restarting — reload the page and try again.";
  }
  if (/Unauthorized/i.test(raw)) return "Your session expired — sign in again and retry.";
  return raw || "Failed";
}



export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SiteSettings,
});

function SiteSettings() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["admin", "site_settings"],
    queryFn: async () => (await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const [f, setF] = useState({ brand_name: "", tagline: "", logo_url: "", contact_email: "", contact_phone: "", address: "" });
  useEffect(() => {
    if (!data) return;
    setF({
      brand_name: data.brand_name, tagline: data.tagline, logo_url: data.logo_url ?? "",
      contact_email: data.contact_email, contact_phone: data.contact_phone, address: data.address,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update(f).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Site settings saved"); qc.invalidateQueries(); },
    onError: (e) => toast.error(errorText(e)),
  });

  return (
    <div className="p-4 md:p-8">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Brand</p>
      <h1 className="font-display text-3xl">Site settings</h1>
      <div className="mt-6 grid max-w-xl gap-3 rounded-xl border bg-card p-5">
        <div><Label>Brand name</Label><Input value={f.brand_name} onChange={(e) => setF({ ...f, brand_name: e.target.value })} /></div>
        <div><Label>Tagline</Label><Input value={f.tagline} onChange={(e) => setF({ ...f, tagline: e.target.value })} /></div>
        <div><Label>Logo URL</Label><Input value={f.logo_url} onChange={(e) => setF({ ...f, logo_url: e.target.value })} /></div>
        <div><Label>Contact email</Label><Input value={f.contact_email} onChange={(e) => setF({ ...f, contact_email: e.target.value })} /></div>
        <div><Label>Contact phone</Label><Input value={f.contact_phone} onChange={(e) => setF({ ...f, contact_phone: e.target.value })} /></div>
        <div><Label>Address</Label><Input value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} /></div>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save settings"}</Button>
        <p className="text-xs text-muted-foreground">Brand name, logo and contact details flow through the marketing site, dashboards, printed receipts and every outgoing email.</p>
      </div>

      <SmtpPanel />
      <EmailLogPanel />
    </div>
  );
}

const PROVIDERS = [
  { id: "smtp", label: "SMTP server (host, port, username, password)", hint: "Classic SMTP: enter your mail server host, port (465 for SSL/TLS, 587 for STARTTLS), username and password." },
  { id: "resend", label: "Resend", hint: "Paste the API key that starts with re_. Verify your sending domain in Resend first." },
  { id: "brevo", label: "Brevo (Sendinblue)", hint: "Use an API v3 key from Brevo → SMTP & API → API keys." },
  { id: "smtp2go", label: "SMTP2GO", hint: "Use an API key from SMTP2GO → Sending → API Keys." },
  { id: "mailgun", label: "Mailgun", hint: "Paste your private API key, and put your Mailgun sending domain in the field below." },
];

function SmtpPanel() {
  const qc = useQueryClient();
  const { data } = useQuery(smtpSettingsQuery);
  const [s, setS] = useState({
    provider: "smtp", api_key: "", host: "", port: 465, secure: true, password: "",
    username: "", from_name: "", from_email: "", reply_to: "", enabled: true,
  });
  const [testTo, setTestTo] = useState("");

  useEffect(() => {
    if (!data) return;
    setS({
      provider: data.provider || "smtp",
      api_key: "",
      host: data.host ?? "",
      port: data.port ?? 465,
      secure: data.secure ?? true,
      password: "",
      username: data.username ?? "",
      from_name: data.from_name ?? "",
      from_email: data.from_email ?? "",
      reply_to: data.reply_to ?? "",
      enabled: data.enabled,
    });
  }, [data]);

  const save = useMutation({
    mutationFn: async () => {
      const row: Record<string, unknown> = {
        id: 1,
        provider: s.provider,
        username: s.username,
        from_name: s.from_name,
        from_email: s.from_email.trim(),
        reply_to: s.reply_to.trim() || null,
        enabled: s.enabled,
        api_key: s.api_key.trim() ? s.api_key.trim() : (data?.api_key ?? ""),
        host: s.host.trim(),
        port: Number(s.port) || 465,
        secure: s.secure,
        password: s.password ? s.password : (data?.password ?? ""),
      };
      const { error } = await supabase.from("smtp_settings").upsert(row as never, { onConflict: "id" });
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Email settings saved"); setS((v) => ({ ...v, api_key: "", password: "" })); qc.invalidateQueries({ queryKey: ["admin"] }); },
    onError: (e) => toast.error(errorText(e)),
  });

  const isSmtp = s.provider === "smtp";
  const hasKey = isSmtp
    ? Boolean(s.host.trim() && (s.password || data?.password))
    : Boolean(s.api_key.trim() || data?.api_key);
  const configured = Boolean(hasKey && s.from_email.trim());
  const hint = PROVIDERS.find((p) => p.id === s.provider)?.hint ?? "";

  const test = useMutation({
    mutationFn: async () => {
      const res = await sendTestEmail({ data: { to: testTo.trim() } });
      if (!res?.sent) throw new Error(res?.error ?? "Send failed");
    },
    onSuccess: () => { toast.success("Test email sent"); qc.invalidateQueries({ queryKey: ["admin", "email_log"] }); },
    onError: (e) => toast.error(errorText(e)),
  });

  return (
    <div className="mt-8 max-w-xl">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Delivery</p>
      <h2 className="font-display text-2xl">Email delivery</h2>
      <div
        className={`mt-3 rounded-lg border px-4 py-3 text-sm ${
          configured && s.enabled
            ? "border-success/30 bg-success/10 text-success"
            : "border-warning/40 bg-warning/10 text-warning-foreground"
        }`}
      >
        {configured && s.enabled
          ? "Email delivery is configured and enabled. Send a test below to confirm."
          : !configured
            ? "Not configured — choose a provider, paste its API key and a from-address, save, then send a test."
            : "Credentials saved, but delivery is switched off. Tick “Email delivery enabled” to start sending."}
      </div>
      <div className="mt-4 grid gap-3 rounded-xl border bg-card p-5">
        <div>
          <Label>Provider</Label>
          <select
            className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={s.provider}
            onChange={(e) => setS({ ...s, provider: e.target.value })}
          >
            {PROVIDERS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
          </select>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        {isSmtp ? (
          <>
            <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
              <div><Label>SMTP host</Label><Input value={s.host} onChange={(e) => setS({ ...s, host: e.target.value })} placeholder="mail.yourbank.com" /></div>
              <div><Label>Port</Label><Input type="number" value={s.port} onChange={(e) => setS({ ...s, port: Number(e.target.value) })} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={s.secure} onChange={(e) => setS({ ...s, secure: e.target.checked, port: e.target.checked ? 465 : 587 })} />
              Use SSL/TLS (port 465). Untick for STARTTLS (port 587).
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><Label>Username</Label><Input value={s.username} onChange={(e) => setS({ ...s, username: e.target.value })} placeholder="alerts@yourbank.com" /></div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder={data?.password ? "Saved — leave blank to keep current" : "SMTP password"}
                  value={s.password}
                  onChange={(e) => setS({ ...s, password: e.target.value })}
                />
              </div>
            </div>
          </>
        ) : (
          <div>
            <Label>API key</Label>
            <Input
              type="password"
              placeholder={data?.api_key ? "Saved — leave blank to keep current key" : "Paste your provider API key"}
              value={s.api_key}
              onChange={(e) => setS({ ...s, api_key: e.target.value })}
            />
          </div>
        )}
        {s.provider === "mailgun" && (
          <div><Label>Mailgun sending domain</Label><Input value={s.username} onChange={(e) => setS({ ...s, username: e.target.value })} placeholder="mg.yourbank.com" /></div>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <div><Label>From name</Label><Input value={s.from_name} onChange={(e) => setS({ ...s, from_name: e.target.value })} /></div>
          <div><Label>From email</Label><Input value={s.from_email} onChange={(e) => setS({ ...s, from_email: e.target.value })} placeholder="alerts@yourbank.com" /></div>
        </div>
        <div><Label>Reply-to (optional)</Label><Input value={s.reply_to} onChange={(e) => setS({ ...s, reply_to: e.target.value })} placeholder="support@yourbank.com" /></div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.enabled} onChange={(e) => setS({ ...s, enabled: e.target.checked })} /> Email delivery enabled
        </label>
        <Button onClick={() => save.mutate()} disabled={save.isPending}>{save.isPending ? "Saving…" : "Save email settings"}</Button>
        <p className="text-xs text-muted-foreground">
          {isSmtp
            ? "Direct SMTP delivery. Some hosts block outbound SMTP ports — if a test fails to connect, try port 465 with SSL/TLS, or switch to one of the API providers above."
            : "Provider HTTP API delivery — the same mailbox and domain as your SMTP credentials, just over their API."}
        </p>
        <div className="mt-2 border-t pt-3">
          <Label>Send a test email</Label>
          <div className="mt-1 flex gap-2">
            <Input type="email" placeholder="you@example.com" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
            <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending || !testTo.trim()}>
              {test.isPending ? "Sending…" : "Send test"}
            </Button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Automatic emails (welcome, verification, loan and cheque decisions, alerts) send themselves whenever a customer notification is created.
          </p>
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
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Observability</p>
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
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{e.template ?? "—"}</td>
                <td className={`px-4 py-3 capitalize ${e.status === "sent" ? "text-success" : "text-destructive"}`}>
                  {e.status}{e.error ? ` — ${e.error.slice(0, 60)}` : ""}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">No emails sent yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

