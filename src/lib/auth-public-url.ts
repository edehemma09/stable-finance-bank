import { supabase } from "@/integrations/supabase/client";

const fallbackOrigin = () => window.location.origin;

/**
 * Auth email redirects use the public URL saved by an administrator.
 * The browser only reads this public setting with the publishable key.
 */
export async function getAuthRedirectUrl(path: string): Promise<string> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("public_url")
    .eq("id", 1)
    .maybeSingle();

  if (error) throw new Error("The public site URL is not available. Please contact support.");

  const configured = data?.public_url?.trim();
  if (!configured) return `${fallbackOrigin()}/${path.replace(/^\/+/, "")}`;

  let url: URL;
  try {
    url = new URL(configured);
  } catch {
    throw new Error("The public site URL is invalid. Please contact support.");
  }

  if (url.protocol !== "https:" || url.username || url.password || url.search || url.hash) {
    throw new Error("The public site URL must be a secure HTTPS address.");
  }

  return `${url.toString().replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}