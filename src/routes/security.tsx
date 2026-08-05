import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/security")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("security")),
  head: () => ({ meta: [{ title: "Security — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="security" />,
});
