# Fix the deploy block: move keep-alive off Vercel cron onto the database

## What's happening

You're right — the cron is the blocker. `vercel.json` currently declares:

```text
"crons": [ { "path": "/api/public/keepalive", "schedule": "*/10 * * * *" } ]
```

Vercel's Hobby plan only permits **one cron job, running at most once per day**. A sub-daily schedule is rejected at deploy time, so the build never completes and the previously working deployment keeps serving. That matches exactly what you saw: the site is live and healthy, but every route added in recent rounds (`/admin/errors`, `/api/public/keepalive`, `/api/public/error-report`) returns 404 because that code was never deployed.

## What I found in the database

There is one scheduled job today:

```text
stable-finance-keepalive   */10 * * * *   active   command: SELECT 1;
```

So the database is already pinging itself every 10 minutes — but `SELECT 1` only touches Postgres. It never reaches the web app, so the frontend/server side has no keep-alive at all right now.

## The fix

**1. Make the Vercel cron daily.** Change the schedule in `vercel.json` from `*/10 * * * *` to `0 6 * * *` (once a day, 06:00 UTC). This satisfies the Hobby-plan limit and unblocks deploys. It stays as a daily health check.

**2. Make the database the primary keep-alive.** Upgrade the existing `stable-finance-keepalive` job so instead of `SELECT 1` it uses `pg_net` to make a real HTTP request to `/api/public/keepalive` every 10 minutes. That single request wakes both tiers at once: it hits the app's server runtime, and the endpoint itself reads a row from `site_settings`, which wakes the database. One job, both systems warm.

**3. Add a lightweight ping log.** Record each keep-alive result (status, duration, timestamp) so you can confirm from the admin Diagnostics page that the schedule is actually firing, rather than assuming it is.

**4. Re-verify after deploy.** Once Vercel accepts the build, confirm `/admin/errors`, `/api/public/keepalive` and `/api/public/error-report` all respond on the live site and the Diagnostics item appears in the admin sidebar.

## Technical notes

- The `pg_cron` job will be rescheduled with `cron.schedule` using `net.http_post` against the stable production URL, run through the SQL tool (not a migration) since it contains environment-specific URL values.
- `pg_net` needs to be enabled alongside `pg_cron`; I'll verify and enable it if absent.
- The keep-alive endpoint stays under `/api/public/*` so it bypasses site auth, and it remains read-only — it selects one id from `site_settings` and returns JSON. No data is written by the ping itself.
- No app logic, email, or auth behaviour changes in this plan. It is confined to the cron configuration, the keep-alive endpoint's logging, and the deploy unblock.

## One thing to check on your side

After this change lands and Vercel builds successfully, if the build *still* fails, the next most likely cause is the Hobby-plan limit of one cron total. `vercel.json` declares only one, so this should clear it — but the Vercel deployment log will name the exact reason if not, and I'd want to see that message.
