# Vercel environment variables

Add these in Vercel → Project → Settings → Environment Variables, for both
Production and Preview, then redeploy.

## Client-visible (safe, publishable)

```
VITE_SUPABASE_URL=https://lwhqllusuqmtrkdfguca.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_jDMAXGfoz_tBKMWAjdpP_Q_AmWqrkur
VITE_SUPABASE_PROJECT_ID=lwhqllusuqmtrkdfguca
```

## Server-side twins (needed for SSR and server functions)

```
SUPABASE_URL=https://lwhqllusuqmtrkdfguca.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_jDMAXGfoz_tBKMWAjdpP_Q_AmWqrkur
SUPABASE_PROJECT_ID=lwhqllusuqmtrkdfguca
```

## Optional

`SUPABASE_SERVICE_ROLE_KEY` — only if the Vercel deployment must run
privileged admin operations. Not available from the Lovable Cloud side; use
the service key of whichever backend project you point the deploy at.

## Notes

- These same values already exist in the repo's `.env` file, so the app also
  works if Vercel picks that up during build.
- After saving the variables, trigger a redeploy with build cache disabled so
  the new values are inlined into the client bundle.

No code changes are required for this.
