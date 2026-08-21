DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill users who signed up while the trigger was missing
DO $$
DECLARE u RECORD; _acct text; _sav text; _uname text; _name text;
BEGIN
  FOR u IN SELECT * FROM auth.users LOOP
    _uname := NULLIF(trim(COALESCE(u.raw_user_meta_data->>'username','')), '');
    IF _uname IS NULL THEN _uname := split_part(u.email,'@',1); END IF;
    IF EXISTS (SELECT 1 FROM public.profiles WHERE lower(username)=lower(_uname) AND id <> u.id) THEN
      _uname := _uname || substr(replace(gen_random_uuid()::text,'-',''),1,4);
    END IF;
    _name := COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', split_part(u.email,'@',1));

    INSERT INTO public.profiles (id, email, full_name, username)
    VALUES (u.id, u.email, _name, _uname) ON CONFLICT (id) DO NOTHING;
    INSERT INTO public.user_roles(user_id, role) VALUES (u.id, 'customer') ON CONFLICT DO NOTHING;
    INSERT INTO public.alerts_prefs(user_id) VALUES (u.id) ON CONFLICT DO NOTHING;

    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE user_id = u.id AND type='checking') THEN
      LOOP
        _acct := lpad((floor(random()*9000000000)::bigint + 1000000000)::text, 10, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_number = _acct);
      END LOOP;
      INSERT INTO public.accounts (user_id, type, nickname, account_number, balance, available_balance, interest_rate, status)
      VALUES (u.id, 'checking', 'Everyday Checking', _acct, 0, 0, 0.0010, 'active');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE user_id = u.id AND type='savings') THEN
      LOOP
        _sav := lpad((floor(random()*9000000000)::bigint + 1000000000)::text, 10, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.accounts WHERE account_number = _sav);
      END LOOP;
      INSERT INTO public.accounts (user_id, type, nickname, account_number, balance, available_balance, interest_rate, status)
      VALUES (u.id, 'savings', 'High-Yield Savings', _sav, 0, 0, 0.0435, 'active');
    END IF;
  END LOOP;
END $$;