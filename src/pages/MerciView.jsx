import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Mail, Loader2, XCircle, Home } from 'lucide-react';

// ─── Page de confirmation après paiement MoneyFusion ──────────────────────────
// MoneyFusion redirige vers : https://agedgmail.tools-cl.com/#merci?token=XXXX
// La fonction navigate('merci') + le token dans l'URL hash sont gérés ici.
// ─────────────────────────────────────────────────────────────────────────────

const CHECK_INTERVAL_MS = 5000;   // vérifie le statut toutes les 5s
const MAX_CHECKS        = 12;     // arrête après 1 minute (12 × 5s)

export default function MerciView({ navigate }) {
    const [status, setStatus]   = useState('checking'); // 'checking' | 'paid' | 'pending' | 'failed'
    const [checks, setChecks]   = useState(0);
    const [moyen, setMoyen]     = useState('');
    const [montant, setMontant] = useState('');

    // Extrait le token MoneyFusion depuis l'URL hash
    // Ex: #merci?token=5d58823b084564  →  token = '5d58823b084564'
    const getToken = () => {
        const hash = window.location.hash; // ex: #merci?token=abc123
        const match = hash.match(/[?&]token=([^&]+)/);
        return match ? match[1] : null;
    };

    useEffect(() => {
        const token = getToken();

        if (!token) {
            // Pas de token → accès direct sans paiement, redirige vers l'accueil
            navigate('home');
            return;
        }

        const checkStatus = async () => {
            try {
                const res = await fetch(
                    `https://www.pay.moneyfusion.net/paiementNotif/${token}`
                );
                if (!res.ok) throw new Error('Erreur réseau');
                const data = await res.json();

                if (data.statut && data.data) {
                    const payStatus = data.data.statut;
                    setMoyen(data.data.moyen || '');
                    setMontant(data.data.Montant?.toLocaleString('fr-FR') || '');

                    if (payStatus === 'paid') {
                        setStatus('paid');
                        return true; // stop polling
                    } else if (payStatus === 'failure' || payStatus === 'no paid') {
                        setStatus('failed');
                        return true;
                    }
                }
            } catch (_) {
                // silently ignore network errors, keep polling
            }
            return false;
        };

        // Première vérification immédiate
        checkStatus().then(done => {
            if (done) return;
            setStatus('pending');

            // Polling toutes les 5 secondes
            let count = 0;
            const interval = setInterval(async () => {
                count++;
                setChecks(count);
                const done = await checkStatus();
                if (done || count >= MAX_CHECKS) {
                    clearInterval(interval);
                    if (!done) setStatus('pending'); // toujours pending après 1min → on laisse en attente
                }
            }, CHECK_INTERVAL_MS);

            return () => clearInterval(interval);
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#080A0F] flex items-center justify-center p-6">
            <div className="w-full max-w-md bg-[#0F1117] border border-white/10 rounded-3xl p-8 text-center shadow-2xl">

                {/* ── Vérification en cours ── */}
                {(status === 'checking' || (status === 'pending' && checks < MAX_CHECKS)) && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-6">
                            <Loader2 size={40} className="text-violet-400 animate-spin" />
                        </div>
                        <h1 className="text-white text-2xl font-bold mb-2">Vérification en cours…</h1>
                        <p className="text-white/50 text-sm mb-6">
                            On attend la confirmation de ton paiement Mobile Money.
                        </p>
                        <div className="bg-white/5 rounded-2xl p-4">
                            <div className="flex items-center gap-2 text-white/40 text-xs justify-center">
                                <Clock size={13} />
                                <span>Vérification automatique ({checks}/{MAX_CHECKS})</span>
                            </div>
                        </div>
                    </>
                )}

                {/* ── Paiement confirmé ── */}
                {status === 'paid' && (
                    <>
                        <CheckCircle2 size={72} className="text-emerald-400 mx-auto mb-6" />
                        <h1 className="text-white text-2xl font-bold mb-2">Paiement confirmé !</h1>
                        <p className="text-white/60 text-sm mb-6">
                            Ton paiement de{' '}
                            <span className="text-emerald-400 font-mono font-bold">
                                {montant} FCFA
                            </span>
                            {moyen && (
                                <> via <span className="text-white capitalize">{moyen}</span></>
                            )}{' '}
                            a bien été reçu.
                        </p>

                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left">
                            <Mail size={18} className="text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-white/70 text-sm">
                                Tes credentials (identifiants de connexion) te seront envoyés par email
                                dans les <strong className="text-white">5–30 minutes</strong> suivant la confirmation.
                            </p>
                        </div>

                        <button
                            onClick={() => navigate('dashboard')}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all mb-3">
                            Voir mes commandes
                        </button>
                        <button
                            onClick={() => navigate('home')}
                            className="w-full border border-white/10 hover:bg-white/5 text-white/50 hover:text-white font-medium py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2">
                            <Home size={14} /> Retour à l'accueil
                        </button>
                    </>
                )}

                {/* ── Paiement en attente (délai dépassé) ── */}
                {status === 'pending' && checks >= MAX_CHECKS && (
                    <>
                        <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-6">
                            <Clock size={40} className="text-yellow-400" />
                        </div>
                        <h1 className="text-white text-2xl font-bold mb-2">Paiement en attente</h1>
                        <p className="text-white/60 text-sm mb-6">
                            Ton paiement est toujours en cours de traitement.
                            Si tu as bien effectué le paiement, tes credentials arriveront par email dès confirmation.
                        </p>
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4 mb-6 flex items-start gap-3 text-left">
                            <Mail size={18} className="text-yellow-400 mt-0.5 shrink-0" />
                            <p className="text-white/70 text-sm">
                                Si tu ne reçois rien dans <strong className="text-white">30 minutes</strong>,
                                contacte-nous sur WhatsApp avec ta référence de commande.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('home')}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2">
                            <Home size={16} /> Retour à l'accueil
                        </button>
                    </>
                )}

                {/* ── Paiement échoué ── */}
                {status === 'failed' && (
                    <>
                        <XCircle size={72} className="text-red-400 mx-auto mb-6" />
                        <h1 className="text-white text-2xl font-bold mb-2">Paiement non complété</h1>
                        <p className="text-white/60 text-sm mb-6">
                            Le paiement n'a pas abouti. Aucun montant n'a été débité.
                            Tu peux réessayer depuis le catalogue.
                        </p>
                        <button
                            onClick={() => navigate('home')}
                            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3 rounded-xl transition-all">
                            Réessayer
                        </button>
                    </>
                )}

            </div>
        </div>
    );
}
