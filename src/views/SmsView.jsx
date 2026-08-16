import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, User, Search, CheckCircle, Headphones, Mail, ShieldAlert, Filter, ChevronRight, ChevronUp, PlayCircle, CircleDollarSign, ArrowLeft, Trash2, LogOut, Plus, Minus, Share2, Copy, ExternalLink, Wallet, Zap, Clock, Info, ShieldCheck, RefreshCcw, ArrowUpDown, CreditCard, History, Settings, LayoutDashboard, Eye, EyeOff, X, Download, MapPin, Shield, Database, Users, TrendingUp, AlertTriangle, AlertCircle, Smartphone, Package, PackageX, DollarSign, Activity, FileText, Trash, MessageCircle, Send, MessageSquare, Upload, Save, Edit, Hash, Sun, Moon, RotateCcw, Ban, UserCheck, Calendar, ShoppingBag, Bell, Menu } from 'lucide-react';
import { supabase } from '../supabaseClient';

import { ADMIN_EMAIL, CATEGORIES, GROUP_LABELS, GROUP_ORDER, AVATAR_COLORS, JUNK_CATEGORIES, SUPPLIERS, API_BASE_URL } from '../utils/constants';
import { categoryName, hashStr, detectFromText, categoryVisual, displayCategoryLabel, cleanProductName, getProductDetails } from '../utils/helpers';
import { GmailLogo, FacebookIcon, TwitterLogo, AppleLogo, SmsLogo, RedditLogo, MailGenericLogo, OutlookLogo, SnapchatLogo, AmazonLogo, GithubLogo } from '../components/ui/Logos';
import { SMS_SERVICES, DEFAULT_SMS_SERVICE, getSmsService } from '../utils/smsServices';
import CustomSelect from '../components/ui/CustomSelect';
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

// Logo officiel de marque (Simple Icons, SVG, licence libre) — bien plus
// fidèle que des tracés dessinés à la main. `color` optionnel : sans lui,
// le CDN renvoie le SVG en noir/blanc par défaut.
const BrandIcon = ({ slug, color, className = 'w-full h-full', alt = '' }) => (
  <img
    src={`https://cdn.simpleicons.org/${slug}${color ? `/${color}` : ''}`}
    alt={alt}
    className={className}
    loading="lazy"
  />
);

// Missing sub-views for Admin
import SupplierAdmin from './SupplierAdmin';
import DepositsAdmin from './DepositsAdmin';
import SupportAdmin from './SupportAdmin';
import OrdersAdmin from './OrdersAdmin';
import SettingsTab from './SettingsTab';

const SmsView = ({ session, profile, lang, navigate, fetchProfile }) => {
  const isFr = lang === 'fr';

  const loadState = () => {
    try {
      const saved = localStorage.getItem('smsViewState');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.status === 'WAITING_SMS' && parsed.endTime > Date.now()) {
          parsed.timeLeft = Math.floor((parsed.endTime - Date.now()) / 1000);
          return parsed;
        } else if (parsed.status === 'COMPLETED') {
          return parsed;
        }
      }
    } catch(e) {
      console.warn("Failed to load initial SMS state:", e);
    }
    return null;
  };

  const initialState = loadState();

  const [status, setStatus] = useState(initialState?.status || 'IDLE'); 
  const [phoneNumber, setPhoneNumber] = useState(initialState?.phoneNumber || '');
  const [securityId, setSecurityId] = useState(initialState?.securityId || '');
  const [smsCode, setSmsCode] = useState(initialState?.smsCode || '');
  const [timeLeft, setTimeLeft] = useState(initialState?.timeLeft || 900);
  const [endTime, setEndTime] = useState(initialState?.endTime || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Catégorise l'erreur de demande de numéro pour afficher un message clair,
  // non technique, à la place du champ numéro : 'balance' | 'unavailable'
  // (aucun fournisseur en stock pour ce pays) | 'technical' (souci de notre
  // côté). Ne révèle jamais de nom de fournisseur au client.
  const [errorKind, setErrorKind] = useState('');
  
  // Dynamic pricing states
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(initialState?.selectedCountry || '');
  const [currentPrice, setCurrentPrice] = useState(initialState?.currentPrice || 1.00);
  const [currentRawPrice, setCurrentRawPrice] = useState(initialState?.currentRawPrice || 0.50);
  const [currentProvider, setCurrentProvider] = useState(initialState?.currentProvider || 'smscodes');
  
  // Failover state: tracks which providers failed for which country in this session
  const [failedProviders, setFailedProviders] = useState({});
  
  // Slug canonique du service SMS choisi (voir src/utils/smsServices.js) —
  // YouTube par défaut/mis en avant, résolu ensuite côté serveur en
  // identifiants réels par fournisseur (voir _shared/sms-services.ts).
  const [selectedService, setSelectedService] = useState(DEFAULT_SMS_SERVICE);
  const svc = getSmsService(selectedService);
  // Cache client par service : re-sélectionner un service déjà chargé pendant
  // cette session est instantané (pas de nouvel appel réseau, pas de flash de
  // chargement) — la liste de prix ne bouge pas assez vite pour justifier de
  // rappeler le serveur à chaque clic.
  const pricesCacheRef = useRef({});
  const [pricesLoading, setPricesLoading] = useState(false);

  useEffect(() => {
    if (status === 'IDLE') {
      localStorage.removeItem('smsViewState');
    } else {
      localStorage.setItem('smsViewState', JSON.stringify({
        status, phoneNumber, securityId, smsCode, endTime, selectedCountry, currentPrice, currentProvider
      }));
    }
  }, [status, phoneNumber, securityId, smsCode, endTime, selectedCountry, currentPrice, currentProvider]);

  useEffect(() => {
    // Changer de service ne doit JAMAIS remplacer toute la page par un
    // skeleton — seule la liste de pays/prix se recharge, en gardant le
    // reste de l'UI (sélecteur, étapes) visible et interactif. Résultat déjà
    // en cache pour ce service pendant cette session -> affichage instantané,
    // sans appel réseau ni indicateur de chargement.
    const cached = pricesCacheRef.current[selectedService];
    if (cached) {
      setCountries(cached);
      setSelectedCountry('');
      setCurrentPrice(1.00);
      setCurrentRawPrice(0.50);
      setCurrentProvider('smscodes');
      return;
    }

    const fetchPrices = async () => {
      setPricesLoading(true);
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
          pricesCacheRef.current[selectedService] = sorted;
          setCountries(sorted);

          // Do not set a default country selection, keep it empty initially
          setSelectedCountry('');
          setCurrentPrice(1.00);
          setCurrentRawPrice(0.50);
          setCurrentProvider('smscodes');
        }
      } catch (err) {
        console.error("Fetch prices error", err);
        setError(isFr ? `Erreur: ${err.message}` : `Error: ${err.message}`);
      } finally {
        setPricesLoading(false);
      }
    };

    fetchPrices();
  }, [selectedService, isFr]);

  const handleCountryChange = (iso) => {

    if (status === 'WAITING_SMS' && securityId && phoneNumber) {
      releaseNumber();
    }

    setPhoneNumber('');
    setSecurityId('');
    setSmsCode('');
    setTimeLeft(900);
    setEndTime(0);
    setError('');
    setErrorKind('');

    if (!iso) {
      setStatus('IDLE');
      setSelectedCountry('');
      setCurrentPrice(1.00);
      setCurrentRawPrice(0.50);
      setCurrentProvider('smscodes');
      return;
    }
    setSelectedCountry(iso);
    const country = countries.find(c => c.Iso === iso);
    if (country && country.Providers) {
      // Find the first available provider that hasn't failed yet for this country
      const failed = failedProviders[`${selectedService}:${iso}`] || [];
      const availableProviders = country.Providers.filter(p => !failed.includes(p.Name));
      
      if (availableProviders.length > 0) {
        const selected = availableProviders[0];
        const priceVal = parseFloat(selected.Price);
        const rawPriceVal = parseFloat(selected.RawPrice);
        const providerVal = selected.Name;
        const appVal = selected.App || null; // (pvapins) variante YouTube la moins chère

        setCurrentPrice(priceVal);
        setCurrentRawPrice(rawPriceVal);
        setCurrentProvider(providerVal);

        // Automatically request the number
        requestNumber(iso, priceVal, providerVal, rawPriceVal, appVal);
      } else {
        // All providers failed for this country
        setErrorKind('unavailable');
        setError(isFr ? "Ce pays n'est pas disponible pour le moment. Merci d'essayer un autre pays." : "This country isn't available right now. Please try another country.");
      }
    }
  };

  useEffect(() => {
    let timer;
    
    if (status === 'WAITING_SMS' && endTime > Date.now()) {
      timer = setInterval(() => {
        const remaining = Math.floor((endTime - Date.now()) / 1000);
        if (remaining <= 0) {
          // Libère le numéro côté fournisseur avant de réinitialiser (best-effort).
          if (securityId && phoneNumber) {
            supabase.functions.invoke('sms-cancel', {
              body: { securityId, number: phoneNumber, provider: currentProvider, reason: 'timeout' }
            }).catch(e => console.warn('sms-cancel (timeout):', e));
          }
          setStatus('IDLE');
          setError(isFr ? "Délai d'attente expiré. Aucun code reçu. Vous n'avez pas été débité." : "Timeout expired. No code received. You were not charged.");
          setPhoneNumber('');
          setSecurityId('');
          setEndTime(0);
          localStorage.removeItem('smsViewState');
        } else {
          setTimeLeft(remaining);
        }
      }, 1000);
    }
    
    return () => {
      clearInterval(timer);
    };
  }, [status, endTime, isFr]);

  useEffect(() => {
    let pollInterval;
    
    if (status === 'WAITING_SMS' && securityId) {
      pollInterval = setInterval(async () => {
        try {
          const { data, error } = await supabase.functions.invoke('sms-check-code', {
            body: { 
              securityId, 
              number: phoneNumber, 
              price: currentPrice,
              supplier_cost: currentRawPrice,
              provider: currentProvider,
              description: `SMS Verification (${svc.labelEn}, ${selectedCountry})`
            }
          });
          
          if (!error && data && data.status === 'success') {
            setSmsCode(data.sms);
            setStatus('COMPLETED');
            
            // Play a loud notification sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 1.0;
              audio.play().catch(e => console.log('Audio play failed:', e));
            } catch(e) {
              console.log("Audio notification failed:", e);
            }

             if (fetchProfile && session?.user?.id) fetchProfile(session.user.id);
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 8000);
    }
    
    return () => {
      clearInterval(pollInterval);
    };
  }, [status, securityId, phoneNumber, currentPrice, currentProvider, selectedCountry, selectedService, fetchProfile]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const requestNumber = async (isoVal = selectedCountry, priceVal = currentPrice, providerVal = currentProvider, rawPriceVal = currentRawPrice, appVal = null, currentFailedList = failedProviders[`${selectedService}:${selectedCountry}`] || []) => {
    if (!session) {
      navigate('auth');
      return;
    }
    if (!isoVal) return;
    const balanceNow = Number(profile?.balance || 0);
    if (balanceNow < priceVal) {
      setErrorKind('balance');
      setError(isFr ? `Solde insuffisant ($${balanceNow.toFixed(2)}) pour obtenir ce numéro. Rechargez votre compte pour continuer.` : `Insufficient balance ($${balanceNow.toFixed(2)}) to get this number. Top up your account to continue.`);
      return;
    }
    setError('');
    setErrorKind('');
    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('sms-get-number', {
        body: { iso: isoVal, serviceId: selectedService, price: priceVal, provider: providerVal, app: appVal }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      if (data.Status !== "200" && data.Status !== "Success") throw new Error(data.Error || 'Provider Error');

      setPhoneNumber(data.Number);
      setSecurityId(data.SecurityId);
      // Prix réellement débité = celui calculé et signé par le serveur.
      if (data.Price) setCurrentPrice(Number(data.Price));
      setStatus('WAITING_SMS');
      setTimeLeft(900);
      setEndTime(Date.now() + 900000);
    } catch (err) {
      console.error(err);
      const rawMsg = err.message || '';
      const lowerErr = rawMsg.toLowerCase();

      // Le solde du CLIENT est insuffisant (vérifié aussi côté serveur) :
      // message clair, pas de retry fournisseur, on l'invite à recharger.
      const isBalanceErr = lowerErr.includes('insufficient balance') || lowerErr.includes('solde insuffisant');
      // Le fournisseur signale explicitement "pas de numéro en stock" pour ce
      // pays (jamais un vrai nom de fournisseur dans ces mots-clés).
      const isStockOut = !isBalanceErr && (
        lowerErr.includes('nonumberavailable') ||
        lowerErr.includes('no free channels') ||
        lowerErr.includes('no_numbers') ||
        lowerErr.includes('not found') ||
        lowerErr.includes('not_found') ||
        lowerErr.includes('out of stock') ||
        lowerErr.includes('no number')
      );

      if (isBalanceErr) {
        setErrorKind('balance');
        setError(isFr
          ? "Solde insuffisant pour obtenir ce numéro. Rechargez votre compte pour continuer."
          : "Insufficient balance to get this number. Top up your account to continue.");
        setLoading(false);
        return;
      }

      // Stock épuisé OU souci technique : on tente automatiquement le
      // fournisseur suivant avant d'abandonner (transparent pour le client).
      const newFailed = [...currentFailedList, providerVal];
      setFailedProviders(prev => ({ ...prev, [`${selectedService}:${isoVal}`]: newFailed }));

      const country = countries.find(c => c.Iso === isoVal);
      const availableProviders = (country?.Providers || []).filter(p => !newFailed.includes(p.Name));
      if (availableProviders.length > 0) {
        const next = availableProviders[0];
        const nextPrice = parseFloat(next.Price);
        const nextRawPrice = parseFloat(next.RawPrice);
        const nextApp = next.App || null;

        setCurrentPrice(nextPrice);
        setCurrentRawPrice(nextRawPrice);
        setCurrentProvider(next.Name);

        // Small delay to retry with the next provider
        setTimeout(() => {
          requestNumber(isoVal, nextPrice, next.Name, nextRawPrice, nextApp, newFailed);
        }, 50);
        return; // Exit early since we are retrying
      }

      // Plus aucun fournisseur disponible : message final selon la vraie cause,
      // formulé en langage courant, sans jamais mentionner un fournisseur.
      if (isStockOut) {
        setErrorKind('unavailable');
        setError(isFr
          ? "Ce pays n'est pas disponible pour le moment. Merci d'essayer un autre pays."
          : "This country isn't available right now. Please try another country.");
      } else {
        setErrorKind('technical');
        setError(isFr
          ? "Une erreur technique empêche l'envoi du numéro pour le moment. Réessayez dans quelques instants."
          : "A technical issue is preventing the number from being sent right now. Please try again shortly.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Libère le numéro côté fournisseur (best-effort, non bloquant). PVAPins a un
  // vrai endpoint de rejet ; SMSCodes se libère seul (jamais facturé sans code).
  const releaseNumber = () => {
    if (!securityId || !phoneNumber) return;
    supabase.functions.invoke('sms-cancel', {
      body: { securityId, number: phoneNumber, provider: currentProvider, reason: 'user_cancelled' }
    }).catch(e => console.warn('sms-cancel:', e));
  };

  const cancelRequest = () => {
    releaseNumber();
    if (selectedCountry && currentProvider) {
      const key = `${selectedService}:${selectedCountry}`;
      setFailedProviders(prev => ({ ...prev, [key]: [...(prev[key] || []), currentProvider] }));
    }

    setStatus('IDLE');
    setSelectedCountry('');
    setPhoneNumber('');
    setSecurityId('');
    setSmsCode('');
    setTimeLeft(900);
    setEndTime(0);
    setError('');
    setErrorKind('');
    localStorage.removeItem('smsViewState');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const extractCode = (text) => {
    if (!text) return '';
    const match = text.match(/\b\d{4,8}\b/);
    return match ? match[0] : text;
  };

  const extractedCode = extractCode(smsCode);

  // Skeleton plein écran uniquement au tout premier chargement (aucun pays
  // encore connu) — jamais lors d'un changement de service, pour ne pas
  // donner l'impression que toute la page recharge. La structure ci-dessous
  // reproduit exactement celle du contenu réel (même largeur max-w-7xl,
  // même sidebar de services, même disposition 2 colonnes) pour éviter tout
  // saut de mise en page quand les données arrivent.
  if (pricesLoading && countries.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-12 font-sans animate-in fade-in duration-300">
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Sélecteur de service — mêmes boutons flex-1 que le contenu réel,
              pour s'étirer sur toute la hauteur des colonnes voisines. */}
          <div className="w-full md:w-56 shrink-0 flex flex-col gap-2">
            {SMS_SERVICES.map((s) => (
              <div key={s.id} className="flex-1 min-h-[46px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
            ))}
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              {/* Carte unifiée : rail numéroté + Étapes 1 et 2 */}
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm">
                <div className="flex gap-4 md:gap-5">
                  <div className="hidden sm:flex flex-col items-center shrink-0 pt-1">
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0"></div>
                    <div className="w-0.5 flex-1 my-1 min-h-[72px] bg-gray-100 dark:bg-gray-800"></div>
                    <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 animate-pulse shrink-0"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="h-4 w-36 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                      <div className="h-5 w-20 bg-gray-100 dark:bg-gray-800 rounded-full animate-pulse"></div>
                    </div>
                    <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-6"></div>

                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-end">
                       <div>
                          <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                          <div className="h-[54px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                       </div>
                       <div>
                          <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                          <div className="h-[54px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                       </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 opacity-50">
                      <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
                      <div className="h-3 w-56 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-4"></div>
                      <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Étape 3 */}
            <div className="flex-1">
              <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm opacity-50 h-full">
                <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
                <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-6"></div>

                <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
                <div className="h-[68px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 font-sans animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Sélecteur de service — vertical, étiré sur toute la hauteur des colonnes voisines */}
        <div className="w-full md:w-56 shrink-0 flex flex-col gap-2 md:h-auto">
          {SMS_SERVICES.map((s) => {
            const active = s.id === selectedService;
            return (
              <button
                key={s.id}
                onClick={() => { if (s.id !== selectedService) setSelectedService(s.id); }}
                disabled={loading}
                className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all border disabled:opacity-50 text-left ${
                  active
                    ? 'bg-primary text-white dark:text-gray-900 border-primary shadow-sm'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                <span className="w-6 h-6 shrink-0 rounded-md overflow-hidden bg-white flex items-center justify-center p-1">
                  <BrandIcon slug={s.iconSlug} color={s.iconColor} />
                </span>
                {isFr ? s.labelFr : s.labelEn}
                {active && pricesLoading && (
                  <div className="w-3 h-3 ml-auto border-2 border-white/40 border-t-white rounded-full animate-spin shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Colonne de gauche (Étapes 1+2) + colonne de droite (Étape 3) */}
        <div className="flex-1 flex flex-col md:flex-row gap-6">
        <div className="flex-1">
        {/* Carte unifiée "stepper" : les étapes 1 et 2 partagent une même
            carte reliée par un rail numéroté, au lieu de deux cadres épais
            redondants. Le badge de service (déjà visible dans la sidebar de
            gauche) devient une simple pastille discrète à côté du titre. */}
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm relative">
          {/* overflow-hidden isolé sur ce calque décoratif uniquement — sur la
              carte entière, ça coupait le menu déroulant du CustomSelect qui
              doit pouvoir dépasser en dessous. */}
          <div className="absolute inset-0 rounded-[2rem] overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>
          </div>

          {error && !errorKind && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 mb-6 shadow-sm z-10 relative">
              <AlertCircle size={20} className="shrink-0" /> <span className="flex-1">{error}</span>
            </div>
          )}

          <div className="flex gap-4 md:gap-5 z-10 relative">
            {/* Rail numéroté reliant les étapes */}
            <div className="hidden sm:flex flex-col items-center shrink-0 pt-1">
              <div className="w-7 h-7 rounded-full bg-primary text-white dark:text-gray-900 text-xs font-black flex items-center justify-center shrink-0">1</div>
              <div className={`w-0.5 flex-1 my-1 min-h-[72px] transition-colors duration-300 ${selectedCountry ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
              <div className={`w-7 h-7 rounded-full text-xs font-black flex items-center justify-center shrink-0 border-2 transition-colors duration-300 ${selectedCountry ? 'bg-primary text-white dark:text-gray-900 border-primary' : 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600'}`}>2</div>
            </div>

            <div className="flex-1 min-w-0">
              {/* Étape 1 */}
              <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">
                  {isFr ? 'Choisis le pays' : 'Choose the country'}
                </h3>
                <span className="inline-flex items-center gap-1.5 pl-1 pr-2.5 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full shrink-0">
                  <span className="w-4 h-4 rounded-full overflow-hidden bg-white flex items-center justify-center p-0.5">
                    <BrandIcon slug={svc.iconSlug} color={svc.iconColor} />
                  </span>
                  {isFr ? svc.labelFr : svc.labelEn}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-5">
                {isFr ? 'Après avoir sélectionné le pays, le prix du SMS s\'affichera.' : 'After selecting the country the price of the SMS message will be displayed.'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-4 items-end">
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Pays du numéro' : 'Phone Number Country'}</label>
                    <CustomSelect
                      value={selectedCountry}
                      onChange={handleCountryChange}
                      disabled={pricesLoading || loading}
                      placeholder={isFr ? '-- Choisir un pays --' : '-- Choose a country --'}
                      options={countries.map(c => ({ value: c.Iso, label: `${c.Country} (${c.Iso})` }))}
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Prix du SMS ($)' : 'Price $ per SMS'}</label>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                      <span className="font-black text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</span>
                      {pricesLoading && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                    </div>
                 </div>
              </div>

              {/* Étape 2 : pliée dans la même carte, atténuée tant que le pays
                  n'est pas choisi — pas de second cadre redondant. */}
              <div className={`mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 transition-opacity duration-300 ${(!selectedCountry) ? 'opacity-50' : 'opacity-100'}`}>
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-1 uppercase tracking-widest">
                  {isFr ? 'Numéro de téléphone' : 'Phone number'}
                </h3>
                <p className="text-gray-500 text-sm mb-4 max-w-xl">
                  {isFr ? 'Utilisez ce numéro de téléphone pour déclencher l\'envoi du code de vérification.' : 'Use this phone number to trigger the sending of the verification code.'}
                </p>

                {!selectedCountry ? (
                  <p className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                    {isFr ? "Sélectionne d'abord un pays ci-dessus." : "Select a country above first."}
                  </p>
                ) : errorKind && !phoneNumber && !loading ? (
                  // Message clair à la place du numéro (jamais de jargon technique
                  // ni de nom de fournisseur) : solde / pays indisponible / technique.
                  <div className={`rounded-2xl p-5 flex items-start gap-3 border animate-in fade-in duration-300 ${
                    errorKind === 'balance'
                      ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
                      : errorKind === 'unavailable'
                      ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-900/30 text-orange-700 dark:text-orange-400'
                      : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    <AlertCircle size={20} className="shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold text-sm">{error}</p>
                      {errorKind === 'balance' && (
                        <button onClick={() => navigate('recharge')} className="mt-3 text-xs font-black uppercase tracking-widest underline hover:no-underline">
                          {isFr ? 'Recharger mon solde →' : 'Top up my balance →'}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 items-end animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <div className="flex-1 w-full">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Numéro de téléphone' : 'Phone Number'}</label>
                        <div className="relative group">
                          <input
                            type="text"
                            readOnly
                            value={phoneNumber || (loading ? (isFr ? 'Génération du numéro en cours...' : 'Generating number...') : '')}
                            placeholder={isFr ? "Génération automatique..." : "Automatic generation..."}
                            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-base md:text-lg font-mono font-bold tracking-tight text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-colors group-hover:border-primary/30 truncate"
                          />
                          {phoneNumber && (
                             <button onClick={() => copyToClipboard(phoneNumber)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary hover:bg-primary/10 p-2 rounded-lg transition-colors">
                               <Copy size={18} />
                             </button>
                          )}
                        </div>
                     </div>
                     <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
                        {(status === 'WAITING_SMS' || status === 'COMPLETED') && (
                          <button onClick={cancelRequest} className="w-full md:w-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3.5 px-8 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors h-[54px]">
                            {isFr ? 'Annuler' : 'Cancel / Refund'}
                          </button>
                        )}
                     </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Colonne de droite : Étape 3 */}
        <div className="flex-1">
         {/* Step 3: Receive SMS */}
         <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm transition-all duration-300 h-full ${status === 'COMPLETED' ? 'opacity-100 border-green-500/30' : (status === 'WAITING_SMS' ? 'opacity-100 border-primary/30' : 'opacity-50 grayscale-[50%]')}`}>
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-widest flex items-center gap-3">
              {isFr ? 'Étape 3 - Réception du SMS' : 'STEP THREE - RECEIVE THE SMS'}
              {status === 'WAITING_SMS' && <span className="flex h-2 w-2 relative"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span></span>}
              {status === 'COMPLETED' && <CheckCircle size={16} className="text-green-500" />}
            </h3>
            <p className="text-gray-500 text-sm mb-4">
              {isFr ? `Le SMS reçu s'affichera ci-dessous automatiquement.` : `The received SMS will be displayed below automatically.`} 
              {status === 'WAITING_SMS' && <span className="ml-2 font-mono text-primary font-bold">{formatTime(timeLeft)}</span>}
            </p>

            {status === 'WAITING_SMS' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-xl p-3 mb-6 flex items-start gap-3">
                <AlertCircle className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium leading-relaxed">
                  {isFr
                    ? `Si le SMS n'arrive pas après 5 minutes, c'est que ${svc.labelFr} n'a pas envoyé le SMS à ce numéro spécifique, ou que l'opérateur local le bloque. Cliquez sur "Annuler / Remboursement" pour annuler sans frais et essayer un autre numéro ou un autre pays.`
                    : `If the SMS doesn't arrive after 5 minutes, ${svc.labelEn} likely didn't send the SMS to this specific number, or the local carrier blocked it. Click "Cancel / Refund" to cancel without being charged and try another number or country.`}
                </p>
              </div>
            )}
            
            {status === 'COMPLETED' && smsCode ? (
              <div className="bg-green-500/10 border-2 border-green-500/30 rounded-[2rem] p-8 flex flex-col items-center justify-center gap-4 text-center animate-in zoom-in duration-300">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                  <CheckCircle size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-green-700 dark:text-green-400 uppercase tracking-wider">{isFr ? 'CODE SMS REÇU !' : 'SMS CODE RECEIVED!'}</h4>
                  <p className="text-xs text-green-600/80 font-bold mt-1">
                    {isFr ? `Débité de $${currentPrice.toFixed(2)}` : `Charged $${currentPrice.toFixed(2)}`}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 border border-green-500/20 px-10 py-6 rounded-2xl shadow-inner relative group select-all">
                  <span className="text-4xl md:text-5xl font-mono font-black tracking-widest text-gray-900 dark:text-white select-all">{extractedCode}</span>
                </div>
                {smsCode !== extractedCode && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md break-words border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
                    <span className="font-bold">{isFr ? 'Message complet : ' : 'Full message: '}</span>
                    {smsCode}
                  </div>
                )}
                <button onClick={() => copyToClipboard(extractedCode)} className="bg-green-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-green-700 transition-all flex items-center gap-2 active:scale-95 shadow-md">
                  <Copy size={16} /> {isFr ? 'Copier le code' : 'Copy Code'}
                </button>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-4 items-stretch">
                 <div className="flex-1 relative">
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Message SMS' : 'SMS Message'}</label>
                    <textarea 
                      readOnly 
                      value={smsCode} 
                      rows={2} 
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-sm md:text-base font-mono font-bold outline-none resize-none animate-pulse"
                      placeholder={status === 'WAITING_SMS' ? (isFr ? 'En attente de réception...' : 'Waiting for SMS...') : ''}
                    ></textarea>
                 </div>
              </div>
            )}
         </div>
        </div>
        </div>
      </div>
    </div>
  );
};
export default SmsView;
