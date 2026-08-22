import { createServerFn } from "@tanstack/react-start";
import { requireEmailAuth } from "@/lib/email-auth-middleware";

export const analyzeErrorEvent = createServerFn({ method: "POST" })
  .middleware([requireEmailAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: event, error } = await supabaseAdmin
      .from("error_events")
      .select("incident_code,source,route,action,message,stack_summary,occurrence_count")
      .eq("id", data.id)
      .single();
    if (error || !event) throw new Error("Incident not found");
    const { error: startError } = await supabaseAdmin.from("error_events").update({ ai_status: "analyzing", ai_error: null }).eq("id", data.id);
    if (startError) throw new Error(`Could not start analysis: ${startError.message}`);
    try {
      const { analyzeDiagnosticEvent } = await import("@/lib/diagnostics-ai.server");
      const analysis = await analyzeDiagnosticEvent(event);
      const { error: saveError } = await supabaseAdmin.from("error_events").update({
        ai_status: "ready",
        ai_cause: analysis.cause.slice(0, 2_000),
        ai_confidence: analysis.confidence.slice(0, 20),
        ai_recommendation: analysis.recommendation.slice(0, 3_000),
        ai_action_kind: analysis.actionKind.slice(0, 80),
        analyzed_at: new Date().toISOString(),
      }).eq("id", data.id);
      if (saveError) throw new Error(`Could not save analysis: ${saveError.message}`);
      return analysis;
    } catch (analysisError) {
      const message = analysisError instanceof Error ? analysisError.message : String(analysisError);
      const { error: failureSaveError } = await supabaseAdmin.from("error_events").update({ ai_status: "failed", ai_error: message.slice(0, 1_000) }).eq("id", data.id);
      if (failureSaveError) console.error("Could not save diagnostic failure", failureSaveError);
      throw analysisError;
    }
  });

export const approveErrorAction = createServerFn({ method: "POST" })
  .middleware([requireEmailAuth])
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("Forbidden");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: event } = await supabaseAdmin.from("error_events").select("ai_action_kind").eq("id", data.id).single();
    if (!event?.ai_action_kind) throw new Error("Analyze this incident before approving an action");
    const now = new Date().toISOString();
    if (event.ai_action_kind === "mark_resolved") {
      await supabaseAdmin.from("error_events").update({
        action_approved_at: now,
        action_approved_by: context.userId,
        action_executed_at: now,
        status: "resolved",
        resolved_at: now,
        resolved_by: context.userId,
      }).eq("id", data.id);
      return { executed: true, message: "Incident marked resolved." };
    }
    await supabaseAdmin.from("error_events").update({ action_approved_at: now, action_approved_by: context.userId }).eq("id", data.id);
    return { executed: false, message: "Action approved and queued for manual execution. No code or credentials were changed." };
  });