ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS public_url text NOT NULL DEFAULT '';

UPDATE public.site_settings
SET public_url = 'https://www.stf-b.com'
WHERE id = 1 AND btrim(public_url) = '';

ALTER TABLE public.site_settings
DROP CONSTRAINT IF EXISTS site_settings_public_url_valid;

ALTER TABLE public.site_settings
ADD CONSTRAINT site_settings_public_url_valid
CHECK (public_url = '' OR public_url ~ '^https://[^/]+(?:/.*)?$');