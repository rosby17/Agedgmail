import { friendlyAuthError } from '../utils/helpers';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu, Key } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SettingsTab = ({ profile, session, onUpdate, lang, t, navigate }) => {
  const [activeTab, setActiveTab] = useState('general'); // general | security | api
  
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [connMsg, setConnMsg] = useState({ type: "", text: "" });

  const [mfaStatus, setMfaStatus] = useState('loading'); // 'loading' | 'unenrolled' | 'enrolling' | 'enrolled'
  const [mfaFactorId, setMfaFactorId] = useState(null);
  const [mfaQrCode, setMfaQrCode] = useState(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaError, setMfaError] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);

  const [apiKeys, setApiKeys] = useState([]);
  const [revealedKeyIds, setRevealedKeyIds] = useState([]);
  const [loadingKey, setLoadingKey] = useState(false);
  const [copied, setCopied] = useState(null); // id of the copied key
  const [showKeyForm, setShowKeyForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('Ma clé API');
  const [newKeyDuration, setNewKeyDuration] = useState('lifetime');

  const identities = session?.user?.identities || [];
  const hasGoogle = identities.some((i) => i.provider === 'google');
  const hasPasswordIdentity = identities.some((i) => i.provider === 'email');

  const fetchApiKey = async () => {
    if (!session?.user?.id) return;
    setLoadingKey(true);
    const { data } = await supabase
      .from('api_keys')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });
    if (data) {
      setApiKeys(data);
    }
    setLoadingKey(false);
  };

  useEffect(() => {
    fetchApiKey();
    checkMfaStatus();
  }, [session]);

  const checkMfaStatus = async () => {
    setMfaStatus('loading');
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      setMfaError(error.message);
      setMfaStatus('unenrolled');
      return;
    }
    const totpFactor = data.totp.find(f => f.status === 'verified');
    if (totpFactor) {
      setMfaFactorId(totpFactor.id);
      setMfaStatus('enrolled');
    } else {
      setMfaStatus('unenrolled');
    }
  };

  const startMfaEnrollment = async () => {
    setMfaLoading(true);
    setMfaError('');
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
    if (error) {
      setMfaError(error.message);
      setMfaLoading(false);
      return;
    }
    setMfaFactorId(data.id);
    setMfaQrCode(data.totp.qr_code);
    setMfaStatus('enrolling');
    setMfaLoading(false);
  };

  const verifyMfaEnrollment = async () => {
    setMfaLoading(true);
    setMfaError('');
    const challenge = await supabase.auth.mfa.challenge({ factorId: mfaFactorId });
    if (challenge.error) {
      setMfaError(challenge.error.message);
      setMfaLoading(false);
      return;
    }
    
    const verify = await supabase.auth.mfa.verify({
      factorId: mfaFactorId,
      challengeId: challenge.data.id,
      code: mfaCode
    });
    
    if (verify.error) {
      setMfaError('Code invalide. Veuillez réessayer.');
      setMfaLoading(false);
      return;
    }
    setMfaStatus('enrolled');
    setMfaCode('');
    setMfaQrCode(null);
    setMfaLoading(false);
  };

  const unenrollMfa = async () => {
    const ok = await window.showConfirm("Désactiver 2FA", "Voulez-vous vraiment désactiver l'authentification à deux facteurs ?");
    if (!ok) return;
    setMfaLoading(true);
    setMfaError('');
    const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactorId });
    if (error) {
      setMfaError(error.message);
    } else {
      setMfaFactorId(null);
      setMfaStatus('unenrolled');
    }
    setMfaLoading(false);
  };

  const generateApiKey = async () => {
    if (!session?.user?.id) return;
    setLoadingKey(true);
    const newKey = 'ak_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    let expiresAt = null;
    const now = new Date();
    if (newKeyDuration === '3m') {
      now.setMonth(now.getMonth() + 3);
      expiresAt = now.toISOString();
    } else if (newKeyDuration === '6m') {
      now.setMonth(now.getMonth() + 6);
      expiresAt = now.toISOString();
    } else if (newKeyDuration === '1y') {
      now.setFullYear(now.getFullYear() + 1);
      expiresAt = now.toISOString();
    }

    const { data, error } = await supabase.from('api_keys').insert({
      user_id: session.user.id,
      api_key: newKey,
      name: newKeyName.trim() || 'Clé API',
      expires_at: expiresAt,
      active: true
    }).select().single();
    if (error) {
      await window.showAlert("Erreur", "Erreur lors de la génération : " + error.message);
    } else {
      setApiKeys([data, ...apiKeys]);
      setRevealedKeyIds([...revealedKeyIds, data.id]);
      setShowKeyForm(false);
      setNewKeyName('Ma clé API');
      setNewKeyDuration('lifetime');
    }
    setLoadingKey(false);
  };

  const handleCopyKey = (keyObj) => {
    navigator.clipboard.writeText(keyObj.api_key);
    setCopied(keyObj.id);
    setTimeout(() => setCopied(null), 2000);
    setRevealedKeyIds(revealedKeyIds.filter(id => id !== keyObj.id));
  };

  const handleDeleteKey = async (id) => {
    const ok = await window.showConfirm("Supprimer la clé", "Voulez-vous vraiment supprimer cette clé API ? Cette action est irréversible.");
    if (!ok) return;
    setLoadingKey(true);
    await supabase.from('api_keys').delete().eq('id', id);
    setApiKeys(apiKeys.filter(k => k.id !== id));
    setLoadingKey(false);
  };

  const handleLogout = async () => {
    const ok = await window.showConfirm("Déconnexion", "Se déconnecter ?");
    if (!ok) return;
    await supabase.auth.signOut();
    navigate('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    try {
      if (email !== profile.email) {
        const { error: authError } = await supabase.auth.updateUser({ email });
        if (authError) throw authError;
        await window.showAlert(
          "Confirmation Requise",
          lang === 'fr' 
            ? "Un email de confirmation a été envoyé à votre nouvelle adresse. Veuillez valider le lien pour confirmer le changement."
            : "A confirmation email has been sent to your new address. Please click the link to confirm the change."
        );
      }

      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        email,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (newPassword.length < 6) { setPwError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (newPassword !== confirmPassword) { setPwError("Les deux mots de passe ne correspondent pas."); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPwError(friendlyAuthError(error.message));
    else {
      setNewPassword(""); setConfirmPassword("");
      setPwSuccess(hasPasswordIdentity
        ? "Mot de passe mis à jour."
        : "Mot de passe défini. Tu peux désormais te connecter avec ton email et ce mot de passe.");
      onUpdate();
      setTimeout(() => setPwSuccess(""), 5000);
    }
    setPwLoading(false);
  };

  const handleLinkGoogle = async () => {
    setConnMsg({ type: "", text: "" });
    setGoogleLoading(true);
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/#settings' },
    });
    if (error) {
      const m = error.message?.toLowerCase() || "";
      setConnMsg({
        type: "error",
        text: m.includes('manual linking') || m.includes('disabled')
          ? "L'association de compte n'est pas activée côté serveur. Contacte le support."
          : friendlyAuthError(error.message),
      });
      setGoogleLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    setConnMsg({ type: "", text: "" });
    if (!hasPasswordIdentity) {
      setConnMsg({ type: "error", text: "Définis d'abord un mot de passe ci-dessous : sans lui, retirer Google te bloquerait l'accès au compte." });
      return;
    }
    const ok = await window.showConfirm("Retirer la connexion Google", "Retirer la connexion Google ? Tu te connecteras uniquement par email et mot de passe.");
    if (!ok) return;
    setGoogleLoading(true);
    const googleIdentity = identities.find((i) => i.provider === 'google');
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) setConnMsg({ type: "error", text: friendlyAuthError(error.message) });
    else {
      setConnMsg({ type: "success", text: "Connexion Google retirée." });
      onUpdate();
    }
    setGoogleLoading(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-[2.5rem] shadow-soft overflow-hidden flex flex-col md:flex-row min-h-[500px] text-gray-900 dark:text-white font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sidebar de gauche */}
      <div className="w-full md:w-64 bg-gray-50/50 dark:bg-slate-950/60 border-r border-gray-150 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-2">
          <button 
            type="button"
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-gray-155 dark:bg-slate-800 text-primary'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <User size={16} />
            {lang === 'fr' ? 'Général' : 'General'}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-gray-155 dark:bg-slate-800 text-primary'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <Shield size={16} />
            {lang === 'fr' ? 'Sécurité' : 'Security'}
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'api'
                ? 'bg-gray-155 dark:bg-slate-800 text-primary'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <Key size={16} />
            API
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('seller')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'seller'
                ? 'bg-gray-155 dark:bg-slate-800 text-primary'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingBag size={16} />
              {lang === 'fr' ? 'Devenir Vendeur' : 'Become Seller'}
            </span>
            <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-black uppercase tracking-wider scale-90">Bientôt</span>
          </button>
        </div>

        <button 
          type="button"
          onClick={handleLogout}
          className="hidden md:flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all mt-8"
        >
          <LogOut size={16} />
          {lang === 'fr' ? 'Se déconnecter' : 'Log Out'}
        </button>
      </div>

      {/* Contenu principal de droite */}
      <div className="flex-grow p-8 md:p-10 bg-white dark:bg-slate-900/40">
        
        {/* Contenu : Général */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Informations du Profil</h3>
              <p className="text-xs text-gray-400 dark:text-slate-450">Gère tes informations personnelles et ta photo de profil.</p>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-slate-455 uppercase tracking-widest mb-2">{t('firstName')}</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" placeholder="Ex: John" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-slate-455 uppercase tracking-widest mb-2">{t('lastName')}</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" placeholder="Ex: Doe" />
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-455 uppercase tracking-widest mb-2">Username *</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-155 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" />
                <p className="text-[10px] text-gray-400 dark:text-slate-500 italic mt-2">C'est votre nom d'utilisateur unique sur la plateforme.</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-455 uppercase tracking-widest mb-2">Adresse E-mail *</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-155 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" />
              </div>
              
              {errorMessage && <div className="bg-red-50 dark:bg-red-950/10 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 dark:border-red-950/20 flex items-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}
              
              <button type="submit" disabled={loading} className={`px-8 py-3.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 hover:bg-black dark:bg-primary dark:text-gray-900 dark:hover:bg-primaryDark text-white'}`}>
                {loading ? <RefreshCcw size={16} className="animate-spin" /> : success ? <><CheckCircle size={16} /> Modifié avec succès</> : t('saveBtn')}
              </button>
            </form>
          </div>
        )}

        {/* Contenu : Sécurité */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Connexion & sécurité</h3>
              <p className="text-xs text-gray-400 dark:text-slate-450">Gère tes méthodes de connexion. Tu peux utiliser Google, un mot de passe, ou les deux.</p>
            </div>

            {connMsg.text && (
              <div className={`p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${connMsg.type === 'error' ? 'bg-red-50 dark:bg-red-950/10 text-red-500 border-red-100 dark:border-red-950/20' : 'bg-green-50 dark:bg-green-950/10 text-green-600 border-green-100 dark:border-green-950/20'}`}>
                {connMsg.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />} {connMsg.text}
              </div>
            )}

            <div className="space-y-6">
              {/* Google */}
              <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-150 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-850 rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-gray-100 dark:border-slate-800"><img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" /></div>
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
                  <button type="button" onClick={handleUnlinkGoogle} disabled={googleLoading} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-155 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all disabled:opacity-50">
                    {googleLoading ? '…' : 'Désactiver'}
                  </button>
                ) : (
                  <button type="button" onClick={handleLinkGoogle} disabled={googleLoading} className="px-4 py-2 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primaryDark transition-all disabled:opacity-50">
                    {googleLoading ? '…' : 'Activer'}
                  </button>
                )}
              </div>

              {/* Mot de passe */}
              <div className="p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-150 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-850 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><ShieldCheck size={20} /></div>
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
                    <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={hasPasswordIdentity ? 'Nouveau mot de passe' : 'Mot de passe'} className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650">
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="relative">
                    <input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer" className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-155 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655">
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
              <div className="flex flex-col p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-150 dark:border-slate-800 gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white dark:bg-slate-850 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><Shield size={20} /></div>
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
                  <div className="border-t border-gray-150 dark:border-slate-800 pt-6 space-y-4">
                    <h5 className="font-bold text-sm text-gray-900 dark:text-white">Configuration de l'authentificateur</h5>
                    <p className="text-xs text-gray-500 dark:text-slate-400">1. Scannez ce QR Code avec votre application (Google Authenticator, Authy, etc.).</p>
                    <div className="bg-white p-4 rounded-xl inline-block" dangerouslySetInnerHTML={{ __html: mfaQrCode }} />
                    <p className="text-xs text-gray-500 dark:text-slate-400">2. Saisissez le code à 6 chiffres généré par l'application.</p>
                    <div className="flex items-center gap-2 max-w-xs">
                      <input 
                        type="text" 
                        maxLength="6"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={e => setMfaCode(e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-155 dark:border-slate-800 font-mono text-center font-bold text-gray-900 dark:text-white outline-none focus:border-primary"
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
        )}
          {/* Contenu : Clé API */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">API</h3>
              <p className="text-xs text-gray-400 dark:text-slate-455">Intègre notre catalogue d'e-mails et nos numéros SMS dans tes propres projets grâce à ta clé API unique.</p>
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-150 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-slate-855 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><Hash size={20} /></div>
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
                        <div key={k.id} className="flex gap-2 items-center bg-white dark:bg-slate-900 border border-gray-155 dark:border-slate-800 rounded-xl p-2 pr-4">
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
                            <div className="font-mono text-xs text-gray-705 dark:text-slate-300 truncate">
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
            
            <div className="p-6 bg-blue-50/30 dark:bg-blue-955/10 rounded-[1.5rem] border border-blue-100/60 dark:border-blue-900/20">
              <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Besoin d'aide pour l'intégration ?</h5>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Consulte notre onglet <button type="button" onClick={() => navigate('api')} className="text-primary font-black hover:underline">API</button> pour retrouver la documentation technique, la liste des commandes et les méthodes de requêtes disponibles pour tes scripts.
              </p>
            </div>
          </div>
        )}

        {/* Contenu : Devenir Vendeur */}
        {activeTab === 'seller' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Devenir Vendeur</h3>
              <p className="text-xs text-gray-400 dark:text-slate-450">Rejoins les fournisseurs officiels d'AgedGmail.</p>
            </div>
            
            <div className="p-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-[2rem] text-center space-y-4 bg-gray-50/30 dark:bg-slate-900/20">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag size={28} />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h4 className="font-bold text-sm text-gray-900 dark:text-white">Fonctionnalité en cours de développement</h4>
                <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                  Tu souhaites vendre tes propres comptes certifiés (Gmail, Outlook, Discord, etc.) sur notre marketplace ? Cette intégration fournisseur sera activée prochainement. Tu pourras gérer ton stock local et suivre tes ventes en temps réel.
                </p>
              </div>
              <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider scale-95">
                Disponible Prochainement
              </div>
            </div>
          </div>
        )}

        <button 
          type="button"
          onClick={handleLogout}
          className="md:hidden w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl text-sm font-bold text-red-500 bg-red-50 dark:bg-red-950/20 mt-10 transition-all"
        >
          <LogOut size={16} />
          {lang === 'fr' ? 'Se déconnecter' : 'Log Out'}
        </button>
      </div>
    </div>
  );
};

export default SettingsTab;
