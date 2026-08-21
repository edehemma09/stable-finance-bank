import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/personal")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("personal")),
  head: () => ({
    "meta": [
      {
        "title": "Personal Banking \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Everyday checking, high-yield savings, credit cards, and personal loans built around your day \u2014 no hidden fees, no branch queues."
      },
      {
        "property": "og:title",
        "content": "Personal Banking \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Everyday checking, high-yield savings, credit cards, and personal loans built around your day \u2014 no hidden fees, no branch queues."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/personal"
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
        "content": "Personal Banking \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Everyday checking, high-yield savings, credit cards, and personal loans built around your day \u2014 no hidden fees, no branch queues."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/personal"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Personal Banking", "item": "https://www.stf-b.com/personal"}]}) }],
  }),
  component: () => <MarketingPage slug="personal" />,
});
