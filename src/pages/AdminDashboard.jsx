import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, X, Eye, RefreshCw, Loader2 } from 'lucide-react';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

export default function AdminDashboard() {
    const [authed, setAuthed] = useState(false);
    const [password, setPassword] = useState('');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState('all');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [credentials, setCredentials] = useState('');
    const [adminNote, setAdminNote] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => { if (authed) fetchOrders(); }, [authed, filter]);

    const fetchOrders = async () => {
        setLoading(true);
        let query = supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
        if (filter !== 'all') query = query.eq('status', filter);
        const { data } = await query;
        setOrders(data || []);
        setLoading(false);
    };

    const confirmOrder = async (order) => {
        let finalCredentials = credentials.trim();
        setActionLoading(true);

        // Si les credentials sont vides, on tente de les récupérer automatiquement du stock
        if (!finalCredentials) {
            const qty = order.quantity || 1;
            const { data: stockRows, error: stockErr } = await supabase
                .from('account_stock')
                .select('id, credentials')
                .eq('product_id', order.product_id)
                .eq('is_delivered', false)
                .limit(qty);

            if (stockErr || !stockRows || stockRows.length < qty) {
                alert(`⚠️ Stock insuffisant pour la livraison automatique (${stockRows?.length || 0} dispo). Veuillez entrer les credentials manuellement.`);
                setActionLoading(false);
                return;
            }

            finalCredentials = stockRows.map(r => r.credentials).join('\n');
            const stockIds = stockRows.map(r => r.id);

            // Marquer comme livré dans account_stock
            await supabase.from('account_stock').update({
                is_delivered: true,
                order_id: String(order.id),
                delivered_to: order.user_id,
            }).in('id', stockIds);
        }

        await supabase
            .from('orders')
            .update({
                status: 'confirmed',
                credentials: finalCredentials,
                admin_note: adminNote.trim() || null,
                confirmed_at: new Date().toISOString(),
                data: finalCredentials,
            })
            .eq('id', order.id);

        setSelectedOrder(null);
        setCredentials('');
        setAdminNote('');
        fetchOrders();
        setActionLoading(false);
    };

    const cancelOrder = async (id) => {
        if (!confirm('Annuler cette commande ?')) return;
        await supabase.from('orders').update({ status: 'cancelled' }).eq('id', id);
        fetchOrders();
    };

    const statusBadge = (status) => {
        const map = {
            pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
            confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
            cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
        };
        const labels = { pending: '⏳ En attente', confirmed: '✅ Confirmé', cancelled: '❌ Annulé' };
        return (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${map[status] || map.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    // ── Login ──────────────────────────────────────────────────
    if (!authed) return (
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#0F1117] border border-white/10 rounded-3xl p-8 space-y-4">
                <h1 className="text-white text-2xl font-bold text-center">🔐 Admin</h1>
                <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && setAuthed(password === ADMIN_PASSWORD)}
                    placeholder="Mot de passe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 transition-all"
                />
                <button
                    onClick={() => setAuthed(password === ADMIN_PASSWORD)}
                    className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-all">
                    Entrer
                </button>
                {password && password !== ADMIN_PASSWORD && (
                    <p className="text-red-400 text-sm text-center">Mot de passe incorrect</p>
                )}
            </div>
        </div>
    );

    // ── Dashboard ──────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#0A0A0F] p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-white text-2xl font-bold">Dashboard Admin</h1>
                        <p className="text-white/40 text-sm">{orders.length} commande(s)</p>
                    </div>
                    <button onClick={fetchOrders}
                        className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:text-white transition-all">
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Filtres */}
                <div className="flex gap-2 flex-wrap">
                    {[
                        { key: 'pending', label: '⏳ En attente' },
                        { key: 'confirmed', label: '✅ Confirmés' },
                        { key: 'cancelled', label: '❌ Annulés' },
                        { key: 'all', label: '📋 Tous' },
                    ].map(f => (
                        <button key={f.key} onClick={() => setFilter(f.key)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === f.key
                                    ? 'bg-violet-600 text-white'
                                    : 'bg-white/5 text-white/50 hover:text-white border border-white/10'
                                }`}>
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-[#0F1117] border border-white/10 rounded-2xl overflow-x-auto">
                    {loading ? (
                        <div className="p-12 text-center text-white/40 flex items-center justify-center gap-2">
                            <Loader2 size={16} className="animate-spin" /> Chargement...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="p-12 text-center text-white/40">Aucune commande</div>
                    ) : (
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    {['Produit', 'Email', 'Prix', 'TX Binance', 'Statut', 'Date', ''].map(h => (
                                        <th key={h} className="text-left text-white/40 text-xs uppercase tracking-wider px-5 py-4">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="text-white text-sm font-medium">{order.product_name}</p>
                                            <p className="text-white/30 text-xs font-mono">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </p>
                                        </td>
                                        <td className="px-5 py-4 text-white/70 text-sm">{order.buyer_email || '—'}</td>
                                        <td className="px-5 py-4 text-emerald-400 font-mono text-sm font-bold">
                                            ${order.total_price}
                                        </td>
                                        <td className="px-5 py-4">
                                            {order.binance_tx_id
                                                ? <span className="text-white/60 font-mono text-xs bg-white/5 px-2 py-1 rounded-lg">{order.binance_tx_id}</span>
                                                : <span className="text-white/20 text-xs italic">Non fourni</span>
                                            }
                                        </td>
                                        <td className="px-5 py-4">{statusBadge(order.status)}</td>
                                        <td className="px-5 py-4 text-white/30 text-xs whitespace-nowrap">
                                            {new Date(order.created_at).toLocaleDateString('fr-FR', {
                                                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex gap-2">
                                                {order.status === 'pending' && <>
                                                    <button
                                                        onClick={() => { setSelectedOrder(order); setCredentials(''); setAdminNote(''); }}
                                                        className="p-2 rounded-lg bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-all"
                                                        title="Confirmer">
                                                        <Check size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => cancelOrder(order.id)}
                                                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                                        title="Annuler">
                                                        <X size={14} />
                                                    </button>
                                                </>}
                                                {order.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => setSelectedOrder(order)}
                                                        className="p-2 rounded-lg bg-white/10 text-white/40 hover:bg-white/20 transition-all"
                                                        title="Voir credentials">
                                                        <Eye size={14} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Modal confirm / détail ────────────────────────────── */}
            {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
                    <div className="relative w-full max-w-5xl bg-[#0F1117] border border-white/10 rounded-[2.5rem] shadow-2xl p-10 space-y-8 animate-in fade-in zoom-in duration-300">

                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-bold text-lg">
                                {selectedOrder.status === 'pending' ? 'Confirmer la commande' : 'Détail commande'}
                            </h3>
                            <button onClick={() => setSelectedOrder(null)}
                                className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                                <X size={16} />
                            </button>
                        </div>

                        {/* Infos */}
                        <div className="bg-white/5 rounded-2xl p-4 space-y-2 text-sm">
                            <Row label="Produit" value={selectedOrder.product_name} />
                            <Row label="Email" value={selectedOrder.buyer_email || '—'} />
                            <Row label="Montant" value={`$${selectedOrder.total_price}`} accent />
                            <Row label="Quantité" value={selectedOrder.quantity} />
                            {selectedOrder.binance_tx_id &&
                                <Row label="TX Binance" value={selectedOrder.binance_tx_id} mono />}
                        </div>

                        {selectedOrder.status === 'pending' ? (<>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Credentials à livrer *</label>
                                <textarea
                                    value={credentials}
                                    onChange={e => setCredentials(e.target.value)}
                                    placeholder={"email@gmail.com\nPassword: MonMotDePasse123\nRécupération: backup@email.com\n..."}
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 font-mono text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-white/70 text-sm mb-2">
                                    Note admin <span className="text-white/30">(optionnel)</span>
                                </label>
                                <input
                                    value={adminNote}
                                    onChange={e => setAdminNote(e.target.value)}
                                    placeholder="ex: Vérifié sur Binance ✓"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>
                            <button onClick={() => confirmOrder(selectedOrder)} disabled={actionLoading}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                                {actionLoading
                                    ? <><Loader2 size={16} className="animate-spin" /> Confirmation...</>
                                    : '✅ Confirmer et enregistrer les credentials'}
                            </button>
                        </>) : (
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Credentials livrés</label>
                                <div className="bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 font-mono text-sm text-emerald-300 whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{
                                        __html: (selectedOrder.credentials || selectedOrder.data || '—').replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '<span class="bg-emerald-500/10 text-emerald-400 font-black px-1.5 py-0.5 rounded-md">$1</span>')
                                    }}
                                />
                                {selectedOrder.admin_note && (
                                    <p className="text-white/40 text-xs mt-2">📝 {selectedOrder.admin_note}</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// Petit composant utilitaire pour les lignes d'info
function Row({ label, value, accent, mono }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-white/50">{label}</span>
            <span className={`font-medium ${accent ? 'text-emerald-400 font-mono font-bold' : mono ? 'text-white/60 font-mono text-xs' : 'text-white'}`}>
                {value}
            </span>
        </div>
    );
}