import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/first-time-homebuyer")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("first-time-homebuyer")),
  head: () => ({
    "meta": [
      {
        "title": "First-Time Homebuyer Program \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Low down-payment options, closing-cost help, and step-by-step guidance for your first home."
      },
      {
        "property": "og:title",
        "content": "First-Time Homebuyer Program \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Low down-payment options, closing-cost help, and step-by-step guidance for your first home."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/first-time-homebuyer"
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
        "content": "First-Time Homebuyer Program \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Low down-payment options, closing-cost help, and step-by-step guidance for your first home."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/first-time-homebuyer"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "First-Time Homebuyer Program", "description": "Low down-payment options, closing-cost help, and step-by-step guidance for your first home.", "url": "https://www.stf-b.com/first-time-homebuyer", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "First-Time Homebuyer Program", "item": "https://www.stf-b.com/first-time-homebuyer"}]}) }],
  }),
  component: () => <MarketingPage slug="first-time-homebuyer" />,
});
