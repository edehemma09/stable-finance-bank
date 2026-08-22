REVOKE ALL ON FUNCTION public.record_error_event(text, text, text, text, text, text, text, text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_error_event(text, text, text, text, text, text, text, text, jsonb) TO service_role;
REVOKE ALL ON TABLE public.error_events FROM anon;
GRANT SELECT, UPDATE ON TABLE public.error_events TO authenticated;
GRANT ALL ON TABLE public.error_events TO service_role;