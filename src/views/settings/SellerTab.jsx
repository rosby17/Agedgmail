import { ShoppingBag } from 'lucide-react';

const SellerTab = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Devenir Vendeur</h3>
        <p className="text-xs text-gray-400 dark:text-slate-400">Rejoins les fournisseurs officiels d'AgedGmail.</p>
      </div>

      <div className="p-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-[2rem] text-center space-y-4 bg-gray-50/30 dark:bg-slate-900/20">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag size={28} />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <h4 className="font-bold text-sm text-gray-900 dark:text-white">Fonctionnalité en cours de développement</h4>
          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
            Tu souhaites vendre tes propres comptes certifiés (Gmail, Outlook, Discord, etc.) sur notre marketplace ? Cette intégration fournisseur sera activée prochainement. Tu pourras gérer ton stock local et suivre tes ventes en temps réel.
          </p>
        </div>
        <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider scale-95">
          Disponible Prochainement
        </div>
      </div>
    </div>
  );
};

export default SellerTab;
