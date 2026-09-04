import { createServerFn } from "@tanstack/react-start";

type AuthEmailType = "signup" | "recovery" | "resend";

type AuthEmailResult =
  | { sent: true }
  | { sent: false; error: string };

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export const sendAuthEmail = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      type: AuthEmailType;
      email: string;
      password?: string;
      fullName?: string;
      username?: string;
    }) => {
      if (!validEmail(data.email)) throw new Error("Enter a valid email address");
      if (data.type === "signup" && (!data.password || data.password.length < 8)) {
        throw new Error("Password must be at least 8 characters.");
      }
      return data;
    },
  )
  .handler(async ({ data }): Promise<AuthEmailResult> => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { configuredAuthLink, configuredPublicPath } = await import("./email/public-url.server");
      const { sendBrandedEmail } = await import("./email/send.server");
      const email = data.email.trim().toLowerCase();
      const redirectTo = await configuredPublicPath(
        data.type === "recovery" ? "reset-password?flow=recovery" : "email-verified?flow=verification",
      );

      let generated;
      if (data.type === "signup") {
        const password = data.password;
        if (!password) throw new Error("Password must be at least 8 characters.");

        generated = await supabaseAdmin.auth.admin.generateLink({
          type: "signup",
          email,
          password,
          options: {
            data: { full_name: data.fullName?.trim() ?? "", username: data.username?.trim().toLowerCase() ?? "" },
            redirectTo,
          },
        });
      } else if (data.type === "resend") {
        generated = await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email,
          options: { redirectTo },
        });
      } else {
        generated = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email,
          options: { redirectTo },
        });
      }

      if (generated.error || !generated.data?.properties?.action_link) {
        throw generated.error ?? new Error("Could not create the authentication link");
      }

      const customLink = await configuredAuthLink(generated.data.properties.action_link);
      const isRecovery = data.type === "recovery";
      const result = await sendBrandedEmail(email, {
        template: isRecovery ? "auth_recovery" : "auth_signup",
        subject: isRecovery
          ? "Reset your Stable Finance Bank password"
          : "Confirm your Stable Finance Bank email",
        title: isRecovery ? "Reset your password" : "Confirm your email address",
        intro: isRecovery
          ? "We received a request to reset your Stable Finance Bank password."
          : "Thanks for choosing Stable Finance Bank. Confirm your email address to activate your account.",
        rows: [["Action", isRecovery ? "Choose a new password" : "Confirm email address"]],
        footnote: "If you did not request this email, you can safely ignore it or contact support.",
        action: {
          label: isRecovery ? "Reset password" : "Confirm email address",
          url: customLink,
        },
      });

      if (!result.sent) throw new Error(result.error ?? "Authentication email could not be sent");
      return { sent: true };
    } catch (error) {
      console.error("Authentication email flow failed", error);
      const message = error instanceof Error ? error.message : "Authentication service unavailable";
      const safeMessage = /SUPABASE_SERVICE_ROLE_KEY|Missing Supabase environment/i.test(message)
        ? "Registration is temporarily unavailable. Please try again shortly."
        : message;
      return { sent: false, error: safeMessage };
    }
  });
