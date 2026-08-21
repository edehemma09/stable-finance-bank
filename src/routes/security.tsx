import { createFileRoute } from "@tanstack/react-router";
import { MarketingPage } from "@/components/marketing-page";
import { pageBySlugQuery } from "@/lib/queries";

export const Route = createFileRoute("/security")({
  loader: ({ context }) => context.queryClient.ensureQueryData(pageBySlugQuery("security")),
  head: () => ({
    "meta": [
      {
        "title": "Security & Fraud Protection \u2014 Stable Finance Bank"
      },
      {
        "name": "description",
        "content": "Bank-grade encryption, biometric login, real-time alerts, and zero-liability fraud protection."
      },
      {
        "property": "og:title",
        "content": "Security & Fraud Protection \u2014 Stable Finance Bank"
      },
      {
        "property": "og:description",
        "content": "Bank-grade encryption, biometric login, real-time alerts, and zero-liability fraud protection."
      },
      {
        "property": "og:type",
        "content": "website"
      },
      {
        "property": "og:url",
        "content": "https://www.stf-b.com/security"
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
        "content": "Security & Fraud Protection \u2014 Stable Finance Bank"
      },
      {
        "name": "twitter:description",
        "content": "Bank-grade encryption, biometric login, real-time alerts, and zero-liability fraud protection."
      },
      {
        "name": "twitter:image",
        "content": "https://www.stf-b.com/og-image.jpg"
      }
    ],
    "links": [
      {
        "rel": "canonical",
        "href": "https://www.stf-b.com/security"
      }
    ],
    "scripts": [{ type: "application/ld+json", children: JSON.stringify({"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.stf-b.com/"}, {"@type": "ListItem", "position": 2, "name": "Security & Fraud Protection", "item": "https://www.stf-b.com/security"}]}) }],
  }),
  component: () => <MarketingPage slug="security" />,
});
