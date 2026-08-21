import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/auto-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("auto-loans")),
  head: () => ({
    "meta": [
      {
        "title": "Auto Loans \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "New, used, and refinance auto loans with fast pre-approval and no prepayment penalty."
      },
      {
        "property": "og:title",
        "content": "Auto Loans \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "New, used, and refinance auto loans with fast pre-approval and no prepayment penalty."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/auto-loans"
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
        "content": "Auto Loans \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "New, used, and refinance auto loans with fast pre-approval and no prepayment penalty."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/auto-loans"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Auto Loans", "description": "New, used, and refinance auto loans with fast pre-approval and no prepayment penalty.", "url": "https://www.stf-b.com/auto-loans", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Auto Loans", "item": "https://www.stf-b.com/auto-loans"}]}) }],
  }),
  component: () => <MarketingPage slug="auto-loans" />,
});
