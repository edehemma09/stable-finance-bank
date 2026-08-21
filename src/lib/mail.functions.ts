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

/** Sends a notification to the signed-in customer's own address only. */
export const sendMyNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: Payload) => data)
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | null)?.email;
    if (!email) return { sent: false as const, error: "No email on account" };
    const { sendBrandedEmail } = await import("./email/send.server");
    return sendBrandedEmail(email, data);
  });

/** Admin-only: send a test message to any address to validate the email provider. */
export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { to: string }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.to)) throw new Error("Invalid email address");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { sendBrandedEmail } = await import("./email/send.server");
    return sendBrandedEmail(data.to, {
      template: "provider_test",
      subject: "Email delivery test",
      title: "Your email delivery works",
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
    const { data: profile } = await context.supabase.from("profiles").select("email").eq("id", data.userId).maybeSingle();
    if (!profile?.email) return { sent: false as const, error: "Customer has no email" };
    const { userId: _ignored, ...payload } = data;
    const { sendBrandedEmail } = await import("./email/send.server");
    return sendBrandedEmail(profile.email, payload);
  });
