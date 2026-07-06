// Parse une ligne de livraison de compte fournisseur (YTSeller/SMMSHIBA),
// format délimité par ":" avec des champs optionnels :
//   email:password:recoveryEmail:recoveryPassword:appPassword:totpSecret
//
// Tous les champs après email/password sont facultatifs et peuvent être
// absents (moins de segments) ou vides (segment vide entre deux ":"). On ne
// se fie donc PAS à leur position fixe pour appPassword/totpSecret — les
// deux se ressemblent visuellement (groupes de 4 caractères) et ne se
// distinguent de façon fiable qu'à la longueur une fois les espaces retirés :
// appPassword = 16 caractères, totpSecret = 32 caractères.
//
// Lève une erreur (avec un `code` explicite) si le format est trop cassé
// pour en extraire au minimum email + password — c'est ce que l'appelant
// utilise pour basculer sur un rendu de secours plutôt que d'afficher des
// identifiants tronqués/incorrects.
export function parseAccountDelivery(rawLine) {
  if (typeof rawLine !== 'string' || !rawLine.trim()) {
    const err = new Error('Ligne de livraison vide.');
    err.code = 'empty_input';
    throw err;
  }

  const parts = rawLine.split(':').map((p) => p.trim());
  const email = parts[0];
  const password = parts[1];

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !password) {
    const err = new Error('Email ou mot de passe manquant.');
    err.code = 'missing_required_fields';
    throw err;
  }
  if (!emailPattern.test(email)) {
    const err = new Error('Format d’email invalide.');
    err.code = 'invalid_email_format';
    throw err;
  }

  const result = { email, password };
  const leftovers = parts.slice(2).filter((p) => p.length > 0);
  const unclassified = [];

  for (const part of leftovers) {
    const noSpaces = part.replace(/\s+/g, '');
    if (!result.recoveryEmail && emailPattern.test(part)) {
      result.recoveryEmail = part;
    } else if (!result.totpSecret && noSpaces.length === 32) {
      result.totpSecret = noSpaces;
    } else if (!result.appPassword && noSpaces.length === 16) {
      result.appPassword = noSpaces;
    } else {
      unclassified.push(part);
    }
  }

  // Ce qui reste de non-classé (au plus un champ dans le format documenté)
  // est le mot de passe de récupération.
  if (unclassified.length > 0) {
    result.recoveryPassword = unclassified[0];
  }

  return result;
}

// Masque une valeur secrète pour les logs serveur : garde les 2 premiers et
// 2 derniers caractères visibles, remplace le reste par des étoiles. Ne
// jamais logger un mot de passe / secret 2FA en clair.
export function maskSecret(value) {
  if (!value) return value;
  const s = String(value);
  if (s.length <= 4) return '*'.repeat(s.length);
  return `${s.slice(0, 2)}${'*'.repeat(s.length - 4)}${s.slice(-2)}`;
}
