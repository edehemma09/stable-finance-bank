import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/mortgage")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("mortgage")),
  head: () => ({
    "meta": [
      {
        "title": "Mortgages \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Competitive fixed and adjustable mortgage rates, fast pre-approval, and no lender junk fees."
      },
      {
        "property": "og:title",
        "content": "Mortgages \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Competitive fixed and adjustable mortgage rates, fast pre-approval, and no lender junk fees."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/mortgage"
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
        "content": "Mortgages \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Competitive fixed and adjustable mortgage rates, fast pre-approval, and no lender junk fees."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/mortgage"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Mortgages", "description": "Competitive fixed and adjustable mortgage rates, fast pre-approval, and no lender junk fees.", "url": "https://www.stf-b.com/mortgage", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Mortgages", "item": "https://www.stf-b.com/mortgage"}]}) }],
  }),
  component: () => <MarketingPage slug="mortgage" />,
});
