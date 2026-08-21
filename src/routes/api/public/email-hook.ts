import { createFileRoute } from "@tanstack/react-router";

/**
 * Internal dispatch endpoint. The database calls this (via pg_net) whenever a
 * customer notification row is created, and we turn it into a branded email.
 * Authenticated with a shared secret stored in public.app_config.
 */
export const Route = createFileRoute("/api/public/email-hook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        const { data: secretRow } = await supabaseAdmin
          .from("app_config")
          .select("value")
          .eq("key", "email_hook_secret")
          .maybeSingle();
        const expected = secretRow?.value ?? "";
        const provided = request.headers.get("x-email-hook-secret") ?? "";
        if (!expected || provided !== expected) {
          return new Response("Unauthorized", { status: 401 });
        }

        let alertId: string | undefined;
        try {
          alertId = (await request.json())?.alert_id;
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        if (!alertId) return new Response("Bad request", { status: 400 });

        const { data: alert } = await supabaseAdmin
          .from("alerts")
          .select("id,user_id,kind,title,body,created_at")
          .eq("id", alertId)
          .maybeSingle();
        if (!alert) return new Response("Not found", { status: 404 });

        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("email,full_name")
          .eq("id", alert.user_id)
          .maybeSingle();
        if (!profile?.email) return Response.json({ sent: false, reason: "no_email" });

        const { data: urlRow } = await supabaseAdmin
          .from("app_config")
          .select("value")
          .eq("key", "app_url")
          .maybeSingle();
        const appUrl = urlRow?.value ?? "";

        const { sendBrandedEmail } = await import("@/lib/email/send.server");
        const result = await sendBrandedEmail(profile.email, {
          template: `alert_${alert.kind}`,
          subject: alert.title,
          title: alert.title,
          intro: profile.full_name ? `Hello ${profile.full_name},` : "Hello,",
          rows: [
            ["Notification", alert.title],
            ...(alert.body ? ([["Details", alert.body]] as [string, string][]) : []),
            ["Date", new Date(alert.created_at).toLocaleString()],
          ],
          footnote:
            "You are receiving this because it relates to activity on your Stable Finance Bank account. Manage alert preferences in your dashboard.",
          ...(appUrl ? { action: { label: "Open your dashboard", url: `${appUrl}/app` } } : {}),
        });

        return Response.json(result);
      },
    },
  },
});
