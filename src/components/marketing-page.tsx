import { useSuspenseQuery } from "@tanstack/react-query";
import { MarketingShell } from "./marketing-shell";
import { PageRenderer } from "./page-renderer";
import { pageBySlugQuery } from "@/lib/queries";

export function MarketingPage({ slug }: { slug: string }) {
  const { data } = useSuspenseQuery(pageBySlugQuery(slug));
  if (!data) {
    return (
      <MarketingShell>
        <div className="container-page py-24 text-center">
          <h1 className="font-display text-4xl">Page not found</h1>
          <p className="mt-2 text-muted-foreground">This page hasn't been created yet.</p>
        </div>
      </MarketingShell>
    );
  }
  return (
    <MarketingShell>
      <PageRenderer page={data} />
    </MarketingShell>
  );
}
