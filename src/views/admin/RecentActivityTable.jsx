import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { cleanProductName } from '../../utils/helpers';

const RecentActivityTable = ({ allOrders }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = allOrders
    .filter(o => filter === 'all' || (o.status || 'pending') === filter)
    .filter(o => !search.trim() || (o.buyer_email || '').toLowerCase().includes(search.trim().toLowerCase()) || (o.product_name || '').toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);

  const statusBadge = (status) => {
    const s = status || 'pending';
    const map = {
      delivered: { label: 'Delivered', cls: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' },
      confirmed: { label: 'Confirmed', cls: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' },
      processing: { label: 'Processing', cls: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' },
      cancelled: { label: 'Cancelled', cls: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400' },
      pending: { label: 'Pending', cls: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400' },
    };
    const { label, cls } = map[s] || map.pending;
    return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${cls}`}>{label}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activité récente</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
            {['all', 'delivered', 'confirmed', 'processing', 'pending', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${filter === f ? 'bg-primary text-white dark:text-gray-900' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-900'}`}>
                {f === 'all' ? 'Toutes' : f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par email, produit…"
              className="pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 outline-none w-52"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              <th className="pb-4">Client</th><th className="pb-4">Produit</th><th className="pb-4">Date</th><th className="pb-4">Statut</th><th className="pb-4 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
            {filtered.map(o => (
              <tr key={o.id}>
                <td className="py-4 font-bold text-gray-900 dark:text-white">{o.buyer_email || '—'}</td>
                <td className="py-4 text-gray-500 dark:text-slate-400">{cleanProductName(o.product_name, 'fr')}</td>
                <td className="py-4 text-xs text-gray-400 dark:text-slate-500">{new Date(o.created_at).toLocaleString('fr-FR')}</td>
                <td className="py-4">{statusBadge(o.status)}</td>
                <td className="py-4 text-right font-mono font-black text-gray-900 dark:text-white">${Number(o.total_price || 0).toFixed(2)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500">Aucune commande trouvée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivityTable;
