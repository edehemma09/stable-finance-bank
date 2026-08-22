# Fix email failures and add AI-assisted error diagnostics

## Confirmed current state

- All three current email actions import and use the project-owned `requireEmailAuth` middleware, whose missing-configuration message is **“Email service configuration is unavailable.”**
- The screenshot instead shows the generated middleware’s exact **“Missing Supabase environment variable(s)”** message. This means the failing live request is not executing the same email path now present in the project source, or the live domain is serving an older build.
- `https://www.stf-b.com/admin/messages` is currently served by Vercel, while the apex `https://stf-b.com/admin/messages` returns an Apache 404 rather than the configured redirect.
- Existing diagnostics are transient `console.error` output plus `email_log`; there is no durable general application-error table. A local `error.log` file would be unreliable because the deployed app runs on stateless infrastructure.
- let all config be compatible with [www.stf-b.com](http://www.stf-b.com) and [stf-b.com](http://stf-b.com).

## Implementation

1. **Resolve the live email failure first**
  - Add a diagnostic identifier to every email server action and record which auth/runtime path handled it.
  - Remove the email actions’ dependency on mutable `process.env` initialization by creating request-scoped backend clients from validated runtime/build-time public configuration.
  - Ensure the privileged mail sender resolves its server credentials only inside the request handler, rather than through a cached generated client.
  - Test test-email and customer-email calls against the preview and verify the active live bundle/deployment. If the custom domain is serving an older build, surface that clearly and prepare the corrected build for publishing.
2. **Create a secure, durable error log**
  - Add an `error_events` table with explicit grants, RLS, timestamps, severity, source, route/action, safe message, stack fingerprint, occurrence count, status, diagnostic metadata, and resolution fields.
  - Never store passwords, auth tokens, cookies, SMTP credentials, full request bodies, or sensitive customer data. Sanitize and size-limit all captured values before persistence.
  - Deduplicate repeated failures by fingerprint so recurring errors increment a count instead of flooding the database.
  - Keep writes server-only and reads admin-only.
3. **Capture errors across the application**
  - Add a shared server logger and wire it into server middleware, email/auth actions, delivery failures, and public server routes.
  - Add browser-side capture for uncaught exceptions and rejected promises through a rate-limited reporting endpoint; include only safe route/browser context.
  - Return a short incident ID in error toasts so an admin can match what they saw to the stored event.
4. **Add an Admin Error Center**
  - Add an admin page listing open errors by severity, first/last seen, frequency, source, and incident ID.
  - Provide detail, filtering, status changes, and “Analyze with AI,” while keeping technical details away from customers.
  - Include delivery diagnostics alongside the existing email log so SMTP failures and application failures can be correlated.
5. **Add AI diagnosis with approval gates**
  - Use Lovable AI on the server to analyze a sanitized error event plus a small, controlled diagnostic context; never send secrets, credentials, raw customer data, or unrestricted database content.
  - Store the AI’s cause, confidence, recommended action, and whether the action is automatic, manual, or requires a code change.
  - Require an admin to approve every action. Only predefined, reversible playbooks—such as retrying a test email or rerunning a health check—may execute in-app after approval.
  - Code, schema, credential, and deployment changes will be proposed but not self-applied. The deployed app cannot safely rewrite and publish itself; those fixes still require the development/deployment workflow.
  - Surface AI Gateway errors exactly and do not retry terminal failures; use bounded backoff only for rate limits or transient upstream failures.
6. **Verification**
  - Trigger a controlled client error, server error, and SMTP failure; confirm each is sanitized, deduplicated, admin-visible, and linked to an incident ID.
  - Run a real AI analysis and verify the stored recommendation and approval requirement.
  - Sign in as admin and send both a test email and a direct customer email; confirm delivery and successful log entries without the missing-environment error.
  - Verify non-admin users cannot read error events, AI analyses, SMTP configuration, or remediation controls.

## Technical constraints

- Do not edit generated backend integration files.
- Do not create a filesystem `error.log`; use durable database logging.
- Do not expose private credentials or weaken RLS.
- Do not permit unrestricted autonomous AI code/database/deployment changes.
- Preserve the current SMTP transport and branded auth-email behavior while fixing their runtime credential path.
- note that  all config be compatible with "[www"](http://www.stf-b.com) and ones without "www" website address and also the indicated public url in the admin settings