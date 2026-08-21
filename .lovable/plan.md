# Apex → www redirect, HTTPS, and aggressive SEO

## 1. Redirecting stf-b.com → www.stf-b.com

Important: this app is not served by Apache, so an `.htaccess` file placed in the project does nothing here. There are two cases:

- **If stf-b.com is pointed at this Lovable app**: the redirect is a settings change, not code. In Project Settings → Domains, both `stf-b.com` and `www.stf-b.com` must be connected (each added separately, both with an A record to `185.158.133.1`), and `www.stf-b.com` set as **Primary**. The apex then 301-redirects to www automatically and SSL is issued for both, so the "not secure" warning disappears. I'll walk you through it and verify the DNS/status once you confirm.
- **If stf-b.com is still on your own cPanel/Apache host** (which the current "not secure" symptom suggests): I'll add `public/.htaccess` with the canonical rules for you to upload to that server's document root — force HTTPS and force `www`, in a single 301 hop, with HSTS.

The `.htaccess` file is harmless in the Lovable deploy (ignored), so I'll include it either way.

## 2. Aggressive SEO pass

Site-wide files:
- `public/robots.txt` — allow all crawlers and the AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended), disallow `/app/*`, `/admin/*`, `/auth*`.
- `public/sitemap.xml` — every public marketing route (~55 pages) with priority and changefreq, using `https://www.stf-b.com` as the base once the domain is confirmed.

Per-route metadata (all public routes):
- Unique `title`, `description`, `og:title`, `og:description`, `og:type`, `og:url`, `twitter:card`, plus a self-referencing `<link rel="canonical">` on each leaf route. Many routes today have only a title and no description/og tags; several (including the homepage) have no `head()` at all.
- Bank-specific, keyword-led descriptions per page (checking, savings, mortgage, auto loans, credit cards, business banking, etc.) rather than one boilerplate line.

Structured data (JSON-LD):
- Root: `BankOrCreditUnion` + `WebSite` with `SearchAction`, logo, contact point, sameAs.
- Product/service routes: `FinancialProduct` where it fits.
- Deep routes: `BreadcrumbList`.

## 3. Thumbnail / link preview icon

- Generate a 1200×630 branded social preview image (logo, "Stable Finance Bank", tagline, brand blue + gold) and save it as `public/og-image.jpg`; wire it as `og:image` / `twitter:image` on the routes that matter, using the absolute `https://www.stf-b.com/...` URL.
- Add a proper icon set: `favicon.ico`, `apple-touch-icon.png` (180×180), and `site.webmanifest` with 192/512 icons derived from the existing brand mark, referenced from the root route head.
- Note: platforms cache previews, so a changed thumbnail won't show in already-shared links until they re-scrape (forceable in Facebook/LinkedIn/X debuggers).

## Technical notes

- Head tags go in each route's `head()` via `createFileRoute`; canonical only on leaf routes (root-level canonical would duplicate).
- Absolute URLs are used for `og:image`/`og:url` only after you confirm `www.stf-b.com` is the canonical host; otherwise relative paths.
- No database or backend changes.
