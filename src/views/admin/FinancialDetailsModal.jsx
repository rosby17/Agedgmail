import React from 'react';
import { X } from 'lucide-react';

const FinancialDetailsModal = ({ type, onClose, orders = [], mappings = [], lang = 'fr' }) => {
  const isFr = lang === 'fr';

  const getSupplierName = (o) => {
    if (o.supplier) return o.supplier;
    if (o.delivery_data?.provider) return o.delivery_data.provider;
    if (o.product_name?.toLowerCase().includes('sms')) {
      if (o.product_name?.toLowerCase().includes('5sim')) return '5sim';
      if (o.product_name?.toLowerCase().includes('smscodes')) return 'smscodes';
      if (o.product_name?.toLowerCase().includes('pvapins')) return 'pvapins';
      return 'SMS Provider';
    }
    const m = mappings.find(map => map.product_id === o.product_id);
    if (m?.supplier) return m.supplier;
    return 'Stock Local / Autre';
  };

  const supplierGroups = React.useMemo(() => {
    const groups = {};
    orders.forEach(o => {
      const sup = getSupplierName(o);
      const cost = o.supplier_cost !== undefined && o.supplier_cost !== null && o.supplier_cost !== ''
        ? Number(o.supplier_cost)
        : Number(mappings.find(map => Number(map.product_id) === Number(o.product_id))?.supplier_rate || 0) * Number(o.quantity || 1);

      const rev = Number(o.total_price || 0);
      if (!groups[sup]) {
        groups[sup] = { name: sup, cost: 0, revenue: 0, count: 0 };
      }
      groups[sup].cost += cost;
      groups[sup].revenue += rev;
      groups[sup].count += 1;
    });
    return Object.values(groups).sort((a, b) => b.cost - a.cost);
  }, [orders, mappings]);

  const title = {
    revenue: isFr ? "Détails du Chiffre d'Affaires" : "Turnover / Revenue Details",
    cost: isFr ? "Détails du Coût d'Achat Fournisseur" : "Supplier Cost Details",
    profit: isFr ? "Détails du Bénéfice Net" : "Net Profit Details",
    deposit: isFr ? "Détails des Dépôts Clients" : "Client Deposits Details"
  }[type];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-gray-900 dark:text-white">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col border border-gray-100 dark:border-slate-800">
        <div className="bg-gray-900 p-8 text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="text-xl font-bold">{title}</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
              {isFr ? `Historique de ${orders.length} transactions` : `History of ${orders.length} transactions`}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all text-white"><X size={20} /></button>
        </div>

        <div className="p-8 overflow-y-auto flex-1 space-y-8 custom-scrollbar">
          {type === 'cost' && (
            <div className="space-y-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isFr ? "Répartition par Fournisseur" : "Breakdown by Supplier"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {supplierGroups.map(g => (
                  <div key={g.name} className="bg-gray-50 dark:bg-slate-800/45 border border-gray-100 dark:border-slate-800 p-5 rounded-2xl">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 capitalize">{g.name}</div>
                    <div className="text-2xl font-black font-mono text-gray-900 dark:text-white">${g.cost.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-1">
                      {g.count} {isFr ? 'achats effectués' : 'purchases made'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">{isFr ? "Transactions individuelles" : "Individual Transactions"}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800 pb-3">
                    <th className="pb-3 pr-4">Produit</th>
                    <th className="pb-3 pr-4">Client</th>
                    {type === 'cost' && <th className="pb-3 pr-4">Fournisseur</th>}
                    {type !== 'cost' && type !== 'deposit' && <th className="pb-3 pr-4 text-right">Prix Vente</th>}
                    {type !== 'revenue' && type !== 'deposit' && <th className="pb-3 pr-4 text-right">Coût Achat</th>}
                    {type === 'deposit' && <th className="pb-3 pr-4 text-right">Montant Déposé</th>}
                    {type === 'profit' && <th className="pb-3 pr-4 text-right">Bénéfice</th>}
                    {type === 'profit' && <th className="pb-3 pr-4 text-right">Marge (%)</th>}
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                  {orders.map(o => {
                    const cost = o.supplier_cost !== undefined && o.supplier_cost !== null && o.supplier_cost !== ''
                      ? Number(o.supplier_cost)
                      : Number(mappings.find(map => Number(map.product_id) === Number(o.product_id))?.supplier_rate || 0) * Number(o.quantity || 1);
                    const revenue = Number(o.total_price || 0);
                    const profit = revenue - cost;
                    const supplier = getSupplierName(o);

                    return (
                      <tr key={o.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-4 pr-4 font-bold text-gray-900 dark:text-white max-w-xs truncate">{o.product_name}</td>
                        <td className="py-4 pr-4 text-gray-500 dark:text-gray-400 font-mono text-xs">{o.buyer_email || 'API client'}</td>
                        {type === 'cost' && <td className="py-4 pr-4 capitalize text-gray-700 dark:text-gray-300 font-semibold">{supplier}</td>}
                        {type !== 'cost' && type !== 'deposit' && <td className="py-4 pr-4 text-right font-mono font-bold text-gray-900 dark:text-white">${revenue.toFixed(2)}</td>}
                        {type !== 'revenue' && type !== 'deposit' && <td className="py-4 pr-4 text-right font-mono text-red-500 dark:text-red-400 font-semibold">${cost.toFixed(2)}</td>}
                        {type === 'deposit' && <td className="py-4 pr-4 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">${revenue.toFixed(2)}</td>}
                        {type === 'profit' && (
                          <td className={`py-4 pr-4 text-right font-mono font-black ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                            ${profit.toFixed(2)}
                          </td>
                        )}
                        {type === 'profit' && (
                          <td className={`py-4 pr-4 text-right font-mono font-bold ${revenue > 0 ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`}>
                            {revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}%` : '—'}
                          </td>
                        )}
                        <td className="py-4 text-right text-gray-400 dark:text-gray-500 text-xs">{new Date(o.created_at).toLocaleDateString(isFr ? 'fr-FR' : 'en-US')}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-900/60 border-t border-gray-100 dark:border-slate-800 text-right shrink-0">
          <button onClick={onClose} className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl text-xs hover:bg-primary dark:hover:bg-primary dark:hover:text-white transition-all">{isFr ? 'Fermer' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetailsModal;
