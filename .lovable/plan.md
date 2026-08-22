# Permanently fix the recurring backend credential error

## Confirmed issue

The screenshot’s exact error is thrown by the authentication middleware before any SMTP or customer-email code runs. The existing request middleware attempts to copy backend bindings into `process.env`, but the email server functions still depend on the generated middleware reading those mutable values later. The retry and friendly toast only conceal that failure; they do not remove it.

## Changes

1. Add a project-owned authentication middleware for email server actions that resolves the public backend URL/key directly at request time, using runtime bindings with the safe build-time public values as fallback.
2. Preserve the existing bearer-token validation and signed-in user context, including the opaque publishable-key request handling.
3. Switch all three email actions—test email, direct customer email, and self-notification—to the reliable middleware so they no longer reach the failing generated path.
4. Remove the automatic retry/error classification for this credential error from the email UI; genuine delivery failures will show their actual SMTP/provider message instead of “backend was restarting.”
5. Verify the app compiles, then sign into the preview as an admin and test both:
   - Admin Settings → Send test email
   - Admin Messages → Send to one customer
   Confirm each send reaches the email engine and produces a success/log result without the environment-variable alert.

## Technical constraints

- Do not edit generated backend integration files.
- Do not expose or hardcode private credentials.
- Keep the existing SMTP configuration and delivery engine unchanged; this fix targets authentication/environment initialization only.
