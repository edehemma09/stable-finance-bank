# Stable Finance Bank database backup

These scripts recreate the app's database structure, access rules, private storage buckets, and safe starter settings in a separate database project. They do not contain customer records, SMTP credentials, API keys, or webhook secrets.

## Files

| File | Purpose |
| --- | --- |
| `schema.sql` | Tables, enums, constraints, indexes, functions, triggers, grants, and row-level policies, including signup accounts, customer status, alert email delivery, and diagnostics |
| `storage.sql` | Private `avatars`, `kyc`, and `deposits` buckets and per-user access rules |
| `seed.sql` | Safe starter settings for the site, email configuration, and email-hook URLs |
| `data.sql` | Current site settings and homepage CMS content, with secrets excluded |
| `full-backup.sql` | One-file restore containing schema, storage rules, and starter data |

## Restore

For a complete restore on a fresh project, run `full-backup.sql` once. Alternatively, run `schema.sql`, then `storage.sql`, then either `seed.sql` or `data.sql`. `data.sql` includes the homepage page content; `seed.sql` is a lighter starter set. The combined file is regenerated from those three source scripts.

## After restoring

1. Configure the project’s authentication site URL and allowed redirects for `https://www.stf-b.com`.
2. Set up the mail provider and credentials in the app’s Admin → Site settings. The backup leaves SMTP disabled and blank.
3. Generate a new random secret and set `app_config.email_hook_secret` before enabling alert-email hooks. The backup intentionally does not carry over the live secret.
4. Confirm Storage is enabled. The photo bucket accepts PNG/JPG uploads in a user-owned folder; KYC and deposit files are private.
5. Create the first admin only after registering that account. Assign the `admin` role to its user id from a trusted SQL session.

The SQL creates the application-side structures and starter values; it does not copy authentication users, customer data, existing files, auth-provider configuration, or scheduled cron jobs. Configure any desired keep-alive schedule separately. The site must also be configured to use the new project’s public URL and publishable key.
