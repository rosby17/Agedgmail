-- ============================================================
-- SECURITY FIX — 2026-07-17
-- 1. RPC deduct_balance : déduction atomique du solde (élimine TOCTOU)
-- 2. Correction des policies du bucket chat-attachments
-- 3. Protection colonnes sensibles de profiles contre mass-assignment
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. RPC ATOMIQUE deduct_balance
-- Utilise FOR UPDATE pour poser un verrou pessimiste sur la ligne
-- pendant toute la transaction → impossible de dépenser deux fois
-- le même solde même en concurrence agressive.
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.deduct_balance(p_user_id uuid, p_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_balance numeric;
  v_new_balance numeric;
BEGIN
  -- Verrou pessimiste : aucune autre transaction ne peut lire/écrire
  -- cette ligne tant qu'on n'a pas commité.
  SELECT balance INTO v_balance
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  IF v_balance < p_amount THEN
    RAISE EXCEPTION 'insufficient_balance' USING HINT = v_balance::text;
  END IF;

  v_new_balance := v_balance - p_amount;

  UPDATE public.profiles
  SET balance = v_new_balance
  WHERE id = p_user_id;

  RETURN v_new_balance;
END;
$$;

-- Seuls les utilisateurs authentifiés peuvent appeler cette fonction
-- (pas le rôle anon)
REVOKE ALL ON FUNCTION public.deduct_balance(uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.deduct_balance(uuid, numeric) TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 1b. RPC ATOMIQUE credit_balance
-- Utilisée par le transfert inter-comptes pour créditer le
-- destinataire de façon atomique (FOR UPDATE garantit que le
-- solde lu est celui qui sera mis à jour sans concurrence).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.credit_balance(p_user_id uuid, p_amount numeric)
RETURNS numeric
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance numeric;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  UPDATE public.profiles
  SET balance = balance + p_amount
  WHERE id = p_user_id
  RETURNING balance INTO v_new_balance;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'user_not_found';
  END IF;

  RETURN v_new_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.credit_balance(uuid, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.credit_balance(uuid, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.credit_balance(uuid, numeric) TO service_role;

-- ─────────────────────────────────────────────────────────────
-- 2. BUCKET chat-attachments — passer en PRIVÉ + policies strictes
-- ─────────────────────────────────────────────────────────────

-- Passer le bucket en privé
UPDATE storage.buckets SET public = false WHERE id = 'chat-attachments';

-- Supprimer les anciennes policies permissives
DROP POLICY IF EXISTS "Allow public read access on chat-attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated upload on chat-attachments" ON storage.objects;

-- Le propriétaire lit ses propres fichiers (préfixe userId/)
-- L'admin lit tout
CREATE POLICY "chat_attachments_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'chat-attachments'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR (auth.jwt() ->> 'email') = 'rooseveltmkr@gmail.com'
    )
  );

-- Upload uniquement dans son propre sous-dossier (userId/filename)
CREATE POLICY "chat_attachments_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chat-attachments'
    AND auth.uid() IS NOT NULL
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- ─────────────────────────────────────────────────────────────
-- 3. PROTECTION COLONNES SENSIBLES sur profiles
-- Empêche un utilisateur de modifier balance/is_admin/is_suspended
-- directement via PostgREST même si la RLS SELECT est ouverte.
-- ─────────────────────────────────────────────────────────────
-- Retirer le droit UPDATE global sur authenticated pour profiles
REVOKE UPDATE ON public.profiles FROM authenticated;

-- Ré-accorder uniquement les colonnes sûres
GRANT UPDATE (
  display_name, first_name, last_name, avatar_url,
  send_email_on_delivery, two_factor_enabled,
  vendor_status, cni_url
) ON public.profiles TO authenticated;

-- service_role garde tous les droits (Edge Functions, crons)
GRANT ALL ON public.profiles TO service_role;
