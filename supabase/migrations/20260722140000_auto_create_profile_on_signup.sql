-- ============================================================
-- 2026-07-22 · Création AUTOMATIQUE du profil à l'inscription
--
-- Problème : le profil client était créé côté navigateur, à la 1re connexion
-- réussie (App.jsx). Conséquence : un utilisateur qui s'inscrit mais ne
-- confirme pas son email / ne se connecte jamais (ou dont l'insert client
-- échoue) existe dans auth.users mais N'A AUCUNE ligne dans public.profiles
-- → invisible dans l'admin (Commandes, Gestion des clients).
--
-- Correctif : un trigger sur auth.users crée le profil dès la création du
-- compte, quel que soit le parcours (email non confirmé, OAuth, etc.).
-- Le trigger BEFORE INSERT existant (enforce_profile_insert_defaults) force
-- balance=0 / is_admin=false ; ici auth.uid() est NULL (contexte serveur) donc
-- il ne réécrit pas l'id. On complète par un backfill des inscrits existants.
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, first_name, last_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NULLIF(NEW.raw_user_meta_data->>'display_name', ''),
      NULLIF(NEW.raw_user_meta_data->>'full_name', ''),
      split_part(COALESCE(NEW.email, ''), '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'given_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', NEW.raw_user_meta_data->>'family_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────────────────────────────────
-- Backfill : créer les profils manquants pour TOUS les inscrits existants
-- (ceux qui s'étaient inscrits avant ce trigger et qui n'apparaissaient pas).
-- ─────────────────────────────────────────────────────────────────────────
INSERT INTO public.profiles (id, email, display_name, first_name, last_name, avatar_url)
SELECT
  u.id,
  u.email,
  COALESCE(
    NULLIF(u.raw_user_meta_data->>'display_name', ''),
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    split_part(COALESCE(u.email, ''), '@', 1)
  ),
  COALESCE(u.raw_user_meta_data->>'first_name', u.raw_user_meta_data->>'given_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', u.raw_user_meta_data->>'family_name', ''),
  COALESCE(u.raw_user_meta_data->>'avatar_url', '')
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;
