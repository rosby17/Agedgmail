import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Download, Globe2, KeyRound, Search, Server, ShoppingCart } from 'lucide-react';
import { proxiesFromOrders, proxyLine, proxyStatus } from '../utils/proxyOrders';

const statusMeta = {
  active: ['Actif', 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'],
  expiring: ['Expire bientôt', 'bg-amber-500/10 text-amber-500 border-amber-500/20'],
  expired: ['Expiré', 'bg-red-500/10 text-red-500 border-red-500/20'],
  unknown: ['À vérifier', 'bg-gray-500/10 text-gray-500 border-gray-500/20'],
};

export default function ProxyManagementView({ orders = [], session, sessionChecked, navigate }) {
  const [search, setSearch] = useState('');
  const [copied, setCopied] = useState('');
  const proxies = useMemo(() => proxiesFromOrders(orders), [orders]);
  const visible = proxies.filter(proxy => `${proxy.host} ${proxy.country} ${proxy.country_code} ${proxy.ip_version} ${proxy.type}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => { if (sessionChecked && !session) navigate('auth'); }, [sessionChecked, session, navigate]);
  if (sessionChecked && !session) return null;
  const copy = async proxy => { await navigator.clipboard.writeText(proxyLine(proxy)); setCopied(proxy.id); setTimeout(() => setCopied(''), 1400); };
  const exportAll = () => {
    const blob = new Blob([visible.map(proxyLine).join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob); const link = document.createElement('a');
    link.href = url; link.download = 'mes-proxies.txt'; link.click(); URL.revokeObjectURL(url);
  };

  return <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 w-full text-gray-900 dark:text-white">
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-8">
      <div><div className="text-primary text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2"><Server size={16} /> Gestion proxy</div><h1 className="text-3xl md:text-4xl font-black">Mes proxies</h1><p className="text-gray-500 dark:text-slate-400 mt-2">Consultez et exportez les identifiants de vos IP statiques.</p></div>
      <div className="flex gap-3"><button onClick={() => navigate('proxy')} className="h-11 px-4 rounded-xl bg-primary text-gray-950 font-black text-sm flex items-center gap-2"><ShoppingCart size={16} /> Acheter</button><button onClick={exportAll} disabled={!visible.length} className="h-11 px-4 rounded-xl border border-gray-200 dark:border-slate-700 font-bold text-sm flex items-center gap-2 disabled:opacity-40"><Download size={16} /> Exporter</button></div>
    </div>
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-soft">
      <div className="p-5 border-b border-gray-100 dark:border-slate-800"><div className="max-w-md h-11 px-4 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-2"><Search size={17} className="text-gray-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher une IP ou un pays…" className="w-full bg-transparent outline-none text-sm" /></div></div>
      {!visible.length ? <div className="py-20 text-center"><Globe2 size={38} className="mx-auto text-gray-300 mb-4" /><h2 className="font-black">Aucun proxy disponible</h2><p className="text-sm text-gray-500 mt-2">Vos proxies apparaîtront ici immédiatement après l’achat.</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-[10px] uppercase tracking-wider text-gray-400 bg-gray-50 dark:bg-slate-800/50"><tr><th className="p-4">Proxy</th><th className="p-4">Emplacement</th><th className="p-4">Protocole</th><th className="p-4">État</th><th className="p-4">Expiration</th><th className="p-4 text-right">Action</th></tr></thead><tbody className="divide-y divide-gray-100 dark:divide-slate-800">{visible.map(proxy => { const status = proxyStatus(proxy); return <tr key={`${proxy.orderId}-${proxy.id}`} className="hover:bg-gray-50/70 dark:hover:bg-slate-800/40"><td className="p-4"><div className="font-mono font-bold">{proxy.host}:{proxy.port}</div><div className="text-xs text-gray-400 mt-1 flex items-center gap-1"><KeyRound size={12} /> {proxy.user}</div></td><td className="p-4"><div className="font-bold">{proxy.country}</div><div className="text-xs text-gray-400">{proxy.ip_version}</div></td><td className="p-4 uppercase font-bold">{proxy.type}</td><td className="p-4"><span className={`px-2.5 py-1 rounded-full border text-xs font-bold ${statusMeta[status][1]}`}>{statusMeta[status][0]}</span></td><td className="p-4 font-medium">{proxy.expire_time ? new Date(Number(proxy.expire_time) * 1000).toLocaleDateString('fr-FR') : '—'}</td><td className="p-4"><button onClick={() => copy(proxy)} className="ml-auto h-9 px-3 rounded-lg border border-gray-200 dark:border-slate-700 font-bold text-xs flex items-center gap-2">{copied === proxy.id ? <Check size={14} className="text-primary" /> : <Copy size={14} />} {copied === proxy.id ? 'Copié' : 'Copier'}</button></td></tr>; })}</tbody></table></div>}
    </div>
  </main>;
}
