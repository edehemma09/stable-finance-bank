import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/making-cents")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("making-cents")),
  head: () => ({ meta: [{ title: "MakingCents — Financial Resources — Meridian Bank" }] }),
  component: () => <MarketingPage slug="making-cents" />,
});
