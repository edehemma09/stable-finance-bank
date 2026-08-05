import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/money-market")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("money-market")),
  head: () => ({ meta: [{ title: "Money Market Savings — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="money-market" />,
});
