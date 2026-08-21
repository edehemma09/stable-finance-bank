import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/eligibility")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("eligibility")),
  head: () => ({
    "meta": [
      {
        "title": "Membership Eligibility \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "See who can join Stable Finance Bank and what you need to open your first account."
      },
      {
        "property": "og:title",
        "content": "Membership Eligibility \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "See who can join Stable Finance Bank and what you need to open your first account."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/eligibility"
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
        "content": "Membership Eligibility \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "See who can join Stable Finance Bank and what you need to open your first account."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/eligibility"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Membership Eligibility", "item": "https://www.stf-b.com/eligibility"}]}) }],
  }),
  component: () => <MarketingPage slug="eligibility" />,
});
