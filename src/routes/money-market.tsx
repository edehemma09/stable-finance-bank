import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/money-market")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("money-market")),
  head: () => ({
    "meta": [
      {
        "title": "Money Market Account \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Tiered money-market rates with check-writing access and daily liquidity for larger balances."
      },
      {
        "property": "og:title",
        "content": "Money Market Account \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Tiered money-market rates with check-writing access and daily liquidity for larger balances."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/money-market"
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
        "content": "Money Market Account \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Tiered money-market rates with check-writing access and daily liquidity for larger balances."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/money-market"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Money Market Account", "description": "Tiered money-market rates with check-writing access and daily liquidity for larger balances.", "url": "https://www.stf-b.com/money-market", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Money Market Account", "item": "https://www.stf-b.com/money-market"}]}) }],
  }),
  component: () => <MarketingPage slug="money-market" />,
});
