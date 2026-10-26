// Public configuration only. Never put DATABASE_URL or service secrets here.
export const basePath = '/2026-1/team6/game/';
export const siteOrigin = 'https://lxwebzine.hankyung.com';
export const upstreamOrigin = 'https://haenyeo-ocean-online.vercel.app';
// Badang Sorang webzine: the team6 site root is the repository's site/ folder, so the game lives in site/game/.
// Build output, package check and local preview all use this folder (no second copy of the Unity binaries).
import { fileURLToPath } from 'node:url';
export const gameDir = fileURLToPath(new URL('../site/game/', import.meta.url));
// How the game reaches the API on the webzine server:
//  'auto' — on each page load, ask api-proxy.php once: JSON → 'php', otherwise 'path' (one Hankyung deploy covers both cases)
//  'path' — /2026-1/team6/game/api/{endpoint} (needs the Node proxy behind Apache)
//  'php'  — /2026-1/team6/game/api-proxy.php?endpoint=… (Apache runs PHP 7.4+ with cURL; api-proxy.php is copied next to the game)
export const apiMode = 'auto';
export const analytics = {
  // 'host': use the webzine's existing gtag or GTM. It must also be present on /game.
  // 'gtag': install ONE Google tag on this standalone page using measurementId.
  // 'gtm': install ONE container using gtmContainerId; configure GA4 event tags there.
  // The webzine installs Google Tag Manager GTM-M2LF732B (its GA4 measurement ID G-Z57PKSMHPK lives in that container).
  // The game page loads the same single container; publish the game_* event tag in GTM (README-KO.md / WEBZINE-INTEGRATION-KO.md).
  mode: 'gtm',
  measurementId: '',
  gtmContainerId: 'GTM-M2LF732B',
  allowedHosts: ['lxwebzine.hankyung.com']
};
