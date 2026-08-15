import { AlertTriangle, CheckCircle, Eye, EyeOff, ShieldCheck, Shield, RefreshCcw } from 'lucide-react';

const SecurityTab = ({
  connMsg, hasGoogle, googleLoading, handleUnlinkGoogle, handleLinkGoogle, hasPasswordIdentity,
  showNewPw, setShowNewPw, newPassword, setNewPassword, showConfirmPw, setShowConfirmPw, confirmPassword, setConfirmPassword,
  pwError, pwSuccess, pwLoading, handleUpdatePassword,
  mfaStatus, mfaLoading, unenrollMfa, startMfaEnrollment, mfaQrCode, mfaCode, setMfaCode, verifyMfaEnrollment, setMfaStatus, mfaError,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Connexion & sécurité</h3>
        <p className="text-xs text-gray-400 dark:text-slate-400">Gère tes méthodes de connexion. Tu peux utiliser Google, un mot de passe, ou les deux.</p>
      </div>

      {connMsg.text && (
        <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${connMsg.type === 'error' ? 'bg-red-50 dark:bg-red-950/10 text-red-500 border-red-100 dark:border-red-950/20' : 'bg-green-50 dark:bg-green-950/10 text-green-600 border-green-100 dark:border-green-950/20'}`}>
          {connMsg.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />} {connMsg.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Google */}
        <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-gray-100 dark:border-slate-800"><img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /></div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Connexion Google</h4>
              <p className="text-[11px] font-medium mt-0.5">
                {hasGoogle
                  ? <span className="text-green-600 dark:text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Activée</span>
                  : <span className="text-gray-400 dark:text-slate-500">Non configurée</span>}
              </p>
            </div>
          </div>
          {hasGoogle ? (
            <button type="button" onClick={handleUnlinkGoogle} disabled={googleLoading} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all disabled:opacity-50">
              {googleLoading ? '…' : 'Désactiver'}
            </button>
          ) : (
            <button type="button" onClick={handleLinkGoogle} disabled={googleLoading} className="px-4 py-2 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primaryDark transition-all disabled:opacity-50">
              {googleLoading ? '…' : 'Activer'}
            </button>
          )}
        </div>

        {/* Mot de passe */}
        <div className="p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-200 dark:border-slate-800 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><ShieldCheck size={20} /></div>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">{hasPasswordIdentity ? 'Mot de passe' : 'Définir un mot de passe'}</h4>
              <p className="text-[11px] font-medium text-gray-400 dark:text-slate-500 mt-0.5">
                {hasPasswordIdentity
                  ? "Connexion par email et mot de passe activée"
                  : "Ajoute un mot de passe pour te connecter aussi par email"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={hasPasswordIdentity ? 'Nouveau mot de passe' : 'Mot de passe'} className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
              <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="relative">
              <input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer" className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
              <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {pwError && <div className="bg-red-50 dark:bg-red-950/10 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-950/20 flex items-center gap-2"><AlertTriangle size={14} /> {pwError}</div>}
          {pwSuccess && <div className="bg-green-50 dark:bg-green-950/10 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 dark:border-green-950/20 flex items-center gap-2"><CheckCircle size={14} /> {pwSuccess}</div>}
          <button type="button" onClick={handleUpdatePassword} disabled={pwLoading} className="px-5 py-2.5 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-xl font-bold text-xs hover:bg-primary/80 transition-all flex items-center gap-2 disabled:opacity-50">
            {pwLoading && <RefreshCcw size={12} className="animate-spin" />}
            {hasPasswordIdentity ? 'Mettre à jour' : 'Définir le mot de passe'}
          </button>
        </div>

        {/* 2FA */}
        <div className="flex flex-col p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-200 dark:border-slate-800 gap-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><Shield size={20} /></div>
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white text-sm">Double authentification (2FA)</h4>
                <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Authentificateur (TOTP)</p>
              </div>
            </div>

            {mfaStatus === 'enrolled' ? (
              <button type="button" onClick={unenrollMfa} disabled={mfaLoading} className="px-4 py-2 bg-red-50 dark:bg-red-950/10 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-100 dark:hover:bg-red-950/20 transition-all disabled:opacity-50">
                {mfaLoading ? '...' : 'Désactiver'}
              </button>
            ) : mfaStatus === 'unenrolled' ? (
              <button type="button" onClick={startMfaEnrollment} disabled={mfaLoading} className="px-4 py-2 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black dark:hover:bg-primaryDark transition-all disabled:opacity-50">
                {mfaLoading ? '...' : 'Activer'}
              </button>
            ) : mfaStatus === 'loading' ? (
              <div className="px-4 py-2"><RefreshCcw size={16} className="animate-spin text-gray-400" /></div>
            ) : null}
          </div>

          {mfaStatus === 'enrolling' && (
            <div className="border-t border-gray-200 dark:border-slate-800 pt-6 space-y-4">
              <h5 className="font-bold text-sm text-gray-900 dark:text-white">Configuration de l'authentificateur</h5>
              <p className="text-xs text-gray-500 dark:text-slate-400">1. Scannez ce QR Code avec votre application (Google Authenticator, Authy, etc.).</p>
              {/* QR code MFA : SVG fourni par Supabase Auth — sanitisé par précaution */}
              <div className="bg-white p-4 rounded-xl inline-block" dangerouslySetInnerHTML={{ __html: (mfaQrCode || '').replace(/<script[\s\S]*?<\/script>/gi, '').replace(/on\w+="[^"]*"/gi, '').replace(/on\w+='[^']*'/gi, '') }} />
              <p className="text-xs text-gray-500 dark:text-slate-400">2. Saisissez le code à 6 chiffres généré par l'application.</p>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="000000"
                  value={mfaCode}
                  onChange={e => setMfaCode(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 font-mono text-center font-bold text-gray-900 dark:text-white outline-none focus:border-primary"
                />
                <button type="button" onClick={verifyMfaEnrollment} disabled={mfaLoading || mfaCode.length < 6} className="px-4 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primaryDark transition-all disabled:opacity-50">
                  {mfaLoading ? <RefreshCcw size={16} className="animate-spin" /> : 'Valider'}
                </button>
              </div>
              <button type="button" onClick={() => setMfaStatus('unenrolled')} className="text-[10px] text-gray-400 uppercase font-black hover:text-gray-600 dark:hover:text-gray-300 transition-colors">Annuler</button>
            </div>
          )}
          {mfaError && <div className="text-xs text-red-500 font-bold flex items-center gap-2"><AlertTriangle size={14} /> {mfaError}</div>}
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;
