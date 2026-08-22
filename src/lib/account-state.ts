import { supabase } from "@/integrations/supabase/client";

export type AccountState = "active" | "suspended" | "banned" | "closed";

export const ACCOUNT_STATE_MESSAGES: Record<string, string> = {
  suspended: "This account is suspended. Contact support.",
  banned: "This account has been banned. Contact support.",
  closed: "This account has been closed. Contact support.",
};

export function accountStateMessage(state: string | null | undefined) {
  return (state && ACCOUNT_STATE_MESSAGES[state]) ?? null;
}

/**
 * Reads the signed-in customer's account state.
 * Returns the blocking state (e.g. "banned") or null when the account is usable.
 */
export async function getBlockingAccountState(): Promise<string | null> {
  const { data, error } = await (supabase.rpc as any)("my_account_state");
  if (error) return null; // never lock people out because of a transient read failure
  const state = typeof data === "string" ? data : null;
  return state && state !== "active" ? state : null;
}
