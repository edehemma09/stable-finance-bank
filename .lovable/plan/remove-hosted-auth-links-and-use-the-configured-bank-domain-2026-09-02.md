# Remove hosted auth links and use the configured bank domain/email delivery

## Confirmed current state
- The signup, resend-confirmation, and forgot-password flows currently build redirect URLs from `window.location.origin`, so a preview/hosted origin can be embedded instead of the bank URL.
- The database has `site_settings.public_url = https://www.stf-b.com`.
- The database also has a stale `app_config.app_url` pointing to the hosted preview URL; the notification email route still reads that value.
- SMTP delivery is enabled and configured in the admin settings (`smtp.stf-b.com:465`, SSL, configured sender, saved password).
- Regular branded notifications use the configured SMTP transport, but the current auth calls use the built-in auth mailer directly, so auth emails bypass the admin SMTP settings.

## User-visible outcome
- Confirmation, password-reset, resend, and notification action links use the normalized HTTPS value from Admin → Site settings → Public URL.
- Auth emails are sent through the SMTP configuration saved in Admin → Email delivery, with no hosted sender or hosted action URL exposed to customers.
- The app and email HTML contain no customer-facing `lovable.app`, `lovable.cloud`, or hosted-preview links. Internal platform runtime integrations remain untouched where required for the app to run.
- Login, registration, and password reset forms retain password visibility controls, inline errors, and the existing verification/reset success and expired-link states.

## Implementation
1. Add one server-side public URL resolver that reads `site_settings.public_url`, trims trailing slashes, requires an HTTPS URL, and never falls back to the current preview origin for customer-facing links.
2. Route all notification action URLs and auth redirect URLs through that resolver; remove the stale `app_config.app_url` dependency and update the database-backed configuration path so future admin edits take effect immediately.
3. Replace the direct built-in auth-mailer path with a server-side auth-mail flow that creates the appropriate confirmation/recovery action link, renders the bank-branded message, and sends it through the existing SMTP transport. Keep tokens server-controlled, single-purpose, and compatible with `/email-verified` and `/reset-password`.
4. Add safe failure handling: if the public URL or SMTP configuration is invalid, do not send a hosted fallback link; record a clear email-log failure and show a platform-neutral admin error.
5. Audit all email templates, action buttons, redirects, and visible configuration/error text for hosted URLs or platform-branded wording, replacing only customer/admin-facing instances.
6. Add/retain show-hide password controls on login, registration, and reset-password fields without changing password validation.

## Verification
- Check the stored public URL and SMTP settings before exercising the flow.
- Test signup confirmation, resend confirmation, forgot password, reset password, admin test email, and customer notification from the preview.
- Confirm the email log records the configured sender/SMTP result and that every generated action URL begins with `https://www.stf-b.com/` (or the exact URL saved in Admin settings).
- Confirm invalid/expired links and successful reset/verification states still render correctly, and check browser/network output for any remaining customer-visible hosted links.
