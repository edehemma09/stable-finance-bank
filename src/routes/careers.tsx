import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/careers")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("careers")),
  head: () => ({
    "meta": [
      {
        "title": "Careers \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Open roles, benefits, and what it's like to build modern banking at Stable Finance Bank."
      },
      {
        "property": "og:title",
        "content": "Careers \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Open roles, benefits, and what it's like to build modern banking at Stable Finance Bank."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/careers"
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
        "content": "Careers \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Open roles, benefits, and what it's like to build modern banking at Stable Finance Bank."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/careers"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Careers", "item": "https://www.stf-b.com/careers"}]}) }],
  }),
  component: () => <MarketingPage slug="careers" />,
});
