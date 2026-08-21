# Fix the "Missing Supabase environment variable(s)" error on Admin → Settings

## What the error actually is

That red box comes from the server side of the app, not from your SMTP settings. When a server action runs, it reads the backend connection settings from the environment. At the moment you hit Save, the preview server had just restarted and those settings were not yet loaded, so the action failed before it ever touched the email settings.

Checked just now: the backend connection values **are** present in the running server, and the preview server is healthy and answering. The browser tab you have open is from before that restart (it also shows a "failed to fetch dynamically imported module" error, the classic stale-tab symptom).

So the immediate remedy is a hard reload of the preview. The plan below confirms that end-to-end and makes the failure mode less confusing if it happens again.

## Steps

1. Reload the preview, sign in as admin, open Admin → Settings → Email delivery, and save the SMTP credentials from your screenshot (host `smtp.stf-b.com`, port 465, SSL on, username `alert@stf-b.com`, from name/email, reply-to, delivery enabled). Confirm the row is written to the database.
2. Press "Send test" and read the outcome: report back whether it is a success, an auth failure from the mail host, or a blocked-port/connection error. Many hosts block outbound SMTP from cloud runtimes; if 465 refuses the connection, retry on 587 with SSL unticked.
3. Harden the settings page so a transient server-restart never looks like a settings problem:
   - Show the real server error text in the failure toast instead of a bare "Failed".
   - Detect the connection-not-ready error specifically and show "Backend is restarting — reload and try again" with a retry, rather than the raw environment-variable message.
4. If step 1 does fail again with the same message, capture the server log for that request and fix the root cause there instead (the environment read happens per request, so a persistent failure would point at the request path, not at the settings form).

## Technical notes

- Message originates in `src/integrations/supabase/auth-middleware.ts`, thrown before the handler runs when `SUPABASE_URL` / `SUPABASE_PUBLISHABLE_KEY` are absent from `process.env`. Both are present in the live dev-server process.
- Only the error surfacing in `src/routes/_authenticated.admin.settings.tsx` changes; the generated integration files are not edited.
- No database or schema changes.
