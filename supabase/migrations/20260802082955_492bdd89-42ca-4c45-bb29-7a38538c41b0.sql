
CREATE POLICY "own docs insert" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id IN ('kyc','deposits') AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "own docs read" ON storage.objects FOR SELECT TO authenticated
USING (bucket_id IN ('kyc','deposits') AND ((storage.foldername(name))[1] = auth.uid()::text OR public.has_role(auth.uid(),'admin')));
