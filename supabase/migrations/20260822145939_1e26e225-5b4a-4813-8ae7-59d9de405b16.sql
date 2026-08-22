CREATE TABLE IF NOT EXISTS public.keepalive_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'unknown',
  ok boolean NOT NULL,
  db_status text NOT NULL,
  duration_ms integer NOT NULL DEFAULT 0,
  detail text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.keepalive_pings TO authenticated;
GRANT ALL ON public.keepalive_pings TO service_role;

ALTER TABLE public.keepalive_pings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins read keepalive pings" ON public.keepalive_pings;
CREATE POLICY "Admins read keepalive pings"
ON public.keepalive_pings
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS keepalive_pings_created_at_idx
  ON public.keepalive_pings (created_at DESC);