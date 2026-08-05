import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/first-time-homebuyer")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(pageBySlugQuery("first-time-homebuyer")),
  head: () => ({ meta: [{ title: "First-Time Homebuyer — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="first-time-homebuyer" />,
});
