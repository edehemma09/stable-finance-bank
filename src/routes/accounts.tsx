import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/accounts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("accounts")),
  head: () => ({ meta: [{ title: "Accounts — Meridian Bank" }] }),
  component: () => <MarketingPage slug="accounts" />,
});
