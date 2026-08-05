import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/refinance")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("refinance")),
  head: () => ({ meta: [{ title: "Refinance — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="refinance" />,
});
