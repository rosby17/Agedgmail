import React, { useState } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, PlayCircle, CircleDollarSign, ArrowLeft, Trash2 } from 'lucide-react';

// ==========================================
// MOCK DATA: CATALOGUE PRODUITS
// ==========================================

const CATEGORIES = [
  { id: 'all', name: 'Tous les produits' },
  { id: 'email', name: 'Email (Gmail)' },
  { id: 'youtube_aged', name: 'Aged Youtube Channel' },
  { id: 'youtube_live', name: 'Livestream Channel' },
  { id: 'youtube_cpa', name: 'CPA Channel' },
  { id: 'social', name: 'Facebook / Twitter / Insta' },
];

const PRODUCTS = [
  // YouTube Aged
  { id: 1, name: 'Youtube channel 2014 – 2019 without video', category: 'youtube_aged', price: 6.19, stock: true },
  { id: 2, name: 'Youtube channel 2022 – 2025 without video', category: 'youtube_aged', price: 5.49, stock: true },
  { id: 3, name: 'Youtube channel 2018 – 2021 without video', category: 'youtube_aged', price: 5.99, stock: true },
  { id: 4, name: 'Youtube channel 2018 – 2020 with video', category: 'youtube_aged', price: 6.80, stock: true },
  { id: 5, name: 'Youtube channel 2021 – 2024 with video', category: 'youtube_aged', price: 6.15, stock: true },
  
  // YouTube Livestream
  { id: 6, name: 'Livestream – 2006~2009 – 1k Subs + 1K+ Views', category: 'youtube_live', price: 49.80, stock: true },
  { id: 7, name: 'Livestream – 2006~2009 – 1k Subs and new videos', category: 'youtube_live', price: 39.00, stock: true },

  // YouTube CPA
  { id: 8, name: 'Special Channel 2011-202x with ORGANIC 10k to 50k views', category: 'youtube_cpa', price: 19.80, stock: true },
  { id: 9, name: 'Special Channel 2006-2010 with ORGANIC 10k to 50k views', category: 'youtube_cpa', price: 25.80, stock: true },
  { id: 10, name: 'Special Channel 2006-2010 with ORGANIC 50k to 100k views', category: 'youtube_cpa', price: 32.88, stock: true },
  { id: 11, name: 'Special Channel 2006-2010 with ORGANIC 100k to 300k views', category: 'youtube_cpa', price: 44.88, stock: true },
  { id: 12, name: 'Special Channel 2006-2010 with ORGANIC 300k to 500k views', category: 'youtube_cpa', price: 68.88, stock: true },
  { id: 13, name: 'Special Channel 2011-202x with ORGANIC 1M views+', category: 'youtube_cpa', price: 296.88, stock: true },
  { id: 14, name: 'Special Channel 2011-202x with ORGANIC 300k to 500k views', category: 'youtube_cpa', price: 62.88, stock: true },
  { id: 15, name: 'Special Channel 2011-202x with ORGANIC 100k to 300k views', category: 'youtube_cpa', price: 38.88, stock: true },
  { id: 16, name: 'Special Channel 2011-202x with ORGANIC 50k to 100k views', category: 'youtube_cpa', price: 26.80, stock: true },
  { id: 17, name: 'Special Channel 2006-2010 with ORGANIC 1M views+', category: 'youtube_cpa', price: 302.88, stock: true },
  { id: 18, name: 'Special Channel 2006-2010 with ORGANIC 500k to 1M views', category: 'youtube_cpa', price: 146.88, stock: true },

  // Email & Social (Garde-fous pour le reste du catalogue)
  { id: 19, name: 'Age Gmail US 2010 – 2025', category: 'email', price: 15.00, stock: true },
  { id: 20, name: 'Age Gmail Random Country 2020 – 2025', category: 'email', price: 5.00, stock: true },
  { id: 21, name: 'Old Discord Account 2017-2019', category: 'social', price: 25.00, stock: true },
  { id: 22, name: 'Instagram 2010 – 2024 | FARM | 400 – 1K Followers', category: 'social', price: 30.00, stock: true },
  { id: 23, name: 'Aged Twitter (X) Random Country (2007 – 2020)', category: 'social', price: 40.00, stock: true },
  { id: 24, name: 'Aged Facebook US (30+ Friends)', category: 'social', price: 35.00, stock: true },
];

// ==========================================
// COMPOSANTS PARTAGES
// ==========================================

const Navbar = ({ cartTotal, cartItems, navigate }) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-dark text-white text-xs py-2 px-6 flex justify-between items-center">
        <div className="flex gap-4">
          <button onClick={() => navigate('home')} className="hover:text-primary transition-colors">Home</button>
          <a href="#" className="hover:text-primary transition-colors">Service</a>
          <a href="#" className="hover:text-primary transition-colors">Resources</a>
          <a href="#" className="hover:text-primary transition-colors">FAQ</a>
          <a href="#" className="hover:text-primary transition-colors">Contact Us</a>
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
            placeholder="Search for..." 
            className="bg-transparent border-none outline-none ml-2 w-full text-sm font-sans"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('auth')} className="flex items-center gap-2 text-sm font-sans font-medium text-gray-700 hover:text-primary transition-colors">
            <User size={18} />
            <span className="hidden md:inline">Login / Register</span>
          </button>
          
          <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
          
          <button onClick={() => navigate('cart')} className="flex items-center gap-2 text-sm font-sans font-medium text-gray-700 hover:text-primary transition-colors group">
            <div className="relative">
              <ShoppingCart size={18} />
              {cartItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                  {cartItems}
                </span>
              )}
            </div>
            <span className="hidden md:inline font-mono">Cart / ${cartTotal.toFixed(2)}</span>
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
          High Quality Social Media Accounts and Services. Secure payments and instant delivery.
        </p>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li><a href="#" className="hover:text-primary transition-colors">Account</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Service</a></li>
          <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-4">Contact</h4>
        <ul className="space-y-3 text-sm text-gray-500">
          <li className="flex items-center gap-2"><Mail size={16} /> support@agedgmailyt.com</li>
          <li className="flex items-center gap-2"><CheckCircle size={16} className="text-primary" /> Delivered within 24h</li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto border-t border-gray-100 pt-8 text-center text-sm text-gray-400">
      © 2026 AgedGmailYT. All rights reserved.
    </div>
  </footer>
);

// ==========================================
// VUES (VIEWS)
// ==========================================

const HomeView = ({ activeCategory, setActiveCategory, filteredProducts, addToCart }) => (
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
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <PlayCircle className="text-red-600" size={24} />
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Chaîne YT 2014</div>
              <div className="text-primary font-bold">$3.19</div>
            </div>
          </div>
          <div className="absolute top-[40%] left-[10%] bg-white p-4 rounded-xl shadow-soft flex items-center gap-4 animate-float-medium z-20">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-xl">G</span>
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">Gmail US 2010</div>
              <div className="text-primary font-bold">$1.43</div>
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
          { icon: <CheckCircle size={24} className="text-primary" />, title: 'High Quality', desc: 'Accounts and services are good as described.' },
          { icon: <Headphones size={24} className="text-primary" />, title: 'Reliable Support', desc: 'Feel free to contact us.' },
          { icon: <Mail size={24} className="text-primary" />, title: 'Mail Delivery', desc: 'Delivered to your inbox within 24 hours.' },
          { icon: <ShieldAlert size={24} className="text-primary" />, title: 'Guarantee Policy', desc: 'Refund/replacement during warranty.' },
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
            <Filter size={18} /> Categories
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
            Showing {filteredProducts.length} results
          </span>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col h-full hover:shadow-md transition-shadow duration-300 group">
                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center justify-center aspect-video relative overflow-hidden">
                  <div className="font-sans font-bold text-gray-300 text-lg text-center px-4 group-hover:scale-105 transition-transform duration-500">
                    {product.category.toUpperCase().replace('_', ' ')}
                  </div>
                </div>
                <div className="flex-grow">
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                    {CATEGORIES.find(c => c.id === product.category)?.name || 'Account'}
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
                    onClick={() => addToCart(product)}
                    className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-xs font-sans font-bold hover:bg-primary hover:text-white transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-500">No products found in this category.</p>
          </div>
        )}
      </div>
    </main>
  </>
);

const AuthView = ({ navigate }) => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-soft border border-gray-100">
        <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to store
        </button>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {isLogin ? 'Sign in to access your purchased accounts.' : 'Join AgedSMM to start boosting your presence.'}
        </p>

        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors" placeholder="••••••••" />
          </div>

          {isLogin && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="rounded text-primary focus:ring-primary border-gray-300" />
                Remember me
              </label>
              <a href="#" className="text-primary hover:underline">Lost password?</a>
            </div>
          )}

          <button type="submit" className="w-full btn-primary mt-6">
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="ml-2 text-primary font-bold hover:underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const CartView = ({ cart, setCart, cartTotal, navigate }) => {
  const removeFromCart = (indexToRemove) => {
    setCart(cart.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="min-h-[80vh] max-w-4xl mx-auto py-16 px-6">
      <button onClick={() => navigate('home')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary mb-8 transition-colors">
        <ArrowLeft size={16} /> Continue Shopping
      </button>
      
      <h2 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
          <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-6">Your cart is currently empty.</p>
          <button onClick={() => navigate('home')} className="btn-primary inline-flex">
            Return to shop
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center font-bold text-gray-300 text-xs text-center">
                    {item.category.split('_')[0].toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">{item.name}</h4>
                    <p className="text-primary font-bold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeFromCart(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
            <h3 className="font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h3>
            <div className="flex justify-between mb-4 text-gray-600">
              <span>Subtotal ({cart.length} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-gray-600">
              <span>Crypto Discount</span>
              <span className="text-primary">-$0.00</span>
            </div>
            <div className="flex justify-between font-bold text-xl text-gray-900 mb-8 pt-4 border-t border-gray-100">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <button className="w-full btn-primary bg-gray-900 hover:bg-black mb-3">
              Checkout with Crypto
            </button>
            <p className="text-xs text-gray-500 text-center flex items-center justify-center gap-2">
              <ShieldAlert size={12} /> Secure encrypted payment
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
  const [currentView, setCurrentView] = useState('home'); // 'home', 'auth', 'cart'
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);

  const filteredProducts = activeCategory === 'all' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const navigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary selection:text-white font-sans flex flex-col">
      <Navbar cartTotal={cartTotal} cartItems={cart.length} navigate={navigate} />
      
      <div className="flex-grow">
        {currentView === 'home' && (
          <HomeView 
            activeCategory={activeCategory} 
            setActiveCategory={setActiveCategory} 
            filteredProducts={filteredProducts} 
            addToCart={addToCart} 
          />
        )}
        {currentView === 'auth' && <AuthView navigate={navigate} />}
        {currentView === 'cart' && <CartView cart={cart} setCart={setCart} cartTotal={cartTotal} navigate={navigate} />}
      </div>

      <Footer />
    </div>
  );
}

export default App;
