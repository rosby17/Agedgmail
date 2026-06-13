import { useState } from 'react';
import { X, Loader2, CheckCircle2, Smartphone, ExternalLink } from 'lucide-react';
import { supabase } from '../supabaseClient';

// ─── CONFIG MONEYFUSION ───────────────────────────────────────────────────────
// Remplace par ton URL API générée dans ton dashboard MoneyFusion
const MONEYFUSION_API_URL = 'https://pay.moneyfusion.net/Agedgmailyt/de325ce326e2de1f/pay/';
// URL de ton site vers laquelle MF redirige après paiement
const RETURN_URL = 'https://agedgmail.tools-cl.com/merci';
// URL webhook (backend ou Supabase Edge Function) qui reçoit la confirmation
const WEBHOOK_URL = 'https://agedgmail.tools-cl.com/api/payment-webhook';
// ─────────────────────────────────────────────────────────────────────────────

const GUEST_UUID = '00000000-0000-0000-0000-000000000000';

// Taux de conversion USD → FCFA (à mettre à jour régulièrement ou via une API)
const USD_TO_FCFA = 600;

export default function OrderModal({ product, onClose }) {
    const [step, setStep] = useState('form'); // 'form' | 'redirecting' | 'success' | 'error'
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [orderId, setOrderId] = useState('');
    const [payUrl, setPayUrl] = useState('');

    // Prix converti en FCFA
    const priceFcfa = Math.round(product.price * USD_TO_FCFA);

    const validateForm = () => {
        if (!name.trim()) return 'Ton nom est requis.';
        if (!phone.trim() || phone.trim().length < 8) return 'Numéro de téléphone invalide.';
        if (!email || !/\S+@\S+\.\S+/.test(email)) return 'Adresse email invalide.';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) { setError(validationError); return; }

        setLoading(true);
        setError('');

        try {
            // 1. Créer la commande dans Supabase (statut pending)
            const { data: orderData, error: dbErr } = await supabase
                .from('orders')
                .insert({
                    user_id: GUEST_UUID,
                    product_id: product.id,
                    product_name: product.name,
                    quantity: 1,
                    total_price: product.price,
                    buyer_email: email,
                    status: 'pending',
                })
                .select('id')
                .single();

            if (dbErr) throw new Error(dbErr.message);
            const shortOrderId = orderData.id.slice(0, 8).toUpperCase();
            setOrderId(shortOrderId);

            // 2. Appeler l'API MoneyFusion pour initier le paiement
            const paymentPayload = {
                totalPrice: priceFcfa,
                article: [{ [product.name]: priceFcfa }],
                personal_Info: [{ orderId: orderData.id }],
                numeroSend: phone.trim(),
                nomclient: name.trim(),
                return_url: RETURN_URL,
                webhook_url: WEBHOOK_URL,
            };

            const res = await fetch(MONEYFUSION_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentPayload),
            });

            if (!res.ok) throw new Error(`Erreur réseau : ${res.status}`);
            const mfData = await res.json();

            if (!mfData.statut || !mfData.url) {
                throw new Error(mfData.message || 'Réponse inattendue de MoneyFusion.');
            }

            // 3. Mettre à jour la commande avec le token MoneyFusion
            await supabase
                .from('orders')
                .update({ moneyfusion_token: mfData.token })
                .eq('id', orderData.id);

            setPayUrl(mfData.url);
            setStep('redirecting');

        } catch (err) {
            setError(err.message || 'Une erreur est survenue. Réessaie.');
        } finally {
            setLoading(false);
        }
    };

    const openPaymentPage = () => {
        window.open(payUrl, '_blank', 'noopener,noreferrer');
        setStep('success');
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
                            {product.name} —{' '}
                            <span className="text-emerald-400 font-mono">
                                {priceFcfa.toLocaleString('fr-FR')} FCFA
                            </span>
                            <span className="text-white/30 text-xs ml-1">(${product.price})</span>
                        </p>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6">

                    {/* ── ÉTAPE 1 : Formulaire ── */}
                    {step === 'form' && (
                        <form onSubmit={handleSubmit} className="space-y-5">

                            {/* Moyens de paiement acceptés */}
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                                <p className="text-emerald-400 font-semibold text-sm mb-2 flex items-center gap-2">
                                    <Smartphone size={15} /> Paiement Mobile Money
                                </p>
                                <p className="text-white/50 text-xs">
                                    Orange Money · MTN MoMo · Wave · Moov · Airtel Money
                                </p>
                                <p className="text-white/40 text-xs mt-1">
                                    Tu seras redirigé vers la page de paiement sécurisée MoneyFusion.
                                </p>
                            </div>

                            {/* Nom */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">Ton nom *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="Jean Dupont"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    required
                                />
                            </div>

                            {/* Téléphone */}
                            <div>
                                <label className="block text-white/70 text-sm mb-2">
                                    Numéro Mobile Money *
                                </label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                    placeholder="ex: 6XXXXXXXX"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 font-mono text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    required
                                />
                                <p className="text-white/30 text-xs mt-1">
                                    Numéro sur lequel tu effectueras le paiement.
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

                            {error && (
                                <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-3">
                                    {error}
                                </p>
                            )}

                            <button type="submit" disabled={loading}
                                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                                {loading
                                    ? <><Loader2 size={16} className="animate-spin" /> Préparation...</>
                                    : `Payer ${priceFcfa.toLocaleString('fr-FR')} FCFA →`}
                            </button>
                        </form>
                    )}

                    {/* ── ÉTAPE 2 : Redirection vers MoneyFusion ── */}
                    {step === 'redirecting' && (
                        <div className="text-center space-y-5 py-4">
                            <div className="w-16 h-16 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto">
                                <Smartphone size={32} className="text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-white text-xl font-bold">Commande créée !</h3>
                                <p className="text-white/50 text-sm mt-1">
                                    Clique pour finaliser le paiement sur la page sécurisée MoneyFusion.
                                </p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-1">
                                <p className="text-white/40 text-xs uppercase tracking-wider">Référence</p>
                                <p className="text-white font-mono font-bold text-lg">#{orderId}</p>
                                <p className="text-emerald-400 font-mono text-sm">
                                    {priceFcfa.toLocaleString('fr-FR')} FCFA
                                </p>
                            </div>

                            <button onClick={openPaymentPage}
                                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2">
                                <ExternalLink size={16} />
                                Ouvrir la page de paiement
                            </button>

                            <p className="text-white/30 text-xs">
                                La page s'ouvre dans un nouvel onglet. Reviens ici après le paiement.
                            </p>
                        </div>
                    )}

                    {/* ── ÉTAPE 3 : Succès ── */}
                    {step === 'success' && (
                        <div className="text-center space-y-4 py-4">
                            <CheckCircle2 size={56} className="text-emerald-400 mx-auto" />
                            <h3 className="text-white text-xl font-bold">Paiement initié !</h3>
                            <p className="text-white/60 text-sm">
                                Complète le paiement dans l'onglet MoneyFusion.
                                Tu recevras tes credentials à{' '}
                                <strong className="text-white">{email}</strong> après confirmation.
                            </p>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-1">
                                    Référence commande
                                </p>
                                <p className="text-white font-mono font-bold text-lg">#{orderId}</p>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => window.open(payUrl, '_blank')}
                                    className="flex-1 border border-white/20 hover:bg-white/10 text-white/70 hover:text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-1">
                                    <ExternalLink size={14} /> Rouvrir
                                </button>
                                <button onClick={onClose}
                                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all">
                                    Fermer
                                </button>
                            </div>
                            <p className="text-white/30 text-xs">
                                Délai habituel : 5–30 min après confirmation du paiement.
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}