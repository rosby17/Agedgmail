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

const CartDrawer = ({ open, onClose, cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, navigate, session, onCheckout }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[300] font-sans" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">Cart</h2>
          <button onClick={onClose} aria-label="Close cart" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:text-white transition-all"><X size={18} /></button>
        </div>

        <div className="flex-grow overflow-y-auto px-6 py-6">
          {cart.length === 0 ? (
            <div className="h-full flex items-center justify-center text-center py-20">
              <p className="text-gray-400 font-medium">Your cart is empty.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors flex items-center gap-2 mb-2">
                  <Trash2 size={12} /> Clear cart
                </button>
              )}
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/60 p-4 rounded-2xl">
                  <div className="w-14 h-14 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shrink-0 relative">
                    <ProductVisual product={item} iconSize={22} />
                  </div>
                  <div className="flex-grow min-w-0">
                    <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{cleanProductName(item.name)}</h4>
                    <p className="text-primary font-bold text-sm">${item.price.toFixed(2)}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700">
                        <button onClick={() => updateCartQuantity(item.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Minus size={11} /></button>
                        <div className="w-7 text-center font-bold text-xs">{item.quantity}</div>
                        <button onClick={() => updateCartQuantity(item.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Plus size={11} /></button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><Trash2 size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={() => { onClose(); navigate('shop'); }} className="text-xs font-bold text-primary hover:underline uppercase tracking-widest">Continue shopping</button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <span>Subtotal</span>
            <span className="font-bold text-gray-700 dark:text-gray-200">${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-black text-gray-900 dark:text-white">Total</span>
            <span className="font-black text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => { onClose(); session ? onCheckout() : navigate('auth'); }}
            disabled={cart.length === 0}
            className="w-full bg-primary text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-base hover:bg-primaryDark transition-all shadow-xl shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {session ? 'Checkout' : 'Log in to pay'}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CartDrawer;
