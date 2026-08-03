
-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('customer','admin','support');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid()=user_id OR public.has_role(auth.uid(),'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'US',
  date_of_birth DATE,
  ssn_last4 TEXT,
  status TEXT NOT NULL DEFAULT 'active',   -- active|suspended|closed
  kyc_status TEXT NOT NULL DEFAULT 'unverified', -- unverified|pending|approved|rejected
  two_factor_enabled BOOLEAN NOT NULL DEFAULT false,
  notification_prefs JSONB NOT NULL DEFAULT '{"email":true,"push":true,"sms":false}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "self read profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid()=id OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "self update profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid()=id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "self insert profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid()=id);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile + default customer role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CMS ============
CREATE TABLE public.site_settings (
  id INT PRIMARY KEY DEFAULT 1,
  brand_name TEXT NOT NULL DEFAULT 'Meridian Bank',
  tagline TEXT NOT NULL DEFAULT 'Banking with clarity, care, and craft.',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '#0b2545',
  accent_color TEXT NOT NULL DEFAULT '#b87333',
  contact_email TEXT NOT NULL DEFAULT 'hello@meridianbank.example',
  contact_phone TEXT NOT NULL DEFAULT '+1 (800) 555-0110',
  address TEXT NOT NULL DEFAULT '100 Harbor St, Boston, MA',
  routing_number TEXT NOT NULL DEFAULT '011000138',
  socials JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (id = 1)
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT ALL ON public.site_settings TO service_role;
GRANT UPDATE ON public.site_settings TO authenticated;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "admin update settings" ON public.site_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
INSERT INTO public.site_settings(id) VALUES (1);

CREATE TABLE public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  meta_description TEXT,
  og_image TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  hero_image TEXT,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  nav_label TEXT,
  nav_order INT NOT NULL DEFAULT 0,
  in_nav BOOLEAN NOT NULL DEFAULT true,
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.pages TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.pages TO authenticated;
GRANT ALL ON public.pages TO service_role;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pages" ON public.pages FOR SELECT USING (published=true OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin write pages" ON public.pages FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER pages_updated BEFORE UPDATE ON public.pages FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed 13 marketing pages
INSERT INTO public.pages(slug,title,nav_label,nav_order,hero_title,hero_subtitle,meta_description,blocks) VALUES
('home','Home','Home',0,'A modern bank built around your day.','Everyday accounts, thoughtful cards, and human support — designed for the way you actually live.','Meridian Bank — everyday banking, thoughtfully built.','[
  {"type":"features","title":"Everything in one place","items":[
    {"title":"Checking & Savings","body":"Zero-fee everyday accounts with instant transfers."},
    {"title":"Cards you control","body":"Freeze, unfreeze, and set limits from your phone."},
    {"title":"Real people","body":"Talk to a banker — not a bot — 7 days a week."}]},
  {"type":"stats","items":[{"k":"$4.2B","v":"held for members"},{"k":"98%","v":"support satisfaction"},{"k":"24/7","v":"account access"}]},
  {"type":"cta","title":"Open an account in minutes","body":"No paperwork. No branch visit.","button":"Get started"}
]'::jsonb),
('personal','Personal Banking','Personal',1,'Personal banking, without the friction.','Checking, savings, and cards that work together.','Personal banking accounts at Meridian.','[{"type":"features","title":"For daily life","items":[{"title":"Free checking","body":"No monthly fees, no minimums."},{"title":"High-yield savings","body":"4.10% APY, compounded daily."},{"title":"Overdraft grace","body":"$50 grace, no fees."}]}]'::jsonb),
('business','Business Banking','Business',2,'Banking that keeps pace with your business.','Multi-user accounts, ACH, wires, and expense controls.','Business banking at Meridian.','[{"type":"features","title":"Built for teams","items":[{"title":"Multi-user access","body":"Roles, limits, approvals."},{"title":"ACH & wires","body":"Domestic and international."},{"title":"Expense cards","body":"One per employee, real-time controls."}]}]'::jsonb),
('accounts','Accounts','Accounts',3,'One relationship. Every account.','Checking, savings, mortgage, and investment — all under one login.','Meridian account types.','[{"type":"features","title":"Account types","items":[{"title":"Checking","body":"Everyday spending, bill pay, direct deposit."},{"title":"Savings","body":"High-yield with automatic rules."},{"title":"Mortgage","body":"See your loan, principal, and payments in one place."},{"title":"Investment","body":"Long-term portfolios, no advisory fees on the first $10k."}]}]'::jsonb),
('cards','Cards','Cards',4,'Cards that respect your attention.','Debit and credit cards with clean controls and honest rewards.','Meridian cards.','[{"type":"features","title":"Card benefits","items":[{"title":"1.5% cashback","body":"Flat rate on every purchase."},{"title":"Instant lock","body":"Freeze in one tap."},{"title":"Virtual cards","body":"For online-only merchants."}]}]'::jsonb),
('loans-mortgage','Loans & Mortgage','Loans',5,'Loans that fit — not funnels.','Personal loans, auto, and mortgages with real underwriting.','Meridian lending.','[{"type":"features","title":"Options","items":[{"title":"Personal","body":"From 7.99% APR."},{"title":"Auto","body":"From 5.49% APR."},{"title":"Mortgage","body":"Fixed and adjustable rates."}]}]'::jsonb),
('investments','Investments','Invest',6,'Long-term thinking, low fees.','Retirement, brokerage, and IRAs from one dashboard.','Meridian investing.','[{"type":"features","title":"Accounts","items":[{"title":"IRA","body":"Traditional & Roth."},{"title":"Brokerage","body":"Stocks & ETFs."},{"title":"Retirement","body":"Portfolios by target date."}]}]'::jsonb),
('security','Security','Security',7,'Security by design.','Encryption, 2FA, and monitoring you can see.','How Meridian keeps you safe.','[{"type":"features","title":"Protections","items":[{"title":"AES-256 at rest","body":"All sensitive fields encrypted."},{"title":"2FA","body":"App-based or hardware key."},{"title":"Real-time alerts","body":"Any login, any transaction."}]}]'::jsonb),
('about','About','About',8,'A small bank with a big idea.','We think banking should feel like a well-made object — quiet, useful, honest.','About Meridian Bank.','[{"type":"rich","body":"Founded in 2019, Meridian is a member-owned bank headquartered in Boston. We believe your money should be legible and your bank should be answerable."}]'::jsonb),
('careers','Careers','Careers',9,'Build the bank you wish existed.','Engineering, design, ops, and compliance.','Careers at Meridian.','[{"type":"rich","body":"We hire for craft and care. See open roles at careers@meridianbank.example."}]'::jsonb),
('contact','Contact','Contact',10,'We answer.','Reach a real person, seven days a week.','Contact Meridian.','[{"type":"rich","body":"Email hello@meridianbank.example or call +1 (800) 555-0110."}]'::jsonb),
('legal/privacy','Privacy Policy',NULL,20,'Privacy Policy','How we handle your data.','Privacy at Meridian.','[{"type":"rich","body":"We collect only what we need to operate your accounts and comply with regulation. We never sell personal data."}]'::jsonb),
('legal/terms','Terms of Service',NULL,21,'Terms of Service','The rules that govern your relationship with us.','Terms at Meridian.','[{"type":"rich","body":"By using Meridian services you agree to these terms. See full document for details."}]'::jsonb);
UPDATE public.pages SET in_nav=false WHERE slug LIKE 'legal/%';

-- ============ BANKING ============
CREATE TABLE public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- checking|savings|mortgage|investment|loan
  nickname TEXT,
  account_number TEXT NOT NULL UNIQUE,
  routing_number TEXT NOT NULL DEFAULT '011000138',
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  available_balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  interest_rate NUMERIC(6,4) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.accounts TO authenticated;
GRANT ALL ON public.accounts TO service_role;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own accounts read" ON public.accounts FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "admin write accounts" ON public.accounts FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER accounts_updated BEFORE UPDATE ON public.accounts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(18,2) NOT NULL, -- negative = debit, positive = credit
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  merchant TEXT,
  category TEXT,
  type TEXT NOT NULL, -- transfer|deposit|withdrawal|bill|fee|interest|card|adjustment
  status TEXT NOT NULL DEFAULT 'completed', -- pending|completed|failed|reversed
  counterparty TEXT,
  reference TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tx read" ON public.transactions FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE INDEX ix_tx_account_date ON public.transactions(account_id, created_at DESC);

CREATE TABLE public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES public.accounts(id),
  to_account_id UUID REFERENCES public.accounts(id),
  to_external JSONB, -- {account_number,routing,name,bank}
  kind TEXT NOT NULL, -- same|intra|ach|wire
  amount NUMERIC(18,2) NOT NULL CHECK (amount>0),
  memo TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  receipt_number TEXT NOT NULL DEFAULT ('TX-'||upper(substr(gen_random_uuid()::text,1,10))),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.transfers TO authenticated;
GRANT ALL ON public.transfers TO service_role;
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own transfers" ON public.transfers FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Money-move RPC (atomic, RLS-safe via SECURITY DEFINER + explicit ownership check)
CREATE OR REPLACE FUNCTION public.execute_transfer(
  _from UUID, _to UUID, _external JSONB, _kind TEXT, _amount NUMERIC, _memo TEXT
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
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
  VALUES (_from,_uid,-_amount, COALESCE(_memo, CASE _kind WHEN 'same' THEN 'Transfer between accounts' WHEN 'intra' THEN 'Transfer to Meridian member' WHEN 'ach' THEN 'ACH transfer' WHEN 'wire' THEN 'Wire transfer' ELSE 'Transfer' END),'transfer','completed',_receipt,
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
END $$;
GRANT EXECUTE ON FUNCTION public.execute_transfer TO authenticated;

-- Payees & bill pay
CREATE TABLE public.payees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  account_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payees TO authenticated;
GRANT ALL ON public.payees TO service_role;
ALTER TABLE public.payees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own payees" ON public.payees FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.bill_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payee_id UUID NOT NULL REFERENCES public.payees(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES public.accounts(id),
  amount NUMERIC(18,2) NOT NULL CHECK(amount>0),
  scheduled_for DATE,
  status TEXT NOT NULL DEFAULT 'completed',
  memo TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.bill_payments TO authenticated;
GRANT ALL ON public.bill_payments TO service_role;
ALTER TABLE public.bill_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bills" ON public.bill_payments FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- Cards
CREATE TABLE public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  brand TEXT NOT NULL DEFAULT 'Meridian',
  network TEXT NOT NULL DEFAULT 'visa',
  card_type TEXT NOT NULL, -- debit|credit
  cardholder_name TEXT NOT NULL,
  last4 TEXT NOT NULL,
  pan_masked TEXT NOT NULL, -- "**** **** **** 1234"
  full_pan TEXT NOT NULL, -- simulated, plaintext OK for MVP demo
  exp_month INT NOT NULL,
  exp_year INT NOT NULL,
  cvv TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active|frozen|cancelled
  daily_limit NUMERIC(18,2) DEFAULT 5000,
  online_enabled BOOLEAN NOT NULL DEFAULT true,
  contactless_enabled BOOLEAN NOT NULL DEFAULT true,
  international_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.cards TO authenticated;
GRANT ALL ON public.cards TO service_role;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cards" ON public.cards FOR ALL TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Cheque deposits
CREATE TABLE public.cheque_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount NUMERIC(18,2) NOT NULL CHECK(amount>0),
  front_url TEXT,
  back_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending|approved|rejected
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ
);
GRANT SELECT, INSERT ON public.cheque_deposits TO authenticated;
GRANT UPDATE ON public.cheque_deposits TO authenticated;
GRANT ALL ON public.cheque_deposits TO service_role;
ALTER TABLE public.cheque_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cheque read" ON public.cheque_deposits FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "cheque insert self" ON public.cheque_deposits FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "cheque admin update" ON public.cheque_deposits FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- Statements
CREATE TABLE public.statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance NUMERIC(18,2) NOT NULL,
  closing_balance NUMERIC(18,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.statements TO authenticated;
GRANT ALL ON public.statements TO service_role;
ALTER TABLE public.statements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own statements" ON public.statements FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Alerts
CREATE TABLE public.alerts_prefs (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  large_txn_threshold NUMERIC(18,2) NOT NULL DEFAULT 500,
  low_balance_threshold NUMERIC(18,2) NOT NULL DEFAULT 100,
  login_alerts BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.alerts_prefs TO authenticated;
GRANT ALL ON public.alerts_prefs TO service_role;
ALTER TABLE public.alerts_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alert prefs" ON public.alerts_prefs FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.alerts FOR ALL TO authenticated USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

-- KYC
CREATE TABLE public.kyc_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  doc_front_url TEXT,
  doc_back_url TEXT,
  selfie_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewer_id UUID REFERENCES auth.users(id),
  notes TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at TIMESTAMPTZ
);
GRANT SELECT, INSERT ON public.kyc_submissions TO authenticated;
GRANT UPDATE ON public.kyc_submissions TO authenticated;
GRANT ALL ON public.kyc_submissions TO service_role;
ALTER TABLE public.kyc_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kyc read" ON public.kyc_submissions FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "kyc insert self" ON public.kyc_submissions FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "kyc admin update" ON public.kyc_submissions FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.risk_scores (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  score INT NOT NULL DEFAULT 30,
  factors JSONB NOT NULL DEFAULT '{}'::jsonb,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.risk_scores TO authenticated;
GRANT ALL ON public.risk_scores TO service_role;
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own risk read" ON public.risk_scores FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin'));

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'open', -- open|pending|resolved|closed
  priority TEXT NOT NULL DEFAULT 'normal',
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "insert own ticket" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id=auth.uid());
CREATE POLICY "update ticket" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE TRIGGER tickets_updated BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id),
  body TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.ticket_messages TO authenticated;
GRANT ALL ON public.ticket_messages TO service_role;
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ticket msg read" ON public.ticket_messages FOR SELECT TO authenticated USING (
  EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND (t.user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support')))
);
CREATE POLICY "ticket msg insert" ON public.ticket_messages FOR INSERT TO authenticated WITH CHECK (
  author_id=auth.uid() AND EXISTS(SELECT 1 FROM public.support_tickets t WHERE t.id=ticket_id AND (t.user_id=auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support')))
);
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- Audit log
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT,
  entity_id TEXT,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read audit" ON public.audit_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
