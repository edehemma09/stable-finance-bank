import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/certificates")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("certificates")),
  head: () => ({ meta: [{ title: "Share Certificates — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="certificates" />,
});
