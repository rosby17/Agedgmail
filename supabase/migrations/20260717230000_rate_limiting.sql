-- ============================================================
-- SECURITY FIX 2 — 2026-07-17
-- Rate limiting via table SQL + RPC atomique
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. TABLE rate_limit_log
-- Chaque appel à une action limitée y insère une ligne.
-- Un index composite permet de compter en O(log n) les appels
-- récents d'un utilisateur sur une action donnée.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id         bigserial PRIMARY KEY,
  user_id    text        NOT NULL,   -- UUID user ou hash de clé API
  action     text        NOT NULL,   -- ex: 'sms_get_number', 'api_order'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Index pour les lookups de rate limit (user_id + action + created_at)
CREATE INDEX IF NOT EXISTS rate_limit_log_lookup
  ON public.rate_limit_log (user_id, action, created_at DESC);

-- RLS : personne ne peut lire/écrire directement (lecture via service_role seulement)
ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limit_log FROM authenticated, anon;
GRANT ALL ON public.rate_limit_log TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.rate_limit_log_id_seq TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 2. RPC check_rate_limit (appelée par les Edge Functions)
-- Retourne TRUE si l'action est autorisée (dans les limites),
-- FALSE si le quota est dépassé.
-- ATOMIQUE : INSERT + SELECT COUNT dans la même transaction.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_user_id        text,
  p_action         text,
  p_max_per_window integer,
  p_window_seconds integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window_start timestamptz;
  v_count        integer;
BEGIN
  v_window_start := now() - (p_window_seconds || ' seconds')::interval;

  -- Compter les appels récents
  SELECT COUNT(*) INTO v_count
  FROM public.rate_limit_log
  WHERE user_id = p_user_id
    AND action  = p_action
    AND created_at >= v_window_start;

  IF v_count >= p_max_per_window THEN
    RETURN false; -- quota dépassé
  END IF;

  -- Enregistrer cet appel
  INSERT INTO public.rate_limit_log (user_id, action)
  VALUES (p_user_id, p_action);

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(text, text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer, integer) TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 3. CRON DE NETTOYAGE — purge les entrées > 24h toutes les heures
-- Évite l'accumulation illimitée de la table rate_limit_log
-- ─────────────────────────────────────────────────────────────
SELECT cron.schedule(
  'rate-limit-log-cleanup-hourly',
  '0 * * * *',
  $$
  DELETE FROM public.rate_limit_log
  WHERE created_at < now() - interval '24 hours';
  $$
);
