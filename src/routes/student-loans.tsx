import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";
export const Route = createFileRoute("/student-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("student-loans")),
  head: () => ({ meta: [{ title: "Student Loans — Meridian Bank" }] }),
  component: () => <MarketingPage slug="student-loans" />,
});
