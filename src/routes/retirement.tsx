import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/retirement")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("retirement")),
  head: () => ({ meta: [{ title: "Retirement — Stable Finance Bank" }, { name: "description", content: "IRAs, 401(k) rollovers, and free retirement planning tools." }] }),
  component: () => <MarketingPage slug="retirement" />,
});
