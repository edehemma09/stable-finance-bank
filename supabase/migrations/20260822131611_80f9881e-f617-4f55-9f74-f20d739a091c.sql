REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.internal_post(uuid, uuid, numeric, text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.internal_post(uuid, uuid, numeric, text, text, text) TO service_role;

CREATE POLICY "Service role manages app config"
ON public.app_config
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);