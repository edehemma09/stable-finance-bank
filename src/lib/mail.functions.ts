import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type Payload = {
  template: string;
  title: string;
  intro: string;
  rows: [string, string][];
  footnote?: string;
  subject: string;
};

async function loadContext() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const [{ data: smtp }, { data: site }] = await Promise.all([
    supabaseAdmin.from("smtp_settings").select("*").eq("id", 1).maybeSingle(),
    supabaseAdmin.from("site_settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  if (!smtp) throw new Error("Email settings missing");
  const brand = {
    brand_name: site?.brand_name ?? "Stable Finance Bank",
    logo_url: site?.logo_url ?? null,
    contact_email: site?.contact_email ?? "",
    contact_phone: site?.contact_phone ?? "",
    address: site?.address ?? "",
    primary_color: site?.primary_color ?? "#0b2a4a",
    accent_color: site?.accent_color ?? "#d98324",
  };
  return { supabaseAdmin, smtp, brand };
}

async function deliver(to: string, p: Payload) {
  const { supabaseAdmin, smtp, brand } = await loadContext();
  const { renderEmail, sendMail } = await import("./mailer.server");
  const html = renderEmail(brand, p.title, p.intro, p.rows, p.footnote);
  try {
    await sendMail(smtp, brand, to, p.subject, html);
    await supabaseAdmin
      .from("email_log")
      .insert({ to_email: to, subject: p.subject, template: p.template, status: "sent" });
    return { sent: true as const };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await supabaseAdmin.from("email_log").insert({
      to_email: to,
      subject: p.subject,
      template: p.template,
      status: "failed",
      error: message,
    });
    return { sent: false as const, error: message };
  }
}

/** Sends a notification to the signed-in customer's own address only. */
export const sendMyNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Payload) => data)
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | null)?.email;
    if (!email) return { sent: false as const, error: "No email on account" };
    return deliver(email, data);
  });

/** Admin-only: send a test message to any address to validate SMTP credentials. */
export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { to: string }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.to)) throw new Error("Invalid email address");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    return deliver(data.to, {
      template: "smtp_test",
      subject: "SMTP test message",
      title: "Your mail server works",
      intro:
        "This is a test message sent from your admin console to confirm outgoing email is configured correctly.",
      rows: [["Sent at", new Date().toLocaleString()]],
    });
  });

/** Admin/support-only: send a branded notification to a specific customer. */
export const sendCustomerNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Payload & { userId: string }) => data)
  .handler(async ({ data, context }) => {
    const [{ data: isAdmin }, { data: isSupport }] = await Promise.all([
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }),
      context.supabase.rpc("has_role", { _user_id: context.userId, _role: "support" }),
    ]);
    if (!isAdmin && !isSupport) throw new Error("Forbidden");
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email")
      .eq("id", data.userId)
      .maybeSingle();
    if (!profile?.email) return { sent: false as const, error: "Customer has no email" };
    const { userId: _ignored, ...payload } = data;
    return deliver(profile.email, payload);
  });
