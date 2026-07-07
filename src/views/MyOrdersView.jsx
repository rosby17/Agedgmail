import { shortOrderId } from '../utils/helpers';
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

const MyOrdersView = ({ profile, navigate, orders = [], onResume, session, fetchProfile, lang, t, loading = false }) => {
  React.useEffect(() => {
    if (!session) {
      navigate('auth');
    }
  }, [session, navigate]);
  const [viewOrder, setViewOrder] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  // Initialise la checkbox depuis le profil
  const [sendEmailAll, setSendEmailAll] = useState(profile?.send_email_on_delivery ?? false);

  // Synchronise la checkbox si le profil change (ex: rechargement)
  React.useEffect(() => {
    setSendEmailAll(profile?.send_email_on_delivery ?? false);
  }, [profile?.send_email_on_delivery]);

  // Sauvegarde la préférence email en base dès que la case est cochée/décochée
  const handleEmailToggle = async (checked) => {
    setSendEmailAll(checked);
    if (!session) return;
    await supabase.from('profiles').update({ send_email_on_delivery: checked }).eq('id', session.user.id);
    if (fetchProfile) fetchProfile(session.user.id);
  };

  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const displayOrders = orders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Parse les options d'un nom de produit YTSeller :
  // "Gmail Accounts 2FA/ BACKUP CODE/ APP PASSWORD (3 Months)" → baseName + options
  // "🟢Fresh gmail account 🔴Mix ip 🟢Random name and gender" → options séparées par les émojis
  const parseProductOptions = (name = '') => {
    if (!name) return { baseName: '', options: [] };

    // Détecte les options avec émojis colorés (format YTSeller)
    const emojiOptionRegex = /([🟢🔴🟡⚪🔵🟠🟤⚫]+[^🟢🔴🟡⚪🔵🟠🟤⚫\n]+)/gu;
    const emojiMatches = name.match(emojiOptionRegex);
    if (emojiMatches && emojiMatches.length > 1) {
      const cleanOptions = emojiMatches.map(o => o.trim().replace(/\s*-\s*$/, '').trim()).filter(Boolean);
      const firstEmojiIdx = name.search(/[🟢🔴🟡⚪🔵🟠🟤⚫]/u);
      const baseName = firstEmojiIdx > 0 ? name.slice(0, firstEmojiIdx).trim() : (cleanOptions[0] || name);
      return { baseName: baseName || cleanOptions[0], options: cleanOptions.slice(baseName ? 0 : 1) };
    }

    // Détecte les options séparées par "/" (format "2FA/ BACKUP CODE/ APP PASSWORD")
    const slashIdx = name.search(/\s*\/\s*/);
    if (slashIdx > 3) {
      const durationMatch = name.match(/\(([^)]+)\)\s*$/);
      const duration = durationMatch ? durationMatch[1] : null;
      const withoutDuration = duration ? name.slice(0, name.lastIndexOf('(')).trim() : name;
      const parts = withoutDuration.split('/').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        const opts = parts.slice(1);
        if (duration) opts.push(duration);
        return { baseName: parts[0], options: opts };
      }
    }

    return { baseName: name, options: [] };
  };

  // Couleur d'un badge d'option selon le contenu
  const optionBadgeClass = (opt = '') => {
    const o = opt.toLowerCase();
    if (o.includes('2fa') || o.includes('backup')) return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
    if (o.includes('app password') || o.includes('app pass')) return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
    if (o.includes('mix ip') || o.includes(' ip')) return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20';
    if (o.includes('random') || o.includes('name') || o.includes('gender')) return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20';
    if (o.includes('month') || o.includes('year') || o.includes('day')) return 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    if (o.includes('fresh') || o.includes('aged')) return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20';
    return 'bg-gray-50 text-gray-600 border-gray-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  // Télécharge les credentials d'une commande en .txt
  const downloadCredentials = (order) => {
    let raw = order.credentials || order.data || '';
    if (!raw.trim() && order.delivery_data && typeof order.delivery_data === 'object') {
      raw = `Phone: ${order.delivery_data.number || ''}\nSMS Code: ${order.delivery_data.code || order.delivery_data.sms || ''}\nProvider: ${order.delivery_data.provider || ''}`;
    }
    if (!raw.trim()) return;
    const blob = new Blob([raw], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${shortOrderId(order.id)}-credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasDelivery = (order) => !!(order.credentials || order.data || (order.delivery_data && typeof order.delivery_data === 'object' && (order.delivery_data.code || order.delivery_data.sms)));

  const statusBadge = (order) => {
    const isSpecial = order.product_id === 999 || order.product_id === 998;
    const map = {
      confirmed: { label: isSpecial ? 'Succès' : t('completed'), cls: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' },
      cancelled:  { label: t('failed'),    cls: 'bg-red-100 text-red-600 border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' },
      processing: { label: t('processing'), cls: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' },
      pending:    { label: t('pending'),   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400' },
    };
    const { label, cls } = map[order.status] || map.pending;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cls}`}>{label}</span>;
  };

  if (!session) return null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans">
      {profile?.is_suspended && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-[2rem] p-6 flex items-start gap-4">
          <ShieldAlert size={24} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Ton compte est actuellement suspendu.</p>
            <p className="text-xs text-red-600/90 mt-1">Tu ne peux plus effectuer d'achat ni de recharge. Contacte le support pour régulariser ta situation.</p>
          </div>
        </div>
      )}
      {viewOrder && <OrderCredentialsModal order={viewOrder} onClose={() => setViewOrder(null)} lang={lang} />}
      {showTransfer && (
        <TransferCreditsModal
          profile={profile}
          session={session}
          fetchProfile={fetchProfile}
          onClose={() => setShowTransfer(false)}
          lang={lang}
          t={t}
        />
      )}

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('myOrders')}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-10">
        <div className="bg-gray-900 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 mb-8">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('currentBalance')}</div>
            <div className="text-5xl font-black font-price text-white">${profile?.balance?.toFixed(2) || "0.00"}</div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4 max-w-xl">
            <button onClick={() => navigate('recharge')} className="flex-1 bg-primary text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-sm hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <Plus size={18} /> {t('topUpBtn')}
            </button>
            <button onClick={() => setShowTransfer(true)} className="flex-1 bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Send size={16} /> {t('transferBtn')}
            </button>
          </div>
          <Wallet size={180} className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none" />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-soft">
        {/* Barre d'options */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendEmailAll}
              onChange={e => handleEmailToggle(e.target.checked)}
              className="rounded border-gray-300 dark:border-slate-600 dark:bg-slate-800 text-primary focus:ring-primary"
            />
            <span>{t('emailDeliveryOptIn')}</span>
          </label>
        </div>

        {loading ? (
          <div className="py-4"><SkeletonRows rows={5} cols={6} /></div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-slate-800 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-700">
            <p className="text-gray-400 dark:text-gray-500 font-bold">{t('noOrders')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                  <th className="pb-5 pr-4 whitespace-nowrap">{t('orderCode')}</th>
                  <th className="pb-5 pr-4">{t('productsBought')}</th>
                  <th className="pb-5 pr-4">{t('status')}</th>
                  <th className="pb-5 pr-4 text-right whitespace-nowrap">{t('total')}</th>
                  <th className="pb-5 pr-4 whitespace-nowrap">Date</th>
                  <th className="pb-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {displayOrders.map(order => {
                  const { baseName, options } = parseProductOptions(order.product_name);
                  const canDownload = hasDelivery(order);
                  return (
                    <tr key={order.id} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Code de commande */}
                      <td className="py-5 pr-4">
                        <span className="font-black text-gray-900 dark:text-white text-base font-mono tracking-widest">#{shortOrderId(order.id)}</span>
                      </td>

                      {/* Produits + options */}
                      <td className="py-5 pr-4 max-w-xs">
                        <div className="font-bold text-gray-900 dark:text-white text-sm leading-snug mb-1.5">
                          {cleanProductName(baseName || order.product_name, lang)}
                          <span className="text-gray-400 font-medium ml-1">x{order.quantity}</span>
                        </div>
                        {options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {options.map((opt, i) => (
                              <span
                                key={i}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${optionBadgeClass(opt)}`}
                              >
                                {opt.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-5 pr-4">{statusBadge(order)}</td>

                      {/* Total */}
                      <td className="py-5 pr-4 text-right font-black text-gray-900 dark:text-white whitespace-nowrap">
                        ${order.total_price?.toFixed(2)}
                      </td>

                      {/* Date */}
                      <td className="py-5 pr-4 text-sm text-gray-400 dark:text-gray-500 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="py-5">
                        {order.product_id === 999 || order.product_id === 998 ? (
                          order.product_id === 999 && order.status === 'pending' && order.payment_method === 'binance_pay' ? (
                            new Date(order.expires_at || 0).getTime() > Date.now() ? (
                              <button onClick={() => onResume && onResume(order)} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary/20 transition-all">
                                <RefreshCcw size={14} /> Continuer
                              </button>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Expiré</span>
                            )
                          ) : null
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewOrder(order)}
                              title={t('view')}
                              className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => canDownload && downloadCredentials(order)}
                              disabled={!canDownload}
                              title={canDownload ? t('download') : ""}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                                canDownload
                                  ? 'border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-white dark:text-gray-900 cursor-pointer'
                                  : 'border-gray-100 text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('previous') || 'Précédent'}
            </button>
            <span className="text-sm font-bold text-gray-500 dark:text-gray-400">
              Page {page} / {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            >
              {t('next') || 'Suivant'}
            </button>
          </div>
        )}

        {/* Note livraison en cours */}
        {orders.some(o => o.status === 'processing') && (
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-medium">
            <RefreshCcw size={12} className="animate-spin text-primary" />
            Certains articles sont encore en cours de livraison — actualisation automatique…
          </div>
        )}
      </div>
    </div>
  );
};
export default MyOrdersView;
