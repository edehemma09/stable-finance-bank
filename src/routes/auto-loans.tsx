import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/auto-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("auto-loans")),
  head: () => ({ meta: [{ title: "Auto Loans — Stable Finance Bank" }, { name: "description", content: "New, used, and refinance auto loans with fast pre-approval." }] }),
  component: () => <MarketingPage slug="auto-loans" />,
});
