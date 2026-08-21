import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/business-checking")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business-checking")),
  head: () => ({
    "meta": [
      {
        "title": "Business Checking \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "No-fee business checking with unlimited transactions, sub-accounts, and same-day ACH."
      },
      {
        "property": "og:title",
        "content": "Business Checking \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "No-fee business checking with unlimited transactions, sub-accounts, and same-day ACH."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/business-checking"
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
        "content": "Business Checking \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "No-fee business checking with unlimited transactions, sub-accounts, and same-day ACH."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/business-checking"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Business Checking", "description": "No-fee business checking with unlimited transactions, sub-accounts, and same-day ACH.", "url": "https://www.stf-b.com/business-checking", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Business Checking", "item": "https://www.stf-b.com/business-checking"}]}) }],
  }),
  component: () => <MarketingPage slug="business-checking" />,
});
