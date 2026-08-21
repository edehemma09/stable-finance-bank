import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/business")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business")),
  head: () => ({
    "meta": [
      {
        "title": "Business Banking \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Business checking, cards, lending, and merchant services for founders and growing companies, with same-day onboarding."
      },
      {
        "property": "og:title",
        "content": "Business Banking \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Business checking, cards, lending, and merchant services for founders and growing companies, with same-day onboarding."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/business"
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
        "content": "Business Banking \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Business checking, cards, lending, and merchant services for founders and growing companies, with same-day onboarding."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/business"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Business Banking", "item": "https://www.stf-b.com/business"}]}) }],
  }),
  component: () => <MarketingPage slug="business" />,
});
