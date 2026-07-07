import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu } from 'lucide-react';
import { supabase } from '../../supabaseClient';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from '../../utils/constants';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from '../../utils/helpers';
import { YouTubeLogo, GmailLogo, FacebookIcon, DiscordLogo, InstagramLogo, TwitterLogo, TikTokLogo, AppleLogo, TelegramLogo, SmsLogo, RedditLogo, MailGenericLogo, OutlookLogo, SnapchatLogo, AmazonLogo, GithubLogo } from '../ui/Logos';
import { Skeleton, SkeletonProductCard, SkeletonProductGrid, SkeletonRows, SkeletonMetricCards } from '../ui/Skeletons';
import { TypewriterText } from '../ui/TypewriterText';
import ProductVisual from '../ui/ProductVisual';
import DeliveredAccountCard from '../ui/DeliveredAccountCard';

const ProductCard = ({ product, addToCart, navigate, setSelectedProduct, onBuyNow, lang, t }) => {
  const [added, setAdded] = useState(false);
  const isUS = product.name.toUpperCase().includes('US') || product.name.toUpperCase().includes('USA');
  const outOfStock = product.stock <= 0;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className={`group border rounded-[2rem] p-5 flex flex-col h-full font-sans transition-all duration-200 ${
      outOfStock
        ? 'bg-gray-50 dark:bg-gray-900/60 border-gray-100 dark:border-gray-800'
        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/[0.06] hover:-translate-y-0.5'
    }`}>
      {/* Logo Area */}
      <div
        className={`aspect-[1.5] rounded-[1.5rem] flex items-center justify-center mb-5 overflow-hidden cursor-pointer relative shrink-0 ${outOfStock ? 'bg-gray-100 dark:bg-gray-800/40' : 'bg-primarySoft dark:bg-gray-800/60'}`}
        onClick={() => { setSelectedProduct(product); navigate('product'); }}
      >
        <div className={`w-full h-full p-8 flex items-center justify-center transition-transform duration-300 ${outOfStock ? 'grayscale opacity-60' : 'group-hover:scale-[1.04]'}`}>
          <ProductVisual product={product} iconSize={48} />
        </div>
        {outOfStock ? (
          <div className="absolute top-4 right-4 bg-red-500 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-sm">{t('outOfStock')}</div>
        ) : (
          <>
            {isUS && product.category === 'email' && (
              <div className="absolute bottom-4 right-4 bg-primary text-white dark:text-gray-900 text-[10px] font-black px-2 py-1 rounded-md shadow-sm">US</div>
            )}
            <div className="absolute top-4 right-4 bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400 text-[9px] font-black uppercase px-2.5 py-1 rounded-full flex items-center gap-1">
              <Zap size={10} /> Instant
            </div>
          </>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow flex flex-col">
        <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${outOfStock ? 'text-gray-300 dark:text-gray-600' : 'text-gray-400'}`}>
          {displayCategoryLabel(product)}
        </div>
        <h3
          className={`text-[15px] font-bold leading-snug cursor-pointer mb-4 transition-colors ${outOfStock ? 'text-gray-400 dark:text-gray-500 hover:text-gray-500' : 'text-gray-900 dark:text-white hover:text-primary dark:hover:text-primaryLight'}`}
          onClick={() => { setSelectedProduct(product); navigate('product'); }}
        >
          {cleanProductName(product.name)}
        </h3>

        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Stock</div>
            {outOfStock ? (
              <div className="text-xs font-bold text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {t('outOfStock')}</div>
            ) : (
              <div className="text-xs font-bold text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {product.stock} left</div>
            )}
          </div>
          <div className="text-right">
            <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Price</div>
            <div className={`text-lg font-bold ${outOfStock ? 'text-gray-400 dark:text-gray-500' : 'text-primaryDark dark:text-primaryLight'}`}>${product.price.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onBuyNow(product)}
          disabled={outOfStock}
          className={`flex-grow h-12 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.97] flex items-center justify-center gap-2 ${outOfStock ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-lg shadow-primary/20'}`}
        >
          {outOfStock ? t('outOfStock') : t('buyNow')}
        </button>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          title="Add to cart"
          className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center transition-all active:scale-[0.94] border ${outOfStock ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : added ? 'bg-green-50 text-green-600 border-green-200' : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-primarySoft hover:text-primaryDark'}`}
        >
          {added ? <CheckCircle size={16} /> : <ShoppingCart size={16} />}
        </button>
      </div>
    </div>
  );
};
export default ProductCard;
