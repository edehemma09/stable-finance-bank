import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/home-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("home-loans")),
  head: () => ({
    "meta": [
      {
        "title": "Home Loans \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Fixed and adjustable-rate mortgages, HELOCs, and refinancing with a dedicated advisor from application to closing."
      },
      {
        "property": "og:title",
        "content": "Home Loans \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Fixed and adjustable-rate mortgages, HELOCs, and refinancing with a dedicated advisor from application to closing."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/home-loans"
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
        "content": "Home Loans \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Fixed and adjustable-rate mortgages, HELOCs, and refinancing with a dedicated advisor from application to closing."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/home-loans"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Home Loans", "description": "Fixed and adjustable-rate mortgages, HELOCs, and refinancing with a dedicated advisor from application to closing.", "url": "https://www.stf-b.com/home-loans", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Home Loans", "item": "https://www.stf-b.com/home-loans"}]}) }],
  }),
  component: () => <MarketingPage slug="home-loans" />,
});
