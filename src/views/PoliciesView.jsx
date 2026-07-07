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
export default PoliciesView;
