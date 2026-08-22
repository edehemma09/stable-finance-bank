CREATE OR REPLACE FUNCTION public.my_account_state()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$ SELECT status FROM public.profiles WHERE id = auth.uid() $$;

GRANT EXECUTE ON FUNCTION public.my_account_state() TO authenticated;

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
    _body  := 'Your Stable Finance Bank account is active again. You can sign in and use all banking services. If you did not expect this change, contact support immediately.';
  ELSIF _status = 'suspended' THEN
    _title := 'Your account has been suspended';
    _body  := 'Your Stable Finance Bank account has been suspended and sign-in is temporarily blocked. Please contact support for assistance.';
  ELSIF _status = 'banned' THEN
    _title := 'Your account has been banned';
    _body  := 'Your Stable Finance Bank account has been banned and you can no longer sign in. Please contact support if you believe this is a mistake.';
  ELSE
    _title := 'Your account has been closed';
    _body  := 'Your Stable Finance Bank account has been closed and access has been withdrawn. Please contact support with any questions about your balances or records.';
  END IF;

  INSERT INTO public.alerts(user_id, kind, title, body)
  VALUES (_user_id, 'account_status', _title, _body);

  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'set_user_status','profiles',_user_id::text, jsonb_build_object('status',_status));
END $function$;