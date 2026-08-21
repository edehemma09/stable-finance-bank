import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/retirement")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("retirement")),
  head: () => ({
    "meta": [
      {
        "title": "Retirement Planning & IRAs \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Traditional, Roth, and rollover IRAs with planning tools and advisor support at every stage."
      },
      {
        "property": "og:title",
        "content": "Retirement Planning & IRAs \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Traditional, Roth, and rollover IRAs with planning tools and advisor support at every stage."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/retirement"
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
        "content": "Retirement Planning & IRAs \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Traditional, Roth, and rollover IRAs with planning tools and advisor support at every stage."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/retirement"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Retirement Planning & IRAs", "description": "Traditional, Roth, and rollover IRAs with planning tools and advisor support at every stage.", "url": "https://www.stf-b.com/retirement", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Retirement Planning & IRAs", "item": "https://www.stf-b.com/retirement"}]}) }],
  }),
  component: () => <MarketingPage slug="retirement" />,
});
