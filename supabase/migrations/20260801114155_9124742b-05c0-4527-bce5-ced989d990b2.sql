ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username text;
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_key ON public.profiles (lower(username));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $function$
DECLARE _acct text; _uname text;
BEGIN
  _uname := NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'username','')), '');
  IF _uname IS NULL THEN _uname := split_part(NEW.email,'@',1); END IF;
  IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(username)=lower(_uname)) THEN
    _uname := _uname || substr(replace(gen_random_uuid()::text,'-',''),1,4);
  END IF;

  INSERT INTO public.profiles (id, email, full_name, username)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)), _uname)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles(user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;

  LOOP
    _acct := lpad((floor(random()*9000000000)::bigint + 1000000000)::text, 10, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_number = _acct);
  END LOOP;

  INSERT INTO public.accounts (user_id, type, nickname, account_number, balance, available_balance, interest_rate, status)
  VALUES (NEW.id, 'checking', 'Everyday Checking', _acct, 0, 0, 0.0010, 'active');

  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Admin visibility / editing
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can view all accounts" ON public.accounts FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "Admins can update all accounts" ON public.accounts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can view all transactions" ON public.transactions FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));
CREATE POLICY "Admins can view all transfers" ON public.transfers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'support'));

-- Admin actions
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(_account_id uuid, _amount numeric, _memo text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
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
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_user_status(_user_id uuid, _status text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _status NOT IN ('active','suspended','banned','closed') THEN RAISE EXCEPTION 'invalid status'; END IF;
  UPDATE public.profiles SET status=_status WHERE id=_user_id;
  UPDATE public.accounts SET status = CASE WHEN _status='active' THEN 'active' ELSE 'frozen' END WHERE user_id=_user_id;
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'set_user_status','profiles',_user_id::text, jsonb_build_object('status',_status));
END $$;

CREATE OR REPLACE FUNCTION public.admin_set_transaction_limit(_user_id uuid, _limit numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF NOT public.has_role(_uid,'admin') THEN RAISE EXCEPTION 'forbidden'; END IF;
  IF _limit < 0 THEN RAISE EXCEPTION 'invalid limit'; END IF;
  UPDATE public.profiles SET transaction_limit=_limit WHERE id=_user_id;
  INSERT INTO public.audit_log(actor_id,action,entity,entity_id,details)
  VALUES (_uid,'set_transaction_limit','profiles',_user_id::text, jsonb_build_object('limit',_limit));
END $$;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION public.admin_adjust_balance(uuid,numeric,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_status(uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_transaction_limit(uuid,numeric) TO authenticated;