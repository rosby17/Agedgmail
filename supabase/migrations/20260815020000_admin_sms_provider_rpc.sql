-- ============================================================
-- RPC admin_set_sms_provider_enabled — active/désactive manuellement un
-- fournisseur SMS. Même pattern que admin_set_admin/admin_set_suspended
-- (SECURITY DEFINER, vérifié par la claim email du JWT, infalsifiable) :
-- sms_provider_status est réservée au service_role, l'admin frontend n'a
-- pas d'accès direct en écriture, donc ce passage obligé par RPC.
--
-- Garde-fou onlinesim : son achat ignore encore le pays demandé par le
-- client (pas de mapping ISO -> ID pays onlinesim confirmé) — l'activer
-- enverrait le mauvais pays à un client. Bloqué ici aussi, pas seulement
-- côté UI, pour qu'un appel RPC direct ne puisse pas contourner le blocage.
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_set_sms_provider_enabled(p_provider text, p_enabled boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') <> 'rooseveltmkr@gmail.com' THEN
    RAISE EXCEPTION 'forbidden_admin_only';
  END IF;

  IF p_provider = 'onlinesim' AND p_enabled THEN
    RAISE EXCEPTION 'onlinesim_not_ready: country mapping not implemented yet';
  END IF;

  UPDATE public.sms_provider_status SET enabled = p_enabled WHERE provider = p_provider;
  IF NOT FOUND THEN
    INSERT INTO public.sms_provider_status (provider, enabled) VALUES (p_provider, p_enabled);
  END IF;

  RETURN p_enabled;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_sms_provider_enabled(text, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_sms_provider_enabled(text, boolean) TO authenticated, service_role;
