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
import OrdersAdmin from './OrdersAdmin';
import SettingsTab from './SettingsTab';

const SupportAdmin = ({ session }) => {
  const [tickets, setTickets] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = React.useRef(null);

  const active = tickets.find(t => t.id === activeId) || null;

  const loadTickets = async () => {
    const { data } = await supabase.from('support_tickets')
      .select('*').order('last_message_at', { ascending: false });
    setTickets(data || []);
  };

  useEffect(() => { loadTickets(); }, []);

  // Temps réel : toute nouvelle activité (message ou ticket) rafraîchit la liste,
  // et si le message concerne la conversation ouverte, on l'ajoute en direct.
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase.channel('support-admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'support_tickets' }, () => loadTickets())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages' }, (payload) => {
        setMessages(prev => (payload.new.ticket_id === activeIdRef.current && !prev.some(m => m.id === payload.new.id))
          ? [...prev, payload.new] : prev);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Ref pour que le callback realtime lise toujours le ticket actif courant.
  const activeIdRef = React.useRef(activeId);
  useEffect(() => { activeIdRef.current = activeId; }, [activeId]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const openTicket = async (tk) => {
    setActiveId(tk.id);
    const { data: msgs } = await supabase.from('support_messages')
      .select('*').eq('ticket_id', tk.id).order('created_at', { ascending: true });
    setMessages(msgs || []);
    if (tk.admin_unread) {
      await supabase.from('support_tickets').update({ admin_unread: false }).eq('id', tk.id);
      loadTickets();
    }
  };

  const reply = async () => {
    const body = input.trim();
    if (!body || !active || sending) return;
    setSending(true);
    const { error } = await supabase.from('support_messages').insert({
      ticket_id: active.id, user_id: active.user_id, sender: 'admin', body,
    });
    if (error) { setSending(false); alert('Erreur : ' + error.message); return; }
    await supabase.from('support_tickets').update({
      last_message_at: new Date().toISOString(), last_sender: 'admin', user_unread: true, admin_unread: false,
    }).eq('id', active.id);
    setInput('');
    setSending(false);
  };

  const toggleResolved = async () => {
    if (!active) return;
    await supabase.from('support_tickets').update({ status: active.status === 'open' ? 'resolved' : 'open' }).eq('id', active.id);
    loadTickets();
  };

  const openCount = tickets.filter(t => t.admin_unread).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-6 md:p-8 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support / Chat</h2>
          <p className="text-xs text-gray-400 mt-1">{tickets.length} conversation(s){openCount > 0 && <span className="text-red-500 font-bold"> · {openCount} non lue(s)</span>}</p>
        </div>
        <button onClick={loadTickets} className="p-2 rounded-xl border border-gray-100 dark:border-slate-700 text-gray-400 hover:text-primary transition-all"><RefreshCcw size={16} /></button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[65vh]">
        {/* Liste des tickets */}
        <div className="lg:col-span-1 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
          {tickets.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Aucune conversation.</p>}
          {tickets.map(tk => (
            <button key={tk.id} onClick={() => openTicket(tk)}
              className={`w-full text-left p-4 transition-all ${activeId === tk.id ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white truncate">{tk.user_email || 'Client'}</span>
                {tk.admin_unread && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tk.status === 'resolved' ? 'bg-gray-100 text-gray-500' : 'bg-green-100 text-green-700'}`}>{tk.status === 'resolved' ? 'Résolu' : 'Ouvert'}</span>
                <span className="text-[10px] text-gray-400">{new Date(tk.last_message_at).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="lg:col-span-2 border border-gray-100 dark:border-slate-800 rounded-2xl flex flex-col overflow-hidden">
          {!active ? (
            <div className="flex-grow flex items-center justify-center text-gray-400 text-sm">Sélectionne une conversation.</div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
                <div className="font-bold text-gray-900 dark:text-white text-sm">{active.user_email}</div>
                <button onClick={toggleResolved} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${active.status === 'open' ? 'bg-gray-900 text-white dark:text-gray-900 hover:bg-primary' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all`}>
                  {active.status === 'open' ? 'Marquer résolu' : 'Rouvrir'}
                </button>
              </div>
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-950">
                {messages.map(m => (
                  <div key={m.id} className={`flex ${m.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'admin' ? 'bg-primary text-white dark:text-gray-900 rounded-br-sm' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-bl-sm'}`}>
                      {m.body}
                      <div className={`text-[9px] mt-1 ${m.sender === 'admin' ? 'text-white/60' : 'text-gray-400'}`}>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && <p className="text-center text-xs text-gray-400 py-8">Aucun message.</p>}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') reply(); }}
                  placeholder="Répondre…"
                  className="flex-grow px-4 py-2.5 rounded-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                />
                <button onClick={reply} disabled={sending || !input.trim()} className="w-10 h-10 shrink-0 rounded-full bg-primary text-white dark:text-gray-900 flex items-center justify-center hover:bg-primaryDark transition-all disabled:opacity-40"><Send size={16} /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default SupportAdmin;
