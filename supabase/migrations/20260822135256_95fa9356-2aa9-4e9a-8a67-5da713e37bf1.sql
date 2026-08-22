CREATE TABLE public.error_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_code text NOT NULL UNIQUE,
  fingerprint text NOT NULL UNIQUE,
  severity text NOT NULL DEFAULT 'error' CHECK (severity IN ('info','warning','error','critical')),
  source text NOT NULL,
  route text,
  action text,
  message text NOT NULL,
  stack_summary text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurrence_count integer NOT NULL DEFAULT 1 CHECK (occurrence_count > 0),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','investigating','resolved','ignored')),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  resolved_by uuid,
  ai_status text NOT NULL DEFAULT 'not_analyzed' CHECK (ai_status IN ('not_analyzed','analyzing','complete','failed')),
  ai_cause text,
  ai_confidence text CHECK (ai_confidence IS NULL OR ai_confidence IN ('low','medium','high')),
  ai_recommendation text,
  ai_action_kind text CHECK (ai_action_kind IS NULL OR ai_action_kind IN ('automatic','manual','code_change')),
  ai_error text,
  analyzed_at timestamptz,
  action_approved_at timestamptz,
  action_approved_by uuid,
  action_executed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, UPDATE ON public.error_events TO authenticated;
GRANT ALL ON public.error_events TO service_role;

ALTER TABLE public.error_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins read error events"
ON public.error_events FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update error events"
ON public.error_events FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER error_events_updated
BEFORE UPDATE ON public.error_events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.record_error_event(
  _incident_code text,
  _fingerprint text,
  _severity text,
  _source text,
  _route text,
  _action text,
  _message text,
  _stack_summary text,
  _metadata jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
BEGIN
  IF current_user NOT IN ('service_role', 'postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'forbidden';
  END IF;

  INSERT INTO public.error_events (
    incident_code, fingerprint, severity, source, route, action,
    message, stack_summary, metadata
  ) VALUES (
    left(_incident_code, 24), left(_fingerprint, 128),
    CASE WHEN _severity IN ('info','warning','error','critical') THEN _severity ELSE 'error' END,
    left(_source, 80), left(_route, 300), left(_action, 120),
    left(_message, 1200), left(_stack_summary, 3000), COALESCE(_metadata, '{}'::jsonb)
  )
  ON CONFLICT (fingerprint) DO UPDATE SET
    occurrence_count = public.error_events.occurrence_count + 1,
    last_seen_at = now(),
    severity = EXCLUDED.severity,
    route = COALESCE(EXCLUDED.route, public.error_events.route),
    action = COALESCE(EXCLUDED.action, public.error_events.action),
    message = EXCLUDED.message,
    stack_summary = COALESCE(EXCLUDED.stack_summary, public.error_events.stack_summary),
    metadata = EXCLUDED.metadata,
    status = CASE WHEN public.error_events.status = 'resolved' THEN 'open' ELSE public.error_events.status END,
    resolved_at = CASE WHEN public.error_events.status = 'resolved' THEN NULL ELSE public.error_events.resolved_at END,
    resolved_by = CASE WHEN public.error_events.status = 'resolved' THEN NULL ELSE public.error_events.resolved_by END
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_error_event(text,text,text,text,text,text,text,text,jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_error_event(text,text,text,text,text,text,text,text,jsonb) TO service_role;

CREATE INDEX error_events_status_last_seen_idx ON public.error_events(status, last_seen_at DESC);
CREATE INDEX error_events_source_last_seen_idx ON public.error_events(source, last_seen_at DESC);