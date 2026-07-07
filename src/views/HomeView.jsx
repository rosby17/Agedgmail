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

const HomeView = ({
  activeGroup, setActiveGroup, activeCategory, setActiveCategory,
  sortBy, setSortBy, searchTerm, setSearchTerm,
  filteredProducts, addToCart, navigate, setSelectedProduct, onBuyNow,
  groups = [], subCategories = [], groupOf, lang, t, loading = false
}) => {
  const activeGroupLabel = activeGroup === 'all' ? 'All products' : (GROUP_LABELS[activeGroup] || 'Others');

  // Vue "All products" : au lieu d'une grille où toutes les catégories sont
  // mélangées, on affiche une section par groupe (Gmail, Youtube, ...) dans
  // l'ordre du menu, chacune listant tous ses produits (triés comme demandé).
  const showGrouped = activeGroup === 'all' && activeCategory === 'all' && !searchTerm.trim() && groupOf;
  const sections = showGrouped
    ? groups
        .map(g => ({ ...g, items: filteredProducts.filter(p => groupOf(p) === g.id) }))
        .filter(g => g.items.length > 0)
    : null;

  const pillCls = (active) =>
    `shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
      active
        ? 'bg-primary/10 border-primary text-primary'
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-primary/50'
    }`;

  return (
    <main id="catalog" className="max-w-7xl mx-auto px-6 py-10 font-sans">
      {/* Groupes de premier niveau */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        <button onClick={() => { setActiveGroup('all'); setActiveCategory('all'); }} className={pillCls(activeGroup === 'all')}>
          All products
        </button>
        {groups.map(g => (
          <button key={g.id} onClick={() => { setActiveGroup(g.id); setActiveCategory('all'); }} className={pillCls(activeGroup === g.id)}>
            {g.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sous-catégories du groupe sélectionné */}
      {activeGroup !== 'all' && subCategories.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-5 mb-2 border-b border-gray-100 dark:border-gray-800 -mx-1 px-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 w-9 h-9 rounded-full text-xs font-black flex items-center justify-center transition-all ${
              activeCategory === 'all' ? 'bg-gray-900 dark:bg-primary text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
            title="Toutes les sous-catégories"
          >
            All
          </button>
          {subCategories.map(sc => (
            <button key={sc.id} onClick={() => setActiveCategory(sc.id)} className={pillCls(activeCategory === sc.id)}>
              {sc.name}
            </button>
          ))}
        </div>
      )}

      {/* En-tête : titre du groupe, compteur, recherche, tri */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mt-8 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 rounded-full bg-primary" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{activeGroupLabel}</h2>
          <span className="bg-primary/10 text-primaryDark dark:text-primary text-xs font-black px-3 py-1 rounded-full">{loading ? '…' : `${filteredProducts.length} produits`}</span>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="price_asc">{t('priceAsc')}</option>
            <option value="price_desc">{t('priceDesc')}</option>
            <option value="name_asc">{t('nameAsc')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonProductGrid count={8} />
      ) : showGrouped ? (
        <div className="space-y-14">
          {sections.map(section => (
            <div key={section.id}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-5 rounded-full bg-primary" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{section.name}</h3>
                <span className="bg-primary/10 text-primaryDark dark:text-primary text-xs font-black px-3 py-1 rounded-full">{section.items.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.items.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} onBuyNow={onBuyNow} lang={lang} t={t} />))}
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Search size={30} className="text-gray-300" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('noProducts')}</h3>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} onBuyNow={onBuyNow} lang={lang} t={t} />))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Search size={30} className="text-gray-300" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('noProducts')}</h3>
              <p className="text-gray-400 text-sm">Essayez de modifier votre recherche ou de changer de catégorie.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};
export default HomeView;
