import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/benefits")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("benefits")),
  head: () => ({
    "meta": [
      {
        "title": "Member Benefits \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Rate discounts, cashback partners, credit monitoring, and perks included with every account."
      },
      {
        "property": "og:title",
        "content": "Member Benefits \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Rate discounts, cashback partners, credit monitoring, and perks included with every account."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/benefits"
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
        "content": "Member Benefits \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Rate discounts, cashback partners, credit monitoring, and perks included with every account."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/benefits"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Member Benefits", "item": "https://www.stf-b.com/benefits"}]}) }],
  }),
  component: () => <MarketingPage slug="benefits" />,
});
