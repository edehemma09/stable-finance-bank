
-- ============ SMTP / email settings ============
CREATE TABLE public.smtp_settings (
  id integer PRIMARY KEY DEFAULT 1,
  host text NOT NULL DEFAULT 'smtp.stf-b.com',
  port integer NOT NULL DEFAULT 465,
  secure boolean NOT NULL DEFAULT true,
  username text NOT NULL DEFAULT '',
  password text NOT NULL DEFAULT '',
  from_name text,
  from_email text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT smtp_singleton CHECK (id = 1)
);
GRANT SELECT, UPDATE ON public.smtp_settings TO authenticated;
GRANT ALL ON public.smtp_settings TO service_role;
ALTER TABLE public.smtp_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read smtp" ON public.smtp_settings FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admin update smtp" ON public.smtp_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER smtp_settings_touch BEFORE UPDATE ON public.smtp_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.smtp_settings (id, host, port, secure, username, password, from_name, from_email, enabled)
VALUES (1, 'smtp.stf-b.com', 465, true, 'Support@stf-b.com', 'TFc2ZgZ&]Fu', NULL, 'Support@stf-b.com', true);

-- ============ email log ============
CREATE TABLE public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  to_email text NOT NULL,
  subject text NOT NULL,
  template text,
  status text NOT NULL DEFAULT 'sent',
  error text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.email_log TO authenticated;
GRANT ALL ON public.email_log TO service_role;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin read email log" ON public.email_log FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ loans: applications ============
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS funding_account_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL;
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS decided_at timestamptz;
ALTER TABLE public.loans ADD COLUMN IF NOT EXISTS decision_notes text;

-- support ticket staff management
DROP POLICY IF EXISTS "staff update tickets" ON public.support_tickets;
CREATE POLICY "staff update tickets" ON public.support_tickets FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'))
  WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));

-- ============ helper: post a transaction + move balance ============
CREATE OR REPLACE FUNCTION public.internal_post(_account_id uuid, _user_id uuid, _amount numeric, _desc text, _type text, _ref text DEFAULT NULL)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _tx uuid;
BEGIN
  UPDATE public.accounts SET balance = balance + _amount, available_balance = available_balance + _amount WHERE id = _account_id;
  INSERT INTO public.transactions(account_id,user_id,amount,description,type,status,reference)
  VALUES (_account_id,_user_id,_amount,_desc,_type,'completed', COALESCE(_ref,'RF-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))))
  RETURNING id INTO _tx;
  RETURN _tx;
END $$;

-- ============ loan application ============
CREATE OR REPLACE FUNCTION public.apply_for_loan(_kind text, _nickname text, _principal numeric, _rate numeric, _term integer, _monthly numeric, _funding uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

CREATE OR REPLACE FUNCTION public.admin_decide_loan(_loan_id uuid, _approve boolean, _notes text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

CREATE OR REPLACE FUNCTION public.pay_loan(_loan_id uuid, _from uuid, _amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

-- ============ IRA contribution ============
CREATE OR REPLACE FUNCTION public.contribute_ira(_ira uuid, _from uuid, _amount numeric)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

-- ============ bill payment ============
CREATE OR REPLACE FUNCTION public.pay_bill(_payee_id uuid, _from uuid, _amount numeric, _memo text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

-- ============ KYC ============
CREATE OR REPLACE FUNCTION public.submit_kyc(_doc_type text, _front text, _back text, _selfie text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  INSERT INTO public.kyc_submissions(user_id,doc_type,doc_front_url,doc_back_url,selfie_url,status)
  VALUES (_uid,_doc_type,_front,_back,_selfie,'submitted') RETURNING id INTO _id;
  UPDATE public.profiles SET kyc_status='submitted' WHERE id=_uid;
  RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.admin_decide_kyc(_submission_id uuid, _status text, _notes text, _limit numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

-- ============ cheque deposit decision ============
CREATE OR REPLACE FUNCTION public.admin_decide_cheque(_id uuid, _approve boolean, _notes text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
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
END $$;

-- ============ delete customer ============
CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _user_id = _uid THEN RAISE EXCEPTION 'you cannot delete your own account'; END IF;
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
  VALUES (_uid,'delete_user','profiles',_user_id::text,'{}'::jsonb);
  DELETE FROM auth.users WHERE id=_user_id;
END $$;

GRANT EXECUTE ON FUNCTION public.apply_for_loan(text,text,numeric,numeric,integer,numeric,uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_loan(uuid,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pay_loan(uuid,uuid,numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.contribute_ira(uuid,uuid,numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pay_bill(uuid,uuid,numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.submit_kyc(text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_kyc(uuid,text,text,numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_decide_cheque(uuid,boolean,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.internal_post(uuid,uuid,numeric,text,text,text) FROM authenticated, anon;
