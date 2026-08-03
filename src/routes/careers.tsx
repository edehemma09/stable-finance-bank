import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/careers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("careers")),
  head: () => ({ meta: [{ title: "Careers — Meridian Bank" }] }),
  component: () => <MarketingPage slug="careers" />,
});
