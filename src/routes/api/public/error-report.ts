import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/error-report")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const fetchSite = request.headers.get("sec-fetch-site");
        if (fetchSite && fetchSite !== "same-origin") return new Response("Forbidden", { status: 403 });
        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > 20_000) return new Response("Payload too large", { status: 413 });
        let payload: Record<string, unknown>;
        try {
          payload = await request.json();
        } catch {
          return new Response("Invalid request", { status: 400 });
        }
        const { recordErrorEvent } = await import("@/lib/error-logger.server");
        const result = await recordErrorEvent(payload.message ?? "Browser error", {
          source: "browser",
          route: typeof payload.route === "string" ? payload.route : undefined,
          action: typeof payload.action === "string" ? payload.action : undefined,
          severity: "error",
          metadata: { userAgent: request.headers.get("user-agent") ?? "", kind: payload.kind ?? "runtime" },
        });
        return Response.json({ ok: true, incidentCode: result.incidentCode }, { status: 202 });
      },
    },
  },
});