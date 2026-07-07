import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { Mic } from 'lucide-react';

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
      className="flex items-center gap-2 my-1 px-3 py-2 bg-gray-50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-xs font-bold text-gray-800 dark:text-gray-200"
    >
      <FileText size={14} className="text-gray-400" />
      <span className="truncate max-w-[150px]">{filename || 'Télécharger le fichier'}</span>
    </a>
  );
};

const SupportAdmin = ({ session }) => {
  const [tickets, setTickets] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('open'); // all, unread, open, resolved, archived

  const active = tickets.find(t => t.id === activeId) || null;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !active || uploading) return;
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const randomId = Math.random().toString(36).substring(2, 15);
      const fileName = `${randomId}-${Date.now()}.${fileExt}`;
      const filePath = `admin/${active.user_id}/${fileName}`;
      
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

      const { error: msgErr } = await supabase.from('support_messages').insert({
        ticket_id: active.id, user_id: active.user_id, sender: 'admin', body: file.name,
        attachment_url: publicUrl, attachment_type: type
      });
      if (msgErr) throw new Error(msgErr.message);

      await supabase.from('support_tickets').update({
        last_message_at: new Date().toISOString(), last_sender: 'admin', user_unread: true, admin_unread: false,
      }).eq('id', active.id);

      const { data: msgs } = await supabase.from('support_messages')
        .select('*').eq('ticket_id', active.id).order('created_at', { ascending: true });
      setMessages(msgs || []);
      loadTickets();
    } catch(err) {
      await window.showAlert("Erreur", 'Erreur d\'upload : ' + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadTickets = async () => {
    const { data } = await supabase.from('support_tickets')
      .select('*').order('last_message_at', { ascending: false });
      
    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(t => t.user_id))];
      const { data: profs } = await supabase.from('profiles').select('id, display_name').in('id', userIds);
      
      const profileMap = {};
      if (profs) profs.forEach(p => profileMap[p.id] = p.display_name);
      
      const enriched = data.map(t => ({ ...t, display_name: profileMap[t.user_id] || null }));
      setTickets(enriched);
    } else {
      setTickets([]);
    }
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
    if (error) { setSending(false); await window.showAlert("Erreur", 'Erreur : ' + error.message); return; }
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

  const toggleArchive = async () => {
    if (!active) return;
    await supabase.from('support_tickets').update({ status: active.status === 'archived' ? 'open' : 'archived' }).eq('id', active.id);
    loadTickets();
    if (active.status !== 'archived') setActiveId(null);
  };

  const deleteTicket = async () => {
    if (!active) return;
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette conversation ?")) return;
    await supabase.from('support_tickets').delete().eq('id', active.id);
    setActiveId(null);
    loadTickets();
  };

  const openCount = tickets.filter(t => t.admin_unread).length;

  const filteredTickets = tickets.filter(tk => {
    if (filter === 'unread') return tk.admin_unread;
    if (filter === 'open') return tk.status === 'open';
    if (filter === 'resolved') return tk.status === 'resolved';
    if (filter === 'archived') return tk.status === 'archived';
    return tk.status !== 'archived'; // 'all' shows everything except archived
  });

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-6 md:p-8 shadow-soft">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support / Chat</h2>
          <p className="text-xs text-gray-400 mt-1">{tickets.length} conversation(s){openCount > 0 && <span className="text-red-500 font-bold"> · {openCount} non lue(s)</span>}</p>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['all', 'unread', 'open', 'resolved', 'archived'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                filter === f 
                  ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-400 dark:hover:bg-slate-700'
              }`}
            >
              {f === 'all' && 'Tous'}
              {f === 'unread' && (
                <span className="flex items-center gap-1.5">
                  Non lus {openCount > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                </span>
              )}
              {f === 'open' && 'Ouverts'}
              {f === 'resolved' && 'Résolus'}
              {f === 'archived' && 'Archivés'}
            </button>
          ))}
          <button onClick={loadTickets} className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-400 hover:text-primary transition-all ml-2 shrink-0">
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[65vh]">
        {/* Liste des tickets */}
        <div className="lg:col-span-1 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800">
          {filteredTickets.length === 0 && <p className="p-6 text-center text-sm text-gray-400">Aucune conversation.</p>}
          {filteredTickets.map(tk => (
            <button key={tk.id} onClick={() => openTicket(tk)}
              className={`w-full text-left p-4 transition-all ${activeId === tk.id ? 'bg-primary/5' : 'hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-gray-900 dark:text-white truncate">
                  {tk.display_name ? `${tk.display_name} (${tk.user_email?.split('@')[0]})` : tk.user_email?.split('@')[0] || 'Client'}
                </span>
                {tk.admin_unread && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${tk.status === 'resolved' ? 'bg-gray-100 text-gray-500' : tk.status === 'archived' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                  {tk.status === 'resolved' ? 'Résolu' : tk.status === 'archived' ? 'Archivé' : 'Ouvert'}
                </span>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-gray-100 dark:border-slate-800 shrink-0 gap-3">
                <div className="font-bold text-gray-900 dark:text-white text-sm">
                  {active.display_name ? `${active.display_name} (${active.user_email})` : active.user_email}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button onClick={toggleResolved} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${active.status === 'resolved' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all`}>
                    {active.status === 'resolved' ? 'Résolu' : 'Marquer Résolu'}
                  </button>
                  <button onClick={toggleArchive} className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg ${active.status === 'archived' ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-all`}>
                    {active.status === 'archived' ? 'Désarchiver' : 'Archiver'}
                  </button>
                  <button onClick={deleteTicket} className="text-[10px] font-black uppercase px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all flex items-center gap-1">
                    <Trash2 size={12} /> Supprimer
                  </button>
                </div>
              </div>
              <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-slate-950">
                {messages.map(m => (
                  <div key={m.id} className={`flex gap-2 w-full ${m.sender === 'admin' ? 'justify-end' : 'justify-start'} mb-3`}>
                    {m.sender !== 'admin' && (
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(active.display_name || active.user_email || 'U')}&background=000&color=fff`} alt="Client" className="w-7 h-7 rounded-full object-cover shrink-0 mt-auto border border-gray-200 dark:border-slate-700" />
                    )}
                    <div className={`flex flex-col ${m.sender === 'admin' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      <span className="text-[10px] text-gray-400 mb-0.5 px-1 font-medium">
                        {m.sender === 'admin' ? 'Support' : active.display_name || active.user_email?.split('@')[0] || 'Client'}
                      </span>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'admin' ? 'bg-primary text-white dark:text-gray-900 rounded-br-sm shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-slate-700 rounded-bl-sm shadow-sm'}`}>
                        {m.attachment_url && (
                          <AttachmentPreview type={m.attachment_type} url={m.attachment_url} filename={m.body} />
                        )}
                        {(!m.attachment_url || m.body !== 'Message Vocal') && <div>{m.body}</div>}
                        <div className={`text-[9px] mt-1 ${m.sender === 'admin' ? 'text-white/60 dark:text-gray-900/60' : 'text-gray-400'}`}>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                    {m.sender === 'admin' && (
                      <img src="/logo.png" alt="Support" className="w-7 h-7 rounded-full object-contain bg-white shrink-0 mt-auto border border-gray-200" />
                    )}
                  </div>
                ))}
                {messages.length === 0 && <p className="text-center text-xs text-gray-400 py-8">Aucun message.</p>}
              </div>
              <div className="p-3 border-t border-gray-100 dark:border-slate-800 flex items-center gap-2 shrink-0">
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
                  className="w-10 h-10 shrink-0 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-755 transition-all disabled:opacity-40"
                  title="Ajouter un fichier"
                >
                  <Upload size={16} className={uploading ? 'animate-bounce' : ''} />
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') reply(); }}
                  disabled={sending}
                  placeholder="Répondre…"
                  className="flex-grow px-4 py-2.5 rounded-full bg-gray-50 dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 text-sm outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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
