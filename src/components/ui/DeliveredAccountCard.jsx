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
export default DeliveredAccountCard;
