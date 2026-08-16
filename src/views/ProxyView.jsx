import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, CheckCircle2, ChevronDown, Copy, Globe2, Home, Loader2, Minus, Plus, Search, Server, ShieldCheck, Wallet } from 'lucide-react';
import { supabase } from '../supabaseClient';

const TYPES = {
  STATIC_DATACENTER: ['Datacenter IPv4', 'Rapide et économique', Server],
  STATIC_ISP: ['Résidentiel ISP statique', 'IP fixe issue d’un opérateur', Home],
  STATIC_ISP_PRO: ['Résidentiel ISP Pro', 'Qualité premium et stabilité', ShieldCheck],
};
const DURATIONS = [30, 90, 180, 360];

function FlagIcon({ code = '' }) {
  const normalized = code.toLowerCase();
  return <span className="w-8 h-6 shrink-0 rounded-md overflow-hidden border border-gray-200 dark:border-slate-600 bg-gray-100 dark:bg-slate-800 grid place-items-center">
    {normalized ? <img src={`https://flagcdn.com/${normalized}.svg`} alt={`Drapeau ${code.toUpperCase()}`} loading="lazy" className="w-full h-full object-cover" onError={event => { event.currentTarget.style.display = 'none'; event.currentTarget.nextElementSibling.style.display = 'block'; }} /> : null}
    <span className="hidden text-[9px] font-black text-gray-500">{code.toUpperCase() || '—'}</span>
  </span>;
}

function CountrySelect({ areas, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const root = useRef(null);
  const countries = [...new Map(areas.map(item => [item.country_code, item])).values()];
  const selected = countries.find(item => item.country_code === value);
  const visible = countries.filter(item => `${item.country} ${item.country_code}`.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const close = event => { if (!root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return <div ref={root} className="relative mb-6">
    <button type="button" onClick={() => setOpen(current => !current)} aria-expanded={open}
      className={`w-full min-h-14 px-4 rounded-2xl border bg-white dark:bg-slate-800 flex items-center gap-3 text-left transition ${open ? 'border-primary ring-4 ring-primary/10' : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'}`}>
      <FlagIcon code={selected?.country_code} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-black truncate">{selected?.country || 'Sélectionner un pays'}</span>
        {selected && <span className="block text-xs text-gray-500 dark:text-slate-400 truncate">{selected.country_code}</span>}
      </span>
      <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl shadow-gray-900/15 dark:shadow-black/40">
      <div className="p-3 border-b border-gray-100 dark:border-slate-800">
        <div className="h-11 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center gap-2 border border-transparent focus-within:border-primary/50">
          <Search size={16} className="text-gray-400" />
          <input autoFocus value={search} onChange={event => setSearch(event.target.value)} placeholder="Rechercher un pays…" className="w-full bg-transparent outline-none text-sm placeholder:text-gray-400" />
        </div>
      </div>
      <div className="max-h-72 overflow-y-auto p-2">
        {visible.map(item => <button type="button" key={item.country_code} onClick={() => { onChange(item.country_code); setOpen(false); setSearch(''); }}
          className={`w-full px-3 py-3 rounded-xl flex items-center gap-3 text-left transition ${item.country_code === value ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <FlagIcon code={item.country_code} />
          <span className="min-w-0 flex-1"><span className="block text-sm font-bold truncate">{item.country}</span><span className="block text-xs text-gray-500 dark:text-slate-400">{item.country_code}</span></span>
          {item.country_code === value && <Check size={17} className="shrink-0" />}
        </button>)}
        {!visible.length && <div className="py-8 text-center text-sm text-gray-400">Aucun pays trouvé</div>}
      </div>
    </div>}
  </div>;
}

const areaLabel = area => {
  if (area.ip_version === 'IPv6') return 'IPv6 Datacenter';
  if (/niche/i.test(area.region)) return 'IPv4 Promotionnelle';
  if (/zone [cd]/i.test(area.region)) return 'IPv4 Spécialisée';
  if (/residential/i.test(area.region)) return area.ip_type === 'STATIC_ISP_PRO' ? 'ISP Pro' : 'ISP Résidentielle';
  return 'IPv4 Standard';
};

export default function ProxyView({ navigate, session, profile, lang, fetchProfile }) {
  const fr = lang === 'fr';
  const [mode, setMode] = useState('static');
  const [areas, setAreas] = useState([]);
  const [enabled, setEnabled] = useState(false);
  const [type, setType] = useState('STATIC_DATACENTER');
  const [countryCode, setCountryCode] = useState('');
  const [areaId, setAreaId] = useState('');
  const [days, setDays] = useState(30);
  const [quantity, setQuantity] = useState(1);
  const [quote, setQuote] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planId, setPlanId] = useState('');
  const [rotatingEnabled, setRotatingEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quoting, setQuoting] = useState(false);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState('');
  const [delivery, setDelivery] = useState(null);
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [copied, setCopied] = useState(false);

  const typeList = useMemo(() => [...new Set(areas.map(a => a.ip_type))].filter(t => TYPES[t]), [areas]);
  const filteredAreas = useMemo(() => areas.filter(a => a.ip_type === type), [areas, type]);
  const countryAreas = useMemo(() => filteredAreas.filter(a => a.country_code === countryCode), [filteredAreas, countryCode]);
  const area = areas.find(a => a.id === areaId);
  const plan = plans.find(p => p.Id === planId) || plans[0];

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const [s, r] = await Promise.all([
      supabase.functions.invoke('proxy-static-catalog', { body: {} }),
      supabase.functions.invoke('proxy-get-prices', { body: {} }),
    ]);
    if (s.error || s.data?.error) setError(s.data?.error || s.error?.message);
    else { setAreas(s.data?.Areas || []); setEnabled(s.data?.Enabled === true); }
    setPlans(r.data?.Plans || []); setPlanId(current => current || r.data?.Plans?.[0]?.Id || '');
    setRotatingEnabled(r.data?.Enabled === true); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    if (!filteredAreas.some(a => a.country_code === countryCode)) setCountryCode(filteredAreas[0]?.country_code || '');
  }, [filteredAreas, countryCode]);
  useEffect(() => {
    if (!countryAreas.some(a => a.id === areaId)) setAreaId(countryAreas[0]?.id || '');
  }, [countryAreas, areaId]);
  useEffect(() => {
    if (mode !== 'static' || !areaId) { setQuote(null); return undefined; }
    let active = true;
    const timer = setTimeout(async () => {
      setQuoting(true); setError('');
      const { data, error: invokeError } = await supabase.functions.invoke('proxy-static-quote', { body: { areaId, days, quantity } });
      if (active) {
        if (invokeError || data?.error) { setQuote(null); setError(data?.error || invokeError?.message); }
        else setQuote(data);
        setQuoting(false); setRequestId(crypto.randomUUID());
      }
    }, 250);
    return () => { active = false; clearTimeout(timer); };
  }, [mode, areaId, days, quantity]);

  const buy = async () => {
    if (!session) return navigate('auth');
    const current = mode === 'static' ? quote : plan && { Quote: plan.Quote, TotalPrice: plan.TotalPrice };
    if (!current || buying) return;
    if (Number(profile?.balance || 0) < Number(current.TotalPrice)) return setError(fr ? 'Solde insuffisant. Rechargez votre compte.' : 'Insufficient balance.');
    setBuying(true); setError('');
    const fn = mode === 'static' ? 'proxy-static-purchase' : 'proxy-purchase';
    const { data, error: invokeError } = await supabase.functions.invoke(fn, { body: { quote: current.Quote, requestId } });
    if (invokeError || data?.error) setError(data?.error || invokeError?.message || "L’achat a échoué.");
    else { setDelivery(data); setRequestId(crypto.randomUUID()); if (fetchProfile) await fetchProfile(session.user.id); }
    setBuying(false);
  };
  const copy = async () => {
    if (!delivery?.credentials) return;
    await navigator.clipboard.writeText(delivery.credentials); setCopied(true); setTimeout(() => setCopied(false), 1500);
  };
  const total = mode === 'static' ? quote?.TotalPrice : plan?.TotalPrice;
  const canBuy = mode === 'static' ? enabled && quote : rotatingEnabled && plan;

  return <main className="max-w-7xl mx-auto px-5 md:px-8 py-10 w-full text-gray-900 dark:text-white">
    <div className="mb-8">
      <div className="inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest mb-3"><Globe2 size={16} /> Infrastructure proxy</div>
      <h1 className="text-3xl md:text-4xl font-black mb-3">{fr ? 'Acheter des proxies pour YouTube ou d’autres projets' : 'Buy proxies for YouTube or other projects'}</h1>
      <p className="text-gray-500 dark:text-slate-400">{fr ? 'Des IP privées livrées automatiquement, prêtes à être utilisées.' : 'Private IPs delivered automatically and ready to use.'}</p>
    </div>

    <div className="inline-flex rounded-2xl bg-gray-100 dark:bg-slate-800 p-1 mb-8">
      {[['static', 'Proxies statiques'], ['rotating', 'Résidentiel rotatif']].map(([value, label]) => <button key={value} onClick={() => { setMode(value); setDelivery(null); }} className={`px-5 py-3 rounded-xl text-sm font-black transition ${mode === value ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' : 'text-gray-500'}`}>{label}</button>)}
    </div>
    {error && <div className="mb-6 rounded-2xl border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-300 px-5 py-4 flex gap-3 text-sm"><AlertCircle size={18} className="shrink-0" /><span>{error}</span></div>}

    {delivery ? <section className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-500/30 rounded-[2rem] p-7 md:p-9 shadow-soft">
      <div className="flex gap-3 mb-6"><CheckCircle2 className="text-emerald-500" size={28} /><div><h2 className="font-black">Proxies livrés</h2><p className="text-xs text-gray-500">Ils sont aussi disponibles dans Mes commandes.</p></div></div>
      <pre className="bg-gray-950 text-emerald-300 rounded-2xl p-5 max-h-96 overflow-auto whitespace-pre-wrap text-xs leading-6">{delivery.credentials}</pre>
      <button onClick={copy} className="mt-5 h-11 px-5 rounded-xl bg-gray-900 text-white font-bold text-sm flex gap-2 items-center"><Copy size={16} />{copied ? 'Copié !' : 'Copier les identifiants'}</button>
    </section> : <div className="proxy-purchase-layout grid gap-7 items-start">
      <section className="space-y-7">
        {loading ? <div className="h-64 grid place-items-center bg-white dark:bg-slate-900 rounded-[2rem]"><Loader2 className="animate-spin text-primary" /></div> : mode === 'static' ? <>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-6">
            <h2 className="font-black mb-5">1. Choisissez votre type</h2>
            <div className="grid md:grid-cols-3 gap-3">{typeList.map(value => { const [title, subtitle, Icon] = TYPES[value]; return <button key={value} onClick={() => setType(value)} className={`p-5 rounded-2xl border text-left ${type === value ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-gray-200 dark:border-slate-700'}`}><Icon size={21} className="text-primary mb-3" /><div className="font-black text-sm">{title}</div><div className="text-xs text-gray-500 mt-1">{subtitle}</div></button>; })}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-6">
            <h2 className="font-black mb-5">2. Configurez votre commande</h2>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Pays</label>
            <CountrySelect areas={filteredAreas} value={countryCode} onChange={setCountryCode} />
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Type d’IP et zone</label>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
              {countryAreas.map(option => <button type="button" key={option.id} onClick={() => setAreaId(option.id)} className={`relative min-h-24 p-4 rounded-2xl border text-left transition ${areaId === option.id ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-gray-200 dark:border-slate-700 hover:border-primary/50'}`}>
                {areaId === option.id && <Check size={15} className="absolute right-3 top-3 text-primary" />}
                <span className="block text-sm font-black pr-5">{areaLabel(option)}</span>
                <span className="block text-xs text-gray-500 dark:text-slate-400 mt-1">{option.region} · {option.ip_version}</span>
                <span className="block text-sm font-black text-primary mt-2">${option.display_price}<span className="text-[10px] text-gray-400 font-bold"> / IP</span></span>
              </button>)}
            </div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Durée</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">{DURATIONS.map(value => <button key={value} onClick={() => setDays(value)} className={`h-12 rounded-xl border text-sm font-bold ${days === value ? 'border-primary bg-primary/5 text-primary' : 'border-gray-200 dark:border-slate-700'}`}>{value} jours</button>)}</div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-400 mb-2">Quantité</label>
            <div className="flex items-center gap-3"><button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-11 w-11 rounded-xl border border-gray-200 dark:border-slate-700 grid place-items-center"><Minus size={16} /></button><input type="number" min="1" max="50" value={quantity} onChange={e => setQuantity(Math.max(1, Math.min(50, Number(e.target.value) || 1)))} className="h-11 w-24 text-center rounded-xl border border-gray-200 dark:border-slate-700 bg-transparent font-black" /><button onClick={() => setQuantity(q => Math.min(50, q + 1))} className="h-11 w-11 rounded-xl border border-gray-200 dark:border-slate-700 grid place-items-center"><Plus size={16} /></button></div>
          </div>
        </> : <div className="grid sm:grid-cols-3 gap-4">{plans.map(p => <button key={p.Id} onClick={() => { setPlanId(p.Id); setRequestId(crypto.randomUUID()); }} className={`text-left rounded-[1.5rem] border p-6 ${plan?.Id === p.Id ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900'}`}><div className="text-xs font-black text-gray-400 uppercase mb-3">{p.Label}</div><div className="text-2xl font-black">${p.TotalPrice}</div><div className="text-xs text-gray-500 mt-1">${p.PricePerGb} / GB</div></button>)}</div>}
      </section>
      <aside className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-7 shadow-soft sticky top-24">
        <div className="flex justify-between mb-6"><span className="text-xs font-black uppercase tracking-wider text-gray-400">Votre solde</span><strong className="text-primary">${Number(profile?.balance || 0).toFixed(2)}</strong></div>
        <div className="border-t border-gray-100 dark:border-slate-800 pt-5 space-y-3 text-sm">
          {mode === 'static' ? <><div className="flex justify-between gap-3"><span className="text-gray-500">Produit</span><strong className="text-right">{TYPES[type]?.[0] || '—'}</strong></div><div className="flex justify-between"><span className="text-gray-500">Région</span><strong>{area?.country_code || '—'}</strong></div><div className="flex justify-between"><span className="text-gray-500">Forfait</span><strong>{quantity} IP × {days} jours</strong></div></> : <div className="flex justify-between"><span className="text-gray-500">Forfait</span><strong>{plan?.Label || '—'}</strong></div>}
          <div className="flex justify-between text-lg pt-2"><strong>Total</strong><strong>{quoting && mode === 'static' ? <Loader2 size={17} className="animate-spin" /> : `$${total || '0.00'}`}</strong></div>
        </div>
        {!canBuy && !loading && <div className="mt-5 text-xs rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 p-3">{mode === 'static' ? 'La vente sera activée dès que le compte fournisseur sera approvisionné.' : 'Offre rotative en attente de validation fournisseur.'}</div>}
        <button onClick={buy} disabled={!canBuy || buying || quoting} className="w-full h-12 mt-6 rounded-2xl bg-primary text-gray-950 font-black text-sm flex items-center justify-center gap-2 hover:bg-primaryDark disabled:opacity-50">{buying ? <Loader2 size={18} className="animate-spin" /> : <Wallet size={18} />}{session ? 'Acheter maintenant' : 'Se connecter pour acheter'}</button>
        <p className="text-[10px] text-gray-400 mt-4 text-center">Prix final garanti par le devis serveur. Livraison automatique après confirmation IPFoxy.</p>
      </aside>
    </div>}
  </main>;
}
