import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("cards")),
  head: () => ({ meta: [{ title: "Cards — Meridian Bank" }] }),
  component: () => <MarketingPage slug="cards" />,
});
