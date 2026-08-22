/** Turns raw server errors into something an admin can act on. */
export function errorText(e: unknown) {
  const raw = e instanceof Error ? e.message : typeof e === "string" ? e : "";
  if (/Unauthorized/i.test(raw)) return "Your session expired — sign in again and retry.";
  return raw || "Failed";
}
