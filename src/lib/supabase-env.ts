/**
 * Guarantees the server-side Supabase environment variables always exist.
 *
 * On the edge runtime `process.env` starts empty and bindings arrive per
 * request, which made server functions intermittently fail with
 * "Missing Supabase environment variable(s)". The publishable URL/key are
 * public values that Vite inlines at build time, so we can safely fall back
 * to them whenever the runtime has not populated `process.env` yet.
 */
export function ensureSupabaseEnv(bindings?: unknown): void {
  if (typeof process === "undefined" || !process.env) return;

  const fromBindings =
    bindings && typeof bindings === "object" ? (bindings as Record<string, unknown>) : {};

  const put = (key: string, value: unknown) => {
    if (typeof value === "string" && value && !process.env[key]) process.env[key] = value;
  };

  for (const key of [
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_PROJECT_ID",
  ] as const) {
    put(key, fromBindings[key]);
  }

  // Public fallbacks that are inlined into the bundle at build time.
  put("SUPABASE_URL", import.meta.env["VITE_SUPABASE_URL"]);
  put("SUPABASE_PUBLISHABLE_KEY", import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]);
  put("SUPABASE_ANON_KEY", import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"]);
  put("SUPABASE_PROJECT_ID", import.meta.env["VITE_SUPABASE_PROJECT_ID"]);
}
