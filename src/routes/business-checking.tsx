import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/business-checking")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business-checking")),
  head: () => ({ meta: [{ title: "Business Checking — Meridian Bank" }, { name: "description", content: "No-fee business checking with unlimited transactions." }] }),
  component: () => <MarketingPage slug="business-checking" />,
});
