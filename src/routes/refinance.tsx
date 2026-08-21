import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/refinance")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("refinance")),
  head: () => ({
    "meta": [
      {
        "title": "Mortgage Refinance \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Lower your rate, shorten your term, or take cash out \u2014 refinance options with a clear break-even estimate."
      },
      {
        "property": "og:title",
        "content": "Mortgage Refinance \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Lower your rate, shorten your term, or take cash out \u2014 refinance options with a clear break-even estimate."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/refinance"
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
        "content": "Mortgage Refinance \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Lower your rate, shorten your term, or take cash out \u2014 refinance options with a clear break-even estimate."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/refinance"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Mortgage Refinance", "description": "Lower your rate, shorten your term, or take cash out \u2014 refinance options with a clear break-even estimate.", "url": "https://www.stf-b.com/refinance", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Mortgage Refinance", "item": "https://www.stf-b.com/refinance"}]}) }],
  }),
  component: () => <MarketingPage slug="refinance" />,
});
