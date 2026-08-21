import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/merchant-services")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("merchant-services")),
  head: () => ({
    "meta": [
      {
        "title": "Merchant Services \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Card acceptance, terminals, and next-day settlement wired straight into your business account."
      },
      {
        "property": "og:title",
        "content": "Merchant Services \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Card acceptance, terminals, and next-day settlement wired straight into your business account."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/merchant-services"
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
        "content": "Merchant Services \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Card acceptance, terminals, and next-day settlement wired straight into your business account."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/merchant-services"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Merchant Services", "description": "Card acceptance, terminals, and next-day settlement wired straight into your business account.", "url": "https://www.stf-b.com/merchant-services", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Merchant Services", "item": "https://www.stf-b.com/merchant-services"}]}) }],
  }),
  component: () => <MarketingPage slug="merchant-services" />,
});
