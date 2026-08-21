import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/business-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business-cards")),
  head: () => ({
    "meta": [
      {
        "title": "Business Credit & Debit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Employee cards with per-card limits, category controls, and automatic expense exports."
      },
      {
        "property": "og:title",
        "content": "Business Credit & Debit Cards \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Employee cards with per-card limits, category controls, and automatic expense exports."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/business-cards"
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
        "content": "Business Credit & Debit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Employee cards with per-card limits, category controls, and automatic expense exports."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/business-cards"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Business Credit & Debit Cards", "description": "Employee cards with per-card limits, category controls, and automatic expense exports.", "url": "https://www.stf-b.com/business-cards", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Business Credit & Debit Cards", "item": "https://www.stf-b.com/business-cards"}]}) }],
  }),
  component: () => <MarketingPage slug="business-cards" />,
});
