import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/low-rate-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("low-rate-cards")),
  head: () => ({
    "meta": [
      {
        "title": "Low-Rate Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "A low ongoing APR for balance transfers and larger purchases, with no hidden fees."
      },
      {
        "property": "og:title",
        "content": "Low-Rate Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "A low ongoing APR for balance transfers and larger purchases, with no hidden fees."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/low-rate-cards"
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
        "content": "Low-Rate Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "A low ongoing APR for balance transfers and larger purchases, with no hidden fees."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/low-rate-cards"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Low-Rate Credit Cards", "description": "A low ongoing APR for balance transfers and larger purchases, with no hidden fees.", "url": "https://www.stf-b.com/low-rate-cards", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Low-Rate Credit Cards", "item": "https://www.stf-b.com/low-rate-cards"}]}) }],
  }),
  component: () => <MarketingPage slug="low-rate-cards" />,
});
