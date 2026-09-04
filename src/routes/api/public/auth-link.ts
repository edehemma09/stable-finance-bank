import { createFileRoute } from "@tanstack/react-router";

const AUTH_TYPES = new Set(["signup", "magiclink", "recovery"]);

export const Route = createFileRoute("/api/public/auth-link")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestUrl = new URL(request.url);
        const type = requestUrl.searchParams.get("type") ?? "";
        const token = requestUrl.searchParams.get("token") ?? "";
        if (!AUTH_TYPES.has(type) || !token) {
          return new Response("Invalid authentication link", { status: 400 });
        }

        const { configuredPublicPath } = await import("@/lib/email/public-url.server");
        const callbackPath = type === "recovery" ? "reset-password?flow=recovery" : "email-verified?flow=verification";
        const redirectTo = await configuredPublicPath(callbackPath);
        const backendUrl = process.env["SUPABASE_URL"] || import.meta.env["VITE_SUPABASE_URL"];
        if (!backendUrl) return new Response("Authentication service is unavailable", { status: 503 });

        const verifyUrl = new URL("/auth/v1/verify", backendUrl);
        verifyUrl.searchParams.set("type", type);
        verifyUrl.searchParams.set("token", token);
        verifyUrl.searchParams.set("redirect_to", redirectTo);
        const verification = await fetch(verifyUrl, { redirect: "manual" });
        const location = verification.headers.get("location");
        if (!location) return Response.redirect(`${redirectTo}?error=invalid_link`, 303);

        const destination = new URL(location, redirectTo);
        const configuredOrigin = new URL(await configuredPublicPath("")).origin;
        const validPath = destination.pathname === "/email-verified" || destination.pathname === "/reset-password";
        if (destination.origin !== configuredOrigin || !validPath) {
          return Response.redirect(`${redirectTo}?error=invalid_link`, 303);
        }
        return Response.redirect(destination.toString(), verification.status);
      },
    },
  },
});