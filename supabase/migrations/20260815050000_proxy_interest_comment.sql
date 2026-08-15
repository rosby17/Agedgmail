-- Champ commentaire optionnel sur le sondage d'intérêt Proxy — permet au
-- client de nuancer son choix (ex: "non, sauf si moins cher qu'IPRoyal").
ALTER TABLE public.proxy_interest_votes ADD COLUMN IF NOT EXISTS comment text;
