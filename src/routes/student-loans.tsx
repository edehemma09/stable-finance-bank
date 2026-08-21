import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/student-loans")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("student-loans")),
  head: () => ({
    "meta": [
      {
        "title": "Student Loans & Refinancing \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Undergraduate, graduate, and refinance student loans with flexible repayment and no origination fee."
      },
      {
        "property": "og:title",
        "content": "Student Loans & Refinancing \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Undergraduate, graduate, and refinance student loans with flexible repayment and no origination fee."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/student-loans"
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
        "content": "Student Loans & Refinancing \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Undergraduate, graduate, and refinance student loans with flexible repayment and no origination fee."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/student-loans"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Student Loans & Refinancing", "description": "Undergraduate, graduate, and refinance student loans with flexible repayment and no origination fee.", "url": "https://www.stf-b.com/student-loans", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Student Loans & Refinancing", "item": "https://www.stf-b.com/student-loans"}]}) }],
  }),
  component: () => <MarketingPage slug="student-loans" />,
});
