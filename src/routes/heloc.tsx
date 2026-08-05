import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/heloc")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("heloc")),
  head: () => ({ meta: [{ title: "Home Equity Line of Credit — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="heloc" />,
});
