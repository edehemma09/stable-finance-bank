# Why Vercel isn't showing your latest changes

## What I checked

I probed the live site at www.stf-b.com and compared it with the current code here.

- The live site is definitely served by Vercel (`server: Vercel` header), and its server side is alive — marketing pages, `/admin` and `/auth` all render server-rendered HTML.
- But routes and endpoints that were added in recent rounds return 404 on the live site:
  - `/admin/errors` (the Diagnostics console) → 404
  - `/api/public/keepalive` (the cron keep-alive endpoint) → 404
  - `/api/public/error-report` (browser error logging) → 404
- All three of those files exist in this codebase and are wired into the route tree.

So the code is fine. Vercel is building an **older commit** — the deployment is not stale in the browser, it genuinely does not contain these files. That's a code-delivery problem between Lovable → GitHub → Vercel, not an app bug.

## The likely causes (in order)

1. **"Redeploy" on Vercel re-runs the same commit.** Clicking Redeploy on an existing deployment rebuilds *that* deployment's commit, not the newest one on the branch. This alone explains everything you're seeing.
2. **Branch mismatch.** Lovable's Git sync may be pushing to a branch (e.g. `lovable` or `main`) that isn't the Production Branch configured in Vercel.
3. **Git sync stalled.** If the Lovable ↔ GitHub connection lapsed, the repo simply never received the last several rounds of work.

## What I'll do

Since I can't read your GitHub or Vercel account from here, the plan is: confirm which of the three it is, then fix the pipeline so future changes flow through automatically.

1. **Verify what GitHub actually has.** Connect the GitHub connector so I can read the repo directly, then check the latest commit on each branch for the presence of `src/routes/_authenticated.admin.errors.tsx` and `src/routes/api/public/keepalive.ts`.
   - If those files are missing from the repo → Git sync is broken; you reconnect Git sync in Lovable settings and I re-verify.
   - If they are present → the repo is current and the problem is entirely on the Vercel side (cause 1 or 2).
2. **Correct the Vercel side.** Guide you through: Vercel → Project → Settings → Git → confirm the Production Branch matches the branch Lovable pushes to, then trigger a fresh deploy from the newest commit (Deployments → the top commit → Redeploy with "Use existing Build Cache" **unchecked**), not a redeploy of an old deployment.
3. **Add a build stamp so this is never ambiguous again.** Expose the build's commit SHA and build time at `/api/public/version`, and show it in the admin footer next to the existing "VERSION 2.8.4-STABLE" text. Then a single request tells us exactly which commit is live.
4. **Re-verify the live site** after the deploy: confirm `/admin/errors`, `/api/public/keepalive` and `/api/public/error-report` all respond, and that the Diagnostics item appears in the admin sidebar.

## Technical notes

- `vercel.json` (apex→www 301, HSTS headers, the `*/10 * * * *` keep-alive cron) is already committed. The cron currently points at `/api/public/keepalive`, which 404s on the live build — further confirmation the deployed commit predates that work.
- The build stamp will read Vercel's `VERCEL_GIT_COMMIT_SHA` env var at build time, falling back to `"local"` in the sandbox, so it works in both environments.
- No changes to app logic, database, or email are included here — this is strictly about deployment delivery and observability of which commit is live.
