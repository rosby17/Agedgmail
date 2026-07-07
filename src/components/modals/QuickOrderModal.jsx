import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu } from 'lucide-react';
import { supabase } from '../../supabaseClient';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from '../../utils/constants';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from '../../utils/helpers';
import { YouTubeLogo, GmailLogo, FacebookIcon, DiscordLogo, InstagramLogo, TwitterLogo, TikTokLogo, AppleLogo, TelegramLogo, SmsLogo, RedditLogo, MailGenericLogo, OutlookLogo, SnapchatLogo, AmazonLogo, GithubLogo } from '../ui/Logos';
import { Skeleton, SkeletonProductCard, SkeletonProductGrid, SkeletonRows, SkeletonMetricCards } from '../ui/Skeletons';
import { TypewriterText } from '../ui/TypewriterText';
import ProductCard from '../ui/ProductCard';
import ProductVisual from '../ui/ProductVisual';
import DeliveredAccountCard from '../ui/DeliveredAccountCard';

const QuickOrderModal = ({ product, session, profile, navigate, onClose, fetchProfile, fetchProducts, setRechargeSuggestedAmount, lang }) => {
  const [qty, setQty] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const total = product.price * qty;
  const balance = profile?.balance || 0;
  const hasEnoughBalance = balance >= total;

  const applyPromo = () => {
    if (!promoCode.trim()) return;
    setPromoMsg("Code promo invalide.");
  };

  const handlePay = async () => {
    if (!session || !profile) { onClose(); navigate('auth'); return; }
    if (profile.is_suspended) { setErrorMessage("Ton compte est suspendu. Contacte le support."); return; }
    setIsProcessing(true);
    setErrorMessage('');

    try {
      if (balance < total) throw new Error("Insufficient balance.");

      if (product.is_dropship) {
        const { data: dsOrder, error: dsErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          total_price: total,
          status: 'processing',
          created_at: new Date().toISOString()
        }).select('id').single();

        if (dsErr) throw dsErr;
        if (!dsOrder) throw new Error("The order could not be created.");

        supabase.functions.invoke('dropship-place-order', { body: { orderId: dsOrder.id } })
          .catch(e => console.error('dropship-place-order invoke:', e));

      } else {
        const { data: stockRows, error: stockErr } = await supabase
          .from('account_stock')
          .select('id, credentials')
          .eq('product_id', product.id)
          .eq('is_delivered', false)
          .limit(qty);

        if (stockErr) throw new Error("Error retrieving stock.");
        if (!stockRows || stockRows.length < qty) {
          throw new Error(`No more accounts available in stock for ${product.name}.`);
        }

        const deliveredCreds = stockRows.map(r => r.credentials).join('\n');
        const stockIds = stockRows.map(r => r.id);

        const { data: orderData, error: orderInsertErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          total_price: total,
          status: 'confirmed',
          credentials: deliveredCreds,
          data: deliveredCreds,
          created_at: new Date().toISOString()
        }).select('id').single();

        if (orderInsertErr) throw orderInsertErr;
        if (!orderData) throw new Error("Order created but ID could not be retrieved.");

        await supabase.from('account_stock').update({
          is_delivered: true,
          order_id: String(orderData.id),
          delivered_to: session.user.id,
        }).in('id', stockIds);

        // Envoyer les credentials par email si le client a opté pour cette option
        if (profile?.send_email_on_delivery) {
          supabase.functions.invoke('send-delivery-email', { body: { orderId: orderData.id } })
            .catch(e => console.error('send-delivery-email error:', e));
        }
      }

      const { error: balanceErr } = await supabase
        .from('profiles')
        .update({ balance: balance - total })
        .eq('id', session.user.id);
      if (balanceErr) throw balanceErr;

      setPurchaseSuccess(true);
      await fetchProfile(session.user.id);
      if (fetchProducts) await fetchProducts();

      setTimeout(() => { onClose(); navigate('dashboard'); }, 1500);

    } catch (err) {
      console.error('Quick order error:', err);
      setErrorMessage(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order</h2>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:text-white transition-all"><X size={18} /></button>
        </div>

        <div className="px-8 pb-8 pt-4 space-y-6">
          {!session ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Log in to buy this product with your balance.</p>
              <button onClick={() => { onClose(); navigate('auth'); }} className="w-full py-4 rounded-2xl font-bold bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all">Log in</button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment method</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col">
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">Selected</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Balance (${balance.toFixed(2)})</span>
                  </div>
                  <button onClick={() => { onClose(); navigate('recharge'); }} className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all text-left">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><Plus size={14} /> Top up</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cart</span>
                  <span className="w-5 h-5 rounded-full bg-gray-900 dark:bg-primary text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center">1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shrink-0"><ProductVisual product={product} iconSize={20} /></div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{cleanProductName(product.name, lang)}</div>
                    <div className="text-xs text-gray-400">${product.price.toFixed(2)} × {qty}</div>
                  </div>
                  <div className="flex items-center bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 shrink-0">
                    <button onClick={() => qty > 1 && setQty(qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Minus size={12} /></button>
                    <div className="w-8 text-center font-bold text-sm">{qty}</div>
                    <button onClick={() => qty < product.stock && setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Plus size={12} /></button>
                  </div>
                  <div className="text-sm font-black text-primary font-mono shrink-0">${total.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Promo code</label>
                <div className="flex gap-2">
                  <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoMsg(''); }} className="flex-grow px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Enter code" />
                  <button onClick={applyPromo} className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Apply</button>
                </div>
                {promoMsg && <p className="text-xs text-red-500 font-bold mt-2">{promoMsg}</p>}
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800" />

              <div className="flex items-center justify-between">
                <span className="text-base font-black text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">{errorMessage}</div>
              )}

              {!hasEnoughBalance && !purchaseSuccess ? (
                <button
                  onClick={() => {
                    const missing = Math.round((total - balance) * 100) / 100;
                    setRechargeSuggestedAmount(missing > 0 ? missing : null);
                    onClose(); navigate('recharge');
                  }}
                  className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Plus size={20} /> Top up ${Math.max(0, Math.round((total - balance) * 100) / 100).toFixed(2)}
                </button>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={isProcessing || purchaseSuccess}
                  className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${purchaseSuccess ? 'bg-green-500 text-white dark:text-gray-900' : 'bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/20'}`}
                >
                  {isProcessing ? <RefreshCcw size={20} className="animate-spin" /> : purchaseSuccess ? <CheckCircle size={20} /> : <Zap size={20} />}
                  {isProcessing ? 'Processing...' : purchaseSuccess ? 'Delivered!' : 'Pay & receive'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default QuickOrderModal;
