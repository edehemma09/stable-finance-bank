import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/brokerage")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("brokerage")),
  head: () => ({ meta: [{ title: "Brokerage — Meridian Bank" }, { name: "description", content: "Commission-free stock and ETF trades with research tools." }] }),
  component: () => <MarketingPage slug="brokerage" />,
});
