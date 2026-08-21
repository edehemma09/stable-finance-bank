import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/accounts")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("accounts")),
  head: () => ({
    "meta": [
      {
        "title": "Accounts \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Compare Stable Finance Bank checking, savings, money market, and certificate accounts side by side and open one online."
      },
      {
        "property": "og:title",
        "content": "Accounts \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Compare Stable Finance Bank checking, savings, money market, and certificate accounts side by side and open one online."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/accounts"
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
        "content": "Accounts \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Compare Stable Finance Bank checking, savings, money market, and certificate accounts side by side and open one online."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/accounts"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Accounts", "item": "https://www.stf-b.com/accounts"}]}) }],
  }),
  component: () => <MarketingPage slug="accounts" />,
});
