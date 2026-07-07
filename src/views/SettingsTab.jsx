import { friendlyAuthError } from '../utils/helpers';
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu, Key } from 'lucide-react';
import { supabase } from '../supabaseClient';

const SettingsTab = ({ profile, session, onUpdate, lang, t, navigate }) => {
  const [activeTab, setActiveTab] = useState('general'); // general | security | api
  
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tfaEnabled, setTfaEnabled] = useState(profile?.two_factor_enabled || false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [connMsg, setConnMsg] = useState({ type: "", text: "" });

  const [apiKey, setApiKey] = useState("");
  const [loadingKey, setLoadingKey] = useState(false);
  const [copied, setCopied] = useState(false);

  const identities = session?.user?.identities || [];
  const hasGoogle = identities.some((i) => i.provider === 'google');
  const hasPasswordIdentity = identities.some((i) => i.provider === 'email');

  const fetchApiKey = async () => {
    if (!session?.user?.id) return;
    setLoadingKey(true);
    const { data } = await supabase
      .from('api_keys')
      .select('api_key')
      .eq('user_id', session.user.id)
      .maybeSingle();
    if (data) {
      setApiKey(data.api_key);
    }
    setLoadingKey(false);
  };

  useEffect(() => {
    fetchApiKey();
  }, [session]);

  const generateApiKey = async () => {
    if (!session?.user?.id) return;
    setLoadingKey(true);
    const newKey = 'ak_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const { error } = await supabase.from('api_keys').upsert({
      user_id: session.user.id,
      api_key: newKey,
      active: true
    });
    if (error) alert("Erreur lors de la génération : " + error.message);
    else setApiKey(newKey);
    setLoadingKey(false);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    if (!window.confirm("Se déconnecter ?")) return;
    await supabase.auth.signOut();
    navigate('');
  };

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      onUpdate();
    } catch (error) {
      setErrorMessage("Upload error: Ensure you have created a public 'avatars' bucket in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        email,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        avatar_url: avatarUrl,
        two_factor_enabled: tfaEnabled,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.message);
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
    if (!window.confirm("Retirer la connexion Google ? Tu te connecteras uniquement par email et mot de passe.")) return;
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
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-gray-150 dark:bg-slate-800 text-primary'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <User size={16} />
            {lang === 'fr' ? 'Général' : 'General'}
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'security'
                ? 'bg-gray-150 dark:bg-slate-800 text-primary'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <Shield size={16} />
            {lang === 'fr' ? 'Sécurité' : 'Security'}
          </button>

          <button 
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'api'
                ? 'bg-gray-150 dark:bg-slate-800 text-primary'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/60 dark:hover:bg-slate-800/40'
            }`}
          >
            <Key size={16} />
            {lang === 'fr' ? 'Clé API Revendeur' : 'Reseller API Key'}
          </button>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all mt-8"
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
                  <label className="block text-[10px] font-black text-gray-400 dark:text-slate-450 uppercase tracking-widest mb-2">{t('firstName')}</label>
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" placeholder="Ex: John" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-slate-450 uppercase tracking-widest mb-2">{t('lastName')}</label>
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" placeholder="Ex: Doe" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-450 uppercase tracking-widest mb-2">{t('displayName')} *</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 font-bold text-sm outline-none" />
                <p className="text-[10px] text-gray-400 dark:text-slate-500 italic mt-2">C'est le nom qui s'affichera sur votre tableau de bord et vos avis.</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-450 uppercase tracking-widest mb-3">Photo de Profil</label>
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800/40 rounded-[1.5rem] border border-gray-150 dark:border-slate-800 flex items-center justify-center overflow-hidden relative group shrink-0">
                    {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Preview" /> : <User size={24} className="text-gray-300 dark:text-slate-650" />}
                    {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><RefreshCcw size={16} className="text-white animate-spin" /></div>}
                  </div>
                  <div className="space-y-2">
                    <input type="file" id="avatar" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                    <label htmlFor="avatar" className="inline-block bg-white dark:bg-slate-800 border border-gray-155 dark:border-slate-800 text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary dark:hover:bg-primary hover:text-white dark:hover:text-white transition-all cursor-pointer">
                      {uploading ? "Chargement..." : "Choisir une photo"}
                    </label>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 italic">Formats supportés: JPG, PNG. Max 2Mo.</p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-450 uppercase tracking-widest mb-2">Adresse E-mail *</label>
                <input type="email" value={email} readOnly className="w-full px-5 py-3.5 rounded-2xl bg-gray-100 dark:bg-slate-800/40 border border-gray-150 dark:border-slate-800 text-gray-400 dark:text-slate-500 font-bold text-sm cursor-not-allowed outline-none" />
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
                  <button onClick={handleUnlinkGoogle} disabled={googleLoading} className="px-4 py-2 bg-white dark:bg-slate-800 border border-gray-155 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-950/10 transition-all disabled:opacity-50">
                    {googleLoading ? '…' : 'Désactiver'}
                  </button>
                ) : (
                  <button onClick={handleLinkGoogle} disabled={googleLoading} className="px-4 py-2 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primaryDark transition-all disabled:opacity-50">
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
                    <input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer" className="w-full pl-4 pr-10 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-655">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                {pwError && <div className="bg-red-50 dark:bg-red-950/10 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-950/20 flex items-center gap-2"><AlertTriangle size={14} /> {pwError}</div>}
                {pwSuccess && <div className="bg-green-50 dark:bg-green-950/10 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 dark:border-green-950/20 flex items-center gap-2"><CheckCircle size={14} /> {pwSuccess}</div>}
                <button onClick={handleUpdatePassword} disabled={pwLoading} className="px-5 py-2.5 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-xl font-bold text-xs hover:bg-primary/80 transition-all flex items-center gap-2 disabled:opacity-50">
                  {pwLoading && <RefreshCcw size={12} className="animate-spin" />}
                  {hasPasswordIdentity ? 'Mettre à jour' : 'Définir le mot de passe'}
                </button>
              </div>

              {/* 2FA */}
              <div className="flex items-center justify-between p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-150 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white dark:bg-slate-850 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><Shield size={20} /></div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">Double authentification (2FA)</h4>
                    <p className="text-xs text-gray-400 dark:text-slate-500 font-medium">Une couche de sécurité supplémentaire.</p>
                  </div>
                </div>
                <button onClick={async () => {
                  const newVal = !tfaEnabled;
                  setTfaEnabled(newVal);
                  await supabase.from('profiles').update({ two_factor_enabled: newVal }).eq('id', profile.id);
                }} className={`w-14 h-7 rounded-full relative transition-all duration-300 shrink-0 ${tfaEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-slate-700'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${tfaEnabled ? 'left-8' : 'left-1'}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contenu : Clé API */}
        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Clé API Revendeur</h3>
              <p className="text-xs text-gray-400 dark:text-slate-450">Intègre notre catalogue d'e-mails et nos numéros SMS dans tes propres projets grâce à ta clé API unique.</p>
            </div>

            <div className="p-6 bg-gray-50/50 dark:bg-slate-800/20 rounded-[1.5rem] border border-gray-150 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white dark:bg-slate-855 rounded-xl flex items-center justify-center shadow-sm text-primary shrink-0 border border-gray-100 dark:border-slate-800"><Hash size={20} /></div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm">Clé API active</h4>
                  <p className="text-xs text-gray-400 dark:text-slate-500">Ne partage jamais cette clé API avec d'autres personnes.</p>
                </div>
              </div>

              {loadingKey ? (
                <div className="py-2"><RefreshCcw size={16} className="animate-spin text-primary" /></div>
              ) : apiKey ? (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={apiKey} 
                      className="flex-grow px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 font-mono text-xs text-gray-705 dark:text-slate-300 outline-none" 
                    />
                    <button 
                      onClick={handleCopyKey}
                      className="px-4 py-3 rounded-xl bg-gray-900 dark:bg-slate-800 text-white dark:text-slate-300 hover:bg-black dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-2 shrink-0"
                    >
                      {copied ? <><CheckCircle size={14} className="text-green-500" /> Copié</> : <><Copy size={14} /> Copier</>}
                    </button>
                  </div>
                  <button 
                    onClick={generateApiKey}
                    className="px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/10 text-red-650 hover:text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/20 rounded-xl text-xs font-bold transition-all"
                  >
                    Régénérer une clé API
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500 dark:text-slate-400">Aucune clé API n'a été créée pour ton compte pour le moment.</p>
                  <button 
                    onClick={generateApiKey}
                    className="px-6 py-3 bg-gray-900 dark:bg-primary text-white dark:text-gray-900 rounded-xl text-xs font-bold hover:bg-black dark:hover:bg-primaryDark transition-all"
                  >
                    Générer une clé API
                  </button>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-blue-50/30 dark:bg-blue-950/10 rounded-[1.5rem] border border-blue-100/60 dark:border-blue-900/20">
              <h5 className="font-bold text-sm text-gray-900 dark:text-white mb-2">Besoin d'aide pour l'intégration ?</h5>
              <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
                Consulte notre onglet <button onClick={() => navigate('api')} className="text-primary font-black hover:underline">API</button> pour retrouver la documentation technique, la liste des commandes et les méthodes de requêtes disponibles pour tes scripts.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsTab;
