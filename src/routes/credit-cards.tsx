import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/credit-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("credit-cards")),
  head: () => ({
    "meta": [
      {
        "title": "Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Compare rewards, cash back, and low-APR credit cards with no annual fee and instant digital-wallet issuance."
      },
      {
        "property": "og:title",
        "content": "Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Compare rewards, cash back, and low-APR credit cards with no annual fee and instant digital-wallet issuance."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/credit-cards"
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
        "content": "Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Compare rewards, cash back, and low-APR credit cards with no annual fee and instant digital-wallet issuance."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/credit-cards"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Credit Cards", "description": "Compare rewards, cash back, and low-APR credit cards with no annual fee and instant digital-wallet issuance.", "url": "https://www.stf-b.com/credit-cards", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Credit Cards", "item": "https://www.stf-b.com/credit-cards"}]}) }],
  }),
  component: () => <MarketingPage slug="credit-cards" />,
});
