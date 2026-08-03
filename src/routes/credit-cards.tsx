import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/credit-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("credit-cards")),
  head: () => ({ meta: [{ title: "Credit Cards — Meridian Bank" }] }),
  component: () => <MarketingPage slug="credit-cards" />,
});
