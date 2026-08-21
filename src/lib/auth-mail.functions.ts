import { createServerFn } from "@tanstack/react-start";

export type SignUpInput = {
  email: string;
  password: string;
  fullName: string;
  username: string;
  origin: string;
};

/** Public: creates the account and emails a branded confirmation link through the admin email provider. */
export const signUpWithBrandedEmail = createServerFn({ method: "POST" })
  .inputValidator((data: SignUpInput) => data)
  .handler(async ({ data }) => {
    const { signUpAndSendConfirmation, providerReady } = await import("./email/auth-links.server");
    // If the admin email provider isn't configured yet, let the built-in auth mailer handle it.
    if (!(await providerReady())) return { sent: false as const, fallback: true as const, error: undefined };
    try {
      const r = await signUpAndSendConfirmation(data);
      return { ...r, fallback: false as const };
    } catch (e) {
      return { sent: false as const, fallback: false as const, error: e instanceof Error ? e.message : String(e) };
    }
  });


/** Public: re-sends the confirmation link. Generic result to avoid revealing whether an address exists. */
export const resendConfirmationEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; origin: string }) => data)
  .handler(async ({ data }) => {
    const { resendConfirmation } = await import("./email/auth-links.server");
    try {
      const r = await resendConfirmation(data.email, data.origin);
      return { ok: true as const, error: r.error === "already_confirmed" ? "already_confirmed" : undefined };
    } catch {
      return { ok: true as const, error: undefined };
    }
  });

/** Public: emails a branded password-reset link. Always reports success. */
export const sendPasswordResetEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; origin: string }) => data)
  .handler(async ({ data }) => {
    const { sendPasswordReset } = await import("./email/auth-links.server");
    try {
      await sendPasswordReset(data.email, data.origin);
    } catch {
      /* never reveal whether the address exists */
    }
    return { ok: true as const };
  });
