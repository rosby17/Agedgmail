import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu } from 'lucide-react';
import { supabase } from '../../supabaseClient';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from '../../utils/constants';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from '../../utils/helpers';
import { YouTubeLogo, GmailLogo, FacebookIcon, DiscordLogo, InstagramLogo, TwitterLogo, TikTokLogo, AppleLogo, TelegramLogo, SmsLogo, RedditLogo, MailGenericLogo, OutlookLogo, SnapchatLogo, AmazonLogo, GithubLogo } from '../ui/Logos';
import { Skeleton, SkeletonProductCard, SkeletonProductGrid, SkeletonRows, SkeletonMetricCards } from '../ui/Skeletons';
import { TypewriterText } from '../ui/TypewriterText';
import ProductCard from '../ui/ProductCard';
import DeliveredAccountCard from '../ui/DeliveredAccountCard';

const ProductVisual = ({ product = {}, iconSize = 48 }) => {
  if (product.image_url) {
    return <img src={product.image_url} alt={product.name || ''} className="w-full h-full object-contain" loading="lazy" />;
  }
  switch (resolveIcon(product)) {
    case 'youtube':   return <YouTubeLogo />;
    case 'gmail':     return <GmailLogo />;
    case 'facebook':  return <FacebookIcon className="w-full h-full object-contain p-3 text-blue-600" />;
    case 'instagram': return <InstagramLogo />;
    case 'tiktok':    return <TikTokLogo />;
    case 'twitter':   return <TwitterLogo />;
    case 'reddit':    return <RedditLogo />;
    case 'discord':   return <DiscordLogo />;
    case 'apple':     return <AppleLogo />;
    case 'telegram':  return <TelegramLogo />;
    case 'sms':       return <SmsLogo />;
    case 'mail':      return <MailGenericLogo />;
    case 'outlook':   return <OutlookLogo />;
    case 'snapchat':  return <SnapchatLogo />;
    case 'amazon':    return <AmazonLogo />;
    case 'github':    return <GithubLogo />;
    default: {
      const label = displayCategoryLabel(product) || 'Others';
      const color = AVATAR_COLORS[hashStr(label) % AVATAR_COLORS.length];
      return (
        <div className="w-full h-full rounded-2xl flex items-center justify-center font-black text-white" style={{ backgroundColor: color, fontSize: iconSize * 0.5 }}>
          {label.trim().charAt(0).toUpperCase() || '?'}
        </div>
      );
    }
  }
};
export default ProductVisual;
