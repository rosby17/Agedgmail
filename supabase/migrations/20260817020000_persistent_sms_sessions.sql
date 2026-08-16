CREATE TABLE IF NOT EXISTS public.sms_pending_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id),
  buyer_email text, number text NOT NULL, security_id text NOT NULL,
  description text NOT NULL DEFAULT 'SMS Verification', sale_price numeric NOT NULL CHECK (sale_price > 0),
  supplier_cost numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','processing','completed','cancelled','expired','failed')),
  order_id uuid REFERENCES public.orders(id), error_message text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '25 minutes'),
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, number)
);
CREATE INDEX IF NOT EXISTS sms_pending_waiting_idx ON public.sms_pending_sessions(status, expires_at);
ALTER TABLE public.sms_pending_sessions ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sms_pending_sessions FROM authenticated, anon;
GRANT ALL ON public.sms_pending_sessions TO service_role;

SELECT cron.schedule('sms-poll-pending-every-minute', '* * * * *', $$
  SELECT net.http_post(
    url := 'https://ncjpbkfwhmsispiczzgl.supabase.co/functions/v1/sms-poll-pending',
    headers := jsonb_build_object('Authorization', 'Bearer ' || private.get_anon_key(), 'Content-Type', 'application/json'),
    body := '{}'::jsonb
  );
$$);
