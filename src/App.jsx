import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash } from 'lucide-react';
import { supabase } from './supabaseClient';
import { PRODUCTS as PRODUCTS_RAW } from './productsData';
import * as XLSX from 'xlsx';

// ==========================================
// CONFIGURATION ADMIN & SUPPORT
// ==========================================
const ADMIN_EMAIL = "rooseveltmkr@gmail.com";

// ==========================================
// COMPOSANTS UI STYLÉS
// ==========================================

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onCancel} />
      <div className="bg-white rounded-[3rem] w-full max-w-md p-10 relative shadow-2xl border border-white/20">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-8 mx-auto ${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
          {type === 'danger' ? <Trash2 size={36} /> : <Info size={36} />}
        </div>
        <h3 className="text-2xl font-black text-center mb-3 tracking-tighter">{title}</h3>
        <p className="text-gray-500 text-center mb-10 leading-relaxed font-medium">{message}</p>
        <div className="flex gap-4">
          <button onClick={onCancel} className="flex-1 h-14 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 h-14 rounded-2xl font-bold text-white transition-all shadow-xl ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-gray-900 hover:bg-primary shadow-gray-900/20'}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const YouTubeLogo = ({ className = "" }) => (
  <img src="/youtube-logo.png" alt="YouTube" className={`w-full h-full object-contain scale-[1.5] ${className}`} />
);

const GmailLogo = ({ className = "" }) => (
  <img src="/gmail-logo.png" alt="Gmail" className={`w-full h-full object-contain scale-[1.5] ${className}`} />
);

const FacebookIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Logos de marque (SVG inline) pour les catégories importées sans logo dédié.
const brandBox = "w-full h-full object-contain p-3";
const DiscordLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#5865F2" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
  </svg>
);
const InstagramLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs>
    <rect width="24" height="24" rx="6" fill="url(#ig)"/>
    <path fill="none" stroke="#fff" strokeWidth="1.6" d="M8 3.5h8A4.5 4.5 0 0120.5 8v8a4.5 4.5 0 01-4.5 4.5H8A4.5 4.5 0 013.5 16V8A4.5 4.5 0 018 3.5z"/>
    <circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" strokeWidth="1.6"/>
    <circle cx="16.6" cy="7.4" r="1.1" fill="#fff"/>
  </svg>
);
const TwitterLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#000" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const TikTokLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#25F4EE" d="M9.4 8.9v-1a4.6 4.6 0 00-1-.1A4.7 4.7 0 004.3 15a4.7 4.7 0 01-.9-2.8 4.7 4.7 0 016-4.5z"/>
    <path fill="#000" d="M16.6 3h-2.9v11.6a2 2 0 11-1.4-1.9V9.7a4.9 4.9 0 00-.6 0A4.9 4.9 0 1016.2 15V8.9a6.3 6.3 0 003.7 1.2V7.2a3.5 3.5 0 01-3.3-3.5z"/>
    <path fill="#FE2C55" d="M17.6 6.2A3.5 3.5 0 0116.6 3h-.9a3.5 3.5 0 002.9 3.5zM12.9 11.9a2 2 0 00-1.4 3.7 2 2 0 01-.6-3.6 2 2 0 012 0z"/>
  </svg>
);
const AppleLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#000" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);
const TelegramLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#229ED9"/>
    <path fill="#fff" d="M5.5 11.8l11-4.24c.51-.19.96.12.79.9l-1.87 8.82c-.13.61-.5.76-1.01.47l-2.8-2.06-1.35 1.3c-.15.15-.28.28-.56.28l.2-2.85 5.19-4.69c.23-.2-.05-.31-.35-.11l-6.41 4.04-2.76-.86c-.6-.19-.61-.6.13-.89z"/>
  </svg>
);
const SmsLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#22c55e" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2zM7 9h10v2H7zm0-3h10v2H7z"/>
  </svg>
);

// ==========================================
// COMPOSANT SUPPORT CHAT — retiré (plus de contact WhatsApp)
// ==========================================

// ==========================================
// CATALOGUE PRODUITS
// ==========================================

const CATEGORIES = [
  { id: 'all', name: 'All products' },
  { id: 'email', name: 'Email (Gmail)' },
  { id: 'youtube_aged', name: 'Aged Youtube Channels' },
  { id: 'youtube_monetized', name: 'Monetized Channels' },
  { id: 'youtube_not_monetized', name: 'Non-Monetized Channels' },
  { id: 'youtube_cpa', name: 'Special Channels' },
  { id: 'facebook', name: 'Facebook Page' },
];

// Nom affichable d'une catégorie : libellé connu, sinon la catégorie brute
// (les catégories importées de YTSeller sont utilisées telles quelles).
const categoryName = (cat) => CATEGORIES.find(c => c.id === cat)?.name || cat || 'Others';

// Choix du visuel/logo à partir d'une catégorie (insensible à la casse,
// fonctionne aussi pour les catégories importées).
const categoryVisual = (cat = '') => {
  const c = String(cat).toLowerCase();
  if (c.includes('youtube')) return 'youtube';
  if (c.includes('gmail') || c === 'email' || c.includes('mail')) return 'gmail';
  if (c.includes('facebook')) return 'facebook';
  if (c.includes('instagram')) return 'instagram';
  if (c.includes('tiktok') || c.includes('tik tok')) return 'tiktok';
  if (c.includes('twitter') || c.includes('/x') || c === 'x') return 'twitter';
  if (c.includes('discord')) return 'discord';
  if (c.includes('icloud') || c.includes('apple')) return 'apple';
  if (c.includes('telegram')) return 'telegram';
  if (c.includes('sms')) return 'sms';
  return 'other';
};

// Libellés + ordre d'affichage des groupes de premier niveau (barre du haut).
const GROUP_LABELS = {
  gmail: 'Gmail', youtube: 'Youtube', discord: 'Discord', facebook: 'Facebook',
  instagram: 'Instagram', twitter: 'Twitter X', tiktok: 'Tiktok', apple: 'Apple ID',
  telegram: 'Telegram', sms: 'SMS', other: 'Others',
};
const GROUP_ORDER = ['gmail', 'youtube', 'discord', 'facebook', 'instagram', 'twitter', 'tiktok', 'apple', 'telegram', 'sms', 'other'];

// Visuel d'un produit : image personnalisée (image_url) prioritaire, sinon
// logo de marque déduit de la catégorie, sinon icône générique.
const ProductVisual = ({ product = {}, iconSize = 48 }) => {
  if (product.image_url) {
    return <img src={product.image_url} alt={product.name || ''} className="w-full h-full object-contain" loading="lazy" />;
  }
  switch (categoryVisual(product.category)) {
    case 'youtube':   return <YouTubeLogo />;
    case 'gmail':     return <GmailLogo />;
    case 'facebook':  return <FacebookIcon className="w-full h-full object-contain p-3 text-blue-600" />;
    case 'instagram': return <InstagramLogo />;
    case 'tiktok':    return <TikTokLogo />;
    case 'twitter':   return <TwitterLogo />;
    case 'discord':   return <DiscordLogo />;
    case 'apple':     return <AppleLogo />;
    case 'telegram':  return <TelegramLogo />;
    case 'sms':       return <SmsLogo />;
    default:          return <Share2 size={iconSize} className="text-gray-300" />;
  }
};


const getProductDetails = (product) => {
  const commonTerms = "Please read the specifications before purchasing. You are responsible for all actions on the account. Use fresh residential IPs. Change access after 48h only.";
  return {
    info: product.category === 'email'
      ? `Age : ${product.name.match(/\d{4}/)?.[0] || 'Aged'} | Country : ${product.name.includes('US') ? 'US' : 'Random'} | Format : Gmail/Pass/Recovery/2FA`
      : product.category === 'facebook'
        ? "Age : Aged (2012-2020) | Friends : 50+ | Status : Verified | Quality : Green"
        : product.category === 'youtube_not_monetized'
          ? `Subscribers : ${product.name.split(' – ')[1] || '1k+'} | Eligibility : Immediate | Content : None`
          : `Year : ${product.name.match(/\d{4}/)?.[0] || 'Aged'} | Status : ${product.category === 'youtube_monetized' ? 'Monetized' : 'Non-Monetized'} | Content : Clean`,
    note: product.category === 'facebook'
      ? "Ideal for Meta Ads. Stable account with history."
      : product.category.includes('youtube')
        ? "Perfect for YT automation business."
        : "High quality Gmail. Format: Email | Pass | Recovery | 2FA.",
    terms: commonTerms,
    refund: "3-day warranty until login."
  };
};

const PRODUCTS = PRODUCTS_RAW.map(p => ({ ...p, details: getProductDetails(p) }));

// ==========================================
// PRODUCT CARD
// ==========================================

const ProductCard = ({ product, addToCart, navigate, setSelectedProduct }) => {
  const [localQty, setLocalQty] = useState(1);
  const [added, setAdded] = useState(false);
  const isUS = product.name.toUpperCase().includes('US') || product.name.toUpperCase().includes('USA');

  const handleAdd = () => {
    addToCart(product, localQty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-transparent flex flex-col h-full font-sans">
      {/* Logo Area */}
      <div
        className="aspect-[1.5] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] flex items-center justify-center mb-5 overflow-hidden cursor-pointer relative shrink-0"
        onClick={() => { setSelectedProduct(product); navigate('product'); }}
      >
        <div className="w-full h-full p-8 flex items-center justify-center">
          <ProductVisual product={product} iconSize={48} />
        </div>
        {isUS && product.category === 'email' && (
          <div className="absolute bottom-4 right-4 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">US</div>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {categoryName(product.category)}
        </div>
        <h3
          className="text-[15px] font-bold text-primary leading-snug cursor-pointer mb-4 hover:text-red-600 transition-colors"
          onClick={() => { setSelectedProduct(product); navigate('product'); }}
        >
          {product.name}
        </h3>

        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</div>
          {product.stock <= 0 && (
            <div className="bg-red-50 text-red-500 text-[9px] font-black uppercase px-2 py-1 rounded-md tracking-widest">
              Out of stock
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-gray-50 rounded-xl p-1 shrink-0 border border-gray-100">
          <button onClick={() => localQty > 1 && setLocalQty(localQty - 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-400"><Minus size={14} /></button>
          <input
            type="number"
            value={localQty}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              if (!isNaN(val) && val >= 1) setLocalQty(Math.min(val, 9999));
            }}
            className="w-12 bg-transparent text-center text-xs font-bold text-gray-900 outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button onClick={() => localQty < 9999 && setLocalQty(localQty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-lg transition-all text-gray-400"><Plus size={14} /></button>
        </div>
        <button
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className={`flex-grow h-12 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${product.stock <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : added ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-gray-900 text-white hover:bg-primary shadow-lg shadow-black/5'}`}
        >
          {product.stock <= 0 ? 'Sold out' : added ? <><CheckCircle size={14} /> Added!</> : <><ShoppingCart size={14} /> Add</>}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// NAVBAR
// ==========================================

const Navbar = ({ cartTotal, cartCount, navigate, session, profile, currentView, setActiveCategory, setActiveGroup, onCartClick }) => {
  const go = (view, cat, group) => {
    if (cat !== undefined && setActiveCategory) setActiveCategory(cat);
    if (group !== undefined && setActiveGroup) setActiveGroup(group);
    navigate(view);
  };
  const linkCls = (active) => `text-sm font-bold transition-colors ${active ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'}`;
  return (
  <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 font-sans">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        {currentView !== 'home' && (
          <button
            onClick={() => window.history.back()}
            className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
        )}
        <button onClick={() => go('home', 'all', 'all')} className="h-20 flex items-center group transition-all">
          <img src="/logo.png" alt="AgedGmailYT" className="h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </button>
      </div>

      {/* Menu central */}
      <nav className="hidden lg:flex items-center gap-8">
        <button onClick={() => go('home', 'all', 'all')} className={linkCls(currentView === 'home')}>Products</button>
        <button onClick={() => go('home', 'all', 'sms')} className={linkCls(false)}>SMS</button>
        <button onClick={() => navigate('api')} className={linkCls(currentView === 'api')}>API</button>
      </nav>

      <div className="flex items-center gap-4">
        {session && session.user.email === ADMIN_EMAIL && (
          <button onClick={() => navigate('admin')} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Shield size={14} /> Admin
          </button>
        )}
        {session ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end border-r border-gray-100 dark:border-gray-700 pr-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">My Balance</span>
              <span className="text-sm font-bold text-primary font-mono">${profile?.balance?.toFixed(2) || "0.00"}</span>
            </div>
            <div className="relative group">
              <button className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100 dark:border-gray-700">
                <User size={18} />
              </button>
              {/* Menu déroulant au survol : ponte entre le bouton et le menu pour éviter la coupure du hover */}
              <div className="absolute right-0 top-full pt-2 w-52 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-2">
                  <button onClick={() => navigate('dashboard')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-all">
                    <History size={16} /> My orders
                  </button>
                  <button onClick={() => navigate('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-all">
                    <Settings size={16} /> Settings
                  </button>
                  <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />
                  <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('auth')} className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <User size={18} /> LOGIN/SIGNUP
          </button>
        )}
        <button onClick={onCartClick} className="bg-gray-900 dark:bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 hover:bg-black dark:hover:bg-primaryDark transition-all shadow-lg shadow-black/10 relative">
          <ShoppingCart size={18} />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />}
          <span className="border-l border-white/20 pl-3">CART / ${cartTotal.toFixed(2)}</span>
        </button>
      </div>
    </div>
  </header>
  );
};

// ==========================================
// HOME VIEW
// ==========================================

const HomeView = ({
  activeGroup, setActiveGroup, activeCategory, setActiveCategory,
  sortBy, setSortBy, searchTerm, setSearchTerm,
  filteredProducts, addToCart, navigate, setSelectedProduct,
  groups = [], subCategories = [],
}) => {
  const activeGroupLabel = activeGroup === 'all' ? 'All products' : (GROUP_LABELS[activeGroup] || 'Others');

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
              activeCategory === 'all' ? 'bg-gray-900 dark:bg-primary text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
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
          <span className="bg-primary/10 text-primaryDark dark:text-primary text-xs font-black px-3 py-1 rounded-full">{filteredProducts.length} produits</span>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              placeholder="Rechercher…"
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="name_asc">Nom (A-Z)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filteredProducts.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} />))}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Search size={30} className="text-gray-300" /></div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun produit trouvé</h3>
            <p className="text-gray-400 text-sm">Essayez de modifier votre recherche ou de changer de catégorie.</p>
          </div>
        )}
      </div>
    </main>
  );
};

// ==========================================
// API VIEW — API revendeur (doc + gestion de clé)
// ==========================================
const API_BASE_URL = 'https://agedgmail.tools-cl.com/api/v2';

const ApiView = ({ navigate, session }) => {
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

  const actions = [
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
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primaryDark px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={14} /> Reseller API
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
          Resell our catalog <span className="text-primary">via our API</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Integrate our catalog into your own store. Buy programmatically,
          place your orders, and deliver to your clients automatically, 24/7. JSON responses,
          key authentication.
        </p>
      </div>

      {/* Clé API */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-primary" /> Your API Key</h2>
        {!session ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-gray-500 text-sm flex-grow">Log in to generate your API key and get started.</p>
            <button onClick={() => navigate('auth')} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primaryDark transition-all">Log in</button>
          </div>
        ) : apiKey ? (
          <div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
              <code className="text-primary font-mono text-sm flex-grow break-all">{apiKey}</code>
              <button onClick={copyKey} className="shrink-0 text-xs font-bold px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-primary transition-all">{copied ? 'Copied!' : 'Copy'}</button>
            </div>
            <p className="text-gray-400 text-xs mt-3">Keep this key secret. It grants access to your balance and your orders.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-gray-500 text-sm flex-grow">No active key. Generate one to access the API.</p>
            <button onClick={generateKey} disabled={loading} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primaryDark transition-all disabled:opacity-50">{loading ? 'Generating…' : 'Generate my API Key'}</button>
          </div>
        )}
      </div>

      {/* Connexion */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-4">Connection</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Endpoint</span><code className="text-primary font-mono break-all">{API_BASE_URL}</code></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Method</span><span className="text-gray-700 font-mono">POST</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Content-Type</span><span className="text-gray-700 font-mono">application/x-www-form-urlencoded</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Response</span><span className="text-gray-700 font-mono">JSON</span></div>
        </div>
        <div className="mt-6 bg-gray-900 rounded-2xl p-5 overflow-x-auto">
          <pre className="text-[12px] text-gray-200 font-mono leading-relaxed">{`curl -X POST ${API_BASE_URL} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=products"`}</pre>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft">
        <h2 className="text-lg font-black text-gray-900 mb-6">Available actions</h2>
        <div className="space-y-6">
          {actions.map(([name, params, example, desc]) => (
            <div key={name} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-primary font-mono font-black text-sm">action={name}</code>
              </div>
              <p className="text-gray-600 text-sm mb-2">{desc}</p>
              <p className="text-xs text-gray-400 mb-3"><span className="font-bold">Parameters :</span> <code className="font-mono">{params}</code></p>
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

// ==========================================
// POLICIES VIEW — CGU / Avertissement / Politique d'achat / Garantie
// ==========================================
const POLICY_SECTIONS = [
  {
    id: 'terms',
    title: "Terms of Service",
    icon: FileText,
    content: [
      "Please read the product description and this policy carefully before purchasing.",
      "You are fully responsible for all actions taken on the account after delivery.",
      "Upon receipt of the account, you must log in and check it immediately to ensure it matches the description.",
    ],
  },
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    icon: Shield,
    content: [
      "You agree that your use of AgedGmailYT is at your own risk. AgedGmailYT cannot be held liable for any damages you or your business may suffer.",
      "AgedGmailYT does not guarantee the continuous availability of the site, as it relies on third-party internet services.",
    ],
  },
  {
    id: 'purchase',
    title: "Purchase Policy",
    icon: ShoppingCart,
    content: [
      "By purchasing credits or topping up your balance, you confirm you understand and accept your purchase, and agree not to open fraudulent disputes or post bad faith reviews.",
      "In case of an attempted fraudulent dispute or abusive review, we reserve the right to reset credits, suspend the account, and/or permanently ban the relevant IP address.",
      "The balance credited on AgedGmailYT is non-refundable as long as the system and site are operating normally. The product warranty is calculated from the moment it is delivered to you; your failure to log in does not entitle you to a replacement or refund.",
      "After purchase, please download and keep your data on your end. Orders are automatically deleted from our systems after 30 days for security reasons.",
      "When a product is in EMAIL | PASSWORD | (RECOVERY) format, the email and password are always provided; recovery information depends on stock availability at the time of order.",
      "Credits are not transferable between different products or services.",
      "The product is delivered immediately after purchase; it is your responsibility to use it, even if you do not log in right away.",
      "After the first login, and only after a few days, systematically change the password, recovery email, phone number, and enable two-step verification to secure the account.",
      "Always use a clean/residential IP to connect. Never use a free proxy or VPN, social platforms detect them. No replacement will be made if you use a VPN or a free proxy to connect.",
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty Policy',
    icon: CheckCircle,
    content: [],
  },
];

const WARRANTY_BLOCKS = [
  {
    label: 'Warranty',
    items: [
      "We only guarantee the first successful login and that the product is delivered as described.",
      "We do not guarantee that account information can be changed immediately (many platforms require prolonged use from the same IP and device).",
      "We cannot guarantee the receipt of verification codes sent to an old email or old number. Add your own email and number if needed.",
      "No warranty is applied if: you have changed the password, recovery email, phone number, or enabled 2FA; you connected via a VPN or free proxy; or if the login works on our end but not yours (issue related to your configuration).",
    ],
  },
  {
    label: 'Recommendations',
    items: [
      "Change the password, recovery email, check device activity, add a phone number, and enable 2FA to secure your account.",
      "It is recommended to make these changes at least 7 days after the first login, with the same browser profile and IP/proxy.",
      "If you are a beginner or unsure about managing multiple accounts or channels, contact support for guidance.",
      "For certain regions (China, Nigeria, Russia...), using a suitable proxy for Gmail/YouTube is recommended.",
    ],
  },
  {
    label: 'Refund Policy',
    items: [
      "If delivery is impossible due to a platform update, you can choose to wait or request a cancellation.",
      "The warranty ends immediately after the first successful login.",
      "Accounts are guaranteed 1 day (2 days for bulk orders) until your first login.",
      "If the account does not work or is banned before your first login, contact us for verification and replacement.",
    ],
  },
];

const PoliciesView = ({ navigate }) => {
  const [active, setActive] = useState('terms');
  const activeSection = POLICY_SECTIONS.find(s => s.id === active);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans">
      <div className="mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primaryDark px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Shield size={14} /> Politiques
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">Terms of Service, Warranty, and Purchase Policies</h1>
        <p className="text-gray-500 text-lg leading-relaxed">Please read these policies carefully before any purchase on AgedGmailYT.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-10">
        {POLICY_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold border transition-all ${
              active === s.id ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'
            }`}
          >
            <s.icon size={16} /> {s.title}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-soft">
        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
          <activeSection.icon size={22} className="text-primary" /> {activeSection.title}
        </h2>

        {active === 'warranty' ? (
          <div className="space-y-10">
            {WARRANTY_BLOCKS.map(block => (
              <div key={block.label}>
                <h3 className="text-sm font-black text-primary uppercase tracking-widest mb-4">{block.label}</h3>
                <ul className="space-y-3">
                  {block.items.map((item, i) => (
                    <li key={i} className="flex gap-3 text-gray-600 text-sm leading-relaxed">
                      <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <ul className="space-y-4">
            {activeSection.content.map((item, i) => (
              <li key={i} className="flex gap-3 text-gray-600 text-sm leading-relaxed">
                <CheckCircle size={16} className="text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="text-center mt-12">
        <button onClick={() => navigate('home')} className="text-sm font-bold text-primary hover:underline">Back to catalog</button>      </div>
    </div>
  );
};

const SettingsTab = ({ profile, onUpdate }) => {
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tfaEnabled, setTfaEnabled] = useState(profile?.two_factor_enabled || false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [uploading, setUploading] = useState(false);

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Auto-save to profile
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      onUpdate();
    } catch (error) {
      setErrorMessage("Upload error: Ensure you have created a public 'avatars' bucket in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        email,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        avatar_url: avatarUrl,
        two_factor_enabled: tfaEnabled,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setErrorMessage(error.message);
    else {
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    }
    setLoading(false);
  };

  const handleDissociateGoogle = async () => {
    // To dissociate Google, user must have an email/password. 
    // We send a password reset email to force them to set a password.
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/dashboard?tab=settings',
    });
    if (error) setErrorMessage(error.message);
    else {
      alert("A password setup email has been sent to you. Once configured, you can log in via email/pass.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Profile Settings</h2>
        <form className="space-y-8" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">First Name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: John" /></div>
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Last Name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: Doe" /></div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Username (Public) *</label><input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /><p className="text-[10px] text-gray-400 italic mt-2">This is the name that will appear on your dashboard and your reviews.</p></div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center overflow-hidden relative group">
                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Preview" /> : <User size={30} className="text-gray-300" />}
                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><RefreshCcw size={20} className="text-white animate-spin" /></div>}
              </div>
              <div className="space-y-3">
                <input type="file" id="avatar" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                <label htmlFor="avatar" className="inline-block bg-white border border-gray-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer">
                  {uploading ? "Loading..." : "Choose a photo"}
                </label>
                <p className="text-[10px] text-gray-400 font-medium italic">JPG, PNG supported. Max 2MB.</p>
              </div>
            </div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address *</label><input type="email" value={email} readOnly className="w-full px-6 py-4 rounded-2xl bg-gray-100 border-none text-gray-400 font-bold text-sm cursor-not-allowed" /></div>
          {errorMessage && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}
          <button type="submit" disabled={loading} className={`px-12 py-5 rounded-full font-bold text-sm transition-all shadow-xl shadow-black/10 flex items-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}>
            {loading ? <RefreshCcw size={16} className="animate-spin" /> : success ? <><CheckCircle size={16} /> Successfully modified</> : 'Save changes'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight flex items-center gap-3"><ShieldCheck size={28} className="text-primary" /> Security & Connection</h2>
        <div className="space-y-8">
          <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm"><img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" /></div>
              <div><h4 className="font-bold text-gray-900">Google Account</h4><p className="text-xs text-gray-400 font-medium">Connected via Google Auth</p></div>
            </div>
            <button onClick={handleDissociateGoogle} disabled={loading} className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Unlink</button>
          </div>

          <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary"><CreditCard size={24} /></div>
              <div><h4 className="font-bold text-gray-900">Two-Factor Authentication (2FA)</h4><p className="text-xs text-gray-400 font-medium">Add an extra layer of security to your account.</p></div>
            </div>
            <button onClick={async () => {
              const newVal = !tfaEnabled;
              setTfaEnabled(newVal);
              await supabase.from('profiles').update({ two_factor_enabled: newVal }).eq('id', profile.id);
            }} className={`w-14 h-7 rounded-full relative transition-all duration-300 ${tfaEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${tfaEnabled ? 'left-8' : 'left-1'}`} />
            </button>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Password Change</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New password" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
            </div>
            <button onClick={handleUpdatePassword} disabled={loading} className="text-sm font-black text-primary hover:underline uppercase tracking-wider disabled:opacity-50">
              {loading ? "Updating..." : "Update password"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DASHBOARD VIEW
// ==========================================

// Modale de crédentiels réutilisée par MyOrdersView (extraite pour éviter la duplication).
const OrderCredentialsModal = ({ order, onClose }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
    <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
        <div><h3 className="text-xl font-bold">{order.product_name}</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Your login credentials</p></div>
        <button onClick={onClose} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><X size={20} /></button>
      </div>
      <div className="p-10 space-y-8">
        <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
              <Info size={12} className="text-primary" /> Format: Email | Password | Recovery | 2FA
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(order.credentials || order.data || "")}
              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
            >
              <Copy size={12} /> Copy All
            </button>
          </div>
          <div
            className="font-mono text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mt-6"
            dangerouslySetInnerHTML={{
              __html: (() => {
                if (!order.credentials && !order.data) return "Waiting for delivery...";
                const creds = order.credentials || order.data;
                const highlighted = creds.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '<span class="bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded-md">$1</span>');
                return `<div class="space-y-4">
                    <p>Thank you very much for your purchase.</p>
                    <p>Here are your products:</p>
                    <p class="font-black text-lg text-gray-900 border-b border-gray-100 pb-2">${order.product_name}</p>
                    <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                      ${highlighted}
                    </div>
                    <div class="h-px bg-gray-100 my-8"></div>
                    <div class="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                      <h4 class="text-gray-900 font-black mb-4 uppercase">How to connect (2FA)</h4>
                      <p class="text-xs leading-relaxed text-gray-600 mb-4">Paste the 2FA string on <a href="https://2fa.live" target="_blank" class="text-primary underline font-bold">2fa.live</a> to get the 6-digit code.</p>
                      <p class="text-xs font-bold">Tutorial: <a href="https://www.youtube.com/watch?v=JbjION2rdPA" target="_blank" class="text-primary underline">YouTube</a></p>
                    </div>
                    <div class="bg-red-50 p-6 rounded-3xl border border-red-100 mt-6">
                      <p class="text-red-500 font-bold text-xs">Warranty period ends after successful login.</p>
                    </div>
                  </div>`;
              })()
            }}
          />
        </div>
      </div>
      <button onClick={onClose} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-black/10">Close window</button>
    </div>
  </div>
);

// Page "My orders" : solde + recharge en tête, liste des commandes en dessous.
// Plus de sidebar à onglets (Dashboard/Orders/Settings) — Settings vit maintenant
// dans sa propre page (menu déroulant du profil), et l'onglet "Dashboard" a été
// retiré car redondant avec cette page elle-même.
const MyOrdersView = ({ profile, navigate, orders = [] }) => {
  const [viewOrder, setViewOrder] = useState(null);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans">
      {viewOrder && <OrderCredentialsModal order={viewOrder} onClose={() => setViewOrder(null)} />}

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">My orders</h1>
      </div>

      <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="relative z-10">
          <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Current Balance</div>
          <div className="text-4xl font-black font-mono">${profile?.balance?.toFixed(2) || "0.00"}</div>
        </div>
        <button onClick={() => navigate('recharge')} className="relative z-10 bg-primary text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-primaryDark transition-all shadow-xl shadow-primary/20 flex items-center gap-2 shrink-0"><Plus size={18} /> Top up account</button>
        <Wallet size={120} className="absolute -bottom-6 -right-6 text-white/5" />
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-soft">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">No order found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead><tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"><th className="pb-6">Order</th><th className="pb-6">Date</th><th className="pb-6">Status</th><th className="pb-6">Actions</th><th className="pb-6 text-right">Total</th></tr></thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="group">
                    <td className="py-6"><div className="font-bold text-gray-900">{order.product_name}</div><div className="text-[10px] text-gray-400 font-bold">Quantity: {order.quantity}</div></td>
                    <td className="py-6 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-6">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full border ${order.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}>
                        {order.status === 'confirmed' ? 'Confirmed' : order.status === 'cancelled' ? 'Cancelled' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-6">
                      {order.product_name !== "Recharge Binance" && (
                        <button onClick={() => setViewOrder(order)} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary/10 hover:text-primary transition-all text-gray-500">
                          <Eye size={14} /> View access
                        </button>
                      )}
                    </td>
                    <td className="py-6 text-right font-black text-gray-900">${order.total_price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Page Paramètres dédiée (accessible via le menu déroulant du profil, plus
// via un onglet noyé dans un dashboard).
const SettingsView = ({ profile, navigate, fetchProfile, session }) => (
  <div className="max-w-3xl mx-auto px-6 py-16 font-sans">
    <div className="flex items-center gap-4 mb-10">
      <button onClick={() => navigate('dashboard')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-100"><ArrowLeft size={18} /></button>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Settings</h1>
    </div>
    <SettingsTab profile={profile} onUpdate={() => fetchProfile && session && fetchProfile(session.user.id)} />
  </div>
);

// ==========================================
// STOCK MANAGER COMPONENT
// ==========================================
const StockManager = ({ product, onClose, fetchProducts }) => {
  const [bulkText, setBulkText] = useState('');
  const [stockInfo, setStockInfo] = useState({ total: 0, available: 0, delivered: 0 });
  const [loading, setLoading] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [error, setError] = useState('');
  const [existingStock, setExistingStock] = useState('');
  const [showExisting, setShowExisting] = useState(false);

  const fetchStock = async () => {
    const { data } = await supabase.from('account_stock')
      .select('id, credentials, is_delivered')
      .eq('product_id', product.id);

    if (data) {
      const available = data.filter(r => !r.is_delivered);
      const deliveredCount = data.length - available.length;
      setStockInfo({ total: data.length, available: available.length, delivered: deliveredCount });
      setExistingStock(available.map(r => r.credentials).join('\n'));
    }
  };

  useEffect(() => {
    fetchStock();
  }, [product.id]);

  const handleImport = async () => {
    const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (lines.length === 0) { setError('Collez au moins une ligne de credentials.'); return; }
    setLoading(true); setError('');
    const rows = lines.map(cred => ({ product_id: product.id, credentials: cred, is_delivered: false }));
    const { error: insErr } = await supabase.from('account_stock').insert(rows);
    if (insErr) { setError('Erreur : ' + insErr.message); setLoading(false); return; }
    setImportSuccess(true);
    setBulkText('');
    await fetchStock();
    if (fetchProducts) fetchProducts();
    setTimeout(() => setImportSuccess(false), 2000);
    setLoading(false);
  };

  const handleUpdateStock = async () => {
    setLoading(true); setError('');
    try {
      // 1. Delete all non-delivered stock for this product
      const { error: delErr } = await supabase
        .from('account_stock')
        .delete()
        .eq('product_id', product.id)
        .eq('is_delivered', false);

      if (delErr) throw delErr;

      // 2. Insert new lines
      const lines = existingStock.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (lines.length > 0) {
        const rows = lines.map(cred => ({ product_id: product.id, credentials: cred, is_delivered: false }));
        const { error: insErr } = await supabase.from('account_stock').insert(rows);
        if (insErr) throw insErr;
      }

      setImportSuccess(true);
      await fetchStock();
      if (fetchProducts) fetchProducts();
      setTimeout(() => {
        setImportSuccess(false);
        setShowExisting(false);
      }, 2000);
    } catch (err) {
      setError('Erreur lors de la mise à jour : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl p-10 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Manage Stock</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"><X size={16} /></button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['Total', stockInfo.total, 'bg-gray-50 text-gray-700'], ['Available', stockInfo.available, 'bg-green-50 text-green-700'], ['Delivered', stockInfo.delivered, 'bg-blue-50 text-blue-700']].map(([label, val, cls]) => (
            <div key={label} className={`${cls} rounded-2xl p-4 text-center`}>
              <div className="text-2xl font-black font-mono">{val}</div>
              <div className="text-[10px] font-black uppercase tracking-widest mt-1">{label}</div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 p-1 bg-gray-50 rounded-2xl">
          <button
            onClick={() => setShowExisting(false)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${!showExisting ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Add Stock
          </button>
          <button
            onClick={() => setShowExisting(true)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${showExisting ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Modify existing ({stockInfo.available})
          </button>
        </div>

        {!showExisting ? (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Paste new accounts <span className="font-normal normal-case text-gray-300">(1 per line)</span></label>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                rows={8}
                placeholder={`email@gmail.com|Password123|recovery@mail.com\nemail2@gmail.com|Password456|recovery2@mail.com`}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono text-xs resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-2">{bulkText.split('\n').filter(l => l.trim()).length} line(s) ready to import</p>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} />{error}</div>}

            <button onClick={handleImport} disabled={loading || importSuccess}
              className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${importSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary'}`}>
              {loading ? <><RefreshCcw size={16} className="animate-spin" /> Importing...</> : importSuccess ? <><CheckCircle size={16} /> Imported!</> : <><Upload size={16} /> Import accounts</>}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Modify/Delete accounts in stock <span className="text-red-400 font-bold">(Warning: Deleted lines will disappear)</span></label>
              <textarea
                value={existingStock}
                onChange={e => setExistingStock(e.target.value)}
                rows={12}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono text-xs resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-gray-400">{existingStock.split('\n').filter(l => l.trim()).length} account(s) remaining</p>
                <button onClick={() => setExistingStock('')} className="text-[10px] font-bold text-red-400 hover:underline">Clear all stock</button>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} />{error}</div>}

            <button onClick={handleUpdateStock} disabled={loading || importSuccess}
              className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${importSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary'}`}>
              {loading ? <><RefreshCcw size={16} className="animate-spin" /> Updating...</> : importSuccess ? <><CheckCircle size={16} /> Stock updated!</> : <><Save size={16} /> Save changes</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ==========================================
// ORDERS ADMIN — Composant gestion commandes
// ==========================================

const OrdersAdmin = ({ allOrders, fetchAllOrders, fetchProducts }) => {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const filtered = filter === 'all'
    ? allOrders
    : allOrders.filter(o => (o.status || 'pending') === filter);

  const confirmOrder = async () => {
    setActionLoading(true);

    if (selectedOrder.product_name === "Recharge Binance") {
      let currentBalance = 0;
      const { data: userData, error: userError } = await supabase.from('profiles').select('balance').eq('id', selectedOrder.user_id).maybeSingle();
      if (!userError && userData) currentBalance = userData.balance || 0;

      const newBalance = currentBalance + (selectedOrder.total_price || 0);
      const { error: balanceError } = await supabase.from('profiles').upsert({
        id: selectedOrder.user_id, email: selectedOrder.buyer_email, balance: newBalance
      });

      if (balanceError) {
        setErrorMessage("Erreur solde : " + balanceError.message);
        setActionLoading(false);
        return;
      }

      await supabase.from('orders').update({
        status: 'confirmed',
        admin_note: adminNote.trim() || null,
        confirmed_at: new Date().toISOString(),
      }).eq('id', selectedOrder.id);

      setActionSuccess(true);

    } else {
      // Auto-distribute from account_stock
      const qty = selectedOrder.quantity || 1;
      const { data: stockRows, error: stockErr } = await supabase
        .from('account_stock')
        .select('id, credentials')
        .eq('product_id', selectedOrder.product_id)
        .eq('is_delivered', false)
        .limit(qty);

      if (stockErr) {
        setErrorMessage("Erreur stock : " + stockErr.message);
        setActionLoading(false);
        return;
      }

      if (!stockRows || stockRows.length < qty) {
        setErrorMessage(`⚠️ Stock insuffisant ! Disponible : ${stockRows?.length || 0} compte(s), requis : ${qty}. Ajoutez des comptes via "Gérer Stock".`);
        setActionLoading(false);
        return;
      }

      const deliveredCreds = stockRows.map(r => r.credentials).join('\n');
      const stockIds = stockRows.map(r => r.id);

      await supabase.from('account_stock').update({
        is_delivered: true, order_id: String(selectedOrder.id), delivered_to: selectedOrder.user_id,
      }).in('id', stockIds);

      await supabase.from('orders').update({
        status: 'confirmed',
        credentials: deliveredCreds,
        data: deliveredCreds,
        admin_note: adminNote.trim() || null,
        confirmed_at: new Date().toISOString(),
      }).eq('id', selectedOrder.id);

      setActionSuccess(true);
    }

    setTimeout(() => {
      setSelectedOrder(null);
      setAdminNote('');
      fetchAllOrders();
      if (fetchProducts) fetchProducts();
      setActionLoading(false);
      setActionSuccess(false);
    }, 1500);
  };

  const cancelOrder = async (id) => {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
    fetchAllOrders();
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer définitivement cette commande ?")) return;
    await supabase.from('orders').delete().eq('id', id);
    fetchAllOrders();
  };

  const statusBadge = (status) => {
    const s = status || 'pending';
    const map = {
      pending: { label: 'En attente', icon: Clock, cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      confirmed: { label: 'Confirmé', icon: CheckCircle, cls: 'bg-green-100 text-green-700 border-green-200' },
      cancelled: { label: 'Annulé', icon: X, cls: 'bg-red-100 text-red-700 border-red-200' },
    };
    const { label, icon: Icon, cls } = map[s] || map.pending;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 w-fit ${cls}`}><Icon size={12} /> {label}</span>;
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Commandes</h2>
        <button onClick={fetchAllOrders} className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-primary transition-all">
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'pending', label: 'En attente', icon: Clock },
          { key: 'confirmed', label: 'Confirmés', icon: CheckCircle },
          { key: 'cancelled', label: 'Annulés', icon: X },
          { key: 'all', label: 'Tous', icon: FileText },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}>
            <f.icon size={14} /> {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
          <p className="text-gray-400 font-bold">Aucune commande</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Produit / ID</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Montant</th>
                <th className="pb-4">TX Binance</th>
                <th className="pb-4">Statut</th>
                <th className="pb-4">Date</th>
                <th className="pb-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-5">
                    <p className="font-bold text-gray-900 text-sm">{order.product_name}</p>
                    <p className="text-gray-400 text-[10px] font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="py-5 text-sm text-gray-600">{order.buyer_email || '—'}</td>
                  <td className="py-5 font-black text-primary font-mono">${order.total_price?.toFixed(2)}</td>
                  <td className="py-5">
                    {order.binance_tx_id
                      ? <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded-lg text-gray-600">{order.binance_tx_id}</span>
                      : <span className="text-gray-300 text-xs italic">Non fourni</span>
                    }
                  </td>
                  <td className="py-5">{statusBadge(order.status)}</td>
                  <td className="py-5 text-xs text-gray-400 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      {(!order.status || order.status === 'pending') && (
                        <>
                          <button onClick={() => { setSelectedOrder(order); setCredentials(''); setAdminNote(''); }}
                            className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all" title="Confirmer">
                            <CheckCircle size={14} />
                          </button>
                          <button onClick={() => cancelOrder(order.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-all" title="Annuler">
                            <X size={14} />
                          </button>
                        </>
                      )}
                      {order.status === 'confirmed' && (
                        <button onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all" title="Voir credentials">
                          <Eye size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteOrder(order.id)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500 transition-all" title="Supprimer définitivement">
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
          <div className="relative w-full max-w-4xl bg-white rounded-[3rem] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {(!selectedOrder.status || selectedOrder.status === 'pending') ? 'Confirmer la commande' : 'Détail de la commande'}
                </h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">ID: #{selectedOrder.id.toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-gray-50 rounded-full text-gray-400 hover:text-gray-900 flex items-center justify-center transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="bg-gray-50/50 border border-gray-100 rounded-3xl p-8 space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2 mb-4">Informations Client</h4>
                  {[
                    ['Produit', selectedOrder.product_name, Package],
                    ['Email Client', selectedOrder.buyer_email || '—', Mail],
                    ['Montant', `$${selectedOrder.total_price?.toFixed(2)}`, Wallet],
                    ['TX Binance', selectedOrder.binance_tx_id || 'Non fourni', Hash],
                    ['Date', new Date(selectedOrder.created_at).toLocaleString(), Clock],
                  ].map(([label, val, Icon]) => (
                    <div key={label} className="flex justify-between items-center group">
                      <span className="text-gray-400 font-medium text-xs flex items-center gap-2">
                        <Icon size={14} className="text-gray-300 group-hover:text-primary transition-colors" /> {label}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">{val}</span>
                    </div>
                  ))}
                </div>

                {(!selectedOrder.status || selectedOrder.status === 'pending') && (
                  <div className="space-y-6">
                    {selectedOrder.product_name !== "Recharge Binance" && (
                      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4">
                        <Zap size={24} className="text-blue-500 mt-1" />
                        <div>
                          <p className="text-sm font-bold text-blue-800">Livraison automatique prête</p>
                          <p className="text-xs text-blue-600 mt-1 leading-relaxed">Le système va distribuer <span className="font-black underline">{selectedOrder.quantity || 1} compte(s)</span> depuis le stock <span className="font-bold">{selectedOrder.product_name}</span>.</p>
                        </div>
                      </div>
                    )}
                    <div className="space-y-4">
                      <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">Note administrative</label>
                      <textarea
                        value={adminNote}
                        onChange={e => setAdminNote(e.target.value)}
                        placeholder="Note interne (ex: Paiement reçu sur Binance)..."
                        className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 outline-none text-sm min-h-[100px] resize-none"
                      />
                    </div>
                    {errorMessage && (
                      <div className="bg-red-50 text-red-500 p-4 rounded-2xl text-xs font-bold border border-red-100 flex items-center gap-2">
                        <AlertTriangle size={14} /> {errorMessage}
                      </div>
                    )}
                    <button onClick={confirmOrder} disabled={actionLoading || actionSuccess}
                      className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-xl ${actionSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary shadow-gray-900/10'}`}>
                      {actionLoading ? <><RefreshCcw size={18} className="animate-spin" /> Traitement...</> : actionSuccess ? <><CheckCircle size={18} /> Confirmé !</> : (selectedOrder.product_name === "Recharge Binance" ? <><CheckCircle size={18} /> Valider Recharge</> : <><Zap size={18} /> Livrer Instantanément</>)}
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  {selectedOrder.product_name === "Recharge Binance" ? "Confirmation" : "Contenu de la livraison"}
                </label>
                <div className="bg-white border border-gray-100 rounded-3xl p-1 shadow-inner h-full min-h-[300px]">
                  <div
                    className="font-mono text-xs text-gray-600 p-6 leading-relaxed whitespace-pre-wrap break-all h-full max-h-[500px] overflow-y-auto custom-scrollbar"
                    dangerouslySetInnerHTML={{
                      __html: (() => {
                        if (selectedOrder.status !== 'confirmed') {
                          return '<div class="text-gray-300 italic flex items-center justify-center h-full">La commande doit être validée pour afficher les accès.</div>';
                        }
                        if (selectedOrder.product_name === "Recharge Binance") {
                          return '<div class="flex items-center gap-2 text-green-600 font-bold"><span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Recharge effectuée avec succès.</div>';
                        }
                        const creds = selectedOrder.credentials || selectedOrder.data || "Identifiants introuvables.";
                        return creds.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '<span class="bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded-md">$1</span>');
                      })()
                    }}
                  />
                </div>
                {selectedOrder.admin_note && (
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Note de confirmation</p>
                    <p className="text-xs text-gray-600 italic">"{selectedOrder.admin_note}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// ==========================================
// SUPPLIER ADMIN — Reseller YTSeller (mapping, solde, commandes, logs)
// ==========================================
const SupplierAdmin = ({ products, fetchProducts }) => {
  const [settings, setSettings] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null); // mapping.id en cours d'édition
  const [editForm, setEditForm] = useState({ ytseller_product_id: '', margin_percent: 30, active: true });
  const [newMap, setNewMap] = useState({ product_id: '', ytseller_product_id: '', margin_percent: 30 });
  const [marginInput, setMarginInput] = useState('');

  const productName = (id) => products.find(p => p.id === id)?.name || `#${id}`;

  const fetchAll = async () => {
    if (!supabase) return;
    const [s, m, o, l] = await Promise.all([
      supabase.from('supplier_settings').select('*').eq('supplier', 'ytseller').maybeSingle(),
      supabase.from('product_supplier_mapping').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('id, product_name, quantity, total_price, supplier_order_id, supplier_status, supplier_last_checked_at, created_at')
        .eq('status', 'processing').eq('supplier', 'ytseller').order('created_at', { ascending: false }),
      supabase.from('supplier_logs').select('*').order('created_at', { ascending: false }).limit(25),
    ]);
    setSettings(s.data || null);
    setMarginInput(m.data?.[0]?.margin_percent ?? 50);
    setMappings(m.data || []);
    setPending(o.data || []);
    setLogs(l.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSync = async () => {
    setSyncing(true); setMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('ytseller-sync-catalog', { body: {} });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setMsg(`Sync OK — ${data.updated} produit(s), solde ${data.balance} ${data.currency}.`);
      await fetchAll();
      if (fetchProducts) await fetchProducts();
    } catch (e) {
      setMsg('Erreur sync : ' + e.message);
    }
    setSyncing(false);
  };

  const handleFullImport = async () => {
    if (!confirm('IMPORT COMPLET : cela va importer TOUT le catalogue YTSeller, supprimer tes produits à stock local et vider account_stock. Continuer ?')) return;
    setSyncing(true); setMsg('');
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
    setSyncing(false);
  };

  const handleSaveMargin = async () => {
    const v = Number(marginInput);
    if (isNaN(v) || v < 0) { setMsg('Marge invalide.'); return; }
    // Applique la marge à tous les produits mappés puis recalcule les prix.
    const { error } = await supabase.from('product_supplier_mapping').update({ margin_percent: v }).eq('supplier', 'ytseller');
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setMsg('Marge appliquée à tous les produits. Synchro en cours…');
    await handleSync();
  };

  const startEdit = (m) => {
    setEditing(m.id);
    setEditForm({ ytseller_product_id: m.ytseller_product_id, margin_percent: m.margin_percent, active: m.active });
  };

  const saveEdit = async (id) => {
    const { error } = await supabase.from('product_supplier_mapping').update({
      ytseller_product_id: String(editForm.ytseller_product_id).trim(),
      margin_percent: Number(editForm.margin_percent) || 0,
      active: !!editForm.active,
    }).eq('id', id);
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setEditing(null);
    await fetchAll();
  };

  const handleAdd = async () => {
    if (!newMap.product_id || !String(newMap.ytseller_product_id).trim()) {
      setMsg('Choisis un produit et renseigne l’ID YTSeller.'); return;
    }
    const { error } = await supabase.from('product_supplier_mapping').insert({
      product_id: Number(newMap.product_id),
      supplier: 'ytseller',
      ytseller_product_id: String(newMap.ytseller_product_id).trim(),
      margin_percent: Number(newMap.margin_percent) || 0,
      active: true,
    });
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setNewMap({ product_id: '', ytseller_product_id: '', margin_percent: 30 });
    await handleSync(); // renseigne rate/stock/prix immédiatement
  };

  const handleDelete = async (m) => {
    if (!confirm(`Retirer le mapping de "${productName(m.product_id)}" ? Le produit repassera en stock local.`)) return;
    await supabase.from('product_supplier_mapping').delete().eq('id', m.id);
    await supabase.from('products').update({ is_dropship: false, supplier_stock: 0 }).eq('id', m.product_id);
    await fetchAll();
    if (fetchProducts) await fetchProducts();
  };

  const sellPrice = (m) => Math.round((Number(m.ytseller_rate) || 0) * (1 + (Number(m.margin_percent) || 0) / 100) * 100) / 100;
  const unmappedProducts = products.filter(p => !mappings.some(m => m.product_id === p.id));

  return (
    <div className="space-y-8">
      {/* Solde + synchro */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">YTSeller Balance</div>
            <div className="text-4xl font-black font-mono text-gray-900">
              {settings ? `${Number(settings.balance).toFixed(2)} ${settings.currency}` : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {settings?.last_catalog_sync ? `Last sync: ${new Date(settings.last_catalog_sync).toLocaleString()}` : 'Never synced'}
            </div>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Global margin %</label>
              <div className="flex gap-2">
                <input type="number" value={marginInput} onChange={e => setMarginInput(e.target.value)} className="w-24 h-12 px-4 rounded-xl border border-gray-200 font-mono" />
                <button onClick={handleSaveMargin} className="h-12 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200"><Save size={16} /></button>
              </div>
            </div>
            <button onClick={handleSync} disabled={syncing}
              className="h-12 px-6 rounded-2xl bg-gray-900 text-white font-bold text-sm flex items-center gap-2 hover:bg-primary transition-all disabled:opacity-50">
              <RefreshCcw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Syncing…' : 'Sync'}
            </button>
            <button onClick={handleFullImport} disabled={syncing}
              className="h-12 px-6 rounded-2xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primaryDark transition-all disabled:opacity-50">
              <Download size={16} /> Full import (reset)
            </button>
          </div>
        </div>
        {msg && <div className="mt-6 text-sm font-bold text-gray-600 bg-gray-50 rounded-2xl px-5 py-3">{msg}</div>}
        {settings && Number(settings.balance) <= 0 && (
          <div className="mt-6 text-sm font-bold text-red-600 bg-red-50 rounded-2xl px-5 py-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Supplier balance is 0 — no dropship orders can be delivered. Top up your YTSeller account.
          </div>
        )}
      </div>

      {/* Mapping produits */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8">Product mapping</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">My product</th><th className="pb-4">YTSeller ID</th><th className="pb-4">Cost</th>
                <th className="pb-4">Margin %</th><th className="pb-4">Sell price</th><th className="pb-4">Avail</th>
                <th className="pb-4">Active</th><th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mappings.map(m => (
                <tr key={m.id} className="text-gray-700">
                  <td className="py-4 font-bold">{productName(m.product_id)}</td>
                  {editing === m.id ? (
                    <>
                      <td className="py-4"><input value={editForm.ytseller_product_id} onChange={e => setEditForm({ ...editForm, ytseller_product_id: e.target.value })} className="w-24 px-2 py-1 rounded-lg border border-gray-200 font-mono" /></td>
                      <td className="py-4 font-mono">${Number(m.ytseller_rate).toFixed(2)}</td>
                      <td className="py-4"><input type="number" value={editForm.margin_percent} onChange={e => setEditForm({ ...editForm, margin_percent: e.target.value })} className="w-20 px-2 py-1 rounded-lg border border-gray-200 font-mono" /></td>
                      <td className="py-4 font-mono text-gray-400">—</td>
                      <td className="py-4">{m.supplier_available}</td>
                      <td className="py-4"><input type="checkbox" checked={editForm.active} onChange={e => setEditForm({ ...editForm, active: e.target.checked })} /></td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => saveEdit(m.id)} className="p-2 rounded-lg bg-green-500 text-white"><Save size={14} /></button>
                        <button onClick={() => setEditing(null)} className="p-2 rounded-lg bg-gray-100 text-gray-500"><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 font-mono">{m.ytseller_product_id}</td>
                      <td className="py-4 font-mono">${Number(m.ytseller_rate).toFixed(2)}</td>
                      <td className="py-4 font-mono">{Number(m.margin_percent).toFixed(0)}%</td>
                      <td className="py-4 font-mono font-bold text-gray-900">${sellPrice(m).toFixed(2)}</td>
                      <td className="py-4">
                        <span className={m.supplier_available > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{m.supplier_available}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{m.supplier_status || ''}</span>
                      </td>
                      <td className="py-4">{m.active ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}</td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => startEdit(m)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(m)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash size={14} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {mappings.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">No mapped product.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Ajout mapping */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product</label>
            <select value={newMap.product_id} onChange={e => setNewMap({ ...newMap, product_id: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 font-bold min-w-[220px]">
              <option value="">— Choose —</option>
              {unmappedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">YTSeller ID</label>
            <input value={newMap.ytseller_product_id} onChange={e => setNewMap({ ...newMap, ytseller_product_id: e.target.value })} placeholder="ex: 11" className="px-4 py-3 rounded-xl border border-gray-200 font-mono w-28" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Margin %</label>
            <input type="number" value={newMap.margin_percent} onChange={e => setNewMap({ ...newMap, margin_percent: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 font-mono w-24" />
          </div>
          <button onClick={handleAdd} className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2"><Plus size={16} /> Map</button>
        </div>
      </div>

      {/* Commandes en attente fournisseur */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8">Pending supplier orders ({pending.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Order</th><th className="pb-4">Product</th><th className="pb-4">Qty</th>
                <th className="pb-4">YTSeller #</th><th className="pb-4">Status</th><th className="pb-4">Last check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pending.map(o => (
                <tr key={o.id} className="text-gray-700">
                  <td className="py-4 font-mono">#{o.id}</td>
                  <td className="py-4 font-bold">{o.product_name}</td>
                  <td className="py-4">{o.quantity}</td>
                  <td className="py-4 font-mono">{o.supplier_order_id || '—'}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 font-bold text-xs">{o.supplier_status || 'Pending'}</span></td>
                  <td className="py-4 text-xs text-gray-400">{o.supplier_last_checked_at ? new Date(o.supplier_last_checked_at).toLocaleString() : '—'}</td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">No pending order.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Supplier log</h2>
          <button onClick={fetchAll} className="text-sm font-bold text-primary hover:underline flex items-center gap-2"><RefreshCcw size={14} /> Refresh</button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map(l => (
            <div key={l.id} className={`text-xs rounded-xl px-4 py-3 flex items-start gap-3 ${l.level === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
              <span className="font-mono text-gray-400 shrink-0">{new Date(l.created_at).toLocaleTimeString()}</span>
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

// ==========================================
// ADMIN VIEW
// ==========================================

const AdminView = ({
  navigate, products, fetchProducts, allOrders, fetchAllOrders, allUsers, fetchUsers,
  actionStatus, setActionStatus, editingProduct, setEditingProduct, productForm,
  setProductForm, handleSaveProduct, handleDeleteProduct, handleDeleteAllProducts, handleResetSystem, handleExcelProductImport, handleExportExcel, adminSearch, setAdminSearch,
  adminPage, setAdminPage
}) => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('agedgmail_admin_tab') || "dashboard");
  const [managingStock, setManagingStock] = useState(null);

  useEffect(() => {
    localStorage.setItem('agedgmail_admin_tab', activeTab);
  }, [activeTab]);

  const itemsPerPage = 10;

  const handleUpdateBalanceManual = async (userId, email, amount) => {
    setActionStatus('loading');
    const { data: userData } = await supabase.from('profiles').select('balance').eq('id', userId).single();
    const { error } = await supabase.from('profiles').update({ balance: (userData?.balance || 0) + amount }).eq('id', userId);
    if (error) alert("Erreur : " + error.message);
    else fetchUsers();
    setActionStatus(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      {managingStock && <StockManager product={managingStock} fetchProducts={fetchProducts} onClose={() => { setManagingStock(null); fetchProducts(); }} />}
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-4"><Shield className="text-primary" /> Administration Console</h1>
          <p className="text-gray-400 text-sm mt-2">Dynamic management of catalog and clients.</p>
        </div>
        <button onClick={() => navigate('home')} className="text-sm font-bold text-primary hover:underline flex items-center gap-2"><ArrowLeft size={16} /> Back to site</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'stock', label: 'Product Catalog', icon: Package },
            { id: 'orders', label: 'Orders', icon: FileText },
            { id: 'users', label: 'Client Management', icon: Users },
            { id: 'supplier', label: 'Supplier', icon: Database },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-gray-900 text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Revenue</div><div className="text-3xl font-black text-gray-900">${allOrders.reduce((s, o) => s + (o.total_price || 0), 0).toFixed(2)}</div></div>
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Products Online</div><div className="text-3xl font-black text-gray-900">{products.length}</div></div>
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4"><AlertTriangle size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Stock</div><div className="text-3xl font-black text-gray-900">{products.reduce((s, p) => s + (p.stock || 0), 0)}</div></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
                <h3 className="text-lg font-bold mb-8">Sales Statistics</h3>
                <p className="text-gray-400 text-sm italic">Sales are managed manually. Once payment is received, deliver the client by email.</p>
              </div>

              <div className="bg-red-50/50 border border-red-100 rounded-[3rem] p-10">
                <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2"><Settings size={20} /> Maintenance Zone</h3>
                <p className="text-red-600 text-sm mb-8 font-medium">Clean test data before official launch. These actions are irreversible.</p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={handleResetSystem} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 flex items-center gap-2">
                    <Trash2 size={18} /> Reset Orders & Balances
                  </button>
                  <button onClick={handleDeleteAllProducts} className="bg-white text-red-600 border border-red-200 px-8 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center gap-2">
                    <PackageX size={18} /> Delete all Products
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-8">
              <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-bold">Product Catalog</h2>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => handleDeleteAllProducts()}
                      className="text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                      <Trash2 size={18} /> Delete all
                    </button>
                    <input type="file" id="excel-import" className="hidden" accept=".xlsx, .xls" onChange={handleExcelProductImport} />
                    <label htmlFor="excel-import" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer hover:bg-green-700 transition-all shadow-lg shadow-green-500/20">
                      <Upload size={18} /> Import Excel
                    </label>
                    <button onClick={handleExportExcel} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-gray-900/10">
                      <Download size={18} /> Export Excel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-12">
                  <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">{editingProduct ? 'Modify Product' : 'Add a new Product'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Title</label>
                          <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20" placeholder="ex: Gmail Aged 2018" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Category</label>
                          <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold">
                            {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>



                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Price ($)</label>
                            <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                          <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows="6" className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Product details..." />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product Image (URL)</label>
                          <input type="text" value={productForm.image_url || ''} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-mono" placeholder="https://…/image.png (leave empty = auto logo)" />
                          {productForm.image_url ? (
                            <div className="mt-3 w-24 h-24 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                              <img src={productForm.image_url} alt="preview" className="w-full h-full object-contain" />
                            </div>
                          ) : null}
                        </div>
                        <button onClick={handleSaveProduct} disabled={actionStatus === 'loading'} className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2">
                          {actionStatus === 'loading' ? <RefreshCcw className="animate-spin" /> : <Save size={18} />}
                          {editingProduct ? 'Update' : 'Validate Product'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <th className="pb-6">Product</th>
                        <th className="pb-6">Price</th>
                        <th className="pb-6">Stock</th>
                        <th className="pb-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {products.map(p => (
                        <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="py-5">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center p-2 border border-gray-100">
                                <ProductVisual product={p} iconSize={24} />
                              </div>
                              <div>
                                <div className="font-bold text-gray-900">{p.name}</div>
                                <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{p.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-5 font-mono font-black text-primary">${p.price?.toFixed(2)}</td>
                          <td className="py-5 font-mono font-bold text-gray-500">{p.stock}</td>
                          <td className="py-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setManagingStock(p)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Manage Stock"><Database size={16} /></button>
                              <button onClick={() => { setEditingProduct(p); setProductForm({ name: p.name, category: p.category, description: p.description, price: p.price, image_url: p.image_url || '' }); }} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"><Trash size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && <OrdersAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} fetchProducts={fetchProducts} />}

          {activeTab === 'users' && (
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-bold">Client Management</h2>
                <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">{allUsers.length} registered</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="pb-6">User</th>
                      <th className="pb-6">Balance</th>
                      <th className="pb-6">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {allUsers.map(user => (
                      <tr key={user.id}>
                        <td className="py-6">
                          <div className="font-bold text-gray-900">{user.email}</div>
                          <div className="text-xs text-gray-400">{user.display_name}</div>
                        </td>
                        <td className="py-6 font-mono font-black text-primary">${user.balance?.toFixed(2)}</td>
                        <td className="py-6">
                          <button onClick={() => {
                            const amount = prompt("Amount to add ($):", "10");
                            if (amount) handleUpdateBalanceManual(user.id, user.email, parseFloat(amount));
                          }} className="p-2 bg-primary/10 text-primary rounded-lg font-bold text-xs">Credit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'supplier' && <SupplierAdmin products={products} fetchProducts={fetchProducts} />}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// RECHARGE VIEW & BINANCE PAY
// ==========================================

const BinancePaySection = ({ cartTotal, session, navigate, cart, clearCart, fetchProducts, profile }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const noteValue = profile?.display_name?.toLowerCase() || session?.user?.email?.split('@')[0];

  const handleOrderSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      // 1. Create pending orders with the username as reference
      for (const item of cart) {
        const { error: orderErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          status: 'pending',
          binance_tx_id: `NOTE:${noteValue}`, // Use Note as reference
          created_at: new Date().toISOString()
        });
        if (orderErr) throw orderErr;
      }

      // 2. Alert Admin
      await fetch("https://formsubmit.co/ajax/rooseveltmkr@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: "💰 Nouveau Paiement Direct Binance Pay (AgedGmailYT)",
          username: noteValue,
          total: cartTotal + " USD",
          note_utilisee: noteValue,
          details: cart.map(i => `${i.name} (x${i.quantity})`).join(', ')
        })
      });

      setSuccess(true);
      setTimeout(() => {
        clearCart();
        navigate('dashboard');
      }, 3000);
    } catch (err) {
      setError("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // Simple feedback could be added here
  };

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm space-y-6">
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">Transfer Information</h4>

        <div className="space-y-4">
          <div className="flex justify-between items-center group">
            <span className="text-sm font-bold text-gray-500">Currency :</span>
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-gray-900">USDT (Binance Pay)</span>
              <button onClick={() => copyToClipboard('USDT')} className="text-gray-300 hover:text-primary transition-colors"><Copy size={16} /></button>
            </div>
          </div>

          <div className="flex justify-between items-center group">
            <span className="text-sm font-bold text-gray-500">Binance User ID :</span>
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-gray-900">160684871</span>
              <button onClick={() => copyToClipboard('160684871')} className="text-gray-300 hover:text-primary transition-colors"><Copy size={16} /></button>
            </div>
          </div>

          <div className="flex justify-between items-center group bg-primary/5 p-4 rounded-xl border border-primary/10">
            <span className="text-sm font-bold text-primary">Note (IMPORTANT) :</span>
            <div className="flex items-center gap-3">
              <span className="font-mono font-black text-primary uppercase">{noteValue}</span>
              <button onClick={() => copyToClipboard(noteValue)} className="text-primary/40 hover:text-primary transition-colors"><Copy size={16} /></button>
            </div>
          </div>
        </div>

        <button
          onClick={() => copyToClipboard(`ID: 160684871 | Note: ${noteValue}`)}
          className="w-full py-4 bg-gray-50 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all flex items-center justify-center gap-2"
        >
          <Copy size={14} /> Copy all info
        </button>

        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
          <p className="text-[10px] text-red-500 font-bold leading-relaxed italic">
            * IMPORTANT: Make sure to add the note above during transfer on Binance for automatic confirmation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 text-gray-900 font-bold mb-2">
            <Clock size={18} className="text-primary" /> Confirmation
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Transactions are generally confirmed in 5-15 minutes.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 text-gray-900 font-bold mb-2">
            <MessageSquare size={18} className="text-primary" /> Support
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Need help? Contact us on WhatsApp or Telegram.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100">{error}</div>}

      <button onClick={handleOrderSubmit} disabled={loading || success} className={`w-full py-6 rounded-[2rem] font-bold text-xl transition-all shadow-2xl flex items-center justify-center gap-3 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary shadow-black/10'}`}>
        {loading ? <RefreshCcw className="animate-spin" /> : success ? <CheckCircle /> : <ShieldCheck />}
        {loading ? "Verification..." : success ? "Order Sent!" : "I made the transfer"}
      </button>
    </div>
  );
};

const CRYPTO_CURRENCIES = [
  { id: 'btc', label: 'Bitcoin', ticker: 'BTC', symbol: '₿', color: 'bg-orange-100 text-orange-600' },
  { id: 'eth', label: 'Ethereum', ticker: 'ETH', symbol: 'Ξ', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'usdttrc20', label: 'USDT (TRC20)', ticker: 'USDT', symbol: '₮', color: 'bg-green-100 text-green-600' },
  { id: 'ltc', label: 'Litecoin', ticker: 'LTC', symbol: 'Ł', color: 'bg-slate-100 text-slate-600' },
];

// Passerelles de paiement. Seule NOWPayments est branchée aujourd'hui ;
// les autres apparaissent en aperçu ("Bientôt") tant qu'elles ne sont pas
// réellement intégrées, pour ne jamais laisser croire qu'un moyen de
// paiement fonctionne alors qu'il ne le fait pas.
const PAYMENT_GATEWAYS = [
  { id: 'nowpayments', name: 'NOWPayments', sub: 'BTC, ETH, USDT, LTC…', enabled: true, symbol: '⛓' },
  { id: 'cryptomus', name: 'Cryptomus', sub: 'Crypto', enabled: false, symbol: '◆' },
];

const BONUS_TIERS = [
  { amount: 100, pct: 1 },
  { amount: 500, pct: 2 },
  { amount: 1000, pct: 3 },
  { amount: 10000, pct: 4 },
];
const bonusPercentFor = (amountUsd) => [...BONUS_TIERS].reverse().find(t => amountUsd >= t.amount)?.pct || 0;

const RechargeView = ({ profile, session, navigate, suggestedAmount, setSuggestedAmount, fetchProfile }) => {
  const [amountUsd, setAmountUsd] = useState(suggestedAmount || 50);
  const [gateway, setGateway] = useState(null); // null tant que le client n'a pas choisi de passerelle
  const [payCurrency, setPayCurrency] = useState('usdttrc20');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'awaiting' | 'success'
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null); // { orderId, payAddress, payAmount, payCurrency, bonusPct, creditAmount }
  const [copied, setCopied] = useState(false);
  const [minAmounts, setMinAmounts] = useState({}); // { btc: 18.78, eth: 18.78, ... }

  useEffect(() => () => setSuggestedAmount(null), []);

  useEffect(() => {
    if (!supabase) return;
    supabase.functions.invoke('nowpayments-min-amounts').then(({ data }) => {
      if (data && !data.error) setMinAmounts(data);
    });
  }, []);

  if (!session) { navigate('auth'); return null; }

  const close = () => navigate('dashboard');
  const bonusPct = bonusPercentFor(amountUsd);
  const selectedMin = minAmounts[payCurrency];
  const belowMin = typeof selectedMin === 'number' && amountUsd < selectedMin;

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
    if (!gateway) { setError('Choisis une passerelle de paiement.'); return; }
    if (amountUsd <= 0) { setError('Montant invalide.'); return; }

    if (gateway === 'nowpayments') {
      if (belowMin) { setError(`Montant minimum pour ${payCurrency.toUpperCase()} : $${selectedMin.toFixed(2)}`); return; }

      setLoading(true);
      setError('');
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('nowpayments-create', {
          body: { userId: session.user.id, email: session.user.email, amountUsd, payCurrency },
        });

        if (fnError) {
          let realMessage = await extractFnErrorMessage(fnError);
          if (/less than minimal/i.test(realMessage)) {
            realMessage = `Ce montant est en dessous du minimum accepté pour ${payCurrency.toUpperCase()}. Essaie un montant plus élevé ou une autre cryptomonnaie.`;
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

    if (gateway === 'cryptomus') {
      setLoading(true);
      setError('');
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('cryptomus-create', {
          body: { userId: session.user.id, email: session.user.email, amountUsd },
        });

        if (fnError) throw new Error(await extractFnErrorMessage(fnError));
        if (fnData?.error) throw new Error(fnData.error);
        if (!fnData?.payUrl) throw new Error('Réponse Cryptomus invalide.');

        setPayment({ provider: 'cryptomus', ...fnData });
        setStep('awaiting');
        window.open(fnData.payUrl, '_blank', 'noopener,noreferrer');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
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
        setError('Le paiement a échoué ou a expiré. Réessaie avec un nouveau paiement.');
        setStep('form');
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [step, payment, session, fetchProfile]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="text-2xl font-black text-gray-900">Recharger</h2>
          <button onClick={close} className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"><X size={18} /></button>
        </div>

        {step === 'form' && (
          <div className="px-8 pb-8 pt-4 space-y-6">
            <p className="text-sm text-gray-500">Plus vous rechargez, plus le bonus est important — crédité instantanément.</p>

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
                  className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${amountUsd === t.amount ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'}`}
                >
                  <span>${t.amount >= 1000 ? `${t.amount / 1000}k` : t.amount}</span>
                  <span className="text-primary font-black">+{t.pct}%</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant ($)</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amountUsd}
                onChange={e => setAmountUsd(Number(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 outline-none font-black text-xl font-mono text-primary"
              />
              {bonusPct > 0 && (
                <p className="text-xs text-primary font-bold mt-2">Bonus +{bonusPct}% → tu recevras ${(amountUsd * (1 + bonusPct / 100)).toFixed(2)} sur ton solde.</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Passerelle</label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_GATEWAYS.map(g => (
                  <button
                    key={g.id}
                    onClick={() => g.enabled && setGateway(g.id)}
                    disabled={!g.enabled}
                    className={`relative text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${!g.enabled ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : gateway === g.id ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:border-primary/50'}`}
                  >
                    <span className="absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-primary bg-primary/10">
                      {g.enabled ? 'Auto' : 'Bientôt'}
                    </span>
                    <span className="w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shrink-0 bg-gray-100 text-gray-600">{g.symbol}</span>
                    <span>
                      <span className="block text-sm font-bold text-gray-900">{g.name}</span>
                      <span className="block text-[10px] text-gray-400 font-medium">{g.sub}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {gateway === 'nowpayments' && (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Cryptomonnaie</label>
                <div className="grid grid-cols-2 gap-3">
                  {CRYPTO_CURRENCIES.map(c => {
                    const min = minAmounts[c.id];
                    return (
                      <button
                        key={c.id}
                        onClick={() => setPayCurrency(c.id)}
                        className={`relative text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${payCurrency === c.id ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:border-primary/50'}`}
                      >
                        <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${c.color}`}>{c.symbol}</span>
                        <span>
                          <span className="block text-sm font-bold text-gray-900">{c.label}</span>
                          <span className="block text-[10px] text-gray-400 font-medium">{min ? `Min. $${min.toFixed(2)}` : '…'}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {gateway === 'nowpayments' && (
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 leading-relaxed">
                Dépôt en cryptomonnaie via NOWPayments.
                {typeof selectedMin === 'number' && (
                  <> <span className="font-bold text-gray-700">Montant minimum pour {payCurrency.toUpperCase()} : ${selectedMin.toFixed(2)}.</span></>
                )}
                {' '}D'éventuels frais de réseau sont à ta charge.
              </div>
            )}

            {gateway === 'cryptomus' && (
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 leading-relaxed">
                Dépôt via Cryptomus : une page de paiement sécurisée s'ouvre dans un nouvel onglet pour choisir ta crypto et finaliser le règlement.
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            {gateway && (
              <button
                onClick={handleSubmit}
                disabled={loading || (gateway === 'nowpayments' && belowMin)}
                className="w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 bg-primary text-white hover:bg-primaryDark shadow-primary/20 disabled:opacity-40"
              >
                {loading
                  ? <><RefreshCcw size={20} className="animate-spin" /> Préparation...</>
                  : <><Send size={20} /> Créer un dépôt</>}
              </button>
            )}
          </div>
        )}

        {step === 'awaiting' && payment && (
          <div className="px-8 pb-8 pt-2 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <RefreshCcw size={32} className="text-primary animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">En attente de paiement</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {payment.provider === 'cryptomus'
                ? "Finalise ton paiement dans l'onglet Cryptomus ouvert. Ton solde sera crédité automatiquement après confirmation."
                : "Envoie exactement le montant ci-dessous à l'adresse indiquée. Ton solde sera crédité automatiquement après confirmation."}
              {payment.bonusPct > 0 && <> Avec le bonus, tu recevras <span className="font-black text-primary">${Number(payment.creditAmount).toFixed(2)}</span>.</>}
            </p>

            {payment.provider === 'cryptomus' ? (
              <button
                onClick={() => window.open(payment.payUrl, '_blank', 'noopener,noreferrer')}
                className="w-full py-4 rounded-2xl font-bold bg-gray-900 text-white hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink size={18} /> Rouvrir la page de paiement
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
                    <button onClick={copyAddress} className="shrink-0 p-2 rounded-lg bg-gray-900 text-white hover:bg-primary transition-all"><Copy size={14} /></button>
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
            <h3 className="text-2xl font-black text-gray-900">Solde crédité !</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Ton paiement a été confirmé et ton solde a été mis à jour.
            </p>
            <button
              onClick={close}
              className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-primary transition-all"
            >
              Mon compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



// ==========================================
// PAYMENT VIEW
// ==========================================


const PaymentView = ({ cart, cartTotal, navigate, clearCart, profile, session, fetchProfile, fetchProducts, fetchAllOrders, setRechargeSuggestedAmount }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBalancePayment = async () => {
    if (!session || !profile) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      if (profile.balance < cartTotal) throw new Error("Insufficient balance.");

      // Process each item in cart
      for (const item of cart) {
        // --- Produit reseller (YTSeller) : livraison différée ---
        if (item.is_dropship) {
          // Commande créée en 'processing' (credentials remplis plus tard par
          // le job ytseller-poll-orders). L'UI "Mes commandes" affiche déjà
          // "En attente de livraison…" tant que credentials est vide.
          const { data: dsOrder, error: dsErr } = await supabase.from('orders').insert({
            user_id: session.user.id,
            buyer_email: session.user.email,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            status: 'processing',
            supplier: 'ytseller',
            created_at: new Date().toISOString()
          }).select('id').single();

          if (dsErr) throw dsErr;
          if (!dsOrder) throw new Error("The order could not be created.");

          // Déclenche la passation fournisseur en arrière-plan (ne bloque pas
          // l'UI). En cas d'échec, la fonction rembourse automatiquement.
          supabase.functions.invoke('ytseller-place-order', { body: { orderId: dsOrder.id } })
            .catch(e => console.error('ytseller-place-order invoke:', e));

          continue;
        }

        // --- Produit à stock local (comportement existant inchangé) ---
        // 1. Fetch available credentials from account_stock
        const { data: stockRows, error: stockErr } = await supabase
          .from('account_stock')
          .select('id, credentials')
          .eq('product_id', item.id)
          .eq('is_delivered', false)
          .limit(item.quantity);

        if (stockErr) throw new Error("Error retrieving stock.");
        if (!stockRows || stockRows.length < item.quantity) {
          throw new Error(`No more accounts available in stock for ${item.name}.`);
        }

        const deliveredCreds = stockRows.map(r => r.credentials).join('\n');
        const stockIds = stockRows.map(r => r.id);

        // 2. Create the CONFIRMED order
        // Note: Using .select() to get the ID for linking with account_stock
        const { data: orderData, error: orderInsertErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          status: 'confirmed',
          credentials: deliveredCreds,
          data: deliveredCreds,
          created_at: new Date().toISOString()
        }).select('id').single();

        if (orderInsertErr) throw orderInsertErr;
        if (!orderData) throw new Error("Order created but ID could not be retrieved.");

        // 3. Mark credentials as delivered and link to order
        const { error: stockUpdateErr } = await supabase.from('account_stock').update({
          is_delivered: true,
          order_id: String(orderData.id),
          delivered_to: session.user.id,
        }).in('id', stockIds);

        if (stockUpdateErr) console.error("Error updating stock_account:", stockUpdateErr);
      }

      // 4. Deduct balance from profile
      const { error: balanceErr } = await supabase
        .from('profiles')
        .update({ balance: profile.balance - cartTotal })
        .eq('id', session.user.id);

      if (balanceErr) throw balanceErr;

      // 5. Finalize UI state
      setPurchaseSuccess(true);

      // Refresh all relevant data
      await fetchProfile(session.user.id);
      await fetchProducts();
      await fetchAllOrders(); // Update admin view if necessary

      setTimeout(() => {
        clearCart();
        navigate('dashboard');
      }, 2000);

    } catch (err) {
      console.error("Payment Error:", err);
      setErrorMessage(err.message);
      setIsProcessing(false);
    }
  };

  const hasEnoughBalance = (profile?.balance || 0) >= cartTotal;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Finalize Order</h2>

          <div className="space-y-8">
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Payment by Balance</h3>
                    <p className="text-sm text-gray-400">Use the available credits on your account.</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Current Balance</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${hasEnoughBalance ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {hasEnoughBalance ? 'Sufficient Balance' : 'Insufficient Balance'}
                    </span>
                  </div>
                  <div className="text-4xl font-black text-gray-900 font-mono">${(profile?.balance || 0).toFixed(2)}</div>
                </div>

                {(!hasEnoughBalance && !purchaseSuccess) ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                      <div className="mt-1 text-red-500"><AlertTriangle size={20} /></div>
                      <p className="text-sm text-red-600 leading-relaxed font-medium">
                        Sorry, your balance is <span className="font-bold">${(profile?.balance || 0).toFixed(2)}</span>.
                        You need <span className="font-bold">${cartTotal.toFixed(2)}</span> for this order.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const missing = Math.round((cartTotal - (profile?.balance || 0)) * 100) / 100;
                        setRechargeSuggestedAmount(missing > 0 ? missing : null);
                        navigate('recharge');
                      }}
                      className="w-full py-5 rounded-[2rem] bg-gray-900 text-white font-bold hover:bg-primary transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3"
                    >
                      <Plus size={20} /> Recharge ${Math.max(0, Math.round((cartTotal - (profile?.balance || 0)) * 100) / 100).toFixed(2)}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBalancePayment}
                    disabled={isProcessing || purchaseSuccess}
                    className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-3 ${purchaseSuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'}`}
                  >
                    {isProcessing ? <RefreshCcw size={24} className="animate-spin" /> : purchaseSuccess ? <CheckCircle size={24} /> : <Zap size={24} />}
                    {isProcessing ? "Processing..." : purchaseSuccess ? "Payment Successful!" : `Confirm Payment ($${cartTotal.toFixed(2)})`}
                  </button>
                )}

                {errorMessage && (
                  <div className="mt-6 p-4 bg-red-50 text-red-500 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                    <AlertTriangle size={14} /> {errorMessage}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-dashed border-gray-200">
              <p className="text-center text-xs text-gray-400 font-medium">
                By validating this order, you accept our <button onClick={() => navigate('policies')} className="text-primary hover:underline">terms of service</button> and the instant delivery policy.
              </p>
            </div>
          </div>
        </div>

        <div className="h-fit sticky top-32">
          <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xl font-bold mb-10 border-b border-white/10 pb-6">Summary</h3>
            <div className="space-y-6 mb-10 text-sm font-medium text-gray-400">
              <div className="flex justify-between"><span>Items ({cart.length})</span><span className="text-white">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Service fee</span><span className="text-green-400">Free</span></div>
            </div>
            <div className="flex justify-between text-3xl font-bold mb-4"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Secured by SSL Encryption</div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// PRODUCT VIEW
// ==========================================
const ProductView = ({ product, addToCart, navigate, onCartClick }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">


        <div className="bg-gray-50/50 rounded-[3rem] aspect-square flex items-center justify-center border border-gray-100 overflow-hidden relative group">
          <div className="absolute top-6 left-6 z-10 bg-red-500 text-white font-black px-4 py-2 rounded-xl shadow-xl rotate-[-10deg] animate-pulse">20% OFF</div>
          <div className="w-full h-full flex items-center justify-center scale-150 overflow-hidden group-hover:scale-[1.6] transition-transform duration-700">
            <ProductVisual product={product} iconSize={80} />
          </div>
          {product.name.includes('US') && product.category === 'email' && <div className="absolute bottom-10 right-10 bg-primary text-white text-xs font-black px-4 py-2 rounded-xl shadow-2xl tracking-tighter">US ACCOUNT</div>}
        </div>

        <div className="flex flex-col justify-center">
          <nav className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
            <button onClick={() => navigate('home')} className="hover:text-primary">HOME</button>
            <span>/</span>
            <span className="text-primary">{categoryName(product.category)}</span>
          </nav>

          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tighter leading-tight">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
              <Package size={14} /> In stock ({product.stock})
            </div>
            <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
              {categoryName(product.category)}
            </div>
          </div>

          <div className="text-5xl font-black text-gray-900 mb-10 tracking-tight flex items-baseline gap-2">
            <span className="text-2xl text-gray-400 font-bold">$</span>{product.price.toFixed(1)}
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

            <button
              onClick={() => {
                addToCart(product, quantity);
                onCartClick();
              }}
              disabled={product.stock <= 0}
              className={`w-full max-w-md h-20 rounded-[2rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-widest flex items-center justify-center gap-4 ${product.stock > 0 ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30 hover:scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {product.stock > 0 ? 'Buy now' : 'Out of stock'}
            </button>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-[0.3em] mb-6 underline">INFORMATION</h3>
              <div className="space-y-4">
                {product.details?.info?.split(' | ').map((line, i) => (
                  <div key={i} className="flex items-center gap-4 text-gray-700 font-bold">
                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                    <span className="text-gray-400 font-medium min-w-[120px]">{line.split(' : ')[0]} :</span>
                    <span className="text-gray-900">{line.split(' : ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/10 p-8 rounded-[2.5rem]">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-4"><Info size={14} /> Additional Description</h4>
              <p className="text-gray-600 font-medium leading-relaxed italic">{product.description || product.details?.note}</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6"><ShieldAlert size={14} className="text-primary" /> Terms of Service</h4>
              <div className="text-xs text-gray-500 leading-relaxed space-y-4">
                {product.details?.terms?.split('. ').map((t, i) => <p key={i}>• {t}.</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CART VIEW
// ==========================================

// Panier en panneau coulissant (drawer), ouvert depuis n'importe quelle page
// via l'icône panier de la navbar — remplace l'ancienne page dédiée.
const CartDrawer = ({ open, onClose, cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, navigate, session }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] font-sans" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Cart</h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:text-white transition-all"><X size={18} /></button>
        </div>

        <div className="flex-grow overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center py-20">
              <p className="text-gray-400 font-medium">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2 mb-2">
                  <Trash2 size={12} /> Clear cart
                </button>
              )}
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl">
                  <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shrink-0 relative">
                    <ProductVisual product={item} iconSize={22} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{item.name}</h4>
                    <p className="text-primary font-bold text-sm">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Minus size={11} /></button>
                        <div className="w-7 text-center font-bold text-xs">{item.quantity}</div>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Plus size={11} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => { onClose(); navigate('home'); }} className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Continue shopping</button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-bold text-gray-700 dark:text-gray-200">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-black text-gray-900 dark:text-white">Total</span>
            <span className="font-black text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => { onClose(); session ? navigate('payment') : navigate('auth'); }}
            disabled={cart.length === 0}
            className="w-full bg-primary text-white py-4 rounded-2xl font-bold text-base hover:bg-primaryDark transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {session ? 'Checkout' : 'Log in to pay'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// AUTH VIEW
// ==========================================

const AuthView = ({ navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              display_name: username
            }
          }
        });
        if (error) throw error;
        alert("Check your emails to confirm your registration!");
      }
      navigate('home');
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address to reset your password.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      alert("A reset email has been sent!");
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    });
    if (error) console.error(error);
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-20 px-6 font-sans bg-[#F9FAFB]">
      <div className="w-full max-w-[550px] bg-white p-12 md:p-20 rounded-[4rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.06)] border border-gray-50 flex flex-col items-center">

        {/* Logo */}
        <div className="w-16 h-16 mb-12 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>

        {/* Welcome Text */}
        <div className="text-center mb-16">
          <h2 className="text-[40px] font-bold text-gray-900 mb-4 tracking-tight leading-none">Welcome</h2>
          <p className="text-gray-400 font-medium text-lg">#1 Marketplace for certified accounts.</p>
        </div>

        {!showForm ? (
          <div className="w-full space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full h-20 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center gap-4 hover:bg-gray-50 transition-all group shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
              <span className="text-gray-700 font-bold text-lg">Continue with Google</span>
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="w-full h-20 bg-[#10B981] text-white rounded-[2rem] flex items-center justify-center gap-4 hover:bg-[#059669] transition-all shadow-xl shadow-green-500/10"
            >
              <Mail size={24} />
              <span className="font-bold text-lg">Continue with Email</span>
            </button>
          </div>
        ) : (
          <form className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={handleAuth}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Last Name" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="First Name" />
                </div>
              </div>
            )}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Username" />
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="••••••••" />
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className="flex-grow h-16 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2">
                {loading && <RefreshCcw size={16} className="animate-spin" />}
                {isLogin ? 'Log In' : "Sign Up"}
              </button>
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="flex-grow h-16 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">
                {isLogin ? "Sign Up" : "Log In"}
              </button>
            </div>

            <button type="button" onClick={() => setShowForm(false)} className="w-full text-center text-xs text-gray-400 font-bold hover:text-primary transition-colors mt-4">
              ← Back to options
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <button onClick={handleResetPassword} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// FOOTER
// ==========================================

const Footer = ({ navigate }) => (
  <footer className="bg-white border-t border-gray-100 pt-32 pb-16 px-6 font-sans mt-auto">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">
        {/* Brand Section */}
        <div className="md:col-span-2">
          <div className="h-24 mb-8">
            <img src="/logo.png" alt="AgedGmailYT" className="h-full object-contain cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('home')} />
          </div>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-10 font-medium">
            The #1 marketplace for acquiring certified accounts and premium digital services. Security, speed, and reliability guaranteed.
          </p>
          <div className="flex gap-4">
            <div className="flex flex-wrap gap-3">
              {['BTC', 'ETH', 'USDT', 'LTC'].map(coin => (
                <span key={coin} className="px-4 py-2 bg-gray-50 rounded-xl text-[10px] font-black text-gray-400 border border-gray-100 uppercase tracking-widest">{coin}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Links Sections */}
        <div>
          <h4 className="font-black text-gray-900 mb-8 uppercase tracking-[0.2em] text-[11px]">Platform</h4>
          <ul className="space-y-4">
            <li><button onClick={() => navigate('dashboard')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Account</button></li>
            <li><button onClick={() => navigate('home')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Service</button></li>
            <li><button onClick={() => navigate('home')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Resources</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-gray-900 mb-8 uppercase tracking-[0.2em] text-[11px]">Support</h4>
          <ul className="space-y-4">
            <li><button onClick={() => navigate('policies')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Policies</button></li>
            <li><button onClick={() => navigate('api')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">API</button></li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Copyright 2026 © AgedGmailYT</span>
          <span className="text-gray-200 hidden md:block">•</span>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">All rights reserved</span>
        </div>

        <div className="flex gap-8 items-center">
          <div className="flex gap-4 items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">System Operational</span>
          </div>
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all border border-gray-100">
            <ChevronUp size={18} />
          </button>
        </div>
      </div>
    </div>
  </footer>
);

// ==========================================
// APP COMPONENT
// ==========================================

function App() {
  const [products, setProducts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: () => { }, type: "danger" });

  const [currentView, setCurrentView] = useState(() => localStorage.getItem('agedgmail_view') || 'home');
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const saved = localStorage.getItem('agedgmail_product');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [activeCategory, setActiveCategory] = useState(() => localStorage.getItem('agedgmail_category') || 'all');
  const [activeGroup, setActiveGroup] = useState(() => localStorage.getItem('agedgmail_group') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('agedgmail_cart');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [rechargeSuggestedAmount, setRechargeSuggestedAmount] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [actionStatus, setActionStatus] = useState(null);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminPage, setAdminPage] = useState(1);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ name: '', category: 'email', description: '', price: 0, stock: 0 });

  const handleDeleteProduct = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete this product?",
      message: "This action is irreversible. The product will be permanently removed from the catalog.",
      type: "danger",
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (error) throw error;
          fetchProducts();
        } catch (err) {
          alert("Error: " + err.message);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleDeleteAllProducts = () => {
    setConfirmModal({
      isOpen: true,
      title: "Delete all?",
      message: "WARNING: You are about to delete ALL products from the catalog. This action cannot be undone.",
      type: "danger",
      onConfirm: async () => {
        try {
          const { error } = await supabase.from("products").delete().neq("id", 0);

          if (error) throw error;
          fetchProducts();
        } catch (err) {
          alert("Erreur : " + err.message);
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleResetSystem = () => {
    setConfirmModal({
      isOpen: true,
      title: "Réinitialisation Totale ?",
      message: "Cette action va supprimer TOUTES les commandes, TOUT le stock d'emails et REMETTRE À ZÉRO tous les soldes clients. Les produits seront conservés. Voulez-vous continuer ?",
      type: "danger",
      onConfirm: async () => {
        try {
          setActionStatus('loading');
          // 1. Delete all stock first (resolves foreign key constraints if any)
          const { error: err2 } = await supabase.from('account_stock').delete().not('id', 'is', null);
          // 2. Delete all orders
          const { error: err1 } = await supabase.from('orders').delete().not('id', 'is', null);
          // 3. Reset all balances to 0
          const { error: err3 } = await supabase.from('profiles').update({ balance: 0 }).not('id', 'is', null);

          if (err1 || err2 || err3) {
            console.error({ err1, err2, err3 });
            throw new Error(`DB Error: ${err1?.message || err2?.message || err3?.message}`);
          }

          await fetchProducts();
          await fetchAllOrders();
          await fetchUsers();
          alert("Base de données réinitialisée (Commandes + Stock + Soldes clients).");
        } catch (err) {
          alert("Erreur : " + err.message);
        } finally {
          setActionStatus(null);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  useEffect(() => {
    if (!supabase) {
      fetchProducts(); // Will use local fallback
      return;
    }

    fetchProducts();
    fetchAllOrders();
    fetchUsers();

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) fetchProfile(initialSession.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id);
        // Only redirect to home if we are currently on the auth view and just signed in
        if (event === 'SIGNED_IN' && window.location.hash === '#auth') {
          navigate('home');
        }
      } else {
        setProfile(null);
        setOrders([]);
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Real-time Profile Updates (Balance, etc.)
  useEffect(() => {
    if (!session || !supabase) return;

    const profileChannel = supabase
      .channel(`profile-updates-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [session]);

  // Real-time Orders — Admin sees all new orders instantly
  useEffect(() => {
    if (!supabase) return;

    const ordersChannel = supabase
      .channel('all-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchAllOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  // Real-time Orders — Client sees their own orders update instantly (e.g. recharge confirmed)
  useEffect(() => {
    if (!session || !supabase) return;

    const myOrdersChannel = supabase
      .channel(`my-orders-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${session.user.id}`,
        },
        async () => {
          // Refresh personal orders
          const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          if (orderData) setOrders(orderData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(myOrdersChannel);
    };
  }, [session]);

  useEffect(() => {
    localStorage.setItem('agedgmail_view', currentView);
  }, [currentView]);

  useEffect(() => {
    if (selectedProduct) localStorage.setItem('agedgmail_product', JSON.stringify(selectedProduct));
    else localStorage.removeItem('agedgmail_product');
  }, [selectedProduct]);

  useEffect(() => {
    localStorage.setItem('agedgmail_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('agedgmail_category', activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    localStorage.setItem('agedgmail_group', activeGroup);
  }, [activeGroup]);

  const fetchProducts = async () => {
    if (!supabase) {
      // Fallback local pour la consultation sans .env
      setProducts(PRODUCTS_RAW.map(p => ({ ...p, stock: 10, details: getProductDetails(p) })));
      return;
    }
    // 1. Fetch products
    const { data: productsData, error: pErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });

    if (!pErr && productsData) {
      // Fetch counts for each product individually to bypass 1000-row limits
      const updatedProducts = await Promise.all(productsData.map(async (p) => {
        let stock;
        if (p.is_dropship) {
          // Produit reseller : la dispo vient du fournisseur (synchro périodique)
          stock = p.supplier_stock || 0;
        } else {
          // Produit à stock local : comptage account_stock (comportement existant)
          const { count } = await supabase
            .from('account_stock')
            .select('*', { count: 'exact', head: true })
            .eq('product_id', p.id)
            .eq('is_delivered', false);
          stock = count || 0;
        }

        return {
          ...p,
          stock,
          details: getProductDetails(p)
        };
      }));

      setProducts(updatedProducts);
    }
  };

  const fetchAllOrders = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setAllOrders(data);
  };

  const fetchUsers = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllUsers(data);
  };

  const handleSaveProduct = async () => {
    setActionStatus('loading');
    const { stock, details, ...payload } = productForm; // Exclude computed fields from DB save
    const { error } = editingProduct
      ? await supabase.from('products').update(payload).eq('id', editingProduct.id)
      : await supabase.from('products').insert([payload]);

    if (error) alert("Erreur : " + error.message);
    else {
      setEditingProduct(null);
      setProductForm({ name: '', category: 'email', description: '', price: 0 });
      fetchProducts();
    }
    setActionStatus(null);
  };


  const handleExcelProductImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setActionStatus('loading');
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        const itemsToInsert = data.map(row => {
          const rawCategory = row['Catégorie'] || row.Catégorie || row.category || row.Category || "";
          const categoryId = CATEGORIES.find(c => c.name.toLowerCase().trim() === rawCategory.toString().toLowerCase().trim())?.id || "email";

          return {
            name: (row['Titre du Produit'] || row.name || row.Name || row.Titre || "Produit Importé").toString().trim(),
            category: categoryId,
            price: parseFloat(row['Prix ($)'] || row.price || row.Price || row.Prix || 0),
            description: row.Description || row.description || ""
          };
        }).filter(item => item.name && item.name !== "Produit Importé");

        if (itemsToInsert.length === 0) throw new Error("Aucune donnée valide trouvée.");

        const { data: existingProducts } = await supabase.from('products').select('id, name');
        const existingNamesMap = new Map(existingProducts?.map(p => [p.name.toLowerCase().trim(), p.id]) || []);

        const duplicateItems = itemsToInsert.filter(item => existingNamesMap.has(item.name.toLowerCase().trim()));

        if (duplicateItems.length > 0) {
          if (confirm(`${duplicateItems.length} produits existent déjà (nom identique ou similaire). Voulez-vous les REMPLACER ?\n(Annuler créera des doublons)`)) {
            const idsToDelete = duplicateItems.map(item => existingNamesMap.get(item.name.toLowerCase().trim()));
            const { error: delError } = await supabase.from('products').delete().in('id', idsToDelete);
            if (delError) throw delError;
          }
        }

        const { error } = await supabase.from('products').insert(itemsToInsert);
        if (error) throw error;

        fetchProducts();
        setActionStatus('success');
        setTimeout(() => setActionStatus(null), 3000);
      } catch (err) {
        alert("Erreur Import Excel : " + err.message);
        setActionStatus('error');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleExportExcel = () => {
    const dataToExport = products.map(p => ({
      'Titre du Produit': p.name,
      'Catégorie': CATEGORIES.find(c => c.id === p.category)?.name || p.category,
      'Prix ($)': p.price,
      'Quantité en Stock': p.stock,
      'Description': p.description
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Produits");
    XLSX.writeFile(wb, `AgedGmail_Produits_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const fetchProfile = async (userId) => {
    if (!supabase) return;
    const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    const { data: { session } } = await supabase.auth.getSession();
    const metadata = session?.user?.user_metadata;

    if (profileData) {
      setProfile(profileData);
      const { data: orderData } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);
    } else if (session) {
      // Create new profile with Google metadata if it's the first login
      const newProfile = {
        id: userId,
        email: session.user.email,
        display_name: metadata?.display_name || metadata?.full_name?.split(' ')[0]?.toLowerCase() || session.user.email?.split('@')[0],
        first_name: metadata?.first_name || metadata?.given_name || metadata?.full_name?.split(' ')[0] || "",
        last_name: metadata?.last_name || metadata?.family_name || metadata?.full_name?.split(' ').slice(1).join(' ') || "",
        avatar_url: metadata?.avatar_url || "",
        balance: 0.00,
        two_factor_enabled: false,
        is_suspended: false,
        created_at: new Date().toISOString()
      };

      // Persistence in DB
      const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
      if (!insertError) {
        setProfile(newProfile);
        setOrders([]);
      } else {
        // Fallback if insert fails (RLS or other)
        setProfile(newProfile);
      }
    }
  };

  // Groupes de premier niveau (barre du haut), dérivés des produits réellement
  // en catalogue (miroir YTSeller), dans l'ordre GROUP_ORDER, comptés puis filtrés à ceux non-vides.
  const productGroups = (() => {
    const counts = new Map();
    products.forEach(p => { const g = categoryVisual(p.category); counts.set(g, (counts.get(g) || 0) + 1); });
    return GROUP_ORDER.filter(id => counts.get(id) > 0).map(id => ({ id, name: GROUP_LABELS[id], count: counts.get(id) }));
  })();

  // Sous-catégories (barre du bas) : catégories réelles du groupe actif.
  const productSubCategories = (() => {
    if (activeGroup === 'all') return [];
    const counts = new Map();
    products.forEach(p => {
      if (categoryVisual(p.category) !== activeGroup) return;
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => ({ id, name: categoryName(id) }));
  })();

  const filteredProducts = products
    .filter(p => activeGroup === 'all' || categoryVisual(p.category) === activeGroup)
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => !searchTerm.trim() || p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return a.price - b.price;
    });

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const idx = prevCart.findIndex(item => item.id === product.id);
      if (idx >= 0) { const nc = [...prevCart]; nc[idx].quantity += quantity; return nc; }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (id, q) => { if (q < 1) return; setCart(pc => pc.map(i => i.id === id ? { ...i, quantity: q } : i)); };
  const removeFromCart = (id) => setCart(pc => pc.filter(i => i.id !== id));
  const clearCart = () => setCart([]);
  const navigate = (v) => {
    window.location.hash = v;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentView(hash);
      } else {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    // Moneroo strips the URL fragment from return_url and only appends
    // ?paymentId=...&paymentStatus=..., so a payment redirect always lands
    // with an empty hash. Detect that explicitly and send the user to the
    // dashboard instead of falling back to the last saved view.
    const params = new URLSearchParams(window.location.search);
    if (params.get('paymentStatus')) {
      setCurrentView('dashboard');
      window.history.replaceState(null, '', `${window.location.pathname}#dashboard`);
    } else if (window.location.hash) {
      handleHashChange();
    } else {
      window.location.hash = currentView;
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans flex flex-col">
      <Navbar cartTotal={cartTotal} cartCount={cart.length} navigate={navigate} session={session} profile={profile} currentView={currentView} setActiveCategory={setActiveCategory} setActiveGroup={setActiveGroup} onCartClick={() => setCartOpen(true)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} cartTotal={cartTotal} navigate={navigate} session={session} />
      <div className="flex-grow">
        {currentView === 'home' && <HomeView activeGroup={activeGroup} setActiveGroup={setActiveGroup} activeCategory={activeCategory} setActiveCategory={setActiveCategory} sortBy={sortBy} setSortBy={setSortBy} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} groups={productGroups} subCategories={productSubCategories} />}
        {currentView === 'product' && selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} onCartClick={() => setCartOpen(true)} />}
        {currentView === 'api' && <ApiView navigate={navigate} session={session} />}
        {currentView === 'policies' && <PoliciesView navigate={navigate} />}
        {currentView === 'auth' && <AuthView navigate={navigate} />}
        {currentView === 'dashboard' && session && <MyOrdersView profile={profile} navigate={navigate} orders={orders} />}
        {currentView === 'settings' && session && <SettingsView profile={profile} navigate={navigate} fetchProfile={fetchProfile} session={session} />}
        {currentView === 'payment' && <PaymentView cart={cart} cartTotal={cartTotal} navigate={navigate} clearCart={clearCart} profile={profile} session={session} fetchProfile={fetchProfile} fetchProducts={fetchProducts} fetchAllOrders={fetchAllOrders} setRechargeSuggestedAmount={setRechargeSuggestedAmount} />}
        {currentView === 'recharge' && session && <RechargeView profile={profile} session={session} navigate={navigate} suggestedAmount={rechargeSuggestedAmount} setSuggestedAmount={setRechargeSuggestedAmount} fetchProfile={fetchProfile} />}
        {currentView === 'admin' && session && session.user.email === ADMIN_EMAIL && (
          <AdminView
            navigate={navigate}
            products={products}
            fetchProducts={fetchProducts}
            allOrders={allOrders}
            fetchAllOrders={fetchAllOrders}
            allUsers={allUsers}
            fetchUsers={fetchUsers}
            actionStatus={actionStatus}
            setActionStatus={setActionStatus}
            editingProduct={editingProduct}
            setEditingProduct={setEditingProduct}
            productForm={productForm}
            setProductForm={setProductForm}
            handleSaveProduct={handleSaveProduct}
            handleDeleteProduct={handleDeleteProduct}
            handleDeleteAllProducts={handleDeleteAllProducts}
            handleResetSystem={handleResetSystem}
            handleExcelProductImport={handleExcelProductImport}
            handleExportExcel={handleExportExcel}
            adminSearch={adminSearch}
            setAdminSearch={setAdminSearch}
            adminPage={adminPage}
            setAdminPage={setAdminPage}
          />
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />

      <Footer navigate={navigate} />
    </div>
  );
}

export default App;