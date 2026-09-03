import { createServerFn } from "@tanstack/react-start";

type AuthEmailType = "signup" | "recovery" | "resend";

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
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { configuredPublicPath } = await import("./email/public-url.server");
    const { sendBrandedEmail } = await import("./email/send.server");
    const isSignup = data.type === "signup";
    const redirectTo = await configuredPublicPath(data.type === "recovery" ? "reset-password" : "email-verified");

    let generated;
    if (data.type === "signup") {
      const password = data.password;
      if (!password) throw new Error("Password must be at least 8 characters.");

      generated = await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email: data.email,
        password,
        options: {
          data: { full_name: data.fullName ?? "", username: data.username ?? "" },
          redirectTo,
        },
      });
    } else if (data.type === "resend") {
      // A magic link also verifies the address and gives the customer a
      // session, which lets the verification page confirm success. It avoids
      // the platform mailer while remaining usable for existing accounts.
      generated = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: data.email,
        options: { redirectTo },
      });
    } else {
      generated = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: data.email,
        options: { redirectTo },
      });
    }

    if (generated.error || !generated.data?.properties?.action_link) {
      throw generated.error ?? new Error("Could not create the authentication link");
    }

    const customLink = await configuredAuthLink(generated.data.properties.action_link);
    const result = await sendBrandedEmail(data.email, {
      template: data.type === "recovery" ? "auth_recovery" : "auth_signup",
      subject: data.type === "recovery"
        ? "Confirm your Stable Finance Bank email"
        : "Reset your Stable Finance Bank password",
      title: data.type === "recovery" ? "Reset your password" : "Confirm your email address",
      intro: data.type === "recovery"
        ? "Thanks for choosing Stable Finance Bank. Confirm your email address to activate your account."
        : "We received a request to reset your Stable Finance Bank password.",
      rows: [["Action", data.type === "recovery" ? "Choose a new password" : "Confirm email address"]],
      footnote: "If you did not request this email, you can safely ignore it or contact support.",
      action: {
        label: data.type === "recovery" ? "Reset password" : "Confirm email address",
        url: customLink,
      },
    });

    if (!result.sent) throw new Error(result.error ?? "Authentication email could not be sent");
    return { sent: true as const };
  });
