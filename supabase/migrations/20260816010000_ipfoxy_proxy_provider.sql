-- Generic provider metadata + durable idempotency for proxy provisioning.
ALTER TABLE public.proxy_accounts
  ADD COLUMN IF NOT EXISTS provider text NOT NULL DEFAULT 'iproyal',
  ADD COLUMN IF NOT EXISTS provider_account_id text;

UPDATE public.proxy_accounts
SET provider_account_id = iproyal_subuser_id
WHERE provider_account_id IS NULL AND iproyal_subuser_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.proxy_purchase_requests (
  request_id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  provider text NOT NULL,
  gb numeric NOT NULL CHECK (gb > 0),
  price numeric NOT NULL CHECK (price > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  response jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS proxy_purchase_requests_user_idx
  ON public.proxy_purchase_requests(user_id, created_at DESC);

ALTER TABLE public.proxy_purchase_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.proxy_purchase_requests FROM authenticated, anon;
GRANT ALL ON public.proxy_purchase_requests TO service_role;
