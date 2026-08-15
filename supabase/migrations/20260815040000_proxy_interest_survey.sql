-- ============================================================
-- Sondage d'intérêt Proxy — avant d'investir dans du stock (IPRoyal exige un
-- prépaiement minimum, cf. discussion), on mesure la demande réelle des
-- visiteurs. Vote ouvert (anonyme ou connecté), lecture réservée à l'admin.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.proxy_interest_votes (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid REFERENCES auth.users(id),
  choice     text NOT NULL CHECK (choice IN ('yes', 'maybe', 'no')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.proxy_interest_votes ENABLE ROW LEVEL SECURITY;

-- Vote ouvert à tous (anonyme inclus) — sondage volontairement léger, pas de
-- données sensibles au-delà d'un choix parmi 3.
CREATE POLICY proxy_interest_votes_insert ON public.proxy_interest_votes
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Lecture réservée service_role (résultats exposés via edge function admin-only).
GRANT INSERT ON public.proxy_interest_votes TO anon, authenticated;
GRANT ALL ON public.proxy_interest_votes TO service_role;
