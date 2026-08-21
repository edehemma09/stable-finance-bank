import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/business-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("business-loans")),
  head: () => ({
    "meta": [
      {
        "title": "Business Loans & Lines of Credit \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Working-capital lines, equipment finance, and SBA-style term loans with decisions in days, not weeks."
      },
      {
        "property": "og:title",
        "content": "Business Loans & Lines of Credit \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Working-capital lines, equipment finance, and SBA-style term loans with decisions in days, not weeks."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/business-loans"
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
        "content": "Business Loans & Lines of Credit \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Working-capital lines, equipment finance, and SBA-style term loans with decisions in days, not weeks."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/business-loans"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Business Loans & Lines of Credit", "description": "Working-capital lines, equipment finance, and SBA-style term loans with decisions in days, not weeks.", "url": "https://www.stf-b.com/business-loans", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Business Loans & Lines of Credit", "item": "https://www.stf-b.com/business-loans"}]}) }],
  }),
  component: () => <MarketingPage slug="business-loans" />,
});
