import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/rewards-cards")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("rewards-cards")),
  head: () => ({
    "meta": [
      {
        "title": "Rewards Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Earn unlimited cash back and travel points on everyday spending with no annual fee."
      },
      {
        "property": "og:title",
        "content": "Rewards Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Earn unlimited cash back and travel points on everyday spending with no annual fee."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/rewards-cards"
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
        "content": "Rewards Credit Cards \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Earn unlimited cash back and travel points on everyday spending with no annual fee."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/rewards-cards"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Rewards Credit Cards", "description": "Earn unlimited cash back and travel points on everyday spending with no annual fee.", "url": "https://www.stf-b.com/rewards-cards", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Rewards Credit Cards", "item": "https://www.stf-b.com/rewards-cards"}]}) }],
  }),
  component: () => <MarketingPage slug="rewards-cards" />,
});
