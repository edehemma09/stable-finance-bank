import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/investments")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("investments")),
  head: () => ({
    "meta": [
      {
        "title": "Investments & Wealth \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Brokerage, retirement, and managed portfolios with fiduciary advice and low, transparent pricing."
      },
      {
        "property": "og:title",
        "content": "Investments & Wealth \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Brokerage, retirement, and managed portfolios with fiduciary advice and low, transparent pricing."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/investments"
      },
      {
        "property": "og:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      },
      {
        "property": "og:site_name",
        "content": "Stable Finance Bank"
      },
      {
        "name": "twitter:card",
        "content": "summary_large_image"
      },
      {
        "name": "twitter:title",
        "content": "Investments & Wealth \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Brokerage, retirement, and managed portfolios with fiduciary advice and low, transparent pricing."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/investments"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Investments & Wealth", "item": "https://www.stf-b.com/investments"}]}) }],
  }),
  component: () => <MarketingPage slug="investments" />,
});
