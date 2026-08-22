/** Turns raw server errors into something an admin can act on. */
export function errorText(e: unknown) {
  const raw = e instanceof Error ? e.message : typeof e === "string" ? e : "";
  if (/Missing Supabase environment variable|Failed to fetch|NetworkError|dynamically imported module/i.test(raw)) {
    return "The backend was restarting — reload the page and try again.";
  }
  if (/Unauthorized/i.test(raw)) return "Your session expired — sign in again and retry.";
  return raw || "Failed";
}

/** True when the failure is a transient backend/bundle hiccup worth retrying once. */
export function isTransient(e: unknown) {
  const raw = e instanceof Error ? e.message : typeof e === "string" ? e : "";
  return /Missing Supabase environment variable|Failed to fetch|NetworkError|dynamically imported module/i.test(raw);
}
