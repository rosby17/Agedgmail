import { useState } from 'react';
import { X, Copy, Check, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const BINANCE_PAY_ID = 'TON_BINANCE_ID_ICI'; // ← remplace ici

const GUEST_UUID = '00000000-0000-0000-0000-000000000000'; // user_id fixe tant qu'il n'y a pas d'auth

export default function OrderModal({ product, onClose }) {
    const [step, setStep] = useState('form');
    const [email, setEmail] = useState('');
    const [txId, setTxId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [orderId, setOrderId] = useState('');

    const copyId = async () => {
        await navigator.clipboard.writeText(BINANCE_PAY_ID);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setError('Email invalide');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const { data, error: dbErr } = await supabase
                .from('orders')
                .insert({
                    user_id: GUEST_UUID,
                    product_id: product.id,
                    product_name: product.name,
                    quantity: 1,
                    total_price: product.price,
                    buyer_email: email,
                    binance_tx_id: txId || null,
                    status: 'pending',
                })
                .select('id')
                .single();

            if (dbErr) throw new Error(dbErr.message);
            setOrderId(data.id.slice(0, 8).toUpperCase());
            setStep('success');
        } catch (e) {
            setError(e.message || 'Erreur, réessaie.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-md bg-[#0F1117] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-white font-semibold text-lg">Commander</h2>
                        <p className="text-white/50 text-sm mt-0.5">
                            {product.name} — <span className="text-emerald-400 font-mono">${product.price}</span>
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Instructions paiement */}
                            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 space-y-3">
                                <p className="text-yellow-400 font-semibold text-sm">📱 Comment payer</p>
                                <ol className="text-white/60 text-sm space-y-1 list-decimal list-inside">
                                    <li>Ouvre ton application Binance</li>
                                    <li>Va dans <strong className="text-white/80">Pay → Envoyer</strong></li>
                                    <li>Utilise cet ID Pay :</li>
                                </ol>
                                <div className="flex items-center justify-between bg-black/40 rounded-xl px-4 py-3 border border-white/10">
                                    <span className="font-mono text-white font-bold text-lg tracking-widest">
                                        {BINANCE_PAY_ID}
                                    </span>
                                    <button type="button" onClick={copyId}
                                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-all">
                                        {copied
                                            ? <Check size={14} className="text-emerald-400" />
                                            : <Copy size={14} />}
                                    </button>
                                </div>
                                <p className="text-white/40 text-xs">
                                    Envoie exactement{' '}
                                    <span className="text-white font-mono">${product.price} USDT</span>
                                </p>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Ton email *</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="ton@email.com"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    required
                                />
                                <p className="text-white/30 text-xs mt-1">
                                    Les credentials te seront envoyés ici après confirmation.
                                </p>
                            </div>

                            {/* TX ID */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">
                                    ID de transaction Binance{' '}
                                    <span className="text-white/30">(optionnel mais recommandé)</span>
                                </label>
                                <input
                                    type="text"
                                    value={txId}
                                    onChange={e => setTxId(e.target.value)}
                                    placeholder="ex: 123456789012345"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 font-mono text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                />
                                <p className="text-white/30 text-xs mt-1">
                                    Accélère la vérification de ton paiement.
                                </p>
                            </div>

                            {error && (
                                <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                                {loading
                                    ? <><Loader2 size={16} className="animate-spin" /> Envoi...</>
                                    : "J'ai payé, soumettre ma commande ✓"}
                            </button>
                        </form>
                    )}

                    {step === 'success' && (
                        <div className="text-center space-y-4 py-4">
                            <CheckCircle2 size={56} className="text-emerald-400 mx-auto" />
                            <h3 className="text-white text-xl font-bold">Commande reçue !</h3>
                            <p className="text-white/60 text-sm">
                                Ta commande est en attente de vérification. Tu recevras les credentials à{' '}
                                <strong className="text-white">{email}</strong> sous peu.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                                    Référence commande
                                </p>
                                <p className="text-white font-mono font-bold text-lg">#{orderId}</p>
                            </div>
                            <p className="text-white/30 text-xs">
                                Délai habituel : 5–30 minutes après vérification.
                            </p>
                            <button onClick={onClose}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all">
                                Fermer
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}