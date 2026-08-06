# Stay on Lovable's database, export SQL, fix email, add admin messaging

## Decision: keep the current backend

No migration. The app keeps using the backend it already runs on (Lovable Cloud). Your own Supabase project stays untouched, and the connection-string problems go away.

## 1. Full SQL export for offline safekeeping

Regenerate a complete, current snapshot in `db/`:

- `db/schema.sql` — all tables, enums, indexes, functions, triggers, grants, RLS policies
- `db/storage.sql` — the private `kyc` and `deposits` buckets and their rules
- `db/seed.sql` — the `site_settings`, `smtp_settings` and homepage CMS rows
- `db/data.sql` — new: current row data (site settings, homepage content) so a restore comes up looking identical
- `db/README.md` — refreshed run order and restore steps

Also drop a single combined `db/full-backup.sql` you can download and keep offline; running that one file recreates everything.

## 2. Email / SMTP — currently NOT working

Verified state of the live database:

- `smtp_settings` has **zero rows**. The admin SMTP panel saves with an update, so with no row there is nothing to update and settings silently never persist.
- `email_log` has zero entries — no email has ever been sent from this app.

Fix:

- Insert the `smtp_settings` row (id = 1) so the admin panel has something to write to, and make the panel upsert instead of update so this can't recur.
- Surface a clear "not configured / disabled" banner in the panel when host or from-address is empty.

Then **yes, please reshare the SMTP credentials** (host, port, TLS on/off, username, password, from-name, from-address). Easiest path: after this ships, enter them yourself at Admin → Site settings → Email / SMTP and press "Send test" — the result and any error land in the Email log on the same page. If you'd rather I set them, paste them and I'll save them.

## 3. Admin → Messages: email a specific customer

New admin page (`/admin/messages`) plus a "Send email" action on each customer's detail page:

- Pick a customer (searchable list by name, username, email)
- Subject, a short intro paragraph, optional detail rows (label/value pairs), optional footnote
- Live preview of the branded email before sending
- Send, with success/failure toast; every send is recorded in the Email log with recipient, subject and status
- Quick-start templates: account notice, verification follow-up, general message

Send path uses the existing admin-only server function, so only admin/support roles can send and the customer's address is read server-side (never supplied by the browser).

## Technical notes

- `sendCustomerNotification` in `src/lib/mail.functions.ts` already exists and enforces the admin/support role check — the new UI calls it; no new send endpoint.
- One migration: insert the missing `smtp_settings` id=1 row (blank credentials, disabled) — no schema changes.
- New route file `src/routes/_authenticated.admin.messages.tsx`, a link in the admin sidebar, and a compose dialog reused on `_authenticated.admin.customers.$id.tsx`.
- SMTP panel in `_authenticated.admin.settings.tsx` switches to upsert and gains a configuration-status badge.
- SQL export produced by dumping the live schema plus data for `site_settings`, `smtp_settings`, `pages`.
