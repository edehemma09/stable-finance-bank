-- 1. Delivery provider fields
ALTER TABLE public.smtp_settings
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'resend',
  ADD COLUMN IF NOT EXISTS api_key text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS reply_to text;

INSERT INTO public.smtp_settings (id, host, port, secure, username, password, from_name, from_email, enabled)
VALUES (1, '', 465, true, '', '', 'Stable Finance Bank', '', false)
ON CONFLICT (id) DO NOTHING;

-- 2. Private config table (service role only; RLS on with no policies)
CREATE TABLE IF NOT EXISTS public.app_config (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.app_config TO service_role;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

INSERT INTO public.app_config(key, value) VALUES
  ('email_hook_url', 'https://project--ec8d1f8b-76ee-4aa5-9a52-53990867b8c9.lovable.app/api/public/email-hook'),
  ('email_hook_secret', replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', '')),
  ('app_url', 'https://project--ec8d1f8b-76ee-4aa5-9a52-53990867b8c9.lovable.app')
ON CONFLICT (key) DO NOTHING;

-- 3. Signup: checking + savings + welcome notification
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
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
END $function$;

-- 4. Automatic transactional email whenever a customer notification is created
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

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
    NULL; -- never block the notification because email dispatch failed
  END;
  RETURN NEW;
END $function$;

DROP TRIGGER IF EXISTS alerts_send_email ON public.alerts;
CREATE TRIGGER alerts_send_email AFTER INSERT ON public.alerts
FOR EACH ROW EXECUTE FUNCTION public.notify_alert_email();