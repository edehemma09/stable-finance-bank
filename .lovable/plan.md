# Fix signup error: "Missing SUPABASE_SERVICE_ROLE_KEY"

## What's happening

Sign-up goes through the branded email flow (`signUpWithBrandedEmail` →
`signUpAndSendConfirmation`), which creates the user account with the
service-role backend client. That client needs the secret
`SUPABASE_SERVICE_ROLE_KEY` from the server environment. The sandbox has the
key, but the running server process has intermittently lost its backend
binding — so signup fails before the account is created. (Public keys are
auto-healed by `src/lib/supabase-env.ts`, but the service key is a secret and
deliberately has no inline fallback.)

## Fix

1. Refresh the project's backend credential binding with the built-in
   rebind action (it re-fetches the canonical service key and re-seeds
   `SUPABASE_URL`, publishable key, and service role key). Safe and
   idempotent — it never rotates or invalidates keys.
2. Restart the dev server so every worker picks up the refreshed
   environment.
3. Verify end-to-end in the live preview:
   - Submit a fresh signup at `/auth?mode=signup` and confirm the account,
     profile, checking account, and confirmation email are all created.
   - Re-run the same test in Admin → Settings (SMTP test) and Admin →
     Messages to confirm no other flow still hits the error.
4. Watch the Admin → Diagnostics error log — the incident for this error
   should stop reappearing.

## If the error returns after the refresh

That would mean the deployed environment (not the code) is dropping the
binding; the follow-up would be to route signup account creation through
`requireSupabaseAuth`-free admin path with an explicit env check and a clear
retry, rather than masking it. Only do this if step 1–3 doesn't hold.

## Technical notes

- Error originates in `src/integrations/supabase/client.server.ts`
  (`createSupabaseAdminClient`) when `SUPABASE_SERVICE_ROLE_KEY` is absent
  from `process.env`.
- No file edits required for the primary fix; the remedy is environmental.
- No database or schema changes.
