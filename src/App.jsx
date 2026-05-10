import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, Package, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare } from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// CONFIGURATION ADMIN & SUPPORT
// ==========================================
const ADMIN_EMAIL = "rooseveltmkr@gmail.com";
const SUPPORT_WHATSAPP = "237655306425";
const SUPPORT_TELEGRAM = "rooseveltmkr";

// ==========================================
// COMPOSANTS LOGOS (IMG & SVG)
// ==========================================

const YouTubeLogo = ({ className = "" }) => (
  <img src="/youtube-logo.png" alt="YouTube" className={`w-full h-full object-contain scale-125 ${className}`} />
);

const GmailLogo = ({ className = "" }) => (
  <img src="/gmail-logo.png" alt="Gmail" className={`w-full h-full object-contain scale-125 ${className}`} />
);

const FacebookIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// ==========================================
// COMPOSANT SUPPORT CHAT
// ==========================================

const SupportChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-8 right-8 z-[1000] font-sans">
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[350px] bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gray-900 p-8 text-white relative">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white relative">
                <Headphones size={24} />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
              </div>
              <div>
                <h4 className="font-bold text-lg">Support AgedGmail</h4>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">En ligne • Réponse rapide</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
          <div className="p-8 space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed mb-6 font-medium">
              Bonjour ! Comment pouvons-nous vous aider aujourd'hui ? Choisissez votre canal préféré :
            </p>
            <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-green-50 rounded-2xl border border-green-100 group hover:bg-green-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                  <MessageCircle size={20} />
                </div>
                <div>
                  <div className="text-sm font-black text-green-900 uppercase tracking-tighter">WhatsApp</div>
                  <div className="text-[10px] text-green-600 font-bold">Réponse en moins de 5 min</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-green-400 group-hover:translate-x-1 transition-transform" />
            </a>
            <a href={`https://t.me/${SUPPORT_TELEGRAM}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between p-5 bg-blue-50 rounded-2xl border border-blue-100 group hover:bg-blue-100 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Send size={20} />
                </div>
                <div>
                  <div className="text-sm font-black text-blue-900 uppercase tracking-tighter">Telegram</div>
                  <div className="text-[10px] text-blue-600 font-bold">Support direct & sécurisé</div>
                </div>
              </div>
              <ChevronRight size={18} className="text-blue-400 group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="w-full flex items-center justify-center gap-3 p-5 bg-gray-50 text-gray-400 rounded-2xl border border-gray-100 text-xs font-bold hover:bg-gray-100 transition-all">
              <Mail size={16} /> Envoyer un Ticket Email
            </button>
          </div>
          <div className="bg-gray-50 p-4 text-center">
            <span className="text-[8px] font-black text-gray-300 uppercase tracking-[0.2em]">Sécurisé par AgedGmail HelpDesk</span>
          </div>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 group relative ${isOpen ? 'bg-gray-900 rotate-90' : 'bg-primary hover:scale-110 active:scale-95'}`}>
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <>
            <MessageSquare className="text-white group-hover:scale-110 transition-transform" size={28} />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">1</div>
          </>
        )}
      </button>
    </div>
  );
};

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

const PRICE_RANGES = [
  { id: 'all', name: 'Tous les prix' },
  { id: 'under5', name: 'Moins de 5$' },
  { id: '5-10', name: '5$ - 10$' },
  { id: '10-50', name: '10$ - 50$' },
  { id: 'over50', name: 'Plus de 50$' },
];

const getProductDetails = (product) => {
  const commonTerms = "Veuillez lire les spécifications avant d'acheter. Vous êtes responsable de toutes les actions sur le compte. Utilisez des IP résidentielles fraîches. Changez les accès après 48h seulement.";
  return {
    info: product.category === 'email'
      ? `Âge : ${product.name.match(/\d{4}/)?.[0] || 'Ancien'} | Pays : ${product.name.includes('US') ? 'US' : 'Aléatoire'} | Format : Gmail/Pass/Récup/2FA`
      : product.category === 'facebook'
        ? "Âge : Ancien (2012-2020) | Amis : 50+ | Statut : Vérifié | Qualité : Verte"
        : product.category === 'youtube_not_monetized'
          ? `Abonnés : ${product.name.split(' – ')[1] || '1k+'} | Éligibilité : Immédiate | Contenu : Aucun`
          : `Année : ${product.name.match(/\d{4}/)?.[0] || 'Ancien'} | Statut : ${product.category === 'youtube_monetized' ? '✅ Monétisée' : '❌ Non-Monétisée'} | Contenu : Propre`,
    note: product.category === 'facebook'
      ? "Idéal pour le Meta Ads. Compte stable avec historique."
      : product.category.includes('youtube')
        ? "Parfait pour le business YT automation."
        : "Gmail de haute qualité. Format : Email | Pass | Récup | 2FA.",
    terms: commonTerms,
    refund: "Garantie de 3 jours jusqu'à la connexion."
  };
};

const PRODUCTS = [
  { id: 201, name: 'Chaîne YouTube – 1k Abonnés – Prête pour Monétisation', category: 'youtube_not_monetized', price: 10.00, sales: 150 },
  { id: 202, name: 'Chaîne YouTube – 10k Abonnés – Trafic Organique', category: 'youtube_not_monetized', price: 50.00, sales: 90 },
  { id: 203, name: 'Chaîne YouTube – 50k Abonnés – Spécial Business', category: 'youtube_not_monetized', price: 150.00, sales: 40 },
  { id: 204, name: 'Chaîne YouTube – 100k Abonnés – Pack Autorité', category: 'youtube_not_monetized', price: 300.00, sales: 20 },
  { id: 101, name: 'Chaîne YouTube Monétisée – 1.2k Subs – 4000h – 2018', category: 'youtube_monetized', price: 185.00, sales: 12 },
  { id: 19, name: 'Gmail US Ancien 2010 – 2025', category: 'email', price: 5.43, sales: 150 },
  { id: 20, name: 'Gmail Pays Aléatoire Ancien 2020 – 2025', category: 'email', price: 3.24, sales: 200 },
  { id: 27, name: 'Gmail US 2015 – 2020 – Haute Qualité', category: 'email', price: 9.50, sales: 85 },
  { id: 1, name: 'Chaîne Youtube 2014 – 2019 sans vidéo', category: 'youtube_aged', price: 6.19, sales: 90 },
  { id: 8, name: 'Chaîne Spéciale 2011-202x avec 10k à 50k vues ORGANIQUES', category: 'youtube_cpa', price: 19.80, sales: 40 },
  { id: 24, name: 'Compte Facebook US Ancien (50+ Amis) - Spécial Ads', category: 'facebook', price: 35.00, sales: 20 },
].map(p => ({ ...p, details: getProductDetails(p) }));

// ==========================================
// PRODUCT CARD
// ==========================================

const ProductCard = ({ product, addToCart, navigate, setSelectedProduct }) => {
  const [localQty, setLocalQty] = useState(1);
  const isUS = product.name.includes('US');

  return (
    <div className="bg-white group">
      <div className="aspect-[16/10] bg-gray-50/50 rounded-[2rem] flex items-center justify-center mb-6 overflow-hidden border border-gray-100 group-hover:border-primary/30 transition-all duration-500 relative cursor-pointer" onClick={() => { setSelectedProduct(product); navigate('product'); }}>
        <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700 overflow-hidden px-10 relative">
          {product.category.includes('youtube') ? <YouTubeLogo /> : product.category === 'email' ? <GmailLogo /> : product.category === 'facebook' ? <FacebookIcon className="w-16 h-16 text-blue-600" /> : <Share2 size={50} className="text-gray-300" />}
          {isUS && product.category === 'email' && <div className="absolute bottom-4 right-8 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md shadow-lg shadow-primary/20 tracking-tighter">US</div>}
        </div>
      </div>
      <div className="space-y-4 px-2">
        <div><div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{CATEGORIES.find(c => c.id === product.category)?.name}</div><h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedProduct(product); navigate('product'); }}>{product.name}</h3></div>
        <div className="text-xl font-black text-gray-900 font-mono">${product.price.toFixed(2)}</div>
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 shrink-0">
            <button onClick={() => localQty > 1 && setLocalQty(localQty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Minus size={14} /></button>
            <div className="w-8 text-center text-xs font-bold">{localQty}</div>
            <button onClick={() => localQty < 999 && setLocalQty(localQty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Plus size={14} /></button>
          </div>
          <button onClick={() => addToCart(product, localQty)} className="flex-grow bg-gray-900 text-white h-10 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-primary transition-all shadow-lg shadow-black/5">Ajouter</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// NAVBAR
// ==========================================

const Navbar = ({ cartTotal, navigate, session, profile }) => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50 font-sans">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <button onClick={() => navigate('home')} className="font-bold text-2xl tracking-tight">AgedGmail<span className="text-primary">YT</span></button>
      <div className="flex items-center gap-6">
        {session && session.user.email === ADMIN_EMAIL && (
          <button onClick={() => navigate('admin')} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Shield size={14} /> Admin
          </button>
        )}
        {session ? (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end border-r border-gray-100 pr-4">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mon Solde</span>
              <span className="text-sm font-bold text-primary font-mono">${profile?.balance?.toFixed(2) || "0.00"}</span>
            </div>
            <button onClick={() => navigate('dashboard')} className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-gray-600 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100">
              <LayoutDashboard size={18} />
            </button>
          </div>
        ) : (
          <button onClick={() => navigate('auth')} className="text-sm font-bold text-gray-700 hover:text-primary flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <User size={18} /> Connexion
          </button>
        )}
        <button onClick={() => navigate('cart')} className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 hover:bg-black transition-all shadow-lg shadow-black/10">
          <ShoppingCart size={18} /><span className="border-l border-white/20 pl-3">PANIER / ${cartTotal.toFixed(2)}</span>
        </button>
      </div>
    </div>
  </header>
);

// ==========================================
// HOME VIEW
// ==========================================

const HomeView = ({ activeCategory, setActiveCategory, priceRange, setPriceRange, filteredProducts, addToCart, navigate, setSelectedProduct }) => (
  <>
    <section className="bg-[#FCFCFD] pt-20 pb-24 overflow-hidden relative border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 bg-[#E6F8F0] text-primaryDark px-3 py-1.5 rounded-full text-sm font-bold mb-6">🔥 N°1 des Comptes Anciens</div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1A202C] leading-[1.1] tracking-tight mb-6">Donnez un coup d'accélérateur à votre <span className="text-primary">Business YT automation</span></h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">Nous fournissons les meilleurs comptes Gmail vieillis et d'anciennes chaînes YouTube pour booster votre présence.</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primaryDark transition-all shadow-xl shadow-primary/20">Voir le catalogue</button>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <span>Paiement 100% Crypto</span>
              <div className="flex gap-1">
                <div className="w-6 h-6 bg-[#F7931A] rounded-full flex items-center justify-center text-white text-[10px] font-bold">₿</div>
                <div className="w-6 h-6 bg-[#627EEA] rounded-full flex items-center justify-center text-white text-[10px] font-bold">Ξ</div>
              </div>
            </div>
          </div>
        </div>
        <div className="relative h-[500px] hidden lg:block">
          <div className="absolute top-[10%] right-[10%] bg-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-float-slow z-30 border border-gray-50 overflow-hidden"><div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden"><YouTubeLogo /></div><div><div className="text-sm font-black text-gray-900">YouTube 2014</div><div className="text-primary font-bold">$6.19</div></div></div>
          <div className="absolute top-[45%] left-[5%] bg-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-float-medium z-20 border border-gray-100 overflow-hidden"><div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden"><GmailLogo /></div><div><div className="text-sm font-black text-gray-900">Gmail US 2010</div><div className="text-primary font-bold">$5.43</div></div></div>
          <div className="absolute bottom-[10%] right-[20%] bg-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-float-fast z-10 border border-gray-100"><div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-2xl"><Zap size={24} className="text-yellow-400" /></div><div><div className="text-sm font-black text-gray-900">Instantané</div><div className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Livraison</div></div></div>
        </div>
      </div>
    </section>
    <main id="catalog" className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-12 font-sans">
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="sticky top-32 space-y-12">
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Catégories</h3>
            <ul className="space-y-2">{CATEGORIES.map(cat => (<li key={cat.id}><button onClick={() => setActiveCategory(cat.id)} className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-gray-900 text-white shadow-xl' : 'hover:bg-gray-100 text-gray-600'}`}>{cat.name}</button></li>))}</ul>
          </div>
          <div>
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Filtrer par Prix</h3>
            <ul className="space-y-2">{PRICE_RANGES.map(range => (<li key={range.id}><button onClick={() => setPriceRange(range.id)} className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${priceRange === range.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-gray-100 text-gray-600'}`}>{range.name}</button></li>))}</ul>
          </div>
        </div>
      </div>
      <div className="flex-grow">
        <div className="flex justify-between items-center mb-10 border-b border-gray-100 pb-6">
          <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">{filteredProducts.length} produits disponibles • Trié par prix croissant</div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} />))}
        </div>
      </div>
    </main>
  </>
);

// ==========================================
// DASHBOARD VIEW
// ==========================================

const DashboardView = ({ profile, navigate, orders = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [viewOrder, setViewOrder] = useState(null);

  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Orders', icon: History },
    { id: 'downloads', label: 'Downloads', icon: Download },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'settings', label: 'Account details', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      {viewOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
              <div><h3 className="text-xl font-bold">{viewOrder.product_name}</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Vos identifiants de connexion</p></div>
              <button onClick={() => setViewOrder(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><X size={20} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Format : Email | Password | Recovery | 2FA Code</div>
                <div className="font-mono text-sm bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center group">
                  <span className="truncate mr-4 text-gray-700">{viewOrder.data || viewOrder.credentials || "En attente de livraison..."}</span>
                  <button onClick={() => { navigator.clipboard.writeText(viewOrder.data || viewOrder.credentials || ''); alert("Copié !"); }} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all"><Copy size={16} /></button>
                </div>
              </div>
              <button onClick={() => setViewOrder(null)} className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-black/10">Fermer la fenêtre</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white border border-gray-100 rounded-[2.5rem] p-6 shadow-soft sticky top-32">
            <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-50">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">{profile?.display_name?.[0]?.toUpperCase() || profile?.email?.[0]?.toUpperCase()}</div>
              <div className="overflow-hidden">
                <div className="text-sm font-black text-gray-900 truncate">{profile?.display_name || "Utilisateur"}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">#{profile?.id?.slice(0, 4) || "1688"}</div>
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
                  <button onClick={() => setViewOrder(orders[0])} disabled={!orders[0]} className="text-sm font-black text-primary hover:underline flex items-center gap-2 mt-6 disabled:text-gray-300">Voir les accès <ChevronRight size={16} /></button>
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
                          <button onClick={() => setViewOrder(order)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-all"><Eye size={18} /></button>
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
                              {order.status === 'confirmed' ? '✅ Confirmé' : order.status === 'cancelled' ? '❌ Annulé' : '⏳ En attente'}
                            </span>
                          </td>
                          <td className="py-6">
                            <button onClick={() => setViewOrder(order)} className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary/10 hover:text-primary transition-all text-gray-500">
                              <Eye size={14} /> Voir les accès
                            </button>
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

          {activeTab === 'downloads' && (<div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft"><h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Downloads</h2><div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">Vos téléchargements apparaîtront ici.</p></div></div>)}
          {activeTab === 'address' && (<div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft"><h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Addresses</h2><p className="text-gray-400 text-sm mb-10">Les adresses suivantes seront utilisées sur la page de validation de commande par défaut.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100"><h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest">Billing Address</h3><p className="text-gray-400 text-sm font-medium">Vous n'avez pas encore configuré ce type d'adresse.</p><button className="mt-6 text-sm font-black text-primary hover:underline">Add</button></div><div className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100"><h3 className="text-sm font-black text-gray-900 mb-4 uppercase tracking-widest">Shipping Address</h3><p className="text-gray-400 text-sm font-medium">Vous n'avez pas encore configuré ce type d'adresse.</p><button className="mt-6 text-sm font-black text-primary hover:underline">Add</button></div></div></div>)}

          {activeTab === 'settings' && (
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
              <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">Account details</h2>
              <form className="space-y-10" onSubmit={(e) => { e.preventDefault(); alert("Profil mis à jour (Simulation)"); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">First name *</label><input type="text" defaultValue="Roosevelt" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /></div>
                  <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Last name *</label><input type="text" defaultValue="Mogo kamdem" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /></div>
                </div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display name *</label><input type="text" defaultValue="rooseveltmkr" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /><p className="text-[10px] text-gray-400 italic mt-2">This will be how your name will be displayed in the account section and in reviews</p></div>
                <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email address *</label><input type="email" defaultValue={profile?.email} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /></div>
                <div className="pt-10 border-t border-gray-50">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-8">Password change</h3>
                  <div className="space-y-6">
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current password (leave blank to leave unchanged)</label><input type="password" placeholder="••••••••••••••" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /></div>
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New password (leave blank to leave unchanged)</label><input type="password" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /></div>
                    <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Confirm new password</label><input type="password" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /></div>
                  </div>
                </div>
                <button type="submit" className="bg-gray-900 text-white px-12 py-5 rounded-full font-bold text-sm hover:bg-black transition-all shadow-xl shadow-black/10">Save changes</button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// ORDERS ADMIN — Composant gestion commandes
// ==========================================

const OrdersAdmin = ({ allOrders, fetchAllOrders }) => {
  const [filter, setFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [credentials, setCredentials] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const filtered = filter === 'all'
    ? allOrders
    : allOrders.filter(o => (o.status || 'pending') === filter);

  const confirmOrder = async () => {
    setActionLoading(true);

    if (selectedOrder.product_name === "Recharge Binance") {
      // 1. Fetch current profile to get balance
      const { data: userData, error: userError } = await supabase.from('profiles').select('balance').eq('id', selectedOrder.user_id).single();
      if (userError) {
        alert("Erreur lors de la récupération de l'utilisateur.");
        setActionLoading(false);
        return;
      }

      // 2. Add total_price to balance
      const newBalance = (userData.balance || 0) + (selectedOrder.total_price || 0);
      const { error: balanceError } = await supabase.from('profiles').update({ balance: newBalance }).eq('id', selectedOrder.user_id);
      
      if (balanceError) {
        alert("Erreur lors de la mise à jour du solde : " + balanceError.message);
        setActionLoading(false);
        return;
      }

      // 3. Mark order as confirmed
      await supabase.from('orders').update({
        status: 'confirmed',
        admin_note: adminNote.trim() || null,
        confirmed_at: new Date().toISOString(),
      }).eq('id', selectedOrder.id);

      alert(`Recharge de $${selectedOrder.total_price} confirmée avec succès !`);

    } else {
      // Standard product delivery
      if (!credentials.trim()) { 
        alert('Entre les credentials !'); 
        setActionLoading(false);
        return; 
      }
      
      await supabase.from('orders').update({
        status: 'confirmed',
        credentials: credentials.trim(),
        data: credentials.trim(),
        admin_note: adminNote.trim() || null,
        confirmed_at: new Date().toISOString(),
      }).eq('id', selectedOrder.id);
    }

    setSelectedOrder(null);
    setCredentials('');
    setAdminNote('');
    fetchAllOrders();
    setActionLoading(false);
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Annuler cette commande ?')) return;
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
    fetchAllOrders();
  };

  const statusBadge = (status) => {
    const s = status || 'pending';
    const map = {
      pending: { label: '⏳ En attente', cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
      confirmed: { label: '✅ Confirmé', cls: 'bg-green-100 text-green-700 border-green-200' },
      cancelled: { label: '❌ Annulé', cls: 'bg-red-100 text-red-700 border-red-200' },
    };
    const { label, cls } = map[s] || map.pending;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cls}`}>{label}</span>;
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
          { key: 'pending', label: '⏳ En attente' },
          { key: 'confirmed', label: '✅ Confirmés' },
          { key: 'cancelled', label: '❌ Annulés' },
          { key: 'all', label: '📋 Tous' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${filter === f.key ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}>
            {f.label}
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
                      {(!order.status || order.status === 'pending') && <>
                        <button onClick={() => { setSelectedOrder(order); setCredentials(''); setAdminNote(''); }}
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all" title="Confirmer">
                          <CheckCircle size={14} />
                        </button>
                        <button onClick={() => cancelOrder(order.id)}
                          className="p-2 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 transition-all" title="Annuler">
                          <X size={14} />
                        </button>
                      </>}
                      {order.status === 'confirmed' && (
                        <button onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all" title="Voir credentials">
                          <Eye size={14} />
                        </button>
                      )}
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
          <div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl p-10 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900">
                {(!selectedOrder.status || selectedOrder.status === 'pending') ? 'Confirmer la commande' : 'Détail commande'}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <X size={16} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 space-y-3 text-sm">
              {[
                ['Produit', selectedOrder.product_name],
                ['Email', selectedOrder.buyer_email || '—'],
                ['Montant', `$${selectedOrder.total_price?.toFixed(2)}`],
                ['TX Binance', selectedOrder.binance_tx_id || 'Non fourni'],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-gray-400 font-medium">{label}</span>
                  <span className="font-bold text-gray-900">{val}</span>
                </div>
              ))}
            </div>

            {(!selectedOrder.status || selectedOrder.status === 'pending') ? (<>
              {selectedOrder.product_name !== "Recharge Binance" && (
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Credentials à livrer *</label>
                  <textarea
                    value={credentials}
                    onChange={e => setCredentials(e.target.value)}
                    placeholder={"email@gmail.com\nPassword: MonPass123\nRecovery: backup@email.com\n2FA: JBSWY3DPEHPK3PXP"}
                    rows={5}
                    className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono text-sm resize-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Note admin <span className="font-normal normal-case text-gray-300">(optionnel)</span></label>
                <input value={adminNote} onChange={e => setAdminNote(e.target.value)} placeholder="ex: Vérifié sur Binance TX #12345"
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm" />
              </div>
              <button onClick={confirmOrder} disabled={actionLoading}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {actionLoading ? <><RefreshCcw size={16} className="animate-spin" /> Confirmation...</> : (selectedOrder.product_name === "Recharge Binance" ? '✅ Valider et Créditer le Solde' : '✅ Confirmer et enregistrer')}
              </button>
            </>) : (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{selectedOrder.product_name === "Recharge Binance" ? "Statut" : "Credentials livrés"}</label>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 font-mono text-sm text-green-800 whitespace-pre-wrap">
                  {selectedOrder.product_name === "Recharge Binance" ? "✅ Solde crédité avec succès." : (selectedOrder.credentials || selectedOrder.data || '—')}
                </div>
                {selectedOrder.admin_note && <p className="text-gray-400 text-xs mt-2">📝 {selectedOrder.admin_note}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// ADMIN VIEW
// ==========================================

const AdminView = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id);
  const [stockInput, setStockInput] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [amountToAdd, setAmountToAdd] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    fetchInventory();
    fetchAllOrders();
  }, []);

  const fetchInventory = async () => {
    setInventory(PRODUCTS.map(p => ({
      ...p,
      stock: 0,
      sold: 0
    })));
  };

  const fetchAllOrders = async () => {
    setAllOrders([]);
  };

  const selectedProductStock = inventory.find(p => p.id === parseInt(selectedProductId))?.stock || 0;

  const handleAddStock = async () => {
    if (!stockInput.trim()) return alert("Veuillez entrer des comptes.");
    const lines = stockInput.split("\n").filter(l => l.trim());
    const itemsToInsert = lines.map(line => ({ product_id: parseInt(selectedProductId), data: line, is_sold: false }));
    const { error } = await supabase.from('product_stock').insert(itemsToInsert);
    if (error) { alert("Erreur Supabase : " + error.message); }
    else { alert(`${lines.length} comptes ajoutés !`); setStockInput(""); fetchInventory(); }
  };

  const handleClearStock = async () => {
    if (window.confirm("Vider le stock ?")) {
      const { error } = await supabase.from('product_stock').delete().eq('product_id', selectedProductId).eq('is_sold', false);
      if (error) alert("Erreur : " + error.message);
      else { alert("Stock vidé."); fetchInventory(); }
    }
  };

  const handleUpdateBalance = async () => {
    if (!userEmail || amountToAdd <= 0) return alert("Infos invalides.");
    const { data: userData } = await supabase.from('profiles').select('id, balance').ilike('email', userEmail.trim()).single();
    if (!userData) return alert("Utilisateur introuvable. Vérifiez l'email.");
    const { error } = await supabase.from('profiles').update({ balance: userData.balance + amountToAdd }).eq('id', userData.id);
    if (error) alert("Erreur : " + error.message);
    else { alert(`Succès !`); setUserEmail(""); setAmountToAdd(0); }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight flex items-center gap-4"><Shield className="text-primary" /> Console Administration</h1>
          <p className="text-gray-400 text-sm mt-2">Gestion globale du stock, des utilisateurs et des ventes.</p>
        </div>
        <button onClick={() => navigate('home')} className="text-sm font-bold text-primary hover:underline flex items-center gap-2"><ArrowLeft size={16} /> Retour au site</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <aside className="lg:col-span-1 space-y-2">
          {[
            { id: 'dashboard', label: 'Vue d\'ensemble', icon: LayoutDashboard },
            { id: 'stock', label: 'Gérer le Stock', icon: Database },
            { id: 'orders', label: 'Commandes', icon: FileText },
            { id: 'users', label: 'Clients & Crédits', icon: Users },
          ].map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all ${activeTab === item.id ? 'bg-gray-900 text-white shadow-xl' : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'}`}>
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </aside>

        <main className="lg:col-span-3 space-y-8">
          {activeTab === 'dashboard' && (() => {
            const totalRevenue = allOrders.reduce((sum, o) => sum + (o.total_price || 0), 0);
            const totalSold = inventory.reduce((sum, p) => sum + p.sold, 0);
            const lowStockCount = inventory.filter(p => p.stock > 0 && p.stock < 5).length;
            return (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenu Total</div><div className="text-3xl font-black text-gray-900">${totalRevenue.toFixed(2)}</div></div>
                  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Comptes Vendus</div><div className="text-3xl font-black text-gray-900">{totalSold}</div></div>
                  <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4"><AlertTriangle size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Faible</div><div className={`text-3xl font-black ${lowStockCount > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>{lowStockCount}</div></div>
                </div>
                <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
                  <h3 className="text-lg font-bold mb-8 flex items-center gap-3"><Activity size={20} className="text-primary" /> État de l'Inventaire</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead><tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"><th className="pb-6">Produit</th><th className="pb-6">Vendus</th><th className="pb-6 text-right">En Stock</th></tr></thead>
                      <tbody className="divide-y divide-gray-50">{inventory.map(p => (<tr key={p.id}><td className="py-5 font-bold text-gray-900 text-sm">{p.name}</td><td className="py-5 text-gray-400 text-sm font-bold">{p.sold}</td><td className={`py-5 text-right font-mono font-black ${p.stock === 0 ? 'text-red-500' : 'text-primary'}`}>{p.stock}</td></tr>))}</tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
          {activeTab === 'stock' && (
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Gestion du Stock</h2>
                <div className="bg-gray-50 px-6 py-3 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Quantité Disponible</span>
                  <span className={`text-2xl font-black font-mono ${selectedProductStock === 0 ? 'text-red-500' : 'text-primary'}`}>{selectedProductStock} comptes</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Produit</label>
                  <select value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm">
                    {PRODUCTS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Données (1 compte par ligne)</label>
                  <textarea value={stockInput} onChange={(e) => setStockInput(e.target.value)} rows="8" placeholder="user@gmail.com|pass|recup|2fa" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-mono text-sm" />
                </div>
                <div className="flex gap-4 pt-4">
                  <button onClick={handleAddStock} className="flex-grow bg-gray-900 text-white py-5 rounded-2xl font-bold text-sm hover:bg-primary transition-all flex items-center justify-center gap-2"><Plus size={18} /> Ajouter au Stock</button>
                  <button onClick={handleClearStock} className="bg-red-50 text-red-500 px-8 py-5 rounded-2xl font-bold text-sm hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"><Trash size={18} /> Vider le Stock</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <OrdersAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} />
          )}

          {activeTab === 'users' && (
            <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
              <h2 className="text-2xl font-bold mb-8">Clients & Crédits</h2>
              <p className="text-gray-400 mb-8">Rechercher un utilisateur et ajuster son solde manuellement.</p>
              
              <div className="space-y-6 max-w-md">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Client</label>
                  <input type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} placeholder="client@email.com" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant à Ajouter ($)</label>
                  <input type="number" value={amountToAdd} onChange={e => setAmountToAdd(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm font-bold" />
                </div>
                <button onClick={handleUpdateBalance} className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-primary transition-all flex items-center justify-center gap-2">
                  <DollarSign size={16} /> Créditer le Compte
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// ==========================================
// RECHARGE VIEW & BINANCE PAY
// ==========================================

const RechargeView = ({ profile, session, navigate }) => {
  const [amount, setAmount] = useState(10);
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!session) { navigate('auth'); return; }
    if (!txId.trim()) { alert('Veuillez entrer un ID de transaction valide.'); return; }
    if (amount <= 0) { alert('Veuillez entrer un montant valide.'); return; }
    
    setLoading(true);
    
    // 1. Créer la commande dans Supabase
    const { error } = await supabase.from('orders').insert([{
      user_id: session.user.id,
      buyer_email: session.user.email,
      product_id: 999, // ID fictif pour la recharge
      product_name: "Recharge Binance",
      quantity: 1,
      total_price: amount,
      status: 'pending',
      binance_tx_id: txId.trim()
    }]);

    if (error) {
      alert("Erreur lors de la soumission : " + error.message);
      setLoading(false);
      return;
    }

    // 2. Envoyer l'alerte email à l'admin via FormSubmit
    try {
      await fetch("https://formsubmit.co/ajax/rooseveltmkr@gmail.com", {
        method: "POST",
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          subject: "🚨 Demande de Recharge Binance (AgedGmailYT)",
          email_client: session.user.email,
          montant: amount + " USD",
          tx_id: txId.trim(),
          message: "Connectez-vous à l'admin pour valider cette recharge."
        })
      });
    } catch (err) {
      console.error("Erreur envoi email :", err);
    }

    setLoading(false);
    alert("Demande envoyée ! L'administrateur a été notifié par email et validera votre recharge sous peu.");
    navigate('dashboard');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 font-sans">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Recharger mon Compte via Binance</h2>
      <p className="text-gray-500 mb-10">Envoyez le montant désiré sur notre compte Binance Pay, puis soumettez l'ID de transaction ici. Une alerte email nous sera envoyée instantanément pour accélérer la validation.</p>
      
      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-soft space-y-8">
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">B</div>
          <div>
            <h4 className="font-bold text-yellow-900 mb-1">Notre Pay ID Binance</h4>
            <div className="font-mono text-xl font-black text-yellow-800 mb-2 select-all">123456789</div>
            <p className="text-xs text-yellow-700">Ouvrez votre application Binance, allez dans "Pay", choisissez "Envoyer" et sélectionnez "Pay ID".</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant envoyé (USD) *</label>
            <input type="number" min="1" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none font-bold text-lg" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">ID de Transaction Binance (TX ID) *</label>
            <input type="text" value={txId} onChange={e => setTxId(e.target.value)} placeholder="ex: 123456789012345" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 focus:outline-none font-mono text-sm" />
          </div>
          <button onClick={handleSubmit} disabled={loading} className="w-full bg-gray-900 text-white py-5 rounded-[2rem] font-bold text-lg hover:bg-primary transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-3 disabled:opacity-50">
            {loading ? 'Envoi en cours...' : 'Soumettre ma Recharge'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// PAYMENT VIEW
// ==========================================

const PaymentView = ({ cartTotal, navigate, clearCart, profile, session }) => {
  const [method, setMethod] = useState('balance');
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const canPayWithBalance = (profile?.balance || 0) >= cartTotal;

  const handleCryptomusPayment = async () => {
    if (!session) { navigate('auth'); return; }
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { amount: cartTotal, userId: session.user.id }
      });
      if (error) throw error;
      if (data?.url) { window.location.href = data.url; }
      else { alert('Erreur : impossible de générer le lien. Vérifiez que la Edge Function est déployée.'); }
    } catch (err) {
      alert('Erreur technique : ' + (err.message || 'Edge Function introuvable.'));
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Finaliser la Commande</h2>
          <div className="space-y-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft">
              <h3 className="text-lg font-bold mb-8">1. Sélectionner une Méthode de Paiement</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button onClick={() => setMethod('balance')} className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden ${method === 'balance' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  {method === 'balance' && <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full"><CheckCircle size={14} /></div>}
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary"><Wallet size={20} /></div>
                  <div className="font-bold text-gray-900 mb-1">Solde du Compte</div>
                  <div className="text-xs text-primary font-bold uppercase tracking-wider">Disponible: ${profile?.balance?.toFixed(2) || "0.00"}</div>
                </button>
                <button onClick={() => setMethod('binance')} className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden ${method === 'binance' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  {method === 'binance' && <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full"><CheckCircle size={14} /></div>}
                  <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-white font-bold">B</div>
                  <div className="font-bold text-gray-900 mb-1">Binance Pay</div>
                  <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Paiement Direct</div>
                </button>
                <button onClick={() => setMethod('cryptomus')} className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden ${method === 'cryptomus' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>
                  {method === 'cryptomus' && <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full"><CheckCircle size={14} /></div>}
                  <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mb-4 text-white font-bold text-xs">₿</div>
                  <div className="font-bold text-gray-900 mb-1">Crypto (Automatique)</div>
                  <div className="text-xs text-primary font-bold uppercase tracking-wider">BTC • ETH • USDT • +50</div>
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-soft">
              <h3 className="text-lg font-bold mb-8">2. Validation du Paiement</h3>

              {method === 'balance' && (
                <div className="space-y-6">
                  {canPayWithBalance
                    ? <div className="bg-green-50 p-6 rounded-2xl flex items-center gap-4 text-green-700 font-medium"><CheckCircle /> Votre solde est suffisant.</div>
                    : <div className="bg-red-50 p-6 rounded-2xl flex items-center gap-4 text-red-700 font-medium"><ShieldAlert /> Solde insuffisant. Rechargez via Binance Pay.</div>
                  }
                  <button disabled={!canPayWithBalance}
                    onClick={() => { clearCart(); navigate('dashboard'); alert("Achat réussi !"); }}
                    className={`w-full py-6 rounded-[2rem] font-bold text-xl transition-all shadow-2xl ${canPayWithBalance ? 'bg-primary text-white hover:bg-primaryDark shadow-primary/30' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                    Confirmer le Paiement (${cartTotal.toFixed(2)})
                  </button>
                </div>
              )}

              {method === 'binance' && (
                <BinancePaySection cartTotal={cartTotal} session={session} navigate={navigate} />
              )}

              {method === 'cryptomus' && (
                <div className="space-y-6">
                  <div className="bg-purple-50 p-6 rounded-2xl flex items-center gap-4 text-purple-700 font-medium border border-purple-100">
                    <ShieldCheck size={24} />
                    <div><div className="font-bold">Paiement sécurisé via Cryptomus</div><div className="text-xs text-purple-500 mt-1">Accepte BTC, ETH, USDT, LTC et +50 cryptomonnaies.</div></div>
                  </div>
                  <button onClick={handleCryptomusPayment} disabled={isProcessing}
                    className="w-full py-6 rounded-[2rem] font-bold text-xl transition-all shadow-2xl bg-purple-600 text-white hover:bg-purple-700 shadow-purple-600/30 flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed">
                    {isProcessing ? <><RefreshCcw size={20} className="animate-spin" /> Connexion à Cryptomus...</> : <><ExternalLink size={20} /> Payer ${cartTotal.toFixed(2)} en Crypto</>}
                  </button>
                  <p className="text-xs text-gray-400 text-center">Vous serez redirigé vers la page de paiement Cryptomus.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-fit sticky top-32">
          <div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl">
            <h3 className="text-xl font-bold mb-10 border-b border-white/10 pb-6">Résumé</h3>
            <div className="space-y-6 mb-10 text-sm font-medium text-gray-400">
              <div className="flex justify-between"><span>Sous-total</span><span className="text-white">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Solde Actuel</span><span className="text-primary">${profile?.balance?.toFixed(2) || "0.00"}</span></div>
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
        <div className="bg-gray-50/50 rounded-[3rem] aspect-square flex items-center justify-center border border-gray-100 overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center scale-150 overflow-hidden">
            {product.category.includes('youtube') ? <YouTubeLogo /> : product.category === 'email' ? <GmailLogo /> : product.category === 'facebook' ? <FacebookIcon className="w-24 h-24 text-blue-600" /> : <Share2 size={80} />}
          </div>
          {product.name.includes('US') && product.category === 'email' && <div className="absolute bottom-10 right-10 bg-primary text-white text-xs font-black px-4 py-2 rounded-xl shadow-2xl tracking-tighter">COMPTE US</div>}
        </div>
        <div className="flex flex-col justify-center">
          <nav className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">
            <button onClick={() => navigate('home')} className="hover:text-primary">ACCUEIL</button>
            <span>/</span>
            <span className="text-primary">{CATEGORIES.find(c => c.id === product.category)?.name}</span>
          </nav>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tighter leading-tight">{product.name}</h1>
          <div className="text-4xl font-black text-primary mb-12">${product.price.toFixed(2)}</div>
          <div className="flex items-center gap-6 mb-12">
            <div className="flex items-center bg-gray-100 rounded-full p-2">
              <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-14 h-14 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"><Minus size={20} /></button>
              <div className="w-16 text-center font-black text-xl">{quantity}</div>
              <button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"><Plus size={20} /></button>
            </div>
            <button onClick={() => addToCart(product, quantity)} className="flex-grow bg-gray-900 text-white h-20 rounded-full font-bold text-xl hover:bg-primary transition-all shadow-2xl shadow-black/10 uppercase tracking-widest">Ajouter au Panier</button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3"><Zap size={18} className="text-primary" /><span className="text-xs font-bold text-gray-600">Livraison Instantanée</span></div>
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3"><ShieldCheck size={18} className="text-primary" /><span className="text-xs font-bold text-gray-600">Garantie 3 Jours</span></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-gray-100 pt-20">
        <div className="lg:col-span-2 space-y-16">
          <section>
            <h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><Info size={16} className="text-primary" /> Informations</h3>
            <div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-soft leading-relaxed text-gray-600 space-y-4 font-medium">
              {product.details.info.split(' | ').map((line, i) => (
                <div key={i} className="flex justify-between border-b border-gray-50 pb-3">
                  <span>{line.split(' : ')[0]}</span><span className="text-gray-900 font-bold">{line.split(' : ')[1]}</span>
                </div>
              ))}
            </div>
          </section>
          <section>
            <h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><Clock size={16} className="text-primary" /> À Noter (Important)</h3>
            <div className="bg-primary/5 border border-primary/10 p-10 rounded-[2.5rem] text-primaryDark leading-relaxed font-medium italic">{product.details.note}</div>
          </section>
        </div>
        <div className="space-y-12">
          <section>
            <h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><ShieldAlert size={16} className="text-primary" /> Conditions</h3>
            <div className="text-sm text-gray-500 leading-relaxed space-y-4">{product.details.terms.split('. ').map((t, i) => <p key={i}>• {t}.</p>)}</div>
          </section>
          <section>
            <h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><RefreshCcw size={16} className="text-primary" /> Remboursement</h3>
            <div className="text-sm text-gray-400 leading-relaxed p-6 bg-gray-50 rounded-3xl border border-gray-100">{product.details.refund}</div>
          </section>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CART VIEW
// ==========================================

const CartView = ({ cart, updateCartQuantity, removeFromCart, cartTotal, navigate }) => (
  <div className="max-w-4xl mx-auto py-20 px-6 font-sans">
    <div className="flex items-center justify-between mb-16">
      <h2 className="text-5xl font-bold text-gray-900 tracking-tighter">Votre Panier</h2>
      <button onClick={() => navigate('home')} className="text-sm font-bold text-primary hover:underline uppercase tracking-widest">Continuer les achats</button>
    </div>
    {cart.length === 0 ? (
      <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">Votre panier est vide.</p></div>
    ) : (
      <div className="space-y-6">
        {cart.map((item) => (
          <div key={item.id} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] flex items-center justify-between group shadow-soft">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform relative">
                {item.category.includes('youtube') ? <YouTubeLogo /> : item.category === 'email' ? <GmailLogo /> : item.category === 'facebook' ? <FacebookIcon className="w-10 h-10 text-blue-600" /> : <Share2 size={32} />}
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
          <button onClick={() => navigate('payment')} className="bg-primary text-white px-16 py-6 rounded-full font-bold text-xl hover:bg-primaryDark transition-all shadow-2xl shadow-primary/20">Passer au Paiement</button>
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
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6 font-sans">
      <div className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-soft border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{isLogin ? 'Bon Retour' : 'Bienvenue'}</h2>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">Veuillez entrer vos accès pour continuer.</p>
        <form className="space-y-6">
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label><input type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20" placeholder="name@email.com" /></div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Password</label><input type="password" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20" placeholder="••••••••" /></div>
          <button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-black/10">{isLogin ? 'Se Connecter' : 'S\'inscrire'}</button>
          <button type="button" onClick={async () => { if (!supabase) { alert("Erreur : Supabase non configuré."); return; } const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); if (error) alert("Erreur : " + error.message); }} className="w-full border border-gray-100 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">Google</button>
        </form>
        <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-8 text-center text-sm font-bold text-gray-400 hover:text-primary transition-colors">{isLogin ? "Créer un compte" : "Déjà membre ?"}</button>
      </div>
    </div>
  );
};

// ==========================================
// FOOTER
// ==========================================

const Footer = () => (
  <footer className="bg-gray-50 pt-32 pb-16 px-6 font-sans">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
      <div className="md:col-span-2">
        <div className="font-bold text-2xl mb-6">AgedGmail<span className="text-primary">YT</span></div>
        <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-8">Votre partenaire de confiance pour l'achat de comptes anciens et de services médias sociaux.</p>
      </div>
      <div><h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Navigation</h4><ul className="space-y-4 text-sm text-gray-500 font-medium"><li><button>Catalogue</button></li><li><button>Contact</button></li></ul></div>
      <div><h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Paiement</h4><div className="flex flex-wrap gap-2">{['BTC', 'ETH', 'LTC', 'USDT'].map(c => <span key={c} className="px-3 py-1 bg-white rounded-lg border border-gray-200 text-[10px] font-black">{c}</span>)}</div></div>
    </div>
    <div className="max-w-7xl mx-auto pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">© 2026 AGEDGMAILYT • ALL RIGHTS RESERVED</div>
      <div className="flex gap-4 items-center"><div className="w-2 h-2 bg-primary rounded-full animate-pulse" /><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Système Opérationnel</span></div>
    </div>
  </footer>
);

// ==========================================
// APP COMPONENT
// ==========================================

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [cart, setCart] = useState([]);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else { setProfile(null); setOrders([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) {
      setProfile(data);
      const { data: orderData } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);
    } else {
      setProfile({ id: userId, email: session?.user?.email, display_name: session?.user?.email?.split('@')[0], balance: 0.00 });
      setOrders([]);
    }
  };

  const filteredProducts = PRODUCTS
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => {
      if (priceRange === 'all') return true;
      if (priceRange === 'under5') return p.price < 5;
      if (priceRange === '5-10') return p.price >= 5 && p.price <= 10;
      if (priceRange === '10-50') return p.price > 10 && p.price <= 50;
      if (priceRange === 'over50') return p.price > 50;
      return true;
    })
    .sort((a, b) => a.price - b.price);

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
  const navigate = (v) => { setCurrentView(v); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar cartTotal={cartTotal} navigate={navigate} session={session} profile={profile} />
      <div className="flex-grow">
        {currentView === 'home' && <HomeView activeCategory={activeCategory} setActiveCategory={setActiveCategory} priceRange={priceRange} setPriceRange={setPriceRange} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} />}
        {currentView === 'product' && selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} />}
        {currentView === 'auth' && <AuthView navigate={navigate} />}
        {currentView === 'dashboard' && session && <DashboardView profile={profile} navigate={navigate} orders={orders} />}
        {currentView === 'cart' && <CartView cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} cartTotal={cartTotal} navigate={navigate} />}
        {currentView === 'payment' && <PaymentView cartTotal={cartTotal} navigate={navigate} clearCart={clearCart} profile={profile} session={session} />}
        {currentView === 'recharge' && session && <RechargeView profile={profile} session={session} navigate={navigate} />}
        {currentView === 'admin' && session && session.user.email === ADMIN_EMAIL && <AdminView navigate={navigate} />}
      </div>
      <SupportChat />
      <Footer />
    </div>
  );
}

export default App;