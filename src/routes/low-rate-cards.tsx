import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/low-rate-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("low-rate-cards")),
  head: () => ({
    meta: [
      { title: "Low-Rate Credit Cards — Stable Finance Bank" },
      { name: "description", content: "Simple, low-APR credit cards with no hidden fees." },
    ],
  }),
  component: () => <MarketingPage slug="low-rate-cards" />,
});
