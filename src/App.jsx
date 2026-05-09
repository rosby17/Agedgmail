import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown } from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// COMPOSANTS LOGOS (IMG)
// ==========================================

const YouTubeLogo = ({ className = "" }) => (
  <img 
    src="/youtube-logo.png" 
    alt="YouTube" 
    className={`w-full h-full object-contain scale-125 ${className}`}
  />
);

const GmailLogo = ({ className = "" }) => (
  <img 
    src="/gmail-logo.png" 
    alt="Gmail" 
    className={`w-full h-full object-contain scale-125 ${className}`}
  />
);

// ==========================================
// MOCK DATA: CATALOGUE PRODUITS
// ==========================================

const CATEGORIES = [
  { id: 'all', name: 'Tous les produits' },
  { id: 'youtube_monetized', name: 'Chaînes Monétisées' },
  { id: 'youtube_not_monetized', name: 'Chaînes Non-Monétisées' },
  { id: 'email', name: 'Email (Gmail)' },
  { id: 'youtube_aged', name: 'Chaînes Youtube Anciennes' },
  { id: 'youtube_cpa', name: 'Chaînes Spéciales CPA' },
  { id: 'social', name: 'Facebook / Twitter / Insta' },
];

const PRICE_RANGES = [
  { id: 'all', name: 'Tous les prix' },
  { id: 'under10', name: 'Moins de 10$' },
  { id: '10-50', name: '10$ - 50$' },
  { id: 'over50', name: 'Plus de 50$' },
];

const getProductDetails = (product) => {
  const commonTerms = "Veuillez lire les spécifications avant d'acheter. Vous êtes responsable de toutes les actions sur le compte. Utilisez des IP résidentielles fraîches. Changez les accès après 48h seulement.";
  const isMonetized = product.category === 'youtube_monetized';
  
  return {
    info: product.category === 'email' 
      ? "Âge : 2017 - 2023 | Pays : US | Format : Gmail/Pass/Récup" 
      : `Année : ${product.name.match(/\d{4}/)?.[0] || 'Ancien'} | Statut : ${isMonetized ? '✅ Monétisée' : '❌ Non-Monétisée'} | Contenu : Propre`,
    note: product.category.includes('youtube')
      ? `Parfait pour le business YT. ${isMonetized ? 'Générez des revenus dès le premier upload.' : 'Éligible pour une future monétisation.'} Privilégiez les proxys résidentiels.`
      : "Gmail aléatoire. Connexion via 'Email de récupération'.",
    terms: commonTerms,
    refund: "Garantie de 3 jours jusqu'à la connexion. Remplacement si le compte est banni avant l'accès."
  };
};

const PRODUCTS = [
  // --- NOUVELLES CATEGORIES ---
  { id: 101, name: 'Chaîne YouTube Monétisée – 1.2k Subs – 4000h – 2018', category: 'youtube_monetized', price: 185.00 },
  { id: 102, name: 'Chaîne YouTube Monétisée – Créneau Gaming – 2k Subs – 2020', category: 'youtube_monetized', price: 210.00 },
  { id: 103, name: 'Chaîne YouTube Monétisée – 5k Subs – Sans Strike – 2016', category: 'youtube_monetized', price: 350.00 },
  
  { id: 201, name: 'Chaîne YouTube 2016 – 0 Vidéos – Éligible Monétisation', category: 'youtube_not_monetized', price: 12.50 },
  { id: 202, name: 'Chaîne YouTube 2019 – 500 Subs – Prête à l\'emploi', category: 'youtube_not_monetized', price: 15.00 },
  { id: 203, name: 'Chaîne YouTube 2011 – Éligible Monétisation – 100% Propre', category: 'youtube_not_monetized', price: 25.00 },

  // --- ANCIENNES CATEGORIES ---
  { id: 1, name: 'Chaîne Youtube 2014 – 2019 sans vidéo', category: 'youtube_aged', price: 6.19 },
  { id: 2, name: 'Chaîne Youtube 2022 – 2025 sans vidéo', category: 'youtube_aged', price: 5.49 },
  { id: 3, name: 'Chaîne Youtube 2018 – 2021 sans vidéo', category: 'youtube_aged', price: 5.99 },
  { id: 8, name: 'Chaîne Spéciale 2011-202x avec 10k à 50k vues ORGANIQUES', category: 'youtube_cpa', price: 19.80 },
  { id: 13, name: 'Chaîne Spéciale 2011-202x avec 1M+ vues ORGANIQUES', category: 'youtube_cpa', price: 296.88 },
  { id: 19, name: 'Gmail US Ancien 2010 – 2025', category: 'email', price: 1.43 },
  { id: 20, name: 'Gmail Pays Aléatoire Ancien 2020 – 2025', category: 'email', price: 1.00 },
  { id: 21, name: 'Compte Discord Ancien 2017-2019', category: 'social', price: 25.00 },
  { id: 22, name: 'Instagram 2010 – 2024 | FARM | 400 – 1K Abonnés', category: 'social', price: 30.00 },
  { id: 23, name: 'Twitter (X) Pays Aléatoire (2007 – 2020)', category: 'social', price: 40.00 },
  { id: 24, name: 'Facebook US Ancien (30+ Amis)', category: 'social', price: 35.00 },
].map(p => ({ ...p, details: getProductDetails(p) }));

// ==========================================
// COMPOSANTS DE STRUCTURE
// ==========================================

const ProductCard = ({ product, addToCart, navigate, setSelectedProduct }) => {
  const [localQty, setLocalQty] = useState(1);
  return (
    <div className="bg-white group">
      <div className="aspect-[16/10] bg-gray-50/50 rounded-[2rem] flex items-center justify-center mb-6 overflow-hidden border border-gray-100 group-hover:border-primary/30 transition-all duration-500 relative cursor-pointer" onClick={() => { setSelectedProduct(product); navigate('product'); }}>
        <div className="w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700 overflow-hidden">
          {product.category.includes('youtube') ? <YouTubeLogo /> : product.category === 'email' ? <GmailLogo /> : <Share2 size={50} className="text-gray-300" />}
        </div>
      </div>
      <div className="space-y-4 px-2">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{CATEGORIES.find(c => c.id === product.category)?.name}</div>
          <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-primary transition-colors cursor-pointer" onClick={() => { setSelectedProduct(product); navigate('product'); }}>{product.name}</h3>
        </div>
        <div className="text-xl font-black text-gray-900 font-mono">${product.price.toFixed(2)}</div>
        <div className="flex items-center gap-3 pt-2">
          <div className="flex items-center bg-gray-100 rounded-xl p-1 shrink-0">
            <button onClick={() => localQty > 1 && setLocalQty(localQty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Minus size={14} /></button>
            <div className="w-8 text-center text-xs font-bold">{localQty}</div>
            <button onClick={() => setLocalQty(localQty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-all"><Plus size={14} /></button>
          </div>
          <button onClick={() => addToCart(product, localQty)} className="flex-grow bg-gray-900 text-white h-10 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-primary transition-all shadow-lg shadow-black/5">Ajouter</button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// VUES PRINCIPALES
// ==========================================

const HomeView = ({ activeCategory, setActiveCategory, priceRange, setPriceRange, filteredProducts, addToCart, navigate, setSelectedProduct }) => {
  return (
    <>
      <section className="bg-[#FCFCFD] pt-20 pb-24 overflow-hidden relative border-b border-gray-100 font-sans">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#E6F8F0] text-primaryDark px-3 py-1.5 rounded-full text-sm font-bold mb-6">🔥 N°1 des Comptes Anciens</div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A202C] leading-[1.1] tracking-tight mb-6">Donnez un coup d'accélérateur à votre <span className="text-primary">Business YT automation</span></h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">Nous fournissons les meilleurs comptes Gmail vieillis et d'anciennes chaînes YouTube pour booster votre présence. Accès instantané et paiement sécurisé en Crypto.</p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <button onClick={() => { const el = document.getElementById('catalog'); if(el) el.scrollIntoView({behavior: 'smooth'}); }} className="bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primaryDark transition-all shadow-xl shadow-primary/20">Voir le catalogue</button>
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium"><span>Paiement 100% Crypto</span><div className="flex gap-1"><div className="w-6 h-6 bg-[#F7931A] rounded-full flex items-center justify-center text-white text-[10px] font-bold">₿</div><div className="w-6 h-6 bg-[#627EEA] rounded-full flex items-center justify-center text-white text-[10px] font-bold">Ξ</div></div></div>
            </div>
          </div>
          <div className="relative h-[500px] hidden lg:block">
            <div className="absolute top-[10%] right-[10%] bg-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-float-slow z-30 border border-gray-50 overflow-hidden"><div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden"><YouTubeLogo /></div><div><div className="text-sm font-black text-gray-900">YouTube 2014</div><div className="text-primary font-bold">$6.19</div></div></div>
            <div className="absolute top-[45%] left-[5%] bg-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-float-medium z-20 border border-gray-50 overflow-hidden"><div className="w-14 h-14 bg-gray-50 rounded-2xl overflow-hidden"><GmailLogo /></div><div><div className="text-sm font-black text-gray-900">Gmail US 2010</div><div className="text-primary font-bold">$1.43</div></div></div>
            <div className="absolute bottom-[10%] right-[20%] bg-white p-6 rounded-[2rem] shadow-2xl flex items-center gap-4 animate-float-fast z-10 border border-gray-50"><div className="w-14 h-14 flex items-center justify-center bg-gray-50 rounded-2xl"><Zap size={24} className="text-yellow-400" /></div><div><div className="text-sm font-black text-gray-900">Instantané</div><div className="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Livraison</div></div></div>
          </div>
        </div>
      </section>

      <main id="catalog" className="max-w-7xl mx-auto px-6 py-20 flex flex-col lg:flex-row gap-12">
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="sticky top-32 space-y-12">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Catégories</h3>
              <ul className="space-y-2">
                {CATEGORIES.map(cat => (
                  <li key={cat.id}>
                    <button onClick={() => setActiveCategory(cat.id)} className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${activeCategory === cat.id ? 'bg-gray-900 text-white shadow-xl' : 'hover:bg-gray-100 text-gray-600'}`}>{cat.name}</button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Filtrer par Prix</h3>
              <ul className="space-y-2">
                {PRICE_RANGES.map(range => (
                  <li key={range.id}>
                    <button onClick={() => setPriceRange(range.id)} className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${priceRange === range.id ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'hover:bg-gray-100 text-gray-600'}`}>{range.name}</button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-10">
            <div className="text-sm text-gray-400 font-medium">{filteredProducts.length} produits trouvés</div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                addToCart={addToCart} 
                navigate={navigate} 
                setSelectedProduct={setSelectedProduct} 
              />
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

// ==========================================
// AUTRES COMPOSANTS
// ==========================================

const Navbar = ({ cartTotal, navigate, session }) => (
  <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
    <div className="bg-dark text-white text-[10px] py-1.5 px-6 flex justify-between items-center font-medium tracking-wide uppercase">
      <div className="flex gap-6"><button onClick={() => navigate('home')}>Accueil</button><button>Services</button><button>FAQ</button><button>Contact</button></div>
      <div className="hidden md:block">Livraison Instantanée • Support 24/7</div>
    </div>
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
      <button onClick={() => navigate('home')} className="font-bold text-2xl tracking-tight">AgedGmail<span className="text-primary">YT</span></button>
      <div className="flex items-center gap-6">
        {session ? <button onClick={() => supabase.auth.signOut()} className="text-sm font-bold text-gray-700 hover:text-red-500 flex items-center gap-2"><LogOut size={18} /></button> : <button onClick={() => navigate('auth')} className="text-sm font-bold text-gray-700 hover:text-primary flex items-center gap-2 uppercase tracking-wider text-[11px]"><User size={18} /> Connexion</button>}
        <button onClick={() => navigate('cart')} className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 hover:bg-black transition-all shadow-lg shadow-black/10"><ShoppingCart size={18} /><span className="border-l border-white/20 pl-3">PANIER / ${cartTotal.toFixed(2)}</span></button>
      </div>
    </div>
  </header>
);

const ProductView = ({ product, addToCart, navigate }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 mb-32">
        <div className="bg-gray-50/50 rounded-[3rem] aspect-square flex items-center justify-center border border-gray-100 overflow-hidden"><div className="w-full h-full flex items-center justify-center scale-150 overflow-hidden">{product.category.includes('youtube') ? <YouTubeLogo /> : product.category === 'email' ? <GmailLogo /> : <Share2 size={80} />}</div></div>
        <div className="flex flex-col justify-center">
          <nav className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6"><button onClick={() => navigate('home')} className="hover:text-primary">ACCUEIL</button><span>/</span><span className="text-primary">{CATEGORIES.find(c => c.id === product.category)?.name}</span></nav>
          <h1 className="text-5xl font-bold text-gray-900 mb-6 tracking-tighter leading-tight">{product.name}</h1>
          <div className="text-4xl font-black text-primary mb-12">${product.price.toFixed(2)}</div>
          <div className="flex items-center gap-6 mb-12">
            <div className="flex items-center bg-gray-100 rounded-full p-2"><button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-14 h-14 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"><Minus size={20} /></button><div className="w-16 text-center font-black text-xl">{quantity}</div><button onClick={() => setQuantity(quantity + 1)} className="w-14 h-14 flex items-center justify-center hover:bg-white rounded-full transition-all shadow-sm"><Plus size={20} /></button></div>
            <button onClick={() => addToCart(product, quantity)} className="flex-grow bg-gray-900 text-white h-20 rounded-full font-bold text-xl hover:bg-primary transition-all shadow-2xl shadow-black/10 uppercase tracking-widest">Ajouter au Panier</button>
          </div>
          <div className="grid grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3"><Zap size={18} className="text-primary" /><span className="text-xs font-bold text-gray-600">Livraison Instantanée</span></div><div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3"><ShieldCheck size={18} className="text-primary" /><span className="text-xs font-bold text-gray-600">Garantie 3 Jours</span></div></div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 border-t border-gray-100 pt-20">
        <div className="lg:col-span-2 space-y-16">
          <section><h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><Info size={16} className="text-primary"/> Informations</h3><div className="bg-white border border-gray-100 p-10 rounded-[2.5rem] shadow-soft leading-relaxed text-gray-600 space-y-4 font-medium">{product.details.info.split(' | ').map((line, i) => <div key={i} className="flex justify-between border-b border-gray-50 pb-3"><span>{line.split(' : ')[0]}</span><span className="text-gray-900 font-bold">{line.split(' : ')[1]}</span></div>)}</div></section>
          <section><h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><Clock size={16} className="text-primary"/> À Noter (Important)</h3><div className="bg-primary/5 border border-primary/10 p-10 rounded-[2.5rem] text-primaryDark leading-relaxed font-medium italic">{product.details.note}</div></section>
        </div>
        <div className="space-y-12">
          <section><h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><ShieldAlert size={16} className="text-primary"/> Conditions</h3><div className="text-sm text-gray-500 leading-relaxed space-y-4">{product.details.terms.split('. ').map((t, i) => <p key={i}>• {t}.</p>)}</div></section>
          <section><h3 className="flex items-center gap-3 text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-8"><RefreshCcw size={16} className="text-primary"/> Remboursement</h3><div className="text-sm text-gray-400 leading-relaxed p-6 bg-gray-50 rounded-3xl border border-gray-100">{product.details.refund}</div></section>
        </div>
      </div>
    </div>
  );
};

const CartView = ({ cart, updateCartQuantity, removeFromCart, cartTotal, navigate }) => (
  <div className="max-w-4xl mx-auto py-20 px-6 font-sans">
    <div className="flex items-center justify-between mb-16"><h2 className="text-5xl font-bold text-gray-900 tracking-tighter">Votre Panier</h2><button onClick={() => navigate('home')} className="text-sm font-bold text-primary hover:underline uppercase tracking-widest">Continuer les achats</button></div>
    {cart.length === 0 ? <div className="text-center py-20 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200"><p className="text-gray-400 font-bold">Votre panier est vide.</p></div> : <div className="space-y-6">
      {cart.map((item) => <div key={item.id} className="bg-white border border-gray-100 p-8 rounded-[2.5rem] flex items-center justify-between group shadow-soft"><div className="flex items-center gap-8"><div className="w-20 h-20 bg-gray-50 rounded-[1.5rem] flex items-center justify-center group-hover:scale-110 transition-transform">{item.category.includes('youtube') ? <YouTubeLogo /> : item.category === 'email' ? <GmailLogo /> : <Share2 size={32} />}</div><div><h4 className="font-bold text-gray-900 mb-1">{item.name}</h4><p className="text-primary font-bold">${item.price.toFixed(2)}</p></div></div><div className="flex items-center gap-10"><div className="flex items-center bg-gray-100 rounded-full p-1.5"><button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all"><Minus size={14} /></button><div className="w-10 text-center font-bold">{item.quantity}</div><button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-full transition-all"><Plus size={14} /></button></div><button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={22} /></button></div></div>)}
      <div className="pt-10 flex flex-col items-end"><div className="text-4xl font-bold text-gray-900 mb-8 tracking-tighter">Total: ${cartTotal.toFixed(2)}</div><button onClick={() => navigate('payment')} className="bg-primary text-white px-16 py-6 rounded-full font-bold text-xl hover:bg-primaryDark transition-all shadow-2xl shadow-primary/20">Passer au Paiement</button></div>
    </div>}
  </div>
);

const PaymentView = ({ cartTotal, navigate, clearCart }) => {
  const [method, setMethod] = useState('binance');
  const [copied, setCopied] = useState(false);
  const binanceId = "38066101";
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Finaliser la Commande</h2>
          <div className="space-y-8">
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft"><h3 className="text-lg font-bold mb-8">1. Sélectionner une Méthode de Paiement</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><button onClick={() => setMethod('binance')} className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden ${method === 'binance' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>{method === 'binance' && <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full"><CheckCircle size={14} /></div>}<div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center mb-4 text-white font-bold">B</div><div className="font-bold text-gray-900 mb-1">Binance Pay</div><div className="text-xs text-primary font-bold uppercase tracking-wider">Recommandé (Zéro Frais)</div></button><button onClick={() => setMethod('classic')} className={`p-6 rounded-[2rem] border-2 transition-all text-left relative overflow-hidden ${method === 'classic' ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-gray-200'}`}>{method === 'classic' && <div className="absolute top-4 right-4 bg-primary text-white p-1 rounded-full"><CheckCircle size={14} /></div>}<div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-4 text-white"><Wallet size={20} /></div><div className="font-bold text-gray-900 mb-1">Crypto Classique</div><div className="text-xs text-gray-400 font-bold uppercase tracking-wider">BTC, LTC, DOGE, USDT...</div></button></div></div>
            <div className="bg-white border border-gray-100 rounded-[2.5rem] p-10 shadow-soft"><h3 className="text-lg font-bold mb-8">2. Instructions de Paiement</h3>{method === 'binance' ? <div className="space-y-8"><div className="bg-gray-50 p-8 rounded-[2rem] text-center border border-gray-100"><div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">ID Binance du destinataire</div><div className="flex items-center justify-center gap-4 mb-4"><span className="text-4xl font-mono font-bold text-gray-900">{binanceId}</span><button onClick={() => { navigator.clipboard.writeText(binanceId); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="p-3 bg-white rounded-xl shadow-soft hover:bg-gray-50 transition-all">{copied ? <CheckCircle size={20} className="text-green-500" /> : <Copy size={20} />}</button></div><div className="text-sm font-bold text-primary">Pseudo : CLIVERS237</div></div><ol className="space-y-4 text-sm text-gray-600 list-decimal list-inside leading-relaxed font-medium"><li>Ouvrez l'application Binance &gt; Portefeuille &gt; Pay</li><li>Utilisez l'ID ci-dessus pour envoyer le montant exact.</li><li>Envoyez la preuve de paiement à notre support.</li></ol></div> : <div className="text-center py-12"><div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-500"><ExternalLink size={40} /></div><p className="text-gray-500 mb-8 max-w-sm mx-auto">Vous allez être redirigé vers notre plateforme sécurisée **CoinPayments** pour finaliser votre transaction.</p><a href="https://www.coinpayments.net" target="_blank" className="inline-flex items-center gap-3 bg-blue-600 text-white px-10 py-5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">Procéder via CoinPayments</a></div>}</div>
            <button onClick={() => { clearCart(); navigate('home'); alert("Commande enregistrée !"); }} className="w-full bg-primary text-white py-6 rounded-[2rem] font-bold text-xl hover:bg-primaryDark transition-all shadow-2xl shadow-primary/30">J'ai complété le paiement</button>
          </div>
        </div>
        <div className="h-fit sticky top-32"><div className="bg-gray-900 text-white p-10 rounded-[3rem] shadow-2xl"><h3 className="text-xl font-bold mb-10 border-b border-white/10 pb-6">Votre Panier</h3><div className="space-y-6 mb-10 text-sm font-medium text-gray-400"><div className="flex justify-between"><span>Sous-total</span><span className="text-white">${cartTotal.toFixed(2)}</span></div><div className="flex justify-between"><span>Frais Réseau</span><span className="text-primary">GRATUIT</span></div></div><div className="flex justify-between text-3xl font-bold mb-4"><span>Total</span><span>${cartTotal.toFixed(2)}</span></div><div className="text-[10px] text-gray-500 uppercase tracking-widest font-black">Sécurisé par Chiffrement SSL</div></div></div>
      </div>
    </div>
  );
};

const AuthView = ({ navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md bg-white p-12 rounded-[3rem] shadow-soft border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">{isLogin ? 'Bon Retour' : 'Bienvenue'}</h2>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">Veuillez entrer vos accès pour continuer sur la plateforme.</p>
        <form className="space-y-6">
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label><input type="email" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20" placeholder="name@email.com" /></div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Password</label><input type="password" className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20" placeholder="••••••••" /></div>
          <button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-black/10">{isLogin ? 'Se Connecter' : 'S\'inscrire'}</button>
          <button type="button" onClick={async () => { if (!supabase) { alert("Erreur : La connexion à la base de données n'est pas configurée."); return; } const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } }); if (error) alert("Erreur : " + error.message); }} className="w-full border border-gray-100 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all">Google</button>
        </form>
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-8 text-center text-sm font-bold text-gray-400 hover:text-primary transition-colors">{isLogin ? "Créer un compte" : "Déjà membre ?"}</button>
      </div>
    </div>
  );
};

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [cart, setCart] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const filteredProducts = PRODUCTS
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => {
      if (priceRange === 'all') return true;
      if (priceRange === 'under10') return p.price < 10;
      if (priceRange === '10-50') return p.price >= 10 && p.price <= 50;
      if (priceRange === 'over50') return p.price > 50;
      return true;
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
  const navigate = (v) => { setCurrentView(v); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar cartTotal={cartTotal} navigate={navigate} session={session} />
      <div className="flex-grow">
        {currentView === 'home' && <HomeView activeCategory={activeCategory} setActiveCategory={setActiveCategory} priceRange={priceRange} setPriceRange={setPriceRange} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} />}
        {currentView === 'product' && selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} />}
        {currentView === 'auth' && <AuthView navigate={navigate} />}
        {currentView === 'cart' && <CartView cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} cartTotal={cartTotal} navigate={navigate} />}
        {currentView === 'payment' && <PaymentView cartTotal={cartTotal} navigate={navigate} clearCart={clearCart} />}
      </div>
      <Footer />
    </div>
  );
}

const Footer = () => (
  <footer className="bg-gray-50 pt-32 pb-16 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
      <div className="md:col-span-2">
        <div className="font-bold text-2xl mb-6">AgedGmail<span className="text-primary">YT</span></div>
        <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-8">Votre partenaire de confiance pour l'achat de comptes anciens et de services médias sociaux.</p>
      </div>
      <div><h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Navigation</h4><ul className="space-y-4 text-sm text-gray-500 font-medium"><li><button onClick={() => window.scrollTo({top: 0})}>Catalogue</button></li><li><button>Contact</button></li></ul></div>
      <div><h4 className="font-bold text-gray-900 mb-6 uppercase tracking-widest text-[10px]">Paiement</h4><div className="flex flex-wrap gap-2">{['BTC', 'ETH', 'LTC', 'USDT'].map(c => <span key={c} className="px-3 py-1 bg-white rounded-lg border border-gray-200 text-[10px] font-black">{c}</span>)}</div></div>
    </div>
    <div className="max-w-7xl mx-auto pt-10 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">© 2026 AGEDGMAILYT • ALL RIGHTS RESERVED</div>
      <div className="flex gap-4 items-center"><div className="w-2 h-2 bg-primary rounded-full animate-pulse" /><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Système Opérationnel</span></div>
    </div>
  </footer>
);

export default App;
