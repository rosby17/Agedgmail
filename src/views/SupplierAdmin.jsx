import { SUPPLIER_LABEL } from '../utils/constants';
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
import BinancePaymentsAdmin from './BinancePaymentsAdmin';
import SupportAdmin from './SupportAdmin';
import OrdersAdmin from './OrdersAdmin';
import SettingsTab from './SettingsTab';

const SupplierAdmin = ({ products = [], fetchProducts }) => {
  const [settingsBySupplier, setSettingsBySupplier] = useState({});
  const [mappings, setMappings] = useState([]);
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [syncing, setSyncing] = useState(null); // nom du fournisseur en cours de sync
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ supplier_product_id: '', margin_percent: 30, active: true });
  const [newMap, setNewMap] = useState({ product_id: '', supplier: 'ytseller', supplier_product_id: '', margin_percent: 30 });
  const [marginInput, setMarginInput] = useState('');
  const [busyRetryId, setBusyRetryId] = useState(null);

  const productName = (id) => products.find(p => p.id === id)?.name || `#${id}`;

  const fetchAll = async () => {
    if (!supabase) return;
    const [s, m, o, l] = await Promise.all([
      supabase.from('supplier_settings').select('*').in('supplier', SUPPLIERS),
      supabase.from('product_supplier_mapping').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('id, product_name, quantity, total_price, supplier, supplier_order_id, supplier_status, supplier_last_checked_at, created_at')
        .eq('status', 'processing').in('supplier', SUPPLIERS).order('created_at', { ascending: false }),
      supabase.from('supplier_logs').select('*').order('created_at', { ascending: false }).limit(25),
    ]);
    const bySupplier = {};
    (s.data || []).forEach(row => { bySupplier[row.supplier] = row; });
    setSettingsBySupplier(bySupplier);
    setMarginInput(m.data?.[0]?.margin_percent ?? 50);
    setMappings(m.data || []);
    setPending(o.data || []);
    setLogs(l.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSync = async (supplier) => {
    setSyncing(supplier); setMsg('');
    try {
      const { data, error } = await supabase.functions.invoke(`${supplier}-sync-catalog`, { body: {} });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const extra = data.merged != null ? `, ${data.merged} fusionné(s)` : '';
      setMsg(`${SUPPLIER_LABEL[supplier]} : ${data.created} créé(s)${extra}, ${data.updated} maj — solde ${data.balance} ${data.currency}.`);
      await fetchAll();
      if (fetchProducts) await fetchProducts();
    } catch (e) {
      setMsg(`Erreur sync ${SUPPLIER_LABEL[supplier]} : ` + e.message);
    }
    setSyncing(null);
  };

  const handleRetryDropship = async (orderId) => {
    setBusyRetryId(orderId);
    setMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('dropship-place-order', {
        body: { orderId }
      });
      if (error || data?.error) {
        setMsg('Erreur relance : ' + (data?.error || error?.message));
      } else {
        setMsg(`Commande relancée avec succès ! (ID fournisseur : ${data.supplier_order_id || 'transmis'})`);
        await fetchAll();
      }
    } catch (e) {
      setMsg('Erreur relance : ' + e.message);
    } finally {
      setBusyRetryId(null);
    }
  };

  const handleFullImport = async () => {
    const ok = await window.showConfirm("Import complet", 'IMPORT COMPLET YTSELLER : cela va importer tout le catalogue, supprimer les produits à stock local et vider account_stock. Continuer ?');
    if (!ok) return;
    setSyncing('ytseller'); setMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('ytseller-sync-catalog', { body: { full: true } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setMsg(`Import complet OK — ${data.created} créé(s), ${data.updated} maj, ${data.wiped} legacy supprimé(s). Solde ${data.balance} ${data.currency}.`);
      await fetchAll();
      if (fetchProducts) await fetchProducts();
    } catch (e) {
      setMsg('Erreur import : ' + e.message);
    }
    setSyncing(null);
  };

  const handleSaveMargin = async () => {
    const v = Number(marginInput);
    if (isNaN(v) || v < 0) { setMsg('Marge invalide.'); return; }
    const { error } = await supabase.from('product_supplier_mapping').update({ margin_percent: v }).in('supplier', SUPPLIERS);
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setMsg('Marge appliquée à tous les produits (tous fournisseurs). Synchro en cours…');
    for (const s of SUPPLIERS) await handleSync(s);
  };

  const startEdit = (m) => {
    setEditing(m.id);
    setEditForm({ supplier_product_id: m.supplier_product_id, margin_percent: m.margin_percent, active: m.active });
  };

  const saveEdit = async (id) => {
    const { error } = await supabase.from('product_supplier_mapping').update({
      supplier_product_id: String(editForm.supplier_product_id).trim(),
      margin_percent: Number(editForm.margin_percent) || 0,
      active: !!editForm.active,
    }).eq('id', id);
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setEditing(null);
    await fetchAll();
  };

  const handleAdd = async () => {
    if (!newMap.product_id || !String(newMap.supplier_product_id).trim()) {
      setMsg('Choisis un produit et renseigne l’ID fournisseur.'); return;
    }
    const { error } = await supabase.from('product_supplier_mapping').insert({
      product_id: Number(newMap.product_id),
      supplier: newMap.supplier,
      supplier_product_id: String(newMap.supplier_product_id).trim(),
      margin_percent: Number(newMap.margin_percent) || 0,
      active: true,
    });
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setNewMap({ product_id: '', supplier: 'ytseller', supplier_product_id: '', margin_percent: 30 });
    await handleSync(newMap.supplier); // renseigne rate/stock/prix immédiatement
  };

  const handleDelete = async (m) => {
    const ok = await window.showConfirm("Retirer le mapping", `Retirer le mapping ${SUPPLIER_LABEL[m.supplier] || m.supplier} de "${productName(m.product_id)}" ?`);
    if (!ok) return;
    await supabase.from('product_supplier_mapping').delete().eq('id', m.id);
    // Si c'était le seul mapping du produit, il repasse en stock local.
    const { count } = await supabase.from('product_supplier_mapping').select('id', { count: 'exact', head: true }).eq('product_id', m.product_id);
    if (!count) await supabase.from('products').update({ is_dropship: false, supplier_stock: 0 }).eq('id', m.product_id);
    await fetchAll();
    if (fetchProducts) await fetchProducts();
  };

  const sellPrice = (m) => Math.round((Number(m.supplier_rate) || 0) * (1 + (Number(m.margin_percent) || 0) / 100) * 100) / 100;
  const unmappedProducts = products.filter(p => !mappings.some(m => m.product_id === p.id));

  return (
    <div className="space-y-8">
      {/* Soldes + synchro par fournisseur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUPPLIERS.map(supplier => {
          const settings = settingsBySupplier[supplier];
          return (
            <div key={supplier} className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-soft">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{SUPPLIER_LABEL[supplier]} Balance</div>
              <div className="text-3xl font-black font-mono text-gray-900 dark:text-white mb-1">
                {settings ? `${Number(settings.balance).toFixed(2)} ${settings.currency}` : '—'}
              </div>
              <div className="text-xs text-gray-400 mb-6">
                {settings?.last_catalog_sync ? `Last sync: ${new Date(settings.last_catalog_sync).toLocaleString()}` : 'Never synced'}
              </div>
              {settings && Number(settings.balance) <= 0 && (
                <div className="mb-4 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Balance is 0 — top up to deliver via this supplier.
                </div>
              )}
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => handleSync(supplier)} disabled={syncing === supplier}
                  className="h-11 px-5 rounded-xl bg-gray-900 text-white dark:text-gray-900 font-bold text-sm flex items-center gap-2 hover:bg-primary transition-all disabled:opacity-50">
                  <RefreshCcw size={14} className={syncing === supplier ? 'animate-spin' : ''} /> {syncing === supplier ? 'Syncing…' : 'Sync'}
                </button>
                {supplier === 'ytseller' && (
                  <button onClick={handleFullImport} disabled={!!syncing}
                    className="h-11 px-5 rounded-xl bg-primary text-white dark:text-gray-900 font-bold text-sm flex items-center gap-2 hover:bg-primaryDark transition-all disabled:opacity-50">
                    <Download size={14} /> Full import (reset)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {msg && <div className="text-sm font-bold text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-2xl px-5 py-3">{msg}</div>}

      {/* Marge globale */}
      <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-soft">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Global margin % (tous fournisseurs)</label>
        <div className="flex gap-2">
          <input type="number" value={marginInput} onChange={e => setMarginInput(e.target.value)} className="w-24 h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-700 font-mono bg-transparent" />
          <button onClick={handleSaveMargin} className="h-12 px-4 rounded-xl bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-slate-700"><Save size={16} /></button>
        </div>
      </div>

      {/* Mapping produits */}
      <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Product mapping</h2>
        <p className="text-xs text-gray-400 -mt-6 mb-8">Un produit peut avoir un mapping par fournisseur ; celui marqué "Active" (le moins cher, en stock) fixe le prix/stock affichés en boutique.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                <th className="pb-4">My product</th><th className="pb-4">Supplier</th><th className="pb-4">Supplier ID</th><th className="pb-4">Cost</th>
                <th className="pb-4">Margin %</th><th className="pb-4">Sell price</th><th className="pb-4">Avail</th>
                <th className="pb-4">Active</th><th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {mappings.map(m => (
                <tr key={m.id} className="text-gray-700 dark:text-gray-300">
                  <td className="py-4 font-bold">{productName(m.product_id)}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-xs">{SUPPLIER_LABEL[m.supplier] || m.supplier}</span></td>
                  {editing === m.id ? (
                    <>
                      <td className="py-4"><input value={editForm.supplier_product_id} onChange={e => setEditForm({ ...editForm, supplier_product_id: e.target.value })} className="w-24 px-2 py-1 rounded-lg border border-gray-200 font-mono" /></td>
                      <td className="py-4 font-mono">${Number(m.supplier_rate).toFixed(2)}</td>
                      <td className="py-4"><input type="number" value={editForm.margin_percent} onChange={e => setEditForm({ ...editForm, margin_percent: e.target.value })} className="w-20 px-2 py-1 rounded-lg border border-gray-200 font-mono" /></td>
                      <td className="py-4 font-mono text-gray-400 dark:text-slate-500">—</td>
                      <td className="py-4">{m.supplier_available}</td>
                      <td className="py-4"><input type="checkbox" checked={editForm.active} onChange={e => setEditForm({ ...editForm, active: e.target.checked })} /></td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => saveEdit(m.id)} className="p-2 rounded-lg bg-green-500 text-white"><Save size={14} /></button>
                        <button onClick={() => setEditing(null)} aria-label="Cancel edit" className="p-2 rounded-lg bg-gray-100 text-gray-500"><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 font-mono">{m.supplier_product_id}</td>
                      <td className="py-4 font-mono">${Number(m.supplier_rate).toFixed(2)}</td>
                      <td className="py-4 font-mono">{Number(m.margin_percent).toFixed(0)}%</td>
                      <td className="py-4 font-mono font-bold text-gray-900">${sellPrice(m).toFixed(2)}</td>
                      <td className="py-4">
                        <span className={m.supplier_available > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{m.supplier_available}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{m.supplier_status || ''}</span>
                      </td>
                      <td className="py-4">{m.active ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}</td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => startEdit(m)} className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(m)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash size={14} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {mappings.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-400 dark:text-slate-500">No mapped product.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Ajout mapping */}
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product</label>
            <select value={newMap.product_id} onChange={e => setNewMap({ ...newMap, product_id: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-bold min-w-[220px] bg-transparent">
              <option value="">— Choose —</option>
              {unmappedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supplier</label>
            <select value={newMap.supplier} onChange={e => setNewMap({ ...newMap, supplier: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-bold bg-transparent">
              {SUPPLIERS.map(s => <option key={s} value={s}>{SUPPLIER_LABEL[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supplier ID</label>
            <input value={newMap.supplier_product_id} onChange={e => setNewMap({ ...newMap, supplier_product_id: e.target.value })} placeholder="ex: 11" className="px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-mono w-28 bg-transparent" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Margin %</label>
            <input type="number" value={newMap.margin_percent} onChange={e => setNewMap({ ...newMap, margin_percent: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 font-mono w-24 bg-transparent" />
          </div>
          <button onClick={handleAdd} className="h-12 px-6 rounded-xl bg-primary text-white dark:text-gray-900 font-bold text-sm flex items-center gap-2"><Plus size={16} /> Map</button>
        </div>
      </div>

      {/* Commandes en attente fournisseur */}
      <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Pending supplier orders ({pending.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                <th className="pb-4">Order</th><th className="pb-4">Product</th><th className="pb-4">Supplier</th><th className="pb-4">Qty</th>
                <th className="pb-4">Supplier #</th><th className="pb-4">Status</th><th className="pb-4">Last check</th><th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
              {pending.map(o => (
                <tr key={o.id} className="text-gray-700 dark:text-gray-300">
                  <td className="py-4 font-mono">#{o.id}</td>
                  <td className="py-4 font-bold">{cleanProductName(o.product_name, 'fr')}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 font-bold text-xs">{SUPPLIER_LABEL[o.supplier] || o.supplier}</span></td>
                  <td className="py-4">{o.quantity}</td>
                  <td className="py-4 font-mono">{o.supplier_order_id || '—'}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded-lg bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-500/20 text-yellow-700 dark:text-yellow-400 font-bold text-xs">{o.supplier_status || 'Pending'}</span></td>
                  <td className="py-4 text-xs text-gray-400">{o.supplier_last_checked_at ? new Date(o.supplier_last_checked_at).toLocaleString() : '—'}</td>
                  <td className="py-4">
                    {!o.supplier_order_id && (
                      <button
                        onClick={() => handleRetryDropship(o.id)}
                        disabled={busyRetryId === o.id}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white dark:text-gray-900 font-bold text-xs hover:bg-primaryDark transition-all disabled:opacity-50"
                      >
                        {busyRetryId === o.id ? 'Relance...' : 'Relancer'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400 dark:text-slate-500">No pending order.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-soft">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Supplier log</h2>
          <button onClick={fetchAll} className="text-sm font-bold text-primary hover:underline flex items-center gap-2"><RefreshCcw size={14} /> Refresh</button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map(l => (
            <div key={l.id} className={`text-xs rounded-xl px-4 py-3 flex items-start gap-3 ${l.level === 'error' ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20' : 'bg-gray-50 dark:bg-slate-800/50 text-gray-600 dark:text-gray-300'}`}>
              <span className="font-mono text-gray-400 shrink-0">{new Date(l.created_at).toLocaleTimeString()}</span>
              <span className="font-bold shrink-0 uppercase tracking-wide">{SUPPLIER_LABEL[l.supplier] || l.supplier}</span>
              <span className="font-bold shrink-0 uppercase tracking-wide">{l.action}</span>
              <span>{l.message}{l.order_id ? ` (cmd #${l.order_id})` : ''}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="py-8 text-center text-gray-400 text-sm">No log.</div>}
        </div>
      </div>
    </div>
  );
};
export default SupplierAdmin;
