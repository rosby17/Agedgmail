import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCcw, AlertTriangle, Lock, Smartphone } from 'lucide-react';
import { supabase } from '../supabaseClient';

const PROVIDER_LABEL = {
  pvapins: 'PVAPins',
  smscodes: 'SMSCodes',
  fivesim: '5sim.net',
  onlinesim: 'Onlinesim.io',
};

const SmsSupplyAdmin = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyProvider, setBusyProvider] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sms-provider-health', { body: {} });
      if (error) throw error;
      setProviders(data?.providers || []);
    } catch (e) {
      setMsg(e.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHealth(); }, [fetchHealth]);

  const toggleProvider = async (provider, nextEnabled) => {
    setBusyProvider(provider);
    setMsg('');
    try {
      const { error } = await supabase.rpc('admin_set_sms_provider_enabled', {
        p_provider: provider,
        p_enabled: nextEnabled,
      });
      if (error) throw error;
      await fetchHealth();
    } catch (e) {
      setMsg(e.message || 'Erreur');
    } finally {
      setBusyProvider(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
          <Smartphone size={18} /> Supply SMS
        </h2>
        <button onClick={fetchHealth} disabled={loading}
          className="h-10 px-4 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs flex items-center gap-2 hover:bg-primary dark:hover:bg-primary transition-all disabled:opacity-50">
          <RefreshCcw size={13} className={loading ? 'animate-spin' : ''} /> Rafraîchir
        </button>
      </div>

      {msg && <div className="text-sm font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {providers.map(p => {
          const isOnlinesim = p.provider === 'onlinesim';
          const locked = isOnlinesim; // mapping pays non branché — voir provider-onlinesim.ts
          return (
            <div key={p.provider} className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-soft">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {PROVIDER_LABEL[p.provider] || p.provider}
              </div>

              <div className="text-3xl font-black font-mono text-gray-900 dark:text-white mb-1">
                {p.balance !== null && p.balance !== undefined
                  ? `${Number(p.balance).toFixed(2)} USD`
                  : p.exhausted ? 'Épuisé' : '—'}
              </div>

              <div className="text-xs text-gray-400 mb-1">
                {p.hasLiveBalance ? 'Solde en direct' : 'Pas d\'endpoint de solde — statut réactif uniquement'}
              </div>
              <div className="text-xs text-gray-400 mb-6">
                {p.last_checked_at ? `Dernière vérif: ${new Date(p.last_checked_at).toLocaleString()}` : 'Jamais vérifié'}
              </div>

              {p.exhausted && (
                <div className="mb-4 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Marqué épuisé{p.last_error ? ` — ${p.last_error}` : ''}
                </div>
              )}

              {locked && (
                <div className="mb-4 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                  <Lock size={14} /> Mapping pays non branché — activation verrouillée
                </div>
              )}

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <button
                  type="button"
                  disabled={locked || busyProvider === p.provider}
                  onClick={() => toggleProvider(p.provider, !p.enabled)}
                  className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${p.enabled ? 'bg-primary' : 'bg-gray-300 dark:bg-slate-700'}`}
                >
                  <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${p.enabled ? 'translate-x-5' : ''}`} />
                </button>
                <span className="text-sm font-bold text-gray-700 dark:text-slate-300">
                  {p.enabled ? 'Activé' : 'Désactivé'}
                </span>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmsSupplyAdmin;
