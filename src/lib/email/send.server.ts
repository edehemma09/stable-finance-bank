import { renderEmail, type Branding } from "./render.server";

export type EmailPayload = {
  template: string;
  subject: string;
  title: string;
  intro: string;
  rows: [string, string][];
  footnote?: string;
  action?: { label: string; url: string };
};

export type DeliverySettings = {
  provider: string;
  api_key: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_name: string | null;
  from_email: string;
  reply_to: string | null;
  enabled: boolean;
};

const DEFAULT_BRAND: Branding = {
  brand_name: "Stable Finance Bank",
  logo_url: null,
  contact_email: "",
  contact_phone: "",
  address: "",
  primary_color: "#1B17FF",
  accent_color: "#C9A227",
};

/** Loads delivery settings + branding with the service-role client. Server only. */
export async function loadEmailContext() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: smtp }, { data: site }] = await Promise.all([
    supabaseAdmin.from("smtp_settings").select("*").eq("id", 1).maybeSingle(),
    supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  const settings = (smtp ?? null) as DeliverySettings | null;
  const brand: Branding = {
    brand_name: site?.brand_name ?? DEFAULT_BRAND.brand_name,
    logo_url: site?.logo_url ?? null,
    contact_email: site?.contact_email ?? "",
    contact_phone: site?.contact_phone ?? "",
    address: site?.address ?? "",
    primary_color: site?.primary_color ?? DEFAULT_BRAND.primary_color,
    accent_color: site?.accent_color ?? DEFAULT_BRAND.accent_color,
  };
  return { supabaseAdmin, settings, brand };
}

async function post(url: string, headers: Record<string, string>, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}${text ? ` — ${text.slice(0, 300)}` : ""}`);
  }
}

/** Sends one HTML email through the configured HTTP email provider. */
async function transport(s: DeliverySettings, from: { name: string; email: string }, to: string, subject: string, html: string) {
  const key = s.api_key?.trim() || process.env["EMAIL_API_KEY"] || "";
  const provider = (s.provider || "resend").toLowerCase();

  if (provider === "resend") {
    if (!key) throw new Error("No Resend API key saved in admin settings");
    return post("https://api.resend.com/emails", { authorization: `Bearer ${key}` }, {
      from: `${from.name} <${from.email}>`,
      to: [to],
      subject,
      html,
      ...(s.reply_to ? { reply_to: s.reply_to } : {}),
    });
  }

  if (provider === "brevo") {
    if (!key) throw new Error("No Brevo API key saved in admin settings");
    return post("https://api.brevo.com/v3/smtp/email", { "api-key": key }, {
      sender: { name: from.name, email: from.email },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      ...(s.reply_to ? { replyTo: { email: s.reply_to } } : {}),
    });
  }

  if (provider === "smtp2go") {
    if (!key) throw new Error("No SMTP2GO API key saved in admin settings");
    return post("https://api.smtp2go.com/v3/email/send", { "X-Smtp2go-Api-Key": key }, {
      sender: `${from.name} <${from.email}>`,
      to: [to],
      subject,
      html_body: html,
    });
  }

  if (provider === "mailgun") {
    // Mailgun uses the sending domain as the host segment; username holds the domain.
    const domain = s.username?.trim();
    if (!key || !domain) throw new Error("Mailgun needs an API key and the sending domain in the username field");
    const form = new URLSearchParams({ from: `${from.name} <${from.email}>`, to, subject, html });
    const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: "POST",
      headers: { authorization: `Basic ${btoa(`api:${key}`)}`, "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text().catch(() => "")}`.slice(0, 300));
    return;
  }

  throw new Error(
    `Unsupported email provider "${provider}". This app runs on an edge runtime, which cannot open raw SMTP connections — choose Resend, Brevo, SMTP2GO or Mailgun and paste the API key from that provider.`,
  );
}

/**
 * Renders and delivers a branded email, then records the attempt in email_log.
 * Never throws — always resolves with the outcome so callers can report it.
 */
export async function sendBrandedEmail(to: string, p: EmailPayload): Promise<{ sent: boolean; error?: string }> {
  const { supabaseAdmin, settings, brand } = await loadEmailContext();
  const log = async (status: string, error?: string) => {
    await supabaseAdmin
      .from("email_log")
      .insert({ to_email: to, subject: p.subject, template: p.template, status, error: error ?? null });
  };

  try {
    if (!settings) throw new Error("Email settings row is missing");
    if (!settings.enabled) throw new Error("Email delivery is switched off in admin settings");
    if (!settings.from_email?.trim()) throw new Error("No from-address saved in admin settings");

    const html = renderEmail(brand, p.title, p.intro, p.rows, p.footnote, p.action);
    await transport(
      settings,
      { name: settings.from_name?.trim() || brand.brand_name, email: settings.from_email.trim() },
      to,
      `${p.subject} · ${brand.brand_name}`,
      html,
    );
    await log("sent");
    return { sent: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await log("failed", message).catch(() => undefined);
    return { sent: false, error: message };
  }
}
