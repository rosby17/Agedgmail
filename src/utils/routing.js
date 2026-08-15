// Vues "application" (nécessitent une connexion) — servies sous /app/... —
// distinctes des vues "vitrine" publiques (landing, shop, product, policies,
// auth) qui restent à la racine. Voir viewToUrlPath / pathToView ci-dessous,
// seul et unique endroit qui connaît cette règle : navigate(), le parsing
// d'URL au montage et le handler popstate s'appuient tous dessus pour ne
// jamais diverger entre eux.
export const APP_VIEWS = new Set(['dashboard', 'recharge', 'settings', 'admin', 'sms', 'api']);
// Anciens chemins (avant l'introduction de /app) encore potentiellement en
// dur dans des emails déjà envoyés ou des favoris clients -> redirigés.
export const LEGACY_APP_PATH_TO_VIEW = { myorders: 'dashboard', recharge: 'recharge', settings: 'settings', admin: 'admin', sms: 'sms', api: 'api' };

/** Nom de vue interne -> chemin d'URL public (sans le slash de tête). */
export function viewToUrlPath(viewName) {
  const pathName = viewName === 'dashboard' ? 'myorders' : viewName;
  return APP_VIEWS.has(viewName) ? `app/${pathName}` : pathName;
}

/** Chemin d'URL (avec ou sans slash de tête) -> nom de vue interne, ou null si inconnu. */
export function pathToView(rawPath) {
  const path = (rawPath || '').replace(/^\/+/, '');
  if (!path) return 'landing';
  if (path.startsWith('app/')) {
    const sub = path.slice(4);
    if (sub === 'myorders') return 'dashboard';
    // /app/admin/<tab> (ex: /app/admin/orders) : la console admin gère ses
    // propres sous-onglets, le routeur global n'a besoin de reconnaître que
    // la vue 'admin' elle-même.
    if (sub === 'admin' || sub.startsWith('admin/')) return 'admin';
    return APP_VIEWS.has(sub) ? sub : null;
  }
  if (LEGACY_APP_PATH_TO_VIEW[path]) return LEGACY_APP_PATH_TO_VIEW[path];
  return path;
}
