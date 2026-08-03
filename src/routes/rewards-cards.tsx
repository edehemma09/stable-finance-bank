import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/rewards-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("rewards-cards")),
  head: () => ({ meta: [{ title: "Rewards Credit Cards — Meridian Bank" }, { name: "description", content: "Earn cash back and travel points with no annual fee." }] }),
  component: () => <MarketingPage slug="rewards-cards" />,
});
