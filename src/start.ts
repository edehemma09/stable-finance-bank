import { createStart, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { ensureSupabaseEnv } from "./lib/supabase-env";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

// Backend credentials can be absent from process.env on a cold edge worker;
// seed them before any handler (SSR, server route or server function) runs.
const supabaseEnvMiddleware = createMiddleware().server(async ({ next }) => {
  ensureSupabaseEnv();
  return next();
});

const supabaseEnvFunctionMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    ensureSupabaseEnv();
    return next();
  },
);

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    const { recordErrorEvent } = await import("./lib/error-logger.server");
    await recordErrorEvent(error, { source: "request_middleware", action: "unhandled_request" });
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

export const startInstance = createStart(() => ({
  functionMiddleware: [supabaseEnvFunctionMiddleware, attachSupabaseAuth],
  requestMiddleware: [supabaseEnvMiddleware, errorMiddleware],
}));

