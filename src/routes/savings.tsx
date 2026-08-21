import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/savings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("savings")),
  head: () => ({
    "meta": [
      {
        "title": "High-Yield Savings & Certificates \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Grow your money with high-yield savings, money market accounts, and share certificates \u2014 competitive APY, no minimum balance games."
      },
      {
        "property": "og:title",
        "content": "High-Yield Savings & Certificates \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Grow your money with high-yield savings, money market accounts, and share certificates \u2014 competitive APY, no minimum balance games."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/savings"
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
        "content": "High-Yield Savings & Certificates \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Grow your money with high-yield savings, money market accounts, and share certificates \u2014 competitive APY, no minimum balance games."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/savings"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "High-Yield Savings & Certificates", "description": "Grow your money with high-yield savings, money market accounts, and share certificates \u2014 competitive APY, no minimum balance games.", "url": "https://www.stf-b.com/savings", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "High-Yield Savings & Certificates", "item": "https://www.stf-b.com/savings"}]}) }],
  }),
  component: () => <MarketingPage slug="savings" />,
});
