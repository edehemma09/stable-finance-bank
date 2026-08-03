# Homepage hero, member-to-member transfers, and admin completion

## 1. Homepage hero becomes a full-bleed image

Rework the hero in the shared page renderer so the image is the background of the whole section with a navy color overlay on top of it, and the text/buttons sit over that overlay in a single column. The small uppercase label above the headline (currently the page title, e.g. "HOME") is removed. Headline, subtitle and both buttons stay exactly as they are. Pages without a hero image keep a plain navy hero.

## 2. Member-to-member transfers

Current behaviour: sending to another member looks up the recipient's account directly, which the database blocks because members can only read their own accounts — so it always says "Recipient account not found".

Fix:

- Add a secure lookup that runs with elevated privileges and accepts either a 10-digit account number or a username, returning only the recipient's account reference and a masked display name (never balances, email, or full details).
- The "To member" transfer tab gets one recipient field that accepts account number or username, plus a confirmation line showing the resolved recipient name before sending.
- Routing number is the bank's single shared number, so it identifies the bank, not a person; it will be shown for reference but cannot select a recipient. Account number and username are the identifiers.
- Recipient's incoming credit and alert continue to post as today.

## 3. Admin completion

- **KYC review queue** — list of submissions with status filter, document/selfie preview via signed links, approve/reject with notes and an optional new daily limit; decision writes status back to the customer and emails them.
- **Loan decisions** — pending loan applications with applicant, amount, rate, term and funding account; approve (funds the account) or decline with notes.
- **Cheque approval queue** — pending mobile cheque deposits with front/back images, accept (credits the account) or reject with a note.
- **Ticket threading** — ticket list becomes clickable; a detail view shows the full message thread, lets staff reply as staff, change status/priority, and assign the ticket to themselves. the ticket will have a close button after the ticket is rsolved
- **Delete user** — destructive confirm dialog on the customer detail page that removes the customer and all their records but the user still exisit in the recycle bin(module) , blocked for your own account, logged in the audit trail.
- **SMTP edit** — settings page gains a mail server section (host, port, secure, username, password, from name/address, enabled toggle) plus a recent email delivery log. Password is write-only in the form.

## Technical notes

- New security-definer database function `resolve_transfer_recipient(_query text)` returning `(account_id, display_name, masked_account)`, granted to authenticated users only, matching on `accounts.account_number` or `profiles.username` (case-insensitive) and excluding frozen/closed accounts and the caller's own accounts.
- All existing admin RPCs (`admin_decide_kyc`, `admin_decide_loan`, `admin_decide_cheque`, `admin_delete_user`, `admin_set_transaction_limit`) already exist; this pass builds the UI on top of them — no new admin logic in the database.
- KYC/deposit images live in private buckets, so previews use short-lived signed URLs created client-side by admins (existing storage policies already allow admin reads).
- New routes: `/admin/kyc`, `/admin/loans`, `/admin/cheques`, `/admin/tickets/$id`; admin sidebar gains entries for the review queues.
- SMTP row is the existing singleton `smtp_settings` (admin-only read/update policies already in place).