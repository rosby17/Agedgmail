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
  const raw = order.credentials || order.data || "";
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col">
        <div className="bg-gray-900 p-8 text-white flex justify-between items-center shrink-0">
          <div><h3 className="text-xl font-bold">{cleanProductName(order.product_name, lang)}</h3><p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Tes identifiants de connexion</p></div>
          <button onClick={onClose} aria-label="Close" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-all"><X size={20} /></button>
        </div>

        <div className="p-10 space-y-6 overflow-y-auto custom-scrollbar">
          {lines.length === 0 ? (
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
