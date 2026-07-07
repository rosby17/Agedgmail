import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag } from 'lucide-react';
import { supabase } from './supabaseClient';
import { PRODUCTS as PRODUCTS_RAW } from './productsData';
import { parseAccountDelivery } from './lib/parseAccountDelivery';

// ==========================================
// CONFIGURATION ADMIN & SUPPORT
// ==========================================
const ADMIN_EMAIL = "rooseveltmkr@gmail.com";


const TypewriterText = ({ words }) => {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const timeout2 = setTimeout(() => setBlink((prev) => !prev), 500);
    return () => clearTimeout(timeout2);
  }, [blink]);

  useEffect(() => {
    if (index === words.length) {
      setIndex(0);
      return;
    }
    if (subIndex === words[index].length + 1 && !reverse) {
      const timer = setTimeout(() => setReverse(true), 2000);
      return () => clearTimeout(timer);
    }
    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }
    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? 50 : 120);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words]);

  return (
    <>
      {words[index].substring(0, subIndex)}
      <span className={`${blink ? 'opacity-100' : 'opacity-0'} transition-opacity duration-100 font-light`}>|</span>
    </>
  );
};

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
                    <p className="text-on-surface-variant text-sm leading-relaxed">{lang === 'fr' ? 'Recommandé : Binance Pay (0 frais). Dépôt minimum très bas.' : 'Recommended: Binance Pay (0 fees). Very low minimum deposit.'}</p>
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
                <p className="font-body-md text-on-surface-variant text-lg leading-relaxed">{lang === 'fr' ? 'Recommandé : Payez par Binance Pay sans limite de minimum. Pas de frais cachés.' : 'Recommended: Pay with Binance Pay with no minimum. No hidden fees.'}</p>
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

                if (isCenter) {
                  return (
                    <div key={product.id} className="glass glass-glow rounded-[48px] p-12 flex flex-col border-l-primary/40 relative overflow-hidden transform md:scale-105 shadow-[0_0_80px_rgba(78,223,159,0.1)] reveal-target opacity-0" style={{ animationDelay: delay }}>
                      <div className="absolute top-12 right-[-45px] bg-l-primary text-white dark:text-gray-900 px-12 py-1.5 rotate-45 font-bold text-[10px] uppercase tracking-widest shadow-xl">{lang === 'fr' ? 'Meilleur Choix' : 'Best Choice'}</div>
                      <div className="mb-10">
                        <span className="bg-l-primary text-white dark:text-gray-900 px-5 py-2 rounded-full text-[11px] font-bold font-label-sm uppercase tracking-widest">{badgeText}</span>
                      </div>
                      <h3 className="font-headline-lg text-3xl mb-3 font-bold">{cleanProductName(product.name, lang)}</h3>
                      <p className="text-l-primary font-label-sm text-sm mb-8 font-medium">{subtitle}</p>
                      <p className="text-on-surface-variant mb-12 flex-grow leading-relaxed">"{product.details?.note || 'Gmail US Premium'}".</p>
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
                    <p className="text-on-surface-variant mb-12 flex-grow leading-relaxed">"{product.details?.note || 'Gmail US Ready'}".</p>
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

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    {
      q: "Qu'est-ce qu'un compte AgedGmailYT ?",
      a: "Nous vendons tout type de comptes (récents, aged) sur de multiples plateformes (Gmail, Facebook, Twitter, TikTok, etc.). 'AgedGmailYT' est simplement le nom de notre plateforme. Les comptes Gmail US sont notre accroche principale, mais notre catalogue vous offre une grande variété de réseaux sociaux."
    },
    {
      q: "Vais-je subir un shadow ban avec ces comptes ?",
      a: "Un compte ne garantit pas l'absence de shadow ban si vous ne respectez pas les algorithmes. Cependant, nos comptes vous donnent l'immense avantage d'apparaître comme un utilisateur résidant hors du continent africain, ce qui est très difficile avec des comptes locaux. Ils maximisent vos chances, mais votre comportement dictera le reste."
    },
    {
      q: "Est-ce que ces comptes sont fiables pour percer sur YouTube ou ailleurs ?",
      a: "De nombreux créateurs ont acheté nos comptes et ont percé. Cependant, la clé reste la qualité de votre contenu. Nos adresses mails maximisent vos chances en vous offrant un profil solide dès le lancement, ce qui réduit drastiquement les risques de shadow ban initiaux."
    },
    {
      q: "La livraison est-elle vraiment instantanée ?",
      a: "Oui ! La livraison des comptes achetés est 100% instantanée, sans aucune validation manuelle. (Notez que la recharge de votre solde, elle, peut parfois nécessiter une validation manuelle selon le moyen de paiement, sauf pour les paiements Crypto/Binance qui sont 100% automatisés)."
    },
    {
      q: "Quels sont les moyens de paiement acceptés ?",
      a: "Nous acceptons principalement la Crypto (notamment USDT) ainsi que les principales solutions de Mobile Money."
    },
    {
      q: "Puis-je modifier les informations de sécurité ?",
      a: "Oui, dès réception, vous devenez propriétaire de la boîte mail. Vous pouvez modifier l'authentification (Google Authenticator) et le mot de passe. Nous conseillons de patienter au minimum 72 heures avant de tout modifier. Ensuite, le compte vous appartient à 100%."
    }
  ];

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-gutter">
        <div className="text-center mb-16 reveal-target opacity-0">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <span className="font-label-sm uppercase tracking-widest text-l-primary font-bold text-[10px]">FAQ</span>
          </div>
          <h3 className="font-headline-lg text-4xl md:text-5xl text-on-surface font-extrabold mb-6">
            Questions Fréquentes
          </h3>
          <p className="text-on-surface-variant text-lg">
            Tout ce que vous devez savoir avant de dominer l'algorithme.
          </p>
        </div>

        <div className="space-y-4 reveal-target opacity-0">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`glass rounded-2xl overflow-hidden transition-all duration-300 border ${openIndex === idx ? 'border-l-primary/30' : 'border-white/5 hover:border-white/20'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className={`font-bold text-lg transition-colors ${openIndex === idx ? 'text-l-primary' : 'text-on-surface'}`}>
                  {faq.q}
                </span>
                <span className={`material-symbols-outlined text-l-primary transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div 
                className={`px-8 overflow-hidden transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-on-surface-variant leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ==========================================
// COMPOSANTS UI STYLÉS
// ==========================================

const YouTubeLogo = ({ className = "" }) => (
  <img src="/youtube-logo.png" alt="YouTube" className={`w-full h-full object-contain scale-[1.5] ${className}`} />
);

const GmailLogo = ({ className = "" }) => (
  <img src="/gmail-logo.png" alt="Gmail" className={`w-full h-full object-contain scale-[1.5] ${className}`} />
);

const FacebookIcon = ({ className = "" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

// Logos de marque (SVG inline) pour les catégories importées sans logo dédié.
const brandBox = "w-full h-full object-contain p-3";
const DiscordLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#5865F2" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.865-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028 14.09 14.09 0 001.226-1.994.076.076 0 00-.041-.106 13.1 13.1 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.893.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.84 19.84 0 006.002-3.03.077.077 0 00.032-.056c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.331c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.086-2.157-2.42 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z" />
  </svg>
);
const InstagramLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs><radialGradient id="ig" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs>
    <rect width="24" height="24" rx="6" fill="url(#ig)"/>
    <path fill="none" stroke="#fff" strokeWidth="1.6" d="M8 3.5h8A4.5 4.5 0 0120.5 8v8a4.5 4.5 0 01-4.5 4.5H8A4.5 4.5 0 013.5 16V8A4.5 4.5 0 018 3.5z"/>
    <circle cx="12" cy="12" r="3.6" fill="none" stroke="#fff" strokeWidth="1.6"/>
    <circle cx="16.6" cy="7.4" r="1.1" fill="#fff"/>
  </svg>
);
const TwitterLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#000" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const TikTokLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path fill="#25F4EE" d="M9.4 8.9v-1a4.6 4.6 0 00-1-.1A4.7 4.7 0 004.3 15a4.7 4.7 0 01-.9-2.8 4.7 4.7 0 016-4.5z"/>
    <path fill="#000" d="M16.6 3h-2.9v11.6a2 2 0 11-1.4-1.9V9.7a4.9 4.9 0 00-.6 0A4.9 4.9 0 1016.2 15V8.9a6.3 6.3 0 003.7 1.2V7.2a3.5 3.5 0 01-3.3-3.5z"/>
    <path fill="#FE2C55" d="M17.6 6.2A3.5 3.5 0 0116.6 3h-.9a3.5 3.5 0 002.9 3.5zM12.9 11.9a2 2 0 00-1.4 3.7 2 2 0 01-.6-3.6 2 2 0 012 0z"/>
  </svg>
);
const AppleLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" fill="#000" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);
const TelegramLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#229ED9"/>
    <path fill="#fff" d="M5.5 11.8l11-4.24c.51-.19.96.12.79.9l-1.87 8.82c-.13.61-.5.76-1.01.47l-2.8-2.06-1.35 1.3c-.15.15-.28.28-.56.28l.2-2.85 5.19-4.69c.23-.2-.05-.31-.35-.11l-6.41 4.04-2.76-.86c-.6-.19-.61-.6.13-.89z"/>
  </svg>
);
const SmsLogo = ({ className = brandBox }) => (
  <img src="/sms-logo.png" alt="SMS" className={className.includes('object-') ? className : `${className} object-contain`} />
);
const RedditLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#FF4500"/>
    <path fill="#fff" d="M19 12a1.6 1.6 0 00-2.71-1.14 8.3 8.3 0 00-4.13-1.31l.7-3.3 2.3.49a1.14 1.14 0 102.13-.58L17 5.8a.36.36 0 00-.4-.2l-2.58.55a.36.36 0 00-.28.28l-.79 3.73a8.3 8.3 0 00-4.16 1.32A1.6 1.6 0 105 12.9a3.16 3.16 0 000 .55 3.5 3.5 0 00-.05.6c0 2.37 2.76 4.29 6.16 4.29s6.16-1.92 6.16-4.29a3.5 3.5 0 00-.05-.6A1.6 1.6 0 0019 12zm-9.83 1.31a1.02 1.02 0 111.02-1.02 1.02 1.02 0 01-1.02 1.02zm5.9 2.4a3.7 3.7 0 01-2.53.84 3.7 3.7 0 01-2.53-.84.32.32 0 01.44-.46 3.06 3.06 0 002.09.68 3.06 3.06 0 002.09-.68.32.32 0 11.44.46zm-.24-2.4a1.02 1.02 0 111.02-1.02 1.02 1.02 0 01-1.02 1.02z"/>
  </svg>
);
const MailGenericLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="1.5" y="4.5" width="21" height="15" rx="3" fill="#64748B"/>
    <path d="M3 6.5l9 6.5 9-6.5" fill="none" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const OutlookLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect x="10.5" y="2" width="11.5" height="20" rx="1.2" fill="#0364B8"/>
    <path fill="#0A2767" d="M10.5 12l11.5 5V4z" opacity=".35"/>
    <rect x="13" y="5" width="7" height="4" fill="#28A8EA"/>
    <rect x="13" y="10" width="7" height="4" fill="#0078D4"/>
    <rect x="13" y="15" width="7" height="4" fill="#0364B8"/>
    <rect x="1" y="6" width="13" height="12" rx="1.5" fill="#0F6CBD"/>
    <ellipse cx="7.5" cy="12" rx="4" ry="4.6" fill="#fff"/>
    <ellipse cx="7.5" cy="12" rx="2.5" ry="3" fill="#0F6CBD"/>
  </svg>
);
const SnapchatLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#FFFC00"/>
    <path fill="#000" d="M12 4.3c1.9 0 3.4 1.6 3.4 3.9 0 .5 0 1.2-.1 1.8.5.2 1 .1 1.4-.1.3-.1.6 0 .7.3.1.3 0 .6-.3.8-.5.3-1.2.6-2 .7 0 .3.1.5.2.7.4.9 1.4 1.7 2.6 2 .3.1.4.4.3.6-.2.5-1 .8-2.1.9-.1.2-.1.5-.2.7-.1.2-.3.3-.6.3-.4 0-.9-.1-1.4-.1-.6 0-1 .2-1.5.5-.5.3-1 .6-1.7.6s-1.2-.3-1.7-.6c-.5-.3-.9-.5-1.5-.5-.5 0-1 .1-1.4.1-.3 0-.5-.1-.6-.3-.1-.2-.1-.5-.2-.7-1.1-.1-1.9-.4-2.1-.9-.1-.3 0-.5.3-.6 1.2-.4 2.2-1.1 2.6-2 .1-.2.1-.4.2-.7-.8-.1-1.5-.4-2-.7-.3-.2-.4-.5-.3-.8.1-.3.4-.4.7-.3.4.2.9.3 1.4.1-.1-.6-.1-1.3-.1-1.8 0-2.3 1.5-3.9 3.4-3.9z"/>
  </svg>
);
const AmazonLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#131921"/>
    <path fill="#FF9900" d="M6.2 15.3c2.9 1.9 6.9 2.1 10.3.4.2-.1.4.1.2.3-1 1.1-3.3 2.3-6 2.3-2.8 0-5.3-1-7.2-2.7-.2-.1 0-.4.2-.3zm11-.5c-.1-.3-.9-.2-1.3-.1-.1 0-.1-.1 0-.2.6-.4 1.6-.3 1.7-.1.1.1 0 1.1-.6 1.6-.1.1-.2 0-.2-.1.1-.3.3-.9.4-1.1z"/>
    <path fill="#fff" d="M9.5 9.6c0-.5.1-.9.4-1.2.3-.3.7-.5 1.3-.5.5 0 1 .1 1.3.4.3.3.4.6.4 1.1v2.3c0 .2 0 .3.1.4l.1.2c0 .1-.1.1-.1.2l-.5.4h-.2l-.4-.5c-.1.1-.3.3-.5.4-.2.1-.4.1-.7.1-.5 0-.8-.1-1.1-.4-.3-.3-.4-.6-.4-1.1 0-.5.2-.9.5-1.2.4-.3.9-.4 1.6-.4h.5v-.3c0-.3-.1-.5-.2-.6-.1-.1-.3-.2-.6-.2-.2 0-.4 0-.6.1-.1.1-.2.2-.3.4 0 .1-.1.1-.2.1l-.7-.1c-.1 0-.1-.1-.1-.2zm2.2 1.6h-.3c-.4 0-.7.1-.9.2-.2.1-.3.3-.3.6 0 .2.1.4.2.5.1.1.3.2.5.2.3 0 .5-.1.6-.2.2-.2.2-.4.2-.7v-.6z"/>
  </svg>
);
const GithubLogo = ({ className = brandBox }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <rect width="24" height="24" rx="6" fill="#181717"/>
    <path fill="#fff" d="M12 5.5c-3.6 0-6.5 2.9-6.5 6.5 0 2.9 1.9 5.3 4.5 6.2.3.1.4-.1.4-.3v-1.1c-1.8.4-2.2-.9-2.2-.9-.3-.8-.7-1-.7-1-.6-.4.1-.4.1-.4.7.1 1.1.7 1.1.7.6 1.1 1.6.8 2 .6.1-.5.2-.8.4-1-1.4-.2-2.9-.7-2.9-3.2 0-.7.3-1.3.7-1.7-.1-.2-.3-.8.1-1.7 0 0 .6-.2 1.9.7.6-.2 1.2-.2 1.8-.2s1.2.1 1.8.2c1.3-.9 1.9-.7 1.9-.7.4.9.2 1.5.1 1.7.4.5.7 1.1.7 1.7 0 2.5-1.5 3-2.9 3.2.3.2.5.7.5 1.4v2.1c0 .2.1.4.5.3 2.6-.9 4.5-3.3 4.5-6.2 0-3.6-2.9-6.5-6.5-6.5z"/>
  </svg>
);

// ==========================================
// COMPOSANT SUPPORT CHAT — retiré (plus de contact WhatsApp)
// ==========================================

// ==========================================
// CATALOGUE PRODUITS
// ==========================================

const CATEGORIES = [
  { id: 'all', name: 'All products' },
  { id: 'email', name: 'Email (Gmail)' },
  { id: 'youtube_aged', name: 'Aged Youtube Channels' },
  { id: 'youtube_monetized', name: 'Monetized Channels' },
  { id: 'youtube_not_monetized', name: 'Non-Monetized Channels' },
  { id: 'youtube_cpa', name: 'Special Channels' },
  { id: 'facebook', name: 'Facebook Page' },
];

// Nom affichable d'une catégorie : libellé connu, sinon la catégorie brute
// (les catégories importées de YTSeller sont utilisées telles quelles).
const categoryName = (cat) => CATEGORIES.find(c => c.id === cat)?.name || cat || 'Others';

// Libellés + ordre d'affichage des groupes de premier niveau (barre du haut).
// Doit couvrir CHAQUE valeur que `categoryVisual` peut renvoyer : un bucket
// absent de GROUP_ORDER disparaîtrait silencieusement de la vue "All
// products" groupée par section (les produits ne matchant aucune section
// n'y sont jamais rendus).
const GROUP_LABELS = {
  gmail: 'Gmail', mail: 'Outlook & Mail', youtube: 'Youtube', discord: 'Discord', facebook: 'Facebook',
  instagram: 'Instagram', twitter: 'Twitter X', reddit: 'Reddit', tiktok: 'Tiktok', apple: 'Apple ID',
  telegram: 'Telegram', sms: 'SMS', snapchat: 'Snapchat', github: 'GitHub', amazon: 'Amazon', other: 'Others',
};
const GROUP_ORDER = ['gmail', 'mail', 'youtube', 'discord', 'facebook', 'instagram', 'twitter', 'reddit', 'tiktok', 'apple', 'telegram', 'sms', 'snapchat', 'github', 'amazon', 'other'];

// Palette stable pour l'avatar générique (basée sur le nom de catégorie, pas aléatoire).
const AVATAR_COLORS = ['#0D7A52', '#B45309', '#1D4ED8', '#BE185D', '#4338CA', '#0E7490', '#7C3AED'];
const hashStr = (s) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };

// Catégories fournisseur connues pour être des fourre-tout non fiables : leur
// texte de catégorie ne décrit pas le vrai contenu du produit (ex. des
// comptes Gmail/Twitter importés sous "Accounts-Telegram" ou "Amazon"). Pour
// celles-ci uniquement, on se fie au nom du produit plutôt qu'à la catégorie.
const JUNK_CATEGORIES = ['accounts-telegram', 'amazon'];

// Détecte un bucket à partir d'UN SEUL texte (catégorie seule, ou nom seul) —
// ne jamais mélanger les deux sources dans un même passage, sinon un nom qui
// mentionne "Gmail" ferait basculer un produit pourtant bien catégorisé "SMS".
const detectFromText = (text) => {
  const t = text;
  // Marques "sujet principal" vérifiées avant l'e-mail générique : un produit
  // Twitter mentionnant "Outlook email verified" comme simple attribut reste
  // un produit Twitter, pas un produit Outlook.
  if (t.includes('youtube')) return 'youtube';
  if (t.includes('facebook')) return 'facebook';
  if (t.includes('github')) return 'github';
  if (t.includes('instagram')) return 'instagram';
  if (t.includes('tiktok') || t.includes('tik tok')) return 'tiktok';
  if (t.includes('reddit')) return 'reddit';
  if (t.includes('twitter') || t.includes('/x') || t === 'x' || / x[)\s]/.test(t)) return 'twitter';
  if (t.includes('discord')) return 'discord';
  if (t.includes('icloud') || t.includes('apple')) return 'apple';
  if (t.includes('telegram')) return 'telegram';
  if (t.includes('sms')) return 'sms';
  if (t.includes('snapchat')) return 'snapchat';
  if (t === 'email' || t.includes('gmail')) return 'gmail';
  if (t.includes('gmx') || t.includes('rambler') || t.includes('mail ru') || t.includes('mail.ru') || t.includes('hotmail') || t.includes('outlook')) return 'mail';
  if (t.includes('amazon')) return 'amazon';
  return null;
};

// Détection du groupe/visuel d'un produit. La catégorie du fournisseur fait
// foi dans le cas général (elle reflète fidèlement des buckets fiables comme
// "SMS" ou "Gmail 2FA"). Seules les catégories fourre-tout connues (cf.
// JUNK_CATEGORIES) basculent en priorité sur le nom du produit, qui reflète
// alors mieux son vrai contenu que l'étiquette fournisseur.
const categoryVisual = (product = {}) => {
  // Compat : anciens appels avec une simple chaîne de catégorie.
  if (typeof product === 'string') product = { category: product };
  const cat = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  
  // Correction forcée : si le fournisseur s'est trompé de catégorie (ex: GitHub mis dans "email")
  if (name.includes('github')) return 'github';

  const isJunkCategory = JUNK_CATEGORIES.some(j => cat === j || cat.includes(j));

  if (isJunkCategory) {
    return detectFromText(name) || detectFromText(cat) || 'other';
  }
  return detectFromText(cat) || detectFromText(name) || 'other';
};

// Étiquette de catégorie à afficher sur une carte/fiche produit. Pour une
// catégorie fournisseur fiable, on garde le libellé précis ("Gmail 2FA",
// "SMS"...). Pour une catégorie fourre-tout (JUNK_CATEGORIES, ex.
// "Accounts-Telegram"), afficher le texte brut serait trompeur puisque le
// produit est en réalité un Gmail/Twitter/etc. — on affiche alors le nom du
// bucket détecté par `categoryVisual` à la place.
const displayCategoryLabel = (product = {}) => {
  const cat = String(product.category || '').toLowerCase();
  const isJunkCategory = JUNK_CATEGORIES.some(j => cat === j || cat.includes(j));
  if (isJunkCategory) return GROUP_LABELS[categoryVisual(product)] || categoryName(product.category);
  return categoryName(product.category);
};

// Icône précise à afficher — plus fine que le bucket de menu `categoryVisual`
// (qui regroupe Outlook/Hotmail/GMX/Mail.ru sous un même filtre "Outlook &
// Mail" pour la navigation) : ici chaque marque reconnaissable a son propre
// logo, même si plusieurs partagent le même groupe de filtre.
const resolveIcon = (product = {}) => {
  const cat = String(product.category || '').toLowerCase();
  const name = String(product.name || '').toLowerCase();
  const has = (s) => cat.includes(s) || name.includes(s);
  if (has('snapchat')) return 'snapchat';
  const bucket = categoryVisual(product);
  if (bucket === 'mail' && (has('outlook') || has('hotmail'))) return 'outlook';
  return bucket;
};

// Visuel d'un produit : image personnalisée (image_url) prioritaire, sinon
// logo de marque déduit de la catégorie/nom, sinon avatar générique coloré
// (jamais une icône vide — cf. retour utilisateur "produits sans image").
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


// Nettoie un nom de produit pour l'affichage : certains fournisseurs (ex.
// SMMSHIBA) renvoient des titres dupliqués ("Nom - Nom"), truffés d'emojis
// et de tags séparés par des pipes/backslashes, longs de 100-250 caractères
// — ça ressemble à du spam pour un visiteur. On ne modifie jamais la donnée
// stockée (utile pour les regex de getProductDetails), seulement l'affichage.
const cleanProductName = (raw, lang) => {
  if (!raw) return raw;
  if (!lang) lang = typeof window !== 'undefined' ? (localStorage.getItem('agedgmail_lang') || 'fr') : 'fr';
  let s = String(raw).trim();

  // Le fournisseur répète parfois le titre deux fois, séparé par " - ".
  const dashIdx = s.indexOf(' - ');
  if (dashIdx > 15) {
    const first = s.slice(0, dashIdx).trim();
    const rest = s.slice(dashIdx + 3).trim();
    const probe = first.slice(0, Math.min(14, first.length)).toLowerCase();
    if (probe && rest.toLowerCase().startsWith(probe)) s = first;
  }

  // Retire les emojis/symboles décoratifs (spam visuel).
  s = s.replace(/[\u{1F300}-\u{1FAFF}☀-➿←-⇿⬀-⯿]/gu, '').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();

  // Traduction pour rendre les noms compréhensibles
  if (lang === 'fr') {
    s = s.replace(/fresh/gi, "Nouveau");
    s = s.replace(/month old/gi, "Mois d'ancienneté");
    s = s.replace(/months old/gi, "Mois d'ancienneté");
    s = s.replace(/year old/gi, "An d'ancienneté");
    s = s.replace(/years old/gi, "Ans d'ancienneté");
    s = s.replace(/verified/gi, "Vérifié");
    s = s.replace(/with/gi, "avec");
    s = s.replace(/accounts/gi, "Comptes");
    s = s.replace(/account/gi, "Compte");
    s = s.replace(/active/gi, "Actif");
    s = s.replace(/\band\b/gi, "et");
    s = s.replace(/aged/gi, "Ancien");
    s = s.replace(/not monetized/gi, "Non Monétisé");
    s = s.replace(/monetized/gi, "Monétisé");
    s = s.replace(/channels/gi, "Chaînes");
    s = s.replace(/channel/gi, "Chaîne");
    s = s.replace(/subscribers/gi, "Abonnés");
    s = s.replace(/followers/gi, "Abonnés");
  } else {
    // Nettoyage esthétique pour l'anglais
    s = s.replace(/month old/gi, "Months Old");
    s = s.replace(/months old/gi, "Months Old");
    s = s.replace(/year old/gi, "Years Old");
    s = s.replace(/years old/gi, "Years Old");
    s = s.replace(/verified/gi, "Verified");
    s = s.replace(/with/gi, "with");
    s = s.replace(/accounts/gi, "Accounts");
    s = s.replace(/account/gi, "Account");
    s = s.replace(/active/gi, "Active");
  }

  const MAX = 70;
  if (s.length > MAX) {
    const cut = s.slice(0, MAX);
    const lastSep = Math.max(cut.lastIndexOf(' | '), cut.lastIndexOf(' \\ '), cut.lastIndexOf(', '), cut.lastIndexOf(' + '));
    s = (lastSep > 20 ? cut.slice(0, lastSep) : cut).trim() + '…';
  }
  return s;
};

const getProductDetails = (product) => {
  const commonTerms = "Please read the specifications before purchasing. You are responsible for all actions on the account. Use fresh residential IPs. Change access after 48h only.";
  return {
    info: product.category === 'email'
      ? `Age : ${product.name.match(/\d{4}/)?.[0] || 'Aged'} | Country : ${product.name.includes('US') ? 'US' : 'Random'} | Format : Gmail/Pass/Recovery/2FA`
      : product.category === 'facebook'
        ? "Age : Aged (2012-2020) | Friends : 50+ | Status : Verified | Quality : Green"
        : product.category === 'youtube_not_monetized'
          ? `Subscribers : ${product.name.split(' – ')[1] || '1k+'} | Eligibility : Immediate | Content : None`
          : `Year : ${product.name.match(/\d{4}/)?.[0] || 'Aged'} | Status : ${product.category === 'youtube_monetized' ? 'Monetized' : 'Non-Monetized'} | Content : Clean`,
    note: product.category === 'facebook'
      ? "Ideal for Meta Ads. Stable account with history."
      : product.category.includes('youtube')
        ? "Perfect for YT automation business."
        : "High quality Gmail. Format: Email | Pass | Recovery | 2FA.",
    terms: commonTerms,
    refund: "3-day warranty until login."
  };
};

const PRODUCTS = PRODUCTS_RAW.map(p => ({ ...p, details: getProductDetails(p) }));

// ==========================================
// SKELETONS — chargement (on n'affiche jamais un composant vide en attendant
// la base : on montre un squelette animé tant que les données ne sont pas là)
// ==========================================
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200/70 dark:bg-slate-700/50 rounded-lg ${className}`} />
);

const SkeletonProductCard = () => (
  <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-5 flex flex-col h-full">
    <div className="aspect-[1.5] rounded-[1.5rem] mb-5 animate-pulse bg-gray-200/70 dark:bg-slate-700/50" />
    <Skeleton className="h-2.5 w-20 mb-2" />
    <Skeleton className="h-4 w-full mb-1.5" />
    <Skeleton className="h-4 w-2/3 mb-5" />
    <div className="flex items-center justify-between mb-6">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-6 w-14" />
    </div>
    <div className="flex items-center gap-2 mt-auto">
      <Skeleton className="h-12 flex-grow rounded-xl" />
      <Skeleton className="h-12 w-12 rounded-xl" />
    </div>
  </div>
);

const SkeletonProductGrid = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {[...Array(count)].map((_, i) => <SkeletonProductCard key={i} />)}
  </div>
);

// Ligne de tableau générique (admin, commandes…).
const SkeletonRows = ({ rows = 6, cols = 5 }) => (
  <div className="space-y-4">
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex items-center gap-4">
        {[...Array(cols)].map((_, j) => (
          <Skeleton key={j} className={`h-4 ${j === 0 ? 'w-40' : 'flex-1'}`} />
        ))}
      </div>
    ))}
  </div>
);

// Carte de métrique (dashboard admin).
const SkeletonMetricCards = ({ count = 4 }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-6 rounded-[2rem]">
        <Skeleton className="w-9 h-9 rounded-xl mb-3" />
        <Skeleton className="h-2 w-16 mb-2" />
        <Skeleton className="h-6 w-20" />
      </div>
    ))}
  </div>
);

// ==========================================
// PRODUCT CARD
// ==========================================

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

// ==========================================
// NAVBAR
// ==========================================

const Navbar = ({ cartTotal, cartCount, navigate, session, profile, currentView, setActiveCategory, setActiveGroup, onCartClick, lang, setLang, theme, setTheme, t }) => {
  const go = (view, cat, group) => {
    if (cat !== undefined && setActiveCategory) setActiveCategory(cat);
    if (group !== undefined && setActiveGroup) setActiveGroup(group);
    navigate(view);
  };
  const linkCls = (active) => `text-sm font-bold transition-colors ${active ? 'text-primary' : 'text-gray-600 dark:text-gray-300 hover:text-primary'}`;
  return (
  <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 font-sans">
    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('')} className="h-20 flex items-center gap-3 group transition-all">
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
        
        {/* Cart Button (Now before Profile) */}
        <button onClick={onCartClick} className="bg-gray-900 dark:bg-primary text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-xs font-bold flex items-center gap-3 hover:bg-black dark:hover:bg-primaryDark transition-all shadow-lg shadow-black/10 relative">
          <ShoppingCart size={18} />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />}
          <span className="border-l border-white/20 pl-3">CART / ${cartTotal.toFixed(2)}</span>
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
  </header>
  );
};

// ==========================================
// QUICK ORDER MODAL — achat direct depuis la fiche produit, sans passer par le panier
// ==========================================
const QuickOrderModal = ({ product, session, profile, navigate, onClose, fetchProfile, fetchProducts, setRechargeSuggestedAmount, lang }) => {
  const [qty, setQty] = useState(1);
  const [promoCode, setPromoCode] = useState('');
  const [promoMsg, setPromoMsg] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const total = product.price * qty;
  const balance = profile?.balance || 0;
  const hasEnoughBalance = balance >= total;

  const applyPromo = () => {
    if (!promoCode.trim()) return;
    setPromoMsg("Code promo invalide.");
  };

  const handlePay = async () => {
    if (!session || !profile) { onClose(); navigate('auth'); return; }
    if (profile.is_suspended) { setErrorMessage("Ton compte est suspendu. Contacte le support."); return; }
    setIsProcessing(true);
    setErrorMessage('');

    try {
      if (balance < total) throw new Error("Insufficient balance.");

      if (product.is_dropship) {
        const { data: dsOrder, error: dsErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          total_price: total,
          status: 'processing',
          supplier: 'ytseller',
          created_at: new Date().toISOString()
        }).select('id').single();

        if (dsErr) throw dsErr;
        if (!dsOrder) throw new Error("The order could not be created.");

        supabase.functions.invoke('dropship-place-order', { body: { orderId: dsOrder.id } })
          .catch(e => console.error('dropship-place-order invoke:', e));

      } else {
        const { data: stockRows, error: stockErr } = await supabase
          .from('account_stock')
          .select('id, credentials')
          .eq('product_id', product.id)
          .eq('is_delivered', false)
          .limit(qty);

        if (stockErr) throw new Error("Error retrieving stock.");
        if (!stockRows || stockRows.length < qty) {
          throw new Error(`No more accounts available in stock for ${product.name}.`);
        }

        const deliveredCreds = stockRows.map(r => r.credentials).join('\n');
        const stockIds = stockRows.map(r => r.id);

        const { data: orderData, error: orderInsertErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: product.id,
          product_name: product.name,
          quantity: qty,
          total_price: total,
          status: 'confirmed',
          credentials: deliveredCreds,
          data: deliveredCreds,
          created_at: new Date().toISOString()
        }).select('id').single();

        if (orderInsertErr) throw orderInsertErr;
        if (!orderData) throw new Error("Order created but ID could not be retrieved.");

        await supabase.from('account_stock').update({
          is_delivered: true,
          order_id: String(orderData.id),
          delivered_to: session.user.id,
        }).in('id', stockIds);

        // Envoyer les credentials par email si le client a opté pour cette option
        if (profile?.send_email_on_delivery) {
          supabase.functions.invoke('send-delivery-email', { body: { orderId: orderData.id } })
            .catch(e => console.error('send-delivery-email error:', e));
        }
      }

      const { error: balanceErr } = await supabase
        .from('profiles')
        .update({ balance: balance - total })
        .eq('id', session.user.id);
      if (balanceErr) throw balanceErr;

      setPurchaseSuccess(true);
      await fetchProfile(session.user.id);
      if (fetchProducts) await fetchProducts();

      setTimeout(() => { onClose(); navigate('dashboard'); }, 1500);

    } catch (err) {
      console.error('Quick order error:', err);
      setErrorMessage(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order</h2>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:text-white transition-all"><X size={18} /></button>
        </div>

        <div className="px-8 pb-8 pt-4 space-y-6">
          {!session ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Log in to buy this product with your balance.</p>
              <button onClick={() => { onClose(); navigate('auth'); }} className="w-full py-4 rounded-2xl font-bold bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all">Log in</button>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment method</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col">
                    <span className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">Selected</span>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">Balance (${balance.toFixed(2)})</span>
                  </div>
                  <button onClick={() => { onClose(); navigate('recharge'); }} className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all text-left">
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><Plus size={14} /> Top up</span>
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cart</span>
                  <span className="w-5 h-5 rounded-full bg-gray-900 dark:bg-primary text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center">1</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shrink-0"><ProductVisual product={product} iconSize={20} /></div>
                  <div className="flex-grow min-w-0">
                    <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{cleanProductName(product.name, lang)}</div>
                    <div className="text-xs text-gray-400">${product.price.toFixed(2)} × {qty}</div>
                  </div>
                  <div className="flex items-center bg-white dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-700 shrink-0">
                    <button onClick={() => qty > 1 && setQty(qty - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Minus size={12} /></button>
                    <div className="w-8 text-center font-bold text-sm">{qty}</div>
                    <button onClick={() => qty < product.stock && setQty(qty + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all"><Plus size={12} /></button>
                  </div>
                  <div className="text-sm font-black text-primary font-mono shrink-0">${total.toFixed(2)}</div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Promo code</label>
                <div className="flex gap-2">
                  <input type="text" value={promoCode} onChange={e => { setPromoCode(e.target.value); setPromoMsg(''); }} className="flex-grow px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 outline-none focus:ring-2 focus:ring-primary/20 text-sm" placeholder="Enter code" />
                  <button onClick={applyPromo} className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">Apply</button>
                </div>
                {promoMsg && <p className="text-xs text-red-500 font-bold mt-2">{promoMsg}</p>}
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800" />

              <div className="flex items-center justify-between">
                <span className="text-base font-black text-gray-900 dark:text-white">Total</span>
                <span className="text-xl font-black text-gray-900 dark:text-white">${total.toFixed(2)}</span>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">{errorMessage}</div>
              )}

              {!hasEnoughBalance && !purchaseSuccess ? (
                <button
                  onClick={() => {
                    const missing = Math.round((total - balance) * 100) / 100;
                    setRechargeSuggestedAmount(missing > 0 ? missing : null);
                    onClose(); navigate('recharge');
                  }}
                  className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  <Plus size={20} /> Top up ${Math.max(0, Math.round((total - balance) * 100) / 100).toFixed(2)}
                </button>
              ) : (
                <button
                  onClick={handlePay}
                  disabled={isProcessing || purchaseSuccess}
                  className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${purchaseSuccess ? 'bg-green-500 text-white dark:text-gray-900' : 'bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/20'}`}
                >
                  {isProcessing ? <RefreshCcw size={20} className="animate-spin" /> : purchaseSuccess ? <CheckCircle size={20} /> : <Zap size={20} />}
                  {isProcessing ? 'Processing...' : purchaseSuccess ? 'Delivered!' : 'Pay & receive'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// HOME VIEW
// ==========================================

const HomeView = ({
  activeGroup, setActiveGroup, activeCategory, setActiveCategory,
  sortBy, setSortBy, searchTerm, setSearchTerm,
  filteredProducts, addToCart, navigate, setSelectedProduct, onBuyNow,
  groups = [], subCategories = [], groupOf, lang, t, loading = false
}) => {
  const activeGroupLabel = activeGroup === 'all' ? 'All products' : (GROUP_LABELS[activeGroup] || 'Others');

  // Vue "All products" : au lieu d'une grille où toutes les catégories sont
  // mélangées, on affiche une section par groupe (Gmail, Youtube, ...) dans
  // l'ordre du menu, chacune listant tous ses produits (triés comme demandé).
  const showGrouped = activeGroup === 'all' && activeCategory === 'all' && !searchTerm.trim() && groupOf;
  const sections = showGrouped
    ? groups
        .map(g => ({ ...g, items: filteredProducts.filter(p => groupOf(p) === g.id) }))
        .filter(g => g.items.length > 0)
    : null;

  const pillCls = (active) =>
    `shrink-0 px-5 py-2.5 rounded-full text-sm font-bold border transition-all whitespace-nowrap ${
      active
        ? 'bg-primary/10 border-primary text-primary'
        : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-primary/50'
    }`;

  return (
    <main id="catalog" className="max-w-7xl mx-auto px-6 py-10 font-sans">
      {/* Groupes de premier niveau */}
      <div className="flex items-center gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        <button onClick={() => { setActiveGroup('all'); setActiveCategory('all'); }} className={pillCls(activeGroup === 'all')}>
          All products
        </button>
        {groups.map(g => (
          <button key={g.id} onClick={() => { setActiveGroup(g.id); setActiveCategory('all'); }} className={pillCls(activeGroup === g.id)}>
            {g.name.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Sous-catégories du groupe sélectionné */}
      {activeGroup !== 'all' && subCategories.length > 0 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-5 mb-2 border-b border-gray-100 dark:border-gray-800 -mx-1 px-1">
          <button
            onClick={() => setActiveCategory('all')}
            className={`shrink-0 w-9 h-9 rounded-full text-xs font-black flex items-center justify-center transition-all ${
              activeCategory === 'all' ? 'bg-gray-900 dark:bg-primary text-white dark:text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
            title="Toutes les sous-catégories"
          >
            All
          </button>
          {subCategories.map(sc => (
            <button key={sc.id} onClick={() => setActiveCategory(sc.id)} className={pillCls(activeCategory === sc.id)}>
              {sc.name}
            </button>
          ))}
        </div>
      )}

      {/* En-tête : titre du groupe, compteur, recherche, tri */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mt-8 mb-8">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-6 rounded-full bg-primary" />
          <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{activeGroupLabel}</h2>
          <span className="bg-primary/10 text-primaryDark dark:text-primary text-xs font-black px-3 py-1 rounded-full">{loading ? '…' : `${filteredProducts.length} produits`}</span>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              value={searchTerm}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-gray-800 dark:bg-gray-900 dark:text-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          >
            <option value="price_asc">{t('priceAsc')}</option>
            <option value="price_desc">{t('priceDesc')}</option>
            <option value="name_asc">{t('nameAsc')}</option>
          </select>
        </div>
      </div>

      {loading ? (
        <SkeletonProductGrid count={8} />
      ) : showGrouped ? (
        <div className="space-y-14">
          {sections.map(section => (
            <div key={section.id}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-1.5 h-5 rounded-full bg-primary" />
                <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">{section.name}</h3>
                <span className="bg-primary/10 text-primaryDark dark:text-primary text-xs font-black px-3 py-1 rounded-full">{section.items.length}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {section.items.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} onBuyNow={onBuyNow} lang={lang} t={t} />))}
              </div>
            </div>
          ))}
          {sections.length === 0 && (
            <div className="py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Search size={30} className="text-gray-300" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('noProducts')}</h3>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map(product => (<ProductCard key={product.id} product={product} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} onBuyNow={onBuyNow} lang={lang} t={t} />))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 dark:bg-gray-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-gray-800">
              <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm"><Search size={30} className="text-gray-300" /></div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{t('noProducts')}</h3>
              <p className="text-gray-400 text-sm">Essayez de modifier votre recherche ou de changer de catégorie.</p>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

// ==========================================
// API VIEW — API revendeur (doc + gestion de clé)
// ==========================================
const API_BASE_URL = 'https://agedgmail.tools-cl.com/api/v2';




const SmsView = ({ session, profile, lang, navigate, fetchProfile }) => {
  const isFr = lang === 'fr';
  const [status, setStatus] = useState('IDLE'); // IDLE, LOADING_PRICES, WAITING_SMS, COMPLETED
  const [phoneNumber, setPhoneNumber] = useState('');
  const [securityId, setSecurityId] = useState('');
  const [smsCode, setSmsCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(900);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Dynamic pricing states
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [currentPrice, setCurrentPrice] = useState(1.00);
  
  // Service ID pour YouTube sur smscodes.io
  const [selectedService, setSelectedService] = useState('8a97735e-9a14-427e-8a88-e9d999bf3429'); 

  useEffect(() => {
    // Fetch prices on component mount
    const fetchPrices = async () => {
      setStatus('LOADING_PRICES');
      try {
        const { data, error } = await supabase.functions.invoke('sms-get-prices', {
          body: { serviceId: selectedService }
        });

        if (error) throw new Error(error.message);
        if (data.error) throw new Error(data.error);
        if (data.Status !== "200" && data.Status !== "Success") throw new Error(data.Error || 'Provider Error');

        if (data.Prices && data.Prices.length > 0) {
          // Sort alphabetically by Country name
          const sorted = data.Prices.sort((a, b) => a.Country.localeCompare(b.Country));
          setCountries(sorted);
          
          // Set default to US if available, or first country
          const defaultCountry = sorted.find(c => c.Iso === 'US') || sorted[0];
          setSelectedCountry(defaultCountry.Iso);
          setCurrentPrice(parseFloat(defaultCountry.Price));
        }
        setStatus('IDLE');
      } catch (err) {
        console.error("Fetch prices error", err);
        setError(isFr ? "Impossible de charger la liste des pays." : "Could not load the countries list.");
        setStatus('IDLE');
      }
    };

    fetchPrices();
  }, [selectedService, isFr]);

  const handleCountryChange = (e) => {
    const iso = e.target.value;
    setSelectedCountry(iso);
    const country = countries.find(c => c.Iso === iso);
    if (country) {
      setCurrentPrice(parseFloat(country.Price));
    }
  };

  useEffect(() => {
    let timer;
    let pollInterval;
    
    if (status === 'WAITING_SMS' && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      
      pollInterval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('sms-check-code', {
            body: { 
              securityId, 
              number: phoneNumber, 
              price: currentPrice, 
              description: `SMS Verification (YouTube, ${selectedCountry})` 
            }
          });
          
          if (!error && data && data.status === 'success') {
            setSmsCode(data.sms);
            setStatus('COMPLETED');
            if (fetchProfile) fetchProfile();
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 8000);
    } else if (timeLeft === 0 && status === 'WAITING_SMS') {
      setStatus('IDLE');
      setError(isFr ? "Délai d'attente expiré. Aucun code reçu. Vous n'avez pas été débité." : "Timeout expired. No code received. You were not charged.");
      setPhoneNumber('');
      setSecurityId('');
    }
    
    return () => {
      clearInterval(timer);
      clearInterval(pollInterval);
    };
  }, [status, timeLeft, isFr, securityId, phoneNumber, fetchProfile, selectedCountry, currentPrice]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const requestNumber = async () => {
    if (!session) {
      navigate('auth');
      return;
    }
    if (profile?.balance < currentPrice) {
      setError(isFr ? `Solde insuffisant ($${profile?.balance?.toFixed(2)}). Veuillez recharger votre compte.` : `Insufficient balance ($${profile?.balance?.toFixed(2)}). Please top up.`);
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('sms-get-number', {
        body: { iso: selectedCountry, serviceId: selectedService, price: currentPrice }
      });

      if (error) throw new Error(error.message);
      if (data.error) throw new Error(data.error);
      if (data.Status !== "200" && data.Status !== "Success") throw new Error(data.Error || 'Provider Error');

      setPhoneNumber(data.Number);
      setSecurityId(data.SecurityId);
      setStatus('WAITING_SMS');
      setTimeLeft(900);
    } catch (err) {
      console.error(err);
      setError(err.message || (isFr ? 'Une erreur est survenue' : 'An error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const cancelRequest = () => {
    setStatus('IDLE');
    setPhoneNumber('');
    setSecurityId('');
    setSmsCode('');
    setTimeLeft(900);
    setError('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 font-sans">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <MessageSquare size={14} /> {isFr ? 'Service SMS YouTube' : 'YouTube SMS Service'}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white leading-tight mb-4">
          {isFr ? 'Vérification de chaîne YouTube' : 'YouTube Channel Verification'}
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed max-w-xl mx-auto">
          {isFr 
            ? 'Obtenez un numéro de téléphone unique et propre pour valider votre chaîne YouTube instantanément.' 
            : 'Get a unique and clean phone number to instantly verify your YouTube channel.'}
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2.5rem] p-8 md:p-12 shadow-soft">
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 mb-8">
            <AlertCircle size={20} /> {error}
          </div>
        )}
        
        {status === 'LOADING_PRICES' && (
          <div className="text-center space-y-4 py-12">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 font-bold">{isFr ? 'Chargement des pays...' : 'Loading countries...'}</p>
          </div>
        )}

        {status === 'IDLE' && (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-[2rem] flex items-center justify-center mx-auto mb-6 transform rotate-3">
              <Smartphone className="text-gray-400" size={40} />
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between border border-gray-100 dark:border-gray-700 gap-6">
              <div className="text-left w-full md:w-auto flex-1">
                <p className="font-bold text-gray-900 dark:text-white mb-2">{isFr ? 'Sélecteur de pays' : 'Country selector'}</p>
                <select 
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="w-full text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 font-medium"
                >
                  {countries.length > 0 ? (
                    countries.map(c => (
                      <option key={c.Iso} value={c.Iso}>{c.Country} ({c.Iso})</option>
                    ))
                  ) : (
                    <option value="US">USA (US)</option>
                  )}
                </select>
              </div>
              <div className="text-center md:text-right bg-white dark:bg-gray-900 rounded-xl p-4 w-full md:w-auto border border-gray-100 dark:border-gray-700">
                <p className="text-3xl font-black text-primary">${currentPrice.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{isFr ? 'Prix du numéro' : 'Number price'}</p>
              </div>
            </div>

            <button 
              onClick={requestNumber} 
              disabled={loading || countries.length === 0}
              className="w-full bg-primary text-white dark:text-gray-900 py-4 rounded-2xl font-black text-lg hover:bg-primaryDark hover:scale-[1.02] transition-all disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-primary/20"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white dark:border-gray-900/30 dark:border-t-gray-900 rounded-full animate-spin" /> : <Smartphone size={20} />}
              {loading 
                ? (isFr ? 'Génération du numéro...' : 'Generating number...') 
                : (isFr ? `Obtenir ce numéro pour $${currentPrice.toFixed(2)}` : `Get this number for $${currentPrice.toFixed(2)}`)}
            </button>
            <p className="text-xs text-gray-400">
              {isFr ? 'Votre solde ne sera débité QUE si vous recevez le SMS.' : 'Your balance will ONLY be charged if you receive the SMS.'}
            </p>
          </div>
        )}

        {status === 'WAITING_SMS' && (
          <div className="text-center space-y-8 animate-in fade-in zoom-in duration-300">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                {isFr ? 'Votre numéro' : 'Your number'}
              </p>
              <div className="flex justify-center items-center gap-4">
                <span className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white font-mono tracking-tight">{phoneNumber}</span>
                <button 
                  onClick={() => copyToClipboard(phoneNumber)}
                  className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Copy size={20} />
                </button>
              </div>
            </div>

            <div className="border border-primary/20 bg-primary/5 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-primary/20">
                <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
              </div>
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-sm flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
                <p className="font-bold text-primary text-lg">
                  {isFr ? 'En attente du SMS Google...' : 'Waiting for Google SMS...'}
                </p>
                <p className="text-2xl font-black text-gray-900 dark:text-white font-mono">{formatTime(timeLeft)}</p>
              </div>
            </div>

            <button 
              onClick={cancelRequest}
              className="text-gray-400 text-sm font-bold hover:text-red-500 transition-colors underline decoration-dotted"
            >
              {isFr ? 'Annuler et rembourser' : 'Cancel and refund'}
            </button>
          </div>
        )}

        {status === 'COMPLETED' && (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-24 h-24 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                {isFr ? 'Code de validation' : 'Verification Code'}
              </p>
              <div className="inline-flex flex-col items-center gap-4 bg-gray-900 dark:bg-black text-white p-8 rounded-3xl shadow-2xl relative border border-gray-800">
                <span className="text-5xl md:text-6xl font-black tracking-[0.2em]">{smsCode}</span>
                <button 
                  onClick={() => copyToClipboard(smsCode)}
                  className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold bg-white/10 px-4 py-2 rounded-full"
                >
                  <Copy size={16} /> {isFr ? 'Copier le code' : 'Copy code'}
                </button>
              </div>
            </div>

            <p className="text-green-600 dark:text-green-400 font-bold bg-green-50 dark:bg-green-900/30 py-3 px-6 rounded-full inline-block">
              {isFr ? `Succès ! $${currentPrice.toFixed(2)} ont été débités.` : `Success! $${currentPrice.toFixed(2)} has been charged.`}
            </p>

            <div>
              <button 
                onClick={cancelRequest} 
                className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white py-4 rounded-2xl font-black text-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors mt-4"
              >
                {isFr ? 'Effectuer une autre vérification' : 'Verify another channel'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
const ApiView = ({ navigate, session, lang }) => {
  const [apiKey, setApiKey] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!session || !supabase) return;
    supabase.from('api_keys').select('api_key').eq('user_id', session.user.id).eq('active', true)
      .order('created_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (data) setApiKey(data.api_key); });
  }, [session]);

  const generateKey = async () => {
    if (!session) { navigate('auth'); return; }
    setLoading(true);
    const key = 'ak_' + crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '').slice(0, 8);
    const { error } = await supabase.from('api_keys').insert({ user_id: session.user.id, api_key: key, label: 'default' });
    if (!error) setApiKey(key);
    setLoading(false);
  };

  const copyKey = () => { if (apiKey) { navigator.clipboard?.writeText(apiKey); setCopied(true); setTimeout(() => setCopied(false), 1500); } };

  const actions = lang === 'fr' ? [
    ['balance', 'key, action', '{ "balance": 42.5, "currency": "USD" }', 'Vérifiez votre solde revendeur.'],
    ['products', 'key, action', '[ { "product": 12, "name": "…", "rate": 6.60, "available": 120, "status": "In stock" } ]', 'Lister le catalogue, vos prix et le stock en temps réel.'],
    ['add_order', 'key, action, product, quantity', '{ "order": 10231 }', 'Passer une commande. Débite votre solde, livraison automatique.'],
    ['order_status', 'key, action, order', '{ "status": "Completed", "charge": "6.60", "currency": "USD" }', 'Statuts : Pending, Processing, Completed, Canceled.'],
    ['result', 'key, action, order', '{ "result": ["mail:pass:recovery", "…"] }', 'Récupérer les comptes livrés (une ligne par compte).'],
  ] : [
    ['balance', 'key, action', '{ "balance": 42.5, "currency": "USD" }', 'Check your reseller balance.'],
    ['products', 'key, action', '[ { "product": 12, "name": "…", "rate": 6.60, "available": 120, "status": "In stock" } ]', 'List the catalog, your prices, and real-time stock.'],
    ['add_order', 'key, action, product, quantity', '{ "order": 10231 }', 'Place an order. Debits your balance, automatic delivery.'],
    ['order_status', 'key, action, order', '{ "status": "Completed", "charge": "6.60", "currency": "USD" }', 'Statuses: Pending, Processing, Completed, Canceled.'],
    ['result', 'key, action, order', '{ "result": ["mail:pass:recovery", "…"] }', 'Retrieve delivered accounts (one line per account).'],
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans">
      {/* En-tête */}
      <div className="max-w-3xl mb-12">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primaryDark px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Zap size={14} /> {lang === 'fr' ? 'API Revendeur' : 'Reseller API'}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
          {lang === 'fr' ? 'Revendez notre catalogue ' : 'Resell our catalog '} 
          <span className="text-primary">{lang === 'fr' ? 'via notre API' : 'via our API'}</span>
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          {lang === 'fr' 
            ? 'Intégrez notre catalogue à votre propre boutique. Achetez de manière programmatique, passez vos commandes et livrez vos clients automatiquement, 24/7. Réponses JSON, authentification par clé.' 
            : 'Integrate our catalog into your own store. Buy programmatically, place your orders, and deliver to your clients automatically, 24/7. JSON responses, key authentication.'}
        </p>
      </div>

      {/* Clé API */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Shield size={18} className="text-primary" /> {lang === 'fr' ? 'Votre Clé API' : 'Your API Key'}</h2>
        {!session ? (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-gray-500 text-sm flex-grow">{lang === 'fr' ? 'Connectez-vous pour générer votre clé API et commencer.' : 'Log in to generate your API key and get started.'}</p>
            <button onClick={() => navigate('auth')} className="bg-primary text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-primaryDark transition-all">{lang === 'fr' ? 'Se connecter' : 'Log in'}</button>
          </div>
        ) : apiKey ? (
          <div>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4">
              <code className="text-primary font-mono text-sm flex-grow break-all">{apiKey}</code>
              <button onClick={copyKey} className="shrink-0 text-xs font-bold px-4 py-2 rounded-lg bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all">{copied ? (lang === 'fr' ? 'Copié !' : 'Copied!') : (lang === 'fr' ? 'Copier' : 'Copy')}</button>
            </div>
            <p className="text-gray-400 text-xs mt-3">{lang === 'fr' ? 'Gardez cette clé secrète. Elle donne accès à votre solde et vos commandes.' : 'Keep this key secret. It grants access to your balance and your orders.'}</p>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <p className="text-gray-500 text-sm flex-grow">{lang === 'fr' ? 'Aucune clé active. Générez-en une pour accéder à l\'API.' : 'No active key. Generate one to access the API.'}</p>
            <button onClick={generateKey} disabled={loading} className="bg-primary text-white dark:text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-primaryDark transition-all disabled:opacity-50">{loading ? (lang === 'fr' ? 'Génération…' : 'Generating…') : (lang === 'fr' ? 'Générer ma clé API' : 'Generate my API Key')}</button>
          </div>
        )}
      </div>

      {/* Connexion */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft mb-10">
        <h2 className="text-lg font-black text-gray-900 mb-4">{lang === 'fr' ? 'Connexion' : 'Connection'}</h2>
        <div className="space-y-2 text-sm">
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Endpoint</span><code className="text-primary font-mono break-all">{API_BASE_URL}</code></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">{lang === 'fr' ? 'Méthode' : 'Method'}</span><span className="text-gray-700 font-mono">POST</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">Content-Type</span><span className="text-gray-700 font-mono">application/x-www-form-urlencoded</span></div>
          <div className="flex gap-4"><span className="w-28 text-gray-400 font-bold shrink-0">{lang === 'fr' ? 'Réponse' : 'Response'}</span><span className="text-gray-700 font-mono">JSON</span></div>
        </div>
        <div className="mt-6 bg-gray-900 rounded-2xl p-5 overflow-x-auto">
          <pre className="text-[12px] text-gray-200 font-mono leading-relaxed">{`curl -X POST ${API_BASE_URL} \\
  -d "key=YOUR_API_KEY" \\
  -d "action=products"`}</pre>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-soft">
        <h2 className="text-lg font-black text-gray-900 mb-6">{lang === 'fr' ? 'Actions disponibles' : 'Available actions'}</h2>
        <div className="space-y-6">
          {actions.map(([name, params, example, desc]) => (
            <div key={name} className="border-b border-gray-50 last:border-0 pb-6 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <code className="text-primary font-mono font-black text-sm">action={name}</code>
              </div>
              <p className="text-gray-600 text-sm mb-2">{desc}</p>
              <p className="text-xs text-gray-400 mb-3"><span className="font-bold">{lang === 'fr' ? 'Paramètres :' : 'Parameters :'}</span> <code className="font-mono">{params}</code></p>
              <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                <pre className="text-[12px] text-gray-200 font-mono">{example}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// POLICIES VIEW — CGU / Avertissement / Politique d'achat / Garantie
// ==========================================
const PoliciesView = ({ navigate, lang }) => {
  const isFr = lang === 'fr';

  return (
    <div className="max-w-4xl mx-auto px-6 py-16 font-sans">
      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primaryDark px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-6">
          <Shield size={14} /> {isFr ? 'Légal & Support' : 'Legal & Support'}
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-4">
          {isFr ? 'Conditions Générales de Vente (CGV)' : 'Terms and Conditions of Sale'}
        </h1>
        <p className="text-gray-500 text-lg leading-relaxed">
          {isFr ? 'Veuillez lire attentivement ces politiques avant tout achat sur AgedGmailYT.' : 'Please read these policies carefully before any purchase on AgedGmailYT.'}
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-12 shadow-soft space-y-12 text-gray-700 leading-relaxed text-sm">
        
        {/* 1. Acceptation */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">1. {isFr ? 'Acceptation des Conditions' : 'Acceptance of Terms'}</h2>
          <p>{isFr ? "En effectuant un achat, en rechargeant votre solde ou en utilisant les services proposés par AgedGmailYT, vous reconnaissez avoir lu, compris et accepté sans réserve les présentes Conditions Générales de Vente ainsi que notre Politique de Garantie et de Remboursement." : "By making a purchase, topping up your balance, or using the services offered by AgedGmailYT, you acknowledge having read, understood, and unreservedly accepted these Terms and Conditions of Sale as well as our Warranty and Refund Policy."}</p>
          <p className="mt-2">{isFr ? "Tout achat est considéré comme définitif dès la livraison du produit, sauf disposition contraire prévue dans les présentes." : "All purchases are considered final upon delivery of the product, unless otherwise provided herein."}</p>
        </section>

        {/* 2. Paiement et Crédit */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">2. {isFr ? 'Paiement et Crédit du Compte' : 'Payment and Account Credit'}</h2>
          <p>{isFr ? "Les crédits ajoutés à votre compte AgedGmailYT constituent un moyen de paiement interne exclusivement destiné aux achats réalisés sur notre plateforme." : "Credits added to your AgedGmailYT account constitute an internal payment method intended exclusively for purchases made on our platform."}</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>{isFr ? "ne sont pas remboursables ;" : "are not refundable;"}</li>
            <li>{isFr ? "ne sont pas convertibles en espèces ;" : "are not convertible into cash;"}</li>
            <li>{isFr ? "ne peuvent être revendus ;" : "cannot be resold;"}</li>
            <li>{isFr ? "ne sont pas transférables vers un autre compte utilisateur sauf autorisation écrite d'AgedGmailYT." : "are not transferable to another user account without written authorization from AgedGmailYT."}</li>
          </ul>
          <p className="mt-4">{isFr ? "Le client est seul responsable du montant qu'il choisit de créditer sur son compte." : "The customer is solely responsible for the amount they choose to credit to their account."}</p>
        </section>

        {/* 3. Livraison */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">3. {isFr ? 'Livraison' : 'Delivery'}</h2>
          <p>{isFr ? "La livraison est effectuée automatiquement immédiatement après validation du paiement." : "Delivery is carried out automatically immediately after payment validation."}</p>
          <p className="mt-2">{isFr ? "Le client est responsable de récupérer les informations livrées dans son espace client." : "The customer is responsible for retrieving the information delivered in their customer area."}</p>
          <p className="mt-2">{isFr ? "Pour des raisons de sécurité, les commandes peuvent être supprimées automatiquement de nos serveurs après 30 jours. Le client est invité à sauvegarder immédiatement toutes les informations fournies." : "For security reasons, orders may be automatically deleted from our servers after 30 days. The customer is advised to immediately save all provided information."}</p>
          <p className="mt-2 font-bold">{isFr ? "Une commande supprimée après ce délai ne pourra pas être restaurée." : "An order deleted after this period cannot be restored."}</p>
        </section>

        {/* 4. Formats de livraison */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">4. {isFr ? 'Description des Produits et Formats de Livraison' : 'Product Description and Delivery Formats'}</h2>
          <p>{isFr ? "Les produits commercialisés par AgedGmailYT peuvent être livrés sous différents formats selon leur nature, leur disponibilité et leur description au moment de la commande." : "The products marketed by AgedGmailYT may be delivered in different formats depending on their nature, availability, and description at the time of the order."}</p>
          <p className="mt-2">{isFr ? "La description affichée sur la fiche produit fait foi et précise les informations incluses dans la livraison." : "The description displayed on the product page is authentic and specifies the information included in the delivery."}</p>
          <p className="mt-4 mb-2">{isFr ? "Les formats de livraison peuvent notamment comprendre, sans s'y limiter :" : "Delivery formats may include, but are not limited to:"}</p>
          
          <div className="overflow-x-auto rounded-xl border border-gray-100 mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 font-black">Format</th>
                  <th className="px-4 py-3 font-black">{isFr ? 'Contenu fourni' : 'Provided Content'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr><td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">EMAIL | MOT DE PASSE</td><td className="px-4 py-3">{isFr ? "Adresse email et mot de passe de connexion." : "Email address and login password."}</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">EMAIL | MOT DE PASSE | RÉCUPÉRATION</td><td className="px-4 py-3">{isFr ? "Adresse email, mot de passe et, lorsque disponible, une ou plusieurs informations de récupération (email secondaire, numéro, codes)." : "Email, password and, when available, recovery information (secondary email, phone, codes)."}</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">EMAIL | MOT DE PASSE | APP PASSWORD</td><td className="px-4 py-3">{isFr ? "Adresse email, mot de passe principal et mot de passe d'application (App Password)." : "Email address, main password and App Password."}</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">EMAIL | MOT DE PASSE | 2FA SECRET KEY</td><td className="px-4 py-3">{isFr ? "Adresse email, mot de passe et clé secrète permettant de générer les codes 2FA." : "Email address, password and secret key to generate 2FA codes."}</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">EMAIL | MOT DE PASSE | BACKUP CODES</td><td className="px-4 py-3">{isFr ? "Adresse email, mot de passe et codes de secours (Backup Codes) lorsque ceux-ci sont inclus." : "Email address, password and backup codes when included."}</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">EMAIL | MOT DE PASSE | COOKIES</td><td className="px-4 py-3">{isFr ? "Identifiants de connexion accompagnés des cookies de session, lorsque le produit le prévoit." : "Login credentials accompanied by session cookies, when the product provides them."}</td></tr>
                <tr><td className="px-4 py-3 font-mono text-xs font-bold whitespace-nowrap">{isFr ? "Format personnalisé" : "Custom Format"}</td><td className="px-4 py-3">{isFr ? "Tout autre format explicitement indiqué sur la fiche du produit au moment de l'achat." : "Any other format explicitly indicated on the product page at the time of purchase."}</td></tr>
              </tbody>
            </table>
          </div>

          <h3 className="font-bold text-gray-900 mt-6">{isFr ? "Disponibilité des informations complémentaires" : "Availability of additional information"}</h3>
          <p className="mt-2">{isFr ? "Les informations complémentaires (email de récupération, numéro, app password, 2FA, backup codes, cookies) ne sont fournies QUE lorsqu'elles sont expressément mentionnées dans la description du produit." : "Additional information (recovery email, phone, app password, 2FA, backup codes, cookies) are provided ONLY when expressly mentioned in the product description."}</p>
          <p className="mt-2">{isFr ? "Leur absence ne constitue ni un défaut de conformité, ni un motif de remboursement lorsque ces éléments ne faisaient pas partie de la description du produit acheté." : "Their absence does not constitute a lack of conformity, nor a reason for refund when these elements were not part of the description of the purchased product."}</p>
        </section>

        {/* 5. Responsabilité */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">5. {isFr ? "Responsabilité du Client après Livraison" : "Customer Responsibility After Delivery"}</h2>
          <p>{isFr ? "À compter de la première connexion réussie, le client devient entièrement responsable de l'utilisation, de la gestion et de la sécurisation du compte." : "From the first successful login, the customer becomes entirely responsible for the use, management, and securing of the account."}</p>
          <p className="mt-2">{isFr ? "Toute suspension, restriction ou vérification imposée ultérieurement par les plateformes ne saurait engager la responsabilité d'AgedGmailYT." : "Any suspension, restriction, or verification subsequently imposed by the platforms cannot hold AgedGmailYT liable."}</p>
        </section>

        {/* 6. Sécurisation */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">6. {isFr ? "Sécurisation du Compte" : "Securing the Account"}</h2>
          <p>{isFr ? "Après réception du compte, le client est invité à vérifier les informations, conserver les accès, et modifier progressivement les paramètres de sécurité." : "After receiving the account, the customer is advised to verify the information, keep the credentials safe, and progressively modify the security settings."}</p>
          <p className="mt-4 font-bold">{isFr ? "Pour limiter les risques de détection automatique, il est fortement recommandé :" : "To limit the risks of automatic detection, it is strongly recommended:"}</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>{isFr ? "d'attendre au minimum 72 heures avant toute modification importante ;" : "to wait at least 72 hours before any major modification;"}</li>
            <li>{isFr ? "idéalement d'attendre 7 jours avant de modifier simultanément le mot de passe, l'email de récupération, le numéro, ou la 2FA." : "ideally to wait 7 days before simultaneously modifying the password, recovery email, phone, or 2FA."}</li>
          </ul>
        </section>

        {/* 7. Connexion */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">7. {isFr ? "Conditions de Connexion" : "Connection Conditions"}</h2>
          <p>{isFr ? "Le client s'engage à utiliser une connexion Internet fiable, idéalement une IP résidentielle stable." : "The customer commits to using a reliable Internet connection, ideally a stable residential IP."}</p>
          <p className="mt-2 text-red-600 font-bold">{isFr ? "L'utilisation de VPN publics, proxys gratuits ou serveurs anonymes est fortement déconseillée et annulera notre responsabilité." : "The use of public VPNs, free proxies, or anonymous servers is strongly discouraged and will void our liability."}</p>
        </section>

        {/* 8. Garantie */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">8. {isFr ? "Garantie" : "Warranty"}</h2>
          <p>{isFr ? "La garantie couvre exclusivement la livraison du produit, sa conformité à la description, et la possibilité d'effectuer une première connexion réussie." : "The warranty exclusively covers the delivery of the product, its conformity to the description, and the ability to make a first successful login."}</p>
          <p className="mt-2">{isFr ? "Le fait que le client décide de ne pas utiliser immédiatement le compte n'a aucun effet sur la durée de cette garantie." : "The fact that the customer decides not to use the account immediately has no effect on the duration of this warranty."}</p>
        </section>

        {/* 9. Exclusions de Garantie */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">9. {isFr ? "Exclusions de Garantie" : "Warranty Exclusions"}</h2>
          <p>{isFr ? "La garantie cesse immédiatement si :" : "The warranty ceases immediately if:"}</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>{isFr ? "le mot de passe a été modifié avant le délai recommandé ;" : "the password was modified before the recommended delay;"}</li>
            <li>{isFr ? "les paramètres de sécurité ont été modifiés prématurément ;" : "security settings were modified prematurely;"}</li>
            <li>{isFr ? "un VPN, proxy gratuit ou méthode anormale a été utilisée ;" : "a VPN, free proxy, or abnormal method was used;"}</li>
            <li>{isFr ? "les problèmes proviennent de la configuration du client." : "the problems stem from the customer's configuration."}</li>
          </ul>
        </section>

        {/* 10. Limitation de Responsabilité */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">10. {isFr ? "Limitation de Responsabilité" : "Limitation of Liability"}</h2>
          <p>{isFr ? "En aucun cas AgedGmailYT ne pourra être tenu responsable des pertes financières, de revenus, de données, de la suspension de chaîne YouTube ou de compte Google. Le client utilise les produits sous sa seule responsabilité." : "In no event shall AgedGmailYT be held liable for financial losses, loss of revenue, data loss, suspension of a YouTube channel, or Google account closure. The customer uses the products at their sole responsibility."}</p>
        </section>

        {/* 12. Politique de Remboursement */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">11. {isFr ? "Politique de Remboursement" : "Refund Policy"}</h2>
          <p>{isFr ? "Les produits commercialisés étant des biens numériques livrés instantanément, ils ne peuvent être retournés après livraison." : "The products sold being digital goods delivered instantly, they cannot be returned after delivery."}</p>
          <p className="mt-2">{isFr ? "Un remboursement ou remplacement ne pourra être envisagé que si :" : "A refund or replacement will only be considered if:"}</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>{isFr ? "le produit livré est manifestement différent de celui commandé ;" : "the delivered product is clearly different from the one ordered;"}</li>
            <li>{isFr ? "le compte est inaccessible dès la livraison en raison d'un problème imputable à AgedGmailYT ;" : "the account is inaccessible upon delivery due to an issue attributable to AgedGmailYT;"}</li>
            <li>{isFr ? "la première connexion est impossible malgré le respect des conditions." : "the first login is impossible despite respecting the conditions."}</li>
          </ul>
        </section>

        {/* 13. Délai de Réclamation */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">12. {isFr ? "Délai de Réclamation" : "Claim Period"}</h2>
          <p>{isFr ? "Toute réclamation doit être transmise dans un délai maximum de 5 jours calendaires suivant la livraison. Passé ce délai, le produit sera réputé conforme et définitivement accepté." : "Any claim must be submitted within a maximum of 5 calendar days following delivery. After this period, the product will be deemed compliant and definitively accepted."}</p>
        </section>

        {/* 14. Cas Excluant Tout Remboursement */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">13. {isFr ? "Cas Excluant Tout Remboursement" : "Cases Excluding Any Refund"}</h2>
          <p>{isFr ? "Aucun remboursement ne sera accordé notamment dans les situations suivantes :" : "No refunds will be granted, notably in the following situations:"}</p>
          <ul className="list-disc pl-6 mt-2 space-y-2">
            <li>{isFr ? "erreur de commande du client ;" : "customer order error;"}</li>
            <li>{isFr ? "mauvaise utilisation du produit ;" : "misuse of the product;"}</li>
            <li>{isFr ? "modification prématurée des paramètres de sécurité ;" : "premature modification of security settings;"}</li>
            <li>{isFr ? "utilisation d'un VPN ou proxy ;" : "use of a VPN or proxy;"}</li>
            <li>{isFr ? "perte d'accès après une première connexion réussie ;" : "loss of access after a successful first login;"}</li>
            <li>{isFr ? "changement d'avis ou absence d'utilisation du compte." : "change of mind or lack of account use."}</li>
          </ul>
        </section>

        {/* 15. Fraudes */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">14. {isFr ? "Lutte contre les Fraudes" : "Anti-Fraud Policy"}</h2>
          <p>{isFr ? "AgedGmailYT se réserve le droit de suspendre immédiatement tout compte utilisateur en cas de suspicion raisonnable de fraude ou de tentative de rétrofacturation abusive (chargeback)." : "AgedGmailYT reserves the right to immediately suspend any user account in case of reasonable suspicion of fraud or abusive chargeback attempt."}</p>
        </section>

        {/* 16. Réclamations */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-4">15. {isFr ? "Réclamations et Assistance" : "Claims and Support"}</h2>
          <p>{isFr ? "Toute demande d'assistance doit être adressée au support officiel. Toute réclamation manifestement abusive, répétitive ou effectuée de mauvaise foi pourra être rejetée." : "Any support request must be addressed to the official support. Any claim that is manifestly abusive, repetitive, or made in bad faith may be rejected."}</p>
        </section>

      </div>

      <div className="text-center mt-12">
        <button onClick={() => navigate('shop')} className="text-sm font-bold text-primary hover:underline">{isFr ? 'Retour au catalogue' : 'Back to catalog'}</button>
      </div>
    </div>
  );
};

const SettingsTab = ({ profile, session, onUpdate, lang, t }) => {
  const [firstName, setFirstName] = useState(profile?.first_name || "");
  const [lastName, setLastName] = useState(profile?.last_name || "");
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "");
  const [email, setEmail] = useState(profile?.email || "");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [tfaEnabled, setTfaEnabled] = useState(profile?.two_factor_enabled || false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [uploading, setUploading] = useState(false);
  // Gestion des méthodes de connexion (mot de passe, feedback dédié).
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [connMsg, setConnMsg] = useState({ type: "", text: "" });

  // Identités réelles du compte (source de vérité pour "connecté via Google" et
  // "a un mot de passe"), lues depuis la session — pas depuis un champ profil
  // qui n'était jamais fiable.
  const identities = session?.user?.identities || [];
  const hasGoogle = identities.some((i) => i.provider === 'google');
  const hasPasswordIdentity = identities.some((i) => i.provider === 'email');

  const handleAvatarUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      // Auto-save to profile
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      onUpdate();
    } catch (error) {
      setErrorMessage("Upload error: Ensure you have created a public 'avatars' bucket in Supabase.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMessage("");

    try {
      const { error } = await supabase.from('profiles').upsert({
        id: profile.id,
        email,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName,
        avatar_url: avatarUrl,
        two_factor_enabled: tfaEnabled,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setSuccess(true);
      onUpdate();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Définit (compte Google sans mot de passe) ou change le mot de passe.
  // Dans les deux cas c'est updateUser({ password }) : Supabase crée
  // l'identité 'email' si elle n'existait pas, ce qui permet ensuite de se
  // connecter par email/mot de passe même pour un compte créé via Google.
  const handleUpdatePassword = async () => {
    setPwError(""); setPwSuccess("");
    if (newPassword.length < 6) { setPwError("Le mot de passe doit contenir au moins 6 caractères."); return; }
    if (newPassword !== confirmPassword) { setPwError("Les deux mots de passe ne correspondent pas."); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) setPwError(friendlyAuthError(error.message));
    else {
      setNewPassword(""); setConfirmPassword("");
      setPwSuccess(hasPasswordIdentity
        ? "Mot de passe mis à jour."
        : "Mot de passe défini. Tu peux désormais te connecter avec ton email et ce mot de passe.");
      onUpdate();
      setTimeout(() => setPwSuccess(""), 5000);
    }
    setPwLoading(false);
  };

  // Active la connexion Google (linkIdentity) — redirige vers Google puis
  // revient avec l'identité rattachée. Nécessite "Manual linking" activé côté
  // projet Supabase ; sinon on l'explique clairement au lieu d'un message brut.
  const handleLinkGoogle = async () => {
    setConnMsg({ type: "", text: "" });
    setGoogleLoading(true);
    const { error } = await supabase.auth.linkIdentity({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/#settings' },
    });
    if (error) {
      const m = error.message?.toLowerCase() || "";
      setConnMsg({
        type: "error",
        text: m.includes('manual linking') || m.includes('disabled')
          ? "L'association de compte n'est pas activée côté serveur. Contacte le support."
          : friendlyAuthError(error.message),
      });
      setGoogleLoading(false);
    }
    // Succès : redirection Google, le retour recharge la page.
  };

  // Désactive la connexion Google (unlinkIdentity). Refusé par Supabase si
  // c'est la seule méthode de connexion (sinon compte inaccessible) — on
  // impose donc d'avoir défini un mot de passe avant.
  const handleUnlinkGoogle = async () => {
    setConnMsg({ type: "", text: "" });
    if (!hasPasswordIdentity) {
      setConnMsg({ type: "error", text: "Définis d'abord un mot de passe ci-dessous : sans lui, retirer Google te bloquerait l'accès au compte." });
      return;
    }
    if (!window.confirm("Retirer la connexion Google ? Tu te connecteras uniquement par email et mot de passe.")) return;
    setGoogleLoading(true);
    const googleIdentity = identities.find((i) => i.provider === 'google');
    const { error } = await supabase.auth.unlinkIdentity(googleIdentity);
    if (error) setConnMsg({ type: "error", text: friendlyAuthError(error.message) });
    else {
      setConnMsg({ type: "success", text: "Connexion Google retirée." });
      onUpdate();
    }
    setGoogleLoading(false);
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 tracking-tight">{t('profileSettings')}</h2>
        <form className="space-y-8" onSubmit={handleSave}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('firstName')}</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: John" /></div>
            <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('lastName')}</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" placeholder="Ex: Doe" /></div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('displayName')} *</label><input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full px-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-primary/20 font-bold text-sm" /><p className="text-[10px] text-gray-400 italic mt-2">This is the name that will appear on your dashboard and your reviews.</p></div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Profile Picture</label>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] border border-gray-100 flex items-center justify-center overflow-hidden relative group">
                {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover" alt="Preview" /> : <User size={30} className="text-gray-300" />}
                {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><RefreshCcw size={20} className="text-white animate-spin" /></div>}
              </div>
              <div className="space-y-3">
                <input type="file" id="avatar" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                <label htmlFor="avatar" className="inline-block bg-white border border-gray-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white dark:text-gray-900 hover:border-primary transition-all cursor-pointer">
                  {uploading ? "Loading..." : "Choose a photo"}
                </label>
                <p className="text-[10px] text-gray-400 font-medium italic">JPG, PNG supported. Max 2MB.</p>
              </div>
            </div>
          </div>
          <div><label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address *</label><input type="email" value={email} readOnly className="w-full px-6 py-4 rounded-2xl bg-gray-100 border-none text-gray-400 font-bold text-sm cursor-not-allowed" /></div>
          {errorMessage && <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}
          <button type="submit" disabled={loading} className={`px-12 py-5 rounded-full font-bold text-sm transition-all shadow-xl shadow-black/10 flex items-center gap-2 ${success ? 'bg-green-500 text-white' : 'bg-gray-900 text-white hover:bg-black'}`}>
            {loading ? <RefreshCcw size={16} className="animate-spin" /> : success ? <><CheckCircle size={16} /> Successfully modified</> : t('saveBtn')}
          </button>
        </form>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 tracking-tight flex items-center gap-3"><ShieldCheck size={26} className="text-primary" /> Connexion & sécurité</h2>
        <p className="text-sm text-gray-400 mb-8">Gère tes méthodes de connexion. Tu peux utiliser Google, un mot de passe, ou les deux.</p>

        {connMsg.text && (
          <div className={`mb-6 p-4 rounded-2xl text-xs font-bold border flex items-center gap-2 ${connMsg.type === 'error' ? 'bg-red-50 text-red-500 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
            {connMsg.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle size={14} />} {connMsg.text}
          </div>
        )}

        <div className="space-y-5">
          {/* Google */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm"><img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Connexion Google</h4>
                <p className="text-xs font-medium flex items-center gap-1.5">
                  {hasGoogle
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="text-green-600">Activée</span></>
                    : <span className="text-gray-400">Non activée</span>}
                </p>
              </div>
            </div>
            {hasGoogle ? (
              <button onClick={handleUnlinkGoogle} disabled={googleLoading} className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all disabled:opacity-50">
                {googleLoading ? '…' : 'Désactiver'}
              </button>
            ) : (
              <button onClick={handleLinkGoogle} disabled={googleLoading} className="px-5 py-2.5 bg-gray-900 text-white dark:text-gray-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-all disabled:opacity-50">
                {googleLoading ? '…' : 'Activer'}
              </button>
            )}
          </div>

          {/* Mot de passe */}
          <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <div className="flex items-center gap-5 mb-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary"><ShieldCheck size={22} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">{hasPasswordIdentity ? 'Mot de passe' : 'Définir un mot de passe'}</h4>
                <p className="text-xs font-medium flex items-center gap-1.5">
                  {hasPasswordIdentity
                    ? <><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> <span className="text-green-600">Connexion par email activée</span></>
                    : <span className="text-gray-400">Ajoute un mot de passe pour te connecter aussi par email</span>}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={hasPasswordIdentity ? 'Nouveau mot de passe' : 'Mot de passe'} className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirmer" className="w-full pl-5 pr-12 py-3.5 rounded-xl bg-white border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm" />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {pwError && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2 mb-4"><AlertTriangle size={14} /> {pwError}</div>}
            {pwSuccess && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2 mb-4"><CheckCircle size={14} /> {pwSuccess}</div>}
            <button onClick={handleUpdatePassword} disabled={pwLoading} className="px-6 py-3 bg-gray-900 text-white dark:text-gray-900 rounded-xl font-bold text-xs hover:bg-primary transition-all flex items-center gap-2 disabled:opacity-50">
              {pwLoading && <RefreshCcw size={14} className="animate-spin" />}
              {hasPasswordIdentity ? 'Mettre à jour' : 'Définir le mot de passe'}
            </button>
          </div>

          {/* 2FA */}
          <div className="flex items-center justify-between p-6 bg-gray-50 rounded-[2rem] border border-gray-100">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-primary"><CreditCard size={22} /></div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Double authentification (2FA)</h4>
                <p className="text-xs text-gray-400 font-medium">Une couche de sécurité supplémentaire.</p>
              </div>
            </div>
            <button onClick={async () => {
              const newVal = !tfaEnabled;
              setTfaEnabled(newVal);
              await supabase.from('profiles').update({ two_factor_enabled: newVal }).eq('id', profile.id);
            }} className={`w-14 h-7 rounded-full relative transition-all duration-300 shrink-0 ${tfaEnabled ? 'bg-primary' : 'bg-gray-200'}`}>
              <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 ${tfaEnabled ? 'left-8' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// DASHBOARD VIEW
// ==========================================

// Modale de crédentiels réutilisée par MyOrdersView (extraite pour éviter la duplication).
// Une carte par compte livré (parsé), avec repli gracieux si une ligne ne
// correspond pas au format attendu — jamais de texte brut/coupé affiché.
const DeliveredAccountCard = ({ raw, index, total }) => {
  let account = null;
  let parseFailed = false;
  try {
    account = parseAccountDelivery(raw);
  } catch {
    parseFailed = true;
  }

  if (parseFailed || !account) {
    return (
      <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 space-y-6">
        {total > 1 && <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compte {index + 1}/{total}</div>}
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Données Brutes du Fournisseur</div>
          {raw && (
            <div className="bg-white border border-gray-100 rounded-3xl p-6 font-mono text-sm break-all text-gray-700 leading-relaxed shadow-sm">
              {raw}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-3xl p-6 md:p-8 border border-gray-100 space-y-6">
      {total > 1 && <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Compte {index + 1}/{total}</div>}

      {/* Identifiants principaux */}
      <div>
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Identifiants principaux</div>
        <div className="space-y-2 font-mono text-sm">
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
            <span className="text-gray-700 break-all">{account.email}</span>
            <button onClick={() => navigator.clipboard.writeText(account.email)} className="shrink-0 ml-3 text-gray-400 hover:text-primary"><Copy size={14} /></button>
          </div>
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
            <span className="text-gray-700 break-all">{account.password}</span>
            <button onClick={() => navigator.clipboard.writeText(account.password)} className="shrink-0 ml-3 text-gray-400 hover:text-primary"><Copy size={14} /></button>
          </div>
        </div>
      </div>

      {/* Email de récupération */}
      {account.recoveryEmail && (
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Email de récupération</div>
          <div className="space-y-2 font-mono text-sm">
            <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
              <span className="text-gray-700 break-all">{account.recoveryEmail}</span>
              <button onClick={() => navigator.clipboard.writeText(account.recoveryEmail)} className="shrink-0 ml-3 text-gray-400 hover:text-primary"><Copy size={14} /></button>
            </div>
            {account.recoveryPassword && (
              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
                <span className="text-gray-700 break-all">{account.recoveryPassword}</span>
                <button onClick={() => navigator.clipboard.writeText(account.recoveryPassword)} className="shrink-0 ml-3 text-gray-400 hover:text-primary"><Copy size={14} /></button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mot de passe d'application */}
      {account.appPassword && (
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Mot de passe d'application</div>
          <p className="text-xs text-gray-400 mb-3">À utiliser pour une connexion via une app tierce, SMTP ou IMAP — pas pour te connecter directement sur gmail.com.</p>
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3">
            <span className="font-mono text-sm text-gray-700 tracking-widest">{account.appPassword}</span>
            <button onClick={() => navigator.clipboard.writeText(account.appPassword)} className="shrink-0 ml-3 text-gray-400 hover:text-primary"><Copy size={14} /></button>
          </div>
        </div>
      )}

      {/* Clé 2FA */}
      {account.totpSecret && (
        <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
          <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Clé secrète 2FA</div>
          <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-4 py-3 mb-4">
            <span className="font-mono text-sm text-gray-700 tracking-widest break-all">{account.totpSecret}</span>
            <button onClick={() => navigator.clipboard.writeText(account.totpSecret)} className="shrink-0 ml-3 text-gray-400 hover:text-primary"><Copy size={14} /></button>
          </div>
          <ol className="text-xs text-gray-600 leading-relaxed space-y-1.5 list-decimal list-inside">
            <li>Va sur <a href="https://2fa.live" target="_blank" rel="noopener noreferrer" className="text-primary underline font-bold">2fa.live</a> (ou ton app Authenticator).</li>
            <li>Colle la clé <span className="font-bold">sans espace</span> (déjà nettoyée ci-dessus).</li>
            <li>Utilise le code généré <span className="font-bold">immédiatement</span> — il expire vite.</li>
            <li>Si Google répond "wrong code", attends le cycle de 30s suivant et réessaie avec le nouveau code.</li>
          </ol>
        </div>
      )}

      {/* Codes de secours 2FA */}
      {account.backupCodes && account.backupCodes.length > 0 && (
        <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
          <div className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
            <ShieldAlert size={14} /> Codes de secours 2FA (8 chiffres)
          </div>
          <p className="text-xs text-amber-800 mb-4 leading-relaxed font-medium">
            <span className="font-bold">Important :</span> Utilisez l'un de ces codes à 8 chiffres pour vous connecter lorsque la double vérification est demandée. Une fois connecté(e), allez <span className="font-bold underline">immédiatement</span> dans les paramètres de sécurité de votre compte Google pour modifier la méthode 2FA (ajouter votre numéro ou app authenticator).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {account.backupCodes.map((code, i) => (
              <div key={i} className="flex items-center justify-between bg-white border border-amber-200/60 rounded-xl px-3 py-2 shadow-sm">
                <span className="font-mono text-sm text-gray-700 tracking-wider font-bold">{code}</span>
                <button onClick={() => navigator.clipboard.writeText(code)} className="shrink-0 text-gray-400 hover:text-amber-600 transition-colors"><Copy size={14} /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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


// ==========================================
// TRANSFER CREDITS MODAL
// Permet d'envoyer des crédits à un autre utilisateur via son email.
// ==========================================
const TransferCreditsModal = ({ profile, session, fetchProfile, onClose, lang, t }) => {
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const balance = profile?.balance || 0;
  const amountNum = parseFloat(amount) || 0;

  const handleLookup = async () => {
    setErrorMsg('');
    if (!recipientEmail.trim()) return;
    if (recipientEmail.trim().toLowerCase() === session?.user?.email?.toLowerCase()) {
      setErrorMsg("Vous ne pouvez pas vous transférer des crédits à vous-même.");
      return;
    }
    if (amountNum <= 0) { setErrorMsg("Montant invalide."); return; }
    if (amountNum > balance) { setErrorMsg(`Solde insuffisant. Vous avez $${balance.toFixed(2)}.`); return; }
    if (amountNum < 0.01) { setErrorMsg("Montant minimum : $0.01."); return; }

    setIsLoading(true);
    const { data: recipient, error } = await supabase
      .from('profiles')
      .select('id, display_name, email')
      .eq('email', recipientEmail.trim().toLowerCase())
      .maybeSingle();
    setIsLoading(false);

    if (error || !recipient) {
      setErrorMsg("Aucun compte trouvé avec cet email. Vérifiez l'adresse.");
      return;
    }
    setRecipientName(recipient.display_name || recipient.email);
    setStep('confirm');
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Vérification solde en temps réel (anti race-condition)
      const { data: freshProfile } = await supabase
        .from('profiles').select('balance').eq('id', session.user.id).single();
      if (!freshProfile || (freshProfile.balance || 0) < amountNum) {
        throw new Error('Solde insuffisant au moment du transfert.');
      }

      // 2. Récupérer le destinataire
      const { data: recipient } = await supabase
        .from('profiles').select('id, balance').eq('email', recipientEmail.trim().toLowerCase()).single();
      if (!recipient) throw new Error('Destinataire introuvable.');

      // 3. Débiter l'expéditeur
      const { error: debitErr } = await supabase
        .from('profiles')
        .update({ balance: Math.round((freshProfile.balance - amountNum) * 100) / 100 })
        .eq('id', session.user.id);
      if (debitErr) throw debitErr;

      // 4. Créditer le destinataire (rollback si ça échoue)
      const { error: creditErr } = await supabase
        .from('profiles')
        .update({ balance: Math.round(((recipient.balance || 0) + amountNum) * 100) / 100 })
        .eq('id', recipient.id);
      if (creditErr) {
        // Rollback : recréditer l'expéditeur
        await supabase.from('profiles')
          .update({ balance: Math.round((freshProfile.balance) * 100) / 100 })
          .eq('id', session.user.id);
        throw creditErr;
      }

      // 5. Logger le transfert dans orders (product_id=998 = code transfert)
      await supabase.from('orders').insert({
        user_id: session.user.id,
        buyer_email: session.user.email,
        product_id: 998,
        product_name: `Transfert → ${recipientEmail.trim()}`,
        quantity: 1,
        total_price: amountNum,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      });

      setStep('success');
      if (fetchProfile) fetchProfile(session.user.id);
    } catch (err) {
      setErrorMsg(err.message || 'Une erreur est survenue.');
      setStep('error');
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2"><Send size={18} /> {t('transferBtn') || 'Transfer'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{lang === 'fr' ? "Envoyer des crédits à un autre utilisateur" : "Send credits to another user"}</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-8 space-y-6">
          {/* Solde dispo */}
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-gray-500 font-medium">{lang === 'fr' ? "Votre solde disponible" : "Your available balance"}</span>
            <span className="text-xl font-black text-gray-900 font-price">${balance.toFixed(2)}</span>
          </div>

          {step === 'form' && (
            <>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{lang === 'fr' ? "Email du destinataire" : "Recipient Email"}</label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={e => setRecipientEmail(e.target.value)}
                  placeholder="ami@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('amountToRecharge')}</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={balance}
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 focus:ring-primary/20 text-sm font-medium font-mono"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[1, 5, 10].map(v => (
                    <button key={v} onClick={() => setAmount(String(Math.min(v, balance)))}
                      className="px-3 py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary transition-all">
                      ${v}
                    </button>
                  ))}
                  <button onClick={() => setAmount(String(balance))}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary transition-all">
                    Max
                  </button>
                </div>
              </div>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100">{errorMsg}</div>}
              <button
                onClick={handleLookup}
                disabled={isLoading || !recipientEmail.trim() || amountNum <= 0}
                className="w-full py-4 rounded-2xl bg-gray-900 text-white dark:text-gray-900 font-bold text-base hover:bg-primary transition-all disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <ChevronRight size={18} />}
                {lang === 'fr' ? "Continuer" : "Continue"}
              </button>
            </>
          )}

          {step === 'confirm' && (
            <>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 space-y-3">
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">{lang === 'fr' ? "Récapitulatif du transfert" : "Transfer Summary"}</div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">{lang === 'fr' ? "Destinataire" : "Recipient"}</span><span className="text-sm font-bold text-gray-900">{recipientName}</span></div>
                <div className="flex justify-between"><span className="text-sm text-gray-500">Email</span><span className="text-sm font-bold text-gray-900">{recipientEmail}</span></div>
                <div className="h-px bg-primary/10 my-2" />
                <div className="flex justify-between"><span className="text-base font-black text-gray-900">{lang === 'fr' ? "Montant" : "Amount"}</span><span className="text-xl font-black text-primary">${amountNum.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-400"><span>{lang === 'fr' ? "Votre solde après" : "Your balance after"}</span><span className="font-mono font-bold">${(balance - amountNum).toFixed(2)}</span></div>
              </div>
              {errorMsg && <div className="bg-red-50 text-red-600 text-sm font-bold p-4 rounded-xl border border-red-100">{errorMsg}</div>}
              <div className="flex gap-3">
                <button onClick={() => setStep('form')} className="flex-1 py-4 rounded-2xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-all">
                  {lang === 'fr' ? "Modifier" : "Edit"}
                </button>
                <button
                  onClick={handleTransfer}
                  disabled={isLoading}
                  className="flex-1 py-4 rounded-2xl bg-primary text-white dark:text-gray-900 font-bold hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isLoading ? <RefreshCcw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                  {lang === 'fr' ? "Confirmer" : "Confirm"}
                </button>
              </div>
            </>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <div>
                <div className="text-xl font-black text-gray-900">Transfert effectué !</div>
                <div className="text-sm text-gray-500 mt-1">${amountNum.toFixed(2)} envoyés à <strong>{recipientEmail}</strong></div>
              </div>
              <button onClick={onClose} className="w-full py-4 rounded-2xl bg-gray-900 text-white dark:text-gray-900 font-bold hover:bg-primary transition-all">
                Fermer
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <X size={32} className="text-red-600" />
              </div>
              <div>
                <div className="text-xl font-black text-gray-900">Transfert échoué</div>
                <div className="text-sm text-red-500 mt-1">{errorMsg}</div>
              </div>
              <button onClick={() => { setStep('form'); setErrorMsg(''); }} className="w-full py-4 rounded-2xl bg-gray-900 text-white dark:text-gray-900 font-bold hover:bg-primary transition-all">
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Transforme un UUID Supabase en code commande court à 6 chiffres.
// Déterministe : même UUID → même code. Toujours exactement 6 chiffres (000000–999999).
const shortOrderId = (uuid = '') => {
  const hex = String(uuid).replace(/-/g, '').slice(0, 8);
  const num = parseInt(hex, 16) || 0;
  return String(num % 1000000).padStart(6, '0');
};

// Page "My orders" : solde + recharge en tête, liste des commandes en dessous.
// Plus de sidebar à onglets (Dashboard/Orders/Settings) — Settings vit maintenant
// dans sa propre page (menu déroulant du profil), et l'onglet "Dashboard" a été
// retiré car redondant avec cette page elle-même.
const MyOrdersView = ({ profile, navigate, orders = [], onResume, session, fetchProfile, lang, t, loading = false }) => {
  if (!session) { navigate('auth'); return null; }
  const [viewOrder, setViewOrder] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  // Initialise la checkbox depuis le profil
  const [sendEmailAll, setSendEmailAll] = useState(profile?.send_email_on_delivery ?? false);

  // Synchronise la checkbox si le profil change (ex: rechargement)
  React.useEffect(() => {
    setSendEmailAll(profile?.send_email_on_delivery ?? false);
  }, [profile?.send_email_on_delivery]);

  // Sauvegarde la préférence email en base dès que la case est cochée/décochée
  const handleEmailToggle = async (checked) => {
    setSendEmailAll(checked);
    if (!session) return;
    await supabase.from('profiles').update({ send_email_on_delivery: checked }).eq('id', session.user.id);
    if (fetchProfile) fetchProfile(session.user.id);
  };

  // Filtre uniquement les commandes d'achat (pas les recharges product_id=999)
  const purchaseOrders = orders.filter(o => o.product_id !== 999);

  // Parse les options d'un nom de produit YTSeller :
  // "Gmail Accounts 2FA/ BACKUP CODE/ APP PASSWORD (3 Months)" → baseName + options
  // "🟢Fresh gmail account 🔴Mix ip 🟢Random name and gender" → options séparées par les émojis
  const parseProductOptions = (name = '') => {
    if (!name) return { baseName: '', options: [] };

    // Détecte les options avec émojis colorés (format YTSeller)
    const emojiOptionRegex = /([🟢🔴🟡⚪🔵🟠🟤⚫]+[^🟢🔴🟡⚪🔵🟠🟤⚫\n]+)/g;
    const emojiMatches = name.match(emojiOptionRegex);
    if (emojiMatches && emojiMatches.length > 1) {
      const cleanOptions = emojiMatches.map(o => o.trim().replace(/\s*-\s*$/, '').trim()).filter(Boolean);
      const firstEmojiIdx = name.search(/[🟢🔴🟡⚪🔵🟠🟤⚫]/u);
      const baseName = firstEmojiIdx > 0 ? name.slice(0, firstEmojiIdx).trim() : (cleanOptions[0] || name);
      return { baseName: baseName || cleanOptions[0], options: cleanOptions.slice(baseName ? 0 : 1) };
    }

    // Détecte les options séparées par "/" (format "2FA/ BACKUP CODE/ APP PASSWORD")
    const slashIdx = name.search(/\s*\/\s*/);
    if (slashIdx > 3) {
      const durationMatch = name.match(/\(([^)]+)\)\s*$/);
      const duration = durationMatch ? durationMatch[1] : null;
      const withoutDuration = duration ? name.slice(0, name.lastIndexOf('(')).trim() : name;
      const parts = withoutDuration.split('/').map(p => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        const opts = parts.slice(1);
        if (duration) opts.push(duration);
        return { baseName: parts[0], options: opts };
      }
    }

    return { baseName: name, options: [] };
  };

  // Couleur d'un badge d'option selon le contenu
  const optionBadgeClass = (opt = '') => {
    const o = opt.toLowerCase();
    if (o.includes('2fa') || o.includes('backup')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (o.includes('app password') || o.includes('app pass')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (o.includes('mix ip') || o.includes(' ip')) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (o.includes('random') || o.includes('name') || o.includes('gender')) return 'bg-teal-50 text-teal-700 border-teal-200';
    if (o.includes('month') || o.includes('year') || o.includes('day')) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (o.includes('fresh') || o.includes('aged')) return 'bg-green-50 text-green-700 border-green-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  // Télécharge les credentials d'une commande en .txt
  const downloadCredentials = (order) => {
    const raw = order.credentials || order.data || '';
    if (!raw.trim()) return;
    const blob = new Blob([raw], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `order-${shortOrderId(order.id)}-credentials.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const hasDelivery = (order) => !!(order.credentials || order.data);

  const statusBadge = (status) => {
    const map = {
      confirmed: { label: t('completed'), cls: 'bg-green-100 text-green-700 border-green-200' },
      cancelled:  { label: t('failed'),    cls: 'bg-red-100 text-red-600 border-red-200' },
      processing: { label: t('processing'), cls: 'bg-blue-100 text-blue-700 border-blue-200' },
      pending:    { label: t('pending'),   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
    };
    const { label, cls } = map[status] || map.pending;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full border ${cls}`}>{label}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-16 font-sans">
      {profile?.is_suspended && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-[2rem] p-6 flex items-start gap-4">
          <ShieldAlert size={24} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">Ton compte est actuellement suspendu.</p>
            <p className="text-xs text-red-600/90 mt-1">Tu ne peux plus effectuer d'achat ni de recharge. Contacte le support pour régulariser ta situation.</p>
          </div>
        </div>
      )}
      {viewOrder && <OrderCredentialsModal order={viewOrder} onClose={() => setViewOrder(null)} lang={lang} />}
      {showTransfer && (
        <TransferCreditsModal
          profile={profile}
          session={session}
          fetchProfile={fetchProfile}
          onClose={() => setShowTransfer(false)}
          lang={lang}
          t={t}
        />
      )}

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('myOrders')}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-gray-900 rounded-[2rem] p-8 relative overflow-hidden flex flex-col justify-between">
          <div className="relative z-10 mb-8">
            <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">{t('currentBalance')}</div>
            <div className="text-5xl font-black font-price text-white">${profile?.balance?.toFixed(2) || "0.00"}</div>
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('recharge')} className="flex-1 bg-primary text-white dark:text-gray-900 py-4 rounded-2xl font-bold text-sm hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
              <Plus size={18} /> {t('topUpBtn')}
            </button>
            <button onClick={() => setShowTransfer(true)} className="flex-1 bg-white/10 border border-white/20 text-white py-4 rounded-2xl font-bold text-sm hover:bg-white/20 transition-all flex items-center justify-center gap-2">
              <Send size={16} /> {t('transferBtn')}
            </button>
          </div>
          <Wallet size={180} className="absolute -bottom-10 -right-10 text-white/5 pointer-events-none" />
        </div>
        
        <div className="bg-primary/10 border border-primary/20 rounded-[2rem] p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm z-10">
            <TrendingUp size={24} className="text-primary" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2 z-10">Statut Compte</h3>
          <p className="text-sm text-gray-600 z-10 leading-relaxed">Votre compte est actif et prêt pour vos commandes.</p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[3rem] p-8 md:p-10 shadow-soft">
        {/* Barre d'options */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sendEmailAll}
              onChange={e => handleEmailToggle(e.target.checked)}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span>{t('emailDeliveryOptIn')}</span>
          </label>
          <button
            onClick={() => navigate('dashboard')}
            className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
          >
            {t('viewTransactions')} <ChevronRight size={14} />
          </button>
        </div>

        {loading ? (
          <div className="py-4"><SkeletonRows rows={5} cols={6} /></div>
        ) : purchaseOrders.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[2rem] border border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">{t('noOrders')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                  <th className="pb-5 pr-4 whitespace-nowrap">{t('orderCode')}</th>
                  <th className="pb-5 pr-4">{t('productsBought')}</th>
                  <th className="pb-5 pr-4">{t('status')}</th>
                  <th className="pb-5 pr-4 text-right whitespace-nowrap">{t('total')}</th>
                  <th className="pb-5 pr-4 whitespace-nowrap">Date</th>
                  <th className="pb-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {purchaseOrders.map(order => {
                  const { baseName, options } = parseProductOptions(order.product_name);
                  const canDownload = hasDelivery(order);
                  return (
                    <tr key={order.id} className="group hover:bg-gray-50/50 transition-colors">
                      {/* Code de commande */}
                      <td className="py-5 pr-4">
                        <span className="font-black text-gray-900 text-base font-mono tracking-widest">#{shortOrderId(order.id)}</span>
                      </td>

                      {/* Produits + options */}
                      <td className="py-5 pr-4 max-w-xs">
                        <div className="font-bold text-gray-900 text-sm leading-snug mb-1.5">
                          {cleanProductName(baseName || order.product_name, lang)}
                          <span className="text-gray-400 font-medium ml-1">x{order.quantity}</span>
                        </div>
                        {options.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {options.map((opt, i) => (
                              <span
                                key={i}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${optionBadgeClass(opt)}`}
                              >
                                {opt.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-5 pr-4">{statusBadge(order.status)}</td>

                      {/* Total */}
                      <td className="py-5 pr-4 text-right font-black text-gray-900 whitespace-nowrap">
                        ${order.total_price?.toFixed(2)}
                      </td>

                      {/* Date */}
                      <td className="py-5 pr-4 text-sm text-gray-400 whitespace-nowrap">
                        {new Date(order.created_at).toLocaleDateString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                      </td>

                      {/* Actions */}
                      <td className="py-5">
                        {order.product_id === 999 ? (
                          order.status === 'pending' && order.payment_method === 'binance_pay' ? (
                            new Date(order.expires_at || 0).getTime() > Date.now() ? (
                              <button onClick={() => onResume && onResume(order)} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter hover:bg-primary/20 transition-all">
                                <RefreshCcw size={14} /> Continuer
                              </button>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-tighter text-gray-400">Expiré</span>
                            )
                          ) : null
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setViewOrder(order)}
                              title={t('view')}
                              className="w-9 h-9 rounded-xl flex items-center justify-center border border-gray-200 text-gray-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
                            >
                              <Eye size={15} />
                            </button>
                            <button
                              onClick={() => canDownload && downloadCredentials(order)}
                              disabled={!canDownload}
                              title={canDownload ? t('download') : ""}
                              className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                                canDownload
                                  ? 'border-primary/30 text-primary bg-primary/5 hover:bg-primary hover:text-white dark:text-gray-900 cursor-pointer'
                                  : 'border-gray-100 text-gray-300 cursor-not-allowed'
                              }`}
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Note livraison en cours */}
        {purchaseOrders.some(o => o.status === 'processing') && (
          <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 font-medium">
            <RefreshCcw size={12} className="animate-spin text-primary" />
            Certains articles sont encore en cours de livraison — actualisation automatique…
          </div>
        )}
      </div>
    </div>
  );
};

// Page Paramètres dédiée (accessible via le menu déroulant du profil, plus
// via un onglet noyé dans un dashboard).
const SettingsView = ({ profile, navigate, fetchProfile, session, lang, t }) => {
  if (!session) { navigate('auth'); return null; }
  
  return (
  <div className="max-w-3xl mx-auto px-6 py-16 font-sans">
    <div className="flex items-center gap-4 mb-10">
      <button onClick={() => navigate('dashboard')} className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all border border-gray-100"><ArrowLeft size={18} /></button>
      <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('settings')}</h1>
    </div>
    <SettingsTab profile={profile} session={session} onUpdate={() => fetchProfile && session && fetchProfile(session.user.id)} lang={lang} t={t} />
  </div>
  );
};

// ==========================================
// ORDERS ADMIN — Composant gestion commandes
// ==========================================

// Commandes — vue lecture seule. Depuis l'automatisation des paiements
// (NOWPayments/Cryptomus pour les recharges, YTSeller pour la livraison
// dropship), plus aucune validation manuelle n'est nécessaire : tout se
// confirme et se livre tout seul via les webhooks. Cet écran sert juste à
// suivre l'état des commandes, avec une action d'annulation pour les cas
// bloqués et une suppression pour le nettoyage de test.
const OrdersAdmin = ({ allOrders, fetchAllOrders, lang = 'fr', loading = false }) => {
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelPromptOrder, setCancelPromptOrder] = useState(null);

  // Cet écran ne montre que les commandes d'achat réelles. Les recharges de
  // solde (product_id 999) sont consultables par client dans "Client Management".
  const purchaseOrders = allOrders.filter(o => o.product_id !== 999);

  const filtered = filter === 'all'
    ? purchaseOrders
    : purchaseOrders.filter(o => (o.status || 'pending') === filter);

  const cancelOrder = (order) => {
    setCancelPromptOrder(order);
  };

  const executeCancelOrder = async (id, refund = false) => {
    const { data: order, error: orderErr } = await supabase
      .from('orders').select('id, user_id, status, total_price').eq('id', id).single();
    if (orderErr || !order) { alert("Commande introuvable."); return; }
    if (order.status === 'cancelled') { fetchAllOrders(); return; }

    if (refund) {
      const { data: profile, error: profileErr } = await supabase
        .from('profiles').select('balance').eq('id', order.user_id).single();
      if (profileErr || !profile) { alert("Profil client introuvable, remboursement impossible."); return; }

      const { error: creditErr } = await supabase
        .from('profiles').update({ balance: (profile.balance || 0) + (order.total_price || 0) }).eq('id', order.user_id);
      if (creditErr) { alert("Erreur lors du remboursement : " + creditErr.message); return; }

      const updatePayload = { status: 'cancelled', is_refunded: true };
      const { error: updateErr } = await supabase.from('orders').update(updatePayload).eq('id', id);
      if (updateErr) {
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
      }
    } else {
      const updatePayload = { status: 'cancelled', is_refunded: false };
      const { error: updateErr } = await supabase.from('orders').update(updatePayload).eq('id', id);
      if (updateErr) {
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
      }
    }
    fetchAllOrders();
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Supprimer définitivement cette commande ?")) return;
    await supabase.from('orders').delete().eq('id', id);
    fetchAllOrders();
  };

  const statusBadge = (status) => {
    const s = status || 'pending';
    const map = {
      pending: { label: 'En attente', icon: Clock, cls: 'bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900/30' },
      processing: { label: 'En cours', icon: RefreshCcw, cls: 'bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/30' },
      confirmed: { label: 'Payé / livré', icon: CheckCircle, cls: 'bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30' },
      cancelled: { label: 'Annulé', icon: X, cls: 'bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/30' },
    };
    const { label, icon: Icon, cls } = map[s] || map.pending;
    return <span className={`text-xs font-bold px-3 py-1 rounded-full border flex items-center gap-1 w-fit ${cls}`}><Icon size={12} /> {label}</span>;
  };

  const isRecharge = (order) => order.product_id === 999;

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-soft space-y-8 text-gray-900 dark:text-white">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Commandes</h2>
          <p className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-1">Suivi uniquement — le paiement et la livraison se font automatiquement.</p>
        </div>
        <button onClick={fetchAllOrders} className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 text-gray-400 dark:text-slate-500 hover:text-primary transition-all">
          <RefreshCcw size={16} />
        </button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'pending', label: 'En attente', icon: Clock },
          { key: 'processing', label: 'En cours', icon: RefreshCcw },
          { key: 'confirmed', label: 'Payées / livrées', icon: CheckCircle },
          { key: 'cancelled', label: 'Annulées', icon: X },
          { key: 'all', label: 'Toutes', icon: FileText },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              filter === f.key
                ? 'bg-gray-900 dark:bg-primary text-white dark:text-gray-900'
                : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-100 dark:border-slate-800'
            }`}>
            <f.icon size={14} /> {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-4"><SkeletonRows rows={6} cols={6} /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 dark:bg-slate-800/40 rounded-[2rem] border border-dashed border-gray-200 dark:border-slate-800">
          <p className="text-gray-400 dark:text-slate-500 font-bold">Aucune commande</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                <th className="pb-4">Produit / ID</th>
                <th className="pb-4">Email</th>
                <th className="pb-4">Montant</th>
                <th className="pb-4">Statut</th>
                <th className="pb-4">Date</th>
                <th className="pb-4" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
              {filtered.map(order => (
                <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/20 transition-colors">
                  <td className="py-5">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{cleanProductName(order.product_name, lang)}</p>
                    <p className="text-gray-400 dark:text-slate-500 text-[10px] font-mono">#{String(order.id).slice(0, 8).toUpperCase()}</p>
                  </td>
                  <td className="py-5 text-sm text-gray-600 dark:text-slate-300">{order.buyer_email || '—'}</td>
                  <td className="py-5 font-mono">
                    <div className="font-bold text-gray-900 dark:text-white">
                      ${order.total_price?.toFixed(2)}
                    </div>
                    {order.status === 'cancelled' && order.is_refunded !== false && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                        <span>↩</span>
                        <span>${order.total_price?.toFixed(2)}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-5">{statusBadge(order.status)}</td>
                  <td className="py-5 text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-5">
                    <div className="flex gap-2">
                      {!isRecharge(order) && order.status === 'confirmed' && (
                        <button onClick={() => setSelectedOrder(order)}
                          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all" title="Voir les accès livrés" aria-label="Voir les accès livrés">
                          <Eye size={14} />
                        </button>
                      )}
                      {order.status !== 'cancelled' && (
                        <button onClick={() => cancelOrder(order)}
                          className="p-2 rounded-lg bg-red-50 dark:bg-red-950/10 text-red-500 hover:bg-red-150 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/20"
                          title="Annuler / Rembourser la commande"
                          aria-label="Annuler la commande"
                        >
                          <X size={14} />
                        </button>
                      )}
                      <button onClick={() => deleteOrder(order.id)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-red-100 hover:text-red-500 transition-all" title="Supprimer définitivement" aria-label="Supprimer la commande">
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] shadow-2xl p-10 space-y-8 text-gray-900 dark:text-white animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Détail de la commande</h3>
                <p className="text-xs text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">ID: #{String(selectedOrder.id).toUpperCase()}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} aria-label="Close" className="w-12 h-12 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all">
                <X size={20} />
              </button>
            </div>

            <div className="bg-gray-50/50 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800 rounded-3xl p-8 space-y-4">
              {[
                ['Produit', cleanProductName(selectedOrder.product_name, lang), Package],
                ['Email Client', selectedOrder.buyer_email || '—', Mail],
                ['Montant', `$${selectedOrder.total_price?.toFixed(2)}`, Wallet],
                ['Date', new Date(selectedOrder.created_at).toLocaleString(), Clock],
              ].map(([label, val, Icon]) => (
                <div key={label} className="flex justify-between items-center group">
                  <span className="text-gray-400 dark:text-slate-400 font-medium text-xs flex items-center gap-2">
                    <Icon size={14} className="text-gray-300 dark:text-slate-650 group-hover:text-primary transition-colors" /> {label}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white text-sm">{val}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Contenu livré au client</label>
              <div className="bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-3xl p-1 shadow-inner">
                <div
                  className="font-mono text-xs text-gray-600 dark:text-slate-300 p-6 leading-relaxed whitespace-pre-wrap break-all max-h-[400px] overflow-y-auto custom-scrollbar"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      const creds = selectedOrder.credentials || selectedOrder.data || "Identifiants introuvables.";
                      return creds.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '<span class="bg-primary/10 text-primary font-black px-1.5 py-0.5 rounded-md">$1</span>');
                    })()
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'annulation et choix de remboursement */}
      {cancelPromptOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 text-gray-900 dark:text-white">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelPromptOrder(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                <RotateCcw size={24} />
              </div>
              <h3 className="text-xl font-bold">Annuler la commande</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                Commande #{String(cancelPromptOrder.id).slice(0, 8).toUpperCase()} — ${cancelPromptOrder.total_price?.toFixed(2)}
              </p>
            </div>

            <p className="text-sm text-center text-gray-600 dark:text-slate-300">
              Comment souhaitez-vous traiter l'annulation de cette commande ?
            </p>

            <div className="flex flex-col gap-3 pt-2">
              <button
                onClick={async () => {
                  const orderId = cancelPromptOrder.id;
                  setCancelPromptOrder(null);
                  await executeCancelOrder(orderId, true); // Cancel and Refund
                }}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-lg shadow-emerald-600/10 transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw size={16} />
                Annuler et rembourser
              </button>

              <button
                onClick={async () => {
                  const orderId = cancelPromptOrder.id;
                  setCancelPromptOrder(null);
                  await executeCancelOrder(orderId, false); // Cancel only
                }}
                className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-sm font-bold border border-slate-700 dark:border-slate-800 transition-all"
              >
                Annuler uniquement (sans remboursement)
              </button>

              <button
                onClick={() => setCancelPromptOrder(null)}
                className="w-full py-4 bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-350 rounded-2xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                Ne rien faire (fermer)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ==========================================
// ==========================================
// SUPPLIER ADMIN — Reseller YTSeller (mapping, solde, commandes, logs)
// ==========================================
const SUPPLIERS = ['ytseller', 'smmshiba'];
const SUPPLIER_LABEL = { ytseller: 'YTSeller', smmshiba: 'SMMSHIBA' };

const SupplierAdmin = ({ products, fetchProducts }) => {
  const [settingsBySupplier, setSettingsBySupplier] = useState({});
  const [mappings, setMappings] = useState([]);
  const [pending, setPending] = useState([]);
  const [logs, setLogs] = useState([]);
  const [syncing, setSyncing] = useState(null); // nom du fournisseur en cours de sync
  const [msg, setMsg] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ supplier_product_id: '', margin_percent: 30, active: true });
  const [newMap, setNewMap] = useState({ product_id: '', supplier: 'ytseller', supplier_product_id: '', margin_percent: 30 });
  const [marginInput, setMarginInput] = useState('');
  const [busyRetryId, setBusyRetryId] = useState(null);

  const productName = (id) => products.find(p => p.id === id)?.name || `#${id}`;

  const fetchAll = async () => {
    if (!supabase) return;
    const [s, m, o, l] = await Promise.all([
      supabase.from('supplier_settings').select('*').in('supplier', SUPPLIERS),
      supabase.from('product_supplier_mapping').select('*').order('created_at', { ascending: false }),
      supabase.from('orders').select('id, product_name, quantity, total_price, supplier, supplier_order_id, supplier_status, supplier_last_checked_at, created_at')
        .eq('status', 'processing').in('supplier', SUPPLIERS).order('created_at', { ascending: false }),
      supabase.from('supplier_logs').select('*').order('created_at', { ascending: false }).limit(25),
    ]);
    const bySupplier = {};
    (s.data || []).forEach(row => { bySupplier[row.supplier] = row; });
    setSettingsBySupplier(bySupplier);
    setMarginInput(m.data?.[0]?.margin_percent ?? 50);
    setMappings(m.data || []);
    setPending(o.data || []);
    setLogs(l.data || []);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSync = async (supplier) => {
    setSyncing(supplier); setMsg('');
    try {
      const { data, error } = await supabase.functions.invoke(`${supplier}-sync-catalog`, { body: {} });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      const extra = data.merged != null ? `, ${data.merged} fusionné(s)` : '';
      setMsg(`${SUPPLIER_LABEL[supplier]} : ${data.created} créé(s)${extra}, ${data.updated} maj — solde ${data.balance} ${data.currency}.`);
      await fetchAll();
      if (fetchProducts) await fetchProducts();
    } catch (e) {
      setMsg(`Erreur sync ${SUPPLIER_LABEL[supplier]} : ` + e.message);
    }
    setSyncing(null);
  };

  const handleRetryDropship = async (orderId) => {
    setBusyRetryId(orderId);
    setMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('dropship-place-order', {
        body: { orderId }
      });
      if (error || data?.error) {
        setMsg('Erreur relance : ' + (data?.error || error?.message));
      } else {
        setMsg(`Commande relancée avec succès ! (ID fournisseur : ${data.supplier_order_id || 'transmis'})`);
        await fetchAll();
      }
    } catch (e) {
      setMsg('Erreur relance : ' + e.message);
    } finally {
      setBusyRetryId(null);
    }
  };

  const handleFullImport = async () => {
    if (!confirm('IMPORT COMPLET YTSELLER : cela va importer tout le catalogue, supprimer les produits à stock local et vider account_stock. Continuer ?')) return;
    setSyncing('ytseller'); setMsg('');
    try {
      const { data, error } = await supabase.functions.invoke('ytseller-sync-catalog', { body: { full: true } });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setMsg(`Import complet OK — ${data.created} créé(s), ${data.updated} maj, ${data.wiped} legacy supprimé(s). Solde ${data.balance} ${data.currency}.`);
      await fetchAll();
      if (fetchProducts) await fetchProducts();
    } catch (e) {
      setMsg('Erreur import : ' + e.message);
    }
    setSyncing(null);
  };

  const handleSaveMargin = async () => {
    const v = Number(marginInput);
    if (isNaN(v) || v < 0) { setMsg('Marge invalide.'); return; }
    const { error } = await supabase.from('product_supplier_mapping').update({ margin_percent: v }).in('supplier', SUPPLIERS);
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setMsg('Marge appliquée à tous les produits (tous fournisseurs). Synchro en cours…');
    for (const s of SUPPLIERS) await handleSync(s);
  };

  const startEdit = (m) => {
    setEditing(m.id);
    setEditForm({ supplier_product_id: m.supplier_product_id, margin_percent: m.margin_percent, active: m.active });
  };

  const saveEdit = async (id) => {
    const { error } = await supabase.from('product_supplier_mapping').update({
      supplier_product_id: String(editForm.supplier_product_id).trim(),
      margin_percent: Number(editForm.margin_percent) || 0,
      active: !!editForm.active,
    }).eq('id', id);
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setEditing(null);
    await fetchAll();
  };

  const handleAdd = async () => {
    if (!newMap.product_id || !String(newMap.supplier_product_id).trim()) {
      setMsg('Choisis un produit et renseigne l’ID fournisseur.'); return;
    }
    const { error } = await supabase.from('product_supplier_mapping').insert({
      product_id: Number(newMap.product_id),
      supplier: newMap.supplier,
      supplier_product_id: String(newMap.supplier_product_id).trim(),
      margin_percent: Number(newMap.margin_percent) || 0,
      active: true,
    });
    if (error) { setMsg('Erreur : ' + error.message); return; }
    setNewMap({ product_id: '', supplier: 'ytseller', supplier_product_id: '', margin_percent: 30 });
    await handleSync(newMap.supplier); // renseigne rate/stock/prix immédiatement
  };

  const handleDelete = async (m) => {
    if (!confirm(`Retirer le mapping ${SUPPLIER_LABEL[m.supplier] || m.supplier} de "${productName(m.product_id)}" ?`)) return;
    await supabase.from('product_supplier_mapping').delete().eq('id', m.id);
    // Si c'était le seul mapping du produit, il repasse en stock local.
    const { count } = await supabase.from('product_supplier_mapping').select('id', { count: 'exact', head: true }).eq('product_id', m.product_id);
    if (!count) await supabase.from('products').update({ is_dropship: false, supplier_stock: 0 }).eq('id', m.product_id);
    await fetchAll();
    if (fetchProducts) await fetchProducts();
  };

  const sellPrice = (m) => Math.round((Number(m.supplier_rate) || 0) * (1 + (Number(m.margin_percent) || 0) / 100) * 100) / 100;
  const unmappedProducts = products.filter(p => !mappings.some(m => m.product_id === p.id));

  return (
    <div className="space-y-8">
      {/* Soldes + synchro par fournisseur */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SUPPLIERS.map(supplier => {
          const settings = settingsBySupplier[supplier];
          return (
            <div key={supplier} className="bg-white border border-gray-100 rounded-[3rem] p-8 shadow-soft">
              <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{SUPPLIER_LABEL[supplier]} Balance</div>
              <div className="text-3xl font-black font-mono text-gray-900 mb-1">
                {settings ? `${Number(settings.balance).toFixed(2)} ${settings.currency}` : '—'}
              </div>
              <div className="text-xs text-gray-400 mb-6">
                {settings?.last_catalog_sync ? `Last sync: ${new Date(settings.last_catalog_sync).toLocaleString()}` : 'Never synced'}
              </div>
              {settings && Number(settings.balance) <= 0 && (
                <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 rounded-xl px-4 py-2 flex items-center gap-2">
                  <AlertTriangle size={14} /> Balance is 0 — top up to deliver via this supplier.
                </div>
              )}
              <div className="flex gap-3 flex-wrap">
                <button onClick={() => handleSync(supplier)} disabled={syncing === supplier}
                  className="h-11 px-5 rounded-xl bg-gray-900 text-white dark:text-gray-900 font-bold text-sm flex items-center gap-2 hover:bg-primary transition-all disabled:opacity-50">
                  <RefreshCcw size={14} className={syncing === supplier ? 'animate-spin' : ''} /> {syncing === supplier ? 'Syncing…' : 'Sync'}
                </button>
                {supplier === 'ytseller' && (
                  <button onClick={handleFullImport} disabled={!!syncing}
                    className="h-11 px-5 rounded-xl bg-primary text-white dark:text-gray-900 font-bold text-sm flex items-center gap-2 hover:bg-primaryDark transition-all disabled:opacity-50">
                    <Download size={14} /> Full import (reset)
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {msg && <div className="text-sm font-bold text-gray-600 bg-white border border-gray-100 rounded-2xl px-5 py-3">{msg}</div>}

      {/* Marge globale */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Global margin % (tous fournisseurs)</label>
        <div className="flex gap-2">
          <input type="number" value={marginInput} onChange={e => setMarginInput(e.target.value)} className="w-24 h-12 px-4 rounded-xl border border-gray-200 font-mono" />
          <button onClick={handleSaveMargin} className="h-12 px-4 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200"><Save size={16} /></button>
        </div>
      </div>

      {/* Mapping produits */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8">Product mapping</h2>
        <p className="text-xs text-gray-400 -mt-6 mb-8">Un produit peut avoir un mapping par fournisseur ; celui marqué "Active" (le moins cher, en stock) fixe le prix/stock affichés en boutique.</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">My product</th><th className="pb-4">Supplier</th><th className="pb-4">Supplier ID</th><th className="pb-4">Cost</th>
                <th className="pb-4">Margin %</th><th className="pb-4">Sell price</th><th className="pb-4">Avail</th>
                <th className="pb-4">Active</th><th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {mappings.map(m => (
                <tr key={m.id} className="text-gray-700">
                  <td className="py-4 font-bold">{productName(m.product_id)}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs">{SUPPLIER_LABEL[m.supplier] || m.supplier}</span></td>
                  {editing === m.id ? (
                    <>
                      <td className="py-4"><input value={editForm.supplier_product_id} onChange={e => setEditForm({ ...editForm, supplier_product_id: e.target.value })} className="w-24 px-2 py-1 rounded-lg border border-gray-200 font-mono" /></td>
                      <td className="py-4 font-mono">${Number(m.supplier_rate).toFixed(2)}</td>
                      <td className="py-4"><input type="number" value={editForm.margin_percent} onChange={e => setEditForm({ ...editForm, margin_percent: e.target.value })} className="w-20 px-2 py-1 rounded-lg border border-gray-200 font-mono" /></td>
                      <td className="py-4 font-mono text-gray-400">—</td>
                      <td className="py-4">{m.supplier_available}</td>
                      <td className="py-4"><input type="checkbox" checked={editForm.active} onChange={e => setEditForm({ ...editForm, active: e.target.checked })} /></td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => saveEdit(m.id)} className="p-2 rounded-lg bg-green-500 text-white"><Save size={14} /></button>
                        <button onClick={() => setEditing(null)} aria-label="Cancel edit" className="p-2 rounded-lg bg-gray-100 text-gray-500"><X size={14} /></button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-4 font-mono">{m.supplier_product_id}</td>
                      <td className="py-4 font-mono">${Number(m.supplier_rate).toFixed(2)}</td>
                      <td className="py-4 font-mono">{Number(m.margin_percent).toFixed(0)}%</td>
                      <td className="py-4 font-mono font-bold text-gray-900">${sellPrice(m).toFixed(2)}</td>
                      <td className="py-4">
                        <span className={m.supplier_available > 0 ? 'text-green-600 font-bold' : 'text-red-500 font-bold'}>{m.supplier_available}</span>
                        <span className="text-[10px] text-gray-400 ml-1">{m.supplier_status || ''}</span>
                      </td>
                      <td className="py-4">{m.active ? <span className="text-green-600 font-bold">Yes</span> : <span className="text-gray-400">No</span>}</td>
                      <td className="py-4 flex gap-2">
                        <button onClick={() => startEdit(m)} className="p-2 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200"><Edit size={14} /></button>
                        <button onClick={() => handleDelete(m)} className="p-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100"><Trash size={14} /></button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {mappings.length === 0 && <tr><td colSpan={9} className="py-8 text-center text-gray-400">No mapped product.</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Ajout mapping */}
        <div className="mt-8 pt-8 border-t border-gray-100 flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Product</label>
            <select value={newMap.product_id} onChange={e => setNewMap({ ...newMap, product_id: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 font-bold min-w-[220px]">
              <option value="">— Choose —</option>
              {unmappedProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supplier</label>
            <select value={newMap.supplier} onChange={e => setNewMap({ ...newMap, supplier: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 font-bold">
              {SUPPLIERS.map(s => <option key={s} value={s}>{SUPPLIER_LABEL[s]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Supplier ID</label>
            <input value={newMap.supplier_product_id} onChange={e => setNewMap({ ...newMap, supplier_product_id: e.target.value })} placeholder="ex: 11" className="px-4 py-3 rounded-xl border border-gray-200 font-mono w-28" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Margin %</label>
            <input type="number" value={newMap.margin_percent} onChange={e => setNewMap({ ...newMap, margin_percent: e.target.value })} className="px-4 py-3 rounded-xl border border-gray-200 font-mono w-24" />
          </div>
          <button onClick={handleAdd} className="h-12 px-6 rounded-xl bg-primary text-white dark:text-gray-900 font-bold text-sm flex items-center gap-2"><Plus size={16} /> Map</button>
        </div>
      </div>

      {/* Commandes en attente fournisseur */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <h2 className="text-2xl font-bold mb-8">Pending supplier orders ({pending.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="pb-4">Order</th><th className="pb-4">Product</th><th className="pb-4">Supplier</th><th className="pb-4">Qty</th>
                <th className="pb-4">Supplier #</th><th className="pb-4">Status</th><th className="pb-4">Last check</th><th className="pb-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pending.map(o => (
                <tr key={o.id} className="text-gray-700">
                  <td className="py-4 font-mono">#{o.id}</td>
                  <td className="py-4 font-bold">{cleanProductName(o.product_name, lang)}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded-lg bg-gray-100 text-gray-600 font-bold text-xs">{SUPPLIER_LABEL[o.supplier] || o.supplier}</span></td>
                  <td className="py-4">{o.quantity}</td>
                  <td className="py-4 font-mono">{o.supplier_order_id || '—'}</td>
                  <td className="py-4"><span className="px-2 py-1 rounded-lg bg-yellow-50 text-yellow-700 font-bold text-xs">{o.supplier_status || 'Pending'}</span></td>
                  <td className="py-4 text-xs text-gray-400">{o.supplier_last_checked_at ? new Date(o.supplier_last_checked_at).toLocaleString() : '—'}</td>
                  <td className="py-4">
                    {!o.supplier_order_id && (
                      <button
                        onClick={() => handleRetryDropship(o.id)}
                        disabled={busyRetryId === o.id}
                        className="px-3 py-1.5 rounded-lg bg-primary text-white dark:text-gray-900 font-bold text-xs hover:bg-primaryDark transition-all disabled:opacity-50"
                      >
                        {busyRetryId === o.id ? 'Relance...' : 'Relancer'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {pending.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">No pending order.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Supplier log</h2>
          <button onClick={fetchAll} className="text-sm font-bold text-primary hover:underline flex items-center gap-2"><RefreshCcw size={14} /> Refresh</button>
        </div>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.map(l => (
            <div key={l.id} className={`text-xs rounded-xl px-4 py-3 flex items-start gap-3 ${l.level === 'error' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-600'}`}>
              <span className="font-mono text-gray-400 shrink-0">{new Date(l.created_at).toLocaleTimeString()}</span>
              <span className="font-bold shrink-0 uppercase tracking-wide">{SUPPLIER_LABEL[l.supplier] || l.supplier}</span>
              <span className="font-bold shrink-0 uppercase tracking-wide">{l.action}</span>
              <span>{l.message}{l.order_id ? ` (cmd #${l.order_id})` : ''}</span>
            </div>
          ))}
          {logs.length === 0 && <div className="py-8 text-center text-gray-400 text-sm">No log.</div>}
        </div>
      </div>
    </div>
  );
};

// SOURCE UNIQUE DE VÉRITÉ pour le coût fournisseur d'une commande — utilisée
// à la fois par la carte "Bénéfice Net" et par le graphique, pour qu'ils ne
// puissent jamais afficher deux chiffres différents (bug précédent : le
// graphique ne recevait pas `mappings` et retombait sur une estimation
// arbitraire, d'où un bénéfice net incohérent avec la carte).
// Ordre de priorité : coût réel figé sur la commande (supplier_cost, si la
// colonne existe) → tarif du mapping fournisseur actuel → 0. Plus d'invention
// de coût à 70 % : une commande dropship sans mapping ni coût enregistré est
// comptée à coût 0 (bénéfice = prix) plutôt qu'avec un chiffre fabriqué.
const orderSupplierCost = (order, mappings = []) => {
  if (order.supplier_cost != null) return Number(order.supplier_cost) || 0;
  const map = mappings.find(m => m.product_id === order.product_id && (order.supplier ? m.supplier === order.supplier : m.active));
  if (map) return (Number(map.supplier_rate) || 0) * (order.quantity || 1);
  return 0;
};

// Bénéfice net sur une liste de commandes confirmées (hors recharges 999).
const netProfitOf = (ordersList, mappings = []) => {
  const purchases = ordersList.filter(o => o.product_id !== 999);
  const revenue = purchases.reduce((s, o) => s + (o.total_price || 0), 0);
  const cost = purchases.reduce((s, o) => s + orderSupplierCost(o, mappings), 0);
  return revenue - cost;
};

// Courbe de revenu par jour (7 ou 30 derniers jours), sous forme de ligne SVG avec dégradé.
// Graphique de statistiques interactif inspiré de YouTube Studio Analytics (Revenu estimé vs Clients inscrits).
const RevenueChart = ({ confirmedOrders, allUsers = [], mappings = [], lang = 'fr' }) => {
  const [range, setRange] = useState(7);
  const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue' | 'users'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const calculateNetProfit = (ordersList) => netProfitOf(ordersList, mappings);

  const getChartData = () => {
    if (range === 7 || range === 30) {
      // Daily grouping
      const days = [...Array(range)].map((_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (range - 1 - i));
        return d;
      });

      return days.map((day, index) => {
        const next = new Date(day); next.setDate(next.getDate() + 1);
        const dayOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= day && t < next; });

        const netProfit = calculateNetProfit(dayOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= day && t < next; })
          .length;

        return {
          date: day,
          label: day.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { day: '2-digit', month: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    } else if (range === 365) {
      // Monthly grouping (last 12 months)
      const months = [...Array(12)].map((_, i) => {
        const d = new Date();
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        d.setMonth(d.getMonth() - (11 - i));
        return d;
      });

      return months.map((monthStart, index) => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= monthStart && t < monthEnd; });

        const netProfit = calculateNetProfit(monthOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= monthStart && t < monthEnd; })
          .length;

        return {
          date: monthStart,
          label: monthStart.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    } else {
      // Lifetime grouping (Monthly from oldest to now)
      const oldestOrderTime = confirmedOrders.length > 0
        ? Math.min(...confirmedOrders.map(o => new Date(o.created_at).getTime()))
        : Date.now();
      const oldestUserTime = allUsers.length > 0
        ? Math.min(...allUsers.map(u => new Date(u.created_at).getTime()))
        : Date.now();

      const oldestTime = Math.min(oldestOrderTime, oldestUserTime, Date.now());
      const start = new Date(oldestTime);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      const current = new Date();
      const diffMonths = (current.getFullYear() - start.getFullYear()) * 12 + (current.getMonth() - start.getMonth()) + 1;
      const numMonths = Math.max(diffMonths, 6); // at least 6 months

      const months = [...Array(numMonths)].map((_, i) => {
        const d = new Date(start);
        d.setMonth(d.getMonth() + i);
        return d;
      });

      return months.map((monthStart, index) => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = confirmedOrders
          .filter(o => { const t = new Date(o.created_at); return t >= monthStart && t < monthEnd; });

        const netProfit = calculateNetProfit(monthOrders);

        const users = allUsers
          .filter(u => { const t = new Date(u.created_at); return t >= monthStart && t < monthEnd; })
          .length;

        return {
          date: monthStart,
          label: monthStart.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', { month: 'short', year: '2-digit' }),
          revenue: netProfit,
          users,
          index
        };
      });
    }
  };

  const dataPoints = getChartData();

  // Totaux cumulés sur la période sélectionnée (pour l'en-tête des onglets)
  const rangeRevenue = dataPoints.reduce((s, p) => s + p.revenue, 0);
  const rangeUsers = dataPoints.reduce((s, p) => s + p.users, 0);

  // Données actives pour le tracé du graphique
  const activeTotals = dataPoints.map(p => activeMetric === 'revenue' ? p.revenue : p.users);
  const max = Math.max(...activeTotals, 1);

  // Configuration SVG
  const width = 600;
  const height = 160;
  const paddingX = 25;
  const paddingY = 25;

  const points = dataPoints.map((p, i) => {
    const val = activeMetric === 'revenue' ? p.revenue : p.users;
    const x = paddingX + (i / (dataPoints.length - 1)) * (width - 2 * paddingX);
    const y = height - paddingY - (val / max) * (height - 2 * paddingY);
    return { x, y, amount: val, date: p.date, label: p.label, index: i };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${height - 5} L ${points[0].x} ${height - 5} Z`
    : '';

  const rangeOptions = [
    { value: 7, label: lang === 'fr' ? '7 jours' : '7 days' },
    { value: 30, label: lang === 'fr' ? '30 jours' : '30 days' },
    { value: 365, label: lang === 'fr' ? '1 an' : '1 year' },
    { value: 'lifetime', label: lang === 'fr' ? 'À vie' : 'Lifetime' }
  ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative space-y-6">
      {/* Sélecteurs de Période */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-gray-500 dark:text-slate-500 uppercase tracking-widest">
            {lang === 'fr' ? 'Performances générales' : 'General metrics'}
          </h3>
        </div>
        <div className="flex gap-2">
          {rangeOptions.map(opt => (
            <button key={opt.value} onClick={() => { setRange(opt.value); setHoveredPoint(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${range === opt.value ? 'bg-primary text-white dark:text-gray-900' : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-800'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Onglets style YouTube Studio */}
      <div className="grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-slate-800 pb-2">
        {/* Onglet Revenu Estimé */}
        <button
          onClick={() => { setActiveMetric('revenue'); setHoveredPoint(null); }}
          className={`text-left p-4 rounded-2xl transition-all relative border flex flex-col justify-between ${
            activeMetric === 'revenue'
              ? 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white'
              : 'bg-transparent border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-400">
            {lang === 'fr' ? 'Bénéfice Net' : 'Net Profit'}
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-gray-900 dark:text-white">${rangeRevenue.toFixed(2)}</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
            {lang === 'fr' ? `Total sur ${rangeOptions.find(o => o.value === range)?.label.toLowerCase()}` : `Total for ${rangeOptions.find(o => o.value === range)?.label.toLowerCase()}`}
          </div>
          {activeMetric === 'revenue' && (
            <div className="absolute bottom-[-10px] left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>

        {/* Onglet Clients Inscrits */}
        <button
          onClick={() => { setActiveMetric('users'); setHoveredPoint(null); }}
          className={`text-left p-4 rounded-2xl transition-all relative border flex flex-col justify-between ${
            activeMetric === 'users'
              ? 'bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-700/80 text-gray-900 dark:text-white'
              : 'bg-transparent border-transparent text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300'
          }`}
        >
          <div className="text-[10px] font-black uppercase tracking-wider text-gray-400 dark:text-slate-400">
            {lang === 'fr' ? 'Clients Inscrits' : 'Registered Clients'}
          </div>
          <div className="text-2xl font-black font-mono mt-1 text-gray-900 dark:text-white">{rangeUsers}</div>
          <div className="text-[10px] text-emerald-500 dark:text-emerald-400 font-semibold mt-1">
            {lang === 'fr' ? `Inscriptions sur la période` : `Registrations in period`}
          </div>
          {activeMetric === 'users' && (
            <div className="absolute bottom-[-10px] left-0 right-0 h-1 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Zone Graphique */}
      <div className="relative h-44 w-full">
        {/* Tooltip flottant */}
        {hoveredPoint && (
          <div
            className="absolute z-20 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 px-3 py-2 rounded-xl shadow-xl text-center pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100 - 45}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <div className="text-[9px] text-gray-500 dark:text-slate-500 font-black uppercase">
              {hoveredPoint.label}
            </div>
            <div className="text-xs font-black text-primary font-mono">
              {activeMetric === 'revenue' ? `$${hoveredPoint.amount.toFixed(2)}` : `${hoveredPoint.amount} client(s)`}
            </div>
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grille horizontale en arrière-plan */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingY + ratio * (height - 2 * paddingY);
            return (
              <line
                key={idx}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                strokeWidth="1"
                strokeDasharray="4 4"
                className="stroke-gray-100 dark:stroke-slate-800"
              />
            );
          })}

          {/* Remplissage dégradé sous la courbe */}
          {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}

          {/* Ligne principale de la courbe */}
          {linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Points sur la courbe */}
          {points.map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={hoveredPoint?.index === i ? "6" : "3.5"}
              fill="#10B981"
              strokeWidth={hoveredPoint?.index === i ? "3" : "2"}
              className="stroke-white dark:stroke-slate-900 transition-all duration-150"
            />
          ))}

          {/* Zones interactives transparentes pour le survol */}
          {points.map((p, i) => (
            <rect
              key={i}
              x={p.x - (width / points.length) / 2}
              y={0}
              width={width / points.length}
              height={height}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(p)}
              onMouseLeave={() => setHoveredPoint(null)}
            />
          ))}
        </svg>
      </div>

      <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase pt-2">
        <span>{points[0]?.label || ''}</span>
        <span>{points[points.length - 1]?.label || ''}</span>
      </div>
    </div>
  );
};

// Recharges Binance Pay en attente : confirmation manuelle (fallback tant
// que l'historique Binance Pay n'est pas interrogeable automatiquement).
const BinancePaymentsAdmin = ({ allOrders, fetchAllOrders }) => {
  const [busyId, setBusyId] = useState(null);
  const [msg, setMsg] = useState('');
  const [codeByUser, setCodeByUser] = useState({});

  const pending = allOrders.filter(o => o.product_id === 999 && o.payment_method === 'binance_pay' && o.status === 'pending');

  useEffect(() => {
    const userIds = [...new Set(pending.map(o => o.user_id))];
    if (userIds.length === 0) return;
    supabase.from('profiles').select('id, display_name').in('id', userIds).then(({ data }) => {
      const map = {};
      (data || []).forEach(p => { map[p.id] = p.display_name; });
      setCodeByUser(map);
    });
  }, [allOrders]);

  const handleConfirm = async (order) => {
    setBusyId(order.id);
    setMsg('');
    const { data, error } = await supabase.functions.invoke('binance-confirm-manual', { body: { orderId: order.id } });
    if (error || data?.error) {
      setMsg('Erreur : ' + (data?.error || error?.message));
    } else {
      setMsg(`Confirmé — $${Number(data.credited).toFixed(2)} crédité(s).`);
      await fetchAllOrders();
    }
    setBusyId(null);
  };

  const handleReject = async (order) => {
    setBusyId(order.id);
    setMsg('');
    const { error } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
    if (error) {
      setMsg('Erreur : ' + error.message);
    } else {
      setMsg(`Paiement de ${order.buyer_email} rejeté (statut annulé).`);
      await fetchAllOrders();
    }
    setBusyId(null);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-[3rem] p-10 shadow-soft">
      <h2 className="text-2xl font-bold mb-2">Binance Pay — confirmations manuelles</h2>
      <p className="text-xs text-gray-400 mb-8">Vérifie sur ton app Binance qu'un paiement du montant exact est bien arrivé avant de confirmer — l'opération crédite immédiatement le solde client.</p>
      {msg && <div className="mb-6 text-sm font-bold text-gray-600 bg-gray-50 rounded-2xl px-5 py-3">{msg}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">
              <th className="pb-4">Client</th><th className="pb-4">Pseudo (note attendue)</th><th className="pb-4">Binance Order ID</th><th className="pb-4">Montant exact</th><th className="pb-4">Crédit</th>
              <th className="pb-4">Créé</th><th className="pb-4">Expire</th><th className="pb-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pending.map(o => {
              const expired = o.expires_at && new Date(o.expires_at).getTime() < Date.now();
              return (
                <tr key={o.id} className="text-gray-700">
                  <td className="py-4 font-bold">{o.buyer_email}</td>
                  <td className="py-4 font-mono font-black text-primary tracking-widest">{codeByUser[o.user_id] || '—'}</td>
                  <td className="py-4 font-mono font-black tracking-widest">{o.binance_tx_id || <span className="text-gray-300 font-normal italic">non soumis</span>}</td>
                  <td className="py-4 font-mono font-black">${Number(o.expected_amount).toFixed(2)}</td>
                  <td className="py-4 font-mono">${Number(o.credit_amount ?? o.total_price).toFixed(2)}</td>
                  <td className="py-4 text-xs text-gray-400">{new Date(o.created_at).toLocaleString()}</td>
                  <td className="py-4 text-xs">{expired ? <span className="text-red-500 font-bold">Expiré</span> : new Date(o.expires_at).toLocaleTimeString()}</td>
                  <td className="py-4 flex gap-2">
                    <button onClick={() => handleConfirm(o)} disabled={busyId === o.id}
                      className="px-4 py-2 rounded-xl bg-primary text-white dark:text-gray-900 font-bold text-xs hover:bg-primaryDark transition-all disabled:opacity-50">
                      {busyId === o.id ? 'Confirmation…' : 'Confirmer'}
                    </button>
                    <button onClick={() => handleReject(o)} disabled={busyId === o.id}
                      className="px-4 py-2 rounded-xl bg-red-100 text-red-700 font-bold text-xs hover:bg-red-200 transition-all disabled:opacity-50">
                      Rejeter
                    </button>
                  </td>
                </tr>
              );
            })}
            {pending.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-gray-400">Aucun paiement Binance Pay en attente.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Carte de métrique compacte pour l'Overview admin — palette figée (pas de
// classes Tailwind construites dynamiquement, elles doivent apparaître en
// clair dans le code pour être incluses au build).
const METRIC_COLORS = {
  green: 'bg-green-50 text-green-600',
  blue: 'bg-blue-50 text-blue-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  gray: 'bg-gray-100 text-gray-500',
  primary: 'bg-primary/10 text-primary',
};
const MetricCard = ({ icon: Icon, color = 'gray', label, value }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-soft">
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${METRIC_COLORS[color] || METRIC_COLORS.gray}`}><Icon size={16} /></div>
    <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</div>
    <div className="text-2xl font-black text-gray-900">{value}</div>
  </div>
);

// Tableau d'activité récente sur l'Overview (façon "Historique des
// Activations") : filtres par statut + recherche, sans avoir à changer
// d'onglet — juste un aperçu rapide, la vue "Orders" garde la gestion complète.
const RecentActivityTable = ({ allOrders }) => {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = allOrders
    .filter(o => filter === 'all' || (o.status || 'pending') === filter)
    .filter(o => !search.trim() || (o.buyer_email || '').toLowerCase().includes(search.trim().toLowerCase()) || (o.product_name || '').toLowerCase().includes(search.trim().toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 12);

  const statusBadge = (status) => {
    const s = status || 'pending';
    const map = {
      confirmed: { label: 'Confirmed', cls: 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' },
      processing: { label: 'Processing', cls: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' },
      cancelled: { label: 'Cancelled', cls: 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400' },
      pending: { label: 'Pending', cls: 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-400' },
    };
    const { label, cls } = map[s] || map.pending;
    return <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wide ${cls}`}>{label}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activité récente</h3>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
            {['all', 'confirmed', 'processing', 'pending', 'cancelled'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${filter === f ? 'bg-primary text-white dark:text-gray-900' : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-900'}`}>
                {f === 'all' ? 'Toutes' : f}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={14} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher par email, produit…"
              className="pl-9 pr-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-primary/20 outline-none w-52"
            />
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600 dark:text-slate-300">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              <th className="pb-4">Client</th><th className="pb-4">Produit</th><th className="pb-4">Date</th><th className="pb-4">Statut</th><th className="pb-4 text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800/40">
            {filtered.map(o => (
              <tr key={o.id}>
                <td className="py-4 font-bold text-gray-900 dark:text-white">{o.buyer_email || '—'}</td>
                <td className="py-4 text-gray-500 dark:text-slate-400">{cleanProductName(o.product_name, lang)}</td>
                <td className="py-4 text-xs text-gray-400 dark:text-slate-500">{new Date(o.created_at).toLocaleString('fr-FR')}</td>
                <td className="py-4">{statusBadge(o.status)}</td>
                <td className="py-4 text-right font-mono font-black text-gray-900 dark:text-white">${Number(o.total_price || 0).toFixed(2)}</td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-gray-400 dark:text-slate-500">Aucune commande trouvée.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// SUPPORT ADMIN — chat temps réel côté admin (liste tickets + conversation)
// ==========================================
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

// ==========================================
// CLIENT MANAGEMENT — recherche, statistiques, ban/déban, crédit, historique
// ==========================================
const ClientManagement = ({ allUsers, allOrders, fetchUsers, loading = false }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all | active | suspended
  const [viewingClient, setViewingClient] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Stats par client, calculées une fois depuis toutes les commandes.
  const statsByUser = (() => {
    const map = new Map();
    allOrders.forEach(o => {
      const cur = map.get(o.user_id) || { orders: 0, spent: 0, deposited: 0, lastActivity: null };
      if (o.status === 'confirmed') {
        if (o.product_id === 999) cur.deposited += o.total_price || 0;
        else { cur.orders += 1; cur.spent += o.total_price || 0; }
      }
      const t = new Date(o.created_at).getTime();
      if (!cur.lastActivity || t > cur.lastActivity) cur.lastActivity = t;
      map.set(o.user_id, cur);
    });
    return map;
  })();

  const filtered = allUsers
    .filter(u => statusFilter === 'all' || (statusFilter === 'suspended' ? u.is_suspended : !u.is_suspended))
    .filter(u => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (u.email || '').toLowerCase().includes(q) || (u.display_name || '').toLowerCase().includes(q);
    });

  const activeCount = allUsers.filter(u => !u.is_suspended).length;
  const suspendedCount = allUsers.filter(u => u.is_suspended).length;

  const toggleBan = async (user) => {
    const next = !user.is_suspended;
    if (!window.confirm(next
      ? `Bannir ${user.email} ? Il ne pourra plus acheter ni recharger tant qu'il est suspendu.`
      : `Réactiver ${user.email} ?`)) return;
    setBusyId(user.id);
    const { error } = await supabase.from('profiles').update({ is_suspended: next }).eq('id', user.id);
    if (error) alert('Erreur : ' + error.message);
    else await fetchUsers();
    setBusyId(null);
  };

  const creditBalance = async (user) => {
    const raw = prompt(`Créditer le solde de ${user.email} de ($) :`, '10');
    if (raw == null) return;
    const amount = parseFloat(raw);
    if (isNaN(amount) || amount === 0) return;
    setBusyId(user.id);
    const { data } = await supabase.from('profiles').select('balance').eq('id', user.id).single();
    const { error } = await supabase.from('profiles').update({ balance: (data?.balance || 0) + amount }).eq('id', user.id);
    if (error) alert('Erreur : ' + error.message);
    else await fetchUsers();
    setBusyId(null);
  };

  const initial = (u) => (u.display_name || u.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 md:p-10 shadow-soft space-y-8">
      {/* En-tête + compteurs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gestion des clients</h2>
          <div className="flex items-center gap-4 mt-2 text-xs font-bold">
            <span className="text-gray-400">{allUsers.length} au total</span>
            <span className="text-green-600 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" /> {activeCount} actifs</span>
            <span className="text-red-500 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {suspendedCount} suspendus</span>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 bg-gray-50 dark:bg-slate-800 rounded-xl p-1">
            {['all', 'active', 'suspended'].map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide transition-all ${statusFilter === f ? 'bg-gray-900 dark:bg-primary text-white dark:text-gray-900' : 'text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
                {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Suspendus'}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={15} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher email ou pseudo…"
              className="pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
            />
          </div>
        </div>
      </div>

      {/* Table clients */}
      {loading ? (
        <div className="py-4"><SkeletonRows rows={6} cols={7} /></div>
      ) : (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
              <th className="pb-4">Client</th><th className="pb-4">Solde</th><th className="pb-4">Achats</th><th className="pb-4">Dépensé</th><th className="pb-4">Inscrit</th><th className="pb-4">Statut</th><th className="pb-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
            {filtered.map(user => {
              const s = statsByUser.get(user.id) || { orders: 0, spent: 0, deposited: 0 };
              return (
                <tr key={user.id} className={user.is_suspended ? 'opacity-60' : ''}>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center shrink-0">{initial(user)}</div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 dark:text-white truncate">{user.email}</div>
                        <div className="text-xs text-gray-400 truncate">{user.display_name || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 font-mono font-black text-primary">${Number(user.balance || 0).toFixed(2)}</td>
                  <td className="py-4 text-gray-600 dark:text-gray-300">{s.orders}</td>
                  <td className="py-4 font-mono text-gray-600 dark:text-gray-300">${s.spent.toFixed(2)}</td>
                  <td className="py-4 text-xs text-gray-400">{user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="py-4">
                    {user.is_suspended
                      ? <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-red-100 text-red-700 uppercase tracking-wide">Suspendu</span>
                      : <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-green-100 text-green-700 uppercase tracking-wide">Actif</span>}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setViewingClient(user)} title="Voir l'historique" className="p-2 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"><Eye size={14} /></button>
                      <button onClick={() => creditBalance(user)} disabled={busyId === user.id} title="Créditer le solde" className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all disabled:opacity-40"><DollarSign size={14} /></button>
                      <button onClick={() => toggleBan(user)} disabled={busyId === user.id}
                        title={user.is_suspended ? 'Réactiver' : 'Bannir'}
                        className={`p-2 rounded-lg transition-all disabled:opacity-40 ${user.is_suspended ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}>
                        {user.is_suspended ? <UserCheck size={14} /> : <Ban size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-gray-400">Aucun client trouvé.</td></tr>}
          </tbody>
        </table>
      </div>
      )}

      {/* Modale détail client */}
      {viewingClient && (() => {
        const s = statsByUser.get(viewingClient.id) || { orders: 0, spent: 0, deposited: 0 };
        const clientOrders = allOrders.filter(o => o.user_id === viewingClient.id).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        return (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setViewingClient(null)} />
            <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 space-y-6 animate-in fade-in zoom-in duration-300 max-h-[85vh] overflow-y-auto">
              <div className="flex justify-between items-start border-b border-gray-100 dark:border-slate-800 pb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary font-black text-lg flex items-center justify-center">{initial(viewingClient)}</div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingClient.email}</h3>
                    <p className="text-xs text-gray-400 font-bold mt-1">{viewingClient.display_name || '—'} · inscrit le {viewingClient.created_at ? new Date(viewingClient.created_at).toLocaleDateString('fr-FR') : '—'}</p>
                  </div>
                </div>
                <button onClick={() => setViewingClient(null)} aria-label="Close" className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-full text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all"><X size={18} /></button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Solde</div><div className="text-lg font-black text-primary font-mono">${Number(viewingClient.balance || 0).toFixed(2)}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Achats</div><div className="text-lg font-black text-gray-900 dark:text-white">{s.orders}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Dépensé</div><div className="text-lg font-black text-gray-900 dark:text-white font-mono">${s.spent.toFixed(2)}</div></div>
                <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl p-4"><div className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Rechargé</div><div className="text-lg font-black text-gray-900 dark:text-white font-mono">${s.deposited.toFixed(2)}</div></div>
              </div>

              {clientOrders.length === 0 ? (
                <p className="text-gray-400 text-sm italic py-8 text-center">Aucune activité pour ce client.</p>
              ) : (
                <div className="space-y-3">
                  {clientOrders.map(o => (
                    <div key={o.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl">
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {o.product_id === 999 ? <span className="text-[9px] font-black uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Recharge</span> : <span className="text-[9px] font-black uppercase bg-primary/10 text-primary px-2 py-0.5 rounded-full">Achat</span>}
                          {o.product_name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold mt-1">{new Date(o.created_at).toLocaleString('fr-FR')}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-black text-gray-900 dark:text-white font-mono">${o.total_price?.toFixed(2)}</div>
                        <div className={`text-[10px] font-bold uppercase mt-1 ${o.status === 'confirmed' ? 'text-green-600' : o.status === 'cancelled' ? 'text-red-500' : o.status === 'processing' ? 'text-blue-600' : 'text-yellow-600'}`}>
                          {o.status === 'confirmed' ? 'Payé' : o.status === 'cancelled' ? 'Annulé' : o.status === 'processing' ? 'En cours' : 'En attente'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

const AdminView = ({
  session, navigate, products, fetchProducts, allOrders, fetchAllOrders, allUsers, fetchUsers,
  actionStatus, setActionStatus, lang, setLang, t, dataLoading = false,
}) => {
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('agedgmail_admin_tab') || "dashboard");
  const [supplierBalance, setSupplierBalance] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    localStorage.setItem('agedgmail_admin_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('supplier_settings').select('balance, currency').eq('supplier', 'ytseller').maybeSingle()
      .then(({ data }) => setSupplierBalance(data || null));

    // Fetch mappings for purchase cost calculation
    supabase.from('product_supplier_mapping').select('*')
      .then(({ data }) => setMappings(data || []));
  }, []);

  const handleAdminLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword });
      if (error) throw error;
    } catch (err) {
      setLoginError(err.message || 'Identifiants admin invalides.');
    }
    setLoginLoading(false);
  };


  // Standalone Auth check inside AdminView
  if (!session) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-gray-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-8 text-gray-900 dark:text-white relative">
          <button onClick={() => navigate('shop')} className="absolute top-8 left-8 text-xs text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white font-bold flex items-center gap-1">
            <ArrowLeft size={14} /> {t('backToSite')}
          </button>
          <div className="text-center space-y-2 pt-4">
            <div className="w-16 h-16 bg-primary/10 border border-primary/20 text-primary rounded-3xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Shield size={32} />
            </div>
            <h1 className="text-2xl font-black tracking-tight">Admin Console</h1>
            <p className="text-gray-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">AgedGmail Security Area</p>
          </div>

          <form onSubmit={handleAdminLoginSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="admin@example.com"
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary/20 text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest ml-1">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-14 px-5 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-primary/20 text-sm font-bold"
              />
            </div>

            {loginError && (
              <div className="bg-red-500/10 text-red-500 dark:text-red-400 p-4 rounded-xl text-xs font-bold border border-red-500/20 flex items-center gap-2 animate-bounce">
                <AlertTriangle size={14} /> {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-14 bg-primary text-white dark:text-gray-900 rounded-2xl font-bold text-sm hover:bg-primaryDark transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loginLoading && <RefreshCcw size={16} className="animate-spin" />}
              Accéder à la console
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-canvas dark:bg-gray-950 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-md bg-white dark:bg-slate-900/40 backdrop-blur-md border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-2xl space-y-6 text-center text-gray-900 dark:text-white">
          <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
            <ShieldAlert size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-red-500">Accès Refusé</h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
            Votre compte n'est pas autorisé à accéder à la console d'administration.
          </p>
          <div className="flex gap-3 pt-4">
            <button onClick={() => navigate('shop')} className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 rounded-2xl text-sm font-bold hover:bg-gray-200 dark:hover:bg-slate-700 transition-all">
              {t('backToSite')}
            </button>
            <button onClick={() => supabase.auth.signOut()} className="flex-1 py-4 bg-red-600 rounded-2xl text-sm font-bold hover:bg-red-700 transition-all">
              {t('logout')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- CALCULS DES METRIQUES FINANCIERES ---
  const confirmedOrders = allOrders.filter(o => o.status === 'confirmed');
  
  // Ventes de produits réelles (exclure product_id=999 qui sont les recharges de solde)
  const confirmedPurchases = confirmedOrders.filter(o => o.product_id !== 999);
  const totalSold = confirmedPurchases.reduce((s, o) => s + (o.total_price || 0), 0);

  // Coût total d'achat fournisseur — même fonction partagée que le graphique
  // (orderSupplierCost), donc carte et courbe affichent TOUJOURS le même chiffre.
  const totalCost = confirmedPurchases.reduce((sum, o) => sum + orderSupplierCost(o, mappings), 0);

  // Bénéfice Net & Marge
  const netProfit = totalSold - totalCost;
  const realMarginPercent = totalSold > 0 ? (netProfit / totalSold) * 100 : 0;

  // Dépôts réels (recharges de solde confirmées)
  const totalDeposited = confirmedOrders
    .filter(o => o.product_id === 999)
    .reduce((s, o) => s + (o.total_price || 0), 0);

  // Compteurs opérationnels secondaires
  const processingCount = allOrders.filter(o => o.status === 'processing').length;
  const pendingOnlyCount = allOrders.filter(o => (o.status || 'pending') === 'pending').length;
  const cancelledCount = allOrders.filter(o => o.status === 'cancelled').length;

  // Commandes bloquées : en attente/en cours depuis plus de 15 min
  const STUCK_MIN = 15;
  const stuckOrders = allOrders.filter(o =>
    (o.status === 'pending' || o.status === 'processing') &&
    (Date.now() - new Date(o.created_at).getTime()) / 60000 > STUCK_MIN
  );

  // Top produits vendus (hors recharges)
  const topProducts = (() => {
    const counts = new Map();
    confirmedPurchases.forEach(o => {
      const key = o.product_name || 'Produit';
      const cur = counts.get(key) || { count: 0, revenue: 0 };
      counts.set(key, { count: cur.count + (o.quantity || 1), revenue: cur.revenue + (o.total_price || 0) });
    });
    return [...counts.entries()].sort((a, b) => b[1].revenue - a[1].revenue).slice(0, 5);
  })();

  const FinanceCard = ({ label, value, subtext, color = 'emerald', icon: Icon }) => {
    const colors = {
      emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      violet: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      'profit-accent': 'bg-white/15 text-white border-white/20',
    };

    const isAccent = color === 'profit-accent';

    return (
      <div className={`p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group transition-all duration-200 border ${
        isAccent
          ? 'bg-gradient-to-br from-emerald-500 via-emerald-650 to-teal-700 text-white border-transparent shadow-emerald-500/10 hover:scale-[1.02]'
          : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
      }`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <span className={`text-[10px] font-black uppercase tracking-widest ${isAccent ? 'text-emerald-100' : 'text-gray-400 dark:text-slate-400'}`}>{label}</span>
            <div className={`text-3xl font-black font-mono ${isAccent ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{value}</div>
            {subtext && <div className={`text-xs font-semibold ${isAccent ? 'text-emerald-100/80' : 'text-gray-500 dark:text-slate-500'}`}>{subtext}</div>}
          </div>
          <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${colors[color]}`}>
            <Icon size={18} />
          </div>
        </div>
        {isAccent && (
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex flex-col lg:flex-row">
      {/* Sidebar Standalone */}
      <aside className="w-full lg:w-72 shrink-0 bg-white dark:bg-slate-900 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-slate-800 p-8 flex flex-col justify-between">
        <div className="space-y-10">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-gray-900 dark:text-white">Console</div>
              <div className="text-[9px] font-black uppercase text-gray-400 dark:text-slate-500 tracking-wider">AgedGmail Admin</div>
            </div>
          </div>

          {/* Nav list */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard', label: lang === 'fr' ? "Vue d'ensemble" : "Overview", icon: LayoutDashboard },
              { id: 'orders', label: lang === 'fr' ? "Commandes" : "Orders", icon: FileText },
              { id: 'payments', label: 'Binance Pay', icon: Wallet },
              { id: 'users', label: lang === 'fr' ? "Clients" : "Client Management", icon: Users },
              { id: 'support', label: 'Support / Chat', icon: MessageCircle },
              { id: 'supplier', label: lang === 'fr' ? "Fournisseur" : "Supplier", icon: Database },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-white dark:text-gray-900 shadow-xl shadow-primary/20'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white dark:text-gray-900 hover:bg-gray-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={18} /> {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div>
          {/* Theme and Language Switchers */}
          <div className="flex gap-3 justify-center items-center py-4 border-t border-gray-100 dark:border-slate-800 mt-6">
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex-1 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all border border-gray-100 dark:border-slate-700"
              title="Change Language"
            >
              {lang.toUpperCase()}
            </button>
          </div>

          {/* Back to site */}
          <div className="pt-6 border-t border-gray-100 dark:border-slate-800 mt-4 space-y-4">
            <div className="text-xs text-gray-500 dark:text-slate-500 font-semibold px-2">
              {lang === 'fr' ? "Connecté en tant que :" : "Logged in as:"}<br/>
              <strong className="text-gray-800 dark:text-slate-300 font-bold">{session.user.email}</strong>
            </div>
            <button
              onClick={() => navigate('shop')}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-slate-800 text-gray-750 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-gray-205 dark:hover:bg-slate-700 hover:text-gray-950 dark:hover:text-white transition-all"
            >
              <ArrowLeft size={14} /> {t('backToSite')}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-8 lg:p-12 space-y-8 overflow-y-auto max-h-screen">
        {activeTab === 'dashboard' && dataLoading && (
          <div className="space-y-8">
            <SkeletonMetricCards count={4} />
            <SkeletonMetricCards count={4} />
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8">
              <SkeletonRows rows={6} cols={5} />
            </div>
          </div>
        )}

        {activeTab === 'dashboard' && !dataLoading && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Warnings */}
            {supplierBalance && Number(supplierBalance.balance) <= 0 && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[2rem] p-6 flex items-center gap-4">
                <AlertTriangle size={24} className="text-red-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-red-300">Solde fournisseur YTSeller à 0 — aucune commande dropship ne peut être livrée.</p>
                  <button onClick={() => setActiveTab('supplier')} className="text-xs font-black text-red-400 hover:underline uppercase tracking-widest mt-1">Voir l'onglet Supplier</button>
                </div>
              </div>
            )}

            {stuckOrders.length > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-[2rem] p-6 flex items-center gap-4">
                <Clock size={24} className="text-amber-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-300">{stuckOrders.length} commande(s) en attente depuis plus de {STUCK_MIN} min — à vérifier.</p>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-black text-amber-400 hover:underline uppercase tracking-widest mt-1">Voir les commandes</button>
                </div>
              </div>
            )}

            {/* Financial Highlights */}
            <div className="space-y-3">
              <h2 className="text-xs font-black text-slate-500 uppercase tracking-widest">Financial Highlights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <FinanceCard
                  label="Chiffre d'Affaires (Ventes)"
                  value={`$${totalSold.toFixed(2)}`}
                  subtext={`${confirmedPurchases.length} ventes de produits`}
                  color="blue"
                  icon={DollarSign}
                />
                <FinanceCard
                  label="Coût d'Achat Fournisseur"
                  value={`$${totalCost.toFixed(2)}`}
                  subtext="Estimé sur le mapping actif"
                  color="amber"
                  icon={Database}
                />
                <FinanceCard
                  label="Bénéfice Net"
                  value={`$${netProfit.toFixed(2)}`}
                  subtext="Marge réelle en dollar"
                  color="profit-accent"
                  icon={TrendingUp}
                />
                <FinanceCard
                  label="Marge Réelle (%)"
                  value={`${realMarginPercent.toFixed(1)}%`}
                  subtext="CA / Coût Fournisseur"
                  color="violet"
                  icon={CircleDollarSign}
                />
              </div>
            </div>

            {/* Operational stats row (clean & secondary) */}
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-8 space-y-4">
              <h3 className="text-xs font-black text-gray-400 dark:text-slate-400 uppercase tracking-widest">Operational Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">Dépôts Clients (Recharges)</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">${totalDeposited.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">En cours fournisseur</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">{processingCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">En attente / Binance</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">{pendingOnlyCount}</div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 dark:text-slate-500 font-bold uppercase">Commandes annulées</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-slate-300 font-mono mt-1">{cancelledCount}</div>
                </div>
              </div>
            </div>

            <RevenueChart confirmedOrders={confirmedOrders} allUsers={allUsers} mappings={mappings} lang={lang} />

            {/* Top products & Activity side-by-side */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Recent Activity (takes 2 cols) */}
              <div className="xl:col-span-2">
                <RecentActivityTable allOrders={allOrders} />
              </div>

              {/* Top Products */}
              <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[3rem] p-8 shadow-2xl h-fit">
                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-6">Top produits vendus</h3>
                {topProducts.length === 0 ? (
                  <p className="text-gray-500 dark:text-slate-500 text-sm italic">Aucune vente confirmée pour l'instant.</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map(([name, stats], i) => (
                      <div key={name} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-slate-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-bold flex items-center justify-center text-xs shrink-0">
                            {i + 1}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug">{name}</div>
                            <div className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase mt-1 tracking-widest">{stats.count} vendu(s)</div>
                          </div>
                        </div>
                        <div className="text-sm font-black text-primary font-mono shrink-0 pl-4">${stats.revenue.toFixed(2)}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
          {activeTab === 'orders' && <OrdersAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} lang={lang} loading={dataLoading} />}

          {activeTab === 'users' && (
            <ClientManagement allUsers={allUsers} allOrders={allOrders} fetchUsers={fetchUsers} loading={dataLoading} />
          )}

          {activeTab === 'payments' && <BinancePaymentsAdmin allOrders={allOrders} fetchAllOrders={fetchAllOrders} />}

          {activeTab === 'support' && <SupportAdmin session={session} />}

          {activeTab === 'supplier' && <SupplierAdmin products={products} fetchProducts={fetchProducts} />}
        </main>
      </div>
    );
  };

const CRYPTO_CURRENCIES = [
  { id: 'btc', label: 'Bitcoin', ticker: 'BTC', symbol: '₿', color: 'bg-orange-100 text-orange-600' },
  { id: 'eth', label: 'Ethereum', ticker: 'ETH', symbol: 'Ξ', color: 'bg-indigo-100 text-indigo-600' },
  { id: 'usdttrc20', label: 'USDT (TRC20)', ticker: 'USDT', symbol: '₮', color: 'bg-green-100 text-green-600' },
  { id: 'ltc', label: 'Litecoin', ticker: 'LTC', symbol: 'Ł', color: 'bg-slate-100 text-slate-600' },
];

// Passerelles de paiement. Binance Pay est branché (confirmation manuelle
// admin en attendant l'accès à l'historique Binance Pay). Les autres
// apparaissent en aperçu ("Bientôt") tant qu'elles ne sont pas réellement
// intégrées, pour ne jamais laisser croire qu'un moyen de paiement fonctionne
// alors qu'il ne le fait pas.
// NOWPayments mis hors service (remplacé par Binance) — code gardé au cas où
// on le réactive plus tard, juste retiré de la liste des moyens proposés.
// Chaque crypto est proposée comme un choix distinct (au lieu d'un unique
// "NOWPayments" avec un sous-sélecteur de devise). `payCurrency` = la devise
// envoyée au backend NOWPayments. Mobile Money reste affiché mais désactivé
// (grisé, non cliquable) tant que la méthode n'est pas prête.
// `min` = dépôt minimum autorisé (USD), affiché directement sur la tuile pour
// que le client le sache AVANT de cliquer. Binance Pay est le seul à $0.50 ;
// les cryptos (via NOWPayments) sont à $20 à cause des frais de réseau fluctuants (min ~18.86$).
const PAYMENT_GATEWAYS = [
  { id: 'binance_pay', name: 'Binance Pay', sub: 'Pay ID Binance', enabled: true, symbol: '🅑', min: 0.5, recommended: true },
  { id: 'usdt_trc20', name: 'USDT', sub: 'TRC20', enabled: true, symbol: '₮', manual: true, min: 0.5 },
  { id: 'mobile_money', name: 'Mobile Money', sub: 'Bientôt', enabled: false, symbol: '📱' },
];

const BONUS_TIERS = [
  { amount: 100, pct: 1 },
  { amount: 500, pct: 2 },
  { amount: 1000, pct: 3 },
  { amount: 10000, pct: 4 },
];
const bonusPercentFor = (amountUsd) => [...BONUS_TIERS].reverse().find(t => amountUsd >= t.amount)?.pct || 0;

const RechargeView = ({ profile, session, navigate, suggestedAmount, setSuggestedAmount, fetchProfile, resumeOrder, clearResumeOrder, lang, t }) => {
  const [amountUsd, setAmountUsd] = useState(suggestedAmount || 50);
  const [gateway, setGateway] = useState(null); // null tant que le client n'a pas choisi de passerelle
  const [payCurrency, setPayCurrency] = useState('usdttrc20');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('form'); // 'form' | 'awaiting' | 'success'
  const [error, setError] = useState('');
  const [payment, setPayment] = useState(null); // { orderId, payAddress, payAmount, payCurrency, bonusPct, creditAmount }
  const [copied, setCopied] = useState(false);
  const [minAmounts, setMinAmounts] = useState({}); // { btc: 18.78, eth: 18.78, ... }
  const [binanceSubStep, setBinanceSubStep] = useState('pay'); // 'pay' | 'verify' — Binance Pay uniquement
  const [binanceOrderIdInput, setBinanceOrderIdInput] = useState('');
  const [verifying, setVerifying] = useState(false);

  useEffect(() => () => setSuggestedAmount(null), []);

  // Reprise d'une commande Binance Pay 'pending' depuis "Mes commandes" : on
  // rejoue l'étape d'attente avec les infos déjà en base, sans recréer de
  // commande (le montant/code/expiration restent ceux d'origine).
  useEffect(() => {
    if (!resumeOrder) return;
    setPayment({
      provider: 'binance_pay',
      orderId: resumeOrder.id,
      payId: resumeOrder.pay_id,
      expectedAmount: resumeOrder.expected_amount,
      creditAmount: resumeOrder.credit_amount,
      paymentCode: profile?.display_name,
      binanceOrderId: resumeOrder.binance_tx_id || undefined,
      expiresAt: resumeOrder.expires_at ? new Date(resumeOrder.expires_at).getTime() : Date.now() + 20 * 60_000,
    });
    setBinanceSubStep(resumeOrder.binance_tx_id ? 'submitted' : 'pay');
    setStep('awaiting');
    if (clearResumeOrder) clearResumeOrder();
  }, [resumeOrder]);

  // NOWPayments désactivé : plus besoin d'interroger les minimums de dépôt.

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (step !== 'awaiting' || payment?.provider !== 'binance_pay') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [step, payment]);

  // Nouvelle tentative automatique périodique tant que l'approbation n'a pas
  // encore trouvé de correspondance (ex. décalage de synchro côté Binance) —
  // entièrement automatique, sans étape manuelle exposée au client.
  useEffect(() => {
    if (binanceSubStep !== 'submitted' || !payment?.orderId || !payment?.binanceOrderId) return;
    const retry = setInterval(async () => {
      const { data: fnData } = await supabase.functions.invoke('binance-submit-tx', {
        body: { orderId: payment.orderId, binanceOrderId: payment.binanceOrderId },
      });
      if (fnData?.autoConfirmed) {
        clearInterval(retry);
        if (fetchProfile) await fetchProfile(session.user.id);
        setStep('success');
      }
    }, 15000);
    return () => clearInterval(retry);
  }, [binanceSubStep, payment]);

  if (!session) { navigate('auth'); return null; }

  const close = () => navigate('dashboard');
  const bonusPct = bonusPercentFor(amountUsd);
  // Devise crypto déduite de la passerelle choisie (btc / usdt_trc20 / ltc).
  const selectedGateway = PAYMENT_GATEWAYS.find(g => g.id === gateway);
  const activePayCurrency = selectedGateway?.payCurrency || null;
  const isCrypto = !!activePayCurrency;
  // Minimum affiché/appliqué : le min statique de la méthode (Binance Pay $10,
  // crypto $18), affiné par le min dynamique NOWPayments s'il est plus élevé.
  const dynamicMin = activePayCurrency ? minAmounts[activePayCurrency] : undefined;
  const selectedMin = Math.max(selectedGateway?.min || 0, typeof dynamicMin === 'number' ? dynamicMin : 0) || undefined;
  const belowMin = typeof selectedMin === 'number' && amountUsd < selectedMin;
  const remainingMs = payment?.expiresAt ? Math.max(0, payment.expiresAt - now) : 0;
  const remainingLabel = `${Math.floor(remainingMs / 60000)}:${String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0')}`;

  const extractFnErrorMessage = async (fnError) => {
    // Le SDK Supabase masque le corps JSON réel derrière un message
    // générique ("Edge Function returned a non-2xx status code").
    // On va chercher la vraie raison dans la réponse HTTP sous-jacente.
    let realMessage = fnError.message;
    try {
      const body = await fnError.context?.json();
      if (body?.error) realMessage = body.error;
    } catch { /* corps non-JSON ou déjà consommé, on garde le message par défaut */ }
    return realMessage;
  };

  const handleSubmit = async () => {
    if (profile?.is_suspended) { setError("Ton compte est suspendu. Contacte le support."); return; }
    if (!gateway) { setError('Choisis une passerelle de paiement.'); return; }
    if (amountUsd <= 0) { setError('Montant invalide.'); return; }
    // Minimum dynamique ou statique appliqué.
    if (selectedMin && amountUsd < selectedMin) {
      setError(`Montant minimum pour ${selectedGateway?.name} : $${selectedMin.toFixed(2)}.`);
      return;
    }

    if (gateway === 'usdt_trc20') {
      setPayment({
        provider: 'usdt_trc20',
        expectedAmount: amountUsd,
        address: 'TFy2DpPjsHhsbTeMVhtAQ8JuYxjUkKTMPu'
      });
      setStep('manual_usdt');
      return;
    }

    if (gateway === 'binance_pay') {
      setLoading(true);
      setError('');
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('binance-create-order', {
          body: { userId: session.user.id, email: session.user.email, amountUsd, paymentMethod: 'binance_pay' },
        });
        if (fnError) throw new Error(await extractFnErrorMessage(fnError));
        if (fnData?.error === 'username_required') {
          setError('username_required');
          return;
        }
        if (fnData?.error) throw new Error(fnData.error);
        if (!fnData?.payId || !fnData?.expectedAmount) throw new Error('Réponse Binance invalide.');

        setPayment({
          provider: 'binance_pay',
          ...fnData,
          expiresAt: Date.now() + fnData.expiresInMinutes * 60_000,
        });
        setStep('awaiting');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (isCrypto) {
      if (belowMin) { setError(`Montant minimum pour ${selectedGateway.name} : $${selectedMin.toFixed(2)}`); return; }

      setLoading(true);
      setError('');
      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke('nowpayments-create', {
          body: { userId: session.user.id, email: session.user.email, amountUsd, payCurrency: activePayCurrency },
        });

        if (fnError) {
          let realMessage = await extractFnErrorMessage(fnError);
          if (/less than minimal/i.test(realMessage)) {
            realMessage = `Ce montant est en dessous du minimum accepté pour ${selectedGateway.name}. Essaie un montant plus élevé ou une autre cryptomonnaie.`;
          }
          throw new Error(realMessage);
        }
        if (fnData?.error) throw new Error(fnData.error);
        if (!fnData?.payAddress) throw new Error('Réponse NOWPayments invalide.');

        setPayment({ provider: 'nowpayments', ...fnData });
        setStep('awaiting');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (gateway === 'mobile_money') {
      setLoading(true);
      setError('');
      try {
        const { data: orderData, error: orderErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: 999,
          product_name: 'Recharge Mobile Money',
          quantity: 1,
          total_price: amountUsd,
          status: 'pending'
        }).select().single();

        if (orderErr) throw orderErr;

        setPayment({ provider: 'mobile_money', orderId: orderData.id, expectedAmount: amountUsd, creditAmount: amountUsd * (1 + bonusPct / 100), bonusPct });
        setStep('awaiting');
      } catch (err) {
        setError(err.message || 'Une erreur est survenue.');
      } finally {
        setLoading(false);
      }
      return;
    }
  };

  const copyAddress = () => {
    if (payment?.payAddress) {
      navigator.clipboard?.writeText(payment.payAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  // Poll le statut de la commande jusqu'à confirmation (le webhook NOWPayments crédite le solde côté serveur).
  useEffect(() => {
    if (step !== 'awaiting' || !payment?.orderId || !supabase) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('orders').select('status').eq('id', payment.orderId).maybeSingle();
      if (data?.status === 'confirmed') {
        clearInterval(interval);
        if (fetchProfile) await fetchProfile(session.user.id);
        setStep('success');
      } else if (data?.status === 'cancelled') {
        clearInterval(interval);
        setError('Le paiement a été rejeté, a échoué ou a expiré. Réessaie avec un nouveau paiement ou vérifie tes informations.');
        setStep('form');
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [step, payment, session, fetchProfile]);

  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="text-2xl font-black text-gray-900">{t('topUpAccount')}</h2>
          <button onClick={close} aria-label="Close" className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"><X size={18} /></button>
        </div>

        {step === 'form' && (
          <div className="px-8 pb-8 pt-4 space-y-6">
            <p className="text-sm text-gray-500">Plus vous rechargez, plus le bonus est important — crédité instantanément.</p>

            {suggestedAmount && (
              <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-sm text-gray-600">
                Il te manque <span className="font-black text-primary">${suggestedAmount.toFixed(2)}</span> pour finaliser ta commande.
              </div>
            )}

            <div className="grid grid-cols-4 gap-2">
              {BONUS_TIERS.map(t => (
                <button
                  key={t.amount}
                  onClick={() => setAmountUsd(t.amount)}
                  className={`px-2 py-2.5 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-0.5 ${amountUsd === t.amount ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-gray-600 hover:border-primary/50'}`}
                >
                  <span>${t.amount >= 1000 ? `${t.amount / 1000}k` : t.amount}</span>
                  <span className="text-primary font-black">+{t.pct}%</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('amountToRecharge')}</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amountUsd}
                onChange={e => setAmountUsd(Number(e.target.value))}
                className="w-full px-6 py-4 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-primary/20 outline-none font-black text-xl font-mono text-primary"
              />
              {belowMin && (
                <p className="text-xs text-red-500 font-bold mt-2 flex items-center gap-1"><AlertTriangle size={12} /> Minimum autorisé pour {selectedGateway.name} : ${selectedMin}.</p>
              )}
              {bonusPct > 0 && (
                <p className="text-xs text-primary font-bold mt-2">Bonus +{bonusPct}% → tu recevras ${(amountUsd * (1 + bonusPct / 100)).toFixed(2)} sur ton solde.</p>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('choosePayment')}</label>
              <div className="grid grid-cols-2 gap-3">
                {PAYMENT_GATEWAYS.map(g => {
                  const gDynamic = g.payCurrency ? minAmounts[g.payCurrency] : undefined;
                  const displayMin = Math.max(g.min || 0, typeof gDynamic === 'number' ? gDynamic : 0);
                  
                  return (
                    <button
                      key={g.id}
                      onClick={() => g.enabled && setGateway(g.id)}
                      disabled={!g.enabled}
                      className={`relative text-left p-3 rounded-2xl border transition-all flex items-center gap-3 ${!g.enabled ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed' : gateway === g.id ? 'bg-primary/5 border-primary' : 'bg-white border-gray-200 hover:border-primary/50'} ${g.recommended ? 'ring-2 ring-amber-400 border-amber-400' : ''}`}
                    >
                      <span className={`absolute top-2 right-2 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${g.recommended ? 'text-amber-700 bg-amber-100 animate-pulse' : g.enabled ? 'text-green-700 bg-green-50' : 'text-gray-400 bg-gray-100'}`}>
                        {g.recommended ? 'Recommandé' : g.enabled ? 'Auto' : 'Bientôt'}
                      </span>
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${g.recommended ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-600'}`}>{g.symbol}</span>
                      <span>
                        <span className="block text-sm font-bold text-gray-900">{g.name}</span>
                        <span className="block text-[10px] text-gray-400 font-medium">{g.sub}</span>
                        {g.enabled && displayMin > 0 && (
                          <span className="mt-0.5 flex items-center gap-1 text-[10px] font-bold text-primary">
                            <Info size={9} /> Min. ${displayMin.toFixed(2)}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {gateway === 'binance_pay' && (
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 leading-relaxed">
                Paiement via Binance Pay, montant exact demandé. Tu devras coller ton pseudo
                ({profile?.display_name ? <span className="font-bold text-gray-700">{profile.display_name}</span> : <span className="font-bold text-amber-600">non configuré</span>})
                {' '}dans la note du paiement pour t'identifier. Confirmation vérifiée manuellement, généralement rapide.
              </div>
            )}

            {(isCrypto || selectedGateway?.manual) && (
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 leading-relaxed">
                Dépôt en {selectedGateway.name} ({selectedGateway.sub}). Une adresse de dépôt et le montant exact te seront indiqués.
                {typeof selectedMin === 'number' && (
                  <> <span className="font-bold text-gray-700">Montant minimum : ${selectedMin.toFixed(2)}.</span></>
                )}
                {' '}D'éventuels frais de réseau sont à ta charge.
              </div>
            )}

            {error === 'username_required' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                <p className="text-sm text-amber-800 font-bold">Configure d'abord un pseudo dans tes paramètres — c'est lui qui sert à identifier tes paiements Binance Pay.</p>
                <button onClick={() => navigate('settings')} className="w-full py-3 rounded-xl bg-gray-900 text-white dark:text-gray-900 font-bold text-sm hover:bg-primary transition-all">
                  Configurer mon pseudo
                </button>
              </div>
            ) : error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">
                {error}
              </div>
            )}

            {gateway && (
              <button
                onClick={handleSubmit}
                disabled={loading || belowMin}
                className="w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/20 disabled:opacity-40"
              >
                {loading
                  ? <><RefreshCcw size={20} className="animate-spin" /> Préparation...</>
                  : <><Send size={20} /> Créer un dépôt</>}
              </button>
            )}
          </div>
        )}

        {step === 'manual_usdt' && (
          <div className="px-8 pb-8 pt-2 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-gray-900">Dépôt Manuel USDT</h3>
              <p className="text-gray-500 text-sm">Transférez exactement le montant ci-dessous via le réseau <span className="font-bold text-gray-900">Tron (TRC20)</span>.</p>
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 flex flex-col items-center gap-6 border border-gray-100 shadow-inner">
              <div className="text-center">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Montant exact à envoyer</span>
                <p className="text-4xl font-black text-primary font-mono">${Number(payment?.expectedAmount).toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${payment?.address}`} alt="QR Code USDT TRC20" className="w-40 h-40" />
              </div>
              <div className="w-full space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Adresse USDT (TRC20)</label>
                <div className="flex bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <div className="flex-1 px-4 py-3 text-xs font-mono font-bold text-gray-600 truncate flex items-center">{payment?.address}</div>
                  <button onClick={() => { navigator.clipboard.writeText(payment?.address); setCopied('address'); setTimeout(() => setCopied(''), 2000); }} className="bg-gray-100 hover:bg-gray-200 px-4 flex items-center justify-center text-gray-600 transition-colors">
                    {copied === 'address' ? <CheckCircle size={16} className="text-green-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <h4 className="font-bold text-amber-900 text-sm mb-1">Étape Finale</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Une fois le transfert effectué, veuillez contacter le support (en bas à droite) avec une capture d'écran ou le hash de la transaction. L'équipe créditera votre solde manuellement.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={() => navigate('dashboard')} className="w-full py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
              Fermer (J'ai bien noté l'adresse)
            </button>
          </div>
        )}

        {step === 'awaiting' && payment?.provider === 'binance_pay' && (
          <div className="px-8 pb-8 pt-2 space-y-6">
            {/* Indicateur d'étapes 1/2, comme les checkouts crypto habituels */}
            <div className="flex items-center justify-center gap-3 py-2">
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${binanceSubStep === 'pay' ? 'bg-primary text-white dark:text-gray-900' : 'bg-primary/10 text-primary'}`}>
                  {binanceSubStep === 'verify' ? <CheckCircle size={16} /> : '1'}
                </div>
                <span className={`text-[10px] font-bold ${binanceSubStep === 'pay' ? 'text-gray-900' : 'text-gray-400'}`}>Effectuer le paiement</span>
              </div>
              <div className="w-16 h-px bg-gray-200 mb-5" />
              <div className="flex flex-col items-center gap-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${binanceSubStep === 'verify' ? 'bg-primary text-white dark:text-gray-900' : 'bg-gray-100 text-gray-400'}`}>2</div>
                <span className={`text-[10px] font-bold ${binanceSubStep === 'verify' ? 'text-gray-900' : 'text-gray-400'}`}>Vérifier le paiement</span>
              </div>
            </div>

            {binanceSubStep === 'pay' ? (
              <>
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-900 font-mono">${Number(payment.expectedAmount).toFixed(2)}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Envoyer à l'ID Binance</label>
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                    <code className="text-sm font-mono text-gray-700 flex-grow text-left">{payment.payId}</code>
                    <button onClick={() => { navigator.clipboard?.writeText(String(payment.payId)); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="shrink-0 px-3 py-1.5 rounded-lg bg-gray-900 text-white dark:text-gray-900 text-xs font-bold hover:bg-primary transition-all flex items-center gap-1"><Copy size={12} /> Copier</button>
                  </div>
                  {copied && <p className="text-xs text-primary font-bold mt-2">Copié !</p>}
                </div>

                <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2">⚠️ Obligatoire — note du paiement</p>
                  <p className="text-xs text-gray-700 leading-relaxed mb-3">
                    Dans Binance, avant d'envoyer, colle ton pseudo dans le champ <span className="font-bold">"Note"</span> du paiement. C'est ce qui permet de t'identifier — toujours le même, à chaque recharge.
                  </p>
                  <div className="flex items-center gap-2 bg-white border border-amber-200 rounded-xl px-4 py-3">
                    <code className="text-lg font-black font-mono text-gray-900 flex-grow text-left tracking-widest">{payment.paymentCode}</code>
                    <button onClick={() => { navigator.clipboard?.writeText(String(payment.paymentCode)); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="shrink-0 p-2 rounded-lg bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all"><Copy size={14} /></button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col items-center gap-3">
                  <img src="/binance-pay-qr.jpeg" alt="QR Binance Pay" className="w-44 rounded-xl border border-gray-100 shadow-sm" />
                </div>

                <div className="text-xs text-gray-500 leading-relaxed space-y-1">
                  <p>Tu peux utiliser <span className="font-bold text-primary">Binance Pay</span> ou envoyer directement à cet ID Binance.</p>
                  <p>1. Ouvre l'app Binance → Wallets → Pay.</p>
                  <p>2. Envoie le montant exact ci-dessus, avec ton code en note de paiement.</p>
                  <p>3. Une fois le paiement effectué, clique "Confirmer le paiement" pour passer à l'étape suivante.</p>
                </div>

                <button
                  onClick={() => setBinanceSubStep('verify')}
                  className="w-full py-4 rounded-2xl font-bold bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all"
                >
                  Confirmer le paiement
                </button>
                <div className="text-center text-xs font-bold text-gray-900">
                  Expire dans <span className={remainingMs < 60000 ? 'text-red-500' : 'text-primary'}>{remainingLabel}</span>
                </div>
              </>
            ) : binanceSubStep === 'verify' ? (
              <>
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center justify-between text-sm">
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Montant</p>
                    <p className="font-black text-primary font-mono">${Number(payment.expectedAmount).toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Envoyé à l'ID Binance</p>
                    <p className="font-bold text-gray-700 font-mono">{payment.payId}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Ton Binance Order ID</label>
                  <input
                    type="text"
                    value={binanceOrderIdInput}
                    onChange={e => setBinanceOrderIdInput(e.target.value)}
                    placeholder="Ex: 1234567890123456789"
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-primary/20 outline-none font-mono text-sm"
                  />
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-500 leading-relaxed space-y-1">
                  <p className="font-bold text-gray-700">Où trouver ton Order ID :</p>
                  <p>1. Dans l'app Binance, ouvre le détail du paiement réussi.</p>
                  <p>2. Copie l'"Order ID" affiché.</p>
                  <p>3. Colle-le ci-dessus et touche "Vérifier le paiement".</p>
                </div>

                {error && (
                  <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100">{error}</div>
                )}

                <button
                  onClick={async () => {
                    if (!binanceOrderIdInput.trim()) { setError('Order ID requis.'); return; }
                    setVerifying(true);
                    setError('');
                    const { data: fnData, error: fnError } = await supabase.functions.invoke('binance-submit-tx', {
                      body: { orderId: payment.orderId, binanceOrderId: binanceOrderIdInput.trim() },
                    });
                    if (fnError || fnData?.error) {
                      setError(fnData?.error || (await extractFnErrorMessage(fnError)));
                    } else if (fnData?.autoConfirmed) {
                      // Vérifié automatiquement contre l'historique Binance Pay — pas besoin d'attendre l'admin.
                      if (fetchProfile) await fetchProfile(session.user.id);
                      setStep('success');
                    } else {
                      setPayment(p => ({ ...p, binanceOrderId: binanceOrderIdInput.trim() }));
                      setBinanceSubStep('submitted');
                    }
                    setVerifying(false);
                  }}
                  disabled={verifying}
                  className="w-full py-4 rounded-2xl font-bold bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all disabled:opacity-50"
                >
                  {verifying ? 'Vérification…' : 'Vérifier le paiement'}
                </button>
                <button onClick={() => setBinanceSubStep('pay')} className="w-full py-3 rounded-2xl font-bold text-gray-500 hover:text-gray-900 transition-all">
                  Retour au paiement
                </button>
              </>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <RefreshCcw size={26} className="text-primary animate-spin" />
                </div>
                <p className="text-sm text-gray-600 font-bold">Vérification en cours d'approbation…</p>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 text-left space-y-1.5 leading-relaxed">
                  <p className="font-bold">⚠️ Vérification automatique infructueuse</p>
                  <p>L'Order ID soumis n'a pas pu être validé automatiquement par l'API Binance.</p>
                  <p>Votre dépôt est en cours d'approbation par un administrateur. Si vous avez saisi un mauvais ID ou un mauvais mode de paiement, veuillez le corriger ci-dessous pour éviter que le dépôt ne soit rejeté.</p>
                </div>
                <button
                  onClick={() => setBinanceSubStep('verify')}
                  className="w-full py-3 text-xs font-bold text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-all"
                >
                  Corriger mon Order ID
                </button>
              </div>
            )}
          </div>
        )}

        {step === 'awaiting' && payment && payment.provider !== 'binance_pay' && (
          <div className="px-8 pb-8 pt-2 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <RefreshCcw size={32} className="text-primary animate-spin" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">En attente de paiement</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              {payment.provider === 'mobile_money'
                ? "Contacte le support client via le widget en bas à droite pour finaliser ton dépôt par Mobile Money. Ton solde sera crédité manuellement par un administrateur."
                : "Envoie exactement le montant ci-dessous à l'adresse indiquée. Ton solde sera crédité automatiquement après confirmation."}
              {payment.bonusPct > 0 && <> Avec le bonus, tu recevras <span className="font-black text-primary">${Number(payment.creditAmount).toFixed(2)}</span>.</>}
            </p>

            {payment.provider === 'mobile_money' ? (
              <button
                onClick={() => setStep('form')}
                className="w-full py-4 rounded-2xl font-bold bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={18} /> Retour aux options
              </button>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Montant à envoyer</p>
                  <p className="text-2xl font-black text-primary font-mono">{payment.payAmount} {String(payment.payCurrency).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-2">Adresse de dépôt</p>
                  <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-4 py-3">
                    <code className="text-xs font-mono text-gray-700 flex-grow break-all text-left">{payment.payAddress}</code>
                    <button onClick={copyAddress} className="shrink-0 p-2 rounded-lg bg-gray-900 text-white dark:text-gray-900 hover:bg-primary transition-all"><Copy size={14} /></button>
                  </div>
                  {copied && <p className="text-xs text-primary font-bold mt-2">Adresse copiée !</p>}
                </div>
              </div>
            )}
            <p className="text-xs text-gray-400">Cette page se met à jour automatiquement dès réception du paiement.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="px-8 pb-8 pt-2 text-center space-y-6">
            <CheckCircle size={72} className="text-green-500 mx-auto" />
            <h3 className="text-2xl font-black text-gray-900">Solde crédité !</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Ton paiement a été confirmé et ton solde a été mis à jour.
            </p>
            <button
              onClick={close}
              className="w-full bg-gray-900 text-white dark:text-gray-900 py-4 rounded-2xl font-bold hover:bg-primary transition-all"
            >
              Mon compte
            </button>
          </div>
        )}
      </div>
    </div>
  );
};



// ==========================================
// PAYMENT VIEW
// ==========================================


// Nettoie le HTML fourni par le fournisseur (product.description) avant tout
// rendu : liste blanche de balises de mise en forme, tout le reste est retiré
// ou dépouillé de ses attributs. Nécessaire car ce HTML vient d'un tiers —
// jamais faire confiance à du HTML externe sans le filtrer (risque XSS).
const REMOVE_ENTIRELY = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'LINK', 'META']);
const ALLOWED_TAGS = new Set(['P', 'STRONG', 'U', 'B', 'I', 'EM', 'UL', 'OL', 'LI', 'BR', 'SPAN', 'DIV']);

function sanitizeDescriptionHtml(html) {
  if (!html) return '';
  const doc = new DOMParser().parseFromString(String(html), 'text/html');

  const walk = (node) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === Node.COMMENT_NODE) { child.remove(); return; }
      if (child.nodeType !== Node.ELEMENT_NODE) return;

      if (REMOVE_ENTIRELY.has(child.tagName)) { child.remove(); return; }

      if (!ALLOWED_TAGS.has(child.tagName)) {
        // Balise non autorisée : on garde le texte, on retire juste la balise.
        child.replaceWith(...child.childNodes);
        return;
      }

      [...child.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const isEventHandler = name.startsWith('on');
        const isStyle = name === 'style';
        const styleIsSafe = isStyle && !/url\(|expression\(|javascript:/i.test(attr.value);
        if (isEventHandler || (!isStyle) || (isStyle && !styleIsSafe)) {
          child.removeAttribute(attr.name);
        }
      });

      walk(child);
    });
  };

  walk(doc.body);
  return doc.body.innerHTML;
}

// ==========================================
// PRODUCT VIEW
// ==========================================
const ProductView = ({ product, addToCart, navigate, onCartClick, onBuyNow, lang }) => {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="max-w-7xl mx-auto px-6 py-20 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">

        <div className="bg-gray-50/50 rounded-[2rem] aspect-[4/3] max-h-[360px] flex items-center justify-center border border-gray-100 overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center p-10">
            <ProductVisual product={product} iconSize={64} />
          </div>
          {product.name.includes('US') && product.category === 'email' && <div className="absolute bottom-5 right-5 bg-primary text-white dark:text-gray-900 text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm">US ACCOUNT</div>}
        </div>

        <div className="flex flex-col justify-center">
          <nav className="flex gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-5">
            <button onClick={() => navigate('')} className="hover:text-primary">HOME</button>
            <span>/</span>
            <span className="text-primary">{displayCategoryLabel(product)}</span>
          </nav>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 tracking-tight leading-snug">{cleanProductName(product.name, lang)}</h1>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-bold border border-green-100">
              <Package size={14} /> In stock ({product.stock})
            </div>
            <div className="px-3 py-1.5 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">
              {displayCategoryLabel(product)}
            </div>
          </div>

          <div className="text-3xl font-bold text-gray-900 mb-8 tracking-tight flex items-baseline gap-1">
            <span className="text-lg text-gray-400 font-bold">$</span>{product.price.toFixed(2)}
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quantity</label>
              <div className="flex items-center bg-gray-100 rounded-2xl p-1.5 border border-gray-200/50">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-200/50"><Minus size={16} /></button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1) setQuantity(Math.min(val, product.stock));
                  }}
                  className="w-20 bg-transparent text-center font-black text-xl outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <button onClick={() => quantity < product.stock && setQuantity(quantity + 1)} className="w-12 h-12 flex items-center justify-center bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-200/50"><Plus size={16} /></button>
              </div>
            </div>

            <div className="flex gap-4 w-full max-w-md">
              <button
                onClick={() => onBuyNow(product)}
                disabled={product.stock <= 0}
                className={`flex-grow h-20 rounded-[2rem] font-black text-2xl transition-all shadow-2xl uppercase tracking-widest flex items-center justify-center gap-4 ${product.stock > 0 ? 'bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/30 hover:scale-[1.02]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                {product.stock > 0 ? 'Buy now' : 'Out of stock'}
              </button>
              <button
                onClick={() => {
                  addToCart(product, quantity);
                  onCartClick();
                }}
                disabled={product.stock <= 0}
                title="Add to cart"
                className={`w-20 h-20 shrink-0 rounded-[2rem] flex items-center justify-center transition-all border-2 ${product.stock <= 0 ? 'bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed' : 'bg-white text-gray-500 border-gray-200 hover:border-primary hover:text-primary'}`}
              >
                <ShoppingCart size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs / Details */}
      <div className="border-t border-gray-100 pt-20">
        <div className="flex gap-10 border-b border-gray-100 mb-12 overflow-x-auto pb-4">
          {['Information', 'Warranty policy'].map((tab, i) => (
            <button key={tab} className={`text-sm font-black uppercase tracking-[0.2em] pb-4 relative whitespace-nowrap transition-colors ${i === 0 ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
              {tab}
              {i === 0 && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full"></div>}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Information</h3>
              <div className="divide-y divide-gray-200/70">
                {product.details?.info?.split(' | ').map((line, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                    <span className="text-gray-500 font-medium">{line.split(' : ')[0]}</span>
                    <span className="text-gray-900 font-bold">{line.split(' : ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4"><Info size={14} className="text-primary" /> Additional Description</h4>
              {product.description ? (
                <div
                  className="text-gray-600 leading-relaxed text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:mb-1.5 [&_p]:mb-3 [&_strong]:font-bold [&_strong]:text-gray-900 [&_u]:underline"
                  dangerouslySetInnerHTML={{ __html: sanitizeDescriptionHtml(product.description) }}
                />
              ) : (
                <p className="text-gray-600 leading-relaxed italic text-sm">{product.details?.note}</p>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
              <h4 className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4"><ShieldAlert size={14} className="text-primary" /> Terms of Service</h4>
              <div className="text-xs text-gray-500 leading-relaxed space-y-3">
                {product.details?.terms?.split('. ').map((t, i) => <p key={i}>• {t}.</p>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// CART VIEW
// ==========================================

// Panier en panneau coulissant (drawer), ouvert depuis n'importe quelle page
// via l'icône panier de la navbar — remplace l'ancienne page dédiée.
const CartCheckoutModal = ({ open, onClose, cart, cartTotal, session, profile, navigate, clearCart, fetchProfile, fetchProducts, fetchAllOrders, setRechargeSuggestedAmount }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!open) return null;

  const balance = profile?.balance || 0;
  const hasEnoughBalance = balance >= cartTotal;

  const handleBalancePayment = async () => {
    if (!session || !profile) return;
    if (profile.is_suspended) { setErrorMessage("Ton compte est suspendu. Contacte le support."); return; }
    setIsProcessing(true);
    setErrorMessage('');

    try {
      if (balance < cartTotal) throw new Error("Insufficient balance.");

      for (const item of cart) {
        if (item.is_dropship) {
          const { data: dsOrder, error: dsErr } = await supabase.from('orders').insert({
            user_id: session.user.id,
            buyer_email: session.user.email,
            product_id: item.id,
            product_name: item.name,
            quantity: item.quantity,
            total_price: item.price * item.quantity,
            status: 'processing',
            supplier: 'ytseller',
            created_at: new Date().toISOString()
          }).select('id').single();

          if (dsErr) throw dsErr;
          if (!dsOrder) throw new Error("The order could not be created.");

          supabase.functions.invoke('dropship-place-order', { body: { orderId: dsOrder.id } })
            .catch(e => console.error('dropship-place-order invoke:', e));

          continue;
        }

        const { data: stockRows, error: stockErr } = await supabase
          .from('account_stock')
          .select('id, credentials')
          .eq('product_id', item.id)
          .eq('is_delivered', false)
          .limit(item.quantity);

        if (stockErr) throw new Error("Error retrieving stock.");
        if (!stockRows || stockRows.length < item.quantity) {
          throw new Error(`No more accounts available in stock for ${item.name}.`);
        }

        const deliveredCreds = stockRows.map(r => r.credentials).join('\n');
        const stockIds = stockRows.map(r => r.id);

        const { data: orderData, error: orderInsertErr } = await supabase.from('orders').insert({
          user_id: session.user.id,
          buyer_email: session.user.email,
          product_id: item.id,
          product_name: item.name,
          quantity: item.quantity,
          total_price: item.price * item.quantity,
          status: 'confirmed',
          credentials: deliveredCreds,
          data: deliveredCreds,
          created_at: new Date().toISOString()
        }).select('id').single();

        if (orderInsertErr) throw orderInsertErr;
        if (!orderData) throw new Error("Order created but ID could not be retrieved.");

        const { error: stockUpdateErr } = await supabase.from('account_stock').update({
          is_delivered: true,
          order_id: String(orderData.id),
          delivered_to: session.user.id,
        }).in('id', stockIds);

        if (stockUpdateErr) console.error("Error updating stock_account:", stockUpdateErr);

        // Envoyer les credentials par email si le client a opté pour cette option
        if (profile?.send_email_on_delivery) {
          supabase.functions.invoke('send-delivery-email', { body: { orderId: orderData.id } })
            .catch(e => console.error('send-delivery-email error:', e));
        }
      }

      const { error: balanceErr } = await supabase
        .from('profiles')
        .update({ balance: balance - cartTotal })
        .eq('id', session.user.id);
      if (balanceErr) throw balanceErr;

      setPurchaseSuccess(true);
      await fetchProfile(session.user.id);
      await fetchProducts();
      await fetchAllOrders();

      setTimeout(() => {
        clearCart();
        setPurchaseSuccess(false);
        onClose();
        navigate('dashboard');
      }, 1500);

    } catch (err) {
      console.error("Payment Error:", err);
      setErrorMessage(err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans" onClick={(e) => { if (e.target === e.currentTarget && !isProcessing) onClose(); }}>
      <div className="bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between px-8 pt-8 pb-2">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">Checkout</h2>
          <button onClick={onClose} disabled={isProcessing} aria-label="Close" className="w-9 h-9 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-900 dark:hover:text-white transition-all disabled:opacity-40"><X size={18} /></button>
        </div>

        <div className="px-8 pb-8 pt-4 space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment method</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl border-2 border-primary bg-primary/5 flex flex-col">
                <span className="text-[9px] font-black uppercase text-primary tracking-widest mb-1">Selected</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">Balance (${balance.toFixed(2)})</span>
              </div>
              <button onClick={() => { onClose(); navigate('recharge'); }} className="p-3 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-all text-left">
                <span className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-1"><Plus size={14} /> Top up</span>
              </button>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-5 space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</span>
              <span className="w-5 h-5 rounded-full bg-gray-900 dark:bg-primary text-white dark:text-gray-900 text-[10px] font-black flex items-center justify-center">{cart.length}</span>
            </div>
            {cart.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white dark:bg-gray-900 rounded-xl flex items-center justify-center shrink-0"><ProductVisual product={item} iconSize={16} /></div>
                <div className="flex-grow min-w-0">
                  <div className="text-sm font-bold text-gray-900 dark:text-white truncate">{cleanProductName(item.name)}</div>
                  <div className="text-xs text-gray-400">${item.price.toFixed(2)} × {item.quantity}</div>
                </div>
                <div className="text-sm font-black text-primary font-mono shrink-0">${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            ))}
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-800" />

          <div className="flex items-center justify-between">
            <span className="text-base font-black text-gray-900 dark:text-white">Total</span>
            <span className="text-xl font-black text-gray-900 dark:text-white">${cartTotal.toFixed(2)}</span>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-bold border border-red-100">{errorMessage}</div>
          )}

          {!hasEnoughBalance && !purchaseSuccess ? (
            <button
              onClick={() => {
                const missing = Math.round((cartTotal - balance) * 100) / 100;
                setRechargeSuggestedAmount(missing > 0 ? missing : null);
                onClose(); navigate('recharge');
              }}
              className="w-full py-5 rounded-2xl font-bold text-lg bg-primary text-white dark:text-gray-900 hover:bg-primaryDark transition-all shadow-xl flex items-center justify-center gap-3"
            >
              <Plus size={20} /> Top up ${Math.max(0, Math.round((cartTotal - balance) * 100) / 100).toFixed(2)}
            </button>
          ) : (
            <button
              onClick={handleBalancePayment}
              disabled={isProcessing || purchaseSuccess || cart.length === 0}
              className={`w-full py-5 rounded-2xl font-bold text-lg transition-all shadow-xl flex items-center justify-center gap-3 ${purchaseSuccess ? 'bg-green-500 text-white dark:text-gray-900' : 'bg-primary text-white dark:text-gray-900 hover:bg-primaryDark shadow-primary/20'}`}
            >
              {isProcessing ? <RefreshCcw size={20} className="animate-spin" /> : purchaseSuccess ? <CheckCircle size={20} /> : <Zap size={20} />}
              {isProcessing ? 'Processing...' : purchaseSuccess ? 'Delivered!' : 'Pay & receive'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

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

// ==========================================
// AUTH VIEW
// ==========================================

// Traduit les messages d'erreur techniques de Supabase en messages clairs.
const friendlyAuthError = (raw = '') => {
  const m = raw.toLowerCase();
  if (m.includes('invalid login credentials')) return "Email ou mot de passe incorrect.";
  if (m.includes('email not confirmed')) return "Ton email n'est pas encore confirmé. Vérifie ta boîte mail (et les spams).";
  if (m.includes('user already registered') || m.includes('already been registered')) return "Un compte existe déjà avec cet email. Connecte-toi.";
  if (m.includes('password should be at least')) return "Le mot de passe doit contenir au moins 6 caractères.";
  if (m.includes('unable to validate email') || m.includes('invalid email')) return "Adresse email invalide.";
  if (m.includes('rate limit') || m.includes('too many')) return "Trop de tentatives. Patiente une minute avant de réessayer.";
  // Panne d'envoi d'email côté serveur (SMTP non configuré ou en échec) —
  // ne pas laisser le message technique brut de Supabase s'afficher.
  if (m.includes('error sending confirmation') || m.includes('error sending recovery') || m.includes('sending email')) {
    return "Impossible d'envoyer l'email pour le moment. Réessaie dans un instant ou contacte le support si le problème persiste.";
  }
  return raw || "Une erreur est survenue. Réessaie.";
};

// Écran de définition d'un nouveau mot de passe, atteint via le lien de
// réinitialisation reçu par email (Supabase a créé une session temporaire).
const ResetPasswordView = ({ navigate, lang }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) { setError(lang === 'fr' ? 'Le mot de passe doit contenir au moins 6 caractères.' : 'Password must be at least 6 characters long.'); return; }
    if (newPassword !== confirm) { setError(lang === 'fr' ? 'Les deux mots de passe ne correspondent pas.' : 'Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPassword });
      if (err) throw err;
      setDone(true);
      // Nettoie les jetons de récupération de l'URL et bascule sur le catalogue.
      window.history.replaceState(null, '', window.location.pathname);
      setTimeout(() => navigate('shop'), 1800);
    } catch (err) {
      setError(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none font-medium text-sm transition-all";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 font-sans">
      <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-3xl shadow-[0_24px_70px_-24px_rgba(0,0,0,0.12)] border border-gray-100">
        <div className="w-12 h-12 mx-auto mb-6 flex items-center justify-center">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        {done ? (
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-1">{lang === 'fr' ? 'Mot de passe mis à jour' : 'Password updated'}</h2>
            <p className="text-gray-400 text-sm">{lang === 'fr' ? 'Redirection en cours…' : 'Redirecting…'}</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900 text-center mb-1">{lang === 'fr' ? 'Nouveau mot de passe' : 'New password'}</h2>
            <p className="text-gray-400 text-sm text-center mb-6">{lang === 'fr' ? 'Choisis un nouveau mot de passe pour ton compte.' : 'Choose a new password for your account.'}</p>
            <form onSubmit={submit} className="space-y-3.5">
              <div className="relative">
                <input type={showNewPw ? "text" : "password"} required value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={lang === 'fr' ? 'Nouveau mot de passe' : 'New password'} className={inputCls + " pr-12"} />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="relative">
                <input type={showConfirmPw ? "text" : "password"} required value={confirm} onChange={e => setConfirm(e.target.value)} placeholder={lang === 'fr' ? 'Confirme le mot de passe' : 'Confirm password'} className={inputCls + " pr-12"} />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2"><AlertTriangle size={14} /> {error}</div>}
              <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 !mt-5">
                {loading && <RefreshCcw size={15} className="animate-spin" />} {lang === 'fr' ? 'Mettre à jour' : 'Update'}
              </button>
            </form>
            <button onClick={() => navigate('auth')} className="w-full text-center text-xs text-gray-400 font-bold hover:text-primary transition-colors mt-5">{lang === 'fr' ? '← Retour à la connexion' : '← Back to login'}</button>
          </>
        )}
      </div>
    </div>
  );
};

const AuthView = ({ navigate, lang }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  // Écran "confirme ton email" après inscription quand la confirmation est requise.
  const [pendingConfirmEmail, setPendingConfirmEmail] = useState("");

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // La connexion réussie déclenche onAuthStateChange → redirection propre.
        navigate('shop');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { first_name: firstName, last_name: lastName, display_name: username },
          },
        });
        if (error) throw error;
        // Si une session est immédiatement créée, la confirmation email est
        // désactivée côté projet → l'utilisateur est connecté, on entre.
        if (data?.session) {
          navigate('shop');
        } else {
          // Sinon, un email de confirmation a été envoyé : on affiche un écran
          // dédié au lieu d'une alerte, et on NE redirige PAS (pas encore connecté).
          setPendingConfirmEmail(email);
        }
      }
    } catch (err) {
      setErrorMessage(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: pendingConfirmEmail || email,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) throw error;
      setInfoMessage(lang === 'fr' ? "Email de confirmation renvoyé. Vérifie ta boîte mail." : "Confirmation email sent. Check your inbox.");
    } catch (err) {
      setErrorMessage(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setErrorMessage(lang === 'fr' ? "Entre d'abord ton adresse email pour réinitialiser le mot de passe." : "Please enter your email address first to reset your password.");
      return;
    }
    setLoading(true);
    setErrorMessage("");
    setInfoMessage("");
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setInfoMessage(lang === 'fr' ? "Un email de réinitialisation a été envoyé. Vérifie ta boîte mail." : "A reset email has been sent. Check your inbox.");
    } catch (err) {
      setErrorMessage(friendlyAuthError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setErrorMessage(friendlyAuthError(error.message));
  };

  const inputCls = "w-full h-12 px-4 rounded-xl bg-gray-50 border border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary/30 outline-none font-medium text-sm transition-all";

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-16 px-6 font-sans">
      <div className="w-full max-w-[400px] bg-white p-8 md:p-10 rounded-3xl shadow-[0_24px_70px_-24px_rgba(0,0,0,0.12)] border border-gray-100">

        {pendingConfirmEmail ? (
          /* Écran de confirmation d'email (inscription réussie, en attente de vérification) */
          <div className="text-center animate-in fade-in zoom-in duration-300">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Mail size={28} className="text-primary" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{lang === 'fr' ? 'Confirme ton email' : 'Confirm your email'}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-1">
              {lang === 'fr' ? 'Un lien de confirmation a été envoyé à' : 'A confirmation link has been sent to'}<br />
              <span className="font-bold text-gray-900">{pendingConfirmEmail}</span>
            </p>
            <p className="text-gray-400 text-xs mb-6">{lang === 'fr' ? 'Clique dessus pour activer ton compte (pense aux spams).' : 'Click on it to activate your account (check your spam folder).'}</p>

            {infoMessage && <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 mb-4">{infoMessage}</div>}
            {errorMessage && <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 mb-4 flex items-center justify-center gap-2"><AlertTriangle size={14} /> {errorMessage}</div>}

            <button onClick={handleResendConfirmation} disabled={loading} className="w-full h-12 bg-gray-900 text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50 mb-3">
              {loading && <RefreshCcw size={15} className="animate-spin" />} {lang === 'fr' ? 'Renvoyer l\'email' : 'Resend email'}
            </button>
            <button onClick={() => { setPendingConfirmEmail(''); setIsLogin(true); setErrorMessage(''); setInfoMessage(''); }} className="text-xs text-gray-400 font-bold hover:text-primary transition-colors">
              {lang === 'fr' ? '← Retour à la connexion' : '← Back to login'}
            </button>
          </div>
        ) : (
        <>
          {/* En-tête */}
          <div className="text-center mb-7">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{isLogin ? (lang === 'fr' ? 'Content de te revoir' : 'Welcome back') : (lang === 'fr' ? 'Crée ton compte' : 'Create an account')}</h2>
            <p className="text-gray-400 text-sm mt-1">{isLogin ? (lang === 'fr' ? 'Connecte-toi pour continuer.' : 'Log in to continue.') : (lang === 'fr' ? 'Rejoins la marketplace n°1 de comptes certifiés.' : 'Join the #1 marketplace for certified accounts.')}</p>
          </div>

          {/* Google — toujours visible, en haut */}
          <button
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-50 hover:border-gray-300 transition-all group mb-5"
          >
            <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
            <span className="text-gray-700 font-bold text-sm">{lang === 'fr' ? 'Continuer avec Google' : 'Continue with Google'}</span>
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-grow h-px bg-gray-100" />
            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{lang === 'fr' ? 'ou' : 'or'}</span>
            <div className="flex-grow h-px bg-gray-100" />
          </div>

          <form className="space-y-3.5" onSubmit={handleAuth}>
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" required value={firstName} onChange={e => setFirstName(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'Prénom' : 'First Name'} />
                  <input type="text" required value={lastName} onChange={e => setLastName(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'Nom' : 'Last Name'} />
                </div>
                <input type="text" required value={username} onChange={e => setUsername(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'Pseudo' : 'Username'} />
              </>
            )}
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className={inputCls} placeholder={lang === 'fr' ? 'ton@email.com' : 'your@email.com'} />
            <div className="relative">
              <input type={showPw ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)} className={inputCls + " pr-12"} placeholder={lang === 'fr' ? 'Mot de passe' : 'Password'} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {isLogin && (
              <div className="flex justify-end">
                <button type="button" onClick={handleResetPassword} className="text-xs font-bold text-gray-400 hover:text-primary transition-colors">
                  {lang === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                </button>
              </div>
            )}

            {errorMessage && (
              <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold border border-red-100 flex items-center gap-2">
                <AlertTriangle size={14} /> {errorMessage}
              </div>
            )}
            {infoMessage && (
              <div className="bg-green-50 text-green-600 p-3 rounded-xl text-xs font-bold border border-green-100 flex items-center gap-2">
                <CheckCircle size={14} /> {infoMessage}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full h-12 bg-primary text-white dark:text-gray-900 rounded-xl font-bold text-sm hover:bg-primaryDark transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 !mt-5">
              {loading && <RefreshCcw size={15} className="animate-spin" />}
              {isLogin ? (lang === 'fr' ? 'Se connecter' : 'Log in') : (lang === 'fr' ? "S'inscrire" : 'Sign up')}
            </button>
          </form>

          <div className="text-center mt-6 text-sm text-gray-400">
            {isLogin ? (lang === 'fr' ? "Pas encore de compte ?" : "Don't have an account?") : (lang === 'fr' ? "Déjà un compte ?" : "Already have an account?")}{' '}
            <button onClick={() => { setIsLogin(!isLogin); setErrorMessage(''); setInfoMessage(''); }} className="font-bold text-primary hover:underline">
              {isLogin ? (lang === 'fr' ? "S'inscrire" : "Sign up") : (lang === 'fr' ? "Se connecter" : "Log in")}
            </button>
          </div>
        </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// FOOTER
// ==========================================

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

const TRANSLATIONS = {
  fr: {
    // Navbar
    products: "Produits",
    sms: "SMS",
    api: "API",
    myOrders: "Mes commandes",
    balance: "Mon Solde",
    settings: "Paramètres",
    logout: "Se déconnecter",
    login: "Connexion",
    admin: "Admin",
    
    // Auth / General
    backToSite: "Retour au site",
    
    // Home View
    noProducts: "Aucun produit trouvé.",
    sortBy: "Trier par",
    searchPlaceholder: "Rechercher un produit...",
    priceAsc: "Prix : Croissant",
    priceDesc: "Prix : Décroissant",
    nameAsc: "Nom : A-Z",
    buyNow: "Acheter",
    addToCart: "Ajouter au panier",
    inStock: "En stock",
    outOfStock: "Rupture",
    
    // My Orders View
    orderCode: "Code de commande",
    productsBought: "Produits",
    status: "Statut",
    total: "Total",
    actions: "Actions",
    noOrders: "Aucune commande trouvée.",
    completed: "Livré",
    processing: "En cours",
    pending: "En attente",
    failed: "Échoué",
    download: "Télécharger",
    view: "Afficher",
    emailDeliveryOptIn: "Envoyer aussi les comptes à mon e-mail à partir de maintenant.",
    viewTransactions: "Voir l'historique des transactions",
    transferBtn: "Transférer",
    topUpBtn: "Recharger",
    currentBalance: "Solde actuel",
    
    // Recharge View
    topUpAccount: "Recharger le compte",
    choosePayment: "Choisissez un moyen de paiement",
    payWithCrypto: "Payer en Crypto",
    amountToRecharge: "Montant à recharger ($)",
    cryptoAmountNotice: "Le montant exact doit être envoyé pour valider le crédit.",
    
    // Settings
    profileSettings: "Paramètres du profil",
    displayName: "Nom d'affichage",
    firstName: "Prénom",
    lastName: "Nom",
    saveBtn: "Sauvegarder",
  },
  en: {
    // Navbar
    products: "Products",
    sms: "SMS",
    api: "API",
    myOrders: "My orders",
    balance: "My Balance",
    settings: "Settings",
    logout: "Log out",
    login: "Log In",
    admin: "Admin",
    
    // Auth / General
    backToSite: "Back to site",
    
    // Home View
    noProducts: "No products found.",
    sortBy: "Sort by",
    searchPlaceholder: "Search products...",
    priceAsc: "Price: Low to High",
    priceDesc: "Price: High to Low",
    nameAsc: "Name: A-Z",
    buyNow: "Buy now",
    addToCart: "Add to cart",
    inStock: "In stock",
    outOfStock: "Out of stock",
    
    // My Orders View
    orderCode: "Order Code",
    productsBought: "Products",
    status: "Status",
    total: "Total",
    actions: "Actions",
    noOrders: "No orders found.",
    completed: "Completed",
    processing: "Processing",
    pending: "Pending",
    failed: "Failed",
    download: "Download",
    view: "View",
    emailDeliveryOptIn: "Also send accounts to my email from now on.",
    viewTransactions: "View transaction history",
    transferBtn: "Transfer",
    topUpBtn: "Top up",
    currentBalance: "Current Balance",
    
    // Recharge View
    topUpAccount: "Top up account",
    choosePayment: "Choose a payment method",
    payWithCrypto: "Pay with Crypto",
    amountToRecharge: "Amount to top up ($)",
    cryptoAmountNotice: "The exact amount must be sent to validate credit.",
    
    // Settings
    profileSettings: "Profile Settings",
    displayName: "Display Name",
    firstName: "First Name",
    lastName: "Last Name",
    saveBtn: "Save Settings",
  }
};

// ==========================================
// SUPPORT CHAT — widget client (bouton flottant + panneau temps réel)
// ==========================================
const SupportChatWidget = ({ session, profile }) => {
  const [open, setOpen] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const scrollRef = React.useRef(null);

  const userId = session?.user?.id;

  // Charge le ticket existant + ses messages, et l'état "non lu".
  const loadTicket = async () => {
    if (!userId) return;
    const { data: tk } = await supabase.from('support_tickets')
      .select('*').eq('user_id', userId).order('last_message_at', { ascending: false }).limit(1).maybeSingle();
    if (tk) {
      setTicket(tk);
      setHasUnread(!!tk.user_unread);
      const { data: msgs } = await supabase.from('support_messages')
        .select('*').eq('ticket_id', tk.id).order('created_at', { ascending: true });
      setMessages(msgs || []);
    }
  };

  useEffect(() => { if (userId) loadTicket(); }, [userId]);

  // Abonnement temps réel aux nouveaux messages de ce client.
  useEffect(() => {
    if (!userId || !supabase) return;
    const channel = supabase.channel(`support-user-${userId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'support_messages', filter: `user_id=eq.${userId}` },
        (payload) => {
          setMessages(prev => prev.some(m => m.id === payload.new.id) ? prev : [...prev, payload.new]);
          if (payload.new.sender === 'admin' && !open) setHasUnread(true);
        })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId, open]);

  // Auto-scroll en bas à chaque nouveau message / ouverture.
  useEffect(() => { if (open && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, open]);

  // À l'ouverture : marque comme lu côté client.
  const openPanel = async () => {
    setOpen(true);
    setHasUnread(false);
    if (ticket?.user_unread) {
      await supabase.from('support_tickets').update({ user_unread: false }).eq('id', ticket.id);
    }
  };

  useEffect(() => {
    const handleOpen = () => openPanel();
    window.addEventListener('open-support-chat', handleOpen);
    return () => window.removeEventListener('open-support-chat', handleOpen);
  }, [ticket]);

  const send = async () => {
    const body = input.trim();
    if (!body || sending) return;
    setSending(true);
    let tk = ticket;
    if (!tk) {
      const { data: created, error } = await supabase.from('support_tickets').insert({
        user_id: userId, user_email: session.user.email, subject: 'Support', status: 'open',
        last_sender: 'user', admin_unread: true, user_unread: false, last_message_at: new Date().toISOString(),
      }).select().single();
      if (error) { setSending(false); alert('Erreur : ' + error.message); return; }
      tk = created; setTicket(created);
    }
    const { error: msgErr } = await supabase.from('support_messages').insert({
      ticket_id: tk.id, user_id: userId, sender: 'user', body,
    });
    if (msgErr) { setSending(false); alert('Erreur : ' + msgErr.message); return; }
    await supabase.from('support_tickets').update({
      last_message_at: new Date().toISOString(), last_sender: 'user', admin_unread: true, status: 'open',
    }).eq('id', tk.id);
    setInput('');
    setSending(false);
  };

  if (!session) return null;

  return (
    <>
      <button
        onClick={() => (open ? setOpen(false) : openPanel())}
        className="fixed bottom-6 right-6 z-[250] w-14 h-14 rounded-full bg-primary text-white dark:text-gray-900 shadow-2xl shadow-primary/30 flex items-center justify-center hover:bg-primaryDark transition-all"
        aria-label="Support"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
        {!open && hasUnread && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[250] w-[92vw] max-w-sm h-[70vh] max-h-[560px] bg-white dark:bg-gray-900 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
          <div className="bg-gray-900 text-white p-5 shrink-0">
            <h3 className="font-bold flex items-center gap-2"><Headphones size={18} /> Support AgedGmailYT</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">On te répond au plus vite. Explique ton souci ici.</p>
          </div>

          <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {messages.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-8">Aucun message pour l'instant. Écris-nous ci-dessous !</p>
            )}
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${m.sender === 'user' ? 'bg-primary text-white dark:text-gray-900 rounded-br-sm' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-bl-sm'}`}>
                  {m.body}
                  <div className={`text-[9px] mt-1 ${m.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`}>{new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') send(); }}
              placeholder="Écris ton message…"
              className="flex-grow px-4 py-2.5 rounded-full bg-gray-50 dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button onClick={send} disabled={sending || !input.trim()} className="w-10 h-10 shrink-0 rounded-full bg-primary text-white dark:text-gray-900 flex items-center justify-center hover:bg-primaryDark transition-all disabled:opacity-40">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

function App() {
  const [lang, setLang] = useState(() => localStorage.getItem('agedgmail_lang') || 'fr');
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (e.matches) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    };
    
    handleChange(mediaQuery);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('agedgmail_lang', lang);
  }, [lang]);

  const t = (key) => TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;

  const [products, setProducts] = useState([]);

  const [currentView, setCurrentView] = useState(() => {
    const rawHash = window.location.hash;
    if (rawHash.includes('type=recovery') || rawHash.includes('access_token=') || rawHash.includes('error=')) {
      return 'shop'; // Let the effect handle the OAuth hash
    }
    const path = window.location.pathname.replace(/^\/+/, '');
    if (path === 'myorders') return 'dashboard';
    if (path === 'sms') return 'shop';
    return path || 'landing';
  });
  const [selectedProduct, setSelectedProduct] = useState(() => {
    const saved = localStorage.getItem('agedgmail_product');
    try { return saved ? JSON.parse(saved) : null; } catch { return null; }
  });
  const [activeCategory, setActiveCategory] = useState(() => localStorage.getItem('agedgmail_category') || 'all');
  const [activeGroup, setActiveGroup] = useState(() => localStorage.getItem('agedgmail_group') || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price_asc');
  // Le panier ne survit jamais à un rafraîchissement de page (voulu) : il vit
  // uniquement en mémoire pour la session en cours, jamais dans localStorage.
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [quickOrderProduct, setQuickOrderProduct] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [rechargeSuggestedAmount, setRechargeSuggestedAmount] = useState(null);
  const [resumeOrder, setResumeOrder] = useState(null); // commande Binance Pay 'pending' à reprendre
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [actionStatus, setActionStatus] = useState(null);
  // États de chargement : on affiche des squelettes tant que la base n'a pas
  // répondu (init à true, passés à false à la fin de chaque fetch).
  const [productsLoading, setProductsLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [adminDataLoading, setAdminDataLoading] = useState(true);



  // Real-time Profile Updates (Balance, etc.)
  useEffect(() => {
    if (!session || !supabase) return;

    const profileChannel = supabase
      .channel(`profile-updates-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload) => {
          setProfile(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [session]);



  // Nettoie les recharges Binance Pay restées 'pending' au-delà de leur
  // délai (client qui a fermé la fenêtre sans payer) — l'update déclenche
  // le realtime ci-dessous, donc l'UI (badge "Expiré") se met à jour seule.
  useEffect(() => {
    if (!session || !supabase) return;
    supabase.functions.invoke('binance-expire-stale', { body: {} }).catch(() => {});
  }, [session]);

  // Real-time Orders — Client sees their own orders update instantly (e.g. recharge confirmed)
  useEffect(() => {
    if (!session || !supabase) return;

    const myOrdersChannel = supabase
      .channel(`my-orders-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `user_id=eq.${session.user.id}`,
        },
        async () => {
          // Refresh personal orders
          const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });
          if (orderData) setOrders(orderData);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(myOrdersChannel);
    };
  }, [session]);



  useEffect(() => {
    if (selectedProduct) localStorage.setItem('agedgmail_product', JSON.stringify(selectedProduct));
    else localStorage.removeItem('agedgmail_product');
  }, [selectedProduct]);

  useEffect(() => {
    localStorage.setItem('agedgmail_category', activeCategory);
  }, [activeCategory]);

  useEffect(() => {
    localStorage.setItem('agedgmail_group', activeGroup);
  }, [activeGroup]);

  const fetchProducts = async () => {
    if (!supabase) {
      // Fallback local pour la consultation sans .env
      setProducts(PRODUCTS_RAW.map(p => ({ ...p, stock: 10, details: getProductDetails(p) })));
      setProductsLoading(false);
      return;
    }
    // 1. Fetch products
    const { data: productsData, error: pErr } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (pErr || !productsData) { setProductsLoading(false); return; }

    // 2. Compter le stock local disponible en UNE seule requête (au lieu d'une
    // requête par produit) : on récupère les product_id non livrés, puis on
    // agrège les comptes côté client.
    const localStockIds = productsData.filter(p => !p.is_dropship).map(p => p.id);
    const stockCountByProduct = new Map();
    if (localStockIds.length > 0) {
      const { data: stockRows } = await supabase
        .from('account_stock')
        .select('product_id')
        .in('product_id', localStockIds)
        .eq('is_delivered', false);
      (stockRows || []).forEach(r => stockCountByProduct.set(r.product_id, (stockCountByProduct.get(r.product_id) || 0) + 1));
    }

    const updatedProducts = productsData.map(p => ({
      ...p,
      // Produit reseller : la dispo vient du fournisseur (synchro périodique).
      // Produit à stock local : compté ci-dessus.
      stock: p.is_dropship ? (p.supplier_stock || 0) : (stockCountByProduct.get(p.id) || 0),
      details: getProductDetails(p),
    }));

    setProducts(updatedProducts);
    setProductsLoading(false);
  };

  const fetchAllOrders = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setAllOrders(data);
    setAdminDataLoading(false);
  };

  const fetchUsers = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (data) setAllUsers(data);
  };

  const fetchProfile = async (userId) => {
    if (!supabase) return;
    const { data: profileData, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

    const { data: { session } } = await supabase.auth.getSession();
    const metadata = session?.user?.user_metadata;

    if (profileData) {
      setProfile(profileData);
      const { data: orderData } = await supabase.from('orders').select('*').eq('user_id', userId).order('created_at', { ascending: false });
      if (orderData) setOrders(orderData);
      setOrdersLoading(false);
    } else if (session) {
      // Create new profile with Google metadata if it's the first login
      const newProfile = {
        id: userId,
        email: session.user.email,
        display_name: metadata?.display_name || metadata?.full_name?.split(' ')[0]?.toLowerCase() || session.user.email?.split('@')[0],
        first_name: metadata?.first_name || metadata?.given_name || metadata?.full_name?.split(' ')[0] || "",
        last_name: metadata?.last_name || metadata?.family_name || metadata?.full_name?.split(' ').slice(1).join(' ') || "",
        avatar_url: metadata?.avatar_url || "",
        balance: 0.00,
        two_factor_enabled: false,
        is_suspended: false,
        created_at: new Date().toISOString()
      };

      // Persistence in DB
      const { error: insertError } = await supabase.from('profiles').insert([newProfile]);
      if (!insertError) {
        setProfile(newProfile);
        setOrders([]);
      } else {
        // Fallback if insert fails (RLS or other)
        setProfile(newProfile);
      }
      setOrdersLoading(false);
    }
    setOrdersLoading(false);
  };

  // Groupes de premier niveau (barre du haut), dérivés des produits réellement
  // en catalogue (miroir YTSeller), dans l'ordre GROUP_ORDER, comptés puis filtrés à ceux non-vides.
  const productGroups = (() => {
    const counts = new Map();
    products.forEach(p => { const g = categoryVisual(p); counts.set(g, (counts.get(g) || 0) + 1); });
    return GROUP_ORDER.filter(id => counts.get(id) > 0).map(id => ({ id, name: GROUP_LABELS[id], count: counts.get(id) }));
  })();

  // Sous-catégories (barre du bas) : catégories réelles du groupe actif.
  const productSubCategories = (() => {
    if (activeGroup === 'all') return [];
    const counts = new Map();
    products.forEach(p => {
      if (categoryVisual(p) !== activeGroup) return;
      counts.set(p.category, (counts.get(p.category) || 0) + 1);
    });
    // Le filtre reste basé sur la vraie catégorie (id), seul le libellé
    // affiché change : une catégorie fourre-tout comme "Accounts-Telegram"
    // n'a aucun sens listée sous l'onglet Gmail, on affiche le nom du groupe.
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([id]) => ({
      id,
      name: JUNK_CATEGORIES.some(j => String(id).toLowerCase() === j || String(id).toLowerCase().includes(j))
        ? GROUP_LABELS[activeGroup]
        : categoryName(id),
    }));
  })();

  const filteredProducts = products
    .filter(p => activeGroup === 'all' || categoryVisual(p) === activeGroup)
    .filter(p => activeCategory === 'all' || p.category === activeCategory)
    .filter(p => !searchTerm.trim() || p.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
      return a.price - b.price;
    });
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const addToCart = (product, quantity = 1) => {
    setCart(prevCart => {
      const idx = prevCart.findIndex(item => item.id === product.id);
      if (idx >= 0) { const nc = [...prevCart]; nc[idx].quantity += quantity; return nc; }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const updateCartQuantity = (id, q) => { if (q < 1) return; setCart(pc => pc.map(i => i.id === id ? { ...i, quantity: q } : i)); };
  const removeFromCart = (id) => setCart(pc => pc.filter(i => i.id !== id));
  const clearCart = () => setCart([]);
  const navigate = (v) => {
    if (v === 'landing') v = '';
    const path = v === 'dashboard' ? 'myorders' : v;
    window.history.pushState(null, '', `/${path}`);
    setCurrentView(v || 'landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (!supabase) {
      fetchProducts(); // Will use local fallback
      return;
    }

    fetchProducts();
    fetchAllOrders();
    fetchUsers();

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (initialSession) fetchProfile(initialSession.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (currentSession) {
        fetchProfile(currentSession.user.id);
        // Lien de réinitialisation cliqué depuis l'email : Supabase crée une
        // session temporaire et émet PASSWORD_RECOVERY. On force l'écran de
        // saisie du nouveau mot de passe — fiable quel que soit le format du
        // lien (hash #type=recovery en flow implicite, ?code= en PKCE) et le
        // timing du nettoyage d'URL par Supabase. C'est LA correction du bug
        // "le lien de reset renvoie vers la landing".
        if (event === 'PASSWORD_RECOVERY') {
          navigate('reset-password');
          return;
        }
        // Redirection après connexion : si le hash est vide (cas d'un retour
        // OAuth Google), 'landing', ou 'auth', on les envoie vers le shop.
        if (event === 'SIGNED_IN') {
          const h = window.location.hash.replace('#', '');
          if (!h || h === 'auth' || h === 'landing') {
            navigate('shop');
          }
        }
      } else {
        setProfile(null);
        setOrders([]);
        // Déconnexion explicite : vide le panier pour que la personne suivante
        // sur cet appareil ne voie jamais le panier/le solde du client précédent.
        if (event === 'SIGNED_OUT') {
          setCart([]);
          setCartOpen(false);
          // Si on était sur une vue qui exige une session (dashboard, réglages,
          // recharge, admin), on repart proprement sur le catalogue au lieu de
          // laisser un écran vide (les vues protégées ne rendent rien sans session).
          const protectedViews = ['dashboard', 'settings', 'recharge', 'admin'];
          if (protectedViews.includes(window.location.hash.replace('#', ''))) {
            navigate('shop');
          }
        }
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Real-time Orders — Admin sees all new orders instantly
  useEffect(() => {
    if (!supabase) return;

    const ordersChannel = supabase
      .channel('all-orders-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          fetchAllOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.replace(/^\/+/, '');
      if (path === 'myorders') {
        setCurrentView('dashboard');
      } else if (path === 'sms') {
        setCurrentView('sms');
      } else {
        setCurrentView(path || 'landing');
      }
    };

    window.addEventListener('popstate', handlePopState);

    const params = new URLSearchParams(window.location.search);
    const rawHash = window.location.hash;

    if (rawHash.includes('type=recovery')) {
      setCurrentView('reset-password');
      window.history.replaceState(null, '', '/reset-password');
    } else if (rawHash.includes('access_token=') || rawHash.includes('error_description=') || rawHash.includes('error=')) {
      setCurrentView('shop');
    } else if (params.get('paymentStatus')) {
      setCurrentView('dashboard');
      window.history.replaceState(null, '', '/myorders');
    } else if (window.location.pathname.replace(/^\/+/, '') === 'sms') {
      setActiveCategory('sms');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isAdmin = currentView === 'admin';

  return (
    <div className="min-h-screen bg-canvas dark:bg-gray-950 font-sans flex flex-col">
      {!isAdmin && <Navbar cartTotal={cartTotal} cartCount={cart.length} navigate={navigate} session={session} profile={profile} currentView={currentView} setActiveCategory={setActiveCategory} setActiveGroup={setActiveGroup} onCartClick={() => setCartOpen(true)} lang={lang} setLang={setLang} t={t} />}
      {!isAdmin && <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart} clearCart={clearCart} cartTotal={cartTotal} navigate={navigate} session={session} onCheckout={() => setCheckoutOpen(true)} />}
      {!isAdmin && (
        <CartCheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          cart={cart}
          cartTotal={cartTotal}
          session={session}
          profile={profile}
          navigate={navigate}
          clearCart={clearCart}
          fetchProfile={fetchProfile}
          fetchProducts={fetchProducts}
          fetchAllOrders={fetchAllOrders}
          setRechargeSuggestedAmount={setRechargeSuggestedAmount}
        />
      )}
      {!isAdmin && quickOrderProduct && (
        <QuickOrderModal
          product={quickOrderProduct}
          session={session}
          profile={profile}
          navigate={navigate}
          onClose={() => setQuickOrderProduct(null)}
          fetchProfile={fetchProfile}
          fetchProducts={fetchProducts}
          setRechargeSuggestedAmount={setRechargeSuggestedAmount}
          lang={lang}
        />
      )}
      <div className="flex-grow">
        {currentView === 'landing' && <LandingView navigate={navigate} session={session} products={products} setSelectedProduct={setSelectedProduct} lang={lang} setLang={setLang} />}
        {currentView === 'sms' && <SmsView session={session} profile={profile} lang={lang} navigate={navigate} fetchProfile={fetchProfile} />}
        {currentView === 'shop' && <HomeView activeGroup={activeGroup} setActiveGroup={setActiveGroup} activeCategory={activeCategory} setActiveCategory={setActiveCategory} sortBy={sortBy} setSortBy={setSortBy} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filteredProducts={filteredProducts} addToCart={addToCart} navigate={navigate} setSelectedProduct={setSelectedProduct} onBuyNow={setQuickOrderProduct} groups={productGroups} subCategories={productSubCategories} groupOf={categoryVisual} lang={lang} t={t} loading={productsLoading} />}
        {currentView === 'product' && selectedProduct && <ProductView product={selectedProduct} addToCart={addToCart} navigate={navigate} onCartClick={() => setCartOpen(true)} onBuyNow={setQuickOrderProduct} lang={lang} />}
        {currentView === 'api' && <ApiView navigate={navigate} session={session} lang={lang} />}
        {currentView === 'policies' && <PoliciesView navigate={navigate} lang={lang} />}
        {currentView === 'auth' && <AuthView navigate={navigate} lang={lang} />}
        {currentView === 'reset-password' && <ResetPasswordView navigate={navigate} lang={lang} />}
        {currentView === 'dashboard' && <MyOrdersView profile={profile} navigate={navigate} orders={orders} onResume={(order) => { setResumeOrder(order); navigate('recharge'); }} session={session} fetchProfile={fetchProfile} lang={lang} t={t} loading={ordersLoading} />}
        {currentView === 'settings' && <SettingsView profile={profile} navigate={navigate} fetchProfile={fetchProfile} session={session} lang={lang} t={t} />}
        {currentView === 'recharge' && <RechargeView profile={profile} session={session} navigate={navigate} suggestedAmount={rechargeSuggestedAmount} setSuggestedAmount={setRechargeSuggestedAmount} fetchProfile={fetchProfile} resumeOrder={resumeOrder} clearResumeOrder={() => setResumeOrder(null)} lang={lang} t={t} />}
        {currentView === 'admin' && (
          <AdminView
            session={session}
            navigate={navigate}
            products={products}
            fetchProducts={fetchProducts}
            allOrders={allOrders}
            fetchAllOrders={fetchAllOrders}
            allUsers={allUsers}
            fetchUsers={fetchUsers}
            actionStatus={actionStatus}
            setActionStatus={setActionStatus}
            lang={lang}
            setLang={setLang}
            t={t}
            dataLoading={adminDataLoading}
          />
        )}
      </div>

      {!isAdmin && session && <SupportChatWidget session={session} profile={profile} />}
      {!isAdmin && <Footer navigate={navigate} lang={lang} />}
    </div>
  );
}

export default App;