# Complete registration and authentication-email wiring

## 1. Restore the registration backend credential first

- Rewire the sign up to went through with no service-role error, the user will be created (unconfirmed, awaiting email), and the database trigger auto-created their profile plus 2 accounts. Reset-password and email-verified pages render correctly, including the expired-link states.
- Rebind the Lovable Cloud runtime secrets so the managed service credential is available to server functions again but won't trigger SERVICE ROLE KEY.
- Verify the binding with a server-side auth action before changing application behavior.
- Keep the service credential server-only; it will never be added to frontend code, returned to the browser, or committed to the repository.
- Replace the infrastructure-focused error shown to customers with a safe registration failure message while recording the detailed cause in Diagnostics.

## 2. Repair the custom signup and email flow

- Fix `sendAuthEmail` so signup, resend, and password recovery each generate the correct backend authentication link.
- Import and use the configured-domain link transformer correctly.
- Correct the reversed signup/recovery subjects, titles, introductory text, button labels, and templates.
- Normalize emails and preserve signup metadata so the existing database trigger can create the profile and assigned accounts.
- Continue sending through the email configuration saved in Admin Settings; do not fall back to the platform mailer.
- Build every customer-facing link from the validated Admin Public URL. If either the public URL or email delivery configuration is invalid, fail explicitly rather than emitting a hosted fallback link.

## 3. Finish the three auth screens

- **Registration:** handle server-function exceptions reliably, show the real safe error in a toast, retain entered values after failure, and show the confirmation state only after the account and email link are created.
- **Email verification:** detect callback errors immediately, confirm the resulting authenticated user rather than trusting any stale session, support resend through the custom email path, and route verified users to dashboard or sign-in as appropriate.
- **Password reset:** require a genuine recovery callback/session, preserve inline errors and inputs, fix the password visibility control positioning, update the password, clear the recovery session, and show the success state.

## 4. Harden the configured-domain proxy

- Validate the auth type and token, exchange them only with the connected backend, and allow redirects only to the configured domain’s `/email-verified` or `/reset-password` route.
- Remove malformed URL handling and ensure invalid or expired links land in the matching page’s explicit error state.
- Confirm no authentication email or redirect code contains a hardcoded hosted preview URL.

## 5. Verify end to end

- Run focused static checks for the changed auth modules.
- Test new registration, confirmation-link resend, email verification, forgot-password delivery, invalid/expired links, password update, and sign-in with the new password.
- Confirm the new user receives the automatically provisioned profile and accounts, and confirm the delivered sender/link values come from Admin Settings.