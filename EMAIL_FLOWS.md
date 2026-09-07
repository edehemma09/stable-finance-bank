# Email Flow Documentation - All Automated Email Routes

## Overview
This document maps all email sending routes in the application and shows how to configure your SMTP to be used instead of Lovable's defaults.

---

## 1. AUTHENTICATION EMAILS (Signup, Password Reset, Resend)

### Entry Point: `src/lib/auth-email.functions.ts`
**File:** `/src/lib/auth-email.functions.ts`
**Function:** `sendAuthEmail()` - Server function handling signup, password recovery, and resend flows

#### Flow Path:
```
User Action (Signup/ForgotPassword/Resend)
    ↓
sendAuthEmail() [auth-email.functions.ts]
    ↓
configuredPublicPath() [public-url.server.ts] 
    ↓ (Gets your PUBLIC_URL from env or database)
supabaseAdmin.auth.admin.generateLink() [Supabase Auth]
    ↓ (Generates auth link with redirectTo = your PUBLIC_URL)
configuredAuthLink() [public-url.server.ts]
    ↓ (Transforms link from Supabase to your domain)
sendBrandedEmail() [send.server.ts]
    ↓ (Sends using your SMTP_* env vars)
SMTP Server (alert@stf-b.com)
    ↓
Customer Inbox
```

### Three Email Types Sent:

#### A. **SIGNUP EMAIL** (New account verification)
- **Route:** `/auth` page → signup form → `submit()` 
- **Trigger:** User clicks "Create account"
- **Function:** `sendAuthEmail({ type: "signup", email, password, fullName, username })`
- **Template:** `auth_signup`
- **Subject:** "Confirm your Stable Finance Bank email"
- **Email From:** `SMTP_FROM_EMAIL` (from process.env) → `alert@stf-b.com`
- **Sending Address:** Uses your SMTP config with `from_email: alert@stf-b.com`
- **Link Destination:** User's configured `PUBLIC_URL` + `/email-verified?flow=verification`

**Code Location:**
```typescript
// src/routes/auth.tsx - submit() function
const { error } = await supabase.auth.signUp({
  email: normalizedEmail,
  password,
  options: {
    emailRedirectTo: `${window.location.origin}/email-verified?flow=verification`,
    data: { full_name: fullName.trim(), username: uname },
  },
});
```

#### B. **PASSWORD RESET EMAIL** (Forgot password)
- **Route:** `/auth` page → "Forgot password" link → email prompt
- **Trigger:** User clicks "Forgot password"
- **Function:** `sendAuthEmail({ type: "recovery", email })`
- **Template:** `auth_recovery`
- **Subject:** "Reset your Stable Finance Bank password"
- **Email From:** `SMTP_FROM_EMAIL` → `alert@stf-b.com`
- **Link Destination:** User's configured `PUBLIC_URL` + `/reset-password?flow=recovery`

**Code Location:**
```typescript
// src/routes/auth.tsx - forgotPassword() function
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectUrl: `${window.location.origin}/reset-password?flow=recovery`,
});
```

#### C. **RESEND EMAIL** (Resend verification)
- **Route:** `/email-verified` page → resend form OR `/auth` pending confirmation → resend button
- **Trigger:** User clicks "Resend verification email"
- **Function:** `sendAuthEmail({ type: "resend", email })`
- **Template:** `auth_signup` (same as signup)
- **Subject:** "Confirm your Stable Finance Bank email"
- **Email From:** `SMTP_FROM_EMAIL` → `alert@stf-b.com`
- **Link Destination:** Same as signup - user's `PUBLIC_URL` + `/email-verified?flow=verification`

**Code Location:**
```typescript
// src/routes/email-verified.tsx - resend() function
const result = await sendAuthEmailAction({
  data: { type: "resend", email: email.trim().toLowerCase() },
});
```

---

## 2. TRANSACTIONAL EMAILS (Notifications, Alerts)

### Entry Point: `src/routes/api/public/email-hook.ts`
**Trigger:** Database trigger creates new alert/notification row
**Flow:**
```
Database Trigger (alerts table)
    ↓
POST /api/public/email-hook [email-hook.ts]
    ↓
supabaseAdmin.from("alerts").select() [fetch alert data]
    ↓
loadPublicUrlWithFallback() [config-loader.server.ts]
    ↓ (Gets your PUBLIC_URL)
sendBrandedEmail() [send.server.ts]
    ↓ (Uses your SMTP config)
SMTP Server
    ↓
Customer Inbox
```

**Email Types:**
- Loan decision notifications
- Cheque processing alerts
- Account activity notifications
- System messages

**Sending Address:** Uses `SMTP_FROM_EMAIL` (alert@stf-b.com) from config

**Code Location:**
```typescript
// src/routes/api/public/email-hook.ts
const result = await sendBrandedEmail(profile.email, {
  template: `alert_${alert.kind}`,
  subject: alert.title,
  title: alert.title,
  intro: profile.full_name ? `Hello ${profile.full_name},` : "Hello,",
  // Uses configuredPublicPath() to build action URL
  ...(appUrl ? { action: { label: "Open your dashboard", url: `${appUrl}/app` } } : {}),
});
```

---

## 3. CUSTOMER NOTIFICATIONS (Admin → Customer)

### Entry Point: `src/lib/mail.functions.ts`
**Function:** `sendCustomerNotification()` 
**Access:** Admin/support staff only
**Trigger:** Admin → Admin Messages → "Send to customer"

**Flow:**
```
Admin Dashboard
    ↓
sendCustomerNotification() [mail.functions.ts]
    ↓
requireEmailAuth middleware [email-auth-middleware.ts]
    ↓
sendBrandedEmail() [send.server.ts]
    ↓ (Uses your SMTP config)
SMTP Server
    ↓
Customer Inbox
```

**Sending Address:** Uses `SMTP_FROM_EMAIL` (alert@stf-b.com)

**Code Location:**
```typescript
// src/lib/mail.functions.ts
export const sendCustomerNotification = createServerFn({ method: "POST" })
  .middleware([requireEmailAuth])
  .handler(async ({ data, context }) => {
    const { data: profile } = await context.supabase
      .from("profiles")
      .select("email")
      .eq("id", data.userId)
      .maybeSingle();
    return sendBrandedEmail(profile.email, data);
  });
```

---

## 4. TEST EMAIL (Admin Settings)

### Entry Point: `src/routes/_authenticated.admin.settings.tsx`
**Function:** `sendTestEmail()`
**Access:** Admin only
**Trigger:** Admin → Settings → Email delivery → "Send test"

**Flow:**
```
Admin Settings → "Send test email"
    ↓
sendTestEmail() [mail.functions.ts]
    ↓
requireEmailAuth middleware
    ↓
sendBrandedEmail() [send.server.ts]
    ↓ (Uses your SMTP config via loadSmtpConfigWithFallback())
SMTP Server
    ↓
Test Recipient Inbox
```

**Sending Address:** Uses `SMTP_FROM_EMAIL` (alert@stf-b.com)

**Code Location:**
```typescript
// src/lib/mail.functions.ts
export const sendTestEmail = createServerFn({ method: "POST" })
  .middleware([requireEmailAuth])
  .handler(async ({ data, context }) => {
    const { sendBrandedEmail } = await import("./email/send.server");
    return sendBrandedEmail(data.to, {
      template: "provider_test",
      subject: "Email delivery test",
      title: "Your email delivery works",
      intro: "This is a test message sent from your admin console...",
      rows: [["Sent at", new Date().toLocaleString()]],
    });
  });
```

---

## 5. PERSONAL NOTIFICATION (Signed-in user only)

### Entry Point: `src/lib/mail.functions.ts`
**Function:** `sendMyNotification()`
**Access:** Authenticated users only
**Trigger:** User sends message to themselves

**Flow:**
```
sendMyNotification() [mail.functions.ts]
    ↓
requireEmailAuth middleware
    ↓
sendBrandedEmail() [send.server.ts]
    ↓ (Uses your SMTP config)
SMTP Server
    ↓
User's Own Inbox
```

---

## ENVIRONMENT VARIABLES REQUIRED

To use your SMTP instead of Lovable's defaults, set these in your `.env`:

```env
# SMTP Configuration (Priority 1 - overrides database)
SMTP_HOST=smtp.stf-b.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USERNAME=alert@stf-b.com
SMTP_PASSWORD=Gi09502f0
SMTP_FROM_EMAIL=alert@stf-b.com
SMTP_FROM_NAME=Stable Finance Bank
SMTP_REPLY_TO=support@stf-b.com
SMTP_PROVIDER=smtp

# Public URL for email links (Priority 1 - overrides database)
PUBLIC_URL=https://stf-b.com

# Supabase (required for all email operations)
SUPABASE_URL=your_supabase_url
SUPABASE_PUBLISHABLE_KEY=your_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## Configuration Priority

All email functions use this priority order:

1. **process.env variables** (YOUR SMTP CONFIG) ← **SET THESE**
2. Database `smtp_settings` table (Lovable defaults)
3. Default hardcoded values

**Example:**
```typescript
// In config-loader.server.ts
if (envHost && envUsername && envPassword && envFromEmail) {
  // Use YOUR config
  return { source: 'environment', ... };
}
// Else fall back to database
```

---

## How the System Currently Works

### WITHOUT Your Environment Variables:
1. All emails still use Lovable's default mailer
2. Sender appears as `no-reply@mail.lovable-app.com`
3. Email verification links redirect to Lovable domain
4. Password reset links redirect to Lovable domain

### WITH Your Environment Variables Set:
1. All emails use YOUR SMTP (alert@stf-b.com)
2. Sender appears as `Stable Finance Bank <alert@stf-b.com>`
3. Email verification links redirect to YOUR PUBLIC_URL (https://stf-b.com)
4. Password reset links redirect to YOUR PUBLIC_URL (https://stf-b.com)
5. All customer notifications sent from YOUR domain

---

## Files Modified to Support This

1. **src/lib/email/config-loader.server.ts** - Loads SMTP and URL with env priority
2. **src/lib/email/send.server.ts** - Uses config loader with fallback
3. **src/lib/email/public-url.server.ts** - Uses config loader for domain
4. **src/lib/auth-email.functions.ts** - Already uses public-url.server.ts (no changes needed)
5. **src/lib/mail.functions.ts** - Already uses sendBrandedEmail (no changes needed)

---

## Testing the Configuration

1. **Set your `.env` variables** with your SMTP credentials
2. **Restart the application**
3. **Test flow:**
   - Admin → Settings → Email delivery → "Send test email"
   - Should arrive from `alert@stf-b.com`
   - Should say "Email delivery test"
4. **Create new account** (or resend verification)
   - Verification email should be from `alert@stf-b.com`
   - Verification link should start with your `PUBLIC_URL`
5. **Test password reset**
   - "Forgot password" email should be from `alert@stf-b.com`
   - Reset link should start with your `PUBLIC_URL`

---

## Database Fallback (For Backward Compatibility)

If `.env` variables are not set:
- **SMTP Settings** read from `public.smtp_settings` table (admin can configure via Settings)
- **Public URL** read from `public.site_settings` table (admin can configure via Settings)

This allows temporary operation via the admin dashboard when env vars aren't available.
