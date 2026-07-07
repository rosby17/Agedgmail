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

const RevenueChart = ({ confirmedOrders, allUsers = [], mappings = [], lang = 'fr' }) => {
  const [range, setRange] = useState(7);
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'users'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const calculateNetProfit = (ordersList) => netProfitOf(ordersList, mappings);

  const getChartData = () => {
    if (range === 7 || range === 30) {
      // Daily grouping
      const days = [...Array(range)].map((_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (range - 1 - i));
        return d;
      });

      return days.map((day, index) => {
        const next = new Date(day); next.setDate(next.getDate() + 1);
        const dayOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= day && t < next; });

        const netProfit = calculateNetProfit(dayOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= day && t < next; })
          .length;

        return {
          date: day,
          label: day.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    } else if (range === 365) {
      // Monthly grouping (last 12 months)
      const months = [...Array(12)].map((_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        d.setMonth(d.getMonth() - (11 - i));
        return d;
      });

      return months.map((monthStart, index) => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= monthStart && t < monthEnd; });

        const netProfit = calculateNetProfit(monthOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= monthStart && t < monthEnd; })
          .length;

        return {
          date: monthStart,
          label: monthStart.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    } else {
      // Lifetime grouping (Monthly from oldest to now)
      const oldestOrderTime = confirmedOrders.length > 0
        ? Math.min(...confirmedOrders.map(o => new Date(o.created_at).getTime()))
        : Date.now();
      const oldestUserTime = allUsers.length > 0
        ? Math.min(...allUsers.map(u => new Date(u.created_at).getTime()))
        : Date.now();

      const oldestTime = Math.min(oldestOrderTime, oldestUserTime, Date.now());
      const start = new Date(oldestTime);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const current = new Date();
      const diffMonths = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth()) + 1;
      const numMonths = Math.max(diffMonths, 6); // at least 6 months

      const months = [...Array(numMonths)].map((_, i) => {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        return d;
      });

      return months.map((monthStart, index) => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= monthStart && t < monthEnd; });

        const netProfit = calculateNetProfit(monthOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= monthStart && t < monthEnd; })
          .length;

        return {
          date: monthStart,
          label: monthStart.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    }
  };

  const dataPoints = getChartData();

  // Totaux cumulés sur la période sélectionnée (pour l'en-tête des onglets)
  const rangeRevenue = dataPoints.reduce((s, p) => s + p.revenue, 0);
  const rangeUsers = dataPoints.reduce((s, p) => s + p.users, 0);

  // Données actives pour le tracé du graphique
  const activeTotals = dataPoints.map(p => activeMetric === 'revenue' ? p.revenue : p.users);
  const max = Math.max(...activeTotals, 1);

  // Configuration SVG
  const width = 600;
  const height = 160;
  const paddingX = 25;
  const paddingY = 25;

  const points = dataPoints.map((p, i) => {
    const val = activeMetric === 'revenue' ? p.revenue : p.users;
    const x = paddingX + (i / (dataPoints.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (val / max) * (height - 2 * paddingY);
    return { x, y, amount: val, date: p.date, label: p.label, index: i };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - 5} L ${points[0].x} ${height - 5} Z`
    : '';

  const rangeOptions = [
    { value: 7, label: lang === 'fr' ? '7 jours' : '7 days' },
    { value: 30, label: lang === 'fr' ? '30 jours' : '30 days' },
    { value: 365, label: lang === 'fr' ? '1 an' : '1 year' },
    { value: 'lifetime', label: lang === 'fr' ? 'À vie' : 'Lifetime' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative space-y-6">
      {/* Sélecteurs de Période */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">
            {lang === 'fr' ? 'Performances générales' : 'General metrics'}
          </h3>
        </div>
        <div className="flex gap-2">
          {rangeOptions.map(opt => (
            <button key={opt.value} onClick={() => { setRange(opt.value); setHoveredPoint(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === opt.value ? 'bg-primary text-white dark:text-gray-900' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-800'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Onglets style YouTube Studio */}
      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-slate-800 pb-2">
        {/* Onglet Revenu Estimé */}
        <button
          onClick={() => { setActiveMetric('revenue'); setHoveredPoint(null); }}
          className={`text-left p-4 rounded-2xl transition-all relative border flex flex-col justify-between ${
            activeMetric === 'revenue'
              ? 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white'
              : 'bg-transparent border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-400">
            {lang === 'fr' ? 'Bénéfice Net' : 'Net Profit'}
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-gray-900 dark:text-white">${rangeRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
            {lang === 'fr' ? `Total sur ${rangeOptions.find(o => o.value === range)?.label.toLowerCase()}` : `Total for ${rangeOptions.find(o => o.value === range)?.label.toLowerCase()}`}
          </div>
          {activeMetric === 'revenue' && (
            <div className="absolute bottom-[-10px] left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>

        {/* Onglet Clients Inscrits */}
        <button
          onClick={() => { setActiveMetric('users'); setHoveredPoint(null); }}
          className={`text-left p-4 rounded-2xl transition-all relative border flex flex-col justify-between ${
            activeMetric === 'users'
              ? 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white'
              : 'bg-transparent border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-400">
            {lang === 'fr' ? 'Clients Inscrits' : 'Registered Clients'}
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-gray-900 dark:text-white">{rangeUsers}</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
            {lang === 'fr' ? `Inscriptions sur la période` : `Registrations in period`}
          </div>
          {activeMetric === 'users' && (
            <div className="absolute bottom-[-10px] left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Zone Graphique */}
      <div className="relative h-44 w-full">
        {/* Tooltip flottant */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 px-3 py-2 rounded-xl shadow-xl text-center pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-[9px] text-gray-500 dark:text-slate-500 font-black uppercase">
              {hoveredPoint.label}
            </div>
            <div className="text-xs font-black text-primary font-mono">
              {activeMetric === 'revenue' ? `${hoveredPoint.amount.toFixed(2)}` : `${hoveredPoint.amount} client(s)`}
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grille horizontale en arrière-plan */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (height - 2 * paddingY);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                strokeWidth="1"
                strokeDasharray="4 4"
                className="stroke-gray-100 dark:stroke-slate-800"
              />
            );
          })}

          {/* Remplissage dégradé sous la courbe */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          {/* Ligne principale de la courbe */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points sur la courbe */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.index === i ? "6" : "3.5"}
              fill="#10B981"
              strokeWidth={hoveredPoint?.index === i ? "3" : "2"}
              className="stroke-white dark:stroke-slate-900 transition-all duration-150"
            />
          ))}

          {/* Zones interactives transparentes pour le survol */}
          {points.map((p, i) => (
            <rect
              key={i}
              x={p.x - (width / points.length) / 2}
              y={0}
              width={width / points.length}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase pt-2">
        <span>{points[0]?.label || ''}</span>
        <span>{points[points.length - 1]?.label || ''}</span>
      </div>
    </div>
  );
};

const RecentActivityTable = ({ allOrders }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = allOrders
    .filter(o => filter === 'all' || (o.status || 'pending') === filter)
    .filter(o => !search.trim() || (o.buyer_email || '').toLowerCase().includes(search.trim().toLowerCase()) || (o.product_name || '').toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);

  const statusBadge = (status) => {
    const s = status || 'pending';
    const map = {
      confirmed: { label: 'Confirmed', cls: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' },
      processing: { label: 'Processing', cls: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' },
      cancelled: { label: 'Cancelled', cls: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400' },
      pending: { label: 'Pending', cls: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400' },
    };
    const { label, cls } = map[s] || map.pending;
    return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${cls}`}>{label}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activité récente</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
            {['all', 'confirmed', 'processing', 'pending', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${filter === f ? 'bg-primary text-white dark:text-gray-900' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-900'}`}>
                {f === 'all' ? 'Toutes' : f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par email, produit…"
              className="pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 outline-none w-52"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              <th className="pb-4">Client</th><th className="pb-4">Produit</th><th className="pb-4">Date</th><th className="pb-4">Statut</th><th className="pb-4 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
            {filtered.map(o => (
              <tr key={o.id}>
                <td className="py-4 font-bold text-gray-900 dark:text-white">{o.buyer_email || '—'}</td>
                <td className="py-4 text-gray-500 dark:text-slate-400">{cleanProductName(o.product_name, lang)}</td>
                <td className="py-4 text-xs text-gray-400 dark:text-slate-500">{new Date(o.created_at).toLocaleString('fr-FR')}</td>
                <td className="py-4">{statusBadge(o.status)}</td>
                <td className="py-4 text-right font-mono font-black text-gray-900 dark:text-white">${Number(o.total_price || 0).toFixed(2)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500">Aucune commande trouvée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ClientManagement = ({ allUsers, allOrders, fetchUsers, loading = false }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended
  const [viewingClient, setViewingClient] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Stats par client, calculées une fois depuis toutes les commandes.
  const statsByUser = (() => {
    const map = new Map();
    allOrders.forEach(o => {
      const cur = map.get(o.user_id) || { orders: 0, spent: 0, deposited: 0, lastActivity: null };
      if (o.status === 'confirmed') {
        if (o.product_id === 999) cur.deposited += o.total_price || 0;
        else { cur.orders += 1; cur.spent += o.total_price || 0; }
      }
      const t = new Date(o.created_at).getTime();
      if (!cur.lastActivity || t > cur.lastActivity) cur.lastActivity = t;
      map.set(o.user_id, cur);
    });
    return map;
  })();

  const filtered = allUsers
    .filter(u => statusFilter === 'all' || (statusFilter === 'suspended' ? u.is_suspended : !u.is_suspended))
    .filter(u => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (u.email || '').toLowerCase().includes(q) || (u.display_name || '').toLowerCase().includes(q);
    });

  const activeCount = allUsers.filter(u => !u.is_suspended).length;
  const suspendedCount = allUsers.filter(u => u.is_suspended).length;

  const toggleBan = async (user) => {
    const next = !user.is_suspended;
    if (!window.confirm(next
      ? `Bannir ${user.email} ? Il ne pourra plus acheter ni recharger tant qu'il est suspendu.`
      : `Réactiver ${user.email} ?`)) return;
    setBusyId(user.id);
    const { error } = await supabase.from('profiles').update({ is_suspended: next }).eq('id', user.id);
    if (error) alert('Erreur : ' + error.message);
    else await fetchUsers();
    setBusyId(null);
  };

  const creditBalance = async (user) => {
    const raw = prompt(`Créditer le solde de ${user.email} de ($) :`, '10');
    if (raw == null) return;
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount === 0) return;
    setBusyId(user.id);
    const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    const { error } = await supabase.from('profiles').update({ balance: (data?.balance || 0) + amount }).eq('id', user.id);
    if (error) alert('Erreur : ' + error.message);
    else await fetchUsers();
    setBusyId(null);
  };

  const initial = (u) => (u.display_name || u.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-soft space-y-8">
      {/* En-tête + compteurs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des clients</h2>
          <div className="flex items-center gap-4 mt-2 text-xs font-bold">
            <span className="text-gray-400">{allUsers.length} au total</span>
            <span className="text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {activeCount} actifs</span>
            <span className="text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {suspendedCount} suspendus</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-1">
            {['all', 'active', 'suspended'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${statusFilter === f ? 'bg-gray-900 dark:bg-primary text-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Suspendus'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher email ou pseudo…"
              className="pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Table clients */}
      {loading ? (
        <div className="py-4"><SkeletonRows rows={6} cols={7} /></div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              <th className="pb-4">Client</th><th className="pb-4">Solde</th><th className="pb-4">Achats</th><th className="pb-4">Dépensé</th><th className="pb-4">Inscrit</th><th className="pb-4">Statut</th><th className="pb-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.map(user => {
              const s = statsByUser.get(user.id) || { orders: 0, spent: 0, deposited: 0 };
              return (
                <tr key={user.id} className={user.is_suspended ? 'opacity-60' : ''}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">{initial(user)}</div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white truncate">{user.email}</div>
                        <div className="text-xs text-gray-400 truncate">{user.display_name || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono font-black text-primary">${Number(user.balance || 0).toFixed(2)}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-300">{s.orders}</td>
                  <td className="py-4 font-mono text-gray-600 dark:text-gray-300">${s.spent.toFixed(2)}</td>
                  <td className="py-4 text-xs text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="py-4">
                    {user.is_suspended
                      ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wide">Suspendu</span>
                      : <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">Actif</span>}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewingClient(user)} title="Voir l'historique" className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"><Eye size={14} /></button>
                      <button onClick={() => creditBalance(user)} disabled={busyId === user.id} title="Créditer le solde" className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all disabled:opacity-40"><DollarSign size={14} /></button>
                      <button onClick={() => toggleBan(user)} disabled={busyId === user.id}
                        title={user.is_suspended ? 'Réactiver' : 'Bannir'}
                        className={`p-2 rounded-lg transition-all disabled:opacity-40 ${user.is_suspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                        {user.is_suspended ? <UserCheck size={14} /> : <Ban size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">Aucun client trouvé.</td></tr>}
          </tbody>
        </table>
      </div>
      )}

      {/* Modale détail client */}
      {viewingClient && (() => {
        const s = statsByUser.get(viewingClient.id) || { orders: 0, spent: 0, deposited: 0 };
        const clientOrders = allOrders.filter(o => o.user_id === viewingClient.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingClient(null)} />
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 space-y-6 animate-in fade-in zoom-in duration-300 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary font-black text-lg flex items-center justify-center">{initial(viewingClient)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingClient.email}</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">{viewingClient.display_name || '—'} · inscrit le {viewingClient.created_at ? new Date(viewingClient.created_at).toLocaleDateString('fr-FR') : '—'}</p>
                  </div>
                </div>
                <button onClick={() => setViewingClient(null)} aria-label="Close" className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Solde</div><div className="text-lg font-black text-primary font-mono">${Number(viewingClient.balance || 0).toFixed(2)}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Achats</div><div className="text-lg font-black text-gray-900 dark:text-white">{s.orders}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dépensé</div><div className="text-lg font-black text-gray-900 dark:text-white font-mono">${s.spent.toFixed(2)}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rechargé</div><div className="text-lg font-black text-gray-900 dark:text-white font-mono">${s.deposited.toFixed(2)}</div></div>
              </div>

              {clientOrders.length === 0 ? (
                <p className="text-gray-400 text-sm italic py-8 text-center">Aucune activité pour ce client.</p>
              ) : (
                <div className="space-y-3">
                  {clientOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {o.product_id === 999 ? <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Recharge</span> : <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">Achat</span>}
                          {o.product_name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1">{new Date(o.created_at).toLocaleString('fr-FR')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-gray-900 dark:text-white font-mono">${o.total_price?.toFixed(2)}</div>
                        <div className={`text-[10px] font-bold uppercase mt-1 ${o.status === 'confirmed' ? 'text-green-600' : o.status === 'cancelled' ? 'text-red-500' : o.status === 'processing' ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {o.status === 'confirmed' ? 'Payé' : o.status === 'cancelled' ? 'Annulé' : o.status === 'processing' ? 'En cours' : 'En attente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

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

export default AdminView;
