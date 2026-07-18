import FAQSection from '../components/ui/FAQSection';
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
import SupportAdmin from './SupportAdmin';
import OrdersAdmin from './OrdersAdmin';
import SettingsTab from './SettingsTab';

const LandingView = ({ navigate, session, products = [], setSelectedProduct, lang, setLang }) => {
  const topProductsRaw = [...products]
    .sort((a, b) => (b.sales || 0) - (a.sales || 0))
    .slice(0, 3)
    .sort((a, b) => b.price - a.price);
  const topProducts = [];
  if (topProductsRaw.length > 0) {
    if (topProductsRaw.length === 1) topProducts.push(topProductsRaw[0]);
    if (topProductsRaw.length === 2) { topProducts.push(topProductsRaw[1]); topProducts.push(topProductsRaw[0]); }
    if (topProductsRaw.length >= 3) {
      topProducts.push(topProductsRaw[1]); // #2 seller
      topProducts.push(topProductsRaw[0]); // #1 seller
      topProducts.push(topProductsRaw[2]); // #3 seller
    }
  }

  const handleProductSelect = (product) => {
    if (setSelectedProduct) setSelectedProduct(product);
    navigate('product');
  };

  useEffect(() => {
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal-target');
    revealElements.forEach(el => observer.observe(el));

    const btns = document.querySelectorAll('.btn-magnetic');
    const handleMouseMove = (e) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px) scale(1.02)`;
    };
    const handleMouseLeave = (e) => {
      e.currentTarget.style.transform = 'translate(0px, 0px) scale(1)';
    };

    btns.forEach(btn => {
      btn.addEventListener('mousemove', handleMouseMove);
      btn.addEventListener('mouseleave', handleMouseLeave);
    });

    return () => {
      revealElements.forEach(el => observer.unobserve(el));
      btns.forEach(btn => {
        btn.removeEventListener('mousemove', handleMouseMove);
        btn.removeEventListener('mouseleave', handleMouseLeave);
      });
    };
  }, [products]);

  const scrollToSection = (e, targetId) => {
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="font-body-md bg-l-background text-on-surface grid-bg">

      <main>
        <section className="relative pt-52 pb-32 overflow-hidden min-h-screen flex items-center">
          <div className="ambient-glow -top-40 -left-40"></div>
          <div className="ambient-glow bottom-0 -right-40 opacity-60"></div>
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid grid-cols-1 lg:grid-cols-2 gap-24 items-center relative z-10">
            <div className="reveal-target opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-l-primary/20 bg-l-primary/5 mb-8">
                <span className="w-2 h-2 rounded-full bg-l-primary animate-pulse"></span>
                <span className="font-label-sm text-[10px] text-l-primary uppercase tracking-[0.2em]">{lang === 'fr' ? 'LE MEILLEUR DES COMPTES SOCIAUX' : 'THE BEST SOCIAL ACCOUNTS'}</span>
              </div>
              <h1 className="font-headline-lg text-5xl md:text-7xl text-on-surface leading-[1.1] mb-8 font-extrabold">
                {lang === 'fr' ? 'Comptes' : 'Accounts'} <br className="hidden md:block"/>
                <span className="relative inline-block text-l-primary z-10 mt-1 mb-2">
                  <TypewriterText words={['Gmail', 'Facebook', 'Instagram', 'Snapchat', 'Twitter', 'TikTok']} />
                  <svg className="absolute -bottom-2 left-0 w-full h-3 -z-10 text-l-primary/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                    <path d="M0,8 Q50,0 100,8 L100,12 Q50,4 0,12 Z" fill="currentColor"/>
                  </svg>
                </span>
                <br className="hidden md:block"/> {lang === 'fr' ? 'Qualité Premium.' : 'Premium Quality.'}
              </h1>
              <p className="font-body-md text-on-surface-variant text-lg md:text-xl mb-12 max-w-xl leading-relaxed">
                {lang === 'fr' 
                  ? 'Accédez à des comptes vérifiés (USA, Inde, France, Espagne, etc.) et optimisés pour percer à l\'international sans blocages. Dominez votre marché dès aujourd\'hui.' 
                  : 'Get instant access to verified accounts (USA, India, France, Spain, etc.) ready for your international marketing campaigns without shadowbans.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <button onClick={() => navigate('shop')} className="btn-magnetic group flex items-center justify-center gap-3 bg-l-primary text-white dark:text-gray-900 px-10 py-5 rounded-2xl font-bold text-lg hover:scale-105 transition-all duration-300 emerald-glow shadow-2xl">
                  {lang === 'fr' ? 'Acheter un compte' : 'Buy an Account'}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </button>
                <button onClick={() => navigate('shop')} className="btn-magnetic flex items-center justify-center gap-2 border border-white/10 glass text-on-surface hover:bg-white/5 px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300">
                  {lang === 'fr' ? 'Voir le catalogue' : 'View Catalog'}
                </button>
              </div>
            </div>
            <div className="reveal-target opacity-0 relative" style={{ animationDelay: '0.4s' }}>
              <div className="glass glass-glow rounded-[40px] p-6 border-white/10 shadow-2xl transform lg:rotate-3 hover:rotate-0 transition-transform duration-1000">
                <div className="bg-surface-container rounded-3xl overflow-hidden border border-white/5">
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-error/40"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                      <div className="w-3 h-3 rounded-full bg-l-primary/40"></div>
                    </div>
                    <div className="text-[10px] font-label-sm text-on-surface-variant">{lang === 'fr' ? 'VÉRIFICATION SYSTÈME' : 'SYSTEM CHECK'}</div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-headline-lg font-bold text-lg">{lang === 'fr' ? 'Tableau de bord' : 'Dashboard'}</h4>
                      <span className="text-l-primary text-xs font-bold px-3 py-1 bg-l-primary/10 rounded-lg">{lang === 'fr' ? 'Actif' : 'Active'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-on-surface-variant mb-1">{lang === 'fr' ? 'Score de confiance' : 'Trust Score'}</p>
                        <p className="text-xl font-bold text-l-primary">98%</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-on-surface-variant mb-1">{lang === 'fr' ? 'Cohérence' : 'Consistency'}</p>
                        <p className="text-xl font-bold text-on-surface">{lang === 'fr' ? 'Bon' : 'Good'}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-on-surface-variant mb-1">{lang === 'fr' ? 'Score de qualité' : 'Consistent Score'}</p>
                        <p className="text-xl font-bold text-l-primary">100%</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-on-surface-variant mb-1">{lang === 'fr' ? 'Empreinte digitale' : 'Fingerprint Scan'}</p>
                        <p className="text-xl font-bold text-on-surface">{lang === 'fr' ? 'Propre' : 'Clean'}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-on-surface-variant mb-1">{lang === 'fr' ? 'Géolocalisation' : 'Geo-Location'}</p>
                        <p className="text-xl font-bold text-on-surface">US</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[10px] uppercase text-on-surface-variant mb-1">{lang === 'fr' ? 'Détection anti-masque' : 'NoMask Detect'}</p>
                        <p className="text-xl font-bold text-l-primary">{lang === 'fr' ? 'Réussi' : 'Passed'}</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-l-primary/5 rounded-xl border border-l-primary/20">
                        <div className="w-8 h-8 rounded-lg bg-l-primary/20 flex items-center justify-center">
                          <span className="material-symbols-outlined text-l-primary text-sm">verified</span>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 w-24 bg-l-primary/30 rounded-full mb-1"></div>
                          <div className="h-1.5 w-16 bg-white/10 rounded-full"></div>
                        </div>
                        <span className="text-[10px] font-bold text-l-primary">{lang === 'fr' ? 'VÉRIFIÉ' : 'VERIFIED'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -left-12 glass p-8 rounded-3xl border-l-primary/20 shadow-2xl hidden md:block reveal-target opacity-0" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-8">
                  <div>
                    <p className="text-4xl font-extrabold text-l-primary leading-none mb-1">99.9%</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{lang === 'fr' ? 'Taux de succès' : 'Success Rate'}</p>
                  </div>
                  <div className="h-12 w-px bg-white/10"></div>
                  <div>
                    <p className="text-4xl font-extrabold text-on-surface leading-none mb-1">5k+</p>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-on-surface-variant">{lang === 'fr' ? 'Utilisateurs' : 'Users'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap relative">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="text-center mb-24 reveal-target opacity-0">
              <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface mb-6 font-extrabold">{lang === 'fr' ? 'Pourquoi choisir nos comptes premiums ?' : 'Why choose our premium accounts?'}</h2>
              <p className="font-body-md text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed">{lang === 'fr' ? 'Les algorithmes sociaux sont de plus en plus stricts. Ne laissez pas des blocages freiner votre croissance internationale.' : 'Social algorithms are getting stricter. Do not let blocks slow down your international growth.'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass p-12 rounded-[40px] hover:border-l-primary/30 transition-all duration-500 reveal-target opacity-0 group" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10 border border-white/5 group-hover:border-l-primary/20 group-hover:bg-l-primary/5 transition-all">
                  <span className="material-symbols-outlined text-l-primary text-4xl">public</span>
                </div>
                <h4 className="font-headline-lg text-2xl text-on-surface mb-5 font-bold">{lang === 'fr' ? 'Audience Internationale' : 'Global Audience'}</h4>
                <p className="text-on-surface-variant leading-relaxed">{lang === 'fr' ? 'Des comptes géo-localisés (US, Inde, Espagne, etc.) pour cibler précisément les audiences les plus monétisables sans restrictions.' : 'Geo-localized accounts (US, India, Spain, etc.) to accurately target the most monetizable audiences without restrictions.'}</p>
              </div>
              <div className="glass p-12 rounded-[40px] hover:border-l-primary/30 transition-all duration-500 reveal-target opacity-0 group" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10 border border-white/5 group-hover:border-l-primary/20 group-hover:bg-l-primary/5 transition-all">
                  <span className="material-symbols-outlined text-l-primary text-4xl">shield_person</span>
                </div>
                <h4 className="font-headline-lg text-2xl text-on-surface mb-5 font-bold">{lang === 'fr' ? 'Haute Autorité' : 'High Authority'}</h4>
                <p className="text-on-surface-variant leading-relaxed">{lang === 'fr' ? 'Un historique solide qui évite les shadowbans systématiques des nouveaux comptes.' : 'A solid history that avoids the systematic shadowbans of new accounts.'}</p>
              </div>
              <div className="glass p-12 rounded-[40px] hover:border-l-primary/30 transition-all duration-500 reveal-target opacity-0 group" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-10 border border-white/5 group-hover:border-l-primary/20 group-hover:bg-l-primary/5 transition-all">
                  <span className="material-symbols-outlined text-l-primary text-4xl">verified</span>
                </div>
                <h4 className="font-headline-lg text-2xl text-on-surface mb-5 font-bold">{lang === 'fr' ? 'Sécurité 2FA Incluse' : '2FA Security Included'}</h4>
                <p className="text-on-surface-variant leading-relaxed">{lang === 'fr' ? 'Livrés avec les codes de secours ou clé TOTP pour vous garantir l\'accès exclusif à vie.' : 'Delivered with backup codes or TOTP keys to ensure exclusive lifetime access.'}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap relative overflow-hidden" id="features">
          <div className="ambient-glow -right-40 top-1/4 opacity-40"></div>
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
              <div className="reveal-target opacity-0">
                <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface mb-10 leading-tight font-extrabold">{lang === 'fr' ? 'La puissance d\'un compte établi entre vos mains.' : 'The power of an established account in your hands.'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                  <div className="group">
                    <span className="material-symbols-outlined text-l-primary text-3xl mb-5 group-hover:scale-110 transition-transform block">verified_user</span>
                    <h5 className="font-headline-lg font-bold text-lg text-on-surface mb-3">{lang === 'fr' ? 'Historique Propre' : 'Clean History'}</h5>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{lang === 'fr' ? 'Comptes sans aucune infraction passée, prêts pour l\'usage pro.' : 'Accounts with no past violations, ready for pro use.'}</p>
                  </div>
                  <div className="group">
                    <span className="material-symbols-outlined text-l-primary text-3xl mb-5 group-hover:scale-110 transition-transform block">bolt</span>
                    <h5 className="font-headline-lg font-bold text-lg text-on-surface mb-3">{lang === 'fr' ? 'Livraison Instantanée' : 'Instant Delivery'}</h5>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{lang === 'fr' ? 'Vos accès sont envoyés automatiquement après validation du paiement.' : 'Your access is sent automatically after payment validation.'}</p>
                  </div>
                  <div className="group">
                    <span className="material-symbols-outlined text-l-primary text-3xl mb-5 group-hover:scale-110 transition-transform block">payments</span>
                    <h5 className="font-headline-lg font-bold text-lg text-on-surface mb-3">{lang === 'fr' ? 'Paiement Sécurisé' : 'Secure Payment'}</h5>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{lang === 'fr' ? 'Binance Pay, USDT et Mobile Money acceptés.' : 'Binance Pay, USDT, and Mobile Money accepted.'}</p>
                  </div>
                  <div className="group">
                    <span className="material-symbols-outlined text-l-primary text-3xl mb-5 group-hover:scale-110 transition-transform block">headset_mic</span>
                    <h5 className="font-headline-lg font-bold text-lg text-on-surface mb-3">{lang === 'fr' ? 'Support 24/7' : '24/7 Support'}</h5>
                    <p className="text-on-surface-variant text-sm leading-relaxed">{lang === 'fr' ? 'Une équipe technique à votre écoute pour toute intégration.' : 'A technical team at your disposal for any integration.'}</p>
                  </div>
                </div>
              </div>
              <div className="relative reveal-target opacity-0" style={{ animationDelay: '0.3s' }}>
                <div className="aspect-square rounded-[60px] glass overflow-hidden border-white/5 p-4">
                  <div className="w-full h-full rounded-[48px] bg-cover bg-center" style={{ backgroundImage: "url('/images/features_dashboard.png')" }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap relative" id="catalogue">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-10 reveal-target opacity-0">
              <div className="max-w-2xl">
                <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface mb-8 font-extrabold">{lang === 'fr' ? 'Nos Best-Sellers US' : 'Our US Best Sellers'} <br/>{lang === 'fr' ? 'Livraison immédiate' : 'Instant delivery'}</h2>
                <p className="font-body-md text-on-surface-variant text-lg leading-relaxed">{lang === 'fr' ? 'Payez par Crypto (Binance Pay) ou Mobile Money.' : 'Pay with Crypto (Binance Pay) or Mobile Money.'}</p>
              </div>
              <button onClick={() => navigate('shop')} className="bg-white/5 border border-white/10 text-on-surface px-10 py-5 rounded-2xl font-bold hover:bg-l-primary hover:text-white dark:text-gray-900 hover:border-l-primary transition-all duration-500">
                {lang === 'fr' ? 'Accéder au catalogue complet' : 'Access the full catalog'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {topProducts.map((product, idx) => {
                const isCenter = topProducts.length >= 3 ? idx === 1 : idx === 0;
                const delay = `${0.1 * (idx + 1)}s`;
                
                const rank = topProductsRaw.indexOf(product) + 1;
                let badgeText = `Top Vente #${rank}`;
                let subtitle = "Très demandé";
                if (rank === 1) {
                  badgeText = "Top 1 des ventes";
                  subtitle = "Choix N°1 des créateurs";
                }
                // Slogan neutre par défaut (le produit n'est pas toujours un Gmail)
                const tagline = product.details?.note || (lang === 'fr' ? 'Qualité premium vérifiée' : 'Verified premium quality');

                if (isCenter) {
                  return (
                    <div key={product.id} className="glass glass-glow rounded-[48px] p-12 flex flex-col border-l-primary/40 relative overflow-hidden transform md:scale-105 shadow-[0_0_80px_rgba(78,223,159,0.1)] reveal-target opacity-0" style={{ animationDelay: delay }}>
                      <div className="absolute top-12 right-[-45px] bg-l-primary text-white dark:text-gray-900 px-12 py-1.5 rotate-45 font-bold text-[10px] uppercase tracking-widest shadow-xl">{lang === 'fr' ? 'Meilleur Choix' : 'Best Choice'}</div>
                      <div className="mb-10">
                        <span className="bg-l-primary text-white dark:text-gray-900 px-5 py-2 rounded-full text-[11px] font-bold font-label-sm uppercase tracking-widest">{badgeText}</span>
                      </div>
                      <h3 className="font-headline-lg text-3xl mb-3 font-bold">{cleanProductName(product.name, lang)}</h3>
                      <p className="text-l-primary font-label-sm text-sm mb-8 font-medium">{subtitle}</p>
                      <p className="text-on-surface-variant mb-12 flex-grow leading-relaxed">"{tagline}".</p>
                      <div className="text-5xl font-extrabold text-on-surface mb-12">${product.price}</div>
                      <button onClick={() => handleProductSelect(product)} className="w-full bg-l-primary text-white dark:text-gray-900 py-5 rounded-2xl font-bold transition-all duration-300 emerald-glow shadow-xl">{lang === 'fr' ? 'Acheter maintenant' : 'Buy Now'}</button>
                    </div>
                  );
                }

                return (
                  <div key={product.id} className="glass p-10 rounded-[40px] hover:border-l-primary/30 transition-all duration-500 reveal-target opacity-0 flex flex-col" style={{ animationDelay: delay }}>
                    <div className="mb-6 flex justify-between items-start">
                      <span className="font-label-sm text-[10px] uppercase tracking-widest text-on-surface-variant font-bold bg-white/5 px-3 py-1.5 rounded-full">{badgeText}</span>
                    </div>
                    <h3 className="font-headline-lg text-3xl mb-3 font-bold">{cleanProductName(product.name, lang)}</h3>
                    <p className="text-l-primary font-label-sm text-sm mb-8 font-medium">{subtitle}</p>
                    <p className="text-on-surface-variant mb-12 flex-grow leading-relaxed">"{tagline}".</p>
                    <div className="text-5xl font-extrabold text-on-surface mb-12">${product.price}</div>
                    <button onClick={() => handleProductSelect(product)} className="w-full bg-white/5 border border-white/10 py-5 rounded-2xl font-bold hover:bg-l-primary hover:text-white dark:text-gray-900 transition-all duration-300">{lang === 'fr' ? 'Sélectionner' : 'Select'}</button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-section-gap relative">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
            <div className="text-center mb-24 reveal-target opacity-0">
              <h2 className="font-headline-lg text-4xl md:text-5xl text-on-surface mb-6 font-extrabold">Ils dominent déjà le marché</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="glass p-10 rounded-[32px] reveal-target opacity-0 hover:border-white/20 transition-all duration-500" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-cover bg-center border border-white/10 shadow-lg" style={{ backgroundImage: "url('/images/testimonial_1.png')" }}></div>
                  <div>
                    <h6 className="font-headline-lg font-bold text-on-surface text-lg">Moussa K.</h6>
                    <p className="text-[11px] text-l-primary font-label-sm uppercase tracking-widest font-bold">Créateur YouTube</p>
                  </div>
                </div>
                <p className="text-on-surface-variant italic leading-relaxed text-lg">"Grâce à AgedGmailYT, j'ai pu lancer ma chaîne US depuis Dakar sans aucun blocage. Le reach est incroyable dès la première vidéo."</p>
              </div>
              <div className="glass p-10 rounded-[32px] reveal-target opacity-0 hover:border-white/20 transition-all duration-500" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-cover bg-center border border-white/10 shadow-lg" style={{ backgroundImage: "url('/images/testimonial_2.png')" }}></div>
                  <div>
                    <h6 className="font-headline-lg font-bold text-on-surface text-lg">Aisha B.</h6>
                    <p className="text-[11px] text-l-primary font-label-sm uppercase tracking-widest font-bold">Agence Marketing</p>
                  </div>
                </div>
                <p className="text-on-surface-variant italic leading-relaxed text-lg">"Le support est exceptionnel. La livraison a pris littéralement 30 secondes. Un outil indispensable pour nos clients en Afrique."</p>
              </div>
              <div className="glass p-10 rounded-[32px] reveal-target opacity-0 hover:border-white/20 transition-all duration-500" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-5 mb-8">
                  <div className="w-16 h-16 rounded-2xl bg-cover bg-center border border-white/10 shadow-lg" style={{ backgroundImage: "url('/images/testimonial_3.png')" }}></div>
                  <div>
                    <h6 className="font-headline-lg font-bold text-on-surface text-lg">Koffi D.</h6>
                    <p className="text-[11px] text-l-primary font-label-sm uppercase tracking-widest font-bold">Expert Automation</p>
                  </div>
                </div>
                <p className="text-on-surface-variant italic leading-relaxed text-lg">"L'historique des comptes est bluffant. On sent que ce ne sont pas des comptes farmés par des robots. Qualité premium garantie."</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-section-gap relative overflow-hidden">
          <div className="ambient-glow bottom-0 left-1/2 -translate-x-1/2 opacity-30"></div>
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10">
            <div className="glass rounded-[60px] p-16 md:p-32 text-center border-l-primary/20 reveal-target opacity-0 relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="font-headline-lg text-4xl md:text-6xl text-on-surface mb-10 font-extrabold leading-tight">Aujourd'hui, les créateurs d'élite propulsent leur business digital et encaissent leurs premiers 100 000€.</h2>
                <p className="font-body-md text-on-surface-variant text-xl mb-16 max-w-2xl mx-auto leading-relaxed">Profitez d'un RPM élevé et d'une croissance fulgurante. Vos comptes 'Aged' n'attendent que vous.</p>
                <div className="flex flex-col items-center gap-10">
                  <button onClick={() => navigate('shop')} className="bg-l-primary text-white dark:text-gray-900 px-16 py-7 rounded-2xl font-bold text-2xl hover:scale-110 transition-all duration-300 shadow-2xl shadow-l-primary/40 emerald-glow">
                    Acheter maintenant
                  </button>
                  <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-full border border-white/5">
                    <span className="material-symbols-outlined text-l-primary text-xl">verified</span>
                    <p className="font-label-sm text-on-surface-variant text-[11px] uppercase tracking-[0.15em] font-bold">Garantie de remplacement de 48h incluse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FAQSection />
      </main>
    </div>
  );
};
export default LandingView;
