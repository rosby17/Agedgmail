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
  
  // Dynamic pricing states
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(initialState?.selectedCountry || '');
  const [currentPrice, setCurrentPrice] = useState(initialState?.currentPrice || 1.00);
  const [currentRawPrice, setCurrentRawPrice] = useState(initialState?.currentRawPrice || 0.50);
  const [currentProvider, setCurrentProvider] = useState(initialState?.currentProvider || 'smscodes');
  
  // Failover state: tracks which providers failed for which country in this session
  const [failedProviders, setFailedProviders] = useState({});
  
  // Service ID pour YouTube sur smscodes.io
  const [selectedService, setSelectedService] = useState('8a97735e-9a14-427e-8a88-e9d999bf3429'); 

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
          
          // Do not set a default country selection, keep it empty initially
          setSelectedCountry('');
          setCurrentPrice(1.00);
          setCurrentRawPrice(0.50);
          setCurrentProvider('smscodes');
        }
        setStatus('IDLE');
      } catch (err) {
        console.error("Fetch prices error", err);
        setError(isFr ? `Erreur: ${err.message}` : `Error: ${err.message}`);
        setStatus('IDLE');
      }
    };

    fetchPrices();
  }, [selectedService, isFr]);

  const handleCountryChange = (e) => {
    const iso = e.target.value;

    if (status === 'WAITING_SMS' && securityId && phoneNumber) {
      releaseNumber();
    }

    setPhoneNumber('');
    setSecurityId('');
    setSmsCode('');
    setTimeLeft(900);
    setEndTime(0);
    setError('');

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
      const failed = failedProviders[iso] || [];
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
        setError(isFr ? "Aucun numéro n'est disponible pour ce pays. Veuillez choisir un autre pays." : "No number is available for this country. Please try another.");
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
              body: { securityId, number: phoneNumber, provider: currentProvider }
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
              description: `SMS Verification (YouTube, ${selectedCountry})` 
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
  }, [status, securityId, phoneNumber, currentPrice, currentProvider, selectedCountry, fetchProfile]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const requestNumber = async (isoVal = selectedCountry, priceVal = currentPrice, providerVal = currentProvider, rawPriceVal = currentRawPrice, appVal = null) => {
    if (!session) {
      navigate('auth');
      return;
    }
    if (!isoVal) return;
    if (profile?.balance < priceVal) {
      setError(isFr ? `Solde insuffisant ($${profile?.balance?.toFixed(2)}). Veuillez recharger votre compte.` : `Insufficient balance ($${profile?.balance?.toFixed(2)}). Please top up.`);
      return;
    }
    setError('');
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
      setStatus('WAITING_SMS');
      setTimeLeft(900);
      setEndTime(Date.now() + 900000);
    } catch (err) {
      console.error(err);
      let errMsg = err.message || (isFr ? 'Une erreur est survenue' : 'An error occurred');
      
      const lowerErr = errMsg.toLowerCase();
      if (
        lowerErr.includes('nonumberavailable') || 
        lowerErr.includes('no free channels') || 
        lowerErr.includes('no_numbers') || 
        lowerErr.includes('not found') || 
        lowerErr.includes('not_found') || 
        lowerErr.includes('out of stock') || 
        lowerErr.includes('no number') ||
        lowerErr.includes('erreur technique est survenue') ||
        lowerErr.includes('technical error occurred') ||
        lowerErr.includes('provider error')
      ) {
        // Add to failedProviders and try next available
        const currentFailed = [...(failedProviders[isoVal] || []), providerVal];
        setFailedProviders(prev => ({ ...prev, [isoVal]: currentFailed }));
        
        const country = countries.find(c => c.Iso === isoVal);
        if (country && country.Providers) {
           const availableProviders = country.Providers.filter(p => !currentFailed.includes(p.Name));
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
                 requestNumber(isoVal, nextPrice, next.Name, nextRawPrice, nextApp);
              }, 50);
              
              return; // Exit early since we are retrying
           }
        }
        
        errMsg = isFr 
          ? "Aucun numéro n'est disponible pour ce pays actuellement (Tous les fournisseurs ont échoué). Veuillez réessayer plus tard ou choisir un autre pays."
          : "No number is currently available for this country (All providers failed). Please try again later or choose another country.";
      } else if (lowerErr.includes('insufficient balance') || lowerErr.includes('solde insuffisant')) {
        errMsg = isFr 
          ? "Solde insuffisant pour cette opération. Veuillez recharger votre compte."
          : "Insufficient balance for this operation. Please top up your account.";
      }
      
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // Libère le numéro côté fournisseur (best-effort, non bloquant). PVAPins a un
  // vrai endpoint de rejet ; SMSCodes se libère seul (jamais facturé sans code).
  const releaseNumber = () => {
    if (!securityId || !phoneNumber) return;
    supabase.functions.invoke('sms-cancel', {
      body: { securityId, number: phoneNumber, provider: currentProvider }
    }).catch(e => console.warn('sms-cancel:', e));
  };

  const cancelRequest = () => {
    releaseNumber();
    if (selectedCountry && currentProvider) {
      setFailedProviders(prev => ({ ...prev, [selectedCountry]: [...(prev[selectedCountry] || []), currentProvider] }));
    }

    setStatus('IDLE');
    setSelectedCountry('');
    setPhoneNumber('');
    setSecurityId('');
    setSmsCode('');
    setTimeLeft(900);
    setEndTime(0);
    setError('');
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

  if (status === 'LOADING_PRICES') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12 font-sans animate-in fade-in duration-300">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 mb-8 shadow-sm">
          <div className="flex items-start gap-4">
             <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse shrink-0"></div>
             <div className="flex-1 w-full">
               <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-2"></div>
               <div className="h-[46px] max-w-sm bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse mb-3"></div>
               <div className="h-2 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"></div>
             </div>
          </div>
        </div>

        <div className="space-y-6">
           <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm">
              <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
              <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-8"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-end">
                 <div>
                    <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
                    <div className="h-[54px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                 </div>
                 <div>
                    <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
                    <div className="h-[54px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm opacity-70">
              <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
              <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-8"></div>

              <div className="flex flex-col md:flex-row gap-4 items-end">
                 <div className="flex-1 w-full">
                    <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
                    <div className="h-[54px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                 </div>
                 <div className="w-full md:w-auto">
                    <div className="h-[54px] w-full md:w-40 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
                 </div>
              </div>
           </div>

           <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm opacity-50">
              <div className="h-4 w-48 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
              <div className="h-3 w-64 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-8"></div>

              <div className="h-3 w-32 bg-gray-100 dark:bg-gray-800 rounded animate-pulse mb-3"></div>
              <div className="h-[68px] w-full bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"></div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 font-sans animate-in fade-in duration-500">
      
      {/* Service Selection */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-blue-500/10 blur-3xl rounded-full"></div>
        
        <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-xl shadow-red-600/20 z-10">
          <YouTubeLogo className="w-10 h-10 fill-current text-white" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest rounded-full mb-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            {isFr ? 'Service Actif' : 'Active Service'}
          </div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">YouTube Verification</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl">
            {isFr ? "Vérifiez le numéro de votre chaîne YouTube pour débloquer immédiatement les fonctionnalités intermédiaires (vidéos de plus de 15 minutes, miniatures personnalisées, diffusion en direct)." : "Verify your YouTube channel number to immediately unlock intermediate features (videos over 15 minutes, custom thumbnails, live streaming)."}
          </p>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 text-red-600 dark:text-red-400 px-6 py-4 rounded-2xl text-sm font-bold flex items-center gap-3 mb-8 shadow-sm">
          <AlertCircle size={20} className="shrink-0" /> <span className="flex-1">{error}</span>
        </div>
      )}

      <div className="space-y-6">
         {/* Step 1: Select Country */}
         <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
            <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-widest">
              {isFr ? 'Étape 1 - Sélecteur de pays' : 'STEP ONE - SELECT THE COUNTRY'}
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              {isFr ? 'Après avoir sélectionné le pays, le prix du SMS s\'affichera.' : 'After selecting the country the price of the SMS message will be displayed.'}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 items-end">
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Pays du numéro' : 'Phone Number Country'}</label>
                  <select 
                    value={selectedCountry}
                    onChange={handleCountryChange}
                    disabled={status === 'LOADING_PRICES' || loading}
                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 font-medium disabled:opacity-50"
                  >
                    <option value="">{isFr ? '-- Choisir un pays --' : '-- Choose a country --'}</option>
                    {countries.map(c => (
                      <option key={c.Iso} value={c.Iso}>{c.Country} ({c.Iso})</option>
                    ))}
                  </select>
               </div>
               <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Prix du SMS ($)' : 'Price $ per SMS'}</label>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-4 py-3.5 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <span className="font-black text-gray-900 dark:text-white">${currentPrice.toFixed(2)}</span>
                    {status === 'LOADING_PRICES' && <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />}
                  </div>
               </div>
            </div>
         </div>

         {/* Step 2: Use the Number */}
         <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm transition-all duration-300 ${(!selectedCountry) ? 'opacity-50 grayscale-[20%]' : 'opacity-100'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-widest">
                  {isFr ? 'Étape 2 - Numéro de téléphone' : 'STEP TWO - PHONE NUMBER'}
                </h3>
                <p className="text-gray-500 text-sm max-w-xl">
                  {isFr ? 'Utilisez ce numéro de téléphone pour déclencher l\'envoi du code de vérification.' : 'Use this phone number to trigger the sending of the verification code.'}
                </p>
              </div>
            </div>

            {!selectedCountry ? (
              <div className="text-center py-6 text-yellow-600 dark:text-yellow-400 font-bold bg-yellow-50/50 dark:bg-yellow-950/10 rounded-2xl border border-dashed border-yellow-200/50 dark:border-yellow-900/20">
                {isFr ? "⚠️ Veuillez d'abord sélectionner un pays à l'étape 1" : "⚠️ Please select a country in step 1 first"}
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
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-xl font-mono font-bold text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 transition-colors group-hover:border-primary/30" 
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

         {/* Step 3: Receive SMS */}
         <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm transition-all duration-300 ${status === 'COMPLETED' ? 'opacity-100 border-green-500/30' : (status === 'WAITING_SMS' ? 'opacity-100 border-primary/30' : 'opacity-50 grayscale-[50%]')}`}>
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
                    ? "Si le SMS n'arrive pas après 5 minutes, c'est que YouTube (ou le service) n'a pas envoyé le SMS à ce numéro spécifique, ou que l'opérateur local le bloque. Cliquez sur \"Annuler / Remboursement\" pour annuler sans frais et essayer un autre numéro ou un autre pays."
                    : "If the SMS doesn't arrive after 5 minutes, YouTube (or the service) likely didn't send the SMS to this specific number, or the local carrier blocked it. Click \"Cancel / Refund\" to cancel without being charged and try another number or country."}
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
                      className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-4 text-xl font-mono font-bold outline-none resize-none animate-pulse" 
                      placeholder={status === 'WAITING_SMS' ? (isFr ? 'En attente de réception...' : 'Waiting for SMS...') : ''}
                    ></textarea>
                 </div>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};
export default SmsView;
