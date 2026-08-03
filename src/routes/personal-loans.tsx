import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/personal-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("personal-loans")),
  head: () => ({ meta: [{ title: "Personal Loans — Meridian Bank" }, { name: "description", content: "Fixed-rate personal loans up to $50,000 with fast funding." }] }),
  component: () => <MarketingPage slug="personal-loans" />,
});
