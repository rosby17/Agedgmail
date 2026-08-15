import React from 'react';
import { Globe2, Clock } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// Placeholder — l'intégration IPRoyal (achat en libre-service de proxys
// résidentiels) est en cours. Cette page évite un lien de nav mort tant que
// le flux d'achat complet (voir plan "Proxy") n'est pas branché.
const ProxyView = ({ navigate, session, profile, lang, t }) => {
  const isFr = lang === 'fr';
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Navbar navigate={navigate} session={session} profile={profile} currentView="proxy" lang={lang} t={t} cartTotal={0} cartCount={0} onCartClick={() => {}} setLang={() => {}} theme="light" setTheme={() => {}} />
      <main className="flex-1 max-w-3xl mx-auto px-6 py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <Globe2 size={28} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
          {isFr ? 'Proxys résidentiels — bientôt disponibles' : 'Residential proxies — coming soon'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-2">
          <Clock size={14} />
          {isFr
            ? "On finalise l'intégration avec notre fournisseur. Reviens bientôt."
            : "We're finishing the integration with our provider. Check back soon."}
        </p>
      </main>
      <Footer navigate={navigate} lang={lang} />
    </div>
  );
};

export default ProxyView;
