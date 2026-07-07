const cleanProductName = (raw, lang) => {
  if (!raw) return raw;
  if (!lang) lang = 'fr';
  let s = String(raw).trim();

  const dashIdx = s.indexOf(' - ');
  if (dashIdx > 15) {
    const first = s.slice(0, dashIdx).trim();
    const rest = s.slice(dashIdx + 3).trim();
    const probe = first.slice(0, Math.min(14, first.length)).toLowerCase();
    if (probe && rest.toLowerCase().startsWith(probe)) s = first;
  }

  s = s.replace(/[\u{1F300}-\u{1FAFF}☀-➿←-⇿⬀-⯿]/gu, '').trim();
  s = s.replace(/\s{2,}/g, ' ').trim();

  if (lang === 'fr') {
    s = s.replace(/month old/gi, "Mois d'ancienneté");
    s = s.replace(/months old/gi, "Mois d'ancienneté");
    s = s.replace(/year old/gi, "An d'ancienneté");
    s = s.replace(/years old/gi, "Ans d'ancienneté");
    s = s.replace(/verified/gi, "Vérifié");
    s = s.replace(/with/gi, "avec");
    s = s.replace(/accounts/gi, "Comptes");
    s = s.replace(/account/gi, "Compte");
    s = s.replace(/active/gi, "Actif");
    s = s.replace(/\band\b/gi, "et");
    s = s.replace(/aged/gi, "Ancien");
    s = s.replace(/not monetized/gi, "Non Monétisé");
    s = s.replace(/monetized/gi, "Monétisé");
    s = s.replace(/channels/gi, "Chaînes");
    s = s.replace(/channel/gi, "Chaîne");
    s = s.replace(/subscribers/gi, "Abonnés");
    s = s.replace(/followers/gi, "Abonnés");
  }

  const MAX = 70;
  if (s.length > MAX) {
    s = s.slice(0, MAX).trim() + '…';
  }
  return s;
};

console.log(cleanProductName('2-3 Month Old GitHub Accounts with gmail verified and 2FA Active', 'fr'));
console.log(cleanProductName('Aged Gmail Account - USA - Verified', 'fr'));
