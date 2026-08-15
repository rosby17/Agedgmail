import React, { useState, useEffect } from 'react';
import { Globe2, Clock, CheckCircle2, BarChart3 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { ADMIN_EMAIL } from '../utils/constants';

const VOTE_KEY = 'proxy_survey_voted';

// Sondage d'intérêt avant d'investir dans du stock proxy (IPRoyal — et tout
// fournisseur du secteur — exige un prépaiement minimum ; on préfère mesurer
// la demande réelle avant d'y mettre du budget). Remplace la page d'achat
// tant que la décision business n'est pas prise.
const ProxyView = ({ navigate, session, profile, lang, t }) => {
  const isFr = lang === 'fr';
  const [voted, setVoted] = useState(() => !!localStorage.getItem(VOTE_KEY));
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [choice, setChoice] = useState('');
  const [comment, setComment] = useState('');

  const isAdmin = session?.user?.email === ADMIN_EMAIL || profile?.is_admin;

  useEffect(() => {
    if (!isAdmin) return;
    supabase.functions.invoke('proxy-interest-results', { body: {} })
      .then(({ data }) => { if (data?.counts) setResults(data); })
      .catch(() => {});
  }, [isAdmin]);

  const submitVote = async () => {
    if (voted || submitting || !choice) return;
    setSubmitting(true);
    await supabase.from('proxy_interest_votes').insert({
      user_id: session?.user?.id || null,
      choice,
      comment: comment.trim() || null,
    });
    localStorage.setItem(VOTE_KEY, choice);
    setVoted(true);
    setSubmitting(false);
  };

  const options = [
    { id: 'yes', label: isFr ? 'Oui, j\'en achèterais' : 'Yes, I\'d buy some' },
    { id: 'maybe', label: isFr ? 'Peut-être, selon le prix' : 'Maybe, depends on price' },
    { id: 'no', label: isFr ? 'Non, pas intéressé(e)' : 'No, not interested' },
  ];

  return (
    <div className="flex flex-col">
      <main className="flex-1 max-w-xl mx-auto px-6 py-24 text-center w-full">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <Globe2 size={28} />
        </div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
          {isFr ? 'Proxys résidentiels — en préparation' : 'Residential proxies — in the works'}
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-10 flex items-center justify-center gap-2">
          <Clock size={14} />
          {isFr
            ? "On étudie ce produit avant de le lancer. Ton avis nous aide à décider."
            : "We're evaluating this product before launch. Your input helps us decide."}
        </p>

        {voted ? (
          <div className="bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-[2rem] p-8 shadow-soft">
            <CheckCircle2 size={28} className="text-emerald-500 mx-auto mb-3" />
            <p className="font-bold text-gray-900 dark:text-white">
              {isFr ? 'Merci pour ton retour !' : 'Thanks for your feedback!'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              {isFr ? 'Souhaites-tu voir les proxys sur notre site ?' : 'Would you like to see proxies on our site?'}
            </p>
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setChoice(opt.id)}
                disabled={submitting}
                className={`w-full h-14 rounded-2xl border font-bold text-sm transition-all disabled:opacity-50 ${
                  choice === opt.id
                    ? 'bg-primary/10 border-primary text-primary'
                    : 'bg-white dark:bg-slate-900/40 border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-300 hover:border-primary/50'
                }`}
              >
                {opt.label}
              </button>
            ))}

            <div className="pt-2 text-left">
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
                {isFr ? 'Un commentaire ? (optionnel)' : 'Any comment? (optional)'}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={submitting}
                rows={3}
                placeholder={isFr
                  ? 'Ex: seulement si moins cher que IPRoyal, ou tel besoin précis...'
                  : 'E.g. only if cheaper than IPRoyal, or a specific need...'}
                className="w-full text-sm bg-white dark:bg-slate-900/40 border border-gray-100 dark:border-slate-800 rounded-2xl px-4 py-3 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/40 resize-none disabled:opacity-50"
              />
            </div>

            <button
              onClick={submitVote}
              disabled={!choice || submitting}
              className="w-full h-12 rounded-2xl bg-primary text-white dark:text-gray-900 font-bold text-sm hover:bg-primaryDark transition-all disabled:opacity-40"
            >
              {isFr ? 'Envoyer mon avis' : 'Send my feedback'}
            </button>
          </div>
        )}

        {isAdmin && results && (
          <div className="mt-10 bg-gray-900 dark:bg-slate-900 text-white rounded-2xl p-6 text-left">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-400 mb-3">
              <BarChart3 size={14} /> Résultats (admin) — {results.total} votes
            </div>
            <div className="space-y-1 text-sm font-mono">
              <div>Oui : {results.counts.yes}</div>
              <div>Peut-être : {results.counts.maybe}</div>
              <div>Non : {results.counts.no}</div>
            </div>
            {results.comments?.length > 0 && (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-3 max-h-60 overflow-y-auto">
                {results.comments.map((c, i) => (
                  <div key={i} className="text-xs">
                    <span className="font-black text-primary uppercase">{c.choice}</span>
                    <span className="text-gray-400"> — {new Date(c.created_at).toLocaleDateString()}</span>
                    <p className="text-gray-200 mt-0.5">{c.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ProxyView;
