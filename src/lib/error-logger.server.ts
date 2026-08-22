import { createHash, randomUUID } from "crypto";

type ErrorContext = {
  source: string;
  route?: string;
  action?: string;
  severity?: "info" | "warning" | "error" | "critical";
  metadata?: Record<string, unknown>;
};

const SECRET_PATTERN = /(authorization|cookie|password|token|secret|api[-_ ]?key|service[-_ ]?role)/i;

function cleanText(value: unknown, limit: number) {
  return String(value ?? "")
    .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, "Bearer [redacted]")
    .replace(/(sb_(?:secret|publishable)_[A-Za-z0-9_-]+)/g, "[redacted-key]")
    .slice(0, limit);
}

function cleanMetadata(metadata: Record<string, unknown> = {}) {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([key]) => !SECRET_PATTERN.test(key))
      .slice(0, 20)
      .map(([key, value]) => [key, cleanText(value, 300)]),
  );
}

export async function recordErrorEvent(error: unknown, context: ErrorContext) {
  const message = cleanText(error instanceof Error ? error.message : error, 1_200) || "Unknown error";
  const stack = cleanText(error instanceof Error ? error.stack : "", 3_000);
  const route = cleanText(context.route, 300);
  const action = cleanText(context.action, 120);
  const fingerprint = createHash("sha256")
    .update([context.source, route, action, message].join("|"))
    .digest("hex");
  const incidentCode = `ERR-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: existing } = await supabaseAdmin
      .from("error_events")
      .select("id,occurrence_count,status")
      .eq("fingerprint", fingerprint)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from("error_events")
        .update({
          occurrence_count: existing.occurrence_count + 1,
          last_seen_at: new Date().toISOString(),
          severity: context.severity ?? "error",
          route: route || null,
          action: action || null,
          message,
          stack_summary: stack || null,
          metadata: cleanMetadata(context.metadata),
          status: existing.status === "resolved" ? "open" : existing.status,
          resolved_at: existing.status === "resolved" ? null : undefined,
          resolved_by: existing.status === "resolved" ? null : undefined,
        })
        .eq("id", existing.id);
      return { id: existing.id, incidentCode };
    }

    const { data, error: insertError } = await supabaseAdmin
      .from("error_events")
      .insert({
        incident_code: incidentCode,
        fingerprint,
        severity: context.severity ?? "error",
        source: cleanText(context.source, 80),
        route: route || null,
        action: action || null,
        message,
        stack_summary: stack || null,
        metadata: cleanMetadata(context.metadata),
      })
      .select("id")
      .single();
    if (insertError) throw insertError;
    return { id: data.id, incidentCode };
  } catch (loggingError) {
    console.error("[diagnostics] Failed to persist error", loggingError);
    return { incidentCode };
  }
}