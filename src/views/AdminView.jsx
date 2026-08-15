import { netProfitOf, orderSupplierCost } from '../utils/helpers';
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
import StockAdmin from './StockAdmin';
import DepositsAdmin from './DepositsAdmin';
import SupportAdmin from './SupportAdmin';
import OrdersAdmin from './OrdersAdmin';
import SettingsTab from './SettingsTab';

import RevenueChart from './admin/RevenueChart';
import RecentActivityTable from './admin/RecentActivityTable';
import ClientManagement from './admin/ClientManagement';
import FinanceCard from './admin/FinanceCard';
import FinancialDetailsModal from './admin/FinancialDetailsModal';

const AdminView = ({
  session, profile, navigate, products, fetchProducts, allOrders, fetchAllOrders, allUsers, fetchUsers,
  actionStatus, setActionStatus, lang, setLang, t, dataLoading = false,
}) => {
  // Sous-route de la console admin : /app/admin/<tab> (ex: /app/admin/orders).
  // Lue depuis l'URL en priorité (permet de partager/recharger un lien direct
  // vers un onglet précis), puis le dernier onglet visité en fallback.
  const ADMIN_TABS = ['dashboard', 'orders', 'deposits', 'users', 'support', 'supplier', 'stock'];
  const tabFromPath = () => {
    const parts = window.location.pathname.replace(/^\/+/, '').split('/');
    // parts = ['app', 'admin', '<tab>?']
    const sub = parts[2];
    return ADMIN_TABS.includes(sub) ? sub : null;
  };
  const [activeTab, setActiveTabState] = useState(() => tabFromPath() || localStorage.getItem('agedgmail_admin_tab') || "dashboard");

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    const path = tab === 'dashboard' ? '/app/admin' : `/app/admin/${tab}`;
    window.history.pushState(null, '', path);
  };

  // Historique navigateur (précédent/suivant) à l'intérieur de la console admin.
  useEffect(() => {
    const onPopState = () => {
      const fromPath = tabFromPath();
      if (fromPath) setActiveTabState(fromPath);
    };
    window.addEventListener('popstate', onPopState);
    // Normalise l'URL au premier montage si on est arrivé sur /app/admin nu
    // (ou un onglet invalide) alors qu'un onglet différent était mémorisé.
    if (!tabFromPath()) {
      window.history.replaceState(null, '', activeTab === 'dashboard' ? '/app/admin' : `/app/admin/${activeTab}`);
    }
    return () => window.removeEventListener('popstate', onPopState);
  }, []);
  const [supplierBalance, setSupplierBalance] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [financialDetailType, setFinancialDetailType] = useState(null);

  useEffect(() => {
    localStorage.setItem('agedgmail_admin_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('supplier_settings').select('balance, currency').eq('supplier', 'ytseller').maybeSingle()
      .then(({ data }) => setSupplierBalance(data || null));

    // Fetch mappings for purchase cost calculation
    supabase.from('product_supplier_mapping').select('*')
      .then(({ data }) => setMappings(data || []));
  }, []);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
    } catch (err) {
      setLoginError(err.message || 'Identifiants admin invalides.');
    }
    setLoginLoading(false);
  };


  // Standalone Auth check inside AdminView
  if (!session) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-gray-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8 text-gray-900 dark:text-white relative">
          <button onClick={() => navigate('shop')} className="absolute top-8 left-8 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-bold flex items-center gap-1">
            <ArrowLeft size={14} /> {t('backToSite')}
          </button>
          <div className="text-center space-y-2 pt-4">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
            <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">AgedGmail Security Area</p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary/20 text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary/20 text-sm font-bold"
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-4 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-2 animate-bounce">
                <AlertTriangle size={14} /> {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-14 bg-primary text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:bg-primaryDark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loginLoading && <RefreshCcw size={16} className="animate-spin" />}
              Accéder à la console
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (session.user.email !== ADMIN_EMAIL && !profile?.is_admin) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-gray-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-6 text-center text-gray-900 dark:text-white">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-red-500">Accès Refusé</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            Votre compte n'est pas autorisé à accéder à la console d'administration.
          </p>
          <div className="flex gap-3 pt-4">
            <button onClick={() => navigate('shop')} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
              {t('backToSite')}
            </button>
            <button onClick={() => supabase.auth.signOut()} className="flex-1 py-4 bg-red-600 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all">
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CALCULS DES METRIQUES FINANCIERES ---
  const confirmedOrders = allOrders.filter(o => o.status === 'confirmed' || o.status === 'delivered');
  
  // Ventes de produits réelles (exclure product_id=999 recharges et 998 transferts)
  const confirmedPurchases = confirmedOrders.filter(o => Number(o.product_id) !== 999 && Number(o.product_id) !== 998);
  const totalSold = confirmedPurchases.reduce((s, o) => s + Number(o.total_price || 0), 0);

  // Coût total d'achat fournisseur — même fonction partagée que le graphique
  // (orderSupplierCost), donc carte et courbe affichent TOUJOURS le même chiffre.
  const totalCost = confirmedPurchases.reduce((sum, o) => sum + orderSupplierCost(o, mappings), 0);

  // Bénéfice Net & Marge
  const netProfit = totalSold - totalCost;
  const realMarginPercent = totalSold > 0 ? (netProfit / totalSold) * 100 : 0;

  // Dépôts réels (recharges de solde confirmées)
  const totalDeposited = confirmedOrders
    .filter(o => Number(o.product_id) === 999)
    .reduce((s, o) => s + Number(o.total_price || 0), 0);

  // Compteurs opérationnels secondaires
  const processingCount = allOrders.filter(o => o.status === 'processing').length;
  const pendingOnlyCount = allOrders.filter(o => (o.status || 'pending') === 'pending').length;
  const cancelledCount = allOrders.filter(o => o.status === 'cancelled').length;

  // Métriques de performance client. Pas de "MRR"/taux mensuel : le modèle
  // est de l'achat ponctuel (comptes, recharges), pas un abonnement — un
  // revenu mensuel récurrent n'aurait pas de sens ici. On mesure plutôt la
  // valeur générée par client et la part de la base qui a déjà payé.
  const payingClientIds = new Set(confirmedPurchases.map(o => o.user_id).filter(Boolean));
  const avgOrderValue = confirmedPurchases.length > 0 ? totalSold / confirmedPurchases.length : 0;
  const avgClientValue = payingClientIds.size > 0 ? totalSold / payingClientIds.size : 0;
  const payingClientRate = allUsers.length > 0 ? (payingClientIds.size / allUsers.length) * 100 : 0;

  // Solde actuellement disponible dans les comptes clients (distinct du total
  // des dépôts historiques ci-dessous : une bonne partie a déjà été dépensée
  // en achats, ce qui compte dans le Chiffre d'Affaires, pas ici).
  const currentClientBalance = allUsers.reduce((s, u) => s + Number(u.balance || 0), 0);

  // Commandes bloquées : en attente/en cours depuis plus de 15 min
  const STUCK_MIN = 15;
  const stuckOrders = allOrders.filter(o =>
    (o.status === 'pending' || o.status === 'processing') &&
    (Date.now() - new Date(o.created_at).getTime()) / 60000 > STUCK_MIN
  );

  return (
    <div className="min-h-screen bg-canvas dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex flex-col lg:flex-row">
      {/* Sidebar Standalone */}
      <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-800 p-8 flex flex-col justify-between">
        <div className="space-y-10">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Console</div>
              <div className="text-[9px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider">AgedGmail Admin</div>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: lang === 'fr' ? "Vue d'ensemble" : "Overview", icon: LayoutDashboard },
              { id: 'orders', label: lang === 'fr' ? "Commandes" : "Orders", icon: FileText },
              { id: 'deposits', label: 'Dépôts / Recharges', icon: Wallet },
              { id: 'users', label: lang === 'fr' ? "Clients" : "Client Management", icon: Users },
              { id: 'support', label: 'Support / Chat', icon: MessageCircle },
              { id: 'supplier', label: lang === 'fr' ? "Fournisseur" : "Supplier", icon: Database },
              { id: 'stock', label: 'Stock manuel', icon: Package },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-white dark:text-gray-900 shadow-xl shadow-primary/20'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {/* Back to site */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 mt-4 space-y-4">
            <div className="text-xs text-gray-500 dark:text-slate-500 font-semibold px-2">
              {lang === 'fr' ? "Connecté en tant que :" : "Logged in as:"}<br/>
              <strong className="text-gray-800 dark:text-slate-300 font-bold">{session.user.email}</strong>
            </div>
            <button
              onClick={() => navigate('shop')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-gray-205 dark:hover:bg-slate-700 hover:text-gray-950 dark:hover:text-white transition-all"
            >
              <ArrowLeft size={14} /> {t('backToSite')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8 lg:p-12 space-y-8 overflow-y-auto max-h-screen">
        {activeTab === 'dashboard' && dataLoading && (
          <div className="space-y-8">
            <SkeletonMetricCards count={4} />
            <SkeletonMetricCards count={4} />
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8">
              <SkeletonRows rows={6} cols={5} />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && !dataLoading && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Warnings */}
            {supplierBalance && Number(supplierBalance.balance) <= 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 flex items-center gap-4">
                <AlertTriangle size={24} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-300">Solde fournisseur YTSeller à 0 — aucune commande dropship ne peut être livrée.</p>
                  <button onClick={() => setActiveTab('supplier')} className="text-xs font-black text-red-400 hover:underline uppercase tracking-widest mt-1">Voir l'onglet Supplier</button>
                </div>
              </div>
            )}

            {stuckOrders.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-4">
                <Clock size={24} className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-300">{stuckOrders.length} commande(s) en attente depuis plus de {STUCK_MIN} min — à vérifier.</p>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-amber-400 hover:underline uppercase tracking-widest mt-1">Voir les commandes</button>
                </div>
              </div>
            )}

            {/* Financial Highlights */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Financial Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinanceCard
                  label="Chiffre d'Affaires (Ventes)"
                  value={`$${totalSold.toFixed(2)}`}
                  subtext={`${confirmedPurchases.length} ventes de produits`}
                  color="blue"
                  icon={DollarSign}
                  onClick={() => setFinancialDetailType('revenue')}
                />
                <FinanceCard
                  label="Coût d'Achat Fournisseur"
                  value={`$${totalCost.toFixed(2)}`}
                  subtext="Estimé sur le mapping actif"
                  color="amber"
                  icon={Database}
                  onClick={() => setFinancialDetailType('cost')}
                />
                <FinanceCard
                  label="Bénéfice Net (estimé)"
                  value={`$${netProfit.toFixed(2)}`}
                  subtext="Coût figé si connu, sinon estimé"
                  color="profit-accent"
                  icon={TrendingUp}
                  onClick={() => setFinancialDetailType('profit')}
                />
                <FinanceCard
                  label="Marge estimée (%)"
                  value={`${realMarginPercent.toFixed(1)}%`}
                  subtext="Bénéfice net / Chiffre d'affaires"
                  color="violet"
                  icon={CircleDollarSign}
                  onClick={() => setFinancialDetailType('profit')}
                />
              </div>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">
                Chiffres sur toute la durée du site (à vie), pas sur une fenêtre de 30 jours.
              </p>
            </div>

            {/* Dette envers les clients : argent déjà reçu (recharges) mais pas
                encore dépensé — ce n'est PAS du chiffre d'affaires tant que le
                client n'a rien acheté avec, c'est un passif qu'on doit encore
                honorer en livraison le jour où il l'utilise. */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Passif — Solde Client Non Dépensé</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinanceCard
                  label="Dette envers les clients"
                  value={`$${currentClientBalance.toFixed(2)}`}
                  subtext="Solde disponible non encore dépensé"
                  color="red"
                  icon={Wallet}
                  onClick={() => setActiveTab('users')}
                />
                <FinanceCard
                  label="Clients avec solde > 0"
                  value={String(allUsers.filter(u => Number(u.balance || 0) > 0).length)}
                  subtext={`Sur ${allUsers.length} inscrits`}
                  color="amber"
                  icon={Users}
                  onClick={() => setActiveTab('users')}
                />
                <FinanceCard
                  label="Total historique déposé"
                  value={`$${totalDeposited.toFixed(2)}`}
                  subtext={`Dont $${currentClientBalance.toFixed(2)} encore en attente d'être dépensé`}
                  color="blue"
                  icon={DollarSign}
                  onClick={() => setFinancialDetailType('deposit')}
                />
              </div>
            </div>

            {/* Performance clients */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Performance Clients</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FinanceCard
                  label="Valeur Client Moyenne"
                  value={`$${avgClientValue.toFixed(2)}`}
                  subtext={`${payingClientIds.size} client(s) ayant déjà acheté`}
                  color="blue"
                  icon={Users}
                />
                <FinanceCard
                  label="Panier Moyen"
                  value={`$${avgOrderValue.toFixed(2)}`}
                  subtext={`Sur ${confirmedPurchases.length} commande(s)`}
                  color="amber"
                  icon={ShoppingCart}
                />
                <FinanceCard
                  label="Taux de Clients Payants"
                  value={`${payingClientRate.toFixed(1)}%`}
                  subtext={`${payingClientIds.size} / ${allUsers.length} inscrits`}
                  color="violet"
                  icon={UserCheck}
                />
              </div>
            </div>

            {/* Operational stats row (clean & secondary) */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Operational Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div onClick={() => setFinancialDetailType('deposit')} className="cursor-pointer group hover:bg-gray-50 dark:hover:bg-slate-800/50 p-3 -m-3 rounded-2xl transition-all">
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase group-hover:text-primary transition-colors">Dépôts Clients (total historique)</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">${totalDeposited.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">En cours fournisseur</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">{processingCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">En attente / Binance</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">{pendingOnlyCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">Commandes annulées</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">{cancelledCount}</div>
                </div>
              </div>
            </div>

            <RevenueChart confirmedOrders={confirmedPurchases} allUsers={allUsers} mappings={mappings} lang={lang} />

            {/* Activité récente — pleine largeur (section "Top produits" retirée
                pour aérer le dashboard). */}
            <RecentActivityTable allOrders={allOrders} />
          </div>
        )}
          {activeTab === 'orders' && <OrdersAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} lang={lang} loading={dataLoading} />}

          {activeTab === 'users' && (
            <ClientManagement allUsers={allUsers} allOrders={allOrders} fetchUsers={fetchUsers} loading={dataLoading} />
          )}

          {activeTab === 'deposits' && <DepositsAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} />}

          {activeTab === 'support' && <SupportAdmin session={session} />}

          {activeTab === 'supplier' && <SupplierAdmin products={products} fetchProducts={fetchProducts} />}

          {activeTab === 'stock' && <StockAdmin products={products} />}

          {financialDetailType && (
            <FinancialDetailsModal
              type={financialDetailType}
              onClose={() => setFinancialDetailType(null)}
              orders={financialDetailType === 'deposit' ? allOrders.filter(o => o.product_id === 999 && o.status === 'confirmed') : confirmedPurchases}
              mappings={mappings}
              lang={lang}
            />
          )}
        </main>
      </div>
    );
  };

export default AdminView;
