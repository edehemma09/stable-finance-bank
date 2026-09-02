import { createServerFn } from "@tanstack/react-start";

type AuthEmailType = "signup" | "recovery";

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const sendAuthEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { type: AuthEmailType; email: string; password?: string; fullName?: string; username?: string }) => {
    if (!validEmail(data.email)) throw new Error("Enter a valid email address");
    if (data.type === "signup" && (!data.password || data.password.length < 8)) {
      throw new Error("Password must be at least 8 characters.");
    }
    return data;
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { configuredPublicPath } = await import("./email/public-url.server");
    const { sendBrandedEmail } = await import("./email/send.server");
    const redirectTo = await configuredPublicPath(data.type === "signup" ? "email-verified" : "reset-password");
    const generated = await supabaseAdmin.auth.admin.generateLink(
      data.type === "signup"
        ? {
            type: "signup",
            email: data.email,
            password: data.password,
            data: { full_name: data.fullName ?? "", username: data.username ?? "" },
            options: { redirectTo },
          }
        : { type: "recovery", email: data.email, options: { redirectTo } },
    );

    if (generated.error || !generated.data?.properties?.action_link) {
      throw generated.error ?? new Error("Could not create the authentication link");
    }

    const isSignup = data.type === "signup";
    const result = await sendBrandedEmail(data.email, {
      template: isSignup ? "auth_signup" : "auth_recovery",
      subject: isSignup ? "Confirm your Stable Finance Bank email" : "Reset your Stable Finance Bank password",
      title: isSignup ? "Confirm your email address" : "Reset your password",
      intro: isSignup
        ? "Thanks for choosing Stable Finance Bank. Confirm your email address to activate your account."
        : "We received a request to reset your Stable Finance Bank password.",
      rows: [["Action", isSignup ? "Confirm email address" : "Choose a new password"]],
      footnote: "If you did not request this email, you can safely ignore it or contact support.",
      action: { label: isSignup ? "Confirm email address" : "Reset password", url: generated.data.properties.action_link },
    });

    if (!result.sent) throw new Error(result.error ?? "Authentication email could not be sent");
    return { sent: true as const };
  });