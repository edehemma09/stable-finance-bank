# Customer detail page + enforced account states

## What you get

1. **A real customer profile page.** Clicking a customer anywhere in Customers opens a full detail page (the page exists today but only shows a slice of the record). It will show everything on file: contact details, address, date of birth, SSN last 4, KYC status and history, roles, daily limit, two-factor status, join date, all accounts and balances, cards, loans, cheque deposits, support tickets, and recent transactions — plus the existing edit form, credit/debit tool, and the Activate / Suspend / Ban / Close controls.

2. **Account states actually take effect.** Today an admin can set a status, but a suspended or banned customer can still sign in. After this change:
   - At sign-in, the account state is checked. If it is not active, the session is immediately ended and a clear message is shown:
     - Banned: "This account has been banned. Contact support."
     - Suspended: "This account is suspended. Contact support."
     - Closed: "This account has been closed. Contact support."
   - Already-signed-in users are kicked out on their next page load with the same message, so a state change takes effect without waiting for logout.
   - Admin-only routes stay reachable for admins only (unchanged).

3. **Email on every state change.** Whenever an admin activates, suspends, bans, or closes an account, the customer receives a branded email explaining the new state and how to contact support. This reuses the existing alerts-to-email pipeline, so it also appears in the customer's in-app alerts.

## Technical outline

- **Detail page** (`src/routes/_authenticated.admin.customers.$id.tsx`): extend `adminCustomerQuery` in `src/lib/admin-queries.ts` to also fetch cards, loans, cheque deposits, tickets, KYC submissions and risk score for the user; render them in grouped panels. Row click target in `_authenticated.admin.customers.index.tsx` becomes the whole row.
- **Status enforcement**:
  - Migration: add a `SECURITY DEFINER` function `public.my_account_state()` returning the caller's `profiles.status` so the check works even when other reads are blocked.
  - `src/routes/auth.tsx`: after `signInWithPassword`, call it; if not `active`, `supabase.auth.signOut()` and show the matching message.
  - `src/routes/_authenticated.tsx`: same check in `beforeLoad`; on a non-active state, sign out and redirect to `/auth` with a `state` search param that renders the banner.
- **Emails**: migration updating `public.admin_set_user_status` to insert an `alerts` row (kind `account_status`) with the state-specific title/body. The existing `alerts_send_email` trigger dispatches it through the configured SMTP engine — no new mail plumbing.
