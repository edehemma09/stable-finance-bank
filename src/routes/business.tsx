import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/business")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business")),
  head: () => ({ meta: [{ title: "Business Banking — Meridian Bank" }] }),
  component: () => <MarketingPage slug="business" />,
});
