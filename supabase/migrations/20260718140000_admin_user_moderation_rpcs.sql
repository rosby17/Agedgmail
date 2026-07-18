-- ============================================================================
-- 2026-07-18 · RPCs de modération admin (suspend / is_admin)
--
-- Le durcissement (REVOKE UPDATE des colonnes sensibles de profiles) a comme
-- effet de bord de casser les actions admin "Bannir" et "Promouvoir admin"
-- du dashboard, qui faisaient un UPDATE direct sur is_suspended / is_admin.
-- On restaure ces actions via des RPC SECURITY DEFINER réservées à l'admin
-- (vérifié par la claim email du JWT, infalsifiable) — sans ré-ouvrir l'écriture
-- directe de ces colonnes aux utilisateurs normaux.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.admin_set_suspended(p_user_id uuid, p_suspended boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') <> 'rooseveltmkr@gmail.com' THEN
    RAISE EXCEPTION 'forbidden_admin_only';
  END IF;
  UPDATE public.profiles SET is_suspended = p_suspended WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'user_not_found'; END IF;
  RETURN p_suspended;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_suspended(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_suspended(uuid, boolean) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.admin_set_admin(p_user_id uuid, p_is_admin boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') <> 'rooseveltmkr@gmail.com' THEN
    RAISE EXCEPTION 'forbidden_admin_only';
  END IF;
  UPDATE public.profiles SET is_admin = p_is_admin WHERE id = p_user_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'user_not_found'; END IF;
  RETURN p_is_admin;
END $$;
REVOKE ALL ON FUNCTION public.admin_set_admin(uuid, boolean) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_set_admin(uuid, boolean) TO authenticated, service_role;
