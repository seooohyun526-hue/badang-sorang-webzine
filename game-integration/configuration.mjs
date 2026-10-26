// Public configuration only. Never put DATABASE_URL or service secrets here.
export const basePath = '/2026-1/team6/game/';
export const siteOrigin = 'https://lxwebzine.hankyung.com';
export const upstreamOrigin = 'https://haenyeo-ocean-online.vercel.app';
// Badang Sorang webzine: the team6 site root is the repository's site/ folder, so the game lives in site/game/.
// Build output, package check and local preview all use this folder (no second copy of the Unity binaries).
import { fileURLToPath } from 'node:url';
export const gameDir = fileURLToPath(new URL('../site/game/', import.meta.url));
// How the game reaches the API: 'direct' — the browser calls the existing Vercel API (https://haenyeo-ocean-online.vercel.app/api/…)
// with a signed player token (integration/integration-bootstrap.js · fetchApi). The Vercel server allows exactly https://lxwebzine.hankyung.com,
// so the Hankyung server needs no PHP, Node or proxy (2026-10-26 direct-API patch; replaces the PHP/auto adapter, which Hankyung could not run).
export const apiMode = 'direct';
// Cache version added to the scripts that changed with the direct API (integration-bootstrap.js · online.js · event.js).
export const scriptVersion = '20261026-direct1';
// Where /game/ sends players instead of running the game here.
//  '' — play the game here (the webzine's /game/)
//  a URL — game/index.html becomes a short page that forwards to that game. The Unity files stay in place, so switching back is this one line.
export const externalGameUrl = '';
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
