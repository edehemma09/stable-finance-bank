import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText, NoObjectGeneratedError, Output } from "ai";
import { z } from "zod";

const AnalysisSchema = z.object({
  cause: z.string(),
  confidence: z.string(),
  recommendation: z.string(),
  actionKind: z.string(),
});

function parseFallback(text: string) {
  try {
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return {
      cause: String(parsed.cause ?? "The analysis response was incomplete."),
      confidence: String(parsed.confidence ?? "low"),
      recommendation: String(parsed.recommendation ?? "Review the incident manually."),
      actionKind: String(parsed.actionKind ?? "manual_review"),
    };
  } catch {
    return {
      cause: "The AI response could not be parsed.",
      confidence: "low",
      recommendation: "Review the sanitized incident details manually.",
      actionKind: "manual_review",
    };
  }
}

export async function analyzeDiagnosticEvent(event: {
  incident_code: string;
  source: string;
  route: string | null;
  action: string | null;
  message: string;
  stack_summary: string | null;
  occurrence_count: number;
}) {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI diagnostics is not configured");

  const gateway = createOpenAICompatible({
    name: "lovable",
    baseURL: "https://ai.gateway.lovable.dev/v1",
    headers: { "Lovable-API-Key": key },
  });
  const prompt = `Analyze this sanitized web application incident. Do not claim to have changed code or infrastructure. Recommend only a safe next action that an administrator can approve. actionKind must be one of: retry_email, refresh_runtime_bindings, mark_resolved, manual_review. Confidence must be low, medium, or high.\n\n${JSON.stringify(event)}`;

  try {
    const result = await generateText({
      model: gateway.chatModel("google/gemini-3.7-flash"),
      output: Output.object({ schema: AnalysisSchema }),
      prompt,
    });
    return result.output;
  } catch (error) {
    if (NoObjectGeneratedError.isInstance(error)) return parseFallback(error.text);
    throw error;
  }
}