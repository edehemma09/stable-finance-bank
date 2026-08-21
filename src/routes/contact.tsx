import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/contact")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("contact")),
  head: () => ({
    "meta": [
      {
        "title": "Contact Us \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Reach Stable Finance Bank by phone, secure message, or email \u2014 support hours and response times included."
      },
      {
        "property": "og:title",
        "content": "Contact Us \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Reach Stable Finance Bank by phone, secure message, or email \u2014 support hours and response times included."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/contact"
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
        "content": "Contact Us \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Reach Stable Finance Bank by phone, secure message, or email \u2014 support hours and response times included."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/contact"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Contact Us", "item": "https://www.stf-b.com/contact"}]}) }],
  }),
  component: () => <MarketingPage slug="contact" />,
});
