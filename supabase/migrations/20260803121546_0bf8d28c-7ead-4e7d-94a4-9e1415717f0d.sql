CREATE OR REPLACE FUNCTION public.resolve_transfer_recipient(_query text)
RETURNS TABLE(account_id uuid, display_name text, masked_account text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _uid uuid := auth.uid(); _q text := lower(trim(coalesce(_query,'')));
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'unauth'; END IF;
  IF _q = '' THEN RETURN; END IF;
  RETURN QUERY
  SELECT a.id,
         COALESCE(NULLIF(p.full_name,''), p.username, 'Meridian member') AS display_name,
         '••' || right(a.account_number, 4) AS masked_account
  FROM public.accounts a
  JOIN public.profiles p ON p.id = a.user_id
  WHERE a.user_id <> _uid
    AND a.status = 'active'
    AND p.status = 'active'
    AND (a.account_number = _q OR lower(coalesce(p.username,'')) = _q)
  ORDER BY a.created_at
  LIMIT 1;
END $$;

REVOKE ALL ON FUNCTION public.resolve_transfer_recipient(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.resolve_transfer_recipient(text) TO authenticated;

CREATE TABLE IF NOT EXISTS public.deleted_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  full_name text,
  username text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  deleted_by uuid,
  deleted_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, DELETE ON public.deleted_users TO authenticated;
GRANT ALL ON public.deleted_users TO service_role;
ALTER TABLE public.deleted_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins read deleted users" ON public.deleted_users;
CREATE POLICY "admins read deleted users" ON public.deleted_users FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
DROP POLICY IF EXISTS "admins purge deleted users" ON public.deleted_users;
CREATE POLICY "admins purge deleted users" ON public.deleted_users FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.admin_delete_user(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
END $$;
