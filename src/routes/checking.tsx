import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/checking")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("checking")),
  head: () => ({ meta: [{ title: "Checking — Meridian Bank" }, { name: "description", content: "No-fee checking with early direct deposit and nationwide ATM access." }] }),
  component: () => <MarketingPage slug="checking" />,
});
