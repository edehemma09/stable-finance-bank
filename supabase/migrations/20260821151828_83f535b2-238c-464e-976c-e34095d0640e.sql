REVOKE ALL ON FUNCTION public.notify_alert_email() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.internal_post(uuid, uuid, numeric, text, text, text) FROM PUBLIC, anon, authenticated;