# Stable Finance Bank — two-round plan

## Important: the database move

This project already runs on Lovable Cloud (the managed backend). Once Cloud is enabled on a project it cannot be disconnected or swapped for a personal Supabase project — that applies here, so I can't repoint this app at your own database from inside it.

What I can do instead, in round 1:

1. Produce a single consolidated SQL script (`db/schema.sql`) containing the full current schema — all tables, enums, grants, RLS policies, functions (`has_role`, `execute_transfer`, `admin_*`, `handle_new_user`, etc.) and triggers — plus the two storage buckets (`kyc`, `deposits`) and their policies. You run that once in your own Supabase project's SQL editor and your database is an exact match.
2. Export the current data you want to keep as CSV per table, so you can load it into your project.
3. Give you the exact list of things to set on your side: nothing secret is needed from you here — you only need your project's URL and publishable (anon) key, and the service-role key stays in your own project's settings.

To actually *run* the app against your Supabase, the supported route is a fresh Lovable project that has never had Cloud enabled, where you authorize Supabase in project settings and pick your project. I can then rebuild this app there against your database using the schema script above. If you want that, say so and we'll treat it as the target for round 2.

If you'd rather not maintain a second project, the alternative is keeping Lovable Cloud and skipping the move entirely — nothing else in the plan changes.

## Round 1 — database work

- Write `db/schema.sql`: complete, ordered, idempotent-where-safe DDL for every table (profiles, accounts, transactions, transfers, loans, cards, payees, bill_payments, cheque_deposits, kyc_submissions, statements, holdings, alerts, alerts_prefs, risk_scores, support_tickets, ticket_messages, audit_log, deleted_users, user_roles, pages, site_settings, smtp_settings, email_log), with GRANTs, RLS enable + policies, functions and triggers in dependency order.
- Write `db/storage.sql`: creates the private `kyc` and `deposits` buckets and their access policies.
- Write `db/README.md`: step-by-step run order, how to create the first admin user (sign up, then insert the `admin` row in `user_roles`), and how to fill `site_settings` / `smtp_settings`.
- Export existing table data to CSV under `db/export/` for anything you want to carry over.

## Round 2 — rebrand to Stable Finance Bank

Brand color read from your logo: electric blue `#1B17FF`, on white, with a deep navy-blue ink for text.

- Save the logo and favicon into the project, downscale the square mark to a padded 64x64 favicon, point the root route at it, and delete the default `favicon.ico`.
- Replace the letter-M placeholder in `BrandMark` with the real logo (wordmark in the header, square mark where space is tight).
- Retune the design tokens in `src/styles.css`: primary → electric blue `#1B17FF`, matching `--ring`, `--brand-blue`, chart colors, sidebar and dark-mode variants. Accent moves off the current orange to a restrained gold/neutral so it doesn't fight the blue.
- Replace every "Meridian Bank" / "Meridian member" string across marketing routes, the customer app, admin, emails, receipts and 404/error copy with "Stable Finance Bank"; tagline "Your trusted banking partner".
- Update per-route `head()` titles, descriptions and og tags to the new brand.
- Update the `site_settings` row (brand name, tagline, logo URL, contact details) so admin-driven surfaces match.

## Technical notes

- Colors stay semantic tokens in `src/styles.css`; no hardcoded hex in components.
- Logo files go in `src/assets/` (imported) and `public/favicon.png` (icon), not CDN pointers.
- No schema changes are made to the live Cloud database in either round — round 1 only reads it and emits scripts.
