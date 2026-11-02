-- Stable Finance Bank — performance indexes + housekeeping.
-- Safe to re-run. Paste into your Supabase SQL Editor and click Run.

-- Foreign-key / hot-filter indexes (avoid full table scans)
create index if not exists idx_accounts_user        on public.accounts(user_id);
create index if not exists idx_alerts_user_created  on public.alerts(user_id, created_at desc);
create index if not exists idx_alerts_unread        on public.alerts(user_id) where read_at is null;
create index if not exists idx_bill_pay_user        on public.bill_payments(user_id);
create index if not exists idx_bill_pay_payee       on public.bill_payments(payee_id);
create index if not exists idx_bill_pay_from        on public.bill_payments(from_account_id);
create index if not exists idx_cards_user           on public.cards(user_id);
create index if not exists idx_cards_account        on public.cards(account_id);
create index if not exists idx_cheques_user         on public.cheque_deposits(user_id);
create index if not exists idx_cheques_pending      on public.cheque_deposits(created_at desc) where status = 'pending';
create index if not exists idx_holdings_user        on public.holdings(user_id);
create index if not exists idx_kyc_user             on public.kyc_submissions(user_id);
create index if not exists idx_kyc_pending          on public.kyc_submissions(submitted_at desc) where status = 'pending';
create index if not exists idx_loans_user           on public.loans(user_id);
create index if not exists idx_payees_user          on public.payees(user_id);
create index if not exists idx_statements_account   on public.statements(account_id, period_end desc);
create index if not exists idx_tickets_user         on public.support_tickets(user_id);
create index if not exists idx_tickets_status       on public.support_tickets(status, updated_at desc);
create index if not exists idx_ticket_msgs_ticket   on public.ticket_messages(ticket_id, created_at);
create index if not exists idx_txn_account_created  on public.transactions(account_id, created_at desc);
create index if not exists idx_txn_user_created     on public.transactions(user_id, created_at desc);
create index if not exists idx_transfers_user       on public.transfers(user_id, created_at desc);
create index if not exists idx_transfers_from       on public.transfers(from_account_id);
create index if not exists idx_user_roles_user_role on public.user_roles(user_id, role);
create index if not exists idx_profiles_username    on public.profiles(lower(username));
create index if not exists idx_audit_created        on public.audit_log(created_at desc);
create index if not exists idx_email_log_created    on public.email_log(created_at desc);
create index if not exists idx_errors_last_seen     on public.error_events(last_seen_at desc);
create index if not exists idx_errors_fingerprint   on public.error_events(fingerprint);
create index if not exists idx_keepalive_created    on public.keepalive_pings(created_at desc);

-- Trim log tables daily so storage stays small (needs pg_cron enabled).
create extension if not exists pg_cron;
select cron.unschedule(jobid) from cron.job where jobname = 'stf-log-trim';
select cron.schedule('stf-log-trim', '15 3 * * *', $$
  delete from public.keepalive_pings where created_at < now() - interval '3 days';
  delete from public.email_log       where created_at < now() - interval '90 days';
  delete from public.error_events    where status = 'resolved' and last_seen_at < now() - interval '30 days';
$$);

analyze;
