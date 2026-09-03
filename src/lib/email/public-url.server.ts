import { createServerOnlyFn } from "@tanstack/react-start";

export const getConfiguredPublicUrl = createServerOnlyFn(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("site_settings")
    .select("public_url")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw error;
  const value = data?.public_url?.trim().replace(/\/+$/, "");
  if (!value) throw new Error("Public URL is not configured in admin settings");

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Public URL in admin settings is invalid");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("Public URL must be a clean HTTPS site address");
  }

  return url.toString().replace(/\/+$/, "");
});

export async function configuredPublicPath(path: string) {
  const base = await getConfiguredPublicUrl();
  return `${base}/${path.replace(/^\/+/, "")}`;
}

/** Replaces the backend-hosted auth URL with a same-domain proxy URL. */
export async function configuredAuthLink(actionLink: string) {
  const action = new URL(actionLink);
  const type = action.searchParams.get("type");
  const token = action.searchParams.get("token");
  if (!type || !token) throw new Error("The authentication link was incomplete");

  const proxy = await configuredPublicPath("api/public/auth-link");
  return `${proxy}?${new URLSearchParams({ type, token }).toString()}`;
}