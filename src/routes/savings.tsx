import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/savings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("savings")),
  head: () => ({ meta: [{ title: "Savings & Certificates — Meridian Bank" }, { name: "description", content: "High-yield savings, money market, and share certificates." }] }),
  component: () => <MarketingPage slug="savings" />,
});
