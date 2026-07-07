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
import SupportAdmin from './SupportAdmin';
import OrdersAdmin from './OrdersAdmin';
import SettingsTab from './SettingsTab';

const BinancePaymentsAdmin = ({ allOrders, fetchAllOrders }) => {
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');
  const [codeByUser, setCodeByUser] = useState({});

  const pending = allOrders.filter(o => o.product_id === 999 && (o.payment_method === 'binance_pay' || o.payment_method === 'usdt_trc20') && o.status === 'pending');

  useEffect(() => {
    const userIds = [...new Set(pending.map(o => o.user_id))];
    if (userIds.length === 0) return;
    supabase.from('profiles').select('id, display_name').in('id', userIds).then(({ data }) => {
      const map = {};
      (data || []).forEach(p => { map[p.id] = p.display_name; });
      setCodeByUser(map);
    });
  }, [allOrders]);

  const handleConfirm = async (order) => {
    setBusyId(order.id);
    setMsg('');
    const { data, error } = await supabase.functions.invoke('binance-confirm-manual', { body: { orderId: order.id } });
    if (error || data?.error) {
      setMsg('Erreur : ' + (data?.error || error?.message));
    } else {
      setMsg(`Confirmé — $${Number(data.credited).toFixed(2)} crédité(s).`);
      await fetchAllOrders();
    }
    setBusyId(null);
  };

  const handleReject = async (order) => {
    setBusyId(order.id);
    setMsg('');
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    if (error) {
      setMsg('Erreur : ' + error.message);
    } else {
      setMsg(`Paiement de ${order.buyer_email} rejeté (statut annulé).`);
      await fetchAllOrders();
    }
    setBusyId(null);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-6 md:p-10 shadow-soft text-gray-900 dark:text-white">
      <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Dépôts Crypto (Binance & USDT) — Validation</h2>
      <p className="text-xs text-gray-400 dark:text-slate-450 mb-8">Vérifie sur ton wallet ou app Binance qu'un paiement du montant exact est bien arrivé avant de confirmer. L'opération crédite immédiatement le solde client.</p>
      {msg && <div className="mb-6 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-slate-800/40 rounded-2xl px-5 py-3 border border-gray-100 dark:border-slate-800">{msg}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              <th className="pb-4">Client</th><th className="pb-4">Méthode</th><th className="pb-4">Pseudo (note)</th><th className="pb-4">TXID / Réf</th><th className="pb-4">Montant</th><th className="pb-4">Crédit</th>
              <th className="pb-4">Date</th><th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
            {pending.map(o => {
              const expired = o.expires_at && new Date(o.expires_at).getTime() < Date.now();
              const isBinance = o.payment_method === 'binance_pay';
              return (
                <tr key={o.id} className="text-gray-700 dark:text-gray-350 hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-4 font-bold text-gray-900 dark:text-white">{o.buyer_email}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold ${isBinance ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                      {isBinance ? 'Binance' : 'USDT TRC20'}
                    </span>
                  </td>
                  <td className="py-4 font-mono font-black text-primary tracking-widest">{isBinance ? (codeByUser[o.user_id] || '—') : '—'}</td>
                  <td className="py-4 font-mono font-black tracking-widest truncate max-w-[120px]" title={o.binance_tx_id}>{o.binance_tx_id || <span className="text-gray-300 dark:text-slate-650 font-normal italic">non soumis</span>}</td>
                  <td className="py-4 font-mono font-black">${Number(o.expected_amount).toFixed(2)}</td>
                  <td className="py-4 font-mono font-bold">${Number(o.credit_amount ?? o.total_price).toFixed(2)}</td>
                  <td className="py-4 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {isBinance && expired && <span className="ml-2 text-[9px] text-red-500 font-bold bg-red-50 dark:bg-red-950/30 px-1 py-0.5 rounded">Expiré</span>}
                  </td>
                  <td className="py-4 flex gap-2">
                    <button onClick={() => handleConfirm(o)} disabled={busyId === o.id}
                      className="px-4 py-2 rounded-xl bg-primary text-white dark:text-gray-900 font-bold text-xs hover:bg-primaryDark transition-all disabled:opacity-50">
                      {busyId === o.id ? 'Confirmation…' : 'Confirmer'}
                    </button>
                    <button onClick={() => handleReject(o)} disabled={busyId === o.id}
                      className="px-4 py-2 rounded-xl bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 font-bold text-xs hover:bg-red-200 dark:hover:bg-red-900/30 transition-all disabled:opacity-50">
                      Rejeter
                    </button>
                  </td>
                </tr>
              );
            })}
            {pending.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400 dark:text-slate-550">Aucun dépôt crypto en attente.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default BinancePaymentsAdmin;
