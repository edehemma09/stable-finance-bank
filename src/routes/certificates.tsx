import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/certificates")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("certificates")),
  head: () => ({
    "meta": [
      {
        "title": "Share Certificates (CDs) \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Lock in a guaranteed rate with terms from 3 to 60 months and federally insured deposits."
      },
      {
        "property": "og:title",
        "content": "Share Certificates (CDs) \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Lock in a guaranteed rate with terms from 3 to 60 months and federally insured deposits."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/certificates"
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
        "content": "Share Certificates (CDs) \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Lock in a guaranteed rate with terms from 3 to 60 months and federally insured deposits."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/certificates"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "FinancialProduct", "name": "Share Certificates (CDs)", "description": "Lock in a guaranteed rate with terms from 3 to 60 months and federally insured deposits.", "url": "https://www.stf-b.com/certificates", "provider": {"@type": "BankOrCreditUnion", "name": "Stable Finance Bank", "url": "https://www.stf-b.com/"}, "areaServed": "US"}) },
{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Share Certificates (CDs)", "item": "https://www.stf-b.com/certificates"}]}) }],
  }),
  component: () => <MarketingPage slug="certificates" />,
});
