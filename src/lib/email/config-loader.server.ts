/**
 * Loads email configuration from database with graceful fallback to process.env.
 * This ensures email delivery works even if the service role key is temporarily unavailable.
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
  source: 'database' | 'environment';
};

export type PublicUrlSource = {
  url: string;
  source: 'database' | 'environment';
};

/**
 * Load SMTP configuration from database, falling back to process.env
 * Returns both the config and its source (database or environment)
 */
export async function loadSmtpConfigWithFallback(): Promise<SmtpConfigSource | null> {
  // Try to load from database first
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: smtp, error } = await supabaseAdmin
      .from("smtp_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle();

    if (!error && smtp) {
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
    // Database unavailable, fall through to environment
    console.warn('[Email Config] Database unavailable, attempting process.env fallback:', e instanceof Error ? e.message : String(e));
  }

  // Fallback to process.env
  const envHost = process.env["SMTP_HOST"];
  const envPort = process.env["SMTP_PORT"];
  const envSecure = process.env["SMTP_SECURE"];
  const envUsername = process.env["SMTP_USERNAME"];
  const envPassword = process.env["SMTP_PASSWORD"];
  const envFromName = process.env["SMTP_FROM_NAME"];
  const envFromEmail = process.env["SMTP_FROM_EMAIL"];
  const envReplyTo = process.env["SMTP_REPLY_TO"];

  if (!envHost || !envUsername || !envPassword || !envFromEmail) {
    // No complete config in either source
    return null;
  }

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
    provider: 'smtp',
    source: 'environment',
  };
}

/**
 * Load public URL from database, falling back to process.env
 * Returns the URL and its source
 */
export async function loadPublicUrlWithFallback(): Promise<PublicUrlSource | null> {
  // Try database first
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("public_url")
      .eq("id", 1)
      .maybeSingle();

    if (!error && data?.public_url?.trim()) {
      const url = data.public_url.trim().replace(/\/+$/, '');
      return { url, source: 'database' };
    }
  } catch (e) {
    console.warn('[Email Config] Database unavailable for public URL, attempting process.env fallback:', e instanceof Error ? e.message : String(e));
  }

  // Fallback to process.env
  const envUrl = process.env["PUBLIC_URL"];
  if (envUrl?.trim()) {
    const url = envUrl.trim().replace(/\/+$/, '');
    return { url, source: 'environment' };
  }

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
    throw new Error(`Public URL is invalid: "${url}"`);
  }

  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Public URL must be a clean HTTPS site address (https://example.com)");
  }

  return parsed;
}
