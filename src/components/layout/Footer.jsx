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

const Footer = ({ navigate, lang }) => (
  <footer className="border-t border-surface-container-high py-32 relative bg-l-background mt-auto">
    <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-20">
        <div className="col-span-1 md:col-span-2">
          <button onClick={() => navigate('')} className="flex items-center gap-3 mb-10 group transition-all text-left">
            <img alt="AgedGmailYT Icon" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA2ZF5zZB5llhXjTZgvs64In3ytJg2FF_ek-KSm4bibJfw782IYaJSOV0Knvsmsuy_-PYMZlJp2iWO-tS2m2PBLuOiMGjhAV8_kzD9iQWOs6_dhwuhZCfBob0ZTq-oO131Htvb8G1tMAbz5fJlbqj4KbpEnBj0OIpWFUJmpCPQHQnv6k5fK9-FlMxX9UCNKVjE4jBej0HcFQB6je4WpnxANg0kP-0szIcnPZVSjDhlYnscIx5TNK88H1o1znlvXYZ7gV59gR7BNZDe" />
            <span className="font-headline-lg font-bold text-xl text-on-surface">AgedGmailYT</span>
          </button>
          <p className="text-on-surface-variant max-w-sm mb-12 text-sm leading-relaxed">
            {lang === 'fr' ? "Solution Premium pour Créateurs Ambitieux. Nous fournissons l'infrastructure nécessaire à votre domination digitale globale." : "Premium Solution for Ambitious Creators. We provide the infrastructure needed for your global digital domination."}
          </p>
          <div className="flex flex-wrap gap-6 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-surface-container-high bg-white/5 opacity-80">
              <span className="material-symbols-outlined text-[14px] text-l-primary">currency_bitcoin</span>
              <span className="font-label-sm text-[9px] uppercase font-bold text-on-surface-variant">Crypto / Binance / USDT</span>
            </div>
            <div className="flex items-center gap-3 opacity-60">
              <span className="material-symbols-outlined text-l-primary text-lg">verified</span>
              <span className="font-label-sm uppercase tracking-widest text-[9px] font-bold text-on-surface">SÉCURISÉ SSL</span>
            </div>
          </div>
        </div>
        <div>
          <h6 className="font-headline-lg font-bold text-on-surface mb-8 uppercase tracking-widest text-[11px]">Navigation</h6>
          <ul className="space-y-6">
            <li><button onClick={() => navigate('shop')} className="text-on-surface-variant hover:text-l-primary transition-colors text-sm font-medium">{lang === 'fr' ? 'Catalogue' : 'Catalog'}</button></li>
            <li><button onClick={() => navigate('shop')} className="text-on-surface-variant hover:text-l-primary transition-colors text-sm font-medium">SMS</button></li>
            <li><button onClick={() => navigate('api')} className="text-on-surface-variant hover:text-l-primary transition-colors text-sm font-medium">API</button></li>
            <li><button onClick={() => navigate('dashboard')} className="text-on-surface-variant hover:text-l-primary transition-colors text-sm font-medium">{lang === 'fr' ? 'Mes commandes' : 'My Orders'}</button></li>
          </ul>
        </div>
        <div>
          <h6 className="font-headline-lg font-bold text-on-surface mb-8 uppercase tracking-widest text-[11px]">{lang === 'fr' ? 'Légal & Support' : 'Legal & Support'}</h6>
          <ul className="space-y-6">
            <li><button onClick={() => { window.scrollTo(0,0); navigate('policies'); }} className="text-on-surface-variant hover:text-l-primary transition-colors text-sm font-medium">{lang === 'fr' ? 'Conditions Générales' : 'Terms of Service'}</button></li>
            <li><button onClick={() => { window.scrollTo(0,0); navigate('policies'); }} className="text-on-surface-variant hover:text-l-primary transition-colors text-sm font-medium">{lang === 'fr' ? 'Confidentialité' : 'Privacy Policy'}</button></li>
            <li><button onClick={() => { window.scrollTo(0,0); navigate('policies'); }} className="text-on-surface-variant hover:text-l-primary transition-colors text-sm font-medium">Support</button></li>
            <li className="pt-8 flex items-center gap-4">
              <p className="text-[10px] text-on-surface-variant/60 leading-relaxed uppercase tracking-tighter">© 2026 AgedGmailYT. {lang === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="w-8 h-8 rounded-full border border-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-l-primary hover:bg-surface-container transition-all">
                <ChevronUp size={16} />
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
);


export default Footer;
