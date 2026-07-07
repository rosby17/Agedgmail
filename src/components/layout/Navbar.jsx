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

const Navbar = ({ cartTotal, cartCount, navigate, session, profile, currentView, setActiveCategory, setActiveGroup, onCartClick, lang, setLang, theme, setTheme, t }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const go = (view, cat, group) => {
    setIsMobileMenuOpen(false);
    if (cat !== undefined && setActiveCategory) setActiveCategory(cat);
    if (group !== undefined && setActiveGroup) setActiveGroup(group);
    navigate(view);
  };
  const linkCls = (active) => `text-sm font-bold transition-colors ${active ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'}`;
  return (
  <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 font-sans">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
          className="lg:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <button onClick={() => navigate('')} className="h-10 flex items-center gap-3 group transition-all">
          <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAA2ZF5zZB5llhXjTZgvs64In3ytJg2FF_ek-KSm4bibJfw782IYaJSOV0Knvsmsuy_-PYMZlJp2iWO-tS2m2PBLuOiMGjhAV8_kzD9iQWOs6_dhwuhZCfBob0ZTq-oO131Htvb8G1tMAbz5fJlbqj4KbpEnBj0OIpWFUJmpCPQHQnv6k5fK9-FlMxX9UCNKVjE4jBej0HcFQB6je4WpnxANg0kP-0szIcnPZVSjDhlYnscIx5TNK88H1o1znlvXYZ7gV59gR7BNZDe" alt="AgedGmailYT" className="h-10 w-auto group-hover:scale-105 transition-transform duration-300" />
          <span className="font-headline-lg font-bold text-primary text-xl tracking-tighter hidden md:block">AgedGmailYT</span>
        </button>
      </div>

      {/* Menu central */}
      <nav className="hidden lg:flex items-center gap-8">
        <button onClick={() => go('shop', 'all', 'all')} className={linkCls(currentView === 'shop' || currentView === 'landing')}>{lang === 'fr' ? 'Catalogue' : 'Catalog'}</button>
        <button onClick={() => navigate('sms')} className={linkCls(currentView === 'sms')}>{t('sms')}</button>
        <button onClick={() => navigate('api')} className={linkCls(currentView === 'api')}>{t('api')}</button>
        {session && (
          <button onClick={() => navigate('dashboard')} className={linkCls(currentView === 'dashboard')}>{t('myOrders')}</button>
        )}
      </nav>

      <div className="flex items-center gap-4">
        {/* Language selector */}
        <div className="flex items-center text-sm font-bold font-sans tracking-wide">
          <button onClick={() => setLang('fr')} className={`transition-colors hover:text-primary ${lang === 'fr' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>FR</button>
          <span className="mx-3 text-gray-300 dark:text-gray-600">|</span>
          <button onClick={() => setLang('en')} className={`transition-colors hover:text-primary ${lang === 'en' ? 'text-primary' : 'text-gray-400 dark:text-gray-500'}`}>EN</button>
        </div>

        {session && session.user.email === ADMIN_EMAIL && (
          <button onClick={() => navigate('admin')} className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <Shield size={14} /> {t('admin')}
          </button>
        )}
        
        {/* Cart Button */}
        <button onClick={onCartClick} className="bg-gray-900 dark:bg-primary text-white dark:text-gray-900 px-3 md:px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-2 md:gap-3 hover:bg-black dark:hover:bg-primaryDark transition-all shadow-lg shadow-black/10 relative">
          <ShoppingCart size={18} />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />}
          <span className="hidden sm:inline border-l border-white/20 pl-2 md:pl-3">CART / ${cartTotal.toFixed(2)}</span>
        </button>

        {session ? (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('recharge')}
              className="hidden md:flex flex-col items-end border-r border-gray-100 dark:border-gray-700 pr-4 group/balance"
              title="Recharger mon solde"
            >
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest group-hover/balance:text-primary transition-colors flex items-center gap-1">
                {t('balance')} <Plus size={10} className="opacity-0 group-hover/balance:opacity-100 transition-opacity" />
              </span>
              <span className="text-sm font-bold text-primary font-price">${profile?.balance?.toFixed(2) || "0.00"}</span>
            </button>
            <NotificationBell session={session} lang={lang} />
            <div className="relative group">
              <button aria-label="Account menu" className="w-10 h-10 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100 dark:border-gray-700">
                <User size={18} />
              </button>
              {/* Menu déroulant au survol */}
              <div className="absolute right-0 top-full pt-2 w-52 opacity-0 invisible translate-y-1 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-150 z-50">
                <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-2xl p-2">
                  <button onClick={() => navigate('settings')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary transition-all">
                    <Settings size={16} /> {t('settings')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={() => navigate('auth')} className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-primary flex items-center gap-2 uppercase tracking-wider text-[11px]">
            <User size={18} /> LOGIN/SIGNUP
          </button>
        )}
      </div>
    </div>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="lg:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl z-50 animate-in slide-in-from-top-2">
        <div className="flex flex-col py-4 px-6 gap-4">
          <button onClick={() => go('shop', 'all', 'all')} className={`text-left p-2 rounded-lg ${currentView === 'shop' || currentView === 'landing' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
            {lang === 'fr' ? 'Catalogue' : 'Catalog'}
          </button>
          <button onClick={() => { setIsMobileMenuOpen(false); navigate('sms'); }} className={`text-left p-2 rounded-lg ${currentView === 'sms' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
            {t('sms')}
          </button>
          <button onClick={() => { setIsMobileMenuOpen(false); navigate('api'); }} className={`text-left p-2 rounded-lg ${currentView === 'api' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
            {t('api')}
          </button>
          {session && (
            <button onClick={() => { setIsMobileMenuOpen(false); navigate('dashboard'); }} className={`text-left p-2 rounded-lg ${currentView === 'dashboard' ? 'bg-primary/10 text-primary' : 'text-gray-600 dark:text-gray-300'}`}>
              {t('myOrders')}
            </button>
          )}
        </div>
      </div>
    )}
  </header>
  );
};
export default Navbar;
