import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Store, UploadCloud, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';

const VendorView = ({ session, profile, fetchProfile, navigate }) => {
  const [loading, setLoading] = useState(false);
  const [cniUrl, setCniUrl] = useState('');

  if (!profile) return <div className="p-20 text-center">Chargement...</div>;

  const requestVendorStatus = async () => {
    if (!cniUrl) return alert("Veuillez fournir un lien vers votre pièce d'identité.");
    setLoading(true);
    const { error } = await supabase.from('profiles').update({ vendor_status: 'pending', cni_url: cniUrl }).eq('id', profile.id);
    if (!error) await fetchProfile(profile.id);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-canvas dark:bg-gray-950 p-6 md:p-12 font-sans text-gray-900 dark:text-white">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <Store size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black">Espace Vendeur</h1>
            <p className="text-gray-500 dark:text-gray-400">Gérez votre boutique et vos gains.</p>
          </div>
        </div>

        {profile.vendor_status === 'none' && (
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-soft border border-gray-100 dark:border-slate-800 space-y-6 text-center">
            <h2 className="text-xl font-bold">Devenir Vendeur</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Pour vendre sur notre plateforme, vous devez faire vérifier votre identité. Notre commission est de 15% par vente.</p>
            <div className="max-w-md mx-auto space-y-4 text-left">
              <label className="block text-xs font-bold uppercase text-gray-400">Lien vers votre pièce d'identité (Image/PDF)</label>
              <input type="text" value={cniUrl} onChange={e => setCniUrl(e.target.value)} placeholder="https://..." className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-slate-700 dark:bg-slate-800 outline-none focus:ring-2 focus:ring-primary" />
              <button onClick={requestVendorStatus} disabled={loading} className="w-full h-12 bg-primary text-white rounded-xl font-bold flex items-center justify-center hover:bg-primaryDark transition-all">
                Soumettre ma demande
              </button>
            </div>
          </div>
        )}

        {profile.vendor_status === 'pending' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 rounded-[3rem] p-10 text-center">
            <Clock size={48} className="mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-bold text-yellow-700 dark:text-yellow-500">Demande en cours d'examen</h2>
            <p className="text-yellow-600 dark:text-yellow-600 mt-2">L'équipe examine votre candidature. Vous recevrez une réponse sous peu.</p>
          </div>
        )}

        {profile.vendor_status === 'approved' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center"><DollarSign size={24} /></div>
                <div>
                  <div className="text-xs font-black text-gray-400 uppercase">Solde Vendeur</div>
                  <div className="text-3xl font-black font-mono mt-1">${Number(profile.vendor_balance || 0).toFixed(2)}</div>
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-6">
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center"><CheckCircle size={24} /></div>
                <div>
                  <div className="text-xs font-black text-gray-400 uppercase">Statut</div>
                  <div className="text-xl font-black mt-1 text-green-600">Vendeur Vérifié</div>
                </div>
              </div>
            </div>
            
            {/* TODO: Products Management & Withdrawal History */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Mes Produits</h3>
                <p className="text-gray-500 italic">Interface de gestion des produits à venir...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorView;
