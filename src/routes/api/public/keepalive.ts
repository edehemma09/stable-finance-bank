import { createFileRoute } from "@tanstack/react-router";

/**
 * Keepalive ping. Hit every 10 minutes by the Vercel cron defined in
 * vercel.json (and by the in-database pg_cron job) so neither the app
 * nor the backend goes idle. Read-only: it touches one lightweight row.
 */
export const Route = createFileRoute("/api/public/keepalive")({
  server: {
    handlers: {
      GET: async () => {
        const startedAt = Date.now();
        let db: "ok" | "error" = "ok";
        let detail: string | undefined;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("site_settings")
            .select("id")
            .limit(1);
          if (error) {
            db = "error";
            detail = error.message;
          }
        } catch (err) {
          db = "error";
          detail = err instanceof Error ? err.message : String(err);
        }

        return new Response(
          JSON.stringify({ ok: db === "ok", db, detail, ms: Date.now() - startedAt, at: new Date().toISOString() }),
          {
            status: db === "ok" ? 200 : 503,
            headers: { "content-type": "application/json", "cache-control": "no-store" },
          },
        );
      },
    },
  },
});
