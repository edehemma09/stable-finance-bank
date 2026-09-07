import { createServerOnlyFn } from "@tanstack/react-start";
import { loadPublicUrlWithFallback, validatePublicUrl } from "./config-loader.server";

/**
 * Get configured public URL with process.env taking priority over database.
 * This ensures email verification and password reset links use the configured domain.
 */
export const getConfiguredPublicUrl = createServerOnlyFn(async () => {
  try {
    const urlConfig = await loadPublicUrlWithFallback();
    
    if (!urlConfig?.url) {
      throw new Error("Public URL is not configured in admin settings or PUBLIC_URL environment variable");
    }

    const url = validatePublicUrl(urlConfig.url);
    const result = url.toString().replace(/\/+$/, "");
    
    console.log(`[Public URL] Using ${urlConfig.source} URL: ${result}`);
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[Public URL] Configuration error:", message);
    throw new Error(`Public URL configuration error: ${message}`);
  }
});

export async function configuredPublicPath(path: string) {
  const base = await getConfiguredPublicUrl();
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/**
 * Replaces the backend-hosted auth URL with a same-domain proxy URL.
 * Uses the configured public URL from process.env or database.
 */
export async function configuredAuthLink(actionLink: string) {
  const action = new URL(actionLink);
  const type = action.searchParams.get("type");
  const token = action.searchParams.get("token");
  if (!type || !token) throw new Error("The authentication link was incomplete");

  const proxy = await configuredPublicPath("api/public/auth-link");
  return `${proxy}?${new URLSearchParams({ type, token }).toString()}`;
}
