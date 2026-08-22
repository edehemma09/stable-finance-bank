import { createServerFn } from "@tanstack/react-start";
import { requireEmailAuth } from "@/lib/email-auth-middleware";

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
  .middleware([requireEmailAuth])
  .inputValidator((data: Payload) => data)
  .handler(async ({ data, context }) => {
    const email = (context.claims as { email?: string } | null)?.email;
    if (!email) return { sent: false as const, error: "No email on account" };
    const { sendBrandedEmail } = await import("./email/send.server");
    return sendBrandedEmail(email, data);
  });

/** Admin-only: send a test message to any address to validate the email provider. */
export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireEmailAuth])
  .inputValidator((data: { to: string }) => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.to)) throw new Error("Invalid email address");
    return data;
  })
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!isAdmin) throw new Error("Forbidden");
    const { sendBrandedEmail } = await import("./email/send.server");
    const result = await sendBrandedEmail(data.to, {
      template: "provider_test",
      subject: "Email delivery test",
      title: "Your email delivery works",
      intro:
        "This is a test message sent from your admin console to confirm outgoing email is configured correctly.",
      rows: [["Sent at", new Date().toLocaleString()]],
    });
    if (!result.sent) {
      const { recordErrorEvent } = await import("./error-logger.server");
      const incident = await recordErrorEvent(result.error ?? "Test email failed", {
        source: "email",
        route: "/admin/settings",
        action: "send_test_email",
        metadata: { template: "provider_test" },
      });
      return { ...result, incidentCode: incident.incidentCode };
    }
    return result;
  });

/** Admin/support-only: send a branded notification to a specific customer. */
export const sendCustomerNotification = createServerFn({ method: "POST" })
  .middleware([requireEmailAuth])
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
    const result = await sendBrandedEmail(profile.email, payload);
    if (!result.sent) {
      const { recordErrorEvent } = await import("./error-logger.server");
      const incident = await recordErrorEvent(result.error ?? "Customer email failed", {
        source: "email",
        route: "/admin/messages",
        action: "send_customer_notification",
        metadata: { template: payload.template },
      });
      return { ...result, incidentCode: incident.incidentCode };
    }
    return result;
  });
