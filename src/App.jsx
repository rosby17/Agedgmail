import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, Package, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit } from 'lucide-react';
import { supabase } from './supabaseClient';
import { PRODUCTS as PRODUCTS_RAW } from './productsData';
import * as XLSX from 'xlsx';

// ==========================================
// CONFIGURATION ADMIN & SUPPORT
// ==========================================
const ADMIN_EMAIL = "rooseveltmkr@gmail.com";
const SUPPORT_WHATSAPP = "237655306425";

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
  const isUS = product.name.toUpperCase().includes('US') || product.name.toUpperCase().includes('USA');

  return (
    <div className="bg-white flex flex-col h-full font-sans">
      {/* Logo Area */}
      <div 
        className="aspect-[1.5] bg-white border border-gray-100 rounded-[2.5rem] flex items-center justify-center mb-5 overflow-hidden cursor-pointer relative shrink-0"
        onClick={() => { setSelectedProduct(product); navigate('product'); }}
      >
        <div className="w-full h-full p-8 flex items-center justify-center">
          {product.category.includes('youtube') ? <YouTubeLogo /> : product.category === 'email' ? <GmailLogo /> : <FacebookIcon className="w-16 h-16 text-blue-600" />}
        </div>
        {isUS && product.category === 'email' && (
          <div className="absolute bottom-4 right-4 bg-primary text-white text-[10px] font-black px-2 py-1 rounded-md shadow-sm">US</div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          {CATEGORIES.find(c => c.id === product.category)?.name}
        </div>
        <h3 
          className="text-[15px] font-bold text-primary leading-snug cursor-pointer mb-4"
          onClick={() => { setSelectedProduct(product); navigate('product'); }}
        >
          {product.name}
        </h3>

        
        <div className="flex items-center justify-between mb-6">
          <div className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</div>
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
          onClick={() => addToCart(product, localQty)} 
          disabled={product.stock <= 0}
          className={`flex-grow h-12 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${product.stock > 0 ? 'bg-gray-900 text-white hover:bg-primary' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
        >
          {product.stock > 0 ? 'Ajouter' : 'Épuisé'}
        </button>
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
      <button onClick={() => navigate('home')} className="h-12 flex items-center group transition-all">
        <img src="/logo.png" alt="AgedGmailYT" className="h-full object-contain group-hover:scale-105 transition-transform duration-300" />
      </button>
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
          <div className="inline-flex items-center gap-2 bg-[#E6F8F0] text-primaryDark px-3 py-1.5 rounded-full text-sm font-bold mb-6"><TrendingUp size={14} /> N°1 des Comptes Anciens</div>
          <h1 className="text-5xl md:text-6xl font-bold text-[#1A202C] leading-[1.1] tracking-tight mb-6">Donnez un coup d'accélérateur à votre <span className="text-primary">Business YT automation</span></h1>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">Nous fournissons les meilleurs comptes Gmail vieillis et d'anciennes chaînes YouTube pour booster votre présence.</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primaryDark transition-all shadow-xl shadow-primary/20">Voir le catalogue</button>
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <span>Paiement 100% Crypto</span>
              <div className="flex gap-1">
                <div className="w-6 h-6 bg-[#F7931A] rounded-full flex items-center justify-center text-white text-[10px] font-bold">B</div>
                <div className="w-6 h-6 bg-[#627EEA] rounded-full flex items-center justify-center text-white text-[10px] font-bold">E</div>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-gray-100 pb-10">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Catalogue Officiel</h2>
            <div className="text-sm text-gray-400 font-bold uppercase tracking-widest">{filteredProducts.length} produits disponibles</div>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un compte..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 text-sm focus:ring-2 focus:ring-primary/20 outline-none shadow-sm transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} />))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Search size={30} className="text-gray-300" /></div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Aucun produit trouvé</h3>
              <p className="text-gray-400 text-sm">Essayez de modifier votre recherche ou de changer de catégorie.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  </>
);

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
          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-gray-900 p-8 text-white flex justify-between items-center">
              <div><h3 className="text-xl font-bold">{viewOrder.product_name}</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Vos identifiants de connexion</p></div>
              <button onClick={() => setViewOrder(null)} className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><X size={20} /></button>
            </div>
            <div className="p-10 space-y-8">
              <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Info size={12} className="text-primary" /> Format : Email | Password | Recovery | 2FA
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {(viewOrder.data || viewOrder.credentials || "En attente de livraison...")
                    .split('\n')
                    .filter(line => line.trim())
                    .map((line, idx) => (
                      <div key={idx} className="font-mono text-xs bg-white p-4 rounded-xl border border-gray-100 flex justify-between items-center group hover:border-primary/30 transition-all">
                        <span className="truncate mr-4 text-gray-700">{line.trim()}</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(line.trim()); }} 
                          className="p-2 text-gray-300 hover:text-primary hover:bg-primary/5 rounded-lg transition-all" 
                          title="Copier"
                        >
                          <Copy size={14} />
                        </button>
                      </div>
                    ))
                  }
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
// ORDERS ADMIN — Composant gestion commandes
// ==========================================

const OrdersAdmin = ({ allOrders, fetchAllOrders }) => {
  const [filter, setFilter] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [credentials, setCredentials] = useState('');
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
      // 1. Fetch current profile to get balance
      let currentBalance = 0;
      const { data: userData, error: userError } = await supabase.from('profiles').select('balance').eq('id', selectedOrder.user_id).maybeSingle();
      
      if (userError) {
        console.error("Erreur profile:", userError);
      } else if (userData) {
        currentBalance = userData.balance || 0;
      }

      // 2. Upsert profile with new balance
      const newBalance = currentBalance + (selectedOrder.total_price || 0);
      const { error: balanceError } = await supabase.from('profiles').upsert({ 
        id: selectedOrder.user_id, 
        email: selectedOrder.buyer_email,
        balance: newBalance 
      });
      
      if (balanceError) {
        setErrorMessage("Erreur lors de la mise à jour du solde : " + balanceError.message);
        setActionLoading(false);
        return;
      }

      // 3. Mark order as confirmed
      await supabase.from('orders').update({
        status: 'confirmed',
        admin_note: adminNote.trim() || null,
        confirmed_at: new Date().toISOString(),
      }).eq('id', selectedOrder.id);

      setActionSuccess(true);

    } else {
      // Standard product delivery
      if (!credentials.trim()) { 
        setErrorMessage('Entre les credentials !'); 
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

    if (selectedOrder.product_name !== "Recharge Binance") {
      setActionSuccess(true);
    }

    setTimeout(() => {
      setSelectedOrder(null);
      setCredentials('');
      setAdminNote('');
      fetchAllOrders();
      setActionLoading(false);
      setActionSuccess(false);
    }, 1500);
  };

  const cancelOrder = async (id) => {
    await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
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
                {errorMessage && (
                  <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                    <AlertTriangle size={14} /> {errorMessage}
                  </div>
                )}
                <button onClick={confirmOrder} disabled={actionLoading || actionSuccess}
                  className={`w-full py-5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${actionSuccess ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-primary'}`}>
                  {actionLoading ? <><RefreshCcw size={16} className="animate-spin" /> Confirmation...</> : actionSuccess ? <><CheckCircle size={16} /> Action effectuée !</> : (selectedOrder.product_name === "Recharge Binance" ? <><CheckCircle size={16} /> Valider et Créditer le Solde</> : <><CheckCircle size={16} /> Confirmer et enregistrer</>)}
                </button>
            </>) : (
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{selectedOrder.product_name === "Recharge Binance" ? "Statut" : "Credentials livrés"}</label>
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 font-mono text-sm text-green-800 whitespace-pre-wrap flex items-center gap-2">
                  <CheckCircle size={16} /> {selectedOrder.product_name === "Recharge Binance" ? "Solde crédité avec succès." : (selectedOrder.credentials || selectedOrder.data || '—')}
                </div>
                {selectedOrder.admin_note && <p className="text-gray-400 text-xs mt-2 flex items-center gap-2"><FileText size={12} /> {selectedOrder.admin_note}</p>}
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

const AdminView = ({ 
  navigate, products, fetchProducts, allOrders, fetchAllOrders, allUsers, fetchUsers, 
  actionStatus, setActionStatus, editingProduct, setEditingProduct, productForm, 
  setProductForm, handleSaveProduct, handleDeleteProduct, handleDeleteAllProducts, handleExcelProductImport, handleExportExcel, adminSearch, setAdminSearch, 
  adminPage, setAdminPage 
}) => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('agedgmail_admin_tab') || "dashboard");

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
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center mb-4"><DollarSign size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenu Total</div><div className="text-3xl font-black text-gray-900">${allOrders.reduce((s,o) => s + (o.total_price || 0), 0).toFixed(2)}</div></div>
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Produits en Ligne</div><div className="text-3xl font-black text-gray-900">{products.length}</div></div>
                <div className="bg-white border border-gray-100 p-8 rounded-[2.5rem] shadow-soft"><div className="w-10 h-10 bg-yellow-50 text-yellow-600 rounded-xl flex items-center justify-center mb-4"><AlertTriangle size={20} /></div><div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock Total</div><div className="text-3xl font-black text-gray-900">{products.reduce((s,p) => s + (p.stock || 0), 0)}</div></div>
              </div>
              <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
                <h3 className="text-lg font-bold mb-8">Statistiques de Vente</h3>
                <p className="text-gray-400 text-sm italic">Les ventes sont gérées manuellement. Une fois le paiement reçu, livrez le client par email.</p>
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
                          <input type="text" value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20" placeholder="ex: Gmail Aged 2018" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Catégorie</label>
                          <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-bold">
                            {CATEGORIES.filter(c => c.id !== "all").map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>



                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Prix ($)</label>
                            <input type="number" value={productForm.price} onChange={e => setProductForm({...productForm, price: parseFloat(e.target.value)})} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                          </div>
                          <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Quantité en Stock</label>
                            <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})} className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 font-mono" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
                          <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows="6" className="w-full px-5 py-3 rounded-xl bg-white border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Détails du produit..." />
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
                                {p.category.includes('youtube') ? <YouTubeLogo /> : p.category === 'email' ? <GmailLogo /> : <FacebookIcon className="text-blue-600" />}
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
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setEditingProduct(p); setProductForm(p); }} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"><Edit size={16} /></button>
                              <button onClick={() => handleDeleteProduct(p.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"><Trash size={16} /></button>
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

          {activeTab === 'orders' && (
            <OrdersAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} />
          )}

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

const RechargeView = ({ profile, session, navigate }) => {
  const [amount, setAmount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const noteValue = profile?.display_name?.toLowerCase() || session?.user?.email?.split('@')[0];

  const handleSubmit = async () => {
    if (!session) { navigate('auth'); return; }
    if (amount <= 0) { setError('Veuillez entrer un montant valide.'); return; }
    
    setLoading(true);
    setError("");
    
    try {
      // 1. Créer la commande de recharge
      const { error: orderErr } = await supabase.from('orders').insert([{
        user_id: session.user.id,
        buyer_email: session.user.email,
        product_id: 999,
        product_name: "Recharge Binance",
        quantity: 1,
        total_price: amount,
        status: 'pending',
        binance_tx_id: `RECHARGE:${noteValue}`
      }]);

      if (orderErr) throw orderErr;

      // 2. Alerte Admin
      await fetch("https://formsubmit.co/ajax/rooseveltmkr@gmail.com", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: "🚨 Demande de Recharge Binance (AgedGmailYT)",
          username: noteValue,
          montant: amount + " USD",
          note: noteValue,
          message: "Vérifiez le transfert Binance avec la note indiquée."
        })
      });

      setSuccess(true);
      setTimeout(() => navigate('dashboard'), 3000);
    } catch (err) {
      setError("Erreur : " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => navigator.clipboard.writeText(text);

  return (
    <div className="max-w-3xl mx-auto px-6 py-20 font-sans">
      <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">Recharger via Binance Pay</h2>
      <p className="text-gray-500 mb-10 leading-relaxed">Suivez les étapes ci-dessous pour créditer votre compte. L'utilisation de la **Note** est indispensable pour l'attribution automatique des fonds.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft space-y-6">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4">1. Infos de Transfert</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center group">
              <span className="text-xs font-bold text-gray-500">ID Binance :</span>
              <div className="flex items-center gap-3">
                <span className="font-mono font-black text-gray-900">160684871</span>
                <button onClick={() => copyToClipboard('160684871')} className="text-gray-300 hover:text-primary transition-colors"><Copy size={14} /></button>
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-xl border border-primary/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-primary">Note à ajouter :</span>
                <button onClick={() => copyToClipboard(noteValue)} className="text-primary/40 hover:text-primary transition-colors"><Copy size={14} /></button>
              </div>
              <div className="font-mono text-xl font-black text-primary uppercase text-center">{noteValue}</div>
            </div>
          </div>
          
          <div className="p-4 bg-red-50 rounded-xl border border-red-100">
            <p className="text-[10px] text-red-500 font-bold leading-relaxed">
              * AJOUTER LA NOTE : Sans cette note, le traitement de votre recharge prendra plus de temps.
            </p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-soft flex flex-col">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-4 mb-6">2. Montant & Validation</h3>
          
          <div className="space-y-6 flex-grow">
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Montant envoyé (USD)</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 outline-none font-black text-xl font-mono text-primary" />
            </div>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-[10px] font-bold border border-red-100">{error}</div>}

            <button onClick={handleSubmit} disabled={loading || success} className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${success ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-gray-900 text-white hover:bg-primary shadow-black/10'}`}>
              {loading ? <RefreshCcw className="animate-spin" /> : success ? <CheckCircle /> : <Send />}
              {loading ? "Envoi..." : success ? "Demande Envoyée" : "Valider ma Recharge"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100">
        <h4 className="flex items-center gap-3 font-bold text-gray-900 mb-6"><Info size={20} className="text-primary" /> Processus de Confirmation</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-[11px] leading-relaxed text-gray-500">
          <div className="space-y-2">
            <div className="font-bold text-gray-900 uppercase tracking-wider">Temps de traitement</div>
            <p>Les transactions sont généralement validées sous 5 à 15 minutes après réception des fonds.</p>
          </div>
          <div className="space-y-2">
            <div className="font-bold text-gray-900 uppercase tracking-wider">Besoin d'aide ?</div>
            <p>Si vous avez des questions, contactez-nous sur notre canal Telegram ou WhatsApp.</p>
          </div>
        </div>
      </div>
    </div>
  );
};


// ==========================================
// PAYMENT VIEW
// ==========================================


const PaymentView = ({ cart, cartTotal, navigate, clearCart, profile, session, fetchProfile, fetchProducts }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleBalancePayment = async () => {
    if (!session || !profile) return;
    setIsProcessing(true);
    setErrorMessage("");

    try {
      if (profile.balance < cartTotal) throw new Error("Solde insuffisant.");

      for (const item of cart) {
        const { data: p, error: pErr } = await supabase.from('products').select('stock').eq('id', item.id).single();
        if (pErr || !p || p.stock < item.quantity) throw new Error(`Stock insuffisant pour ${item.name}.`);
        await supabase.from('products').update({ stock: p.stock - item.quantity }).eq('id', item.id);
        await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          status: 'paid',
          created_at: new Date().toISOString()
        });
      }

      await supabase.from('profiles').update({ balance: profile.balance - cartTotal }).eq('id', session.user.id);
      setPurchaseSuccess(true);
      fetchProfile(session.user.id);
      fetchProducts();
      
      setTimeout(() => {
        clearCart();
        navigate('dashboard');
      }, 2000);

    } catch (err) {
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

                {!hasEnoughBalance ? (
                  <div className="space-y-6">
                    <div className="p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
                      <div className="mt-1 text-red-500"><AlertTriangle size={20} /></div>
                      <p className="text-sm text-red-600 leading-relaxed font-medium">
                        Désolé, votre solde est de <span className="font-bold">${(profile?.balance || 0).toFixed(2)}</span>. 
                        Vous avez besoin de <span className="font-bold">${cartTotal.toFixed(2)}</span> pour cette commande.
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('recharge')}
                      className="w-full py-5 rounded-[2rem] bg-gray-900 text-white font-bold hover:bg-primary transition-all shadow-xl shadow-gray-900/10 flex items-center justify-center gap-3"
                    >
                      <Plus size={20} /> Recharger mon compte
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

          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tighter leading-tight">{product.name}</h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
              <Package size={14} /> In stock ({product.stock})
            </div>
            <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
              {CATEGORIES.find(c => c.id === product.category)?.name}
            </div>
          </div>

          <div className="text-5xl font-black text-gray-900 mb-10 tracking-tight flex items-baseline gap-2">
            <span className="text-2xl text-gray-400 font-bold">$</span>{product.price.toFixed(1)}
          </div>

          <div className="mb-8">
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <CheckCircle size={12} className="text-green-500" /> Select option:
            </label>
            <div className="flex flex-wrap gap-2">
              {['New Account', 'Aged 2015-2019', 'Aged 2010-2014', 'Premium Quality'].map((opt, i) => (
                <button key={i} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${i === 0 ? 'bg-red-50 border-red-200 text-red-500' : 'bg-white border-gray-100 text-gray-400 hover:border-primary/30'}`}>
                  {opt}
                </button>
              ))}
            </div>
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

            <button onClick={() => addToCart(product, quantity)} disabled={product.stock <= 0}
              className={`w-full max-w-md h-20 rounded-[2rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-widest flex items-center justify-center gap-4 ${product.stock > 0 ? 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30 hover:scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
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
                {product.details.info.split(' | ').map((line, i) => (
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
               <p className="text-gray-600 font-medium leading-relaxed italic">{product.description || product.details.note}</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100">
               <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6"><ShieldAlert size={14} className="text-primary" /> Conditions d'utilisation</h4>
               <div className="text-xs text-gray-500 leading-relaxed space-y-4">
                 {product.details.terms.split('. ').map((t, i) => <p key={i}>• {t}.</p>)}
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        const { error } = await supabase.auth.signUp({ email, password });
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

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: window.location.origin } 
    });
    if (error) console.error(error);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-20 px-6 font-sans bg-[#FAFAFB]">
      <div className="w-full max-w-lg bg-white p-12 rounded-[3.5rem] shadow-[0_32px_64px_-15px_rgba(0,0,0,0.08)] border border-gray-100 relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="mb-12">
            <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center p-4 shadow-inner mb-8">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
              {isLogin ? 'Bon Retour' : 'Bienvenue'}
            </h2>
            <p className="text-gray-400 font-medium">
              Accédez à la marketplace N°1 de comptes certifiés.
            </p>
          </div>

          <button onClick={handleGoogleLogin} className="w-full bg-white border border-gray-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-4 hover:bg-gray-50 transition-all shadow-sm mb-10 group">
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
            <span className="text-sm text-gray-700">Continuer avec Google</span>
          </button>

          <div className="relative flex items-center mb-10">
            <div className="flex-grow border-t border-gray-100"></div>
            <span className="flex-shrink mx-4 text-[10px] font-black text-gray-300 uppercase tracking-widest">Ou via email</span>
            <div className="flex-grow border-t border-gray-100"></div>
          </div>

          <form className="space-y-6" onSubmit={handleAuth}>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="votre@email.com" />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mot de passe</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="••••••••" />
            </div>

            {errorMessage && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <button type="submit" disabled={loading} className={`flex-grow py-5 rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center gap-2 ${isLogin ? 'bg-gray-900 text-white hover:bg-black shadow-black/10' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 shadow-none'}`}>
                {loading && <RefreshCcw size={16} className="animate-spin" />}
                {isLogin ? 'Se Connecter' : "S'inscrire"}
              </button>
              
              {!isLogin ? (
                <button type="button" onClick={() => setIsLogin(true)} className="flex-grow py-5 rounded-2xl font-bold text-sm bg-gray-900 text-white hover:bg-black shadow-xl shadow-black/10 transition-all">
                   Connexion
                </button>
              ) : (
                <button type="button" onClick={() => setIsLogin(false)} className="flex-grow py-5 rounded-2xl font-bold text-sm bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all">
                  S'inscrire
                </button>
              )}
            </div>
          </form>

          <div className="mt-10 text-center">
             <button onClick={() => { /* logic for reset pass */ }} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-primary transition-colors">
               Mot de passe oublié ?
             </button>
          </div>
        </div>
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
        <div className="h-12 mb-6">
          <img src="/logo.png" alt="Logo" className="h-full object-contain opacity-80 hover:opacity-100 transition-opacity cursor-pointer" />
        </div>
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
  const [products, setProducts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: () => {}, type: "danger" });

  const [currentView, setCurrentView] = useState(() => localStorage.getItem('agedgmail_view') || 'home');
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const saved = localStorage.getItem('agedgmail_product');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [activeCategory, setActiveCategory] = useState(() => localStorage.getItem('agedgmail_category') || 'all');
  const [priceRange, setPriceRange] = useState(() => localStorage.getItem('agedgmail_price_range') || 'all');
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('agedgmail_cart');
    try { return saved ? JSON.parse(saved) : []; } catch { return []; }
  });
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
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

  useEffect(() => {
    fetchProducts();
    fetchAllOrders();
    fetchUsers();

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) fetchProfile(initialSession.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      if (currentSession) fetchProfile(currentSession.user.id);
      else { setProfile(null); setOrders([]); }
    });

    return () => subscription.unsubscribe();
  }, []);

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
    localStorage.setItem('agedgmail_price_range', priceRange);
  }, [priceRange]);

  const fetchProducts = async () => {
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
  };

  const fetchAllOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setAllOrders(data);
  };

  const fetchUsers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllUsers(data);
  };

  const handleSaveProduct = async () => {
    setActionStatus('loading');
    const { error } = editingProduct 
      ? await supabase.from('products').update(productForm).eq('id', editingProduct.id)
      : await supabase.from('products').insert([productForm]);
    
    if (error) alert("Erreur : " + error.message);
    else {
      setEditingProduct(null);
      setProductForm({ name: '', category: 'email', description: '', price: 0, stock: 0 });
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
            stock: parseInt(row['Quantité en Stock'] || row.stock || row.Stock || row.Quantite || 0),
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
        display_name: metadata?.full_name?.split(' ')[0]?.toLowerCase() || session.user.email?.split('@')[0],
        first_name: metadata?.given_name || metadata?.full_name?.split(' ')[0] || "",
        last_name: metadata?.family_name || metadata?.full_name?.split(' ').slice(1).join(' ') || "",
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

  const filteredProducts = products
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
  const navigate = (v) => { 
    setCurrentView(v); 
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <Navbar cartTotal={cartTotal} navigate={navigate} session={session} profile={profile} />
      <div className="flex-grow">
        {currentView === 'home' && <HomeView activeCategory={activeCategory} setActiveCategory={setActiveCategory} priceRange={priceRange} setPriceRange={setPriceRange} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} />}
        {currentView === 'product' && selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} />}
        {currentView === 'auth' && <AuthView navigate={navigate} />}
        {currentView === 'dashboard' && session && <DashboardView profile={profile} navigate={navigate} orders={orders} />}
        {currentView === 'cart' && <CartView cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} cartTotal={cartTotal} navigate={navigate} />}
        {currentView === 'payment' && <PaymentView cart={cart} cartTotal={cartTotal} navigate={navigate} clearCart={clearCart} profile={profile} session={session} fetchProfile={fetchProfile} fetchProducts={fetchProducts} />}
        {currentView === 'recharge' && session && <RechargeView profile={profile} session={session} navigate={navigate} />}
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

      <SupportChat />
      <Footer />
    </div>
  );
}

export default App;
