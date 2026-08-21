import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("cards")),
  head: () => ({
    "meta": [
      {
        "title": "Credit & Debit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Rewards, low-rate, and secured cards with instant freeze, virtual numbers, and zero fraud liability."
      },
      {
        "property": "og:title",
        "content": "Credit & Debit Cards \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Rewards, low-rate, and secured cards with instant freeze, virtual numbers, and zero fraud liability."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/cards"
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
        "content": "Credit & Debit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Rewards, low-rate, and secured cards with instant freeze, virtual numbers, and zero fraud liability."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/cards"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Credit & Debit Cards", "description": "Rewards, low-rate, and secured cards with instant freeze, virtual numbers, and zero fraud liability.", "url": "https://www.stf-b.com/cards", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Credit & Debit Cards", "item": "https://www.stf-b.com/cards"}]}) }],
  }),
  component: () => <MarketingPage slug="cards" />,
});
