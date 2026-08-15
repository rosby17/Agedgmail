-- ============================================================
-- Comptes proxy résidentiels (IPRoyal) — un sous-compte IPRoyal par client,
-- rechargé à chaque achat plutôt que recréé (mêmes identifiants de
-- passerelle réutilisés). RLS service-role uniquement, même pattern que
-- sms_provider_status : le client ne doit jamais pouvoir lire/écrire cette
-- table directement (identifiants de connexion proxy = secrets).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proxy_accounts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES auth.users(id),
  iproyal_subuser_id  text,
  gateway_host        text,
  gateway_port        integer,
  gateway_username    text,
  gateway_password    text,
  total_gb_purchased  numeric NOT NULL DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.proxy_accounts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.proxy_accounts FROM authenticated, anon;
GRANT ALL ON public.proxy_accounts TO service_role;
