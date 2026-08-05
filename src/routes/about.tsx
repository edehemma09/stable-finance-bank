import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("about")),
  head: () => ({ meta: [{ title: "About — Stable Finance Bank" }] }),
  component: () => <MarketingPage slug="about" />,
});
