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
          <button onClick={onCancel} className="flex-1 h-14 rounded-2xl font-bold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all border border-gray-100">Annuler</button>
          <button onClick={onConfirm} className={`flex-1 h-14 rounded-2xl font-bold text-white transition-all shadow-xl ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' : 'bg-gray-900 hover:bg-primary shadow-gray-900/20'}`}>
            Confirmer
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
  { id: 'all', name: 'Tous les produits' },
  { id: 'email', name: 'Email (Gmail)' },
  { id: 'youtube_aged', name: 'Chaînes Youtube Anciennes' },
  { id: 'youtube_monetized', name: 'Chaînes Monétisées' },
  { id: 'youtube_not_monetized', name: 'Chaînes Non-Monétisées' },
  { id: 'youtube_cpa', name: 'Chaînes Spéciales' },
  { id: 'facebook', name: 'Page Facebook' },
];

// Nom affichable d'une catégorie : libellé connu, sinon la catégorie brute
// (les catégories importées de YTSeller sont utilisées telles quelles).
const categoryName = (cat) => CATEGORIES.find(c => c.id === cat)?.name || cat || 'Autres';

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
  telegram: 'Telegram', sms: 'SMS', other: 'Autres',
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
  const commonTerms = "Veuillez lire les spécifications avant d'acheter. Vous êtes responsable de toutes les actions sur le compte. Utilisez des IP résidentielles fraîches. Changez les accès après 48h seulement.";
  return {
    info: product.category === 'email'
      ? `Âge : ${product.name.match(/\d{4}/)?.[0] || 'Ancien'} | Pays : ${product.name.includes('US') ? 'US' : 'Aléatoire'} | Format : Gmail/Pass/Récup/2FA`
      : product.category === 'facebook'
        ? "Âge : Ancien (2012-2020) | Amis : 50+ | Statut : Vérifié | Qualité : Verte"
        : product.category === 'youtube_not_monetized'
          ? `Abonnés : ${product.name.split(' – ')[1] || '1k+'} | Éligibilité : Immédiate | Contenu : Aucun`
          : `Année : ${product.name.match(/\d{4}/)?.[0] || 'Ancien'} | Statut : ${product.category === 'youtube_monetized' ? 'Monétisée' : 'Non-Monétisée'} | Contenu : Propre`,
    note: product.category === 'facebook'
      ? "Idéal pour le Meta Ads. Compte stable avec historique."
      : product.category.includes('youtube')
        ? "Parfait pour le business YT automation."
        : "Gmail de haute qualité. Format : Email | Pass | Récup | 2FA.",
    terms: commonTerms,
    refund: "Garantie de 3 jours jusqu'à la connexion."
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
              Rupture
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
          {product.stock <= 0 ? 'Épuisé' : added ? <><CheckCircle size={14} /> Ajouté !</> : <><ShoppingCart size={14} /> Ajouter</>}
        </button>
      </div>
    </div>
  );
};

// ==========================================
// NAVBAR
// ==========================================

const Navbar = ({ cartTotal, cartCount, navigate, session, profile, currentView, setActiveCategory, setActiveGroup }) => {
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
        <button onClick={() => go('home', 'all', 'all')} className="h-12 flex items-center group transition-all">
          <img src="/logo.png" alt="AgedGmailYT" className="h-full object-contain group-hover:scale-105 transition-transform duration-300" />
        </button>
      </div>

      {/* Menu central */}
      <nav className="hidden lg:flex items-center gap-8">
        <button onClick={() => go('home', 'all', 'all')} className={linkCls(currentView === 'home')}>Produits</button>
        <button onClick={() => go('home', 'all', 'sms')} className={linkCls(false)}>SMS</button>
        <button onClick={() => session ? navigate('dashboard') : navigate('auth')} className={linkCls(currentView === 'dashboard')}>Mes commandes</button>
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
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mon Solde</span>
              <span className="text-sm font-bold text-primary font-mono">${profile?.balance?.toFixed(2) || "0.00"}</span>
            </div>
            <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100 dark:border-gray-700">
              <User size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('auth')} className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <User size={18} /> LOGIN/SIGNUP
          </button>
        )}
        <button onClick={() => navigate('cart')} className="bg-gray-900 dark:bg-primary text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 hover:bg-black dark:hover:bg-primaryDark transition-all shadow-lg shadow-black/10 relative">
          <ShoppingCart size={18} />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />}
          <span className="border-l border-white/20 pl-3">PANIER / ${cartTotal.toFixed(2)}</span>
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
  const activeGroupLabel = activeGroup === 'all' ? 'Tous les produits' : (GROUP_LABELS[activeGroup] || 'Autres');

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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
const API_BASE_URL = 'https://ncjpbkfwhmsispiczzgl.functions.supabase.co/api-v2';

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
    ['balance', 'key, action', '{ "balance": 42.5, "currency": "USD" }', 'Consulter votre solde revendeur.'],
    ['products', 'key, action', '[ { "product": 12, "name": "…", "rate": 6.60, "available": 120, "status": "In stock" } ]', 'Lister le catalogue, vos prix et le stock en temps réel.'],
    ['add_order', 'key, action, product, quantity', '{ "order": 10231 }', 'Passer une commande. Débite votre solde, livraison automatique.'],
    ['order_status', 'key, action, order', '{ "status": "Completed", "charge": "6.60", "currency": "USD" }', 'Statuts : Pending, Processing, Completed, Canceled.'],
    ['result', 'key, action, order', '{ "result": ["mail:pass:recovery", "…"] }', 'Récupérer les comptes livrés (une ligne par compte).'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans">
      {/* En-tête */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primaryDark px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={14} /> API Revendeur
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
          Revendez notre catalogue <span className="text-primary">via notre API</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          Intégrez notre catalogue dans votre propre boutique. Achetez par programme,
          passez vos commandes et livrez vos clients automatiquement, 24h/24. Réponses JSON,
          authentification par clé.
        </p>
      </div>

      {/* Clé API */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-primary" /> Votre clé API</h2>
        {!session ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-gray-500 text-sm flex-grow">Connectez-vous pour générer votre clé API et commencer.</p>
            <button onClick={() => navigate('auth')} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primaryDark transition-all">Se connecter</button>
          </div>
        ) : apiKey ? (
          <div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
              <code className="text-primary font-mono text-sm flex-grow break-all">{apiKey}</code>
              <button onClick={copyKey} className="shrink-0 text-xs font-bold px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-primary transition-all">{copied ? 'Copié !' : 'Copier'}</button>
            </div>
            <p className="text-gray-400 text-xs mt-3">Gardez cette clé secrète. Elle donne accès à votre solde et à vos commandes.</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-gray-500 text-sm flex-grow">Aucune clé active. Générez-en une pour accéder à l'API.</p>
            <button onClick={generateKey} disabled={loading} className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-primaryDark transition-all disabled:opacity-50">{loading ? 'Génération…' : 'Générer ma clé API'}</button>
          </div>
        )}
      </div>

      {/* Connexion */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-4">Connexion</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Endpoint</span><code className="text-primary font-mono break-all">{API_BASE_URL}</code></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Méthode</span><span className="text-gray-700 font-mono">POST</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Content-Type</span><span className="text-gray-700 font-mono">application/x-www-form-urlencoded</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Réponse</span><span className="text-gray-700 font-mono">JSON</span></div>
        </div>
        <div className="mt-6 bg-gray-900 rounded-2xl p-5 overflow-x-auto">
          <pre className="text-[12px] text-gray-200 font-mono leading-relaxed">{`curl -X POST ${API_BASE_URL} \\
  -d "key=VOTRE_CLE_API" \\
  -d "action=products"`}</pre>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft">
        <h2 className="text-lg font-black text-gray-900 mb-6">Actions disponibles</h2>
        <div className="space-y-6">
          {actions.map(([name, params, example, desc]) => (
            <div key={name} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-primary font-mono font-black text-sm">action={name}</code>
              </div>
              <p className="text-gray-600 text-sm mb-2">{desc}</p>
              <p className="text-xs text-gray-400 mb-3"><span className="font-bold">Paramètres :</span> <code className="font-mono">{params}</code></p>
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
      setErrorMessage("Erreur upload : Assurez-vous d'avoir créé un bucket public 'avatars' dans Supabase.");
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
      setErrorMessage("Les mots de passe ne correspondent pas.");
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
      alert("Un email de configuration de mot de passe vous a été envoyé. Une fois configuré, vous pourrez vous connecter via email/pass.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Paramètres du Profil</h2>
        <form className="space-y-8" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prénom</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: Roosevelt" /></div>
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Nom</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: Mogo Kamdem" /></div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Pseudo (Public) *</label><input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /><p className="text-[10px] text-gray-400 italic mt-2">C'est le nom qui apparaîtra sur votre tableau de bord et vos avis.</p></div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Photo de profil</label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center overflow-hidden relative group">
                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Preview" /> : <User size={30} className="text-gray-300" />}
                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><RefreshCcw size={20} className="text-white animate-spin" /></div>}
              </div>
              <div className="space-y-3">
                <input type="file" id="avatar" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                <label htmlFor="avatar" className="inline-block bg-white border border-gray-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer">
                  {uploading ? "Chargement..." : "Choisir une photo"}
                </label>
                <p className="text-[10px] text-gray-400 font-medium italic">JPG, PNG supportés. Max 2Mo.</p>
              </div>
            </div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Adresse Email *</label><input type="email" value={email} readOnly className="w-full px-6 py-4 rounded-2xl bg-gray-100 border-none text-gray-400 font-bold text-sm cursor-not-allowed" /></div>
          {errorMessage && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}
          <button type="submit" disabled={loading} className={`px-12 py-5 rounded-full font-bold text-sm transition-all shadow-xl shadow-black/10 flex items-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}>
            {loading ? <RefreshCcw size={16} className="animate-spin" /> : success ? <><CheckCircle size={16} /> Modifié avec succès</> : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight flex items-center gap-3"><ShieldCheck size={28} className="text-primary" /> Sécurité & Connexion</h2>
        <div className="space-y-8">
          <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm"><img src="https://www.google.com/favicon.ico" className="w-6 h-6" alt="Google" /></div>
              <div><h4 className="font-bold text-gray-900">Compte Google</h4><p className="text-xs text-gray-400 font-medium">Connecté via Google Auth</p></div>
            </div>
            <button onClick={handleDissociateGoogle} disabled={loading} className="px-6 py-3 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 transition-all">Dissocier</button>
          </div>

          <div className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary"><CreditCard size={24} /></div>
              <div><h4 className="font-bold text-gray-900">Authentification à deux facteurs (2FA)</h4><p className="text-xs text-gray-400 font-medium">Ajoutez une couche de sécurité supplémentaire à votre compte.</p></div>
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
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Changement de mot de passe</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer le mot de passe" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" />
            </div>
            <button onClick={handleUpdatePassword} disabled={loading} className="text-sm font-black text-primary hover:underline uppercase tracking-wider disabled:opacity-50">
              {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
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

const DashboardView = ({ profile, navigate, orders = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewOrder, setViewOrder] = useState(null);

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: History },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      {viewOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
              <div><h3 className="text-xl font-bold">{viewOrder.product_name}</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Vos identifiants de connexion</p></div>
              <button onClick={() => setViewOrder(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><X size={20} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Info size={12} className="text-primary" /> Format : Email | Password | Recovery | 2FA
                  </div>
                  <button
                    onClick={() => {
                      const text = (viewOrder.credentials || viewOrder.data || "");
                      navigator.clipboard.writeText(text);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    <Copy size={12} /> Copier Tout
                  </button>
                </div>
                <div
                  className="font-mono text-sm text-gray-700 leading-relaxed whitespace-pre-wrap break-all max-h-[500px] overflow-y-auto custom-scrollbar pr-2 mt-6"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      if (!viewOrder.credentials && !viewOrder.data) return "En attente de livraison...";

                      const creds = viewOrder.credentials || viewOrder.data;
                      const highlighted = creds.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '<span class="bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded-md">$1</span>');

                      return `<div class="space-y-4">
                          <p>Merci beaucoup pour votre achat.</p>
                          <p>Voici vos produits :</p>
                          <p class="font-black text-lg text-gray-900 border-b border-gray-100 pb-2">${viewOrder.product_name}</p>
                          <div class="bg-gray-50 p-6 rounded-2xl border border-gray-100 shadow-inner">
                            ${highlighted}
                          </div>
                          
                          <div class="h-px bg-gray-100 my-8"></div>
                          
                          <div class="bg-primary/5 p-6 rounded-3xl border border-primary/10">
                            <h4 class="text-gray-900 font-black mb-4 uppercase">Comment se connecter (2FA)</h4>
                            <p class="text-xs leading-relaxed text-gray-600 mb-4">Collez la chaîne 2FA sur <a href="https://2fa.live" target="_blank" class="text-primary underline font-bold">2fa.live</a> pour obtenir le code à 6 chiffres.</p>
                            <p class="text-xs font-bold">Tutoriel : <a href="https://www.youtube.com/watch?v=JbjION2rdPA" target="_blank" class="text-primary underline">YouTube</a></p>
                          </div>

                          <div class="bg-red-50 p-6 rounded-3xl border border-red-100 mt-6">
                            <p class="text-red-500 font-bold text-xs">Période de garantie terminée après connexion réussie.</p>
                          </div>
                        </div>`;
                    })()
                  }}
                />
              </div>
            </div>
            <button onClick={() => setViewOrder(null)} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-black/10">Fermer la fenêtre</button>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-soft sticky top-32">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  profile?.display_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-black text-gray-900 truncate">
                  {profile?.first_name || profile?.last_name ? `${profile.first_name} ${profile.last_name}` : "Utilisateur"}
                </div>
                <div className="text-[10px] text-gray-400 font-bold tracking-wider truncate lowercase">
                  @{profile?.display_name?.toLowerCase() || "pseudo"}
                </div>
              </div>
            </div>
            <nav className="space-y-2">
              {sidebarItems.map(item => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-gray-900 text-white shadow-xl' : 'text-gray-500 hover:bg-gray-50'}`}>
                  <item.icon size={18} /> {item.label}
                </button>
              ))}
            </nav>
            <div className="mt-10 pt-6 border-t border-gray-50">
              <button onClick={() => supabase.auth.signOut()} className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all">
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-grow">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gray-900 rounded-[3rem] p-10 text-white relative overflow-hidden group shadow-2xl">
                  <div className="relative z-10">
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Solde Actuel</div>
                    <div className="text-5xl font-black mb-10 font-mono">${profile?.balance?.toFixed(2) || "0.00"}</div>
                    <button onClick={() => navigate('recharge')} className="bg-primary text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-primaryDark transition-all shadow-xl shadow-primary/20 flex items-center gap-2 inline-flex"><Plus size={18} /> Recharger le compte</button>
                  </div>
                  <Wallet size={120} className="absolute -bottom-6 -right-6 text-white/5 group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Dernière Commande</div>
                    <div className="text-xl font-bold text-gray-900 mb-2">{orders[0]?.product_name || "Aucune commande"}</div>
                    <div className="text-sm text-gray-400 font-medium">Effectuée le {orders[0]?.created_at ? new Date(orders[0].created_at).toLocaleDateString() : "--/--/----"}</div>
                  </div>
                  {orders[0]?.product_name !== "Recharge Binance" && (
                    <button onClick={() => setViewOrder(orders[0])} disabled={!orders[0]} className="text-sm font-black text-primary hover:underline flex items-center gap-2 mt-6 disabled:text-gray-300">
                      Voir les accès <ChevronRight size={16} />
                    </button>
                  )}
                </div>
              </div>
              <section className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
                <h3 className="text-lg font-bold mb-8">Activités Récentes</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-10"><p className="text-gray-400 text-sm font-medium">Vous n'avez pas encore effectué d'achats.</p></div>
                ) : (
                  <div className="space-y-6">
                    {orders.slice(0, 3).map(order => (
                      <div key={order.id} className="flex items-center justify-between py-4 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><History size={18} /></div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{order.product_name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{new Date(order.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm font-black text-gray-900">${order.total_price?.toFixed(2)}</div>
                          {order.product_name !== "Recharge Binance" && (
                            <button onClick={() => setViewOrder(order)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-all"><Eye size={18} /></button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
              <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Orders</h2>
              {orders.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">Aucune commande trouvée.</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead><tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"><th className="pb-6">Commande</th><th className="pb-6">Date</th><th className="pb-6">Statut</th><th className="pb-6">Actions</th><th className="pb-6 text-right">Total</th></tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map(order => (
                        <tr key={order.id} className="group">
                          <td className="py-6"><div className="font-bold text-gray-900">{order.product_name}</div><div className="text-[10px] text-gray-400 font-bold">Quantité: {order.quantity}</div></td>
                          <td className="py-6 text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                          <td className="py-6">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${order.status === 'confirmed' ? 'bg-green-100 text-green-700 border-green-200' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                                'bg-yellow-100 text-yellow-700 border-yellow-200'
                              }`}>
                              {order.status === 'confirmed' ? 'Confirmé' : order.status === 'cancelled' ? 'Annulé' : 'En attente'}
                            </span>
                          </td>
                          <td className="py-6">
                            {order.product_name !== "Recharge Binance" && (
                              <button onClick={() => setViewOrder(order)} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary/10 hover:text-primary transition-all text-gray-500">
                                <Eye size={14} /> Voir les accès
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
          )}

          {activeTab === 'settings' && (
            <SettingsTab profile={profile} onUpdate={() => navigate('dashboard')} />
          )}
        </main>
      </div>
    </div>
  );
};

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
            <h3 className="text-xl font-bold text-gray-900">Gérer le Stock</h3>
            <p className="text-sm text-gray-400 mt-1 font-medium">{product.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 transition-all"><X size={16} /></button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[['Total', stockInfo.total, 'bg-gray-50 text-gray-700'], ['Disponibles', stockInfo.available, 'bg-green-50 text-green-700'], ['Livrés', stockInfo.delivered, 'bg-blue-50 text-blue-700']].map(([label, val, cls]) => (
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
            Ajouter du Stock
          </button>
          <button
            onClick={() => setShowExisting(true)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${showExisting ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Modifier l'existant ({stockInfo.available})
          </button>
        </div>

        {!showExisting ? (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Coller les nouveaux comptes <span className="font-normal normal-case text-gray-300">(1 par ligne)</span></label>
              <textarea
                value={bulkText}
                onChange={e => setBulkText(e.target.value)}
                rows={8}
                placeholder={`email@gmail.com|Password123|recovery@mail.com\nemail2@gmail.com|Password456|recovery2@mail.com`}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono text-xs resize-none"
              />
              <p className="text-[10px] text-gray-400 mt-2">{bulkText.split('\n').filter(l => l.trim()).length} ligne(s) prête(s) à importer</p>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} />{error}</div>}

            <button onClick={handleImport} disabled={loading || importSuccess}
              className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${importSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary'}`}>
              {loading ? <><RefreshCcw size={16} className="animate-spin" /> Import en cours...</> : importSuccess ? <><CheckCircle size={16} /> Importé !</> : <><Upload size={16} /> Importer les comptes</>}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Modifier/Supprimer les comptes en stock <span className="text-red-400 font-bold">(Attention : Les lignes supprimées disparaîtront)</span></label>
              <textarea
                value={existingStock}
                onChange={e => setExistingStock(e.target.value)}
                rows={12}
                className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono text-xs resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-[10px] text-gray-400">{existingStock.split('\n').filter(l => l.trim()).length} compte(s) restant(s)</p>
                <button onClick={() => setExistingStock('')} className="text-[10px] font-bold text-red-400 hover:underline">Vider tout le stock</button>
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} />{error}</div>}

            <button onClick={handleUpdateStock} disabled={loading || importSuccess}
              className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${importSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary'}`}>
              {loading ? <><RefreshCcw size={16} className="animate-spin" /> Mise à jour...</> : importSuccess ? <><CheckCircle size={16} /> Stock mis à jour !</> : <><Save size={16} /> Enregistrer les modifications</>}
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
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Solde YTSeller</div>
            <div className="text-4xl font-black font-mono text-gray-900">
              {settings ? `${Number(settings.balance).toFixed(2)} ${settings.currency}` : '—'}
            </div>
            <div className="text-xs text-gray-400 mt-2">
              {settings?.last_catalog_sync ? `Dernière synchro : ${new Date(settings.last_catalog_sync).toLocaleString()}` : 'Jamais synchronisé'}
            </div>
          </div>
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Marge globale %</label>
              <div className="flex gap-2">
                <input type="number" value={marginInput} onChange={e => setMarginInput(e.target.value)} className="w-24 h-12 px-4 rounded-xl border border-gray-200 font-mono" />
                <button onClick={handleSaveMargin} className="h-12 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200"><Save size={16} /></button>
              </div>
            </div>
            <button onClick={handleSync} disabled={syncing}
              className="h-12 px-6 rounded-2xl bg-gray-900 text-white font-bold text-sm flex items-center gap-2 hover:bg-primary transition-all disabled:opacity-50">
              <RefreshCcw size={16} className={syncing ? 'animate-spin' : ''} /> {syncing ? 'Synchro…' : 'Synchroniser'}
            </button>
            <button onClick={handleFullImport} disabled={syncing}
              className="h-12 px-6 rounded-2xl bg-primary text-white font-bold text-sm flex items-center gap-2 hover:bg-primaryDark transition-all disabled:opacity-50">
              <Download size={16} /> Import complet (reset)
            </button>
          </div>
        </div>
        {msg && <div className="mt-6 text-sm font-bold text-gray-600 bg-gray-50 rounded-2xl px-5 py-3">{msg}</div>}
        {settings && Number(settings.balance) <= 0 && (
          <div className="mt-6 text-sm font-bold text-red-600 bg-red-50 rounded-2xl px-5 py-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Solde fournisseur à 0 — aucune commande dropship ne pourra être livrée. Rechargez votre compte YTSeller.
          </div>
        )}
      </div>

      {/* Mapping produits */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8">Mapping produits</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Mon produit</th><th className="pb-4">ID YTSeller</th><th className="pb-4">Coût</th>
                <th className="pb-4">Marge %</th><th className="pb-4">Prix vente</th><th className="pb-4">Dispo</th>
                <th className="pb-4">Actif</th><th className="pb-4">Actions</th>
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
                      <td className="py-4">{m.active ? <span className="text-green-600 font-bold">Oui</span> : <span className="text-gray-400">Non</span>}</td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => startEdit(m)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(m)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash size={14} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {mappings.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Aucun produit mappé.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Ajout mapping */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Produit</label>
            <select value={newMap.product_id} onChange={e => setNewMap({ ...newMap, product_id: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 font-bold min-w-[220px]">
              <option value="">— Choisir —</option>
              {unmappedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ID YTSeller</label>
            <input value={newMap.ytseller_product_id} onChange={e => setNewMap({ ...newMap, ytseller_product_id: e.target.value })} placeholder="ex: 11" className="px-4 py-3 rounded-xl border border-gray-200 font-mono w-28" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Marge %</label>
            <input type="number" value={newMap.margin_percent} onChange={e => setNewMap({ ...newMap, margin_percent: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 font-mono w-24" />
          </div>
          <button onClick={handleAdd} className="h-12 px-6 rounded-xl bg-primary text-white font-bold text-sm flex items-center gap-2"><Plus size={16} /> Mapper</button>
        </div>
      </div>

      {/* Commandes en attente fournisseur */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8">Commandes en attente fournisseur ({pending.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Commande</th><th className="pb-4">Produit</th><th className="pb-4">Qté</th>
                <th className="pb-4">YTSeller #</th><th className="pb-4">Statut</th><th className="pb-4">Dernier check</th>
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
              {pending.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-gray-400">Aucune commande en attente.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Journal fournisseur</h2>
          <button onClick={fetchAll} className="text-sm font-bold text-primary hover:underline flex items-center gap-2"><RefreshCcw size={14} /> Rafraîchir</button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map(l => (
            <div key={l.id} className={`text-xs rounded-xl px-4 py-3 flex items-start gap-3 ${l.level === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
              <span className="font-mono text-gray-400 shrink-0">{new Date(l.created_at).toLocaleTimeString()}</span>
              <span className="font-bold shrink-0 uppercase tracking-wide">{l.action}</span>
              <span>{l.message}{l.order_id ? ` (cmd #${l.order_id})` : ''}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="py-8 text-center text-gray-400 text-sm">Aucun log.</div>}
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
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-4"><Shield className="text-primary" /> Console Administration</h1>
          <p className="text-gray-400 text-sm mt-2">Gestion dynamique du catalogue et des clients.</p>
        </div>
        <button onClick={() => navigate('home')} className="text-sm font-bold text-primary hover:underline flex items-center gap-2"><ArrowLeft size={16} /> Retour au site</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
            { id: 'stock', label: 'Catalogue Produits', icon: Package },
            { id: 'orders', label: 'Commandes', icon: FileText },
            { id: 'users', label: 'Gestion Clients', icon: Users },
            { id: 'supplier', label: 'Fournisseur', icon: Database },
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
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenu Total</div><div className="text-3xl font-black text-gray-900">${allOrders.reduce((s, o) => s + (o.total_price || 0), 0).toFixed(2)}</div></div>
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Produits en Ligne</div><div className="text-3xl font-black text-gray-900">{products.length}</div></div>
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4"><AlertTriangle size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Total</div><div className="text-3xl font-black text-gray-900">{products.reduce((s, p) => s + (p.stock || 0), 0)}</div></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
                <h3 className="text-lg font-bold mb-8">Statistiques de Vente</h3>
                <p className="text-gray-400 text-sm italic">Les ventes sont gérées manuellement. Une fois le paiement reçu, livrez le client par email.</p>
              </div>

              <div className="bg-red-50/50 border border-red-100 rounded-[3rem] p-10">
                <h3 className="text-lg font-bold text-red-900 mb-2 flex items-center gap-2"><Settings size={20} /> Zone de Maintenance</h3>
                <p className="text-red-600 text-sm mb-8 font-medium">Nettoyez les données de test avant le lancement officiel. Ces actions sont irréversibles.</p>
                <div className="flex flex-wrap gap-4">
                  <button onClick={handleResetSystem} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-red-700 transition-all shadow-xl shadow-red-500/20 flex items-center gap-2">
                    <Trash2 size={18} /> Réinitialiser Commandes & Soldes
                  </button>
                  <button onClick={handleDeleteAllProducts} className="bg-white text-red-600 border border-red-200 px-8 py-4 rounded-2xl font-bold hover:bg-red-50 transition-all flex items-center gap-2">
                    <PackageX size={18} /> Supprimer tous les Produits
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stock' && (
            <div className="space-y-8">
              <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
                <div className="flex justify-between items-center mb-10">
                  <h2 className="text-2xl font-bold">Catalogue Produits</h2>
                  <div className="flex gap-4 items-center">
                    <button
                      onClick={() => handleDeleteAllProducts()}
                      className="text-red-500 hover:bg-red-50 px-4 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all"
                    >
                      <Trash2 size={18} /> Tout supprimer
                    </button>
                    <input type="file" id="excel-import" className="hidden" accept=".xlsx, .xls" onChange={handleExcelProductImport} />
                    <label htmlFor="excel-import" className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer hover:bg-green-700 transition-all shadow-lg shadow-green-500/20">
                      <Upload size={18} /> Importer Excel
                    </label>
                    <button onClick={handleExportExcel} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-primary transition-all shadow-lg shadow-gray-900/10">
                      <Download size={18} /> Exporter Excel
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-12">
                  <div className="bg-gray-50/50 p-8 rounded-[2.5rem] border border-gray-100">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-8">{editingProduct ? 'Modifier le Produit' : 'Ajouter un nouveau Produit'}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Titre du Produit</label>
                          <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20" placeholder="ex: Gmail Aged 2018" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</label>
                          <select value={productForm.category} onChange={e => setProductForm({ ...productForm, category: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold">
                            {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>



                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prix ($)</label>
                            <input type="number" value={productForm.price} onChange={e => setProductForm({ ...productForm, price: parseFloat(e.target.value) })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                          <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows="6" className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Détails du produit..." />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Image du produit (URL)</label>
                          <input type="text" value={productForm.image_url || ''} onChange={e => setProductForm({ ...productForm, image_url: e.target.value })} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-mono" placeholder="https://…/image.png (laisser vide = logo auto)" />
                          {productForm.image_url ? (
                            <div className="mt-3 w-24 h-24 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden">
                              <img src={productForm.image_url} alt="aperçu" className="w-full h-full object-contain" />
                            </div>
                          ) : null}
                        </div>
                        <button onClick={handleSaveProduct} disabled={actionStatus === 'loading'} className="w-full h-14 bg-gray-900 text-white rounded-xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2">
                          {actionStatus === 'loading' ? <RefreshCcw className="animate-spin" /> : <Save size={18} />}
                          {editingProduct ? 'Mettre à jour' : 'Valider le Produit'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                        <th className="pb-6">Produit</th>
                        <th className="pb-6">Prix</th>
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
                              <button onClick={() => setManagingStock(p)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all" title="Gérer Stock"><Database size={16} /></button>
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
                <h2 className="text-2xl font-bold">Gestion Clients</h2>
                <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">{allUsers.length} inscrits</div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                      <th className="pb-6">Utilisateur</th>
                      <th className="pb-6">Solde</th>
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
                            const amount = prompt("Montant à ajouter ($) :", "10");
                            if (amount) handleUpdateBalanceManual(user.id, user.email, parseFloat(amount));
                          }} className="p-2 bg-primary/10 text-primary rounded-lg font-bold text-xs">Créditer</button>
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
        <h4 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">Informations de Transfert</h4>

        <div className="space-y-4">
          <div className="flex justify-between items-center group">
            <span className="text-sm font-bold text-gray-500">Devise :</span>
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
          <Copy size={14} /> Copier toutes les infos
        </button>

        <div className="p-4 bg-red-50 rounded-xl border border-red-100">
          <p className="text-[10px] text-red-500 font-bold leading-relaxed italic">
            * IMPORTANT : Assurez-vous d'ajouter la note ci-dessus lors du transfert sur Binance pour une confirmation automatique.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 text-gray-900 font-bold mb-2">
            <Clock size={18} className="text-primary" /> Confirmation
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Les transactions sont généralement confirmées en 5-15 minutes.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="flex items-center gap-3 text-gray-900 font-bold mb-2">
            <MessageSquare size={18} className="text-primary" /> Support
          </div>
          <p className="text-[10px] text-gray-500 font-medium">Besoin d'aide ? Contactez-nous sur WhatsApp ou Telegram.</p>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100">{error}</div>}

      <button onClick={handleOrderSubmit} disabled={loading || success} className={`w-full py-6 rounded-[2rem] font-bold text-xl transition-all shadow-2xl flex items-center justify-center gap-3 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary shadow-black/10'}`}>
        {loading ? <RefreshCcw className="animate-spin" /> : success ? <CheckCircle /> : <ShieldCheck />}
        {loading ? "Vérification..." : success ? "Commande Envoyée !" : "J'ai effectué le transfert"}
      </button>
    </div>
  );
};

const USD_TO_FCFA = 600;

const RechargeView = ({ profile, session, navigate, suggestedAmount, setSuggestedAmount }) => {
  const [amountUsd, setAmountUsd] = useState(suggestedAmount || 10);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'redirecting' | 'success'
  const [error, setError] = useState('');
  const [payUrl, setPayUrl] = useState('');

  useEffect(() => () => setSuggestedAmount(null), []);

  const amountFcfa = Math.round(amountUsd * USD_TO_FCFA);

  if (!session) { navigate('auth'); return null; }

  const handleSubmit = async () => {
    if (amountUsd <= 0) { setError('Montant invalide.'); return; }

    setLoading(true);
    setError('');

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('moneroo-initialize', {
        body: {
          userId: session.user.id,
          email: session.user.email,
          name: profile?.display_name || '',
          amountUsd,
        },
      });

      if (fnError) throw new Error(fnError.message);
      if (!fnData?.url) throw new Error(fnData?.error || 'Réponse Moneroo invalide.');

      setPayUrl(fnData.url);
      setStep('redirecting');

    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const openPayment = () => {
    window.open(payUrl, '_blank', 'noopener,noreferrer');
    setStep('success');
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 font-sans">
      <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Recharger mon compte</h2>
      <p className="text-gray-500 mb-10 leading-relaxed">
        Paiement sécurisé par Mobile Money — Orange Money, MTN MoMo, Wave, Moov, Airtel.
      </p>

      {step === 'form' && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft space-y-6">

          {suggestedAmount && (
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-sm text-gray-600">
              Il te manque <span className="font-black text-primary">${suggestedAmount.toFixed(2)}</span> pour finaliser ta commande. Tu peux ajuster le montant si tu veux recharger plus.
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
              Montant à recharger (USD)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amountUsd}
              onChange={e => setAmountUsd(Number(e.target.value))}
              className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 outline-none font-black text-xl font-mono text-primary"
            />
            <p className="text-xs text-gray-400 mt-2 font-medium">
              ≈ <span className="text-gray-700 font-black">{amountFcfa.toLocaleString('fr-FR')} FCFA</span> débités de ton Mobile Money
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 bg-gray-900 text-white hover:bg-primary shadow-black/10 disabled:opacity-40"
          >
            {loading
              ? <><RefreshCcw size={20} className="animate-spin" /> Préparation...</>
              : <><Send size={20} /> Payer {amountFcfa.toLocaleString('fr-FR')} FCFA</>}
          </button>
        </div>
      )}

      {step === 'redirecting' && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center mx-auto">
            <ExternalLink size={36} className="text-violet-600" />
          </div>
          <h3 className="text-2xl font-black text-gray-900">Commande créée !</h3>
          <p className="text-gray-500">Clique pour finaliser le paiement sur la page sécurisée Moneroo.</p>
          <div className="bg-gray-50 rounded-2xl p-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Montant à payer</p>
            <p className="text-2xl font-black text-primary font-mono">{amountFcfa.toLocaleString('fr-FR')} FCFA</p>
          </div>
          <button
            onClick={openPayment}
            className="w-full py-5 rounded-2xl font-bold text-lg bg-gray-900 text-white hover:bg-primary transition-all shadow-xl flex items-center justify-center gap-3"
          >
            <ExternalLink size={20} /> Ouvrir la page de paiement
          </button>
          <p className="text-xs text-gray-400">La page s'ouvre dans un nouvel onglet.</p>
        </div>
      )}

      {step === 'success' && (
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft text-center space-y-6">
          <CheckCircle size={72} className="text-green-500 mx-auto" />
          <h3 className="text-2xl font-black text-gray-900">Paiement initié !</h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Complète le paiement dans l'onglet Moneroo. Ton solde sera crédité après confirmation automatique.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => window.open(payUrl, '_blank')}
              className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
            >
              <ExternalLink size={16} /> Rouvrir
            </button>
            <button
              onClick={() => navigate('dashboard')}
              className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-primary transition-all"
            >
              Mon compte
            </button>
          </div>
        </div>
      )}
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
      if (profile.balance < cartTotal) throw new Error("Solde insuffisant.");

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
          if (!dsOrder) throw new Error("La commande n'a pas pu être créée.");

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

        if (stockErr) throw new Error("Erreur lors de la récupération du stock.");
        if (!stockRows || stockRows.length < item.quantity) {
          throw new Error(`Plus de comptes disponibles en stock pour ${item.name}.`);
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
        if (!orderData) throw new Error("La commande a été créée mais l'ID n'a pas pu être récupéré.");

        // 3. Mark credentials as delivered and link to order
        const { error: stockUpdateErr } = await supabase.from('account_stock').update({
          is_delivered: true,
          order_id: String(orderData.id),
          delivered_to: session.user.id,
        }).in('id', stockIds);

        if (stockUpdateErr) console.error("Erreur mise à jour stock_account:", stockUpdateErr);
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
          <h2 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Finaliser la Commande</h2>

          <div className="space-y-8">
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Paiement par Solde</h3>
                    <p className="text-sm text-gray-400">Utilisez les crédits disponibles sur votre compte.</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-3xl p-8 mb-10 border border-gray-100/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Votre Solde Actuel</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${hasEnoughBalance ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                      {hasEnoughBalance ? 'Solde Suffisant' : 'Solde Insuffisant'}
                    </span>
                  </div>
                  <div className="text-4xl font-black text-gray-900 font-mono">${(profile?.balance || 0).toFixed(2)}</div>
                </div>

                {(!hasEnoughBalance && !purchaseSuccess) ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                      <div className="mt-1 text-red-500"><AlertTriangle size={20} /></div>
                      <p className="text-sm text-red-600 leading-relaxed font-medium">
                        Désolé, votre solde est de <span className="font-bold">${(profile?.balance || 0).toFixed(2)}</span>.
                        Vous avez besoin de <span className="font-bold">${cartTotal.toFixed(2)}</span> pour cette commande.
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
                      <Plus size={20} /> Recharger ${Math.max(0, Math.round((cartTotal - (profile?.balance || 0)) * 100) / 100).toFixed(2)}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBalancePayment}
                    disabled={isProcessing || purchaseSuccess}
                    className={`w-full py-6 rounded-[2rem] font-black text-lg transition-all shadow-2xl flex items-center justify-center gap-3 ${purchaseSuccess ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'}`}
                  >
                    {isProcessing ? <RefreshCcw size={24} className="animate-spin" /> : purchaseSuccess ? <CheckCircle size={24} /> : <Zap size={24} />}
                    {isProcessing ? "Traitement..." : purchaseSuccess ? "Paiement Réussi !" : `Confirmer le Paiement ($${cartTotal.toFixed(2)})`}
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
                En validant cette commande, vous acceptez nos <button onClick={() => navigate('faq')} className="text-primary hover:underline">conditions d'utilisation</button> et la politique de livraison instantanée.
              </p>
            </div>
          </div>
        </div>

        <div className="h-fit sticky top-32">
          <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xl font-bold mb-10 border-b border-white/10 pb-6">Résumé</h3>
            <div className="space-y-6 mb-10 text-sm font-medium text-gray-400">
              <div className="flex justify-between"><span>Articles (${cart.length})</span><span className="text-white">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Frais de service</span><span className="text-green-400">Gratuit</span></div>
            </div>
            <div className="flex justify-between text-3xl font-bold mb-4"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Sécurisé par Chiffrement SSL</div>
          </div>
        </div>
      </div>
    </div>
  );
};
// ==========================================
// PRODUCT VIEW
// ==========================================
const ProductView = ({ product, addToCart, navigate }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">


        <div className="bg-gray-50/50 rounded-[3rem] aspect-square flex items-center justify-center border border-gray-100 overflow-hidden relative group">
          <div className="absolute top-6 left-6 z-10 bg-red-500 text-white font-black px-4 py-2 rounded-xl shadow-xl rotate-[-10deg] animate-pulse">20% OFF</div>
          <div className="w-full h-full flex items-center justify-center scale-150 overflow-hidden group-hover:scale-[1.6] transition-transform duration-700">
            <ProductVisual product={product} iconSize={80} />
          </div>
          {product.name.includes('US') && product.category === 'email' && <div className="absolute bottom-10 right-10 bg-primary text-white text-xs font-black px-4 py-2 rounded-xl shadow-2xl tracking-tighter">COMPTE US</div>}
        </div>

        <div className="flex flex-col justify-center">
          <nav className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
            <button onClick={() => navigate('home')} className="hover:text-primary">ACCUEIL</button>
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
                navigate('cart');
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
              <h4 className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mb-4"><Info size={14} /> Description Additionnelle</h4>
              <p className="text-gray-600 font-medium leading-relaxed italic">{product.description || product.details?.note}</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6"><ShieldAlert size={14} className="text-primary" /> Conditions d'utilisation</h4>
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

const CartView = ({ cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, navigate, session }) => (
  <div className="max-w-4xl mx-auto py-20 px-6 font-sans">
    <div className="flex items-center justify-between mb-16">
      <h2 className="text-5xl font-bold text-gray-900 tracking-tighter">Votre Panier</h2>
      <div className="flex items-center gap-6">
        {cart.length > 0 && (
          <button onClick={clearCart} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2 border border-gray-100 px-4 py-2 rounded-xl">
            <Trash2 size={14} /> Vider le panier
          </button>
        )}
        <button onClick={() => navigate('home')} className="text-sm font-bold text-primary hover:underline uppercase tracking-widest">Continuer les achats</button>
      </div>
    </div>
    {cart.length === 0 ? (
      <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">Votre panier est vide.</p></div>
    ) : (
      <div className="space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] flex items-center justify-between group shadow-soft">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform relative">
                <ProductVisual product={item} iconSize={32} />
                {item.name.includes('US') && item.category === 'email' && <div className="absolute -bottom-1 -right-1 bg-primary text-white text-[8px] font-black px-1 rounded">US</div>}
              </div>
              <div><h4 className="font-bold text-gray-900 mb-1">{item.name}</h4><p className="text-primary font-bold">${item.price.toFixed(2)}</p></div>
            </div>
            <div className="flex items-center gap-10">
              <div className="flex items-center bg-gray-100 rounded-full p-1.5">
                <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all"><Minus size={14} /></button>
                <div className="w-10 text-center font-bold">{item.quantity}</div>
                <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all"><Plus size={14} /></button>
              </div>
              <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={22} /></button>
            </div>
          </div>
        ))}
        <div className="pt-10 flex flex-col items-end">
          <div className="text-4xl font-bold text-gray-900 mb-8 tracking-tighter">Total: ${cartTotal.toFixed(2)}</div>
          <button
            onClick={() => session ? navigate('payment') : navigate('auth')}
            className="bg-primary text-white px-16 py-6 rounded-full font-bold text-xl hover:bg-primaryDark transition-all shadow-2xl shadow-primary/20"
          >
            {session ? 'Passer au Paiement' : 'Se connecter pour payer'}
          </button>
        </div>
      </div>
    )}
  </div>
);

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
        alert("Vérifiez vos emails pour confirmer votre inscription !");
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
      setErrorMessage("Veuillez entrer votre adresse email pour réinitialiser votre mot de passe.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      alert("Un email de réinitialisation a été envoyé !");
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
          <h2 className="text-[40px] font-bold text-gray-900 mb-4 tracking-tight leading-none">Bienvenue</h2>
          <p className="text-gray-400 font-medium text-lg">Marketplace N°1 de comptes certifiés.</p>
        </div>

        {!showForm ? (
          <div className="w-full space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full h-20 bg-white border border-gray-100 rounded-[2rem] flex items-center justify-center gap-4 hover:bg-gray-50 transition-all group shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" className="w-6 h-6 group-hover:scale-110 transition-transform" alt="Google" />
              <span className="text-gray-700 font-bold text-lg">Continuer avec Google</span>
            </button>

            <button
              onClick={() => setShowForm(true)}
              className="w-full h-20 bg-[#10B981] text-white rounded-[2rem] flex items-center justify-center gap-4 hover:bg-[#059669] transition-all shadow-xl shadow-green-500/10"
            >
              <Mail size={24} />
              <span className="font-bold text-lg">Continuer avec Email</span>
            </button>
          </div>
        ) : (
          <form className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" onSubmit={handleAuth}>
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Nom</label>
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Nom" />
                </div>
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prénom</label>
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Prénom" />
                </div>
              </div>
            )}
            {!isLogin && (
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Username</label>
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Nom d'utilisateur" />
              </div>
            )}
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full h-16 px-8 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="votre@email.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
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
                {isLogin ? 'Se Connecter' : "S'inscrire"}
              </button>
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="flex-grow h-16 bg-gray-100 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all">
                {isLogin ? "S'inscrire" : "Connexion"}
              </button>
            </div>

            <button type="button" onClick={() => setShowForm(false)} className="w-full text-center text-xs text-gray-400 font-bold hover:text-primary transition-colors mt-4">
              ← Retour aux options
            </button>
          </form>
        )}

        <div className="mt-10 text-center">
          <button onClick={handleResetPassword} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
            Mot de passe oublié ?
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
          <div className="h-14 mb-8">
            <img src="/logo.png" alt="AgedGmailYT" className="h-full object-contain cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('home')} />
          </div>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-10 font-medium">
            La marketplace N°1 pour l'acquisition de comptes certifiés et de services digitaux premium. Sécurité, rapidité et fiabilité garanties.
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
          <h4 className="font-black text-gray-900 mb-8 uppercase tracking-[0.2em] text-[11px]">Plateforme</h4>
          <ul className="space-y-4">
            <li><button onClick={() => navigate('dashboard')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Account</button></li>
            <li><button onClick={() => navigate('home')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Service</button></li>
            <li><button onClick={() => navigate('home')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Resources</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-black text-gray-900 mb-8 uppercase tracking-[0.2em] text-[11px]">Support</h4>
          <ul className="space-y-4">
            <li><button onClick={() => navigate('home')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">Privacy Policy</button></li>
            <li><button onClick={() => navigate('api')} className="text-gray-500 hover:text-primary font-bold text-sm transition-colors">API</button></li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="pt-10 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Copyright 2026 © AgedGmailYT</span>
          <span className="text-gray-200 hidden md:block">•</span>
          <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">Tous droits réservés</span>
        </div>

        <div className="flex gap-8 items-center">
          <div className="flex gap-4 items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Système Opérationnel</span>
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
      title: "Supprimer ce produit ?",
      message: "Cette action est irréversible. Le produit sera définitivement retiré du catalogue.",
      type: "danger",
      onConfirm: async () => {
        try {
          const { error } = await supabase.from('products').delete().eq('id', id);
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

  const handleDeleteAllProducts = () => {
    setConfirmModal({
      isOpen: true,
      title: "Tout supprimer ?",
      message: "ATTENTION : Vous allez supprimer TOUS les produits du catalogue. Cette action ne peut pas être annulée.",
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
      <Navbar cartTotal={cartTotal} cartCount={cart.length} navigate={navigate} session={session} profile={profile} currentView={currentView} setActiveCategory={setActiveCategory} setActiveGroup={setActiveGroup} />
      <div className="flex-grow">
        {currentView === 'home' && <HomeView activeGroup={activeGroup} setActiveGroup={setActiveGroup} activeCategory={activeCategory} setActiveCategory={setActiveCategory} sortBy={sortBy} setSortBy={setSortBy} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} groups={productGroups} subCategories={productSubCategories} />}
        {currentView === 'product' && selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} />}
        {currentView === 'api' && <ApiView navigate={navigate} session={session} />}
        {currentView === 'auth' && <AuthView navigate={navigate} />}
        {currentView === 'dashboard' && session && <DashboardView profile={profile} navigate={navigate} orders={orders} />}
        {currentView === 'cart' && <CartView cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} cartTotal={cartTotal} navigate={navigate} session={session} />}
        {currentView === 'payment' && <PaymentView cart={cart} cartTotal={cartTotal} navigate={navigate} clearCart={clearCart} profile={profile} session={session} fetchProfile={fetchProfile} fetchProducts={fetchProducts} fetchAllOrders={fetchAllOrders} setRechargeSuggestedAmount={setRechargeSuggestedAmount} />}
        {currentView === 'recharge' && session && <RechargeView profile={profile} session={session} navigate={navigate} suggestedAmount={rechargeSuggestedAmount} setSuggestedAmount={setRechargeSuggestedAmount} />}
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