import { friendlyAuthError } from '../utils/helpers';
import React, { useState, useEffect } from 'react';
import { User, Shield, ShoppingBag, LogOut, Key } from 'lucide-react';
import { supabase } from '../supabaseClient';
import GeneralTab from './settings/GeneralTab';
import SecurityTab from './settings/SecurityTab';
import ApiKeysTab from './settings/ApiKeysTab';
import SellerTab from './settings/SellerTab';

const SettingsTab = ({ profile, session, onUpdate, lang, t, navigate }) => {
  const [activeTab, setActiveTab] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('tab') || 'general';
  }); // general | security | api | seller
  
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
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] shadow-soft overflow-hidden flex flex-col md:flex-row min-h-[500px] text-gray-900 dark:text-white font-sans animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Sidebar de gauche */}
      <div className="w-full md:w-64 bg-gray-50/50 dark:bg-slate-950/60 border-r border-gray-200 dark:border-slate-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-2">
          <button 
            type="button"
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'general'
                ? 'bg-gray-200 dark:bg-slate-800 text-primary'
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
                ? 'bg-gray-200 dark:bg-slate-800 text-primary'
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
                ? 'bg-gray-200 dark:bg-slate-800 text-primary'
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
                ? 'bg-gray-200 dark:bg-slate-800 text-primary'
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
        
        {activeTab === 'general' && (
          <GeneralTab {...{ t, firstName, setFirstName, lastName, setLastName, displayName, setDisplayName, email, setEmail, errorMessage, loading, success, handleSave }} />
        )}

        {activeTab === 'security' && (
          <SecurityTab {...{
            connMsg, hasGoogle, googleLoading, handleUnlinkGoogle, handleLinkGoogle, hasPasswordIdentity,
            showNewPw, setShowNewPw, newPassword, setNewPassword, showConfirmPw, setShowConfirmPw, confirmPassword, setConfirmPassword,
            pwError, pwSuccess, pwLoading, handleUpdatePassword,
            mfaStatus, mfaLoading, unenrollMfa, startMfaEnrollment, mfaQrCode, mfaCode, setMfaCode, verifyMfaEnrollment, setMfaStatus, mfaError,
          }} />
        )}

        {activeTab === 'api' && (
          <ApiKeysTab {...{
            loadingKey, apiKeys, revealedKeyIds, handleCopyKey, copied, handleDeleteKey,
            showKeyForm, setShowKeyForm, newKeyName, setNewKeyName, newKeyDuration, setNewKeyDuration, generateApiKey, navigate,
          }} />
        )}

        {activeTab === 'seller' && <SellerTab />}

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
