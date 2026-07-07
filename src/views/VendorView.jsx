import React, { useState } from 'react';
import { 
  Store, LayoutDashboard, Package, ShoppingBag, 
  Wallet, UserCheck, LogOut, ArrowUpRight, DollarSign, 
  Clock, CheckCircle, TrendingUp, Search, Plus, ExternalLink,
  ChevronRight, CreditCard
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_SALES_DATA = [
  { name: 'Lun', sales: 400 },
  { name: 'Mar', sales: 300 },
  { name: 'Mer', sales: 550 },
  { name: 'Jeu', sales: 450 },
  { name: 'Ven', sales: 700 },
  { name: 'Sam', sales: 850 },
  { name: 'Dim', sales: 900 }
];

const MOCK_PRODUCTS = [
  { id: 1, name: 'Spotify Premium 1 Mois', price: 2.50, stock: 45, status: 'active', sales: 120 },
  { id: 2, name: 'Netflix 4K 1 Mois', price: 3.50, stock: 12, status: 'active', sales: 340 },
  { id: 3, name: 'Disney+ 1 An', price: 15.00, stock: 0, status: 'out_of_stock', sales: 50 },
];

const MOCK_ORDERS = [
  { id: '#1029', product: 'Netflix 4K 1 Mois', customer: 'user12@gmail.com', date: 'Aujourd\'hui, 14:30', amount: 3.50, status: 'pending' },
  { id: '#1028', product: 'Spotify Premium 1 Mois', customer: 'mark@test.com', date: 'Hier, 09:15', amount: 2.50, status: 'delivered' },
  { id: '#1027', product: 'Spotify Premium 1 Mois', customer: 'john@doe.com', date: 'Hier, 08:00', amount: 2.50, status: 'delivered' },
];

const MOCK_WITHDRAWALS = [
  { id: 'W-001', amount: 150.00, date: '01/07/2026', method: 'Binance Pay', status: 'completed' },
  { id: 'W-002', amount: 45.50, date: '05/07/2026', method: 'Orange Money', status: 'pending' }
];

const FORMAT_OPTIONS = [
  { id: 'email', label: 'Email' },
  { id: 'password', label: 'Mot de passe' },
  { id: 'recovery_email', label: 'Email de récupération' },
  { id: 'recovery_pass', label: 'Mot de passe de récupération' },
  { id: '2fa_gfa', label: 'Code 2FA (GFA)' },
  { id: '2fa_ufa', label: 'Code 2FA (UFA)' },
  { id: 'youtube_link', label: 'Lien Chaîne YouTube' },
];

const VendorView = ({ session, profile, navigate }) => {
  const [currentTab, setCurrentTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: '', format: '', stock: '' });

  const handleFormatToggle = (id) => {
    let formats = newProduct.format ? newProduct.format.split(':').filter(Boolean) : [];
    if (formats.includes(id)) {
      formats = formats.filter(f => f !== id);
    } else {
      formats.push(id);
    }
    setNewProduct({ ...newProduct, format: formats.join(':') });
  };

  // Fallbacks if profile is missing
  const vendorStatus = profile?.vendor_status || 'approved'; // Force approved for mockup view
  const isApproved = vendorStatus === 'approved';

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <LayoutDashboard size={20} /> },
    { id: 'products', label: 'Mes Produits', icon: <Package size={20} /> },
    { id: 'orders', label: 'Ventes & Commandes', icon: <ShoppingBag size={20} /> },
    { id: 'withdrawals', label: 'Retraits', icon: <Wallet size={20} /> },
    { id: 'identity', label: 'Identité', icon: <UserCheck size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-canvas dark:bg-gray-950 font-sans text-gray-900 dark:text-white flex flex-col md:flex-row">
      
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-gray-100 dark:border-slate-800 md:min-h-screen shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800">
          <div className="w-10 h-10 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
            <Store size={20} />
          </div>
          <div>
            <h1 className="font-black text-sm">Espace Vendeur</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{profile?.username || 'Vendeur'}</p>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                currentTab === item.id 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20' 
                  : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800/50 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <button 
            onClick={() => navigate('home')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all mt-8"
          >
            <LogOut size={20} /> Retour au site
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 max-h-screen overflow-y-auto">
        <div className="max-w-6xl mx-auto space-y-8">
          
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-3xl font-black">{menuItems.find(i => i.id === currentTab)?.label}</h2>
              <p className="text-sm text-gray-500 mt-1">Gérez vos activités et vos revenus en temps réel.</p>
            </div>
            
            <div className="hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-full border border-gray-100 dark:border-slate-800 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-gray-500">Statut: <span className="text-green-500">Vérifié</span></span>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {currentTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center"><DollarSign size={24} /></div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Revenus générés</div>
                  </div>
                  <div className="text-4xl font-black font-mono">$1,245.50</div>
                  <div className="flex items-center gap-2 mt-2 text-xs font-bold text-green-500">
                    <TrendingUp size={14} /> +12.5% ce mois
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-2xl flex items-center justify-center"><Wallet size={24} /></div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Solde Disponible</div>
                  </div>
                  <div className="text-4xl font-black font-mono">$320.00</div>
                  <div className="mt-2 text-xs font-bold text-gray-400">Prêt à être retiré</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center"><ShoppingBag size={24} /></div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Ventes réalisées</div>
                  </div>
                  <div className="text-4xl font-black font-mono">510</div>
                  <div className="mt-2 text-xs font-bold text-gray-400">Commandes traitées</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-purple-500/10 text-purple-500 rounded-2xl flex items-center justify-center"><UserCheck size={24} /></div>
                    <div className="text-xs font-black text-gray-400 uppercase tracking-widest">Total Clients</div>
                  </div>
                  <div className="text-4xl font-black font-mono">284</div>
                  <div className="mt-2 text-xs font-bold text-gray-400">Acheteurs uniques</div>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-bold">Évolution des revenus (7 derniers jours)</h3>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_SALES_DATA}>
                      <defs>
                        <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} tickFormatter={(val) => `$${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#f97316', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {currentTab === 'products' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              {!showAddProduct ? (
                <>
                  <div className="flex justify-between items-center">
                    <div className="relative w-64">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="Rechercher un produit..." className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-sm focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <button onClick={() => setShowAddProduct(true)} className="flex items-center gap-2 bg-orange-500 text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-colors shadow-md shadow-orange-500/20">
                      <Plus size={16} /> Ajouter un produit
                    </button>
                  </div>

                  <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                            <th className="pb-4 font-normal">Produit</th>
                            <th className="pb-4 font-normal">Prix de vente</th>
                            <th className="pb-4 font-normal">Stock dispo.</th>
                            <th className="pb-4 font-normal">Ventes totales</th>
                            <th className="pb-4 font-normal">Statut</th>
                            <th className="pb-4 font-normal text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                          {MOCK_PRODUCTS.map(p => (
                            <tr key={p.id} className="text-gray-700 dark:text-gray-300">
                              <td className="py-5 font-bold">{p.name}</td>
                              <td className="py-5 font-mono">${p.price.toFixed(2)}</td>
                              <td className="py-5">{p.stock > 0 ? <span className="text-green-500 font-bold">{p.stock}</span> : <span className="text-red-500 font-bold">Rupture</span>}</td>
                              <td className="py-5 font-bold">{p.sales}</td>
                              <td className="py-5">
                                {p.status === 'active' ? (
                                  <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase">En ligne</span>
                                ) : (
                                  <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-[10px] font-bold uppercase">Hors ligne</span>
                                )}
                              </td>
                              <td className="py-5 text-right">
                                <button className="text-orange-500 hover:text-orange-600 font-bold text-xs uppercase tracking-wider">Éditer</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm p-8">
                  <div className="flex justify-between items-center mb-8 border-b border-gray-100 dark:border-slate-800 pb-6">
                    <h3 className="text-xl font-bold">Ajouter un nouveau produit</h3>
                    <button onClick={() => setShowAddProduct(false)} className="text-gray-500 hover:text-gray-700 font-bold text-sm bg-gray-50 dark:bg-slate-800 px-4 py-2 rounded-xl">Retour à la liste</button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nom du produit</label>
                        <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Ex: Netflix 1 Mois..." className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors" />
                      </div>
                      <div className="flex gap-4">
                        <div className="w-1/2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Catégorie</label>
                          <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors appearance-none">
                            <option value="">Sélectionner...</option>
                            <option value="streaming">Streaming</option>
                            <option value="gaming">Jeux Vidéo</option>
                            <option value="vpn">VPN</option>
                            <option value="software">Logiciels</option>
                          </select>
                        </div>
                        <div className="w-1/2">
                          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prix (USDT)</label>
                          <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="0.00" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors font-mono" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Stock / Inventaire (Optionnel si auto)</label>
                        <input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} placeholder="100" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors font-mono" />
                        <p className="text-[10px] text-gray-400 mt-2">Le stock sera automatiquement mis à jour si vous ajoutez des lignes de livraison.</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-orange-500/5 border border-orange-500/20 p-6 rounded-[2rem]">
                        <h4 className="text-orange-600 font-bold mb-2">Format de livraison exigé</h4>
                        <p className="text-xs text-orange-600/80 mb-6">Cochez les informations que vous devrez fournir pour chaque compte vendu. Le système imposera ce format strict.</p>
                        
                        <div className="flex flex-wrap gap-3 mb-6">
                          {FORMAT_OPTIONS.map(opt => {
                            const isSelected = newProduct.format.split(':').includes(opt.id);
                            return (
                              <button
                                key={opt.id}
                                onClick={() => handleFormatToggle(opt.id)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border ${
                                  isSelected 
                                    ? 'bg-orange-500 border-orange-500 text-white' 
                                    : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-700 text-gray-500'
                                }`}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        
                        <label className="block text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">Aperçu du format final</label>
                        <div className="w-full px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-orange-500/30 text-orange-600 font-mono text-sm break-all">
                          {newProduct.format || 'Sélectionnez au moins un champ'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                    <button className="bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all">
                      Sauvegarder le produit
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {currentTab === 'orders' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex gap-4 mb-6">
                <button className="px-5 py-2.5 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm">À Livrer (1)</button>
                <button className="px-5 py-2.5 rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-gray-500 font-bold text-sm">Historique (150)</button>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                        <th className="pb-4 font-normal">Commande</th>
                        <th className="pb-4 font-normal">Client</th>
                        <th className="pb-4 font-normal">Date</th>
                        <th className="pb-4 font-normal">Montant</th>
                        <th className="pb-4 font-normal">Statut</th>
                        <th className="pb-4 font-normal text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                      {MOCK_ORDERS.map((o, idx) => (
                        <tr key={idx} className="text-gray-700 dark:text-gray-300">
                          <td className="py-5">
                            <div className="font-bold">{o.product}</div>
                            <div className="text-xs text-gray-400 font-mono mt-0.5">{o.id}</div>
                          </td>
                          <td className="py-5 text-gray-500">{o.customer}</td>
                          <td className="py-5 text-gray-500">{o.date}</td>
                          <td className="py-5 font-mono font-bold">${o.amount.toFixed(2)}</td>
                          <td className="py-5">
                            {o.status === 'pending' ? (
                              <span className="px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-600 text-[10px] font-bold uppercase flex items-center gap-1 w-max"><Clock size={10}/> En attente</span>
                            ) : (
                              <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase flex items-center gap-1 w-max"><CheckCircle size={10}/> Livré</span>
                            )}
                          </td>
                          <td className="py-5 text-right">
                            {o.status === 'pending' ? (
                              <button className="bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-600 transition-colors">
                                Livrer la commande
                              </button>
                            ) : (
                              <button className="text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-wider">
                                Détails
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* WITHDRAWALS TAB */}
          {currentTab === 'withdrawals' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-900 dark:bg-slate-800 p-8 rounded-[2rem] text-white flex justify-between items-center shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px] -mr-20 -mt-20"></div>
                  <div className="relative z-10">
                    <div className="text-sm font-bold text-slate-400 mb-1">Solde Retirable</div>
                    <div className="text-5xl font-black font-mono text-white">$320.00</div>
                  </div>
                  <button className="relative z-10 bg-orange-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-600 transition-all flex items-center gap-2">
                    <CreditCard size={18} /> Demander un retrait
                  </button>
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-center">
                  <div className="text-sm font-bold text-gray-400 mb-4">Moyens de paiement enregistrés</div>
                  <div className="flex items-center justify-between p-4 border border-gray-100 dark:border-slate-700 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-yellow-500/10 text-yellow-600 rounded-xl flex items-center justify-center font-black">B</div>
                      <div>
                        <div className="font-bold text-sm">Binance Pay (USDT)</div>
                        <div className="text-xs text-gray-400 font-mono">ID: 293847561</div>
                      </div>
                    </div>
                    <button className="text-orange-500 text-xs font-bold uppercase">Modifier</button>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-bold mb-4">Historique des retraits</h3>
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-gray-100 dark:border-slate-800 shadow-sm p-6 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-slate-800">
                      <th className="pb-4 font-normal">ID</th>
                      <th className="pb-4 font-normal">Montant</th>
                      <th className="pb-4 font-normal">Méthode</th>
                      <th className="pb-4 font-normal">Date</th>
                      <th className="pb-4 font-normal text-right">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-slate-800/50">
                    {MOCK_WITHDRAWALS.map(w => (
                      <tr key={w.id} className="text-gray-700 dark:text-gray-300">
                        <td className="py-5 font-mono">{w.id}</td>
                        <td className="py-5 font-mono font-bold">${w.amount.toFixed(2)}</td>
                        <td className="py-5 font-bold">{w.method}</td>
                        <td className="py-5 text-gray-500">{w.date}</td>
                        <td className="py-5 text-right">
                          {w.status === 'completed' ? (
                            <span className="text-green-500 font-bold text-xs uppercase flex items-center justify-end gap-1"><CheckCircle size={12}/> Payé</span>
                          ) : (
                            <span className="text-yellow-500 font-bold text-xs uppercase flex items-center justify-end gap-1"><Clock size={12}/> En cours</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* IDENTITY TAB */}
          {currentTab === 'identity' && (
            <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-gray-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-4 mb-10 pb-8 border-b border-gray-100 dark:border-slate-800">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                    <UserCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">Vérification d'identité (KYC)</h3>
                    <p className="text-sm text-gray-500 mt-1">Conformément aux réglementations, veuillez vérifier votre identité pour débloquer les paiements.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h4 className="font-bold text-lg border-b border-gray-100 dark:border-slate-800 pb-2">Informations personnelles</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Prénom</label>
                        <input type="text" placeholder="John" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Nom</label>
                        <input type="text" placeholder="Doe" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Date de naissance</label>
                      <input type="date" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Adresse de résidence</label>
                      <input type="text" placeholder="123 Rue de la Paix, Ville, Pays" className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors" />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h4 className="font-bold text-lg border-b border-gray-100 dark:border-slate-800 pb-2">Document officiel</h4>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Type de document</label>
                      <select className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors appearance-none">
                        <option value="id_card">Carte d'Identité Nationale</option>
                        <option value="passport">Passeport</option>
                        <option value="driver_license">Permis de conduire</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Numéro du document</label>
                      <input type="text" placeholder="Numéro d'identification..." className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 focus:border-orange-500 outline-none transition-colors font-mono" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Télécharger le document (Recto / Verso)</label>
                      <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-2xl p-8 text-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-3">
                        <div className="w-12 h-12 bg-orange-500/10 text-orange-500 rounded-xl flex items-center justify-center">
                          <Plus size={24} />
                        </div>
                        <div className="text-sm font-bold text-gray-600 dark:text-gray-400">Cliquez pour importer un fichier PDF, JPG ou PNG</div>
                        <div className="text-[10px] text-gray-400 uppercase tracking-widest">Taille max : 5 MB</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                    Soumettre pour vérification
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default VendorView;
