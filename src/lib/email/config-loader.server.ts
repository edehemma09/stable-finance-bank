/**
 * Loads email configuration from process.env FIRST (as primary),
 * then falls back to database if env vars are not set.
 * This ensures your SMTP credentials take priority over Lovable's defaults.
 */

export type SmtpConfigSource = {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
  from_name: string | null;
  from_email: string;
  reply_to: string | null;
  enabled: boolean;
  provider: string;
  api_key?: string;
  source: 'environment' | 'database';
};

export type PublicUrlSource = {
  url: string;
  source: 'environment' | 'database';
};

/**
 * Load SMTP configuration with process.env taking PRIORITY over database.
 * This ensures your configured SMTP is used instead of Lovable defaults.
 */
export async function loadSmtpConfigWithFallback(): Promise<SmtpConfigSource | null> {
  // CHECK PROCESS.ENV FIRST (Priority 1)
  const envHost = process.env["SMTP_HOST"];
  const envPort = process.env["SMTP_PORT"];
  const envSecure = process.env["SMTP_SECURE"];
  const envUsername = process.env["SMTP_USERNAME"];
  const envPassword = process.env["SMTP_PASSWORD"];
  const envFromName = process.env["SMTP_FROM_NAME"];
  const envFromEmail = process.env["SMTP_FROM_EMAIL"];
  const envReplyTo = process.env["SMTP_REPLY_TO"];
  const envProvider = process.env["SMTP_PROVIDER"];

  // If all critical env vars are set, use them (this is the primary source)
  if (envHost && envUsername && envPassword && envFromEmail) {
    console.log("[Email Config] Using SMTP configuration from process.env (PRIMARY)");
    return {
      host: envHost,
      port: envPort ? parseInt(envPort, 10) : 465,
      secure: envSecure !== 'false', // default true
      username: envUsername,
      password: envPassword,
      from_name: envFromName ?? null,
      from_email: envFromEmail,
      reply_to: envReplyTo ?? null,
      enabled: true,
      provider: envProvider || 'smtp',
      source: 'environment',
    };
  }

  // FALLBACK TO DATABASE (Priority 2)
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: smtp, error } = await supabaseAdmin
      .from("smtp_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!error && smtp) {
      console.log("[Email Config] Using SMTP configuration from database (FALLBACK)");
      return {
        host: smtp.host,
        port: smtp.port,
        secure: smtp.secure ?? true,
        username: smtp.username,
        password: smtp.password,
        from_name: smtp.from_name ?? null,
        from_email: smtp.from_email,
        reply_to: smtp.reply_to ?? null,
        enabled: smtp.enabled ?? true,
        provider: smtp.provider ?? 'smtp',
        api_key: smtp.api_key,
        source: 'database',
      };
    }
  } catch (e) {
    console.warn('[Email Config] Database unavailable:', e instanceof Error ? e.message : String(e));
  }

  // No configuration found in either source
  console.error("[Email Config] No SMTP configuration found in process.env or database");
  return null;
}

/**
 * Load public URL with process.env taking PRIORITY over database.
 * Ensures email links use your configured domain, not Lovable's.
 */
export async function loadPublicUrlWithFallback(): Promise<PublicUrlSource | null> {
  // CHECK PROCESS.ENV FIRST (Priority 1)
  const envUrl = process.env["PUBLIC_URL"];
  if (envUrl?.trim()) {
    const url = envUrl.trim().replace(/\/+$/, '');
    console.log("[Public URL] Using URL from process.env (PRIMARY):", url);
    return { url, source: 'environment' };
  }

  // FALLBACK TO DATABASE (Priority 2)
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("public_url")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data?.public_url?.trim()) {
      const url = data.public_url.trim().replace(/\/+$/, '');
      console.log("[Public URL] Using URL from database (FALLBACK):", url);
      return { url, source: 'database' };
    }
  } catch (e) {
    console.warn('[Public URL] Database unavailable:', e instanceof Error ? e.message : String(e));
  }

  console.error("[Public URL] No PUBLIC_URL configured in process.env or database");
  return null;
}

/**
 * Validate and parse a URL
 */
export function validatePublicUrl(url: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Public URL is invalid: "${url}". Must be a valid HTTPS URL (e.g., https://stf-b.com)`);
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Public URL must be a clean HTTPS site address (https://example.com)");
  }

  return parsed;
}
