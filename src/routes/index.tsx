import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("home")),
  head: () => ({
    "meta": [
      {
        "title": "Stable Finance Bank \u2014 Banking with clarity, care, and craft"
      },
      {
        "name": "description",
        "content": "Open a no-fee checking or high-yield savings account with Stable Finance Bank. Cards, loans, mortgages, transfers, and real human support \u2014 online in minutes."
      },
      {
        "property": "og:title",
        "content": "Stable Finance Bank \u2014 Banking with clarity, care, and craft"
      },
      {
        "property": "og:description",
        "content": "Open a no-fee checking or high-yield savings account with Stable Finance Bank. Cards, loans, mortgages, transfers, and real human support \u2014 online in minutes."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/"
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
        "content": "Stable Finance Bank \u2014 Banking with clarity, care, and craft"
      },
      {
        "name": "twitter:description",
        "content": "Open a no-fee checking or high-yield savings account with Stable Finance Bank. Cards, loans, mortgages, transfers, and real human support \u2014 online in minutes."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/"
      }
    ]
  }),
  component: () => <MarketingPage slug="home" />,
});
