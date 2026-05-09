import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2 } from 'lucide-react';
import { supabase } from './supabaseClient';

// ==========================================
// COMPOSANTS LOGOS SVG
// ==========================================

const YouTubeLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" fill="#FF0000"/>
    <path d="m9.66 15.14 5.92-3.39-5.92-3.39v6.78z" fill="#fff"/>
  </svg>
);

const GmailLogo = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" fill="#F2F2F2"/>
    <path d="M22 6v12c0 1.1-.9 2-2 2h-2V8l-6 4-6-4v12H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1.2L12 10.5 18.8 4H20c1.1 0 2 .9 2 2z" fill="#EA4335"/>
    <path d="M22 6v2l-10 6.5L2 8V6c0-1.1.9-2 2-2h1.2L12 10.5 18.8 4H20c1.1 0 2 .9 2 2z" fill="#C5221F"/>
    <path d="M2 18V6c0-1.1.9-2 2-2h1.2L12 10.5 18.8 4H20c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-2V8l-6 4-6-4v12H4c-1.1 0-2-.9-2-2z" fill="#EA4335"/>
  </svg>
);

// ==========================================
// MOCK DATA: CATALOGUE PRODUITS
// ==========================================

const CATEGORIES = [
  { id: 'all', name: 'Tous les produits' },
  { id: 'email', name: 'Email (Gmail)' },
  { id: 'youtube_aged', name: 'Chaînes Youtube Anciennes' },
  { id: 'youtube_live', name: 'Chaînes Livestream' },
  { id: 'youtube_cpa', name: 'Chaînes Spéciales CPA' },
  { id: 'social', name: 'Facebook / Twitter / Insta' },
];

const PRODUCTS = [
  // YouTube Aged
  { id: 1, name: 'Chaîne Youtube 2014 – 2019 sans vidéo', category: 'youtube_aged', price: 6.19, stock: true },
  { id: 2, name: 'Chaîne Youtube 2022 – 2025 sans vidéo', category: 'youtube_aged', price: 5.49, stock: true },
  { id: 3, name: 'Chaîne Youtube 2018 – 2021 sans vidéo', category: 'youtube_aged', price: 5.99, stock: true },
  { id: 4, name: 'Chaîne Youtube 2018 – 2020 avec vidéo', category: 'youtube_aged', price: 6.80, stock: true },
  { id: 5, name: 'Chaîne Youtube 2021 – 2024 avec vidéo', category: 'youtube_aged', price: 6.15, stock: true },
  
  // YouTube Livestream
  { id: 6, name: 'Livestream – 2006~2009 – 1k Abonnés + 1K+ Vues', category: 'youtube_live', price: 49.80, stock: true },
  { id: 7, name: 'Livestream – 2006~2009 – 1k Abonnés et nouvelles vidéos', category: 'youtube_live', price: 39.00, stock: true },

  // YouTube CPA
  { id: 8, name: 'Chaîne Spéciale 2011-202x avec 10k à 50k vues ORGANIQUES', category: 'youtube_cpa', price: 19.80, stock: true },
  { id: 9, name: 'Chaîne Spéciale 2006-2010 avec 10k à 50k vues ORGANIQUES', category: 'youtube_cpa', price: 25.80, stock: true },
  { id: 10, name: 'Chaîne Spéciale 2006-2010 avec 50k à 100k vues ORGANIQUES', category: 'youtube_cpa', price: 32.88, stock: true },
  { id: 11, name: 'Chaîne Spéciale 2006-2010 avec 100k à 300k vues ORGANIQUES', category: 'youtube_cpa', price: 44.88, stock: true },
  { id: 12, name: 'Chaîne Spéciale 2006-2010 avec 300k à 500k vues ORGANIQUES', category: 'youtube_cpa', price: 68.88, stock: true },
  { id: 13, name: 'Chaîne Spéciale 2011-202x avec 1M+ vues ORGANIQUES', category: 'youtube_cpa', price: 296.88, stock: true },
  { id: 14, name: 'Chaîne Spéciale 2011-202x avec 300k à 500k vues ORGANIQUES', category: 'youtube_cpa', price: 62.88, stock: true },
  { id: 15, name: 'Chaîne Spéciale 2011-202x avec 100k à 300k vues ORGANIQUES', category: 'youtube_cpa', price: 38.88, stock: true },
  { id: 16, name: 'Chaîne Spéciale 2011-202x avec 50k à 100k vues ORGANIQUES', category: 'youtube_cpa', price: 26.80, stock: true },
  { id: 17, name: 'Chaîne Spéciale 2006-2010 avec 1M+ vues ORGANIQUES', category: 'youtube_cpa', price: 302.88, stock: true },
  { id: 18, name: 'Chaîne Spéciale 2006-2010 avec 500k à 1M vues ORGANIQUES', category: 'youtube_cpa', price: 146.88, stock: true },

  // Email & Social
  { id: 19, name: 'Gmail US Ancien 2010 – 2025', category: 'email', price: 15.00, stock: true },
  { id: 20, name: 'Gmail Pays Aléatoire Ancien 2020 – 2025', category: 'email', price: 5.00, stock: true },
  { id: 21, name: 'Compte Discord Ancien 2017-2019', category: 'social', price: 25.00, stock: true },
  { id: 22, name: 'Instagram 2010 – 2024 | FARM | 400 – 1K Abonnés', category: 'social', price: 30.00, stock: true },
  { id: 23, name: 'Twitter (X) Pays Aléatoire (2007 – 2020)', category: 'social', price: 40.00, stock: true },
  { id: 24, name: 'Facebook US Ancien (30+ Amis)', category: 'social', price: 35.00, stock: true },
];

// ==========================================
// COMPOSANTS PARTAGES
// ==========================================

const Navbar = ({ cartTotal, cartItemCount, navigate, session }) => {
  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      navigate('home');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-dark text-white text-xs py-2 px-6 flex justify-between items-center">
        <div className="flex gap-4">
          <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">Accueil</button>
          <a href="#" className="hover:text-primary transition-colors">Services</a>
          <a href="#" className="hover:text-primary transition-colors">Ressources</a>
          <a href="#" className="hover:text-primary transition-colors">FAQ</a>
          <a href="#" className="hover:text-primary transition-colors">Contactez-nous</a>
        </div>
        <div>
          <a href="mailto:support@agedgmailyt.com" className="hover:text-primary transition-colors">support@agedgmailyt.com</a>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <button onClick={() => navigate('home')} className="font-sans font-bold text-2xl tracking-tight flex items-center gap-2">
          AgedGmail<span className="text-primary">YT</span>
        </button>

        {/* Search Bar */}
        <div className="hidden md:flex items-center bg-gray-50 rounded-full px-4 py-2 border border-gray-200 w-1/3">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher un produit..." 
            className="bg-transparent border-none outline-none ml-2 w-full text-sm font-sans"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden md:inline">
                {session.user.email}
              </span>
              <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-sans font-medium text-gray-700 hover:text-red-500 transition-colors">
                <LogOut size={18} />
                <span className="hidden md:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            <button onClick={() => navigate('auth')} className="flex items-center gap-2 text-sm font-sans font-medium text-gray-700 hover:text-primary transition-colors">
              <User size={18} />
              <span className="hidden md:inline">Connexion / Inscription</span>
            </button>
          )}
          
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          
          <button onClick={() => navigate('cart')} className="flex items-center gap-2 text-sm font-sans font-medium text-gray-700 hover:text-primary transition-colors group">
            <div className="relative">
              <ShoppingCart size={18} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </div>
            <span className="hidden md:inline font-mono">Panier / ${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer className="bg-white border-t border-gray-200 pt-16 pb-8 px-6 mt-12">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
      <div>
        <div className="font-sans font-bold text-xl tracking-tight flex items-center gap-2 mb-4">
          AgedGmail<span className="text-primary">YT</span>
        </div>
        <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
          Comptes et services de médias sociaux de haute qualité. Paiements sécurisés et livraison instantanée.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-4">Liens Rapides</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li><a href="#" className="hover:text-primary transition-colors">Mon Compte</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Services</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Politique de Confidentialité</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li className="flex items-center gap-2"><Mail size={16} /> support@agedgmailyt.com</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary" /> Livré sous 24h</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
      © 2026 AgedGmailYT. Tous droits réservés.
    </div>
  </footer>
);

// ==========================================
// VUES (VIEWS)
// ==========================================

const HomeView = ({ activeCategory, setActiveCategory, filteredProducts, addToCart, navigate, setSelectedProduct }) => {
  const handleProductClick = (product) => {
    setSelectedProduct(product);
    navigate('product');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-[#FCFCFD] pt-20 pb-24 overflow-hidden relative border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 bg-[#E6F8F0] text-primaryDark px-3 py-1.5 rounded-full text-sm font-bold mb-6">
              🔥 N°1 des Comptes Anciens
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-[#1A202C] leading-[1.1] tracking-tight mb-6">
              Donnez un coup d'accélérateur à votre <span className="text-primary">Business YT automation</span>
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Nous fournissons les meilleurs comptes Gmail vieillis et d'anciennes chaînes YouTube pour booster votre présence. Accès instantané et paiement sécurisé en Crypto.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <button onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})} className="btn-primary">
                Voir le catalogue
              </button>
              <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                <span>Paiement 100% Crypto</span>
                <div className="flex gap-1">
                  <div className="w-5 h-5 bg-[#F7931A] rounded-full flex items-center justify-center text-white text-[10px] font-bold">₿</div>
                  <div className="w-5 h-5 bg-[#627EEA] rounded-full flex items-center justify-center text-white text-[10px] font-bold">Ξ</div>
                  <div className="w-5 h-5 bg-[#F3BA2F] rounded-full flex items-center justify-center text-white text-[10px] font-bold">₮</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative h-[400px] hidden lg:block">
            <div className="absolute top-[10%] right-[10%] bg-white p-4 rounded-xl shadow-soft flex items-center gap-4 animate-float-slow z-10">
              <div className="w-12 h-12 flex items-center justify-center">
                <YouTubeLogo size={40} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Chaîne YT 2014</div>
                <div className="text-primary font-bold">$6.19</div>
              </div>
            </div>
            <div className="absolute top-[40%] left-[10%] bg-white p-4 rounded-xl shadow-soft flex items-center gap-4 animate-float-medium z-20">
              <div className="w-12 h-12 flex items-center justify-center">
                <GmailLogo size={40} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Gmail US 2010</div>
                <div className="text-primary font-bold">$15.00</div>
              </div>
            </div>
            <div className="absolute bottom-[10%] right-[20%] bg-white p-4 rounded-xl shadow-soft flex items-center gap-4 animate-float-fast z-30">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <CircleDollarSign className="text-orange-500" size={24} />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">Paiement Crypto</div>
                <div className="text-primary font-bold">Sécurisé</div>
              </div>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </section>

      {/* Guarantees */}
      <div className="bg-white border-b border-gray-100 py-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <CheckCircle size={24} className="text-primary" />, title: 'Haute Qualité', desc: 'Les comptes et services sont conformes aux descriptions.' },
            { icon: <Headphones size={24} className="text-primary" />, title: 'Support Fiable', desc: 'N\'hésitez pas à nous contacter pour toute question.' },
            { icon: <Mail size={24} className="text-primary" />, title: 'Livraison Mail', desc: 'Livré dans votre boîte de réception sous 24 heures.' },
            { icon: <ShieldAlert size={24} className="text-primary" />, title: 'Garantie Totale', desc: 'Remboursement ou remplacement durant la garantie.' },
          ].map((item, idx) => (
            <div key={idx} className="flex gap-4 items-start">
              <div className="mt-1">{item.icon}</div>
              <div>
                <h4 className="font-sans font-bold text-gray-900">{item.title}</h4>
                <p className="font-sans text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Catalog */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-32">
            <h3 className="font-sans font-bold text-lg mb-4 text-gray-900 flex items-center gap-2">
              <Filter size={18} /> Catégories
            </h3>
            <ul className="space-y-1">
              {CATEGORIES.map(cat => (
                <li key={cat.id}>
                  <button 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`w-full flex items-center justify-between text-left px-3 py-2 rounded-lg text-sm font-sans transition-colors ${
                      activeCategory === cat.id 
                        ? 'bg-primary text-white font-medium' 
                        : 'hover:bg-gray-50 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                    {activeCategory === cat.id && <ChevronRight size={14} />}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Product Grid */}
        <div className="flex-grow">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-bold text-2xl text-gray-900">
              {CATEGORIES.find(c => c.id === activeCategory)?.name}
            </h2>
            <span className="text-sm text-gray-500 bg-white px-3 py-1 border border-gray-100 rounded-full">
              Affichage de {filteredProducts.length} résultats
            </span>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full hover:shadow-md transition-shadow duration-300 group cursor-pointer" onClick={() => handleProductClick(product)}>
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center aspect-video relative overflow-hidden">
                    <div className="group-hover:scale-110 transition-transform duration-500">
                      {product.category.includes('youtube') ? <YouTubeLogo size={60} /> : 
                       product.category === 'email' ? <GmailLogo size={60} /> : 
                       <Share2 size={60} className="text-gray-300" />}
                    </div>
                  </div>
                  <div className="flex-grow">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                      {CATEGORIES.find(c => c.id === product.category)?.name || 'Compte'}
                    </span>
                    <h3 className="font-sans font-bold text-gray-900 mt-3 text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="font-sans font-bold text-xl text-gray-900">
                      ${product.price.toFixed(2)}
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product, 1); }}
                      className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-sans font-bold hover:bg-primary hover:text-white transition-colors"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
              <p className="text-gray-500">Aucun produit trouvé dans cette catégorie.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

const ProductView = ({ product, addToCart, navigate }) => {
  const [quantity, setQuantity] = useState(1);
  const categoryName = CATEGORIES.find(c => c.id === product.category)?.name || 'Compte';

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Breadcrumb */}
      <nav className="flex text-sm text-gray-500 mb-8 uppercase tracking-wider font-bold text-[10px]">
        <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">ACCUEIL</button>
        <span className="mx-2">/</span>
        <span>{categoryName.toUpperCase()}</span>
        <span className="mx-2">/</span>
        <span className="text-gray-900">{product.name.toUpperCase()}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        {/* Product Image Placeholder */}
        <div className="bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-12 aspect-[4/3] relative overflow-hidden group">
          <div className="group-hover:scale-105 transition-transform duration-500">
            {product.category.includes('youtube') ? <YouTubeLogo size={120} /> : 
             product.category === 'email' ? <GmailLogo size={120} /> : 
             <Share2 size={120} className="text-gray-300" />}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {product.name}
          </h1>
          <div className="text-3xl font-bold text-primary mb-8">
            ${product.price.toFixed(2)}
          </div>

          <div className="mb-8">
            <h4 className="font-bold border-b border-gray-200 pb-2 mb-4 text-sm tracking-wider uppercase">Informations</h4>
            <ul className="space-y-3 text-sm text-gray-600 list-disc list-inside marker:text-gray-300">
              {product.category.includes('youtube') ? (
                <>
                  <li>Âge/Année : Aléatoire</li>
                  <li>Téléphone vérifié : Oui</li>
                  <li>Nombre de vidéos : 0</li>
                  <li>Format : GMAIL | MOT DE PASSE | MAIL DE RÉCUPÉRATION</li>
                  <li>Connexion via l'option "Confirmer l'e-mail de récupération"</li>
                </>
              ) : (
                <>
                  <li>Format : FORMAT STANDARD</li>
                  <li>Livré instantanément ou sous 24h max</li>
                  <li>Comptes sûrs et sécurisés</li>
                </>
              )}
            </ul>
          </div>

          {/* Add to cart section */}
          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
              <button 
                onClick={handleDecrease}
                className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Minus size={16} />
              </button>
              <div className="px-4 font-bold font-mono text-gray-900 w-12 text-center select-none">
                {quantity}
              </div>
              <button 
                onClick={handleIncrease}
                className="px-4 py-3 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            
            <button 
              onClick={() => addToCart(product, quantity)}
              className="btn-primary flex-grow text-center justify-center py-3.5"
            >
              AJOUTER AU PANIER
            </button>
          </div>

          <div className="border-t border-gray-100 pt-6 text-sm text-gray-500 space-y-2">
            <div><span className="font-bold text-gray-900 mr-2">SKU :</span> agedy-{product.id}</div>
            <div><span className="font-bold text-gray-900 mr-2">Catégories :</span> <span className="text-primary">{categoryName}</span></div>
          </div>
        </div>
      </div>

      {/* Description Tabs */}
      <div className="border-t border-gray-200 pt-8">
        <div className="flex gap-8 border-b border-gray-200 mb-8">
          <button className="pb-4 border-b-2 border-primary font-bold text-sm tracking-wider uppercase text-gray-900">
            Description
          </button>
          <button className="pb-4 text-gray-500 font-bold text-sm tracking-wider uppercase hover:text-gray-900 transition-colors">
            Avis (0)
          </button>
        </div>
        
        <div>
          <h4 className="font-bold uppercase tracking-wider text-sm mb-4">Note Importante</h4>
          <ul className="space-y-4 text-sm text-gray-600 list-disc list-inside marker:text-gray-400 leading-relaxed max-w-4xl">
            <li>Les chaînes sont sélectionnées aléatoirement parmi les années disponibles.</li>
            <li>Ces chaînes ont été créées il y a plusieurs années, ce qui aide grandement pour le référencement et la visibilité.</li>
            <li>Idéal pour toutes les méthodes de YouTube Automation.</li>
            <li>S'il s'agit de votre premier achat, nous vous conseillons de commencer par une petite quantité pour tester.</li>
            <li>Changez toujours le mot de passe et le mail de récupération après l'achat. <strong>Mais attendez au moins 48 heures après votre première connexion.</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const AuthView = ({ navigate }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (!supabase) {
      setErrorMsg("Veuillez configurer vos clés Supabase.");
      return;
    }
    
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('home');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        setSuccessMsg("Vérifiez vos e-mails pour confirmer votre compte !");
      }
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setErrorMsg("Veuillez configurer vos clés Supabase.");
      return;
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Retour à la boutique
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Bon retour !' : 'Créer un compte'}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          {isLogin ? 'Connectez-vous pour accéder à vos achats.' : 'Rejoignez-nous pour booster votre présence digitale.'}
        </p>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 border border-red-100">
            {errorMsg}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm mb-4 border border-green-100">
            {successMsg}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleAuth}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom Complet</label>
              <input 
                type="text" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
                placeholder="Ex: Jean Dupont" 
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse E-mail</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
              placeholder="votre@email.com" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" 
              placeholder="••••••••" 
            />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" className="rounded text-primary focus:ring-primary border-gray-300" />
                Se souvenir de moi
              </label>
              <a href="#" className="text-primary hover:underline">Mot de passe oublié ?</a>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full btn-primary mt-6 disabled:opacity-70 disabled:cursor-not-allowed">
            {loading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Ou continuer avec</span>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Vous n'avez pas de compte ?" : "Déjà un compte ?"}
            <button 
              onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); setSuccessMsg(null); }} 
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isLogin ? 'S\'inscrire' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const CartView = ({ cart, updateCartQuantity, removeFromCart, cartTotal, navigate }) => {
  return (
    <div className="min-h-[80vh] max-w-4xl mx-auto py-16 px-6">
      <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Continuer mes achats
      </button>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Votre Panier</h2>

      {cart.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">Votre panier est actuellement vide.</p>
          <button onClick={() => navigate('home')} className="btn-primary inline-flex">
            Retourner à la boutique
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-gray-300 text-xs text-center">
                    {item.category.includes('youtube') ? <YouTubeLogo size={32} /> : 
                     item.category === 'email' ? <GmailLogo size={32} /> : 
                     <Share2 size={32} className="text-gray-300" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  {/* Quantity Selector */}
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden bg-white">
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Minus size={14} />
                    </button>
                    <div className="w-8 font-mono text-center text-sm font-bold select-none">
                      {item.quantity}
                    </div>
                    <button 
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="px-2 py-1 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-2"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Résumé de la commande</h3>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Sous-total ({cart.reduce((sum, item) => sum + item.quantity, 0)} articles)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Remise Crypto</span>
              <span className="text-primary">-$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 mb-8 pt-4 border-t border-gray-100">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="w-full btn-primary bg-gray-900 hover:bg-black mb-3">
              Payer en Crypto
            </button>
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
              <ShieldAlert size={12} /> Paiement sécurisé et chiffré
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// MAIN APP COMPONENT
// ==========================================

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'product', 'auth', 'cart'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!supabase) return;
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const filteredProducts = activeCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingItemIndex >= 0) {
        const newCart = [...prevCart];
        newCart[existingItemIndex].quantity += quantity;
        return newCart;
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
  };

  const updateCartQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart => prevCart.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const navigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white font-sans flex flex-col">
      <Navbar cartTotal={cartTotal} cartItemCount={cartItemCount} navigate={navigate} session={session} />
      
      <div className="flex-grow">
        {currentView === 'home' && (
          <HomeView 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
            filteredProducts={filteredProducts} 
            addToCart={addToCart} 
            navigate={navigate}
            setSelectedProduct={setSelectedProduct}
          />
        )}
        {currentView === 'product' && selectedProduct && (
          <ProductView 
            product={selectedProduct} 
            addToCart={(p, q) => {
              addToCart(p, q);
            }}
            navigate={navigate} 
          />
        )}
        {currentView === 'auth' && <AuthView navigate={navigate} />}
        {currentView === 'cart' && (
          <CartView 
            cart={cart} 
            updateCartQuantity={updateCartQuantity}
            removeFromCart={removeFromCart} 
            cartTotal={cartTotal} 
            navigate={navigate} 
          />
        )}
      </div>

      <Footer />
    </div>
  );
}

export default App;
