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

    // La résolution du destinataire (+ débit/crédit) est faite côté serveur par
    // la RPC transfer_credits, sous SECURITY DEFINER : la RLS "own-row-only" de
    // profiles ne permet pas de rechercher un autre compte par email depuis le
    // client. On passe directement à la confirmation ; l'existence réelle du
    // destinataire est validée atomiquement au moment du transfert.
    setRecipientName(recipientEmail.trim());
    setStep('confirm');
  };

  const handleTransfer = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Transfert atomique côté serveur : l'expéditeur est dérivé de auth.uid(),
      // le destinataire est résolu par email, débit + crédit dans une seule
      // transaction (verrou FOR UPDATE). Le client ne peut cibler aucun autre
      // solde ni créditer sans débiter.
      const { data, error } = await supabase.rpc('transfer_credits', {
        p_recipient_email: recipientEmail.trim().toLowerCase(),
        p_amount: amountNum,
      });
      if (error) {
        const m = error.message || '';
        if (m.includes('insufficient_balance')) throw new Error('Solde insuffisant au moment du transfert.');
        if (m.includes('recipient_not_found')) throw new Error("Aucun compte trouvé avec cet email. Vérifiez l'adresse.");
        if (m.includes('self_transfer')) throw new Error('Impossible de vous transférer des crédits à vous-même.');
        if (m.includes('invalid_amount')) throw new Error('Montant invalide.');
        throw new Error(m || 'Une erreur est survenue.');
      }
      const res = Array.isArray(data) ? data[0] : data;
      if (res?.recipient_name) setRecipientName(res.recipient_name);

      // Journaliser le transfert dans orders (product_id=998 = code transfert)
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
export default TransferCreditsModal;
