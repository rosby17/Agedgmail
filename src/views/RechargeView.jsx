import { bonusPercentFor } from '../utils/helpers';
import { PAYMENT_GATEWAYS, BONUS_TIERS } from '../utils/constants';
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

const RechargeView = ({ profile, session, navigate, suggestedAmount, setSuggestedAmount, fetchProfile, resumeOrder, clearResumeOrder, lang, t }) => {
  const [amountUsd, setAmountUsd] = useState(suggestedAmount || 5);
  const [gateway, setGateway] = useState(null); // null tant que le client n'a pas choisi de passerelle
  const [payCurrency, setPayCurrency] = useState('usdttrc20');
  const [loading, setLoading] = useState(false);
  const [checkingPending, setCheckingPending] = useState(true);
  const [step, setStep] = useState('form'); // 'form' | 'manual_usdt' | 'awaiting' | 'success' | 'success_manual'
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null); // { orderId, payAddress, payAmount, payCurrency, bonusPct, creditAmount }
  const [copied, setCopied] = useState(false);
  const [minAmounts, setMinAmounts] = useState({}); // { btc: 18.78, eth: 18.78, ... }
  const [binanceSubStep, setBinanceSubStep] = useState('pay'); // 'pay' | 'verify' — Binance Pay uniquement
  const [binanceOrderIdInput, setBinanceOrderIdInput] = useState('');
  const [usdtTxidInput, setUsdtTxidInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(600);

  useEffect(() => {
    return () => setSuggestedAmount(null);
  }, []);

  useEffect(() => {
    // Récupérer le taux de change dynamique depuis Binance P2P
    const fetchExchangeRate = async () => {
      try {
        const { data } = await supabase.functions.invoke('get-exchange-rate');
        if (data && data.rate) {
          setExchangeRate(data.rate);
        }
      } catch (e) {
        console.warn('Failed to fetch dynamic exchange rate', e);
      }
    };
    fetchExchangeRate();
  }, []);

  useEffect(() => {
    if (!session) {
      navigate('auth');
    }
  }, [session, navigate]);

  useEffect(() => {
    if (!session || resumeOrder) {
      if (!resumeOrder) setCheckingPending(false);
      return;
    }
    const checkPendingOrder = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('status', 'pending')
        .in('payment_method', ['usdt_trc20', 'binance_pay'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        if (data.payment_method === 'usdt_trc20') {
          setPayment({
            provider: 'usdt_trc20',
            orderId: data.id,
            expectedAmount: data.expected_amount,
            address: 'TFy2DpPjsHhsbTeMVhtAQ8JuYxjUkKTMPu'
          });
          setStep('manual_usdt');
        } else if (data.payment_method === 'binance_pay') {
          setPayment({
            provider: 'binance_pay',
            orderId: data.id,
            payId: data.pay_id,
            expectedAmount: data.expected_amount,
            creditAmount: data.credit_amount,
            paymentCode: profile?.display_name,
            binanceOrderId: data.binance_tx_id || undefined,
            expiresAt: data.expires_at ? new Date(data.expires_at).getTime() : Date.now() + 20 * 60_000,
          });
          setBinanceSubStep(data.binance_tx_id ? 'submitted' : 'pay');
          setStep('awaiting');
        }
      }
      setCheckingPending(false);
    };
    checkPendingOrder();
  }, [session, profile, resumeOrder]);

  // Reprise d'une commande Binance Pay 'pending' depuis "Mes commandes" : on
  // rejoue l'étape d'attente avec les infos déjà en base, sans recréer de
  // commande (le montant/code/expiration restent ceux d'origine).
  useEffect(() => {
    if (!resumeOrder) return;
    setPayment({
      provider: 'binance_pay',
      orderId: resumeOrder.id,
      payId: resumeOrder.pay_id,
      expectedAmount: resumeOrder.expected_amount,
      creditAmount: resumeOrder.credit_amount,
      paymentCode: profile?.display_name,
      binanceOrderId: resumeOrder.binance_tx_id || undefined,
      expiresAt: resumeOrder.expires_at ? new Date(resumeOrder.expires_at).getTime() : Date.now() + 20 * 60_000,
    });
    setBinanceSubStep(resumeOrder.binance_tx_id ? 'submitted' : 'pay');
    setStep('awaiting');
    if (clearResumeOrder) clearResumeOrder();
  }, [resumeOrder]);

  // NOWPayments désactivé : plus besoin d'interroger les minimums de dépôt.

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (step !== 'awaiting' || payment?.provider !== 'binance_pay') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, payment]);

  // Nouvelle tentative automatique périodique tant que l'approbation n'a pas
  // encore trouvé de correspondance (ex. décalage de synchro côté Binance) —
  // entièrement automatique, sans étape manuelle exposée au client.
  useEffect(() => {
    if (binanceSubStep !== 'submitted' || !payment?.orderId || !payment?.binanceOrderId) return;
    const retry = setInterval(async () => {
      const { data: fnData } = await supabase.functions.invoke('binance-submit-tx', {
        body: { orderId: payment.orderId, binanceOrderId: payment.binanceOrderId },
      });
      if (fnData?.autoConfirmed) {
        clearInterval(retry);
        if (fetchProfile) await fetchProfile(session.user.id);
        setStep('success');
      }
    }, 15000);
    return () => clearInterval(retry);
  }, [binanceSubStep, payment]);



  const close = () => navigate('dashboard');
  const bonusPct = bonusPercentFor(amountUsd);
  // Devise crypto déduite de la passerelle choisie (btc / usdt_trc20 / ltc).
  const selectedGateway = PAYMENT_GATEWAYS.find(g => g.id === gateway);
  const activePayCurrency = selectedGateway?.payCurrency || null;
  const isCrypto = !!activePayCurrency;
  // Minimum affiché/appliqué : le min statique de la méthode (Binance Pay $10,
  // crypto $18), affiné par le min dynamique NOWPayments s'il est plus élevé.
  const dynamicMin = activePayCurrency ? minAmounts[activePayCurrency] : undefined;
  const selectedMin = Math.max(selectedGateway?.min || 0, typeof dynamicMin === 'number' ? dynamicMin : 0) || undefined;
  const belowMin = typeof selectedMin === 'number' && amountUsd < selectedMin;
  const remainingMs = payment?.expiresAt ? Math.max(0, payment.expiresAt - now) : 0;
  const remainingLabel = `${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}`;

  const cancelPendingOrder = async () => {
    if (!payment?.orderId) return;
    setLoading(true);
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', payment.orderId);
    setPayment(null);
    setStep('form');
    setLoading(false);
  };

  const extractFnErrorMessage = async (fnError) => {
    // Le SDK Supabase masque le corps JSON réel derrière un message
    // générique ("Edge Function returned a non-2xx status code").
    // On va chercher la vraie raison dans la réponse HTTP sous-jacente.
    let realMessage = fnError.message;
    try {
      const body = await fnError.context?.json();
      if (body?.error) realMessage = body.error;
    } catch { /* corps non-JSON ou déjà consommé, on garde le message par défaut */ }
    return realMessage;
  };

  const handleSubmit = async () => {
    if (profile?.is_suspended) { setError("Ton compte est suspendu. Contacte le support."); return; }
    if (!gateway) { setError('Choisis une passerelle de paiement.'); return; }
    if (amountUsd <= 0) { setError('Montant invalide.'); return; }
    // Minimum dynamique ou statique appliqué.
    if (selectedMin && amountUsd < selectedMin) {
      setError(`Montant minimum pour ${selectedGateway?.name} : $${selectedMin.toFixed(2)}.`);
      return;
    }

    if (gateway === 'usdt_trc20') {
      setLoading(true);
      setError('');
      try {
        const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: 999,
          product_name: 'Dépôt USDT (TRC20)',
          quantity: 1,
          total_price: amountUsd,
          expected_amount: amountUsd,
          credit_amount: amountUsd * (1 + bonusPct / 100),
          payment_method: 'usdt_trc20',
          status: 'pending'
        }).select().single();

        if (orderErr) throw orderErr;

        setPayment({
          provider: 'usdt_trc20',
          orderId: orderData.id,
          expectedAmount: amountUsd,
          address: 'TFy2DpPjsHhsbTeMVhtAQ8JuYxjUkKTMPu'
        });
        setStep('manual_usdt');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (gateway === 'binance_pay') {
      setLoading(true);
      setError('');
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('binance-create-order', {
          body: { userId: session.user.id, email: session.user.email, amountUsd, paymentMethod: 'binance_pay' },
        });
        if (fnError) throw new Error(await extractFnErrorMessage(fnError));
        if (fnData?.error === 'username_required') {
          setError('username_required');
          return;
        }
        if (fnData?.error) throw new Error(fnData.error);
        if (!fnData?.payId || !fnData?.expectedAmount) throw new Error('Réponse Binance invalide.');

        setPayment({
          provider: 'binance_pay',
          ...fnData,
          expiresAt: Date.now() + fnData.expiresInMinutes * 60_000,
        });
        setStep('awaiting');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (gateway === 'mobile_money') {
      setLoading(true);
      setError('');
      try {
        // En attendant que l'Edge Function soit créée et déployée, on va simuler l'appel.
        // On utilisera : await supabase.functions.invoke('maketou-create-checkout', { body: ... })
        const { data: fnData, error: fnError } = await supabase.functions.invoke('maketou-create-checkout', {
          body: { userId: session.user.id, email: session.user.email, amountUsd, bonusPct },
        });
        
        if (fnError) throw new Error(await extractFnErrorMessage(fnError));
        if (fnData?.error) throw new Error(fnData.error);
        if (fnData?.redirectUrl) {
          window.location.href = fnData.redirectUrl;
          return;
        }
        throw new Error('Aucun lien de paiement reçu de Maketou.');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue avec la passerelle Mobile Money.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isCrypto) {
      if (belowMin) { setError(`Montant minimum pour ${selectedGateway.name} : $${selectedMin.toFixed(2)}`); return; }

      setLoading(true);
      setError('');
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('nowpayments-create', {
          body: { userId: session.user.id, email: session.user.email, amountUsd, payCurrency: activePayCurrency },
        });

        if (fnError) {
          let realMessage = await extractFnErrorMessage(fnError);
          if (/less than minimal/i.test(realMessage)) {
            realMessage = `Ce montant est en dessous du minimum accepté pour ${selectedGateway.name}. Essaie un montant plus élevé ou une autre cryptomonnaie.`;
          }
          throw new Error(realMessage);
        }
        if (fnData?.error) throw new Error(fnData.error);
        if (!fnData?.payAddress) throw new Error('Réponse NOWPayments invalide.');

        setPayment({ provider: 'nowpayments', ...fnData });
        setStep('awaiting');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (gateway === 'mobile_money') {
      setLoading(true);
      setError('');
      try {
        const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: 999,
          product_name: 'Recharge Mobile Money',
          quantity: 1,
          total_price: amountUsd,
          status: 'pending'
        }).select().single();

        if (orderErr) throw orderErr;

        setPayment({ provider: 'mobile_money', orderId: orderData.id, expectedAmount: amountUsd, creditAmount: amountUsd * (1 + bonusPct / 100), bonusPct });
        setStep('awaiting');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const copyAddress = () => {
    if (payment?.payAddress) {
      navigator.clipboard?.writeText(payment.payAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Poll le statut de la commande jusqu'à confirmation (le webhook NOWPayments crédite le solde côté serveur).
  useEffect(() => {
    if (step !== 'awaiting' || !payment?.orderId || !supabase) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('orders').select('status').eq('id', payment.orderId).maybeSingle();
      if (data?.status === 'confirmed') {
        clearInterval(interval);
        if (fetchProfile) await fetchProfile(session.user.id);
        setStep('success');
      } else if (data?.status === 'cancelled') {
        clearInterval(interval);
        setError('Le paiement a été rejeté, a échoué ou a expiré. Réessaie avec un nouveau paiement ou vérifie tes informations.');
        setStep('form');
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [step, payment, session, fetchProfile]);

  if (!session) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">{t('topUpAccount')}</h2>
          <button onClick={close} aria-label="Close" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all"><X size={18} /></button>
        </div>

        {checkingPending ? (
          <div className="flex flex-col justify-center items-center h-64">
            <RefreshCcw size={32} className="animate-spin text-primary mb-4" />
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400">Vérification des dépôts en cours...</p>
          </div>
        ) : step === 'form' && (
          <div className="px-8 pb-8 pt-4 space-y-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Plus vous rechargez, plus le bonus est important — crédité instantanément.</p>

            {suggestedAmount && (
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-sm text-gray-600">
                Il te manque <span className="font-black text-primary">${suggestedAmount.toFixed(2)}</span> pour finaliser ta commande.
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {BONUS_TIERS.map(t => (
                <button
                  key={t.amount}
                  onClick={() => setAmountUsd(t.amount)}
                  className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${amountUsd === t.amount ? 'bg-primary/10 border-primary text-primary' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary/50 dark:hover:border-primary/50'}`}
                >
                  <span>${t.amount >= 1000 ? `${t.amount / 1000}k` : t.amount}</span>
                  {t.pct > 0 && <span className="text-primary font-black">+{t.pct}%</span>}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{t('amountToRecharge')}</label>
              <input
                type="number"
                min="5"
                step="0.01"
                value={amountUsd}
                onChange={e => setAmountUsd(Number(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 outline-none font-black text-xl font-mono text-primary"
              />
              {belowMin && (
                <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1"><AlertTriangle size={12} /> Minimum autorisé pour {selectedGateway.name} : ${selectedMin}.</p>
              )}
              {bonusPct > 0 && (
                <p className="text-xs text-primary font-bold mt-2">Bonus +{bonusPct}% → tu recevras ${(amountUsd * (1 + bonusPct / 100)).toFixed(2)} sur ton solde.</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('choosePayment')}</label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_GATEWAYS.map(g => {
                  const gDynamic = g.payCurrency ? minAmounts[g.payCurrency] : undefined;
                  const displayMin = Math.max(g.min || 0, typeof gDynamic === 'number' ? gDynamic : 0);
                  
                  return (
                    <button
                      key={g.id}
                      onClick={() => g.enabled && setGateway(g.id)}
                      disabled={!g.enabled}
                      className={`relative text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${!g.enabled ? 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-800 opacity-60 cursor-not-allowed' : gateway === g.id ? 'bg-primary/5 dark:bg-primary/10 border-primary' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-primary/50 dark:hover:border-primary/50'} ${g.recommended ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                    >
                      <span className={`absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${g.recommended ? 'text-amber-700 bg-amber-100 animate-pulse' : g.enabled ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800'}`}>
                        {g.recommended ? 'Recommandé' : g.enabled ? 'Auto' : 'Bientôt'}
                      </span>
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${g.recommended ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>{g.symbol}</span>
                      <span>
                        <span className="block text-sm font-bold text-gray-900 dark:text-white">{g.name}</span>
                        <span className="block text-[10px] text-gray-400 dark:text-gray-500 font-medium">{g.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {gateway === 'binance_pay' && (
              <div className="bg-green-50 dark:bg-green-900/10 rounded-2xl p-4 text-xs text-green-700 dark:text-green-500 leading-relaxed border border-green-200 dark:border-green-800/30">
                <span className="font-bold flex items-center gap-1 mb-1"><ShieldCheck size={14} /> 0% de frais</span>
                Paiement via Binance Pay totalement gratuit. Montant à payer : ${amountUsd.toFixed(2)}.
                <div className="mt-1 text-[10px] opacity-80">
                  Veille à coller ton pseudo dans la note Binance pour t'identifier : {profile?.display_name ? <span className="font-bold">{profile.display_name}</span> : <span>non configuré</span>}.
                </div>
              </div>
            )}

            {gateway === 'mobile_money' && (
              <div className="bg-amber-50 dark:bg-amber-900/10 rounded-2xl p-4 text-xs text-amber-700 dark:text-amber-500 leading-relaxed border border-amber-200 dark:border-amber-800/30">
                <span className="font-bold flex items-center gap-1 mb-1"><AlertTriangle size={14} /> Frais d'opérateur (8%)</span>
                Les paiements par Mobile Money (Orange, MTN, Wave...) appliquent 8% de frais de passerelle.
                <div className="mt-2 text-gray-800 dark:text-gray-300 font-bold flex justify-between items-center">
                  <span>Montant total à payer :</span>
                  <span className="text-right">
                    <span className="block text-sm">${(amountUsd * 1.08).toFixed(2)}</span>
                    <span className="block text-[10px] opacity-80">(env. {(amountUsd * 1.08 * exchangeRate).toFixed(0)} FCFA au taux de {exchangeRate}F)</span>
                  </span>
                </div>
              </div>
            )}

            {(isCrypto || (selectedGateway?.manual && gateway !== 'binance_pay')) && (
              <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed border border-gray-100 dark:border-gray-700">
                Dépôt en {selectedGateway.name} ({selectedGateway.sub}). Une adresse de dépôt et le montant exact te seront indiqués.
                {typeof selectedMin === 'number' && (
                  <> <span className="font-bold text-gray-700 dark:text-gray-300">Montant minimum : ${selectedMin.toFixed(2)}.</span></>
                )}
              </div>
            )}

            {error === 'username_required' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-sm text-amber-800 font-bold">Configure d'abord un pseudo dans tes paramètres — c'est lui qui sert à identifier tes paiements Binance Pay.</p>
                <button onClick={() => navigate('settings')} className="w-full py-3 rounded-xl bg-gray-900 text-white dark:text-gray-900 font-bold text-sm hover:bg-primary transition-all">
                  Configurer mon pseudo
                </button>
              </div>
            ) : error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            {gateway && (
              <button
                onClick={handleSubmit}
                disabled={loading || belowMin}
                className="w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/20 disabled:opacity-40"
              >
                {loading
                  ? <><RefreshCcw size={20} className="animate-spin" /> Préparation...</>
                  : <><Send size={20} /> Créer un dépôt</>}
              </button>
            )}
          </div>
        )}

        {step === 'manual_usdt' && (
          <div className="px-8 pb-8 pt-2 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-gray-900 dark:text-white">Dépôt Manuel USDT</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">Transférez exactement le montant ci-dessous via le réseau <span className="font-bold text-gray-900 dark:text-gray-200">Tron (TRC20)</span>.</p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 flex flex-col items-center gap-6 border border-gray-100 dark:border-gray-700 shadow-inner">
              <div className="text-center">
                <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest block mb-1">Montant exact à envoyer</span>
                <p className="text-4xl font-black text-primary font-mono">${Number(payment?.expectedAmount).toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${payment?.address}`} alt="QR Code USDT TRC20" className="w-40 h-40" />
              </div>
              <div className="w-full space-y-2">
                <label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest ml-2">Adresse USDT (TRC20)</label>
                <div className="flex bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                  <div className="flex-1 px-4 py-3 text-xs font-mono font-bold text-gray-600 dark:text-gray-300 truncate flex items-center">{payment?.address}</div>
                  <button onClick={() => { navigator.clipboard.writeText(payment?.address); setCopied('address'); setTimeout(() => setCopied(''), 2000); }} className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-4 flex items-center justify-center text-gray-600 dark:text-gray-300 transition-colors">
                    {copied === 'address' ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Hash de la transaction (TXID)</label>
              <input
                type="text"
                value={usdtTxidInput}
                onChange={e => setUsdtTxidInput(e.target.value)}
                placeholder="Ex: 5b6c..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">Une fois le transfert effectué, colle le TXID ici pour que nous puissions valider le paiement.</p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 dark:border-red-800">{error}</div>
            )}

            <div className="space-y-3">
              <button
                onClick={async () => {
                  if (!usdtTxidInput.trim()) { setError('Veuillez entrer le hash (TXID) de votre transaction.'); return; }
                  setVerifying(true);
                  setError('');
                  const { error: updateErr } = await supabase.from('orders')
                    .update({ binance_tx_id: usdtTxidInput.trim() })
                    .eq('id', payment.orderId);
                  
                  if (updateErr) {
                    setError("Erreur lors de l'enregistrement de la transaction : " + updateErr.message);
                  } else {
                    setStep('success_manual');
                  }
                  setVerifying(false);
                }}
                disabled={verifying}
                className="w-full py-4 rounded-2xl font-bold bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all disabled:opacity-50"
              >
                {verifying ? 'Enregistrement...' : 'Valider le paiement'}
              </button>
              <button onClick={cancelPendingOrder} disabled={loading} className="w-full py-3 rounded-2xl font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50">
                Annuler le dépôt
              </button>
            </div>
          </div>
        )}

        {step === 'success_manual' && (
          <div className="px-8 pb-8 pt-2 text-center space-y-6">
            <CheckCircle size={72} className="text-amber-500 mx-auto" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Paiement enregistré</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Ton TXID a bien été pris en compte. Un administrateur vérifiera ce dépôt et ton solde sera crédité sous peu.
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              En cas de problème, n'hésite pas à contacter le support à : <br/><span className="font-bold text-gray-700 dark:text-gray-300">support@tools-cl.com</span>
            </p>
            <button
              onClick={close}
              className="w-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-4 rounded-2xl font-bold hover:bg-primary dark:hover:bg-primary transition-all"
            >
              Fermer et retourner au site
            </button>
          </div>
        )}

        {step === 'awaiting' && payment?.provider === 'binance_pay' && (
          <div className="px-8 pb-8 pt-2 space-y-6">
            {/* Indicateur d'étapes 1/2, comme les checkouts crypto habituels */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${binanceSubStep === 'pay' ? 'bg-primary text-white dark:text-gray-900' : 'bg-primary/10 text-primary'}`}>
                  {binanceSubStep === 'verify' ? <CheckCircle size={16} /> : '1'}
                </div>
                <span className={`text-[10px] font-bold ${binanceSubStep === 'pay' ? 'text-gray-900' : 'text-gray-400'}`}>Effectuer le paiement</span>
              </div>
              <div className="w-16 h-px bg-gray-200 mb-5" />
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${binanceSubStep === 'verify' ? 'bg-primary text-white dark:text-gray-900' : 'bg-gray-100 text-gray-400'}`}>2</div>
                <span className={`text-[10px] font-bold ${binanceSubStep === 'verify' ? 'text-gray-900' : 'text-gray-400'}`}>Vérifier le paiement</span>
              </div>
            </div>

            {binanceSubStep === 'pay' ? (
              <>
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-900 dark:text-white font-mono">${Number(payment.expectedAmount).toFixed(2)}</p>
                </div>

                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-2xl p-4 shadow-sm">
                  <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2 flex items-center gap-2"><Wallet size={14} /> Envoyer à l'ID Binance</label>
                  <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-white dark:bg-gray-900 border border-primary/30 rounded-xl p-2">
                    <code className="text-xl font-black font-mono text-gray-900 dark:text-white flex-grow text-center sm:text-left flex items-center justify-center sm:justify-start px-2 py-2 sm:py-0 tracking-widest">{payment.payId}</code>
                    <button onClick={() => { navigator.clipboard?.writeText(String(payment.payId)); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="shrink-0 px-4 py-3 rounded-lg bg-primary text-white dark:text-gray-900 font-bold hover:bg-primaryDark transition-all flex items-center justify-center gap-2"><Copy size={16} /> Copier</button>
                  </div>
                  {copied && <p className="text-xs text-primary font-bold mt-2 text-center sm:text-left">Copié dans le presse-papier !</p>}
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/50 rounded-xl p-3 shadow-sm">
                  <p className="text-[10px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-widest mb-1.5 flex items-center gap-2"><AlertTriangle size={14} /> Obligatoire — note du paiement</p>
                  <p className="text-xs text-amber-900/80 dark:text-amber-200/80 leading-relaxed mb-2">
                    N'oublie pas de coller ce pseudo dans le champ <span className="font-bold">"Note"</span> du paiement sur Binance.
                  </p>
                  <div className="flex items-center gap-2 bg-white dark:bg-black/20 border border-amber-200 dark:border-amber-700/50 rounded-lg px-3 py-2">
                    <code className="text-sm font-bold font-mono text-gray-900 dark:text-white flex-grow text-left">{payment.paymentCode}</code>
                    <button onClick={() => { navigator.clipboard?.writeText(String(payment.paymentCode)); setCopied('note'); setTimeout(() => setCopied(''), 1500); }} className="shrink-0 p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 hover:bg-amber-200 transition-all"><Copy size={14} /></button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <img src="/binance-pay-qr.jpeg" alt="QR Binance Pay" className="w-44 rounded-xl border border-gray-100 shadow-sm" />
                </div>

                <div className="text-xs text-gray-500 leading-relaxed space-y-1">
                  <p>Tu peux utiliser <span className="font-bold text-primary">Binance Pay</span> ou envoyer directement à cet ID Binance.</p>
                  <p>1. Ouvre l'app Binance → Wallets → Pay.</p>
                  <p>2. Envoie le montant exact ci-dessus, avec ton code en note de paiement.</p>
                  <p>3. Une fois le paiement effectué, clique "Confirmer le paiement" pour passer à l'étape suivante.</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => setBinanceSubStep('verify')}
                    className="w-full py-4 rounded-2xl font-bold bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all"
                  >
                    Confirmer le paiement
                  </button>
                  <button onClick={cancelPendingOrder} disabled={loading} className="w-full py-3 rounded-2xl font-bold text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all disabled:opacity-50">
                    Annuler le dépôt
                  </button>
                </div>
              </>
            ) : binanceSubStep === 'verify' ? (
              <>
                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between text-sm border border-gray-100 dark:border-gray-700">
                  <div className="text-center sm:text-left mb-2 sm:mb-0">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Montant</p>
                    <p className="font-black text-primary font-mono">${Number(payment.expectedAmount).toFixed(2)}</p>
                  </div>
                  <div className="text-center sm:text-right">
                    <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Envoyé à l'ID Binance</p>
                    <p className="font-bold text-gray-700 dark:text-gray-300 font-mono">{payment.payId}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Ton Binance Order ID</label>
                  <input
                    type="text"
                    value={binanceOrderIdInput}
                    onChange={e => setBinanceOrderIdInput(e.target.value)}
                    placeholder="Ex: 1234567890123456789"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm dark:text-white"
                  />
                </div>

                <div className="bg-gray-50 dark:bg-slate-800/50 rounded-2xl p-4 text-xs text-gray-500 dark:text-gray-400 leading-relaxed space-y-1 border border-gray-100 dark:border-gray-700">
                  <p className="font-bold text-gray-700 dark:text-gray-300">Où trouver ton Order ID :</p>
                  <p>1. Dans l'app Binance, ouvre le détail du paiement réussi.</p>
                  <p>2. Copie l'"Order ID" affiché.</p>
                  <p>3. Colle-le ci-dessus et touche "Vérifier le paiement".</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100">{error}</div>
                )}

                <button
                  onClick={async () => {
                    if (!binanceOrderIdInput.trim()) { setError('Order ID requis.'); return; }
                    setVerifying(true);
                    setError('');
                    const { data: fnData, error: fnError } = await supabase.functions.invoke('binance-submit-tx', {
                      body: { orderId: payment.orderId, binanceOrderId: binanceOrderIdInput.trim() },
                    });
                    if (fnError || fnData?.error) {
                      setError(fnData?.error || (await extractFnErrorMessage(fnError)));
                    } else if (fnData?.autoConfirmed) {
                      // Vérifié automatiquement contre l'historique Binance Pay — pas besoin d'attendre l'admin.
                      if (fetchProfile) await fetchProfile(session.user.id);
                      setStep('success');
                    } else {
                      setPayment(p => ({ ...p, binanceOrderId: binanceOrderIdInput.trim() }));
                      setBinanceSubStep('submitted');
                    }
                    setVerifying(false);
                  }}
                  disabled={verifying}
                  className="w-full py-4 rounded-2xl font-bold bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all disabled:opacity-50"
                >
                  {verifying ? 'Vérification…' : 'Vérifier le paiement'}
                </button>
                <button onClick={() => setBinanceSubStep('pay')} className="w-full py-3 rounded-2xl font-bold text-gray-500 hover:text-gray-900 transition-all">
                  Retour au paiement
                </button>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <RefreshCcw size={26} className="text-primary animate-spin" />
                </div>
                <p className="text-sm text-gray-600 font-bold">Vérification en cours d'approbation…</p>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-3.5 text-xs text-amber-800 dark:text-amber-400 text-left space-y-1.5 leading-relaxed">
                  <p className="font-bold">⚠️ Vérification automatique infructueuse</p>
                  <p>L'Order ID soumis n'a pas pu être validé automatiquement par l'API Binance.</p>
                  <p>Votre dépôt est en cours d'approbation par un administrateur. Si vous avez saisi un mauvais ID ou un mauvais mode de paiement, veuillez le corriger ci-dessous pour éviter que le dépôt ne soit rejeté.</p>
                </div>
                <button
                  onClick={() => setBinanceSubStep('verify')}
                  className="w-full py-3 text-xs font-bold text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Corriger mon Order ID
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'awaiting' && payment && payment.provider !== 'binance_pay' && (
          <div className="px-8 pb-8 pt-2 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <RefreshCcw size={32} className="text-primary animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">En attente de paiement</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {payment.provider === 'mobile_money'
                ? "Contacte le support client via le widget en bas à droite pour finaliser ton dépôt par Mobile Money. Ton solde sera crédité manuellement par un administrateur."
                : "Envoie exactement le montant ci-dessous à l'adresse indiquée. Ton solde sera crédité automatiquement après confirmation."}
              {payment.bonusPct > 0 && <> Avec le bonus, tu recevras <span className="font-black text-primary">${Number(payment.creditAmount).toFixed(2)}</span>.</>}
            </p>

            {payment.provider === 'mobile_money' ? (
              <button
                onClick={() => setStep('form')}
                className="w-full py-4 rounded-2xl font-bold bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Retour aux options
              </button>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Montant à envoyer</p>
                  <p className="text-2xl font-black text-primary font-mono">{payment.payAmount} {String(payment.payCurrency).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Adresse de dépôt</p>
                  <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3">
                    <code className="text-xs font-mono text-gray-700 flex-grow break-all text-left">{payment.payAddress}</code>
                    <button onClick={copyAddress} className="shrink-0 p-2 rounded-lg bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all"><Copy size={14} /></button>
                  </div>
                  {copied && <p className="text-xs text-primary font-bold mt-2">Adresse copiée !</p>}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">Cette page se met à jour automatiquement dès réception du paiement.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="px-8 pb-8 pt-2 text-center space-y-6">
            <CheckCircle size={72} className="text-green-500 mx-auto" />
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">Solde crédité !</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              Ton paiement a été confirmé et ton solde a été mis à jour.
            </p>
            <button
              onClick={close}
              className="w-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 py-4 rounded-2xl font-bold hover:bg-primary transition-all"
            >
              Mon compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default RechargeView;
