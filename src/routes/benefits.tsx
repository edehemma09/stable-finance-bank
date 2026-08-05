import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/benefits")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("benefits")),
  head: () => ({ meta: [{ title: "Member Benefits — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="benefits" />,
});
