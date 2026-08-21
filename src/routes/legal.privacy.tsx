import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/legal/privacy")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("legal/privacy")),
  head: () => ({
    "meta": [
      {
        "title": "Privacy Policy \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "How Stable Finance Bank collects, uses, protects, and shares your personal and financial information."
      },
      {
        "property": "og:title",
        "content": "Privacy Policy \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "How Stable Finance Bank collects, uses, protects, and shares your personal and financial information."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/legal/privacy"
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
        "content": "Privacy Policy \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "How Stable Finance Bank collects, uses, protects, and shares your personal and financial information."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/legal/privacy"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Legal", "item": "https://www.stf-b.com/legal"}, {"@type": "ListItem", "position": 3, "name": "Privacy Policy", "item": "https://www.stf-b.com/legal/privacy"}]}) }],
  }),
  component: () => <MarketingPage slug="legal/privacy" />,
});
