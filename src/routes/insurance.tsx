import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/insurance")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("insurance")),
  head: () => ({
    "meta": [
      {
        "title": "Insurance \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Life, home, auto, and identity-protection coverage bundled with your banking relationship."
      },
      {
        "property": "og:title",
        "content": "Insurance \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Life, home, auto, and identity-protection coverage bundled with your banking relationship."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/insurance"
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
        "content": "Insurance \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Life, home, auto, and identity-protection coverage bundled with your banking relationship."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/insurance"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Insurance", "description": "Life, home, auto, and identity-protection coverage bundled with your banking relationship.", "url": "https://www.stf-b.com/insurance", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Insurance", "item": "https://www.stf-b.com/insurance"}]}) }],
  }),
  component: () => <MarketingPage slug="insurance" />,
});
