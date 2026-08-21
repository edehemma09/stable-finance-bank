import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/making-cents")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("making-cents")),
  head: () => ({
    "meta": [
      {
        "title": "MakingCents \u2014 Financial Resources \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Guides, calculators, and plain-English explainers on budgeting, credit, mortgages, and investing."
      },
      {
        "property": "og:title",
        "content": "MakingCents \u2014 Financial Resources \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Guides, calculators, and plain-English explainers on budgeting, credit, mortgages, and investing."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/making-cents"
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
        "content": "MakingCents \u2014 Financial Resources \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Guides, calculators, and plain-English explainers on budgeting, credit, mortgages, and investing."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/making-cents"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "MakingCents \u2014 Financial Resources", "item": "https://www.stf-b.com/making-cents"}]}) }],
  }),
  component: () => <MarketingPage slug="making-cents" />,
});
