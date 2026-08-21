import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/brokerage")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("brokerage")),
  head: () => ({
    "meta": [
      {
        "title": "Brokerage Account \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Commission-free stock and ETF trading with research, screeners, and fractional shares."
      },
      {
        "property": "og:title",
        "content": "Brokerage Account \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Commission-free stock and ETF trading with research, screeners, and fractional shares."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/brokerage"
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
        "content": "Brokerage Account \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Commission-free stock and ETF trading with research, screeners, and fractional shares."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/brokerage"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Brokerage Account", "description": "Commission-free stock and ETF trading with research, screeners, and fractional shares.", "url": "https://www.stf-b.com/brokerage", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Brokerage Account", "item": "https://www.stf-b.com/brokerage"}]}) }],
  }),
  component: () => <MarketingPage slug="brokerage" />,
});
