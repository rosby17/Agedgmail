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

const AdminView = ({
  session, navigate, products, fetchProducts, allOrders, fetchAllOrders, allUsers, fetchUsers,
  actionStatus, setActionStatus, lang, setLang, t, dataLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('agedgmail_admin_tab') || "dashboard");
  const [supplierBalance, setSupplierBalance] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

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

  if (session.user.email !== ADMIN_EMAIL) {
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
  const confirmedOrders = allOrders.filter(o => o.status === 'confirmed');
  
  // Ventes de produits réelles (exclure product_id=999 qui sont les recharges de solde)
  const confirmedPurchases = confirmedOrders.filter(o => o.product_id !== 999);
  const totalSold = confirmedPurchases.reduce((s, o) => s + (o.total_price || 0), 0);

  // Coût total d'achat fournisseur — même fonction partagée que le graphique
  // (orderSupplierCost), donc carte et courbe affichent TOUJOURS le même chiffre.
  const totalCost = confirmedPurchases.reduce((sum, o) => sum + orderSupplierCost(o, mappings), 0);

  // Bénéfice Net & Marge
  const netProfit = totalSold - totalCost;
  const realMarginPercent = totalSold > 0 ? (netProfit / totalSold) * 100 : 0;

  // Dépôts réels (recharges de solde confirmées)
  const totalDeposited = confirmedOrders
    .filter(o => o.product_id === 999)
    .reduce((s, o) => s + (o.total_price || 0), 0);

  // Compteurs opérationnels secondaires
  const processingCount = allOrders.filter(o => o.status === 'processing').length;
  const pendingOnlyCount = allOrders.filter(o => (o.status || 'pending') === 'pending').length;
  const cancelledCount = allOrders.filter(o => o.status === 'cancelled').length;

  // Commandes bloquées : en attente/en cours depuis plus de 15 min
  const STUCK_MIN = 15;
  const stuckOrders = allOrders.filter(o =>
    (o.status === 'pending' || o.status === 'processing') &&
    (Date.now() - new Date(o.created_at).getTime()) / 60000 > STUCK_MIN
  );

  // Top produits vendus (hors recharges)
  const topProducts = (() => {
    const counts = new Map();
    confirmedPurchases.forEach(o => {
      const key = o.product_name || 'Produit';
      const cur = counts.get(key) || { count: 0, revenue: 0 };
      counts.set(key, { count: cur.count + (o.quantity || 1), revenue: cur.revenue + (o.total_price || 0) });
    });
    return [...counts.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
  })();

  const FinanceCard = ({ label, value, subtext, color = 'emerald', icon: Icon }) => {
    const colors = {
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'profit-accent': 'bg-white/15 text-white border-white/20',
    };

    const isAccent = color === 'profit-accent';

    return (
      <div className={`p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group transition-all duration-200 border ${
        isAccent
          ? 'bg-gradient-to-br from-emerald-500 via-emerald-650 to-teal-700 text-white border-transparent shadow-emerald-500/10 hover:scale-[1.02]'
          : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
      }`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isAccent ? 'text-emerald-100' : 'text-gray-400 dark:text-slate-400'}`}>{label}</span>
            <div className={`text-3xl font-black font-mono ${isAccent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</div>
            {subtext && <div className={`text-xs font-semibold ${isAccent ? 'text-emerald-100/80' : 'text-gray-500 dark:text-slate-500'}`}>{subtext}</div>}
          </div>
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${colors[color]}`}>
            <Icon size={18} />
          </div>
        </div>
        {isAccent && (
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
        )}
      </div>
    );
  };

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
              { id: 'payments', label: 'Binance Pay', icon: Wallet },
              { id: 'users', label: lang === 'fr' ? "Clients" : "Client Management", icon: Users },
              { id: 'support', label: 'Support / Chat', icon: MessageCircle },
              { id: 'supplier', label: lang === 'fr' ? "Fournisseur" : "Supplier", icon: Database },
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
          {/* Theme and Language Switchers */}
          <div className="flex gap-3 justify-center items-center py-4 border-t border-gray-100 dark:border-slate-800 mt-6">
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex-1 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100 dark:border-slate-700"
              title="Change Language"
            >
              {lang.toUpperCase()}
            </button>
          </div>

          {/* Back to site */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 mt-4 space-y-4">
            <div className="text-xs text-gray-500 dark:text-slate-500 font-semibold px-2">
              {lang === 'fr' ? "Connecté en tant que :" : "Logged in as:"}<br/>
              <strong className="text-gray-800 dark:text-slate-300 font-bold">{session.user.email}</strong>
            </div>
            <button
              onClick={() => navigate('shop')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-slate-800 text-gray-750 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-gray-205 dark:hover:bg-slate-700 hover:text-gray-950 dark:hover:text-white transition-all"
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
                />
                <FinanceCard
                  label="Coût d'Achat Fournisseur"
                  value={`$${totalCost.toFixed(2)}`}
                  subtext="Estimé sur le mapping actif"
                  color="amber"
                  icon={Database}
                />
                <FinanceCard
                  label="Bénéfice Net"
                  value={`$${netProfit.toFixed(2)}`}
                  subtext="Marge réelle en dollar"
                  color="profit-accent"
                  icon={TrendingUp}
                />
                <FinanceCard
                  label="Marge Réelle (%)"
                  value={`${realMarginPercent.toFixed(1)}%`}
                  subtext="CA / Coût Fournisseur"
                  color="violet"
                  icon={CircleDollarSign}
                />
              </div>
            </div>

            {/* Operational stats row (clean & secondary) */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Operational Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">Dépôts Clients (Recharges)</div>
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

            <RevenueChart confirmedOrders={confirmedOrders} allUsers={allUsers} mappings={mappings} lang={lang} />

            {/* Top products & Activity side-by-side */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Activity (takes 2 cols) */}
              <div className="xl:col-span-2">
                <RecentActivityTable allOrders={allOrders} />
              </div>

              {/* Top Products */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-2xl h-fit">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Top produits vendus</h3>
                {topProducts.length === 0 ? (
                  <p className="text-gray-500 dark:text-slate-500 text-sm italic">Aucune vente confirmée pour l'instant.</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map(([name, stats], i) => (
                      <div key={name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">{name}</div>
                            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase mt-1 tracking-widest">{stats.count} vendu(s)</div>
                          </div>
                        </div>
                        <div className="text-sm font-black text-primary font-mono shrink-0 pl-4">${stats.revenue.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          {activeTab === 'orders' && <OrdersAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} lang={lang} loading={dataLoading} />}

          {activeTab === 'users' && (
            <ClientManagement allUsers={allUsers} allOrders={allOrders} fetchUsers={fetchUsers} loading={dataLoading} />
          )}

          {activeTab === 'payments' && <BinancePaymentsAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} />}

          {activeTab === 'support' && <SupportAdmin session={session} />}

          {activeTab === 'supplier' && <SupplierAdmin products={products} fetchProducts={fetchProducts} />}
        </main>
      </div>
    );
  };

const CRYPTO_CURRENCIES = [
  { id: 'btc', label: 'Bitcoin', ticker: 'BTC', symbol: '₿', color: 'bg-orange-100 text-orange-600' },
  { id: 'eth', label: 'Ethereum', ticker: 'ETH', symbol: 'Ξ', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'usdttrc20', label: 'USDT (TRC20)', ticker: 'USDT', symbol: '₮', color: 'bg-green-100 text-green-600' },
  { id: 'ltc', label: 'Litecoin', ticker: 'LTC', symbol: 'Ł', color: 'bg-slate-100 text-slate-600' },
];

// Passerelles de paiement. Binance Pay est branché (confirmation manuelle
// admin en attendant l'accès à l'historique Binance Pay). Les autres
// apparaissent en aperçu ("Bientôt") tant qu'elles ne sont pas réellement
// intégrées, pour ne jamais laisser croire qu'un moyen de paiement fonctionne
// alors qu'il ne le fait pas.
// NOWPayments mis hors service (remplacé par Binance) — code gardé au cas où
// on le réactive plus tard, juste retiré de la liste des moyens proposés.
// Chaque crypto est proposée comme un choix distinct (au lieu d'un unique
// "NOWPayments" avec un sous-sélecteur de devise). `payCurrency` = la devise
// envoyée au backend NOWPayments. Mobile Money reste affiché mais désactivé
// (grisé, non cliquable) tant que la méthode n'est pas prête.
// `min` = dépôt minimum autorisé (USD), affiché directement sur la tuile pour
// que le client le sache AVANT de cliquer. Binance Pay est le seul à $0.50 ;
// les cryptos (via NOWPayments) sont à $20 à cause des frais de réseau fluctuants (min ~18.86$).
const PAYMENT_GATEWAYS = [
  { id: 'binance_pay', name: 'Binance Pay', sub: 'Pay ID Binance', enabled: true, symbol: '🅑', min: 0.5, recommended: true },
  { id: 'usdt_trc20', name: 'USDT', sub: 'TRC20', enabled: true, symbol: '₮', manual: true, min: 0.5 },
  { id: 'mobile_money', name: 'Mobile Money', sub: 'Bientôt', enabled: false, symbol: '📱' },
];

const BONUS_TIERS = [
  { amount: 100, pct: 1 },
  { amount: 500, pct: 2 },
  { amount: 1000, pct: 3 },
  { amount: 10000, pct: 4 },
];
const bonusPercentFor = (amountUsd) => [...BONUS_TIERS].reverse().find(t => amountUsd >= t.amount)?.pct || 0;

// Extracted RechargeView to src/views/RechargeView.jsx



// ==========================================
// PAYMENT VIEW
// ==========================================


// Nettoie le HTML fourni par le fournisseur (product.description) avant tout
// rendu : liste blanche de balises de mise en forme, tout le reste est retiré
// ou dépouillé de ses attributs. Nécessaire car ce HTML vient d'un tiers —
// jamais faire confiance à du HTML externe sans le filtrer (risque XSS).
const REMOVE_ENTIRELY = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'LINK', 'META']);
const ALLOWED_TAGS = new Set(['P', 'STRONG', 'U', 'B', 'I', 'EM', 'UL', 'OL', 'LI', 'BR', 'SPAN', 'DIV']);

function sanitizeDescriptionHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');

  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); return; }
      if (child.nodeType !== Node.ELEMENT_NODE) return;

      if (REMOVE_ENTIRELY.has(child.tagName)) { child.remove(); return; }

      if (!ALLOWED_TAGS.has(child.tagName)) {
        // Balise non autorisée : on garde le texte, on retire juste la balise.
        child.replaceWith(...child.childNodes);
        return;
      }

      [...child.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const isEventHandler = name.startsWith('on');
        const isStyle = name === 'style';
        const styleIsSafe = isStyle && !/url\(|expression\(|javascript:/i.test(attr.value);
        if (isEventHandler || (!isStyle) || (isStyle && !styleIsSafe)) {
          child.removeAttribute(attr.name);
        }
      });

      walk(child);
    });
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

// ==========================================
// PRODUCT VIEW
// ==========================================
const ProductView = ({ product, addToCart, navigate, onCartClick, onBuyNow, lang }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">

        <div className="bg-gray-50/50 rounded-[2rem] aspect-[4/3] max-h-[360px] flex items-center justify-center border border-gray-100 overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center p-10">
            <ProductVisual product={product} iconSize={64} />
          </div>
          {product.name.includes('US') && product.category === 'email' && <div className="absolute bottom-5 right-5 bg-primary text-white dark:text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm">US ACCOUNT</div>}
        </div>

        <div className="flex flex-col justify-center">
          <nav className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">
            <button onClick={() => navigate('')} className="hover:text-primary">HOME</button>
            <span>/</span>
            <span className="text-primary">{displayCategoryLabel(product)}</span>
          </nav>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">{cleanProductName(product.name, lang)}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
              <Package size={14} /> In stock ({product.stock})
            </div>
            <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
              {displayCategoryLabel(product)}
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-8 tracking-tight flex items-baseline gap-1">
            <span className="text-lg text-gray-400 font-bold">$</span>{product.price.toFixed(2)}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
              <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 border border-gray-200/50">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-200/50"><Minus size={16} /></button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1) setQuantity(Math.min(val, product.stock));
                  }}
                  className="w-20 bg-transparent text-center font-black text-xl outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => quantity < product.stock && setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-200/50"><Plus size={16} /></button>
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={() => onBuyNow(product)}
                disabled={product.stock <= 0}
                className={`flex-grow h-20 rounded-[2rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-widest flex items-center justify-center gap-4 ${product.stock > 0 ? 'bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/30 hover:scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {product.stock > 0 ? 'Buy now' : 'Out of stock'}
              </button>
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onCartClick();
                }}
                disabled={product.stock <= 0}
                title="Add to cart"
                className={`w-20 h-20 shrink-0 rounded-[2rem] flex items-center justify-center transition-all border-2 ${product.stock <= 0 ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'}`}
              >
                <ShoppingCart size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Details */}
      <div className="border-t border-gray-100 pt-20">
        <div className="flex gap-10 border-b border-gray-100 mb-12 overflow-x-auto pb-4">
          {['Information', 'Warranty policy'].map((tab, i) => (
            <button key={tab} className={`text-sm font-black uppercase tracking-[0.2em] pb-4 relative whitespace-nowrap transition-colors ${i === 0 ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab}
              {i === 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Information</h3>
              <div className="divide-y divide-gray-200/70">
                {product.details?.info?.split(' | ').map((line, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-gray-500 font-medium">{line.split(' : ')[0]}</span>
                    <span className="text-gray-900 font-bold">{line.split(' : ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4"><Info size={14} className="text-primary" /> Additional Description</h4>
              {product.description ? (
                <div
                  className="text-gray-600 leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-gray-900 [&_u]:underline"
                  dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(product.description) }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed italic text-sm">{product.details?.note}</p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4"><ShieldAlert size={14} className="text-primary" /> Terms of Service</h4>
              <div className="text-xs text-gray-500 leading-relaxed space-y-3">
                {product.details?.terms?.split('. ').map((t, i) => <p key={i}>• {t}.</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminView;
