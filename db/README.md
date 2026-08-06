# Moving this app onto your own Supabase project

This folder contains everything needed to recreate the Stable Finance Bank database
in a Supabase project you own.

## Files

| File | What it does |
| --- | --- |
| `schema.sql` | Every enum, table, constraint, index, function, trigger, grant, RLS policy |
| `storage.sql` | The private `kyc` and `deposits` buckets and their access rules |
| `seed.sql` | The single `site_settings` and `smtp_settings` rows the app reads at boot |

There is no data export: the current database contains zero rows in every table,
so nothing needs to be carried over.

## Run order

In your Supabase project's SQL editor, run in this exact order:

1. `schema.sql`
2. `storage.sql`
3. `seed.sql`

Each script is safe to re-run.

## Auth settings to match

- Email/password sign-up enabled.
- Anonymous sign-ins **off**.
- Confirm-email: on (or off, if you want instant sign-in during testing).
- Optional: enable the Google provider if you want social sign-in.

`schema.sql` installs the `on_auth_user_created` trigger, so every new signup
automatically gets a profile, a `customer` role and a checking account.

## Creating the first admin

1. Sign up through the app (or Supabase Auth) with the email you want to be admin.
2. Run:

```sql
insert into public.user_roles (user_id, role)
select id, 'admin' from auth.users where email = 'you@example.com'
on conflict do nothing;
```

3. Sign in at `/admin/login`.

## Then update `site_settings` and `smtp_settings`

Both are editable in-app at **Admin → Site settings** once you're an admin.
Set real SMTP credentials there and flip "Email delivery enabled" on.

## Connecting the app to your project

This project runs on Lovable Cloud, and Cloud cannot be swapped out for a personal
Supabase project once enabled. To run against your own database, create a **new**
Lovable project that has never had Cloud enabled, authorize Supabase in its project
settings, select your project, and rebuild the app there — the schema will already
match because of these scripts.

Values you'll need on that side (all non-secret, from your Supabase project's
API settings):

- Project URL
- Publishable / anon key

The service-role key stays inside your own project's settings and is never pasted
into chat.

## Offline backup (added later)

| File | What it does |
| --- | --- |
| `data.sql` | Current live rows: site settings, SMTP placeholder, CMS pages |
| `full-backup.sql` | Everything in one file — schema + storage + data. Run this alone on an empty project |

`full-backup.sql` is the file to keep for safe storage. Regenerate it any time
the CMS content or branding changes.
