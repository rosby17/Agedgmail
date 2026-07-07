import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu } from 'lucide-react';
import { supabase } from '../../supabaseClient';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from '../../utils/constants';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from '../../utils/helpers';
import { YouTubeLogo, GmailLogo, FacebookIcon, DiscordLogo, InstagramLogo, TwitterLogo, TikTokLogo, AppleLogo, TelegramLogo, SmsLogo, RedditLogo, MailGenericLogo, OutlookLogo, SnapchatLogo, AmazonLogo, GithubLogo } from '../ui/Logos';
import { Skeleton, SkeletonProductCard, SkeletonProductGrid, SkeletonRows, SkeletonMetricCards } from '../ui/Skeletons';
import { TypewriterText } from '../ui/TypewriterText';
import ProductCard from '../ui/ProductCard';
import ProductVisual from '../ui/ProductVisual';
import DeliveredAccountCard from '../ui/DeliveredAccountCard';

const OrderCredentialsModal = ({ order, onClose, lang }) => {
  const isSms = order.product_name?.toLowerCase().includes('sms') || (order.delivery_data && typeof order.delivery_data === 'object' && (order.delivery_data.number || order.delivery_data.code || order.delivery_data.sms));
  
  const smsNumber = order.delivery_data?.number || "";
  const smsCode = order.delivery_data?.code || order.delivery_data?.sms || "";
  const smsProvider = order.delivery_data?.provider || "";

  const raw = order.credentials || order.data || "";
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
        <div className="bg-gray-900 p-8 text-white flex justify-between items-center shrink-0">
          <div><h3 className="text-xl font-bold">{cleanProductName(order.product_name, lang)}</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">{isSms ? 'Vérification SMS' : 'Tes identifiants de connexion'}</p></div>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          {isSms ? (
            <div className="space-y-8 py-4">
              <div className="bg-green-500/10 border-2 border-green-500/30 rounded-3xl p-8 flex flex-col items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-green-700 uppercase tracking-wider">SMS Réceptionné avec Succès</h4>
                  <p className="text-xs text-green-600/80 font-bold mt-1">
                    Facturé : ${order.price_usd || order.total_price || '1.00'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 relative group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Numéro Utilisé</label>
                  <span className="text-lg font-mono font-bold text-gray-900">{smsNumber}</span>
                  {smsNumber && (
                    <button 
                      onClick={() => navigator.clipboard.writeText(smsNumber)} 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  )}
                </div>

                <div className="bg-gray-50 border border-gray-100 rounded-3xl p-6 relative group">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Fournisseur SMS</label>
                  <span className="text-lg font-bold text-gray-900 capitalize">{smsProvider || "smscodes"}</span>
                </div>
              </div>

              <div className="bg-gray-900 rounded-3xl p-8 text-center space-y-4">
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest">CODE SMS REÇU</label>
                <div className="inline-block bg-white/10 px-8 py-4 rounded-2xl border border-white/10">
                  <span className="text-3xl md:text-4xl font-mono font-black text-white tracking-widest select-all">{smsCode}</span>
                </div>
                <div>
                  <button 
                    onClick={() => navigator.clipboard.writeText(smsCode)} 
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primaryDark transition-all"
                  >
                    <Copy size={14} /> Copier le code SMS
                  </button>
                </div>
              </div>
            </div>
          ) : lines.length === 0 ? (
            <div className="bg-gray-50 rounded-3xl p-10 border border-gray-100 text-center text-gray-400 font-bold">En attente de livraison…</div>
          ) : (
            <>
              <div className="flex justify-end">
                <button
                  onClick={() => navigator.clipboard.writeText(raw)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary hover:text-white dark:text-gray-900 transition-all shadow-sm"
                >
                  <Copy size={12} /> Tout copier
                </button>
              </div>
              {lines.map((line, i) => <DeliveredAccountCard key={i} raw={line} index={i} total={lines.length} />)}

              {/* Avertissement sécurité */}
              <div className="bg-red-50 border border-red-100 rounded-3xl p-6 space-y-2">
                <div className="flex items-center gap-2 text-red-600 font-black text-xs uppercase tracking-widest"><ShieldAlert size={14} /> Sécurité</div>
                <ul className="text-xs text-red-600/90 leading-relaxed space-y-1 list-disc list-inside">
                  <li>Ne partage jamais ces identifiants.</li>
                  <li>Change le mot de passe principal dès la première connexion.</li>
                  <li>Ne désactive pas la 2FA sans savoir pourquoi elle est active.</li>
                  <li>Si Google demande une vérification supplémentaire, contacte le support <span className="font-bold">avant</span> toute action.</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('open-support-chat'));
                  onClose();
                }}
                className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl border border-gray-200 text-gray-700 font-bold text-sm hover:border-primary hover:text-primary transition-all"
              >
                <MessageCircle size={16} /> Contacter le support
              </button>
            </>
          )}
        </div>

        <button onClick={onClose} className="w-full bg-gray-900 text-white dark:text-gray-900 py-5 rounded-2xl font-bold hover:bg-primary transition-all shadow-xl shadow-black/10 shrink-0">Fermer</button>
      </div>
    </div>
  );
};
export default OrderCredentialsModal;
