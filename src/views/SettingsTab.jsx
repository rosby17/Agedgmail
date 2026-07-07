import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu } from 'lucide-react';
import { supabase } from '../supabaseClient';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from '../utils/constants';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from '../utils/helpers';
import { YouTubeLogo, GmailLogo, FacebookIcon, DiscordLogo, InstagramLogo, TwitterLogo, TikTokLogo, AppleLogo, TelegramLogo, SmsLogo, RedditLogo, MailGenericLogo, OutlookLogo, SnapchatLogo, AmazonLogo, GithubLogo } from '../components/ui/Logos';
import { Skeleton, SkeletonProductCard, SkeletonProductGrid, SkeletonRows, SkeletonMetricCards } from '../components/ui/Skeletons';
import { TypewriterText } from '../components/ui/TypewriterText';
import ProductCard from '../components/ui/ProductCard';
import ProductVisual from '../components/ui/ProductVisual';
import DeliveredAccountCard from '../components/ui/DeliveredAccountCard';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CartDrawer from '../components/modals/CartDrawer';
import CartCheckoutModal from '../components/modals/CartCheckoutModal';
import QuickOrderModal from '../components/modals/QuickOrderModal';
import TransferCreditsModal from '../components/modals/TransferCreditsModal';
import OrderCredentialsModal from '../components/modals/OrderCredentialsModal';
import NotificationBell from '../components/layout/NotificationBell';

// Missing sub-views for Admin
import SupplierAdmin from './SupplierAdmin';
import BinancePaymentsAdmin from './BinancePaymentsAdmin';
import SupportAdmin from './SupportAdmin';
import OrdersAdmin from './OrdersAdmin';

const SettingsTab = ({ profile, session, onUpdate, lang, t }) => {
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
  // Gestion des méthodes de connexion (mot de passe, feedback dédié).
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [connMsg, setConnMsg] = useState({ type: "", text: "" });

  // Identités réelles du compte (source de vérité pour "connecté via Google" et
  // "a un mot de passe"), lues depuis la session — pas depuis un champ profil
  // qui n'était jamais fiable.
  const identities = session?.user?.identities || [];
  const hasGoogle = identities.some((i) => i.provider === 'google');
  const hasPasswordIdentity = identities.some((i) => i.provider === 'email');

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Auto-save to profile
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

  // Définit (compte Google sans mot de passe) ou change le mot de passe.
  // Dans les deux cas c'est updateUser({ password }) : Supabase crée
  // l'identité 'email' si elle n'existait pas, ce qui permet ensuite de se
  // connecter par email/mot de passe même pour un compte créé via Google.
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

  // Active la connexion Google (linkIdentity) — redirige vers Google puis
  // revient avec l'identité rattachée. Nécessite "Manual linking" activé côté
  // projet Supabase ; sinon on l'explique clairement au lieu d'un message brut.
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
    // Succès : redirection Google, le retour recharge la page.
  };

  // Désactive la connexion Google (unlinkIdentity). Refusé par Supabase si
  // c'est la seule méthode de connexion (sinon compte inaccessible) — on
  // impose donc d'avoir défini un mot de passe avant.
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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">{t('profileSettings')}</h2>
        <form className="space-y-8" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('firstName')}</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: John" /></div>
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('lastName')}</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: Doe" /></div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('displayName')} *</label><input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /><p className="text-[10px] text-gray-400 italic mt-2">This is the name that will appear on your dashboard and your reviews.</p></div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center overflow-hidden relative group">
                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Preview" /> : <User size={30} className="text-gray-300" />}
                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><RefreshCcw size={20} className="text-white animate-spin" /></div>}
              </div>
              <div className="space-y-3">
                <input type="file" id="avatar" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                <label htmlFor="avatar" className="inline-block bg-white border border-gray-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white dark:text-gray-900 hover:border-primary transition-all cursor-pointer">
                  {uploading ? "Loading..." : "Choose a photo"}
                </label>
                <p className="text-[10px] text-gray-400 font-medium italic">JPG, PNG supported. Max 2MB.</p>
              </div>
            </div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address *</label><input type="email" value={email} readOnly className="w-full px-6 py-4 rounded-2xl bg-gray-100 border-none text-gray-400 font-bold text-sm cursor-not-allowed" /></div>
          {errorMessage && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}
          <button type="submit" disabled={loading} className={`px-12 py-5 rounded-full font-bold text-sm transition-all shadow-xl shadow-black/10 flex items-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}>
            {loading ? <RefreshCcw size={16} className="animate-spin" /> : success ? <><CheckCircle size={16} /> Successfully modified</> : t('saveBtn')}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-3"><ShieldCheck size={26} className="text-primary" /> Connexion & sécurité</h2>
        <p className="text-sm text-gray-400 mb-8">Gère tes méthodes de connexion. Tu peux utiliser Google, un mot de passe, ou les deux.</p>

        {connMsg.text && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${connMsg.type === 'error' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            {connMsg.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />} {connMsg.text}
          </div>
        )}

        <div className="space-y-5">
          {/* Google */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Connexion Google</h4>
                <p className="text-xs font-medium flex items-center gap-1.5">
                  {hasGoogle
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="text-green-600">Activée</span></>
                    : <span className="text-gray-400">Non activée</span>}
                </p>
              </div>
            </div>
            {hasGoogle ? (
              <button onClick={handleUnlinkGoogle} disabled={googleLoading} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50">
                {googleLoading ? '…' : 'Désactiver'}
              </button>
            ) : (
              <button onClick={handleLinkGoogle} disabled={googleLoading} className="px-5 py-2.5 bg-gray-900 text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50">
                {googleLoading ? '…' : 'Activer'}
              </button>
            )}
          </div>

          {/* Mot de passe */}
          <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary"><ShieldCheck size={22} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{hasPasswordIdentity ? 'Mot de passe' : 'Définir un mot de passe'}</h4>
                <p className="text-xs font-medium flex items-center gap-1.5">
                  {hasPasswordIdentity
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="text-green-600">Connexion par email activée</span></>
                    : <span className="text-gray-400">Ajoute un mot de passe pour te connecter aussi par email</span>}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={hasPasswordIdentity ? 'Nouveau mot de passe' : 'Mot de passe'} className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer" className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {pwError && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 mb-4"><AlertTriangle size={14} /> {pwError}</div>}
            {pwSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2 mb-4"><CheckCircle size={14} /> {pwSuccess}</div>}
            <button onClick={handleUpdatePassword} disabled={pwLoading} className="px-6 py-3 bg-gray-900 text-white dark:text-gray-900 rounded-xl font-bold text-xs hover:bg-primary transition-all flex items-center gap-2 disabled:opacity-50">
              {pwLoading && <RefreshCcw size={14} className="animate-spin" />}
              {hasPasswordIdentity ? 'Mettre à jour' : 'Définir le mot de passe'}
            </button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary"><CreditCard size={22} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Double authentification (2FA)</h4>
                <p className="text-xs text-gray-400 font-medium">Une couche de sécurité supplémentaire.</p>
              </div>
            </div>
            <button onClick={async () => {
              const newVal = !tfaEnabled;
              setTfaEnabled(newVal);
              await supabase.from('profiles').update({ two_factor_enabled: newVal }).eq('id', profile.id);
            }} className={`w-14 h-7 rounded-full relative transition-all duration-300 shrink-0 ${tfaEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${tfaEnabled ? 'left-8' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsTab;
