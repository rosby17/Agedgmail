import React, { useState } from 'react';
import { Search, Eye, UserCheck, Ban, X } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { SkeletonRows } from '../../components/ui/Skeletons';

const ClientManagement = ({ allUsers, allOrders, fetchUsers, loading = false }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended
  const [sortBy, setSortBy] = useState('created'); // client | balance | orders | spent | created | status
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

  // Clic sur un en-tête de colonne : trie par cette colonne ; re-cliquer
  // inverse le sens. Défaut : plus récents d'abord.
  const toggleSort = (col) => {
    if (sortBy === col) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      // Défauts logiques par colonne : texte ascendant, chiffres descendants.
      setSortDir(col === 'client' ? 'asc' : 'desc');
    }
  };
  const [viewingClient, setViewingClient] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const isNewClient = (u) => {
    if (!u.created_at) return false;
    const createdTime = new Date(u.created_at).getTime();
    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    return createdTime > sevenDaysAgo;
  };

  // Stats par client, calculées une fois depuis toutes les commandes.
  const statsByUser = (() => {
    const map = new Map();
    allOrders.forEach(o => {
      const cur = map.get(o.user_id) || { orders: 0, spent: 0, deposited: 0, lastActivity: null };
      if (o.status === 'confirmed' || o.status === 'delivered') {
        if (o.product_id === 999) cur.deposited += o.total_price || 0;
        else { cur.orders += 1; cur.spent += o.total_price || 0; }
      }
      const t = new Date(o.created_at).getTime();
      if (!cur.lastActivity || t > cur.lastActivity) cur.lastActivity = t;
      map.set(o.user_id, cur);
    });
    return map;
  })();

  const filtered = allUsers
    .filter(u => statusFilter === 'all' || (statusFilter === 'suspended' ? u.is_suspended : !u.is_suspended))
    .filter(u => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (u.email || '').toLowerCase().includes(q) || (u.display_name || '').toLowerCase().includes(q);
    });

  const sorted = [...filtered].sort((a, b) => {
    const sa = statsByUser.get(a.id) || { spent: 0, orders: 0 };
    const sb = statsByUser.get(b.id) || { spent: 0, orders: 0 };
    let cmp = 0;
    switch (sortBy) {
      case 'client':
        cmp = (a.email || '').localeCompare(b.email || '');
        break;
      case 'balance':
        cmp = Number(a.balance || 0) - Number(b.balance || 0);
        break;
      case 'spent':
        cmp = sa.spent - sb.spent;
        break;
      case 'orders':
        cmp = sa.orders - sb.orders;
        break;
      case 'status':
        cmp = (a.is_suspended ? 1 : 0) - (b.is_suspended ? 1 : 0);
        break;
      default: // created (inscrit)
        cmp = new Date(a.created_at || 0) - new Date(b.created_at || 0);
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const activeCount = allUsers.filter(u => !u.is_suspended).length;
  const suspendedCount = allUsers.filter(u => u.is_suspended).length;

  const toggleBan = async (user) => {
    const next = !user.is_suspended;
    const ok = await window.showConfirm(
      "Confirmation",
      next
        ? `Bannir ${user.email} ? Il ne pourra plus acheter ni recharger tant qu'il est suspendu.`
        : `Réactiver ${user.email} ?`
    );
    if (!ok) return;
    setBusyId(user.id);
    const { error } = await supabase.rpc('admin_set_suspended', { p_user_id: user.id, p_suspended: next });
    if (error) await window.showAlert("Erreur", 'Erreur : ' + error.message);
    else await fetchUsers();
    setBusyId(null);
  };

  const creditBalance = async (user) => {
    const raw = await window.showPrompt(`Créditer le solde de ${user.email} de ($) :`, '10');
    if (raw == null) return;
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount === 0) return;
    setBusyId(user.id);
    const { error } = await supabase.rpc('admin_adjust_balance', { p_user_id: user.id, p_delta: amount });
    if (error) await window.showAlert("Erreur", 'Erreur : ' + error.message);
    else await fetchUsers();
    setBusyId(null);
  };

  const initial = (u) => (u.display_name || u.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-soft space-y-8">
      {/* En-tête + compteurs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des clients</h2>
          <div className="flex items-center gap-4 mt-2 text-xs font-bold">
            <span className="text-gray-400">{allUsers.length} au total</span>
            <span className="text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {activeCount} actifs</span>
            <span className="text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {suspendedCount} suspendus</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-1">
            {['all', 'active', 'suspended'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${statusFilter === f ? 'bg-gray-900 dark:bg-primary text-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Suspendus'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher email ou pseudo…"
              className="pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Table clients */}
      {loading ? (
        <div className="py-4"><SkeletonRows rows={6} cols={7} /></div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              {[
                { key: 'client', label: 'Client' },
                { key: 'balance', label: 'Solde' },
                { key: 'orders', label: 'Achats' },
                { key: 'spent', label: 'Dépensé' },
                { key: 'created', label: 'Inscrit' },
                { key: 'status', label: 'Statut' },
              ].map(col => (
                <th key={col.key} className="pb-4">
                  <button
                    onClick={() => toggleSort(col.key)}
                    className={`flex items-center gap-1 uppercase tracking-widest transition-colors hover:text-gray-700 dark:hover:text-white ${sortBy === col.key ? 'text-primary' : ''}`}
                    title={`Trier par ${col.label}`}
                  >
                    {col.label}
                    <span className="text-[8px]">{sortBy === col.key ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
                  </button>
                </th>
              ))}
              <th className="pb-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {sorted.map(user => {
              const s = statsByUser.get(user.id) || { orders: 0, spent: 0, deposited: 0 };
              return (
                <tr key={user.id} className={user.is_suspended ? 'opacity-60' : ''}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">{initial(user)}</div>
                      <div className="min-w-0 font-sans">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white truncate">{user.email}</span>
                          {isNewClient(user) && (
                            <span className="bg-blue-500/10 text-blue-500 dark:text-blue-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-blue-500/20 shrink-0">
                              Nouveau
                            </span>
                          )}
                          {user.is_admin && (
                            <span title="Indicatif seulement — n'accorde aucun accès réel (seul l'email admin configuré a un accès complet)" className="bg-primary/10 text-primary dark:text-primary text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{user.display_name || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4">
                    <button
                      onClick={() => creditBalance(user)}
                      disabled={busyId === user.id}
                      title="Cliquer pour modifier le solde"
                      className="font-mono font-black text-primary hover:underline decoration-dotted underline-offset-4 disabled:opacity-40 transition-all"
                    >
                      ${Number(user.balance || 0).toFixed(2)}
                    </button>
                  </td>
                  <td className="py-4 text-gray-600 dark:text-gray-300">{s.orders}</td>
                  <td className="py-4 font-mono text-gray-600 dark:text-gray-300">${s.spent.toFixed(2)}</td>
                  <td className="py-4 text-xs text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                  <td className="py-4">
                    {user.is_suspended
                      ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wide">Suspendu</span>
                      : <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">Actif</span>}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewingClient(user)} title="Voir l'historique" className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"><Eye size={14} /></button>
                      <button onClick={() => toggleBan(user)} disabled={busyId === user.id}
                        title={user.is_suspended ? 'Réactiver' : 'Bannir'}
                        className={`p-2 rounded-lg transition-all disabled:opacity-40 ${user.is_suspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                        {user.is_suspended ? <UserCheck size={14} /> : <Ban size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">Aucun client trouvé.</td></tr>}
          </tbody>
        </table>
      </div>
      )}

      {/* Modale détail client */}
      {viewingClient && (() => {
        const s = statsByUser.get(viewingClient.id) || { orders: 0, spent: 0, deposited: 0 };
        const clientOrders = allOrders.filter(o => o.user_id === viewingClient.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingClient(null)} />
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 space-y-6 animate-in fade-in zoom-in duration-300 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary font-black text-lg flex items-center justify-center">{initial(viewingClient)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingClient.email}</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">{viewingClient.display_name || '—'} · inscrit le {viewingClient.created_at ? new Date(viewingClient.created_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                  </div>
                </div>
                <button onClick={() => setViewingClient(null)} aria-label="Close" className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Solde</div><div className="text-lg font-black text-primary font-mono">${Number(viewingClient.balance || 0).toFixed(2)}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Achats</div><div className="text-lg font-black text-gray-900 dark:text-white">{s.orders}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dépensé</div><div className="text-lg font-black text-gray-900 dark:text-white font-mono">${s.spent.toFixed(2)}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rechargé</div><div className="text-lg font-black text-gray-900 dark:text-white font-mono">${s.deposited.toFixed(2)}</div></div>
              </div>

              {clientOrders.length === 0 ? (
                <p className="text-gray-400 text-sm italic py-8 text-center">Aucune activité pour ce client.</p>
              ) : (
                <div className="space-y-3">
                  {clientOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {o.product_id === 999 ? <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Recharge</span> : <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">Achat</span>}
                          {o.product_name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1">{new Date(o.created_at).toLocaleString('fr-FR')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-gray-900 dark:text-white font-mono">${o.total_price?.toFixed(2)}</div>
                        <div className={`text-[10px] font-bold uppercase mt-1 ${o.status === 'confirmed' || o.status === 'delivered' ? 'text-green-600' : o.status === 'cancelled' ? 'text-red-500' : o.status === 'processing' ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {o.status === 'delivered' ? 'Livré' : o.status === 'confirmed' ? 'Payé' : o.status === 'cancelled' ? 'Annulé' : o.status === 'processing' ? 'En cours' : 'En attente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default ClientManagement;
