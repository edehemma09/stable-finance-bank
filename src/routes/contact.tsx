import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("contact")),
  head: () => ({ meta: [{ title: "Contact — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="contact" />,
});
