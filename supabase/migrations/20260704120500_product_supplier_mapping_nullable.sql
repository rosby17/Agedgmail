-- Rend la colonne ytseller_product_id optionnelle (nullable) dans la table
-- product_supplier_mapping pour supporter des fournisseurs alternatifs (ex. SMMSHIBA)
-- qui utilisent les colonnes génériques supplier_product_id et supplier_rate.
alter table public.product_supplier_mapping alter column ytseller_product_id drop not null;
