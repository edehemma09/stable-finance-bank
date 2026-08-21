import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/about")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("about")),
  head: () => ({
    "meta": [
      {
        "title": "About Us \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Who we are, how we're funded, and why Stable Finance Bank builds banking around people instead of products."
      },
      {
        "property": "og:title",
        "content": "About Us \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Who we are, how we're funded, and why Stable Finance Bank builds banking around people instead of products."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/about"
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
        "content": "About Us \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Who we are, how we're funded, and why Stable Finance Bank builds banking around people instead of products."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/about"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "About Us", "item": "https://www.stf-b.com/about"}]}) }],
  }),
  component: () => <MarketingPage slug="about" />,
});
