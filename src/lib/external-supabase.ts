/**
 * Customer-owned backend project (external Supabase credentials).
 *
 * The app is migrated off the platform-managed backend. The project URL and
 * publishable key are public values, safe to inline. The service-role key is
 * NEVER stored in code — it must be provided as the
 * EXTERNAL_SUPABASE_SERVICE_ROLE_KEY secret/environment variable.
 *
 * applyExternalSupabaseOverride() rewrites every source the generated
 * clients read (import.meta.env for the browser, process.env for the server)
 * BEFORE any client is instantiated. It self-executes on import, so simply
 * importing this module (first import in src/router.tsx) is enough. The call
 * is idempotent.
 */

const FALLBACK_URL = "https://ahinhlspippemyzjpjyu.supabase.co";
const FALLBACK_PROJECT_ID = "ahinhlspippemyzjpjyu";
const FALLBACK_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoaW5obHNwaXBwZW15empwanl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEwNzI3MDIsImV4cCI6MjEwNjY0ODcwMn0.sPn6c11NeIjhtgO1uYkHwyw-SjRG_RDhmjChwq1k_1w";

let applied = false;

function readExternalEnv(name: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[name];
  return typeof value === "string" && value ? value : undefined;
}

export function externalSupabaseUrl(): string {
  return (readExternalEnv("EXTERNAL_SUPABASE_URL") ?? FALLBACK_URL).replace(/\/+$/, "");
}

export function externalSupabasePublishableKey(): string {
  return readExternalEnv("EXTERNAL_SUPABASE_ANON_KEY") ?? FALLBACK_ANON_KEY;
}

export function externalBackendActive(): boolean {
  return applied;
}

/** True when an external (customer-owned) admin credential is configured. */
export function externalServiceRoleConfigured(): boolean {
  return Boolean(readExternalEnv("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY"));
}

export function applyExternalSupabaseOverride(): void {
  if (applied) return;
  applied = true;

  const url = externalSupabaseUrl();
  const key = externalSupabasePublishableKey();

  // Server env: override the platform-managed values (edge runtime bindings).
  if (typeof process !== "undefined" && process.env) {
    process.env["SUPABASE_URL"] = url;
    process.env["SUPABASE_PUBLISHABLE_KEY"] = key;
    process.env["SUPABASE_ANON_KEY"] = key;
    process.env["SUPABASE_PROJECT_ID"] = FALLBACK_PROJECT_ID;

    const externalServiceRole = readExternalEnv("EXTERNAL_SUPABASE_SERVICE_ROLE_KEY");
    if (externalServiceRole) {
      process.env["SUPABASE_SERVICE_ROLE_KEY"] = externalServiceRole;
    } else {
      // Never combine the platform admin credential with the external URL —
      // remove it so admin calls fail loudly instead of authenticating wrong.
      delete process.env["SUPABASE_SERVICE_ROLE_KEY"];
    }
  }

  // Browser/Vite env: the generated clients read these at runtime.
  const viteEnv = import.meta.env as unknown as Record<string, string | undefined>;
  viteEnv["VITE_SUPABASE_URL"] = url;
  viteEnv["VITE_SUPABASE_PUBLISHABLE_KEY"] = key;
  viteEnv["VITE_SUPABASE_ANON_KEY"] = key;
  viteEnv["VITE_SUPABASE_PROJECT_ID"] = FALLBACK_PROJECT_ID;
}

applyExternalSupabaseOverride();
