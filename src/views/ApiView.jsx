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

const ApiView = ({ navigate, session, lang }) => {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session || !supabase) return;
    supabase.from('api_keys').select('api_key').eq('user_id', session.user.id).eq('active', true)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setApiKey(data.api_key); });
  }, [session]);

  const generateKey = async () => {
    if (!session) { navigate('auth'); return; }
    setLoading(true);
    const key = 'ak_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const { error } = await supabase.from('api_keys').insert({ user_id: session.user.id, api_key: key, label: 'default' });
    if (!error) setApiKey(key);
    setLoading(false);
  };

  const copyKey = () => { if (apiKey) { navigator.clipboard?.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 1500); } };

  const actions = lang === 'fr' ? [
    ['balance', 'key, action', '{ "balance": 42.5, "currency": "USD" }', 'Vérifiez votre solde revendeur.'],
    ['products', 'key, action', '[ { "product": 12, "name": "…", "rate": 6.60, "available": 120, "status": "In stock" } ]', 'Lister le catalogue, vos prix et le stock en temps réel.'],
    ['add_order', 'key, action, product, quantity', '{ "order": 10231 }', 'Passer une commande. Débite votre solde, livraison automatique.'],
    ['order_status', 'key, action, order', '{ "status": "Completed", "charge": "6.60", "currency": "USD" }', 'Statuts : Pending, Processing, Completed, Canceled.'],
    ['result', 'key, action, order', '{ "result": ["mail:pass:recovery", "…"] }', 'Récupérer les comptes livrés (une ligne par compte).'],
  ] : [
    ['balance', 'key, action', '{ "balance": 42.5, "currency": "USD" }', 'Check your reseller balance.'],
    ['products', 'key, action', '[ { "product": 12, "name": "…", "rate": 6.60, "available": 120, "status": "In stock" } ]', 'List the catalog, your prices, and real-time stock.'],
    ['add_order', 'key, action, product, quantity', '{ "order": 10231 }', 'Place an order. Debits your balance, automatic delivery.'],
    ['order_status', 'key, action, order', '{ "status": "Completed", "charge": "6.60", "currency": "USD" }', 'Statuses: Pending, Processing, Completed, Canceled.'],
    ['result', 'key, action, order', '{ "result": ["mail:pass:recovery", "…"] }', 'Retrieve delivered accounts (one line per account).'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans">
      {/* En-tête */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={14} /> {lang === 'fr' ? 'API Revendeur' : 'Reseller API'}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-6">
          {lang === 'fr' ? 'Revendez notre catalogue ' : 'Resell our catalog '} 
          <span className="text-primary">{lang === 'fr' ? 'via notre API' : 'via our API'}</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed">
          {lang === 'fr' 
            ? 'Intégrez notre catalogue à votre propre boutique. Achetez de manière programmatique, passez vos commandes et livrez vos clients automatiquement, 24/7. Réponses JSON, authentification par clé.' 
            : 'Integrate our catalog into your own store. Buy programmatically, place your orders, and deliver to your clients automatically, 24/7. JSON responses, key authentication.'}
        </p>
      </div>

      {/* Clé API */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Shield size={18} className="text-primary" /> {lang === 'fr' ? 'Votre Clé API' : 'Your API Key'}
        </h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-gray-500 dark:text-gray-400 text-sm flex-grow">
            {lang === 'fr' 
              ? 'Votre clé API unique est requise pour authentifier toutes vos requêtes. Pour des raisons de sécurité, vous devez la générer et la copier depuis votre page de Paramètres.' 
              : 'Your unique API key is required to authenticate all your requests. For security reasons, you must generate and copy it from your Settings page.'}
          </p>
          <button onClick={() => navigate('settings?tab=api')} className="bg-primary text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-primaryDark transition-all shrink-0">
            {lang === 'fr' ? 'Gérer ma clé API' : 'Manage my API Key'}
          </button>
        </div>
      </div>

      {/* Connexion */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-4">{lang === 'fr' ? 'Connexion' : 'Connection'}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Endpoint</span><code className="text-primary dark:text-primaryLight font-mono break-all">{API_BASE_URL}</code></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">{lang === 'fr' ? 'Méthode' : 'Method'}</span><span className="text-gray-700 dark:text-gray-300 font-mono">POST</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Content-Type</span><span className="text-gray-700 dark:text-gray-300 font-mono">application/x-www-form-urlencoded</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">{lang === 'fr' ? 'Réponse' : 'Response'}</span><span className="text-gray-700 dark:text-gray-300 font-mono">JSON</span></div>
        </div>
        <div className="mt-6 bg-gray-900 rounded-2xl p-5 overflow-x-auto">
          <pre className="text-[12px] text-gray-255 font-mono leading-relaxed">{`curl -X POST ${API_BASE_URL} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=products"`}</pre>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-soft">
        <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6">{lang === 'fr' ? 'Actions disponibles' : 'Available actions'}</h2>
        <div className="space-y-6">
          {actions.map(([name, params, example, desc]) => (
            <div key={name} className="border-b border-gray-50 dark:border-slate-800 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-primary dark:text-primaryLight font-mono font-black text-sm">action={name}</code>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{desc}</p>
              <p className="text-xs text-gray-400 mb-3"><span className="font-bold">{lang === 'fr' ? 'Paramètres :' : 'Parameters :'}</span> <code className="font-mono">{params}</code></p>
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-[12px] text-gray-200 font-mono">{example}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default ApiView;
