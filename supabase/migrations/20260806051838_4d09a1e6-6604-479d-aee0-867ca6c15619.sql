INSERT INTO public.smtp_settings (id, host, port, secure, username, password, from_name, from_email, enabled)
VALUES (1, '', 465, true, '', '', 'Stable Finance Bank', '', false)
ON CONFLICT (id) DO NOTHING;