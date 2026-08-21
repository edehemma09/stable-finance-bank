import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/loans-mortgage")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("loans-mortgage")),
  head: () => ({
    "meta": [
      {
        "title": "Loans & Mortgages \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Home loans, auto loans, personal loans, and lines of credit with transparent rates and dedicated advisors."
      },
      {
        "property": "og:title",
        "content": "Loans & Mortgages \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Home loans, auto loans, personal loans, and lines of credit with transparent rates and dedicated advisors."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/loans-mortgage"
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
        "content": "Loans & Mortgages \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Home loans, auto loans, personal loans, and lines of credit with transparent rates and dedicated advisors."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/loans-mortgage"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Loans & Mortgages", "item": "https://www.stf-b.com/loans-mortgage"}]}) }],
  }),
  component: () => <MarketingPage slug="loans-mortgage" />,
});
