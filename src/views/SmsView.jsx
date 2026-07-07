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
    } catch(e) {}
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
  const [selectedCountry, setSelectedCountry] = useState(initialState?.selectedCountry || 'US');
  const [currentPrice, setCurrentPrice] = useState(initialState?.currentPrice || 1.00);
  
  // Service ID pour YouTube sur smscodes.io
  const [selectedService, setSelectedService] = useState('8a97735e-9a14-427e-8a88-e9d999bf3429'); 

  useEffect(() => {
    if (status === 'IDLE') {
      localStorage.removeItem('smsViewState');
    } else {
      localStorage.setItem('smsViewState', JSON.stringify({
        status, phoneNumber, securityId, smsCode, endTime, selectedCountry, currentPrice
      }));
    }
  }, [status, phoneNumber, securityId, smsCode, endTime, selectedCountry, currentPrice]);

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
        setError(isFr ? `Erreur: ${err.message}` : `Error: ${err.message}`);
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
    
    if (status === 'WAITING_SMS' && endTime > Date.now()) {
      timer = setInterval(() => {
        const remaining = Math.floor((endTime - Date.now()) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
      }, 1000);
      
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
            
            // Play a loud notification sound
            try {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
              audio.volume = 1.0;
              audio.play().catch(e => console.log('Audio play failed:', e));
            } catch(e) {}

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
      setEndTime(0);
      localStorage.removeItem('smsViewState');
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
      setEndTime(Date.now() + 900000);
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
    setEndTime(0);
    setError('');
    localStorage.removeItem('smsViewState');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

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
      
      {/* Header Dashboard style */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex items-start gap-4">
           <div className="w-12 h-12 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
             <MessageSquare size={24} />
           </div>
           <div className="flex-1 w-full">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Service' : 'Service'}</label>
             <select 
                value={selectedService} 
                onChange={(e) => setSelectedService(e.target.value)}
                disabled={status !== 'IDLE' && status !== 'LOADING_PRICES'}
                className="w-full max-w-sm text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-black text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 mb-3"
             >
                <option value="8a97735e-9a14-427e-8a88-e9d999bf3429">YouTube</option>
             </select>
             <p className="text-sm text-gray-500">
               {isFr ? 'Vérifier le numéro de sa chaîne YouTube pour activer les fonctionnalités intermédiaires.' : 'Verify the number of your YouTube channel to activate intermediate features.'}
             </p>
           </div>
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
                    disabled={status !== 'IDLE' && status !== 'LOADING_PRICES'}
                    className="w-full text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3.5 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/50 font-medium disabled:opacity-50"
                  >
                    {countries.length > 0 ? (
                      countries.map(c => (
                        <option key={c.Iso} value={c.Iso}>{c.Country} ({c.Iso})</option>
                      ))
                    ) : (
                      <option value="US">{isFr ? 'Chargement...' : 'Loading...'}</option>
                    )}
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
         <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[2rem] p-6 md:p-8 shadow-sm transition-all duration-300 ${(status === 'IDLE' && !phoneNumber) ? 'opacity-70 grayscale-[20%]' : 'opacity-100'}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-2 uppercase tracking-widest">
                  {isFr ? 'Étape 2 - Obtenir le numéro' : 'STEP TWO - USE THE NUMBER'}
                </h3>
                <p className="text-gray-500 text-sm max-w-xl">
                  {isFr ? 'Entrez ce numéro sur YouTube pour déclencher l\'envoi du code de vérification.' : 'Enter the number into the website/app to receive the SMS verification message.'}
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
               <div className="flex-1 w-full">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Numéro de téléphone' : 'Phone Number'}</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      readOnly 
                      value={phoneNumber || (loading ? (isFr ? 'Génération en cours...' : 'Generating...') : '')} 
                      placeholder={isFr ? "Cliquez sur obtenir un numéro" : "Click get number"} 
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
                  {status === 'IDLE' && (
                    <button onClick={requestNumber} disabled={loading || status === 'LOADING_PRICES' || countries.length === 0} className="w-full md:w-auto bg-primary text-white font-bold py-3.5 px-8 rounded-xl hover:bg-primaryDark transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 h-[54px] shadow-lg shadow-primary/20">
                      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Smartphone size={18} />}
                      {isFr ? 'Obtenir le numéro' : 'Get Number'}
                    </button>
                  )}
                  {(status === 'WAITING_SMS' || status === 'COMPLETED') && (
                    <button onClick={cancelRequest} className="w-full md:w-auto bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold py-3.5 px-8 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400 transition-colors h-[54px]">
                      {isFr ? 'Annuler' : 'Cancel / Refund'}
                    </button>
                  )}
               </div>
            </div>
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
                    ? "Si le SMS n'arrive pas après 2 à 3 minutes, c'est que YouTube (ou le service) n'a pas envoyé le SMS à ce numéro spécifique, ou que l'opérateur local le bloque. Cliquez sur \"Annuler / Remboursement\" pour annuler sans frais et essayer un autre numéro ou un autre pays."
                    : "If the SMS doesn't arrive after 2-3 minutes, YouTube (or the service) likely didn't send the SMS to this specific number, or the local carrier blocked it. Click \"Cancel / Refund\" to cancel without being charged and try another number or country."}
                </p>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 items-stretch">
               <div className="flex-1 relative">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{isFr ? 'Message SMS' : 'SMS Message'}</label>
                  <textarea 
                    readOnly 
                    value={smsCode} 
                    rows={2} 
                    className={`w-full bg-gray-50 dark:bg-gray-800 border ${status === 'COMPLETED' ? 'border-green-500/50 text-green-600 dark:text-green-400' : 'border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white'} rounded-xl px-4 py-4 text-xl font-mono font-bold outline-none resize-none`} 
                    placeholder={status === 'WAITING_SMS' ? (isFr ? 'En attente de réception...' : 'Waiting for SMS...') : ''}
                  ></textarea>
               </div>
               {smsCode && (
                 <div className="flex items-end">
                   <button onClick={() => copyToClipboard(smsCode)} className="w-full md:w-auto bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 px-8 rounded-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 h-[68px]">
                     <Copy size={18} /> {isFr ? 'Copier le code' : 'Copy Code'}
                   </button>
                 </div>
               )}
            </div>
            {status === 'COMPLETED' && (
              <p className="text-sm text-green-600 dark:text-green-400 font-bold mt-4">
                {isFr ? `Succès ! $${currentPrice.toFixed(2)} ont été débités.` : `Success! $${currentPrice.toFixed(2)} has been charged.`}
              </p>
            )}
         </div>
      </div>
    </div>
  );
};
export default SmsView;
