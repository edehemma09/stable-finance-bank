import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/legal/terms")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("legal/terms")),
  head: () => ({
    "meta": [
      {
        "title": "Terms of Service \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "The terms that govern your use of Stable Finance Bank online and mobile banking services."
      },
      {
        "property": "og:title",
        "content": "Terms of Service \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "The terms that govern your use of Stable Finance Bank online and mobile banking services."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/legal/terms"
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
        "content": "Terms of Service \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "The terms that govern your use of Stable Finance Bank online and mobile banking services."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/legal/terms"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Legal", "item": "https://www.stf-b.com/legal"}, {"@type": "ListItem", "position": 3, "name": "Terms of Service", "item": "https://www.stf-b.com/legal/terms"}]}) }],
  }),
  component: () => <MarketingPage slug="legal/terms" />,
});
