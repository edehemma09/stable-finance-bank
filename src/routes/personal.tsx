import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/personal")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("personal")),
  head: () => ({ meta: [{ title: "Personal Banking — Meridian Bank" }] }),
  component: () => <MarketingPage slug="personal" />,
});
