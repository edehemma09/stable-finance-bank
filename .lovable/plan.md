# Fix client-side registration and password recovery

## Confirmed issue
- The registration form does not currently call the browser authentication client. It calls `sendAuthEmail`, which immediately opens the privileged backend client and therefore fails whenever the role credential is unavailable.
- Forgot password and verification resend use the same role-dependent action, so they fail for the same reason.
- The account-creation trigger already provisions a profile, customer role, checking account, savings account, preferences, and welcome alert after a new authentication user is inserted.

## Changes
1. **Move user authentication to the publishable-key client**
   - Register with `supabase.auth.signUp()` in the browser, including full name and normalized username as user metadata.
   - Set `emailRedirectTo` dynamically from the current site origin to `/email-verified`.
   - Request password recovery with `supabase.auth.resetPasswordForEmail()` and redirect to `/reset-password`.
   - Resend signup confirmation with the browser auth resend method.
   - Remove all registration, resend, and forgot-password calls to the role-key-backed `sendAuthEmail` action.

2. **Preserve Admin SMTP through the secure auth-email hook**
   - Keep account creation and password-reset requests client-side and publishable-key-only.
   - Route the authentication system's outgoing signup, resend, and recovery messages through a signed server email hook that uses the SMTP configuration saved in Admin.
   - The hook will only deliver email; it will not create users, generate auth links, or perform authentication with the role key.
   - Validate the hook signature, map signup/recovery templates, preserve Stable Finance branding, and use the authentication system's one-time action URL with the configured site callback.

3. **Harden the screens**
   - Keep entered registration values after errors and show the exact safe authentication message.
   - Treat signup with email confirmation enabled as pending—not signed in—and show the confirmation panel.
   - Keep the existing reset page validation, invalid/expired state, password visibility controls, successful password update, and sign-out after recovery.
   - Keep the verification page loading, success, invalid/expired, and resend states.

4. **Configuration and verification**
   - Configure the authentication email hook and allow the current site origin callbacks for `/email-verified` and `/reset-password`.
   - Run focused checks, then test registration, automatic profile/account provisioning, verification resend, forgot password, recovery-link handling, password update, and sign-in with the new password.
   - Confirm the customer receives messages through the Admin SMTP sender and that ordinary authentication actions no longer reference the role credential.

## Technical boundary
The browser will use only the publishable key for signup, resend, password-reset requests, and password updates. SMTP credentials remain server-only; they cannot safely be exposed to client-side code. The signed email hook is the secure bridge between client-triggered authentication and the SMTP settings stored in Admin.
