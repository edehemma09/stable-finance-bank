import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/mortgage")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("mortgage")),
  head: () => ({ meta: [{ title: "Mortgage — Meridian Bank" }] }),
  component: () => <MarketingPage slug="mortgage" />,
});
