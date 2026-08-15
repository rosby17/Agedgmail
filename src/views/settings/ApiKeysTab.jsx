import { Hash, RefreshCcw, CheckCircle, Copy, Trash2, Plus } from 'lucide-react';

const KeyForm = ({ newKeyName, setNewKeyName, newKeyDuration, setNewKeyDuration, generateApiKey, loadingKey, setShowKeyForm }) => (
  <div className="bg-gray-100/50 dark:bg-slate-900/50 p-4 rounded-xl border border-gray-200 dark:border-slate-700 space-y-4">
    <h5 className="font-bold text-sm text-gray-900 dark:text-white">Créer une nouvelle clé API</h5>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Nom de la clé</label>
        <input type="text" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary" placeholder="Ex: Script d'achat" />
      </div>
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Durée de validité</label>
        <select value={newKeyDuration} onChange={e => setNewKeyDuration(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary">
          <option value="lifetime">À vie (Aucune expiration)</option>
          <option value="3m">3 mois</option>
          <option value="6m">6 mois</option>
          <option value="1y">1 an</option>
        </select>
      </div>
    </div>
    <div className="flex items-center gap-3 pt-2">
      <button onClick={generateApiKey} disabled={loadingKey || !newKeyName.trim()} className="px-5 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primaryDark transition-all text-xs disabled:opacity-50">
        {loadingKey ? 'Création...' : 'Générer la clé'}
      </button>
      <button onClick={() => setShowKeyForm(false)} className="px-4 py-2.5 text-gray-500 font-bold hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-xs">Annuler</button>
    </div>
  </div>
);

const ApiKeysTab = ({
  loadingKey, apiKeys, revealedKeyIds, handleCopyKey, copied, handleDeleteKey,
  showKeyForm, setShowKeyForm, newKeyName, setNewKeyName, newKeyDuration, setNewKeyDuration, generateApiKey, navigate,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">API</h3>
        <p className="text-xs text-gray-400 dark:text-slate-400">Intègre notre catalogue d'e-mails et nos numéros SMS dans tes propres projets grâce à ta clé API unique.</p>
      </div>

      <div className="p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-200 dark:border-slate-800 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><Hash size={20} /></div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-sm">Clé API active</h4>
            <p className="text-xs text-gray-400 dark:text-slate-500">Ne partage jamais cette clé API avec d'autres personnes.</p>
          </div>
        </div>

        {loadingKey && apiKeys.length === 0 ? (
          <div className="py-2"><RefreshCcw size={16} className="animate-spin text-primary" /></div>
        ) : apiKeys.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {apiKeys.map(k => {
                const isRevealed = revealedKeyIds.includes(k.id);
                const displayKey = isRevealed ? k.api_key : k.api_key.substring(0, 5) + '*******************' + k.api_key.substring(k.api_key.length - 4);
                return (
                  <div key={k.id} className="flex gap-2 items-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-2 pr-4">
                    <div className="px-3 py-1 flex-grow overflow-hidden">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-xs text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-[200px]">{k.name || 'Clé API'}</span>
                        {k.expires_at ? (
                          new Date(k.expires_at) < new Date() ? (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 font-bold uppercase tracking-wider">Expirée</span>
                          ) : (
                            <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-bold tracking-wider">
                              Expire le {new Date(k.expires_at).toLocaleDateString()}
                            </span>
                          )
                        ) : (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold uppercase tracking-wider">À vie</span>
                        )}
                      </div>
                      <div className="font-mono text-xs text-gray-700 dark:text-slate-300 truncate">
                        {displayKey}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyKey(k)}
                      className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300 text-[10px] font-bold transition-all flex items-center gap-1.5 shrink-0"
                    >
                      {copied === k.id ? <><CheckCircle size={12} className="text-green-500" /> Copié</> : <><Copy size={12} /> Copier</>}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteKey(k.id)}
                      className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/20 hover:dark:bg-red-950/40 text-red-500 flex items-center justify-center transition-all shrink-0"
                      title="Supprimer la clé"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
            {showKeyForm ? (
              <KeyForm {...{ newKeyName, setNewKeyName, newKeyDuration, setNewKeyDuration, generateApiKey, loadingKey, setShowKeyForm }} />
            ) : (
              <button
                type="button"
                onClick={() => setShowKeyForm(true)}
                className="px-6 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold transition-all hover:bg-black dark:hover:bg-gray-100 flex items-center gap-2 self-start"
              >
                <Plus size={14} /> Nouvelle clé API
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 dark:text-slate-400">Aucune clé API n'a été créée pour ton compte pour le moment.</p>

            {showKeyForm ? (
              <KeyForm {...{ newKeyName, setNewKeyName, newKeyDuration, setNewKeyDuration, generateApiKey, loadingKey, setShowKeyForm }} />
            ) : (
              <button
                type="button"
                onClick={() => setShowKeyForm(true)}
                className="px-6 py-3 bg-gray-900 text-white dark:bg-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-black dark:hover:bg-gray-100 transition-all flex items-center gap-2"
              >
                <Plus size={14} /> Générer une clé API
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-6 bg-blue-50/30 dark:bg-blue-950/10 rounded-[1.5rem] border border-blue-100/60 dark:border-blue-900/20">
        <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Besoin d'aide pour l'intégration ?</h5>
        <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
          Consulte notre onglet <button type="button" onClick={() => navigate('api')} className="text-primary font-black hover:underline">API</button> pour retrouver la documentation technique, la liste des commandes et les méthodes de requêtes disponibles pour tes scripts.
        </p>
      </div>
    </div>
  );
};

export default ApiKeysTab;
