import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/business-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business-cards")),
  head: () => ({ meta: [{ title: "Business Cards — Stable Finance Bank" }, { name: "description", content: "Business credit and debit cards with employee controls." }] }),
  component: () => <MarketingPage slug="business-cards" />,
});
