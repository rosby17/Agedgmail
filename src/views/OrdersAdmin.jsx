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
import SettingsTab from './SettingsTab';

const OrdersAdmin = ({ allOrders, fetchAllOrders, lang = 'fr', loading = false }) => {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelPromptOrder, setCancelPromptOrder] = useState(null);

  const [productFilter, setProductFilter] = useState('all');

  const filtered = allOrders.filter(o => {
    // Exclude deposits from the general Orders view
    if (o.product_id === 999) return false;

    // Filter by Status
    if (filter !== 'all' && (o.status || 'pending') !== filter) return false;
    
    // Filter by Product Category
    if (productFilter === 'sms') return o.product_name?.toLowerCase().includes('sms');
    if (productFilter === 'accounts') return !o.product_name?.toLowerCase().includes('sms');
    return true;
  });

  const cancelOrder = (order) => {
    setCancelPromptOrder(order);
  };

  const executeCancelOrder = async (id, refund = false) => {
    const { data: order, error: orderErr } = await supabase
      .from('orders').select('id, user_id, status, total_price').eq('id', id).single();
    if (orderErr || !order) { await window.showAlert("Erreur", "Commande introuvable."); return; }
    if (order.status === 'cancelled') { fetchAllOrders(); return; }

    if (refund) {
      // Remboursement atomique via RPC admin (verrou FOR UPDATE — anti double-
      // crédit). admin_adjust_balance vérifie la claim email admin côté serveur.
      const { error: creditErr } = await supabase.rpc('admin_adjust_balance', {
        p_user_id: order.user_id,
        p_delta: order.total_price || 0,
      });
      if (creditErr) { await window.showAlert("Erreur", "Erreur lors du remboursement : " + creditErr.message); return; }

      const updatePayload = { status: 'cancelled', is_refunded: true };
      const { error: updateErr } = await supabase.from('orders').update(updatePayload).eq('id', id);
      if (updateErr) {
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
      }
    } else {
      const updatePayload = { status: 'cancelled', is_refunded: false };
      const { error: updateErr } = await supabase.from('orders').update(updatePayload).eq('id', id);
      if (updateErr) {
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
      }
    }
    fetchAllOrders();
  };

  const deleteOrder = async (id) => {
    const ok = await window.showConfirm("Confirmation", "Supprimer définitivement cette commande ?");
    if (!ok) return;
    await supabase.from('orders').delete().eq('id', id);
    fetchAllOrders();
  };

  const statusBadge = (status) => {
    const s = status || 'pending';
    const map = {
      pending: { label: 'En attente', icon: Clock, cls: 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30' },
      processing: { label: 'En cours', icon: RefreshCcw, cls: 'bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' },
      confirmed: { label: 'Payé / livré', icon: CheckCircle, cls: 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30' },
      cancelled: { label: 'Annulé', icon: X, cls: 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30' },
    };
    const { label, icon: Icon, cls } = map[s] || map.pending;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 w-fit ${cls}`}><Icon size={12} /> {label}</span>;
  };

  const isRecharge = (order) => order.product_id === 999;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-soft space-y-8 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Commandes</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">Suivi uniquement — le paiement et la livraison se font automatiquement.</p>
        </div>
        <button onClick={fetchAllOrders} className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:text-primary transition-all">
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        {/* Status Filters */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Toutes', icon: FileText },
            { key: 'pending', label: 'En attente', icon: Clock },
            { key: 'processing', label: 'En cours', icon: RefreshCcw },
            { key: 'confirmed', label: 'Payées / livrées', icon: CheckCircle },
            { key: 'cancelled', label: 'Annulées', icon: X },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                filter === f.key
                  ? 'bg-gray-900 dark:bg-primary text-white dark:text-gray-900 shadow-sm'
                  : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-800'
              }`}>
              <f.icon size={14} /> {f.label}
            </button>
          ))}
        </div>

        {/* Product Category Filters */}
        <div className="flex gap-2 flex-wrap md:ml-auto">
          {[
            { key: 'all', label: 'Tous produits' },
            { key: 'accounts', label: 'Comptes' },
            { key: 'sms', label: 'SMS' },
          ].map(f => (
            <button key={f.key} onClick={() => setProductFilter(f.key)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                productFilter === f.key
                  ? 'bg-primary text-white dark:text-gray-900 shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 border border-gray-200 dark:border-slate-700'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-4"><SkeletonRows rows={6} cols={6} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/40 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-800">
          <p className="text-gray-400 dark:text-slate-500 font-bold">Aucune commande</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                <th className="pb-4">Produit / ID</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Montant</th>
                <th className="pb-4">Statut</th>
                <th className="pb-4">Date</th>
                <th className="pb-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-5">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{cleanProductName(order.product_name, lang)}</p>
                    <p className="text-gray-400 dark:text-slate-500 text-[10px] font-mono">#{String(order.id).slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="py-5 text-sm text-gray-600 dark:text-slate-300">{order.buyer_email || '—'}</td>
                  <td className="py-5 font-mono">
                    <div className="font-bold text-gray-900 dark:text-white">
                      ${order.total_price?.toFixed(2)}
                    </div>
                    {order.status === 'cancelled' && order.is_refunded === true && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        <span>↩</span>
                        <span>${order.total_price?.toFixed(2)}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-5">{statusBadge(order.status)}</td>
                  <td className="py-5 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      {!isRecharge(order) && order.status === 'confirmed' && (
                        <button onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all" title="Voir les accès livrés" aria-label="Voir les accès livrés">
                          <Eye size={14} />
                        </button>
                      )}
                      {order.status !== 'cancelled' && (
                        <button onClick={() => cancelOrder(order)}
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-950/10 text-red-500 hover:bg-red-150 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/20"
                          title="Annuler / Rembourser la commande"
                          aria-label="Annuler la commande"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteOrder(order.id)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-500 transition-all" title="Supprimer définitivement" aria-label="Supprimer la commande">
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] shadow-2xl p-10 space-y-8 text-gray-900 dark:text-white animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Détail de la commande</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">ID: #{String(selectedOrder.id).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} aria-label="Close" className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
              {[
                ['Produit', cleanProductName(selectedOrder.product_name, lang), Package],
                ['Email Client', selectedOrder.buyer_email || '—', Mail],
                ['Montant', `$${selectedOrder.total_price?.toFixed(2)}`, Wallet],
                ['Date', new Date(selectedOrder.created_at).toLocaleString(), Clock],
              ].map(([label, val, Icon]) => (
                <div key={label} className="flex justify-between items-center group">
                  <span className="text-gray-400 dark:text-slate-400 font-medium text-xs flex items-center gap-2">
                    <Icon size={14} className="text-gray-300 dark:text-slate-650 group-hover:text-primary transition-colors" /> {label}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Contenu livré au client</label>
              <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-3xl p-1 shadow-inner">
                {/* SECURITE : rendu JSX pur, zéro dangerouslySetInnerHTML.
                    Les emails sont surlignés par split/map — aucun HTML injecté. */}
                <div className="font-mono text-xs text-gray-600 dark:text-slate-300 p-6 leading-relaxed break-all max-h-[400px] overflow-y-auto custom-scrollbar">
                  {(selectedOrder.credentials || selectedOrder.data || 'Identifiants introuvables.')
                    .split('\n')
                    .map((line, lineIdx) => {
                      const EMAIL_RE = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
                      const parts = line.split(EMAIL_RE);
                      return (
                        <div key={lineIdx}>
                          {parts.map((part, partIdx) =>
                            EMAIL_RE.test(part)
                              ? <span key={partIdx} className="bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded-md">{part}</span>
                              : <span key={partIdx}>{part}</span>
                          )}
                        </div>
                      );
                    })
                  }
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Modal d'annulation et choix de remboursement */}
      {cancelPromptOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-gray-900 dark:text-white">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelPromptOrder(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <RotateCcw size={24} />
              </div>
              <h3 className="text-xl font-bold">Annuler la commande</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Commande #{String(cancelPromptOrder.id).slice(0, 8).toUpperCase()} — ${cancelPromptOrder.total_price?.toFixed(2)}
              </p>
            </div>

            <p className="text-sm text-center text-gray-600 dark:text-slate-300">
              Comment souhaitez-vous traiter l'annulation de cette commande ?
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={async () => {
                  const orderId = cancelPromptOrder.id;
                  setCancelPromptOrder(null);
                  await executeCancelOrder(orderId, true); // Cancel and Refund
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Annuler et rembourser
              </button>

              <button
                onClick={async () => {
                  const orderId = cancelPromptOrder.id;
                  setCancelPromptOrder(null);
                  await executeCancelOrder(orderId, false); // Cancel only
                }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-bold border border-slate-700 dark:border-slate-800 transition-all"
              >
                Annuler uniquement (sans remboursement)
              </button>

              <button
                onClick={() => setCancelPromptOrder(null)}
                className="w-full py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-350 rounded-2xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                Ne rien faire (fermer)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default OrdersAdmin;
