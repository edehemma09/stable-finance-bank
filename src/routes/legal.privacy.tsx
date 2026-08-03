import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/legal/privacy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("legal/privacy")),
  head: () => ({ meta: [{ title: "Privacy Policy — Meridian Bank" }] }),
  component: () => <MarketingPage slug="legal/privacy" />,
});
