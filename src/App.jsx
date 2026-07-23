import { X, MessageCircle, Headphones, Send, Upload, Mic, FileText } from 'lucide-react';
import { PRODUCTS as PRODUCTS_RAW } from './productsData';
import ProductView from './views/ProductView';
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { parseAccountDelivery } from './lib/parseAccountDelivery';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from './utils/constants';
import { TRANSLATIONS } from './utils/translations';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from './utils/helpers';
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
// Missing SupportChatWidget




const KeepAlive = ({ show, children }) => {
  const [hasRendered, setHasRendered] = useState(show);
  
  useEffect(() => {
    if (show && !hasRendered) {
      setHasRendered(true);
    }
  }, [show, hasRendered]);

  if (!hasRendered) return null;

  return (
    <div style={{ display: show ? 'block' : 'none', height: '100%', width: '100%' }}>
      {children}
    </div>
  );
};

const AttachmentPreview = ({ type, url, filename }) => {
  if (type === 'image') {
    return (
      <div className="relative group max-w-full my-1 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800">
        <img 
          src={url} 
          alt={filename || "Image attachment"} 
          className="max-w-full max-h-48 object-contain cursor-zoom-in hover:scale-[1.01] transition-transform duration-200"
          onClick={() => window.open(url, '_blank')}
        />
      </div>
    );
  }
  if (type === 'video') {
    return (
      <div className="my-1 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-800 bg-black">
        <video src={url} controls className="max-w-full max-h-48 object-contain w-full" />
      </div>
    );
  }
  if (type === 'audio') {
    return (
      <div className="my-1 py-1 rounded-xl bg-gray-50 dark:bg-slate-800/40 p-2 border border-gray-100 dark:border-slate-800">
        <audio src={url} controls className="w-full max-w-xs scale-95 origin-left" />
      </div>
    );
  }
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noreferrer" 
      className="flex items-center gap-2 my-1 px-3 py-2 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-850 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
    >
      <FileText size={14} className="text-gray-400" />
      <span className="truncate max-w-[150px]">{filename || 'Télécharger le fichier'}</span>
    </a>
  );
};

const SupportChatWidget = ({ session, profile }) => {
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);

  const userId = session?.user?.id;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || uploading || !userId) return;
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${randomId}-${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-attachments')
        .upload(filePath, file);
        
      if (uploadError) throw new Error(uploadError.message);
      
      const { data: { publicUrl } } = supabase.storage
        .from('chat-attachments')
        .getPublicUrl(filePath);

      let type = 'file';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';

      let tk = ticket;
      if (!tk) {
        const { data: created, error } = await supabase.from('support_tickets').insert({
          user_id: userId, user_email: session.user.email, subject: 'Support', status: 'open',
          last_sender: 'user', admin_unread: true, user_unread: false, last_message_at: new Date().toISOString(),
        }).select().single();
        if (error) throw new Error(error.message);
        tk = created; setTicket(created);
      }

      const { error: msgErr } = await supabase.from('support_messages').insert({
        ticket_id: tk.id, user_id: userId, sender: 'user', body: file.name,
        attachment_url: publicUrl, attachment_type: type
      });
      if (msgErr) throw new Error(msgErr.message);

      await supabase.from('support_tickets').update({
        last_message_at: new Date().toISOString(), last_sender: 'user', admin_unread: true, status: 'open',
      }).eq('id', tk.id);

      supabase.functions.invoke('support-notify', {
        body: {
          body: `[Fichier joint] ${file.name}`,
          user_email: session.user.email,
          display_name: profile?.display_name
        }
      }).catch(console.error);

      await loadTicket();
    } catch(err) {
      await window.showAlert("Erreur", 'Erreur d\'upload : ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Charge le ticket existant + ses messages, et l'état "non lu".
  const loadTicket = async () => {
    if (!userId) return;
    const { data: tk } = await supabase.from('support_tickets')
      .select('*').eq('user_id', userId).order('last_message_at', { ascending: false }).limit(1).maybeSingle();
    if (tk) {
      setTicket(tk);
      setHasUnread(!!tk.user_unread);
      const { data: msgs } = await supabase.from('support_messages')
        .select('*').eq('ticket_id', tk.id).order('created_at', { ascending: true });
      setMessages(msgs || []);
    }
  };

  useEffect(() => { if (userId) loadTicket(); }, [userId]);

  // Abonnement temps réel aux nouveaux messages de ce client.
  useEffect(() => {
    if (!userId || !supabase) return;
    const channel = supabase.channel(`support-user-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` },
        (payload) => {
          setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
          if (payload.new.sender === 'admin' && !open) setHasUnread(true);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, open]);

  // Auto-scroll en bas à chaque nouveau message / ouverture.
  useEffect(() => { if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, open]);

  // À l'ouverture : marque comme lu côté client.
  const openPanel = async () => {
    setOpen(true);
    setHasUnread(false);
    if (ticket?.user_unread) {
      await supabase.from('support_tickets').update({ user_unread: false }).eq('id', ticket.id);
    }
  };

  useEffect(() => {
    const handleOpen = () => openPanel();
    window.addEventListener('open-support-chat', handleOpen);
    return () => window.removeEventListener('open-support-chat', handleOpen);
  }, [ticket]);

  const send = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    let tk = ticket;
    if (!tk) {
      const { data: created, error } = await supabase.from('support_tickets').insert({
        user_id: userId, user_email: session.user.email, subject: 'Support', status: 'open',
        last_sender: 'user', admin_unread: true, user_unread: false, last_message_at: new Date().toISOString(),
      }).select().single();
      if (error) { setSending(false); await window.showAlert("Erreur", 'Erreur : ' + error.message); return; }
      tk = created; setTicket(created);
    }
    const { error: msgErr } = await supabase.from('support_messages').insert({
      ticket_id: tk.id, user_id: userId, sender: 'user', body,
    });
    if (msgErr) { setSending(false); await window.showAlert("Erreur", 'Erreur : ' + msgErr.message); return; }
    await supabase.from('support_tickets').update({
      last_message_at: new Date().toISOString(), last_sender: 'user', admin_unread: true, status: 'open',
    }).eq('id', tk.id);
    
    supabase.functions.invoke('support-notify', {
      body: {
        body,
        user_email: session.user.email,
        display_name: profile?.display_name
      }
    }).catch(console.error);

    setInput('');
    setSending(false);
  };

  if (!session) return null;

  return (
    <>
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="fixed bottom-6 right-6 z-[250] w-14 h-14 rounded-full bg-primary text-white dark:text-gray-900 shadow-2xl shadow-primary/30 flex items-center justify-center hover:bg-primaryDark transition-all"
        aria-label="Support"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && hasUnread && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[250] w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gray-900 text-white p-5 shrink-0">
            <h3 className="font-bold flex items-center gap-2">
              <img src="/logo.png" alt="Logo" className="w-6 h-6 object-contain rounded-md bg-white p-0.5" />
              Support AgedGmailYT
            </h3>
            <p className="text-[11px] text-gray-400 mt-0.5">On te répond au plus vite. Explique ton souci ici.</p>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-8">Aucun message pour l'instant. Écris-nous ci-dessous !</p>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 w-full ${m.sender === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                {m.sender !== 'user' && (
                  <img src="/logo.png" alt="Support" className="w-7 h-7 rounded-full object-contain bg-white shrink-0 mt-auto border border-gray-200" />
                )}
                <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                  <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                    {m.sender === 'user' ? (profile?.display_name || session?.user?.email?.split('@')[0] || 'Vous') : 'Support'}
                  </span>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-primary text-white dark:text-gray-900 rounded-br-sm shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm shadow-sm'}`}>
                    {m.attachment_url && (
                      <AttachmentPreview type={m.attachment_type} url={m.attachment_url} filename={m.body} />
                    )}
                    {(!m.attachment_url || m.body !== 'Message Vocal') && <div>{m.body}</div>}
                    <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-white/60 dark:text-gray-900/60' : 'text-gray-400'}`}>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                {m.sender === 'user' && (
                  <img src={profile?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.display_name || session?.user?.email || 'U')}&background=000&color=fff`} alt="Vous" className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto border border-gray-200 dark:border-gray-700" />
                )}
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 shrink-0">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept="image/*,video/*,audio/*,.pdf,.zip,.doc,.docx,.xls,.xlsx"
            />
            <button 
              onClick={() => fileInputRef.current?.click()} 
              disabled={sending || uploading}
              className="w-10 h-10 shrink-0 rounded-full bg-gray-105 dark:bg-gray-800 text-gray-500 dark:text-gray-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-750 transition-all disabled:opacity-40"
              title="Ajouter un fichier"
            >
              <Upload size={16} className={uploading ? 'animate-bounce' : ''} />
            </button>

            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              disabled={sending}
              placeholder="Écris ton message…"
              className="flex-grow px-4 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />

            <button onClick={send} disabled={sending || !input.trim()} className="w-10 h-10 shrink-0 rounded-full bg-primary text-white dark:text-gray-900 flex items-center justify-center hover:bg-primaryDark transition-all disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

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
    const path = window.location.pathname.replace(/^\/+/, '');
    if (path === 'myorders') return 'dashboard';
    if (path === 'sms') return 'sms';
    return path || 'landing';
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
    const pathName = viewName === 'dashboard' ? 'myorders' : viewName;
    const fullPath = queryString ? `/${pathName}?${queryString}` : `/${pathName}`;
    
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
        // Redirection après connexion : si le path est vide (racine), 'landing', ou 'auth', on les envoie vers le shop.
        if (event === 'SIGNED_IN') {
          const p = window.location.pathname.replace(/^\/+/, '');
          if (!p || p === 'auth' || p === 'landing') {
            navigate('shop');
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
          // Si on était sur une vue qui exige une session (dashboard, réglages,
          // recharge, admin), on repart proprement sur le catalogue au lieu de
          // laisser un écran vide (les vues protégées ne rendent rien sans session).
          const protectedViews = ['dashboard', 'myorders', 'settings', 'recharge', 'admin'];
          const p = window.location.pathname.replace(/^\/+/, '');
          if (protectedViews.includes(p)) {
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
      const path = window.location.pathname.replace(/^\/+/, '');
      if (path === 'myorders') {
        setCurrentView('dashboard');
      } else if (path === 'sms') {
        setCurrentView('sms');
      } else {
        setCurrentView(path || 'landing');
      }
    };

    window.addEventListener('popstate', handlePopState);

    const params = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash;

    if (rawHash.includes('type=recovery')) {
      setCurrentView('reset-password');
      window.history.replaceState(null, '', '/reset-password');
    } else if (rawHash.includes('access_token=') || rawHash.includes('error_description=') || rawHash.includes('error=')) {
      setCurrentView('shop');
    } else if (params.get('paymentStatus')) {
      setCurrentView('dashboard');
      window.history.replaceState(null, '', '/myorders');
    } else if (window.location.pathname.replace(/^\/+/, '') === 'sms') {
      setActiveCategory('sms');
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
        <KeepAlive show={currentView === 'sms'}><SmsView session={session} profile={profile} lang={lang} navigate={navigate} fetchProfile={fetchProfile} /></KeepAlive>
        <KeepAlive show={currentView === 'shop'}><HomeView activeGroup={activeGroup} setActiveGroup={setActiveGroup} activeCategory={activeCategory} setActiveCategory={setActiveCategory} sortBy={sortBy} setSortBy={setSortBy} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} onBuyNow={setQuickOrderProduct} groups={productGroups} subCategories={productSubCategories} groupOf={categoryVisual} lang={lang} t={t} loading={productsLoading} /></KeepAlive>
        <KeepAlive show={currentView === 'product' && !!selectedProduct}>
          {selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} onCartClick={() => setCartOpen(true)} onBuyNow={setQuickOrderProduct} lang={lang} />}
        </KeepAlive>
        <KeepAlive show={currentView === 'api'}><ApiView navigate={navigate} session={session} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'policies'}><PoliciesView navigate={navigate} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'auth'}><AuthView navigate={navigate} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'reset-password'}><ResetPasswordView navigate={navigate} lang={lang} /></KeepAlive>
        <KeepAlive show={currentView === 'dashboard'}><MyOrdersView profile={profile} navigate={navigate} orders={orders} onResume={(order) => { setResumeOrder(order); navigate('recharge'); }} session={session} fetchProfile={fetchProfile} lang={lang} t={t} loading={ordersLoading} /></KeepAlive>
        <KeepAlive show={currentView === 'settings'}><SettingsView profile={profile} navigate={navigate} fetchProfile={fetchProfile} session={session} lang={lang} t={t} /></KeepAlive>
        <KeepAlive show={currentView === 'recharge'}><RechargeView profile={profile} session={session} navigate={navigate} suggestedAmount={rechargeSuggestedAmount} setSuggestedAmount={setRechargeSuggestedAmount} fetchProfile={fetchProfile} resumeOrder={resumeOrder} clearResumeOrder={() => setResumeOrder(null)} lang={lang} t={t} /></KeepAlive>
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
                  className="px-5 py-2.5 rounded-xl border border-gray-150 dark:border-slate-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-all text-gray-650 dark:text-slate-350"
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
