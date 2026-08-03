import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/investments")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("investments")),
  head: () => ({ meta: [{ title: "Investments — Meridian Bank" }] }),
  component: () => <MarketingPage slug="investments" />,
});
