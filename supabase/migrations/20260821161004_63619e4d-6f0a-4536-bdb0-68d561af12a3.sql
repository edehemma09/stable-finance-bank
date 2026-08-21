CREATE POLICY "admin insert smtp" ON public.smtp_settings FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
GRANT SELECT, INSERT, UPDATE ON public.smtp_settings TO authenticated;
GRANT ALL ON public.smtp_settings TO service_role;