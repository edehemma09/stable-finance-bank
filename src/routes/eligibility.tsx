import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/eligibility")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("eligibility")),
  head: () => ({ meta: [{ title: "Membership Eligibility — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="eligibility" />,
});
