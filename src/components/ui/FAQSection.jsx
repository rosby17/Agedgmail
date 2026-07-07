import React, { useState } from 'react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    {
      q: "Qu'est-ce qu'un compte AgedGmailYT ?",
      a: "Nous vendons tout type de comptes (récents, aged) sur de multiples plateformes (Gmail, Facebook, Twitter, TikTok, etc.). 'AgedGmailYT' est simplement le nom de notre plateforme. Les comptes Gmail US sont notre accroche principale, mais notre catalogue vous offre une grande variété de réseaux sociaux."
    },
    {
      q: "Vais-je subir un shadow ban avec ces comptes ?",
      a: "Un compte ne garantit pas l'absence de shadow ban si vous ne respectez pas les algorithmes. Cependant, nos comptes vous donnent l'immense avantage d'apparaître comme un utilisateur résidant hors du continent africain, ce qui est très difficile avec des comptes locaux. Ils maximisent vos chances, mais votre comportement dictera le reste."
    },
    {
      q: "Est-ce que ces comptes sont fiables pour percer sur YouTube ou ailleurs ?",
      a: "De nombreux créateurs ont acheté nos comptes et ont percé. Cependant, la clé reste la qualité de votre contenu. Nos adresses mails maximisent vos chances en vous offrant un profil solide dès le lancement, ce qui réduit drastiquement les risques de shadow ban initiaux."
    },
    {
      q: "La livraison est-elle vraiment instantanée ?",
      a: "Oui ! La livraison des comptes achetés est 100% instantanée, sans aucune validation manuelle. (Notez que la recharge de votre solde, elle, peut parfois nécessiter une validation manuelle selon le moyen de paiement, sauf pour les paiements Crypto/Binance qui sont 100% automatisés)."
    },
    {
      q: "Quels sont les moyens de paiement acceptés ?",
      a: "Nous acceptons principalement la Crypto (notamment USDT) ainsi que les principales solutions de Mobile Money."
    },
    {
      q: "Puis-je modifier les informations de sécurité ?",
      a: "Oui, dès réception, vous devenez propriétaire de la boîte mail. Vous pouvez modifier l'authentification (Google Authenticator) et le mot de passe. Nous conseillons de patienter au minimum 72 heures avant de tout modifier. Ensuite, le compte vous appartient à 100%."
    }
  ];

  return (
    <section id="faq" className="py-32 relative">
      <div className="max-w-3xl mx-auto px-margin-mobile md:px-gutter">
        <div className="text-center mb-16 reveal-target opacity-0">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-6">
            <span className="font-label-sm uppercase tracking-widest text-l-primary font-bold text-[10px]">FAQ</span>
          </div>
          <h3 className="font-headline-lg text-4xl md:text-5xl text-on-surface font-extrabold mb-6">
            Questions Fréquentes
          </h3>
          <p className="text-on-surface-variant text-lg">
            Tout ce que vous devez savoir avant de dominer l'algorithme.
          </p>
        </div>

        <div className="space-y-4 reveal-target opacity-0">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className={`glass rounded-2xl overflow-hidden transition-all duration-300 border ${openIndex === idx ? 'border-l-primary/30' : 'border-white/5 hover:border-white/20'}`}
            >
              <button 
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className={`font-bold text-lg transition-colors ${openIndex === idx ? 'text-l-primary' : 'text-on-surface'}`}>
                  {faq.q}
                </span>
                <span className={`material-symbols-outlined text-l-primary transition-transform duration-300 ${openIndex === idx ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>
              <div 
                className={`px-8 overflow-hidden transition-all duration-500 ease-in-out ${openIndex === idx ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <p className="text-on-surface-variant leading-relaxed">
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;