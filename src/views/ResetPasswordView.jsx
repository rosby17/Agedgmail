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

const ResetPasswordView = ({ navigate, lang }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères.' : 'Password must be at least 6 characters long.'); return; }
    if (newPassword !== confirm) { setError(lang === 'fr' ? 'Les deux mots de passe ne correspondent pas.' : 'Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setDone(true);
      // Nettoie les jetons de récupération de l'URL et bascule sur le catalogue.
      window.history.replaceState(null, '', window.location.pathname);
      setTimeout(() => navigate('shop'), 1800);
    } catch (err) {
      setError(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  // text-gray-900 explicite : cette carte reste toujours claire (bg-white),
  // sans quoi le texte hérite du blanc du thème sombre global (illisible).
  const inputCls = "w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none font-medium text-sm text-gray-900 placeholder:text-gray-400 transition-all";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 font-sans">
      <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-3xl shadow-[0_24px_70px_-24px_rgba(0,0,0,0.12)] border border-gray-100">
        <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {done ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">{lang === 'fr' ? 'Mot de passe mis à jour' : 'Password updated'}</h2>
            <p className="text-gray-400 text-sm">{lang === 'fr' ? 'Redirection en cours…' : 'Redirecting…'}</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}</h2>
            <p className="text-gray-400 text-sm text-center mb-6">{lang === 'fr' ? 'Choisis un nouveau mot de passe pour ton compte.' : 'Choose a new password for your account.'}</p>
            <form onSubmit={submit} className="space-y-3.5">
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={lang === 'fr' ? 'Nouveau mot de passe' : 'New password'} className={inputCls + " pr-12"} />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={lang === 'fr' ? 'Confirme le mot de passe' : 'Confirm password'} className={inputCls + " pr-12"} />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} /> {error}</div>}
              <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 !mt-5">
                {loading && <RefreshCcw size={15} className="animate-spin" />} {lang === 'fr' ? 'Mettre à jour' : 'Update'}
              </button>
            </form>
            <button onClick={() => navigate('auth')} className="w-full text-center text-xs text-gray-400 font-bold hover:text-primary transition-colors mt-5">{lang === 'fr' ? '← Retour à la connexion' : '← Back to login'}</button>
          </>
        )}
      </div>
    </div>
  );
};
export default ResetPasswordView;
