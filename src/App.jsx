import { PRODUCTS as PRODUCTS_RAW } from './productsData';
import ProductView from './views/ProductView';
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { parseAccountDelivery } from './lib/parseAccountDelivery';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from './utils/constants';
import { TRANSLATIONS } from './utils/translations';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from './utils/helpers';
import { LEGACY_APP_PATH_TO_VIEW, viewToUrlPath, pathToView } from './utils/routing';
import { YouTubeLogo, GmailLogo, FacebookIcon, DiscordLogo, InstagramLogo, TwitterLogo, TikTokLogo, AppleLogo, TelegramLogo, SmsLogo, RedditLogo, MailGenericLogo, OutlookLogo, SnapchatLogo, AmazonLogo, GithubLogo } from './components/ui/Logos';
import { Skeleton, SkeletonProductCard, SkeletonProductGrid, SkeletonRows, SkeletonMetricCards } from './components/ui/Skeletons';
import { TypewriterText } from './components/ui/TypewriterText';

import LandingView from './views/LandingView';
import SmsView from './views/SmsView';
import ApiView from './views/ApiView';
import PoliciesView from './views/PoliciesView';
import AuthView from './views/AuthView';
import ResetPasswordView from './views/ResetPasswordView';
import MyOrdersView from './views/MyOrdersView';
import SettingsView from './views/SettingsView';
import RechargeView from './views/RechargeView';
import AdminView from './views/AdminView';
import HomeView from './views/HomeView';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NotificationBell from './components/layout/NotificationBell';

import CartDrawer from './components/modals/CartDrawer';
import CartCheckoutModal from './components/modals/CartCheckoutModal';
import QuickOrderModal from './components/modals/QuickOrderModal';
import TransferCreditsModal from './components/modals/TransferCreditsModal';
import OrderCredentialsModal from './components/modals/OrderCredentialsModal';

import ProductCard from './components/ui/ProductCard';
import ProductVisual from './components/ui/ProductVisual';
import DeliveredAccountCard from './components/ui/DeliveredAccountCard';
import KeepAlive from './components/ui/KeepAlive';
import SupportChatWidget from './components/support/SupportChatWidget';

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('agedgmail_lang') || 'fr');
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    
    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('agedgmail_lang', lang);
  }, [lang]);

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;

  const [products, setProducts] = useState([]);

  const [currentView, setCurrentView] = useState(() => {
    const rawHash = window.location.hash;
    if (rawHash.includes('type=recovery') || rawHash.includes('access_token=') || rawHash.includes('error=')) {
      return 'shop'; // Let the effect handle the OAuth hash
    }
    return pathToView(window.location.pathname) || 'landing';
  });
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const saved = localStorage.getItem('agedgmail_product');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [activeCategory, setActiveCategory] = useState(() => localStorage.getItem('agedgmail_category') || 'all');
  const [activeGroup, setActiveGroup] = useState(() => localStorage.getItem('agedgmail_group') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  // Le panier ne survit jamais à un rafraîchissement de page (voulu) : il vit
  // uniquement en mémoire pour la session en cours, jamais dans localStorage.
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState(null);
  const [session, setSession] = useState(null);
  // Distingue "pas encore vérifié" de "pas connecté" — sans ça, les vues
  // protégées (ex: /myorders) redirigent vers /auth au premier rendu, avant
  // que supabase.auth.getSession() n'ait eu le temps de restaurer la session
  // existante depuis le stockage local (arrivée directe sur l'URL, ex: lien
  // d'un email). Le SIGNED_IN handler renvoie alors vers /shop après
  // connexion, perdant la destination d'origine.
  const [sessionChecked, setSessionChecked] = useState(false);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [rechargeSuggestedAmount, setRechargeSuggestedAmount] = useState(null);
  const [resumeOrder, setResumeOrder] = useState(null); // commande Binance Pay 'pending' à reprendre
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [actionStatus, setActionStatus] = useState(null);
  // États de chargement : on affiche des squelettes tant que la base n'a pas
  // répondu (init à true, passés à false à la fin de chaque fetch).
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [adminDataLoading, setAdminDataLoading] = useState(true);

  const [dialogState, setDialogState] = useState(null); // { type, title, message, defaultValue, resolve }
  const [promptValue, setPromptValue] = useState("");

  useEffect(() => {
    window.showAlert = (title, message) => {
      return new Promise((resolve) => {
        setDialogState({ type: 'alert', title, message, resolve });
      });
    };
    window.showConfirm = (title, message) => {
      return new Promise((resolve) => {
        setDialogState({ type: 'confirm', title, message, resolve });
      });
    };
    window.showPrompt = (title, message, defaultValue = '') => {
      return new Promise((resolve) => {
        setDialogState({ type: 'prompt', title, message, defaultValue, resolve });
      });
    };
  }, []);

  useEffect(() => {
    if (dialogState && dialogState.type === 'prompt') {
      setPromptValue(dialogState.defaultValue || '');
    }
  }, [dialogState]);



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



  // Nettoie les recharges Binance Pay restées 'pending' au-delà de leur
  // délai (client qui a fermé la fenêtre sans payer) — l'update déclenche
  // le realtime ci-dessous, donc l'UI (badge "Expiré") se met à jour seule.
  useEffect(() => {
    if (!session || !supabase) return;
    supabase.functions.invoke('binance-expire-stale', { body: {} }).catch(() => {});
  }, [session]);

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
    if (selectedProduct) localStorage.setItem('agedgmail_product', JSON.stringify(selectedProduct));
    else localStorage.removeItem('agedgmail_product');
  }, [selectedProduct]);

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
      setProductsLoading(false);
      return;
    }
    // 1. Fetch products
    const { data: productsData, error: pErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pErr || !productsData) { setProductsLoading(false); return; }

    // 2. Compter le stock local disponible en UNE seule requête (au lieu d'une
    // requête par produit) : on récupère les product_id non livrés, puis on
    // agrège les comptes côté client.
    const localStockIds = productsData.filter(p => !p.is_dropship).map(p => p.id);
    const stockCountByProduct = new Map();
    if (localStockIds.length > 0) {
      const { data: stockRows } = await supabase
        .from('account_stock')
        .select('product_id')
        .in('product_id', localStockIds)
        .eq('is_delivered', false);
      (stockRows || []).forEach(r => stockCountByProduct.set(r.product_id, (stockCountByProduct.get(r.product_id) || 0) + 1));
    }

    const updatedProducts = productsData.map(p => ({
      ...p,
      // Produit reseller : la dispo vient du fournisseur (synchro périodique).
      // Produit à stock local : compté ci-dessus.
      stock: p.is_dropship ? (p.supplier_stock || 0) : (stockCountByProduct.get(p.id) || 0),
      details: getProductDetails(p),
    })).filter(p => categoryVisual(p) !== 'sms');

    setProducts(updatedProducts);
    setProductsLoading(false);
  };

  const fetchAllOrders = async () => {
    if (!supabase) return;
    // Pagination : PostgREST plafonne à ~1000 lignes. Sans ça, au-delà de 1000
    // commandes, les plus anciennes disparaissent ET le chiffre d'affaires /
    // bénéfice du dashboard sont sous-comptés. On récupère TOUTES les commandes.
    const PAGE = 1000;
    let all = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('orders').select('*')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1);
      if (error || !data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < PAGE) break;
    }
    setAllOrders(all);
    setAdminDataLoading(false);
  };

  const fetchUsers = async () => {
    if (!supabase) return;
    // PostgREST plafonne une requête à ~1000 lignes : on pagine pour récupérer
    // TOUS les clients même au-delà de 1000 (sinon les plus anciens disparaissent).
    const PAGE = 1000;
    let all = [];
    for (let from = 0; ; from += PAGE) {
      const { data, error } = await supabase
        .from('profiles').select('*')
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1);
      if (error || !data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < PAGE) break;
    }
    setAllUsers(all);
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
      setOrdersLoading(false);
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
      setOrdersLoading(false);
    }
    setOrdersLoading(false);
  };

  // Groupes de premier niveau (barre du haut), dérivés des produits réellement
  // en catalogue (miroir YTSeller), dans l'ordre GROUP_ORDER, comptés puis filtrés à ceux non-vides.
  const productGroups = (() => {
    const counts = new Map();
    products.forEach(p => { const g = categoryVisual(p); counts.set(g, (counts.get(g) || 0) + 1); });
    return GROUP_ORDER.filter(id => counts.get(id) > 0).map(id => ({ id, name: GROUP_LABELS[id], count: counts.get(id) }));
  })();

  // Sous-catégories (barre du bas) : catégories réelles du groupe actif.
  const productSubCategories = (() => {
    if (activeGroup === 'all') return [];
    const counts = new Map();
    products.forEach(p => {
      if (categoryVisual(p) !== activeGroup) return;
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    // Le filtre reste basé sur la vraie catégorie (id), seul le libellé
    // affiché change : une catégorie fourre-tout comme "Accounts-Telegram"
    // n'a aucun sens listée sous l'onglet Gmail, on affiche le nom du groupe.
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => ({
      id,
      name: JUNK_CATEGORIES.some(j => String(id).toLowerCase() === j || String(id).toLowerCase().includes(j))
        ? GROUP_LABELS[activeGroup]
        : categoryName(id),
    }));
  })();

  const filteredProducts = products
    .filter(p => activeGroup === 'all' || categoryVisual(p) === activeGroup)
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => !searchTerm.trim() || p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => {
      // Toujours remonter les produits EN STOCK avant les ruptures, quel que
      // soit le tri choisi — évite d'accueillir le client sur un mur de « Rupture ».
      const aOut = (a.stock || 0) > 0 ? 0 : 1;
      const bOut = (b.stock || 0) > 0 ? 0 : 1;
      if (aOut !== bOut) return aOut - bOut;
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
    if (v === 'landing') v = '';
    const [viewName, queryString] = (v || '').split('?');
    const urlPath = viewToUrlPath(viewName);
    const fullPath = queryString ? `/${urlPath}?${queryString}` : `/${urlPath}`;

    window.history.pushState(null, '', fullPath);
    setCurrentView(viewName || 'landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      setSessionChecked(true);
      if (initialSession) fetchProfile(initialSession.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id);
        // Lien de réinitialisation cliqué depuis l'email : Supabase crée une
        // session temporaire et émet PASSWORD_RECOVERY. On force l'écran de
        // saisie du nouveau mot de passe — fiable quel que soit le format du
        // lien (hash #type=recovery en flow implicite, ?code= en PKCE) et le
        // timing du nettoyage d'URL par Supabase. C'est LA correction du bug
        // "le lien de reset renvoie vers la landing".
        if (event === 'PASSWORD_RECOVERY') {
          navigate('reset-password');
          return;
        }
        // Redirection après connexion : si le path est vide (racine), 'landing', ou 'auth', on
        // renvoie vers la page que l'utilisateur visait avant d'être envoyé sur /auth (ex: lien
        // /myorders reçu par email), sinon vers le shop par défaut.
        if (event === 'SIGNED_IN') {
          const p = window.location.pathname.replace(/^\/+/, '');
          if (!p || p === 'auth' || p === 'landing') {
            const redirectTo = sessionStorage.getItem('agedgmail_redirect_after_login');
            sessionStorage.removeItem('agedgmail_redirect_after_login');
            navigate(redirectTo || 'shop');
          }
        }
      } else {
        setProfile(null);
        setOrders([]);
        // Déconnexion explicite : vide le panier pour que la personne suivante
        // sur cet appareil ne voie jamais le panier/le solde du client précédent.
        if (event === 'SIGNED_OUT') {
          setCart([]);
          setCartOpen(false);
          // Si on était sur une vue qui exige une session (tout ce qui est
          // sous /app/...), on repart proprement sur le catalogue au lieu de
          // laisser un écran vide (les vues protégées ne rendent rien sans session).
          const p = window.location.pathname.replace(/^\/+/, '');
          if (p.startsWith('app/')) {
            navigate('shop');
          }
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

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

  useEffect(() => {
    const handlePopState = () => {
      setCurrentView(pathToView(window.location.pathname) || 'landing');
    };

    window.addEventListener('popstate', handlePopState);

    const params = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash;
    const rawPath = window.location.pathname.replace(/^\/+/, '');

    if (rawHash.includes('type=recovery')) {
      setCurrentView('reset-password');
      window.history.replaceState(null, '', '/reset-password');
    } else if (rawHash.includes('access_token=') || rawHash.includes('error_description=') || rawHash.includes('error=')) {
      setCurrentView('shop');
    } else if (params.get('paymentStatus')) {
      setCurrentView('dashboard');
      window.history.replaceState(null, '', `/${viewToUrlPath('dashboard')}`);
    } else if (rawPath === 'sms' || rawPath === 'app/sms') {
      setActiveCategory('sms');
    } else if (LEGACY_APP_PATH_TO_VIEW[rawPath]) {
      // Ancien lien (email déjà envoyé, favori) vers une page maintenant sous
      // /app/... — on corrige l'URL sans casser le lien.
      window.history.replaceState(null, '', `/${viewToUrlPath(LEGACY_APP_PATH_TO_VIEW[rawPath])}`);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdmin = currentView === 'admin';

  return (
    <div className="min-h-screen bg-canvas dark:bg-gray-950 font-sans flex flex-col">
      {!isAdmin && <Navbar cartTotal={cartTotal} cartCount={cart.length} navigate={navigate} session={session} profile={profile} currentView={currentView} setActiveCategory={setActiveCategory} setActiveGroup={setActiveGroup} onCartClick={() => setCartOpen(true)} lang={lang} setLang={setLang} t={t} />}
      {!isAdmin && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} cartTotal={cartTotal} navigate={navigate} session={session} onCheckout={() => setCheckoutOpen(true)} />}
      {!isAdmin && (
        <CartCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cart={cart}
          cartTotal={cartTotal}
          session={session}
          profile={profile}
          navigate={navigate}
          clearCart={clearCart}
          fetchProfile={fetchProfile}
          fetchProducts={fetchProducts}
          fetchAllOrders={fetchAllOrders}
          setRechargeSuggestedAmount={setRechargeSuggestedAmount}
        />
      )}
      {!isAdmin && quickOrderProduct && (
        <QuickOrderModal
          product={quickOrderProduct}
          session={session}
          profile={profile}
          navigate={navigate}
          onClose={() => setQuickOrderProduct(null)}
          fetchProfile={fetchProfile}
          fetchProducts={fetchProducts}
          setRechargeSuggestedAmount={setRechargeSuggestedAmount}
          lang={lang}
        />
      )}
      <div className="flex-grow">
        <KeepAlive show={currentView === 'landing'}><LandingView navigate={navigate} session={session} products={products} setSelectedProduct={setSelectedProduct} lang={lang} setLang={setLang} /></KeepAlive>
        <KeepAlive show={currentView === 'sms'}><SmsView session={session} sessionChecked={sessionChecked} profile={profile} lang={lang} navigate={navigate} fetchProfile={fetchProfile} /></KeepAlive>
        <KeepAlive show={currentView === 'shop'}><HomeView activeGroup={activeGroup} setActiveGroup={setActiveGroup} activeCategory={activeCategory} setActiveCategory={setActiveCategory} sortBy={sortBy} setSortBy={setSortBy} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} onBuyNow={setQuickOrderProduct} groups={productGroups} subCategories={productSubCategories} groupOf={categoryVisual} lang={lang} t={t} loading={productsLoading} /></KeepAlive>
        <KeepAlive show={currentView === 'product' && !!selectedProduct}>
          {selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} onCartClick={() => setCartOpen(true)} onBuyNow={setQuickOrderProduct} lang={lang} />}
        </KeepAlive>
        <KeepAlive show={currentView === 'api'}><ApiView navigate={navigate} session={session} sessionChecked={sessionChecked} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'policies'}><PoliciesView navigate={navigate} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'auth'}><AuthView navigate={navigate} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'reset-password'}><ResetPasswordView navigate={navigate} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'dashboard'}><MyOrdersView profile={profile} navigate={navigate} orders={orders} onResume={(order) => { setResumeOrder(order); navigate('recharge'); }} session={session} sessionChecked={sessionChecked} fetchProfile={fetchProfile} lang={lang} t={t} loading={ordersLoading} /></KeepAlive>
        <KeepAlive show={currentView === 'settings'}><SettingsView profile={profile} navigate={navigate} fetchProfile={fetchProfile} session={session} sessionChecked={sessionChecked} lang={lang} t={t} /></KeepAlive>
        <KeepAlive show={currentView === 'recharge'}><RechargeView profile={profile} session={session} sessionChecked={sessionChecked} navigate={navigate} suggestedAmount={rechargeSuggestedAmount} setSuggestedAmount={setRechargeSuggestedAmount} fetchProfile={fetchProfile} resumeOrder={resumeOrder} clearResumeOrder={() => setResumeOrder(null)} lang={lang} t={t} /></KeepAlive>
        <KeepAlive show={currentView === 'admin'}>
          {isAdmin && (
            <AdminView
              session={session}
              profile={profile}
              navigate={navigate}
              products={products}
              fetchProducts={fetchProducts}
              allOrders={allOrders}
              fetchAllOrders={fetchAllOrders}
              allUsers={allUsers}
              fetchUsers={fetchUsers}
              actionStatus={actionStatus}
              setActionStatus={setActionStatus}
              lang={lang}
              setLang={setLang}
              t={t}
              dataLoading={adminDataLoading}
            />
          )}
        </KeepAlive>
      </div>

      {!isAdmin && session && <SupportChatWidget session={session} profile={profile} />}
      {!isAdmin && <Footer navigate={navigate} lang={lang} />}

      {dialogState && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div className="bg-white dark:bg-slate-900 border border-gray-150 dark:border-slate-800 rounded-[2rem] p-6 max-w-sm w-full shadow-2xl space-y-6 text-gray-900 dark:text-white animate-in zoom-in-95 duration-200">
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight">{dialogState.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{dialogState.message}</p>
            </div>
            
            {dialogState.type === 'prompt' && (
              <input 
                type="text" 
                value={promptValue} 
                onChange={(e) => setPromptValue(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20 font-bold"
              />
            )}
            
            <div className="flex justify-end gap-3 pt-2">
              {(dialogState.type === 'confirm' || dialogState.type === 'prompt') && (
                <button 
                  onClick={() => {
                    dialogState.resolve(null);
                    setDialogState(null);
                  }}
                  className="px-5 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-gray-600 dark:text-slate-400"
                >
                  {lang === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
              )}
              <button 
                onClick={() => {
                  dialogState.resolve(dialogState.type === 'prompt' ? promptValue : true);
                  setDialogState(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-gray-950 dark:bg-primary text-white dark:text-gray-950 hover:bg-black dark:hover:bg-primaryDark text-xs font-bold transition-all shadow-md"
              >
                {dialogState.type === 'confirm' || dialogState.type === 'prompt' ? (lang === 'fr' ? 'Confirmer' : 'Confirm') : 'OK'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
