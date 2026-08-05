import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/legal/terms")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("legal/terms")),
  head: () => ({ meta: [{ title: "Terms of Service — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="legal/terms" />,
});
