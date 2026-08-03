import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/merchant-services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("merchant-services")),
  head: () => ({ meta: [{ title: "Merchant Services — Meridian Bank" }, { name: "description", content: "Card processing, POS terminals, and online payments." }] }),
  component: () => <MarketingPage slug="merchant-services" />,
});
