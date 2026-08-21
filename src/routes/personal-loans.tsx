import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/personal-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("personal-loans")),
  head: () => ({
    "meta": [
      {
        "title": "Personal Loans \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Fixed-rate personal loans for consolidation, home projects, or life's surprises \u2014 funded in as little as one day."
      },
      {
        "property": "og:title",
        "content": "Personal Loans \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Fixed-rate personal loans for consolidation, home projects, or life's surprises \u2014 funded in as little as one day."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/personal-loans"
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
        "content": "Personal Loans \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Fixed-rate personal loans for consolidation, home projects, or life's surprises \u2014 funded in as little as one day."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/personal-loans"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Personal Loans", "description": "Fixed-rate personal loans for consolidation, home projects, or life's surprises \u2014 funded in as little as one day.", "url": "https://www.stf-b.com/personal-loans", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Personal Loans", "item": "https://www.stf-b.com/personal-loans"}]}) }],
  }),
  component: () => <MarketingPage slug="personal-loans" />,
});
