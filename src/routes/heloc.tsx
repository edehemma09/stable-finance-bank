import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/heloc")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("heloc")),
  head: () => ({
    "meta": [
      {
        "title": "Home Equity Line of Credit (HELOC) \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Borrow against your home equity with a flexible draw period and competitive variable rates."
      },
      {
        "property": "og:title",
        "content": "Home Equity Line of Credit (HELOC) \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Borrow against your home equity with a flexible draw period and competitive variable rates."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/heloc"
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
        "content": "Home Equity Line of Credit (HELOC) \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Borrow against your home equity with a flexible draw period and competitive variable rates."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/heloc"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Home Equity Line of Credit (HELOC)", "description": "Borrow against your home equity with a flexible draw period and competitive variable rates.", "url": "https://www.stf-b.com/heloc", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Home Equity Line of Credit (HELOC)", "item": "https://www.stf-b.com/heloc"}]}) }],
  }),
  component: () => <MarketingPage slug="heloc" />,
});
