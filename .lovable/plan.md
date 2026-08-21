# Premium polish, full site content, email engine, and onboarding

## 1. Premium color system (gold accent on electric blue)

Keep `#1B17FF` as primary. Add a second brand layer:

- Deep navy ink `#0B1030` for headers, hero overlays, footer, admin sidebar
- Brushed gold `#C9A227` as the new action/accent color — primary CTA buttons ("Open an account", "Get started", "Send", "Approve"), active states, and thin rule accents
- Warm ivory `#F5F3EA` as an alternating section surface so pages stop looking flat white

Implementation: new tokens in `src/styles.css` (`--gold`, `--gold-foreground`, `--ink`, `--ivory`) in both light and dark, plus a `gold` button variant in the button component. Blue stays the identity color (logo, links, brand mark); gold carries the clicks. No hardcoded hex in components.

## 2. Missing images — build out the whole marketing site

Only the homepage exists in the CMS today, so every other page (`/checking`, `/savings`, `/credit-cards`, `/home-loans`, `/auto-loans`, `/investments`, `/mortgage`, `/business*`, `/about`, `/contact`, `/careers`, `/security`, legal pages, and the rest — around 40 routes) renders "Page not found" with no imagery at all.

- Author real content for every existing route: hero title/subtitle, hero image, feature blocks, promo cards with per-card images, stats, FAQ, and a closing CTA
- Generate a coherent photographic/illustration set in the new palette (roughly 12–16 reusable images: banking, cards, home, auto, business, wealth, support, security) and map them to pages so no two adjacent cards repeat
- Verify the homepage "Rates & offers" cards render their three distinct images correctly
- All content lands as CMS rows so you can edit it later in Admin → CMS, and is mirrored into `db/seed.sql` / `db/full-backup.sql`

## 3. Email engine

One honest note first: this project runs on the modern TanStack stack, where new Supabase Edge Functions cannot be created — app server code is the supported equivalent and does the same job. So the email engine becomes a single central email service in server code, reachable both from the app and from the database, which is exactly the behaviour you asked for:

- **One central sender** used by every email in the app — no scattered send code
- **Auto/transactional triggers**: signup welcome, KYC submitted / approved / rejected, cheque deposit decision, loan decision, transfer receipt, large-transaction and low-balance alerts, support-ticket replies, password/email changes
- **Database-triggered sends**: database events call a signed public endpoint (`/api/public/email-hook`) so emails fire even when they originate from SQL functions like `admin_decide_loan`
- **Transport**: SMTP over raw TCP cannot run on the deployed edge runtime, so sending goes over an HTTP email API. The admin panel gets a provider section (API key + from-name + from-address + reply-to), and the key is stored as a project secret, never in the page. Existing SMTP fields stay visible but clearly marked unsupported. If you'd rather use your own `stf-b.com` domain end-to-end, that can be swapped in later without changing any call sites.
- Every send is written to `email_log` with recipient, template, status and error

## 4. Admin dashboard email checks

- Admin → Settings: provider status banner (configured / not configured / disabled), save via upsert, and a working "Send test" that reports the real provider error inline
- Admin → Email customer: keep the composer, add template previews for the automatic emails and a resend action from the log
- Admin → Templates tab: edit subject and intro copy for each automatic email (welcome, KYC, loan, deposit, verification) so wording is editable without code
- Email log gets filters by status/recipient and shows the failure reason

## 5. Signup and account provisioning

- Signup creates a **checking and a savings account** automatically, both linked to the user and visible everywhere the app reads accounts (dashboard, transfers, bills, deposits, statements)
- A **welcome email** is sent on signup, plus an in-app alert
- **Email verification required**: sign-up sends a confirmation link; unverified users see a blocking-but-friendly "confirm your email" screen with a resend button
- **KYC banner**: a persistent, dismissible-per-session banner across the customer app when `kyc_status` is not `verified`, linking to the verification flow, with a distinct state for pending review and rejected

## Technical notes

- Color tokens in `src/styles.css`; gold button variant in `src/components/ui/button.tsx`; hero/footer/admin sidebar move to the ink token
- Images generated into `public/` and referenced from CMS rows; `page-renderer.tsx` already supports per-promo images
- Central sender: `src/lib/email/service.server.ts` (HTTP provider client + template registry), thin `createServerFn` wrappers in `src/lib/mail.functions.ts`, signed route `src/routes/api/public/email-hook.ts` for database triggers
- Migration: extend `handle_new_user` to open a savings account and enqueue the welcome email; add notification triggers on `kyc_submissions`, `loans`, `cheque_deposits` calling the hook via `pg_net`; add `email_templates` table for editable copy (with grants + RLS: admin write, no anon access)
- Auth: enable email confirmation; `/auth` gains a verify-pending state and resend
- SQL exports in `db/` regenerated at the end
