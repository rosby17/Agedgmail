-- ============================================================
-- Multi-fournisseur SMS — suivi d'épuisement des fournisseurs
-- ============================================================
-- Les fournisseurs historiques (pvapins/smscodes) ont du stock/crédit
-- déjà payé, à consommer en priorité. sms-get-number marque un fournisseur
-- "exhausted" dès qu'il détecte une erreur de type "plus de crédit" ; les
-- nouveaux fournisseurs (fivesim/onlinesim) prennent alors le relais.
-- sms-get-prices lit cette table pour ordonner la liste renvoyée au client
-- (fournisseurs non épuisés d'abord). Table service-role only : le nom réel
-- du fournisseur ne doit jamais atteindre le client (cf. sms-pricing.ts).

CREATE TABLE IF NOT EXISTS public.sms_provider_status (
  provider        text PRIMARY KEY,
  exhausted       boolean     NOT NULL DEFAULT false,
  cached_balance  numeric,
  last_checked_at timestamptz NOT NULL DEFAULT now(),
  last_error      text
);

ALTER TABLE public.sms_provider_status ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.sms_provider_status FROM authenticated, anon;
GRANT ALL ON public.sms_provider_status TO service_role;
