import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/insurance")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("insurance")),
  head: () => ({ meta: [{ title: "Insurance — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="insurance" />,
});
