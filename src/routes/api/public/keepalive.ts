import { createFileRoute } from "@tanstack/react-router";

/**
 * Keepalive ping. Hit every 10 minutes by the Vercel cron defined in
 * vercel.json (and by the in-database pg_cron job) so neither the app
 * nor the backend goes idle. Read-only: it touches one lightweight row.
 */
export const Route = createFileRoute("/api/public/keepalive")({
  server: {
    handlers: {
      GET: async ({ request }) => handlePing(request),
      POST: async ({ request }) => handlePing(request),
    },
  },
});

async function handlePing(request: Request) {
  const startedAt = Date.now();
  const source = new URL(request.url).searchParams.get("source") ?? "http";
  let db: "ok" | "error" = "ok";
  let detail: string | undefined;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("site_settings").select("id").limit(1);
    if (error) {
      db = "error";
      detail = error.message;
    }

    const ms = Date.now() - startedAt;
    // Best-effort audit trail so the schedule can be verified from Diagnostics.
    await supabaseAdmin.from("keepalive_pings").insert({
      source: source.slice(0, 40),
      ok: db === "ok",
      db_status: db,
      duration_ms: ms,
      detail: detail ? detail.slice(0, 500) : null,
    });
  } catch (err) {
    db = "error";
    detail = err instanceof Error ? err.message : String(err);
  }

  return new Response(
    JSON.stringify({
      ok: db === "ok",
      db,
      detail,
      source,
      ms: Date.now() - startedAt,
      at: new Date().toISOString(),
    }),
    {
      status: db === "ok" ? 200 : 503,
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    },
  );
}
