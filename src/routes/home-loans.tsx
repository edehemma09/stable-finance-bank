import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/home-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("home-loans")),
  head: () => ({
    meta: [
      { title: "Home Loans — Stable Finance Bank" },
      { name: "description", content: "Mortgages, HELOCs, and refinance with dedicated advisors." },
    ],
  }),
  component: () => <MarketingPage slug="home-loans" />,
});
