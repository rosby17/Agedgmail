import { AlertTriangle, RefreshCcw, CheckCircle } from 'lucide-react';

const GeneralTab = ({ t, firstName, setFirstName, lastName, setLastName, displayName, setDisplayName, email, setEmail, errorMessage, loading, success, handleSave }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Informations du Profil</h3>
        <p className="text-xs text-gray-400 dark:text-slate-400">Gère tes informations personnelles et ta photo de profil.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-2">{t('firstName')}</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" placeholder="Ex: John" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-2">{t('lastName')}</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" placeholder="Ex: Doe" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-2">Username *</label>
          <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" />
          <p className="text-[10px] text-gray-400 dark:text-slate-500 italic mt-2">C'est votre nom d'utilisateur unique sur la plateforme.</p>
        </div>

        <div>
          <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest mb-2">Adresse E-mail *</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" />
        </div>

        {errorMessage && <div className="bg-red-50 dark:bg-red-950/10 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 dark:border-red-950/20 flex items-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}

        <button type="submit" disabled={loading} className={`px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 hover:bg-black dark:bg-primary dark:text-gray-900 dark:hover:bg-primaryDark text-white'}`}>
          {loading ? <RefreshCcw size={16} className="animate-spin" /> : success ? <><CheckCircle size={16} /> Modifié avec succès</> : t('saveBtn')}
        </button>
      </form>
    </div>
  );
};

export default GeneralTab;
