import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/checking")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("checking")),
  head: () => ({
    "meta": [
      {
        "title": "No-Fee Checking Account \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "No monthly fees, early direct deposit up to two days sooner, and fee-free access to a nationwide ATM network."
      },
      {
        "property": "og:title",
        "content": "No-Fee Checking Account \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "No monthly fees, early direct deposit up to two days sooner, and fee-free access to a nationwide ATM network."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/checking"
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
        "content": "No-Fee Checking Account \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "No monthly fees, early direct deposit up to two days sooner, and fee-free access to a nationwide ATM network."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/checking"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "No-Fee Checking Account", "description": "No monthly fees, early direct deposit up to two days sooner, and fee-free access to a nationwide ATM network.", "url": "https://www.stf-b.com/checking", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "No-Fee Checking Account", "item": "https://www.stf-b.com/checking"}]}) }],
  }),
  component: () => <MarketingPage slug="checking" />,
});
