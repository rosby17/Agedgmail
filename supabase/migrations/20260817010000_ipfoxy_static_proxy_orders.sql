CREATE TABLE IF NOT EXISTS public.static_proxy_purchase_requests (
  request_id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  area_id text NOT NULL,
  days integer NOT NULL CHECK (days IN (30, 90, 180, 360)),
  quantity integer NOT NULL CHECK (quantity BETWEEN 1 AND 50),
  supplier_cost numeric NOT NULL CHECK (supplier_cost > 0),
  sale_price numeric NOT NULL CHECK (sale_price > 0),
  supplier_order_id text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'provider_submitted', 'completed', 'failed', 'needs_review')),
  response jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS static_proxy_requests_user_idx
  ON public.static_proxy_purchase_requests(user_id, created_at DESC);

ALTER TABLE public.static_proxy_purchase_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.static_proxy_purchase_requests FROM authenticated, anon;
GRANT ALL ON public.static_proxy_purchase_requests TO service_role;
