import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/business-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business-loans")),
  head: () => ({ meta: [{ title: "Business Loans — Meridian Bank" }] }),
  component: () => <MarketingPage slug="business-loans" />,
});
