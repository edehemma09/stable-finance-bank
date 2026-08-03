import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/loans-mortgage")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("loans-mortgage")),
  head: () => ({ meta: [{ title: "Loans & Mortgage — Meridian Bank" }] }),
  component: () => <MarketingPage slug="loans-mortgage" />,
});
