-- Stable Finance Bank — full schema for a fresh Supabase project
-- Run in the SQL editor of your Supabase project (once, top to bottom).

create extension if not exists pgcrypto;
create extension if not exists pg_net with schema extensions;


-- ============ ENUM TYPES ============
do $$ begin create type public.app_role as enum ('customer', 'admin', 'support'); exception when duplicate_object then null; end $$;

-- ============ TABLES ============
create table if not exists public.accounts (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "type" text not null,
  "nickname" text,
  "account_number" text not null,
  "routing_number" text default '011000138'::text not null,
  "balance" numeric(18,2) default 0 not null,
  "available_balance" numeric(18,2) default 0 not null,
  "currency" text default 'USD'::text not null,
  "interest_rate" numeric(6,4) default 0,
  "status" text default 'active'::text not null,
  "opened_at" timestamp with time zone default now() not null,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
create table if not exists public.alerts (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "kind" text not null,
  "title" text not null,
  "body" text,
  "read_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
create table if not exists public.alerts_prefs (
  "user_id" uuid not null,
  "large_txn_threshold" numeric(18,2) default 500 not null,
  "low_balance_threshold" numeric(18,2) default 100 not null,
  "login_alerts" boolean default true not null,
  "updated_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts_prefs TO authenticated;
GRANT ALL ON public.alerts_prefs TO service_role;
create table if not exists public.audit_log (
  "id" uuid default gen_random_uuid() not null,
  "actor_id" uuid,
  "action" text not null,
  "entity" text,
  "entity_id" text,
  "details" jsonb default '{}'::jsonb,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
create table if not exists public.bill_payments (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "payee_id" uuid not null,
  "from_account_id" uuid not null,
  "amount" numeric(18,2) not null,
  "scheduled_for" date,
  "status" text default 'completed'::text not null,
  "memo" text,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bill_payments TO authenticated;
GRANT ALL ON public.bill_payments TO service_role;
create table if not exists public.cards (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "account_id" uuid not null,
  "brand" text default 'Stable Finance'::text not null,
  "network" text default 'visa'::text not null,
  "card_type" text not null,
  "cardholder_name" text not null,
  "last4" text not null,
  "pan_masked" text not null,
  "full_pan" text not null,
  "exp_month" integer not null,
  "exp_year" integer not null,
  "cvv" text not null,
  "status" text default 'active'::text not null,
  "daily_limit" numeric(18,2) default 5000,
  "online_enabled" boolean default true not null,
  "contactless_enabled" boolean default true not null,
  "international_enabled" boolean default false not null,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
create table if not exists public.cheque_deposits (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "account_id" uuid not null,
  "amount" numeric(18,2) not null,
  "front_url" text,
  "back_url" text,
  "status" text default 'pending'::text not null,
  "admin_notes" text,
  "created_at" timestamp with time zone default now() not null,
  "decided_at" timestamp with time zone
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cheque_deposits TO authenticated;
GRANT ALL ON public.cheque_deposits TO service_role;
create table if not exists public.deleted_users (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "email" text,
  "full_name" text,
  "username" text,
  "snapshot" jsonb default '{}'::jsonb not null,
  "deleted_by" uuid,
  "deleted_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deleted_users TO authenticated;
GRANT ALL ON public.deleted_users TO service_role;
create table if not exists public.email_log (
  "id" uuid default gen_random_uuid() not null,
  "to_email" text not null,
  "subject" text not null,
  "template" text,
  "status" text default 'sent'::text not null,
  "error" text,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.email_log TO authenticated;
GRANT ALL ON public.email_log TO service_role;
create table if not exists public.holdings (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "account_id" uuid,
  "symbol" text not null,
  "name" text not null,
  "asset_class" text default 'equity'::text not null,
  "shares" numeric(18,4) default 0 not null,
  "price" numeric(18,2) default 0 not null,
  "day_change" numeric(8,4) default 0 not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.holdings TO authenticated;
GRANT ALL ON public.holdings TO service_role;
create table if not exists public.kyc_submissions (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "doc_type" text not null,
  "doc_front_url" text,
  "doc_back_url" text,
  "selfie_url" text,
  "status" text default 'pending'::text not null,
  "reviewer_id" uuid,
  "notes" text,
  "submitted_at" timestamp with time zone default now() not null,
  "decided_at" timestamp with time zone
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;
create table if not exists public.loans (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "kind" text not null,
  "nickname" text,
  "principal" numeric(18,2) default 0 not null,
  "balance" numeric(18,2) default 0 not null,
  "rate" numeric(6,4) default 0 not null,
  "term_months" integer default 60 not null,
  "monthly_payment" numeric(18,2) default 0 not null,
  "next_payment_date" date,
  "status" text default 'active'::text not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "funding_account_id" uuid,
  "decided_at" timestamp with time zone,
  "decision_notes" text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.loans TO authenticated;
GRANT ALL ON public.loans TO service_role;
create table if not exists public.pages (
  "id" uuid default gen_random_uuid() not null,
  "slug" text not null,
  "title" text not null,
  "meta_description" text,
  "og_image" text,
  "hero_title" text,
  "hero_subtitle" text,
  "hero_image" text,
  "blocks" jsonb default '[]'::jsonb not null,
  "nav_label" text,
  "nav_order" integer default 0 not null,
  "in_nav" boolean default true not null,
  "published" boolean default true not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
GRANT SELECT ON public.pages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
create table if not exists public.payees (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "name" text not null,
  "category" text,
  "account_number" text,
  "address" text,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payees TO authenticated;
GRANT ALL ON public.payees TO service_role;
create table if not exists public.profiles (
  "id" uuid not null,
  "email" text not null,
  "full_name" text,
  "phone" text,
  "avatar_url" text,
  "address_line1" text,
  "address_line2" text,
  "city" text,
  "state" text,
  "postal_code" text,
  "country" text default 'US'::text,
  "date_of_birth" date,
  "ssn_last4" text,
  "status" text default 'active'::text not null,
  "kyc_status" text default 'unverified'::text not null,
  "two_factor_enabled" boolean default false not null,
  "notification_prefs" jsonb default '{"sms": false, "push": true, "email": true}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null,
  "transaction_limit" numeric(18,2) default 5000 not null,
  "username" text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
create table if not exists public.risk_scores (
  "user_id" uuid not null,
  "score" integer default 30 not null,
  "factors" jsonb default '{}'::jsonb not null,
  "computed_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_scores TO authenticated;
GRANT ALL ON public.risk_scores TO service_role;
create table if not exists public.site_settings (
  "id" integer default 1 not null,
  "brand_name" text default 'Stable Finance Bank'::text not null,
  "tagline" text default 'Banking with clarity, care, and craft.'::text not null,
  "logo_url" text,
  "primary_color" text default '#0b2545'::text not null,
  "accent_color" text default '#b87333'::text not null,
  "contact_email" text default 'hello@meridianbank.example'::text not null,
  "contact_phone" text default '+1 (800) 555-0110'::text not null,
  "address" text default '100 Harbor St, Boston, MA'::text not null,
  "routing_number" text default '011000138'::text not null,
  "socials" jsonb default '{}'::jsonb not null,
  "updated_at" timestamp with time zone default now() not null,
  "public_url" text default 'https://www.stf-b.com'::text not null
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
create table if not exists public.smtp_settings (
  "id" integer default 1 not null,
  "host" text default 'smtp.stf-b.com'::text not null,
  "port" integer default 465 not null,
  "secure" boolean default true not null,
  "username" text default ''::text not null,
  "password" text default ''::text not null,
  "from_name" text,
  "from_email" text default ''::text not null,
  "enabled" boolean default false not null,
  "updated_at" timestamp with time zone default now() not null,
  "provider" text default 'smtp'::text not null,
  "api_key" text default ''::text not null,
  "reply_to" text
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.smtp_settings TO authenticated;
GRANT ALL ON public.smtp_settings TO service_role;
create table if not exists public.app_config (
  "key" text not null,
  "value" text not null,
  "updated_at" timestamp with time zone default now() not null
);
GRANT ALL ON public.app_config TO service_role;
create table if not exists public.error_events (
  "id" uuid default gen_random_uuid() not null,
  "incident_code" text not null,
  "fingerprint" text not null,
  "severity" text default 'error'::text not null,
  "source" text not null,
  "route" text,
  "action" text,
  "message" text not null,
  "stack_summary" text,
  "metadata" jsonb default '{}'::jsonb not null,
  "occurrence_count" integer default 1 not null,
  "status" text default 'open'::text not null,
  "first_seen_at" timestamp with time zone default now() not null,
  "last_seen_at" timestamp with time zone default now() not null,
  "resolved_at" timestamp with time zone,
  "resolved_by" uuid,
  "ai_status" text default 'not_analyzed'::text not null,
  "ai_cause" text,
  "ai_confidence" text,
  "ai_recommendation" text,
  "ai_action_kind" text,
  "ai_error" text,
  "analyzed_at" timestamp with time zone,
  "action_approved_at" timestamp with time zone,
  "action_approved_by" uuid,
  "action_executed_at" timestamp with time zone,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
GRANT SELECT, UPDATE ON public.error_events TO authenticated;
GRANT ALL ON public.error_events TO service_role;
create table if not exists public.keepalive_pings (
  "id" uuid default gen_random_uuid() not null,
  "source" text not null,
  "ok" boolean default true not null,
  "db_status" text not null,
  "duration_ms" integer default 0 not null,
  "detail" text,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT ON public.keepalive_pings TO authenticated;
GRANT ALL ON public.keepalive_pings TO service_role;
create table if not exists public.statements (
  "id" uuid default gen_random_uuid() not null,
  "account_id" uuid not null,
  "user_id" uuid not null,
  "period_start" date not null,
  "period_end" date not null,
  "opening_balance" numeric(18,2) not null,
  "closing_balance" numeric(18,2) not null,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.statements TO authenticated;
GRANT ALL ON public.statements TO service_role;
create table if not exists public.support_tickets (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "subject" text not null,
  "category" text default 'general'::text not null,
  "status" text default 'open'::text not null,
  "priority" text default 'normal'::text not null,
  "assigned_to" uuid,
  "created_at" timestamp with time zone default now() not null,
  "updated_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
create table if not exists public.ticket_messages (
  "id" uuid default gen_random_uuid() not null,
  "ticket_id" uuid not null,
  "author_id" uuid not null,
  "body" text not null,
  "is_staff" boolean default false not null,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
create table if not exists public.transactions (
  "id" uuid default gen_random_uuid() not null,
  "account_id" uuid not null,
  "user_id" uuid not null,
  "amount" numeric(18,2) not null,
  "currency" text default 'USD'::text not null,
  "description" text not null,
  "merchant" text,
  "category" text,
  "type" text not null,
  "status" text default 'completed'::text not null,
  "counterparty" text,
  "reference" text,
  "metadata" jsonb default '{}'::jsonb not null,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
create table if not exists public.transfers (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "from_account_id" uuid not null,
  "to_account_id" uuid,
  "to_external" jsonb,
  "kind" text not null,
  "amount" numeric(18,2) not null,
  "memo" text,
  "status" text default 'completed'::text not null,
  "receipt_number" text default ('TX-'::text || upper(substr((gen_random_uuid())::text, 1, 10))) not null,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transfers TO authenticated;
GRANT ALL ON public.transfers TO service_role;
create table if not exists public.user_roles (
  "id" uuid default gen_random_uuid() not null,
  "user_id" uuid not null,
  "role" app_role not null,
  "created_at" timestamp with time zone default now() not null
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

-- ============ CONSTRAINTS ============
do $$ begin alter table public.app_config add constraint "app_config_pkey" PRIMARY KEY (key); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.error_events add constraint "error_events_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.error_events add constraint "error_events_fingerprint_key" UNIQUE (fingerprint); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.keepalive_pings add constraint "keepalive_pings_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;

do $$ begin alter table public.accounts add constraint "accounts_account_number_key" UNIQUE (account_number); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.accounts add constraint "accounts_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.accounts add constraint "accounts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.alerts add constraint "alerts_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.alerts add constraint "alerts_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.alerts_prefs add constraint "alerts_prefs_pkey" PRIMARY KEY (user_id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.alerts_prefs add constraint "alerts_prefs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.audit_log add constraint "audit_log_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.audit_log add constraint "audit_log_actor_id_fkey" FOREIGN KEY (actor_id) REFERENCES auth.users(id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.bill_payments add constraint "bill_payments_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.bill_payments add constraint "bill_payments_from_account_id_fkey" FOREIGN KEY (from_account_id) REFERENCES accounts(id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.bill_payments add constraint "bill_payments_payee_id_fkey" FOREIGN KEY (payee_id) REFERENCES payees(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.bill_payments add constraint "bill_payments_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.bill_payments add constraint "bill_payments_amount_check" CHECK ((amount > (0)::numeric)); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.cards add constraint "cards_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.cards add constraint "cards_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.cards add constraint "cards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.cheque_deposits add constraint "cheque_deposits_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.cheque_deposits add constraint "cheque_deposits_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.cheque_deposits add constraint "cheque_deposits_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.cheque_deposits add constraint "cheque_deposits_amount_check" CHECK ((amount > (0)::numeric)); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.deleted_users add constraint "deleted_users_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.email_log add constraint "email_log_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.holdings add constraint "holdings_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.holdings add constraint "holdings_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.holdings add constraint "holdings_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.kyc_submissions add constraint "kyc_submissions_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.kyc_submissions add constraint "kyc_submissions_reviewer_id_fkey" FOREIGN KEY (reviewer_id) REFERENCES auth.users(id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.kyc_submissions add constraint "kyc_submissions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.loans add constraint "loans_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.loans add constraint "loans_funding_account_id_fkey" FOREIGN KEY (funding_account_id) REFERENCES accounts(id) ON DELETE SET NULL; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.loans add constraint "loans_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.pages add constraint "pages_slug_key" UNIQUE (slug); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.pages add constraint "pages_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.payees add constraint "payees_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.payees add constraint "payees_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.profiles add constraint "profiles_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.profiles add constraint "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.risk_scores add constraint "risk_scores_pkey" PRIMARY KEY (user_id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.risk_scores add constraint "risk_scores_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.site_settings add constraint "site_settings_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.site_settings add constraint "site_settings_id_check" CHECK ((id = 1)); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.smtp_settings add constraint "smtp_settings_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.smtp_settings add constraint "smtp_singleton" CHECK ((id = 1)); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.statements add constraint "statements_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.statements add constraint "statements_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.statements add constraint "statements_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.support_tickets add constraint "support_tickets_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.support_tickets add constraint "support_tickets_assigned_to_fkey" FOREIGN KEY (assigned_to) REFERENCES auth.users(id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.support_tickets add constraint "support_tickets_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.ticket_messages add constraint "ticket_messages_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.ticket_messages add constraint "ticket_messages_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.ticket_messages add constraint "ticket_messages_ticket_id_fkey" FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transactions add constraint "transactions_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transactions add constraint "transactions_account_id_fkey" FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transactions add constraint "transactions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transfers add constraint "transfers_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transfers add constraint "transfers_from_account_id_fkey" FOREIGN KEY (from_account_id) REFERENCES accounts(id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transfers add constraint "transfers_to_account_id_fkey" FOREIGN KEY (to_account_id) REFERENCES accounts(id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transfers add constraint "transfers_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.transfers add constraint "transfers_amount_check" CHECK ((amount > (0)::numeric)); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.user_roles add constraint "user_roles_user_id_role_key" UNIQUE (user_id, role); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.user_roles add constraint "user_roles_pkey" PRIMARY KEY (id); exception when duplicate_object then null; when duplicate_table then null; end $$;
do $$ begin alter table public.user_roles add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE; exception when duplicate_object then null; when duplicate_table then null; end $$;

-- ============ INDEXES ============
CREATE INDEX IF NOT EXISTS ix_tx_account_date ON public.transactions USING btree (account_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key ON public.profiles USING btree (lower(username));

-- ============ FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(_account_id uuid, _amount numeric, _memo text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _owner uuid; _bal numeric; _tx uuid;
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _amount = 0 THEN RAISE EXCEPTION 'amount must not be zero'; END IF;
  SELECT user_id, balance INTO _owner, _bal FROM public.accounts WHERE id=_account_id FOR UPDATE;
  IF _owner IS NULL THEN RAISE EXCEPTION 'account not found'; END IF;
  IF _amount < 0 AND _bal + _amount < 0 THEN RAISE EXCEPTION 'insufficient funds'; END IF;
  UPDATE public.accounts SET balance=balance+_amount, available_balance=available_balance+_amount WHERE id=_account_id;
  INSERT INTO public.transactions(account_id,user_id,amount,description,type,status,reference)
  VALUES (_account_id,_owner,_amount, COALESCE(NULLIF(_memo,''), CASE WHEN _amount>0 THEN 'Account credit' ELSE 'Account debit' END),
          CASE WHEN _amount>0 THEN 'credit' ELSE 'debit' END,'completed','ADJ-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)))
  RETURNING id INTO _tx;
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'adjust_balance','accounts',_account_id::text, jsonb_build_object('amount',_amount,'memo',_memo));
  RETURN _tx;
END $function$
;
CREATE OR REPLACE FUNCTION public.admin_decide_cheque(_id uuid, _approve boolean, _notes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _c public.cheque_deposits;
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO _c FROM public.cheque_deposits WHERE id=_id FOR UPDATE;
  IF _c.id IS NULL THEN RAISE EXCEPTION 'deposit not found'; END IF;
  IF _c.status <> 'pending' THEN RAISE EXCEPTION 'already decided'; END IF;
  UPDATE public.cheque_deposits SET status = CASE WHEN _approve THEN 'accepted' ELSE 'rejected' END,
    admin_notes=_notes, decided_at=now() WHERE id=_id;
  IF _approve THEN
    PERFORM public.internal_post(_c.account_id,_c.user_id,_c.amount,'Mobile cheque deposit','deposit');
  END IF;
  INSERT INTO public.alerts(user_id,kind,title,body)
  VALUES (_c.user_id,'deposit', CASE WHEN _approve THEN 'Cheque deposit accepted' ELSE 'Cheque deposit rejected' END, COALESCE(_notes,''));
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'decide_cheque','cheque_deposits',_id::text, jsonb_build_object('approve',_approve));
END $function$
;
CREATE OR REPLACE FUNCTION public.admin_decide_kyc(_submission_id uuid, _status text, _notes text, _limit numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _target uuid;
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('verified','rejected','submitted','pending') THEN RAISE EXCEPTION 'invalid status'; END IF;
  SELECT user_id INTO _target FROM public.kyc_submissions WHERE id=_submission_id;
  IF _target IS NULL THEN RAISE EXCEPTION 'submission not found'; END IF;
  UPDATE public.kyc_submissions SET status=_status, notes=_notes, reviewer_id=_uid, decided_at=now() WHERE id=_submission_id;
  UPDATE public.profiles SET kyc_status=_status,
    transaction_limit = CASE WHEN _limit IS NOT NULL AND _limit > 0 THEN _limit ELSE transaction_limit END
  WHERE id=_target;
  INSERT INTO public.alerts(user_id,kind,title,body)
  VALUES (_target,'kyc','Identity verification '||_status, COALESCE(_notes,'Your verification status was updated.'));
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'decide_kyc','kyc_submissions',_submission_id::text, jsonb_build_object('status',_status,'limit',_limit));
END $function$
;
CREATE OR REPLACE FUNCTION public.admin_decide_loan(_loan_id uuid, _approve boolean, _notes text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _l public.loans; _acct uuid;
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  SELECT * INTO _l FROM public.loans WHERE id = _loan_id FOR UPDATE;
  IF _l.id IS NULL THEN RAISE EXCEPTION 'loan not found'; END IF;
  IF _l.status <> 'pending' THEN RAISE EXCEPTION 'loan already decided'; END IF;

  IF _approve THEN
    _acct := COALESCE(_l.funding_account_id, (SELECT id FROM public.accounts WHERE user_id=_l.user_id ORDER BY created_at LIMIT 1));
    IF _acct IS NULL THEN RAISE EXCEPTION 'no account to fund'; END IF;
    UPDATE public.loans SET status='active', decided_at=now(), decision_notes=_notes,
      next_payment_date = (current_date + interval '30 days')::date WHERE id=_loan_id;
    PERFORM public.internal_post(_acct,_l.user_id,_l.principal, COALESCE(_l.nickname,_l.kind)||' disbursement','credit');
    INSERT INTO public.alerts(user_id,kind,title,body) VALUES (_l.user_id,'loan','Loan approved', COALESCE(_l.nickname,_l.kind)||' funded to your account.');
  ELSE
    UPDATE public.loans SET status='rejected', decided_at=now(), decision_notes=_notes, balance=0 WHERE id=_loan_id;
    INSERT INTO public.alerts(user_id,kind,title,body) VALUES (_l.user_id,'loan','Loan application declined', COALESCE(_notes,'Please contact support for details.'));
  END IF;

  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid, CASE WHEN _approve THEN 'approve_loan' ELSE 'reject_loan' END,'loans',_loan_id::text, jsonb_build_object('notes',_notes));
END $function$
;
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _p public.profiles;
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _user_id = _uid THEN RAISE EXCEPTION 'you cannot delete your own account'; END IF;
  SELECT * INTO _p FROM public.profiles WHERE id = _user_id;
  IF _p.id IS NULL THEN RAISE EXCEPTION 'customer not found'; END IF;

  INSERT INTO public.deleted_users(user_id, email, full_name, username, snapshot, deleted_by)
  VALUES (
    _user_id, _p.email, _p.full_name, _p.username,
    jsonb_build_object(
      'profile', to_jsonb(_p),
      'accounts', COALESCE((SELECT jsonb_agg(to_jsonb(a)) FROM public.accounts a WHERE a.user_id=_user_id), '[]'::jsonb),
      'loans', COALESCE((SELECT jsonb_agg(to_jsonb(l)) FROM public.loans l WHERE l.user_id=_user_id), '[]'::jsonb),
      'transactions_count', (SELECT count(*) FROM public.transactions t WHERE t.user_id=_user_id)
    ),
    _uid
  );

  DELETE FROM public.ticket_messages WHERE ticket_id IN (SELECT id FROM public.support_tickets WHERE user_id=_user_id);
  DELETE FROM public.support_tickets WHERE user_id=_user_id;
  DELETE FROM public.bill_payments WHERE user_id=_user_id;
  DELETE FROM public.payees WHERE user_id=_user_id;
  DELETE FROM public.cards WHERE user_id=_user_id;
  DELETE FROM public.cheque_deposits WHERE user_id=_user_id;
  DELETE FROM public.kyc_submissions WHERE user_id=_user_id;
  DELETE FROM public.statements WHERE user_id=_user_id;
  DELETE FROM public.transfers WHERE user_id=_user_id;
  DELETE FROM public.transactions WHERE user_id=_user_id;
  DELETE FROM public.holdings WHERE user_id=_user_id;
  DELETE FROM public.loans WHERE user_id=_user_id;
  DELETE FROM public.alerts WHERE user_id=_user_id;
  DELETE FROM public.alerts_prefs WHERE user_id=_user_id;
  DELETE FROM public.risk_scores WHERE user_id=_user_id;
  DELETE FROM public.accounts WHERE user_id=_user_id;
  DELETE FROM public.user_roles WHERE user_id=_user_id;
  DELETE FROM public.profiles WHERE id=_user_id;
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'delete_user','profiles',_user_id::text, jsonb_build_object('email',_p.email,'archived',true));
  DELETE FROM auth.users WHERE id=_user_id;
END $function$
;
CREATE OR REPLACE FUNCTION public.admin_set_transaction_limit(_user_id uuid, _limit numeric)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _limit < 0 THEN RAISE EXCEPTION 'invalid limit'; END IF;
  UPDATE public.profiles SET transaction_limit=_limit WHERE id=_user_id;
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'set_transaction_limit','profiles',_user_id::text, jsonb_build_object('limit',_limit));
END $function$
;
CREATE OR REPLACE FUNCTION public.admin_set_user_status(_user_id uuid, _status text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _title text; _body text;
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('active','suspended','banned','closed') THEN RAISE EXCEPTION 'invalid status'; END IF;
  UPDATE public.profiles SET status=_status WHERE id=_user_id;
  UPDATE public.accounts SET status = CASE WHEN _status='active' THEN 'active' ELSE 'frozen' END WHERE user_id=_user_id;
  IF _status = 'active' THEN
    _title := 'Your account has been reactivated';
    _body := 'Your Stable Finance Bank account is active again. You can sign in and use all banking services. If you did not expect this change, contact support immediately.';
  ELSIF _status = 'suspended' THEN
    _title := 'Your account has been suspended';
    _body := 'Your Stable Finance Bank account has been suspended and sign-in is temporarily blocked. Please contact support for assistance.';
  ELSIF _status = 'banned' THEN
    _title := 'Your account has been banned';
    _body := 'Your Stable Finance Bank account has been banned and you can no longer sign in. Please contact support if you believe this is a mistake.';
  ELSE
    _title := 'Your account has been closed';
    _body := 'Your Stable Finance Bank account has been closed and access has been withdrawn. Please contact support with any questions about your balances or records.';
  END IF;
  INSERT INTO public.alerts(user_id, kind, title, body)
  VALUES (_user_id, 'account_status', _title, _body);
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'set_user_status','profiles',_user_id::text, jsonb_build_object('status',_status));
END $function$
;
CREATE OR REPLACE FUNCTION public.apply_for_loan(_kind text, _nickname text, _principal numeric, _rate numeric, _term integer, _monthly numeric, _funding uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _id uuid; _owner uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  IF _principal <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;
  SELECT user_id INTO _owner FROM public.accounts WHERE id = _funding;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'funding account must be yours'; END IF;
  INSERT INTO public.loans(user_id,kind,nickname,principal,balance,rate,term_months,monthly_payment,status,funding_account_id)
  VALUES (_uid,_kind,_nickname,_principal,_principal,_rate,_term,_monthly,'pending',_funding)
  RETURNING id INTO _id;
  INSERT INTO public.alerts(user_id,kind,title,body) VALUES (_uid,'loan','Loan application received', _nickname||' application for '||_principal::text||' is under review.');
  RETURN _id;
END $function$
;
CREATE OR REPLACE FUNCTION public.contribute_ira(_ira uuid, _from uuid, _amount numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _bal numeric; _owner uuid; _ytd numeric; _meta jsonb; _tx uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;
  SELECT balance, user_id INTO _bal, _owner FROM public.accounts WHERE id=_from FOR UPDATE;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'not your account'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'insufficient funds'; END IF;
  SELECT metadata, user_id INTO _meta, _owner FROM public.accounts WHERE id=_ira FOR UPDATE;
  IF _owner <> _uid THEN RAISE EXCEPTION 'not your account'; END IF;
  _ytd := COALESCE((_meta->>'ytd')::numeric,0) + _amount;
  _tx := public.internal_post(_from,_uid,-_amount,'IRA contribution','transfer');
  PERFORM public.internal_post(_ira,_uid,_amount,'IRA contribution','deposit');
  UPDATE public.accounts SET metadata = COALESCE(metadata,'{}'::jsonb) || jsonb_build_object('ytd',_ytd) WHERE id=_ira;
  RETURN _tx;
END $function$
;
CREATE OR REPLACE FUNCTION public.execute_transfer(_from uuid, _to uuid, _external jsonb, _kind text, _amount numeric, _memo text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid UUID := auth.uid();
  _from_bal NUMERIC;
  _from_owner UUID;
  _to_owner UUID;
  _transfer_id UUID;
  _receipt TEXT := 'TX-'||upper(substr(gen_random_uuid()::text,1,10));
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;

  SELECT balance, user_id INTO _from_bal, _from_owner FROM public.accounts WHERE id=_from FOR UPDATE;
  IF _from_owner IS NULL OR _from_owner <> _uid THEN RAISE EXCEPTION 'not your account'; END IF;
  IF _from_bal < _amount THEN RAISE EXCEPTION 'insufficient funds'; END IF;

  -- Debit source
  UPDATE public.accounts SET balance=balance-_amount, available_balance=available_balance-_amount WHERE id=_from;
  INSERT INTO public.transactions(account_id,user_id,amount,description,type,status,reference,counterparty)
  VALUES (_from,_uid,-_amount, COALESCE(_memo, CASE _kind WHEN 'same' THEN 'Transfer between accounts' WHEN 'intra' THEN 'Transfer to Stable Finance member' WHEN 'ach' THEN 'ACH transfer' WHEN 'wire' THEN 'Wire transfer' ELSE 'Transfer' END),'transfer','completed',_receipt,
    CASE WHEN _external IS NOT NULL THEN (_external->>'name') ELSE NULL END);

  IF _kind IN ('same','intra') AND _to IS NOT NULL THEN
    SELECT user_id INTO _to_owner FROM public.accounts WHERE id=_to FOR UPDATE;
    IF _to_owner IS NULL THEN RAISE EXCEPTION 'destination not found'; END IF;
    IF _kind='same' AND _to_owner <> _uid THEN RAISE EXCEPTION 'same-account must be your own'; END IF;
    UPDATE public.accounts SET balance=balance+_amount, available_balance=available_balance+_amount WHERE id=_to;
    INSERT INTO public.transactions(account_id,user_id,amount,description,type,status,reference)
    VALUES (_to,_to_owner,_amount, COALESCE(_memo,'Incoming transfer'),'transfer','completed',_receipt);
  END IF;

  INSERT INTO public.transfers(user_id,from_account_id,to_account_id,to_external,kind,amount,memo,receipt_number)
  VALUES (_uid,_from,_to,_external,_kind,_amount,_memo,_receipt) RETURNING id INTO _transfer_id;

  RETURN _transfer_id;
END $function$
;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _acct text; _sav text; _uname text; _name text;
BEGIN
  _uname := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'username','')), '');
  IF _uname IS NULL THEN _uname := split_part(NEW.email,'@',1); END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(username)=lower(_uname)) THEN
    _uname := _uname || substr(replace(gen_random_uuid()::text,'-',''),1,4);
  END IF;
  _name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1));

  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (NEW.id, NEW.email, _name, _uname)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;

  LOOP
    _acct := lpad((floor(random()*9000000000)::bigint + 1000000000)::text, 10, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_number = _acct);
  END LOOP;
  INSERT INTO public.accounts (user_id, type, nickname, account_number, balance, available_balance, interest_rate, status)
  VALUES (NEW.id, 'checking', 'Everyday Checking', _acct, 0, 0, 0.0010, 'active');

  LOOP
    _sav := lpad((floor(random()*9000000000)::bigint + 1000000000)::text, 10, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_number = _sav);
  END LOOP;
  INSERT INTO public.accounts (user_id, type, nickname, account_number, balance, available_balance, interest_rate, status)
  VALUES (NEW.id, 'savings', 'High-Yield Savings', _sav, 0, 0, 0.0435, 'active');

  INSERT INTO public.alerts_prefs(user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  INSERT INTO public.alerts(user_id, kind, title, body)
  VALUES (NEW.id, 'welcome', 'Welcome to Stable Finance Bank',
    'Your Everyday Checking account (••' || right(_acct,4) || ') and High-Yield Savings account (••' || right(_sav,4) ||
    ') are open and ready. Verify your identity to lift your transaction limits.');

  RETURN NEW;
END $function$
;

CREATE OR REPLACE FUNCTION public.notify_alert_email()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE _url text; _secret text;
BEGIN
  SELECT value INTO _url FROM public.app_config WHERE key='email_hook_url';
  SELECT value INTO _secret FROM public.app_config WHERE key='email_hook_secret';
  IF _url IS NULL OR _url = '' THEN RETURN NEW; END IF;
  BEGIN
    PERFORM net.http_post(
      url := _url,
      body := jsonb_build_object('alert_id', NEW.id),
      headers := jsonb_build_object('content-type','application/json','x-email-hook-secret', COALESCE(_secret,''))
    );
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  RETURN NEW;
END $function$;
;

CREATE OR REPLACE FUNCTION public.my_account_state()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT status FROM public.profiles WHERE id = auth.uid() $$;
GRANT EXECUTE ON FUNCTION public.my_account_state() TO authenticated;

CREATE OR REPLACE FUNCTION public.record_error_event(
  _incident_code text, _fingerprint text, _severity text, _source text,
  _route text, _action text, _message text, _stack_summary text, _metadata jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE _id uuid;
BEGIN
  IF current_user NOT IN ('service_role', 'postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  INSERT INTO public.error_events (
    incident_code, fingerprint, severity, source, route, action, message, stack_summary, metadata
  ) VALUES (
    left(_incident_code, 24), left(_fingerprint, 128),
    CASE WHEN _severity IN ('info','warning','error','critical') THEN _severity ELSE 'error' END,
    left(_source, 80), left(_route, 300), left(_action, 120),
    left(_message, 1200), left(_stack_summary, 3000), COALESCE(_metadata, '{}'::jsonb)
  )
  ON CONFLICT (fingerprint) DO UPDATE SET
    occurrence_count = public.error_events.occurrence_count + 1,
    last_seen_at = now(), severity = EXCLUDED.severity,
    route = COALESCE(EXCLUDED.route, public.error_events.route),
    action = COALESCE(EXCLUDED.action, public.error_events.action),
    message = EXCLUDED.message,
    stack_summary = COALESCE(EXCLUDED.stack_summary, public.error_events.stack_summary),
    metadata = EXCLUDED.metadata,
    status = CASE WHEN public.error_events.status = 'resolved' THEN 'open' ELSE public.error_events.status END,
    resolved_at = CASE WHEN public.error_events.status = 'resolved' THEN NULL ELSE public.error_events.resolved_at END,
    resolved_by = CASE WHEN public.error_events.status = 'resolved' THEN NULL ELSE public.error_events.resolved_by END
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;
REVOKE ALL ON FUNCTION public.record_error_event(text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_error_event(text,text,text,text,text,text,text,text,jsonb) TO service_role;
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $function$
;
CREATE OR REPLACE FUNCTION public.internal_post(_account_id uuid, _user_id uuid, _amount numeric, _desc text, _type text, _ref text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _tx uuid;
BEGIN
  UPDATE public.accounts SET balance = balance + _amount, available_balance = available_balance + _amount WHERE id = _account_id;
  INSERT INTO public.transactions(account_id,user_id,amount,description,type,status,reference)
  VALUES (_account_id,_user_id,_amount,_desc,_type,'completed', COALESCE(_ref,'RF-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))))
  RETURNING id INTO _tx;
  RETURN _tx;
END $function$
;
CREATE OR REPLACE FUNCTION public.pay_bill(_payee_id uuid, _from uuid, _amount numeric, _memo text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _bal numeric; _owner uuid; _payee text; _bp uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;
  SELECT name INTO _payee FROM public.payees WHERE id=_payee_id AND user_id=_uid;
  IF _payee IS NULL THEN RAISE EXCEPTION 'payee not found'; END IF;
  SELECT balance, user_id INTO _bal, _owner FROM public.accounts WHERE id=_from FOR UPDATE;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'not your account'; END IF;
  IF _bal < _amount THEN RAISE EXCEPTION 'insufficient funds'; END IF;
  INSERT INTO public.bill_payments(user_id,payee_id,from_account_id,amount,status,memo,scheduled_for)
  VALUES (_uid,_payee_id,_from,_amount,'completed',_memo,current_date) RETURNING id INTO _bp;
  PERFORM public.internal_post(_from,_uid,-_amount,'Bill payment — '||_payee,'payment');
  RETURN _bp;
END $function$
;
CREATE OR REPLACE FUNCTION public.pay_loan(_loan_id uuid, _from uuid, _amount numeric)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _l public.loans; _bal numeric; _owner uuid; _amt numeric; _tx uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  SELECT * INTO _l FROM public.loans WHERE id=_loan_id FOR UPDATE;
  IF _l.id IS NULL OR _l.user_id <> _uid THEN RAISE EXCEPTION 'loan not found'; END IF;
  IF _l.status <> 'active' THEN RAISE EXCEPTION 'loan is not active'; END IF;
  SELECT balance, user_id INTO _bal, _owner FROM public.accounts WHERE id=_from FOR UPDATE;
  IF _owner IS NULL OR _owner <> _uid THEN RAISE EXCEPTION 'not your account'; END IF;
  _amt := LEAST(COALESCE(NULLIF(_amount,0), _l.monthly_payment), _l.balance);
  IF _amt <= 0 THEN RAISE EXCEPTION 'nothing to pay'; END IF;
  IF _bal < _amt THEN RAISE EXCEPTION 'insufficient funds'; END IF;
  _tx := public.internal_post(_from,_uid,-_amt, COALESCE(_l.nickname,_l.kind)||' payment','payment');
  UPDATE public.loans SET balance = balance - _amt,
    next_payment_date = (current_date + interval '30 days')::date,
    status = CASE WHEN balance - _amt <= 0 THEN 'paid' ELSE status END
  WHERE id=_loan_id;
  RETURN _tx;
END $function$
;
CREATE OR REPLACE FUNCTION public.resolve_transfer_recipient(_query text)
 RETURNS TABLE(account_id uuid, display_name text, masked_account text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _q text := lower(trim(coalesce(_query,'')));
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  IF _q = '' THEN RETURN; END IF;
  RETURN QUERY
  SELECT a.id,
         COALESCE(NULLIF(p.full_name,''), p.username, 'Stable Finance member') AS display_name,
         '••' || right(a.account_number, 4) AS masked_account
  FROM public.accounts a
  JOIN public.profiles p ON p.id = a.user_id
  WHERE a.user_id <> _uid
    AND a.status = 'active'
    AND p.status = 'active'
    AND (a.account_number = _q OR lower(coalesce(p.username,'')) = _q)
  ORDER BY a.created_at
  LIMIT 1;
END $function$
;
CREATE OR REPLACE FUNCTION public.set_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$ BEGIN NEW.updated_at = now(); RETURN NEW; END $function$
;
CREATE OR REPLACE FUNCTION public.submit_kyc(_doc_type text, _front text, _back text, _selfie text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid(); _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  INSERT INTO public.kyc_submissions(user_id,doc_type,doc_front_url,doc_back_url,selfie_url,status)
  VALUES (_uid,_doc_type,_front,_back,_selfie,'submitted') RETURNING id INTO _id;
  UPDATE public.profiles SET kyc_status='submitted' WHERE id=_uid;
  RETURN _id;
END $function$
;

-- ============ TRIGGERS ============
drop trigger if exists accounts_updated on public.accounts;
CREATE TRIGGER accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists holdings_updated on public.holdings;
CREATE TRIGGER holdings_updated BEFORE UPDATE ON public.holdings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists loans_updated on public.loans;
CREATE TRIGGER loans_updated BEFORE UPDATE ON public.loans FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists pages_updated on public.pages;
CREATE TRIGGER pages_updated BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists profiles_updated on public.profiles;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists error_events_updated on public.error_events;
CREATE TRIGGER error_events_updated BEFORE UPDATE ON public.error_events FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists smtp_settings_touch on public.smtp_settings;
CREATE TRIGGER smtp_settings_touch BEFORE UPDATE ON public.smtp_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists tickets_updated on public.support_tickets;
CREATE TRIGGER tickets_updated BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION set_updated_at();
drop trigger if exists alerts_send_email on public.alerts;
CREATE TRIGGER alerts_send_email AFTER INSERT ON public.alerts FOR EACH ROW EXECUTE FUNCTION public.notify_alert_email();
-- Auth trigger: creates a profile, role and first account on signup.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ GRANTS ============

-- ============ ROW LEVEL SECURITY ============
alter table public.accounts enable row level security;
alter table public.alerts enable row level security;
alter table public.alerts_prefs enable row level security;
alter table public.audit_log enable row level security;
alter table public.bill_payments enable row level security;
alter table public.cards enable row level security;
alter table public.cheque_deposits enable row level security;
alter table public.deleted_users enable row level security;
alter table public.email_log enable row level security;
alter table public.app_config enable row level security;
alter table public.error_events enable row level security;
alter table public.keepalive_pings enable row level security;
alter table public.holdings enable row level security;
alter table public.kyc_submissions enable row level security;
alter table public.loans enable row level security;
alter table public.pages enable row level security;
alter table public.payees enable row level security;
alter table public.profiles enable row level security;
alter table public.risk_scores enable row level security;
alter table public.site_settings enable row level security;
alter table public.smtp_settings enable row level security;
alter table public.statements enable row level security;
alter table public.support_tickets enable row level security;
alter table public.ticket_messages enable row level security;
alter table public.transactions enable row level security;
alter table public.transfers enable row level security;
alter table public.user_roles enable row level security;

drop policy if exists "Admins can update all accounts" on public.accounts;
create policy "Admins can update all accounts" on public.accounts for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Admins can view all accounts" on public.accounts;
create policy "Admins can view all accounts" on public.accounts for select to authenticated
  using ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "admin write accounts" on public.accounts;
create policy "admin write accounts" on public.accounts for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "own accounts read" on public.accounts;
create policy "own accounts read" on public.accounts for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "own alerts" on public.alerts;
create policy "own alerts" on public.alerts for all to authenticated
  using ((user_id = auth.uid()))
  with check ((user_id = auth.uid()));
drop policy if exists "own alert prefs" on public.alerts_prefs;
create policy "own alert prefs" on public.alerts_prefs for all to authenticated
  using ((user_id = auth.uid()))
  with check ((user_id = auth.uid()));
drop policy if exists "admin read audit" on public.audit_log;
create policy "admin read audit" on public.audit_log for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "own bills" on public.bill_payments;
create policy "own bills" on public.bill_payments for all to authenticated
  using ((user_id = auth.uid()))
  with check ((user_id = auth.uid()));
drop policy if exists "own cards" on public.cards;
create policy "own cards" on public.cards for all to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))
  with check (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "cheque admin update" on public.cheque_deposits;
create policy "cheque admin update" on public.cheque_deposits for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "cheque insert self" on public.cheque_deposits;
create policy "cheque insert self" on public.cheque_deposits for insert to authenticated
  with check ((user_id = auth.uid()));
drop policy if exists "cheque read" on public.cheque_deposits;
create policy "cheque read" on public.cheque_deposits for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "admins purge deleted users" on public.deleted_users;
create policy "admins purge deleted users" on public.deleted_users for delete to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admins read deleted users" on public.deleted_users;
create policy "admins read deleted users" on public.deleted_users for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admin read email log" on public.email_log;
create policy "admin read email log" on public.email_log for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "own holdings read" on public.holdings;
create policy "own holdings read" on public.holdings for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "own holdings write" on public.holdings;
create policy "own holdings write" on public.holdings for all to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))
  with check (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "kyc admin update" on public.kyc_submissions;
create policy "kyc admin update" on public.kyc_submissions for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "kyc insert self" on public.kyc_submissions;
create policy "kyc insert self" on public.kyc_submissions for insert to authenticated
  with check ((user_id = auth.uid()));
drop policy if exists "kyc read" on public.kyc_submissions;
create policy "kyc read" on public.kyc_submissions for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "own loans read" on public.loans;
create policy "own loans read" on public.loans for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "own loans write" on public.loans;
create policy "own loans write" on public.loans for all to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))
  with check (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "admin write pages" on public.pages;
create policy "admin write pages" on public.pages for all to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "public read pages" on public.pages;
create policy "public read pages" on public.pages for select to public
  using (((published = true) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "own payees" on public.payees;
create policy "own payees" on public.payees for all to authenticated
  using ((user_id = auth.uid()))
  with check ((user_id = auth.uid()));
drop policy if exists "Admins can update all profiles" on public.profiles;
create policy "Admins can update all profiles" on public.profiles for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select to authenticated
  using ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "self insert profile" on public.profiles;
create policy "self insert profile" on public.profiles for insert to authenticated
  with check ((auth.uid() = id));
drop policy if exists "self read profile" on public.profiles;
create policy "self read profile" on public.profiles for select to authenticated
  using (((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "self update profile" on public.profiles;
create policy "self update profile" on public.profiles for update to authenticated
  using (((auth.uid() = id) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "own risk read" on public.risk_scores;
create policy "own risk read" on public.risk_scores for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "admin update settings" on public.site_settings;
create policy "admin update settings" on public.site_settings for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings for select to public
  using (true);
drop policy if exists "admin read smtp" on public.smtp_settings;
create policy "admin read smtp" on public.smtp_settings for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admin update smtp" on public.smtp_settings;
create policy "admin update smtp" on public.smtp_settings for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "own statements" on public.statements;
create policy "own statements" on public.statements for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "insert own ticket" on public.support_tickets;
create policy "insert own ticket" on public.support_tickets for insert to authenticated
  with check ((user_id = auth.uid()));
drop policy if exists "own tickets" on public.support_tickets;
create policy "own tickets" on public.support_tickets for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "staff update tickets" on public.support_tickets;
create policy "staff update tickets" on public.support_tickets for update to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)))
  with check (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "update ticket" on public.support_tickets;
create policy "update ticket" on public.support_tickets for update to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "ticket msg insert" on public.ticket_messages;
create policy "ticket msg insert" on public.ticket_messages for insert to authenticated
  with check (((author_id = auth.uid()) AND (EXISTS ( SELECT 1
   FROM support_tickets t
  WHERE ((t.id = ticket_messages.ticket_id) AND ((t.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)))))));
drop policy if exists "ticket msg read" on public.ticket_messages;
create policy "ticket msg read" on public.ticket_messages for select to authenticated
  using ((EXISTS ( SELECT 1
   FROM support_tickets t
  WHERE ((t.id = ticket_messages.ticket_id) AND ((t.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role))))));
drop policy if exists "Admins can view all transactions" on public.transactions;
create policy "Admins can view all transactions" on public.transactions for select to authenticated
  using ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "own tx read" on public.transactions;
create policy "own tx read" on public.transactions for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "Admins can view all transfers" on public.transfers;
create policy "Admins can view all transfers" on public.transfers for select to authenticated
  using ((has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'support'::app_role)));
drop policy if exists "own transfers" on public.transfers;
create policy "own transfers" on public.transfers for select to authenticated
  using (((user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)));
drop policy if exists "users read own roles" on public.user_roles;
create policy "users read own roles" on public.user_roles for select to authenticated
  using (((auth.uid() = user_id) OR has_role(auth.uid(), 'admin'::app_role)));


-- Admin diagnostics and private application configuration.
drop policy if exists "admin read error events" on public.error_events;
create policy "admin read error events" on public.error_events for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admin update error events" on public.error_events;
create policy "admin update error events" on public.error_events for update to authenticated
  using (has_role(auth.uid(), 'admin'::app_role))
  with check (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "admin read keepalive pings" on public.keepalive_pings;
create policy "admin read keepalive pings" on public.keepalive_pings for select to authenticated
  using (has_role(auth.uid(), 'admin'::app_role));
drop policy if exists "service role app config access" on public.app_config;
create policy "service role app config access" on public.app_config for all to service_role
  using (true) with check (true);
