-- ============================================================================
-- SECURITY FIX 3 — 2026-07-18  ·  Durcissement de l'autorisation sur le solde
--
-- Ferme les 3 failles CRITIQUES/HAUTE prouvées par l'audit du 2026-07-18 :
--   #1  mass-assignment sur INSERT profiles (balance / is_admin auto-attribués)
--   #2  credit_balance() appelable directement par tout utilisateur (crédit infini)
--   #3  deduct_balance() appelable sur n'importe quel user (vidage de solde)
--
-- Principe : l'identité de l'acteur DOIT venir de auth.uid()/JWT côté serveur,
-- jamais d'un paramètre ou d'une colonne fournie par le client.
-- ============================================================================

-- ─────────────────────────────────────────────────────────────────────────
-- #1 — Bloquer le mass-assignment à la CRÉATION du profil
--     Le REVOKE UPDATE existant ne couvrait pas INSERT. On restreint les
--     colonnes insérables ET on force les valeurs sensibles via un trigger,
--     de sorte que la sécurité ne dépende pas de la seule liste de colonnes.
-- ─────────────────────────────────────────────────────────────────────────
REVOKE INSERT ON public.profiles FROM authenticated;
GRANT INSERT (id, email, display_name, first_name, last_name, avatar_url)
  ON public.profiles TO authenticated;

ALTER TABLE public.profiles ALTER COLUMN balance        SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN is_admin       SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN vendor_balance SET DEFAULT 0;
ALTER TABLE public.profiles ALTER COLUMN is_suspended   SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN vendor_status  SET DEFAULT 'none';

CREATE OR REPLACE FUNCTION public.enforce_profile_insert_defaults()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- La ligne appartient forcément à l'appelant authentifié.
  IF auth.uid() IS NOT NULL THEN
    NEW.id := auth.uid();
  END IF;
  -- Valeurs sensibles imposées, quoi que le client envoie.
  NEW.balance        := 0;
  NEW.vendor_balance := 0;
  NEW.is_admin       := false;
  NEW.is_suspended   := false;
  NEW.vendor_status  := 'none';
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_enforce_profile_insert_defaults ON public.profiles;
CREATE TRIGGER trg_enforce_profile_insert_defaults
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_insert_defaults();

-- Policy INSERT explicite (défense en profondeur : la ligne doit être la sienne)
DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- ─────────────────────────────────────────────────────────────────────────
-- #2 + #3 — Retirer l'accès CLIENT aux primitives de solde paramétrées.
--     service_role (Edge Functions, webhooks, crons, api-v2) conserve l'accès.
-- ─────────────────────────────────────────────────────────────────────────
REVOKE EXECUTE ON FUNCTION public.credit_balance(uuid, numeric) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) FROM authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- Remplacements sûrs : l'acteur vient de auth.uid(), pas d'un paramètre.
-- ─────────────────────────────────────────────────────────────────────────

-- (a) Dépenser SON PROPRE solde (checkout, achat rapide)
CREATE OR REPLACE FUNCTION public.spend_own_balance(p_amount numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid := auth.uid(); v_bal numeric;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_amount IS NULL OR p_amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;
  SELECT balance INTO v_bal FROM public.profiles WHERE id = v_uid FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'user_not_found'; END IF;
  IF v_bal < p_amount THEN RAISE EXCEPTION 'insufficient_balance' USING HINT = v_bal::text; END IF;
  UPDATE public.profiles SET balance = v_bal - p_amount WHERE id = v_uid;
  RETURN v_bal - p_amount;
END $$;
REVOKE ALL ON FUNCTION public.spend_own_balance(numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_own_balance(numeric) TO authenticated, service_role;

-- (b) Transfert de crédits : expéditeur = auth.uid(), débit+crédit ATOMIQUES
CREATE OR REPLACE FUNCTION public.transfer_credits(p_recipient_email text, p_amount numeric)
RETURNS TABLE (recipient_id uuid, recipient_name text, sender_new_balance numeric)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_sender uuid := auth.uid(); v_recipient uuid; v_name text; v_bal numeric; v_new numeric;
BEGIN
  IF v_sender IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF p_amount IS NULL OR p_amount < 0.01 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  SELECT id, display_name INTO v_recipient, v_name
  FROM public.profiles WHERE email = lower(trim(p_recipient_email));
  IF NOT FOUND THEN RAISE EXCEPTION 'recipient_not_found'; END IF;
  IF v_recipient = v_sender THEN RAISE EXCEPTION 'self_transfer'; END IF;

  -- Verrou pessimiste sur l'expéditeur (anti double-dépense concurrente)
  SELECT balance INTO v_bal FROM public.profiles WHERE id = v_sender FOR UPDATE;
  IF v_bal < p_amount THEN RAISE EXCEPTION 'insufficient_balance' USING HINT = v_bal::text; END IF;

  UPDATE public.profiles SET balance = v_bal - p_amount WHERE id = v_sender RETURNING balance INTO v_new;
  UPDATE public.profiles SET balance = balance + p_amount WHERE id = v_recipient;

  recipient_id := v_recipient; recipient_name := v_name; sender_new_balance := v_new;
  RETURN NEXT;
END $$;
REVOKE ALL ON FUNCTION public.transfer_credits(text, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.transfer_credits(text, numeric) TO authenticated, service_role;

-- (c) Ajustement de solde ADMIN (remboursement, crédit manuel) — réservé à
--     l'admin, vérifié par la claim email du JWT (infalsifiable), pas par la
--     colonne is_admin. p_delta peut être négatif (débit) ; plancher à 0.
CREATE OR REPLACE FUNCTION public.admin_adjust_balance(p_user_id uuid, p_delta numeric)
RETURNS numeric LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_bal numeric; v_new numeric;
BEGIN
  IF coalesce(auth.jwt() ->> 'email', '') <> 'rooseveltmkr@gmail.com' THEN
    RAISE EXCEPTION 'forbidden_admin_only';
  END IF;
  IF p_delta IS NULL OR p_delta = 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;
  SELECT balance INTO v_bal FROM public.profiles WHERE id = p_user_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'user_not_found'; END IF;
  v_new := greatest(v_bal + p_delta, 0);
  UPDATE public.profiles SET balance = v_new WHERE id = p_user_id;
  RETURN v_new;
END $$;
REVOKE ALL ON FUNCTION public.admin_adjust_balance(uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_adjust_balance(uuid, numeric) TO authenticated, service_role;

-- ─────────────────────────────────────────────────────────────────────────
-- #5 (bonus audit) — Fermer le spoofing de notifications.
--     Toutes les insertions légitimes se font côté serveur (service_role).
-- ─────────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "Server can insert notifications" ON public.notifications;
REVOKE INSERT ON public.notifications FROM authenticated, anon;
GRANT INSERT ON public.notifications TO service_role;
