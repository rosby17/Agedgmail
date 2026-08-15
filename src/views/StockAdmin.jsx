import React, { useState, useEffect, useMemo } from 'react';
import { Search, Plus, Database, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CREDENTIAL_FORMAT_EXAMPLE = 'email@gmail.com:motdepasse:emailrecovery@exemple.com:motdepasserecovery:app16caracteres:secret2fa32caracteres';

const StockAdmin = ({ products = [] }) => {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [stockCounts, setStockCounts] = useState({}); // { [product_id]: count }
  const [countsLoading, setCountsLoading] = useState(true);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { ok, message } | null

  const selectedProduct = products.find(p => p.id === selectedId) || null;

  // Charge le stock disponible de TOUS les produits d'un coup (une requête
  // groupée), pour afficher un badge sur chaque ligne de la liste sans
  // attendre une sélection — l'admin voit tout de suite où le stock manque.
  const fetchAllCounts = async () => {
    setCountsLoading(true);
    const { data } = await supabase
      .from('account_stock')
      .select('product_id')
      .eq('is_delivered', false);
    const counts = {};
    (data || []).forEach(row => { counts[row.product_id] = (counts[row.product_id] || 0) + 1; });
    setStockCounts(counts);
    setCountsLoading(false);
  };

  useEffect(() => { fetchAllCounts(); }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? products.filter(p => p.name.toLowerCase().includes(q)) : products;
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [products, query]);

  const handleAddStock = async () => {
    if (!selectedProduct) { setResult({ ok: false, message: 'Choisis un produit dans la liste à gauche.' }); return; }
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) { setResult({ ok: false, message: 'Colle au moins un identifiant (une ligne par compte).' }); return; }

    setSubmitting(true); setResult(null);
    const before = stockCounts[selectedProduct.id] || 0;

    try {
      const { error } = await supabase.from('account_stock').insert(
        lines.map(credentials => ({ product_id: selectedProduct.id, credentials, is_delivered: false }))
      );
      if (error) throw error;

      // Vérification réelle : on relit le compte en base plutôt que de faire
      // confiance à l'absence d'erreur — ça confirme que les lignes sont
      // vraiment là, pas juste que la requête n'a pas planté.
      const { count, error: verifyErr } = await supabase
        .from('account_stock')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', selectedProduct.id)
        .eq('is_delivered', false);
      if (verifyErr) throw verifyErr;

      const after = count ?? before;
      setStockCounts(prev => ({ ...prev, [selectedProduct.id]: after }));

      if (after >= before + lines.length) {
        setResult({ ok: true, message: `Vérifié en base : ${lines.length} compte(s) ajouté(s). Stock disponible pour « ${selectedProduct.name} » : ${after}.` });
        setText('');
      } else {
        setResult({ ok: false, message: `Anomalie : ${lines.length} ligne(s) envoyée(s) mais le stock n'a augmenté que de ${after - before}. Vérifie manuellement avant de refaire un essai.` });
      }
    } catch (err) {
      setResult({ ok: false, message: 'Erreur : ' + err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-soft">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
          <Database size={22} className="text-primary" /> Stock manuel
        </h2>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-2 leading-relaxed">
          Comptes déjà en main (récupérés, achetés en avance...). Dès qu'un client paie ce produit, le système livre
          en priorité depuis ce stock — il n'achète chez le fournisseur que si le stock est vide.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Liste complète des produits — toujours visible, recherche optionnelle */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Filtrer la liste..."
              className="w-full h-12 pl-11 pr-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent text-sm"
            />
          </div>

          <div className="border border-gray-100 dark:border-slate-800 rounded-2xl max-h-[480px] overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/60">
            {filteredProducts.length === 0 && (
              <p className="text-sm text-gray-400 p-6 text-center">Aucun produit ne correspond.</p>
            )}
            {filteredProducts.map(p => {
              const count = stockCounts[p.id] || 0;
              const isSelected = selectedId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => { setSelectedId(p.id); setResult(null); }}
                  className={`w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left transition-all ${
                    isSelected ? 'bg-primary/10 dark:bg-primary/15' : 'hover:bg-gray-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-bold truncate ${isSelected ? 'text-primary' : 'text-gray-900 dark:text-white'}`}>{p.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">#{p.id} · ${Number(p.price).toFixed(2)}</p>
                  </div>
                  <span className={`shrink-0 text-[10px] font-black px-2.5 py-1 rounded-full ${
                    countsLoading ? 'bg-gray-100 dark:bg-slate-800 text-gray-400' :
                    count > 0 ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-500/10 text-red-500'
                  }`}>
                    {countsLoading ? '…' : `${count} en stock`}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulaire d'ajout pour le produit sélectionné */}
        <div className="lg:col-span-3 space-y-6">
          {!selectedProduct ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center border border-dashed border-gray-200 dark:border-slate-800 rounded-2xl p-10">
              <Package size={32} className="text-gray-300 dark:text-slate-700 mb-3" />
              <p className="text-sm font-bold text-gray-400 dark:text-slate-500">Sélectionne un produit dans la liste à gauche</p>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 dark:bg-slate-800/40 rounded-2xl p-5">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Produit sélectionné</p>
                <p className="text-lg font-black text-gray-900 dark:text-white">{selectedProduct.name}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  Stock disponible actuellement : <span className="font-bold text-gray-900 dark:text-white">{stockCounts[selectedProduct.id] || 0}</span>
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                  Identifiants à ajouter (une ligne par compte)
                </label>
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  rows={7}
                  placeholder={CREDENTIAL_FORMAT_EXAMPLE}
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-mono outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                />
                <div className="mt-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 rounded-xl p-4">
                  <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1.5">Format attendu (exemple)</p>
                  <code className="block text-[11px] font-mono text-blue-700 dark:text-blue-300 break-all leading-relaxed">{CREDENTIAL_FORMAT_EXAMPLE}</code>
                  <p className="text-[10px] text-blue-500 dark:text-blue-400/80 mt-2 leading-relaxed">
                    Seuls email et mot de passe sont obligatoires (séparés par « : »). Email de récupération, mot de
                    passe de récupération, mot de passe d'application (16 caractères) et secret 2FA (32 caractères)
                    sont facultatifs et détectés automatiquement — pas besoin de respecter leur ordre exact.
                  </p>
                </div>
              </div>

              {result && (
                <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-bold ${
                  result.ok ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                }`}>
                  {result.ok ? <CheckCircle size={18} className="shrink-0 mt-0.5" /> : <AlertTriangle size={18} className="shrink-0 mt-0.5" />}
                  <span>{result.message}</span>
                </div>
              )}

              <button
                onClick={handleAddStock}
                disabled={submitting}
                className="h-12 px-6 rounded-xl bg-primary text-white dark:text-gray-900 font-bold text-sm flex items-center gap-2 hover:bg-primaryDark transition-all disabled:opacity-50"
              >
                <Plus size={16} /> {submitting ? 'Ajout et vérification…' : 'Ajouter au stock'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAdmin;
