import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function createBackendFetch(publishableKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    if (publishableKey.startsWith("sb_") && headers.get("Authorization") === `Bearer ${publishableKey}`) {
      headers.delete("Authorization");
    }
    headers.set("apikey", publishableKey);
    return fetch(input, { ...init, headers });
  };
}

/** Reliable request-scoped auth for email actions without mutable process.env initialization. */
export const requireEmailAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const backendUrl = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
  const publishableKey =
    process.env["SUPABASE_PUBLISHABLE_KEY"] || import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  if (!backendUrl || !publishableKey) throw new Error("Email service configuration is unavailable");

  const authorization = getRequest()?.headers.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!token || token.split(".").length !== 3) throw new Error("Unauthorized: Sign in again and retry");

  const supabase = createClient<Database>(backendUrl, publishableKey, {
    global: {
      fetch: createBackendFetch(publishableKey),
      headers: { Authorization: `Bearer ${token}` },
    },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.auth.getClaims(token);
  const userId = data?.claims?.sub;
  if (error || !data?.claims || !userId) throw new Error("Unauthorized: Sign in again and retry");

  return next({ context: { supabase, userId, claims: data.claims } });
});