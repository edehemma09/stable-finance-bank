import { sendBrandedEmail, loadEmailContext } from "./send.server";

/** True when the admin email provider is switched on and has everything it needs to send. */
export async function providerReady() {
  const { settings } = await loadEmailContext();
  if (!settings?.enabled || !settings.from_email?.trim()) return false;
  if (settings.provider === "smtp") {
    return Boolean(settings.host?.trim() && settings.username?.trim() && settings.password);
  }
  return Boolean(settings.api_key?.trim());
}


type LinkKind = "signup" | "recovery" | "magiclink";

async function redirectOrigin(fallbackOrigin: string) {
  const { publicUrl } = await loadEmailContext();
  const candidate = publicUrl || fallbackOrigin;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") throw new Error("Public URL must use HTTPS");
    return parsed.origin;
  } catch {
    return new URL(fallbackOrigin).origin;
  }
}

/** Generates a Supabase auth action link with the service-role client (no GoTrue email is sent). */
async function generateLink(
  kind: LinkKind,
  email: string,
  redirectTo: string,
  password?: string,
  meta?: Record<string, unknown>,
) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.generateLink(
    kind === "signup"
      ? { type: "signup", email, password: password!, options: { data: meta, redirectTo } }
      : kind === "recovery"
        ? { type: "recovery", email, options: { redirectTo } }
        : { type: "magiclink", email, options: { redirectTo } },
  );
  if (error) throw new Error(error.message);
  const url = data.properties?.action_link;
  if (!url) throw new Error("Could not generate the secure link");
  return url;
}

/** Creates the account (unconfirmed) and emails a branded confirmation link via the admin provider. */
export async function signUpAndSendConfirmation(input: {
  email: string;
  password: string;
  fullName: string;
  username: string;
  origin: string;
}) {
  const origin = await redirectOrigin(input.origin);
  const url = await generateLink("signup", input.email, `${origin}/app`, input.password, {
    full_name: input.fullName,
    username: input.username,
  });
  const res = await sendBrandedEmail(input.email, {
    template: "auth_confirm",
    subject: "Confirm your email address",
    title: "Confirm your email address",
    intro: `Welcome, ${input.fullName}. Confirm this address to activate your Stable Finance Bank online banking profile and your new checking and savings accounts.`,
    rows: [
      ["Email", input.email],
      ["Username", input.username],
    ],
    footnote: "This link expires in 24 hours. If you didn't request it, you can safely ignore this email.",
    action: { label: "Confirm my email", url },
  });
  return res;
}

/** Re-sends a confirmation link to an account that hasn't verified yet. */
export async function resendConfirmation(email: string, origin: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const user = data?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) return { sent: false as const, error: undefined };
  if (user.email_confirmed_at) return { sent: false as const, error: "already_confirmed" };
  const publicOrigin = await redirectOrigin(origin);
  const url = await generateLink("magiclink", email, `${publicOrigin}/app`);
  return sendBrandedEmail(email, {
    template: "auth_confirm_resend",
    subject: "Confirm your email address",
    title: "Confirm your email address",
    intro: "Here is a fresh link to confirm your email address and sign in to online banking.",
    rows: [["Email", email]],
    footnote: "This link expires in 1 hour and can only be used once.",
    action: { label: "Confirm and sign in", url },
  });
}

/** Emails a branded password-reset link. Always resolves, even for unknown addresses. */
export async function sendPasswordReset(email: string, origin: string) {
  const publicOrigin = await redirectOrigin(origin);
  const url = await generateLink("recovery", email, `${publicOrigin}/auth/reset`);
  return sendBrandedEmail(email, {
    template: "auth_recovery",
    subject: "Reset your password",
    title: "Reset your password",
    intro: "We received a request to reset the password on your online banking profile. Use the button below to choose a new one.",
    rows: [["Email", email]],
    footnote:
      "This link expires in 1 hour. If you didn't request a password reset, ignore this email — your password stays unchanged.",
    action: { label: "Choose a new password", url },
  });
}
