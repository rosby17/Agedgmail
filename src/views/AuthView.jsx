import { friendlyAuthError } from '../utils/helpers';
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
import SettingsTab from './SettingsTab';

const AuthView = ({ navigate, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  // Écran "confirme ton email" après inscription quand la confirmation est requise
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState("");

  const [tfaPending, setTfaPending] = useState(false);
  const [tfaCodeInput, setTfaCodeInput] = useState('');
  const [tfaExpectedCode, setTfaExpectedCode] = useState('');
  const [tempSession, setTempSession] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('two_factor_enabled')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.two_factor_enabled) {
          setTempSession(data.session);
          const code = Math.floor(100000 + Math.random() * 900000).toString();
          setTfaExpectedCode(code);
          setTfaPending(true);
        } else {
          navigate('shop');
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { first_name: firstName, last_name: lastName, display_name: username },
          },
        });
        if (error) throw error;
        if (data?.session) {
          navigate('shop');
        } else {
          setPendingConfirmEmail(email);
        }
      }
    } catch (err) {
      setErrorMessage(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setInfoMessage("");
    if (tfaCodeInput.trim() === tfaExpectedCode) {
      setTfaPending(false);
      navigate('shop');
    } else {
      setErrorMessage(lang === 'fr' ? "Code de vérification incorrect." : "Incorrect verification code.");
    }
  };

  const handleCancel2FA = async () => {
    await supabase.auth.signOut();
    setTfaPending(false);
    setTempSession(null);
    setErrorMessage("");
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingConfirmEmail || email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setInfoMessage(lang === 'fr' ? "Email de confirmation renvoyé. Vérifie ta boîte mail." : "Confirmation email sent. Check your inbox.");
    } catch (err) {
      setErrorMessage(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage(lang === 'fr' ? "Entre d'abord ton adresse email pour réinitialiser le mot de passe." : "Please enter your email address first to reset your password.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setInfoMessage(lang === 'fr' ? "Un email de réinitialisation a été envoyé. Vérifie ta boîte mail." : "A reset email has been sent. Check your inbox.");
    } catch (err) {
      setErrorMessage(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setErrorMessage(friendlyAuthError(error.message));
  };

  const inputCls = "w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none font-medium text-sm transition-all";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 font-sans">
      <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-3xl shadow-[0_24px_70px_-24px_rgba(0,0,0,0.12)] border border-gray-100">

        {tfaPending ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{lang === 'fr' ? 'Double authentification' : 'Two-Factor Authentication'}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-4">
              {lang === 'fr' 
                ? 'Saisis le code de vérification à 6 chiffres envoyé à ton adresse e-mail pour confirmer ton identité.' 
                : 'Enter the 6-digit verification code sent to your email address to confirm your identity.'}
            </p>

            <div className="bg-amber-50 text-amber-600 p-3.5 rounded-2xl text-xs font-bold border border-amber-100 mb-6 text-left space-y-1">
              <span className="block font-black uppercase tracking-wider text-[10px]">{lang === 'fr' ? 'Mode Test / Dev :' : 'Test / Dev Mode:'}</span>
              <span>{lang === 'fr' ? 'Le code de vérification généré est :' : 'The generated verification code is:'} <strong className="font-mono text-sm underline">{tfaExpectedCode}</strong></span>
            </div>

            {errorMessage && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 mb-4 flex items-center justify-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}

            <form onSubmit={handleVerify2FA} className="space-y-4">
              <input 
                type="text" 
                maxLength={6}
                required 
                value={tfaCodeInput} 
                onChange={e => setTfaCodeInput(e.target.value.replace(/\D/g, ''))} 
                className="w-full text-center h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none font-mono text-xl tracking-[0.5em] font-bold" 
                placeholder="000000" 
              />

              <button type="submit" className="w-full h-12 bg-primary text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-primaryDark transition-all flex items-center justify-center gap-2 shadow-lg">
                {lang === 'fr' ? 'Confirmer' : 'Confirm'}
              </button>
              
              <button type="button" onClick={handleCancel2FA} className="text-xs text-gray-400 font-bold hover:text-primary transition-colors block w-full text-center mt-2">
                {lang === 'fr' ? '← Annuler la connexion' : '← Cancel login'}
              </button>
            </form>
          </div>
        ) : pendingConfirmEmail ? (
          /* Écran de confirmation d'email (inscription réussie, en attente de vérification) */
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{lang === 'fr' ? 'Confirme ton email' : 'Confirm your email'}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              {lang === 'fr' ? 'Un lien de confirmation a été envoyé à' : 'A confirmation link has been sent to'}<br />
              <span className="font-bold text-gray-900">{pendingConfirmEmail}</span>
            </p>
            <p className="text-gray-400 text-xs mb-6">{lang === 'fr' ? 'Clique dessus pour activer ton compte (pense aux spams).' : 'Click on it to activate your account (check your spam folder).'}</p>

            {infoMessage && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 mb-4">{infoMessage}</div>}
            {errorMessage && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 mb-4 flex items-center justify-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}

            <button onClick={handleResendConfirmation} disabled={loading} className="w-full h-12 bg-gray-900 text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-3">
              {loading && <RefreshCcw size={15} className="animate-spin" />} {lang === 'fr' ? 'Renvoyer l\'email' : 'Resend email'}
            </button>
            <button onClick={() => { setPendingConfirmEmail(''); setIsLogin(true); setErrorMessage(''); setInfoMessage(''); }} className="text-xs text-gray-400 font-bold hover:text-primary transition-colors">
              {lang === 'fr' ? '← Retour à la connexion' : '← Back to login'}
            </button>
          </div>
        ) : (
        <>
          {/* En-tête */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{isLogin ? (lang === 'fr' ? 'Content de te revoir' : 'Welcome back') : (lang === 'fr' ? 'Crée ton compte' : 'Create an account')}</h2>
            <p className="text-gray-400 text-sm mt-1">{isLogin ? (lang === 'fr' ? 'Connecte-toi pour continuer.' : 'Log in to continue.') : (lang === 'fr' ? 'Rejoins la marketplace n°1 de comptes certifiés.' : 'Join the #1 marketplace for certified accounts.')}</p>
          </div>

          {/* Google — toujours visible, en haut */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all group mb-5"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span className="text-gray-700 font-bold text-sm">{lang === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-grow h-px bg-gray-100" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{lang === 'fr' ? 'ou' : 'or'}</span>
            <div className="flex-grow h-px bg-gray-100" />
          </div>

          <form className="space-y-3.5" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'Prénom' : 'First Name'} />
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'Nom' : 'Last Name'} />
                </div>
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'Pseudo' : 'Username'} />
              </>
            )}
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'ton@email.com' : 'your@email.com'} />
            <div className="relative">
              <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className={inputCls + " pr-12"} placeholder={lang === 'fr' ? 'Mot de passe' : 'Password'} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" onClick={handleResetPassword} className="text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                  {lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}
            {infoMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2">
                <CheckCircle size={14} /> {infoMessage}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 !mt-5">
              {loading && <RefreshCcw size={15} className="animate-spin" />}
              {isLogin ? (lang === 'fr' ? 'Se connecter' : 'Log in') : (lang === 'fr' ? "S'inscrire" : 'Sign up')}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            {isLogin ? (lang === 'fr' ? "Pas encore de compte ?" : "Don't have an account?") : (lang === 'fr' ? "Déjà un compte ?" : "Already have an account?")}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); setInfoMessage(''); }} className="font-bold text-primary hover:underline">
              {isLogin ? (lang === 'fr' ? "S'inscrire" : "Sign up") : (lang === 'fr' ? "Se connecter" : "Log in")}
            </button>
          </div>
        </>
        )}
      </div>
    </div>
  );
};
export default AuthView;
