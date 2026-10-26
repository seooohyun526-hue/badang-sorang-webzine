(() => {
  const basePath = window.OCEAN_CONFIG?.basePath || '/2026-1/team6/game/';
  const apiOrigin = 'https://haenyeo-ocean-online.vercel.app';
  const key = 'haenyeo.webzine.player.v1';
  let token = '';
  const valid = value => /^v1\.[0-9a-f-]{36}\.\d{10}\.[0-9a-f]{64}$/.test(value || '');
  try { const saved = localStorage.getItem(key);if (valid(saved)) token = saved; } catch {}
  function apiUrl(path) {
    if (!/^(profile|session|submit|leaderboard|event-status|event-entry)(\?[^#]*)?$/.test(path)) throw Error('Invalid game API');
    return new URL('/api/' + path, apiOrigin).href;
  }
  async function fetchApi(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', 'Bearer ' + token);
    const response = await fetch(apiUrl(path), { ...options, headers, mode: 'cors', credentials: 'omit',
      redirect: 'error', cache: 'no-store', signal: options.signal || AbortSignal.timeout(12000) });
    const issued = response.headers.get('X-Ocean-Player');
    if (response.ok && valid(issued)) {
      token = issued;
      try { localStorage.setItem(key, token); } catch {}
    }
    if (response.status === 401) {
      const error = await response.clone().json().catch(() => null);
      if (error?.code === 'INVALID_WEBZINE_TOKEN') {
        token = '';try { localStorage.removeItem(key); } catch {}
      }
    }
    return response;
  }
  // Keep the webzine's existing game document, analytics config and GA4 page URL.
  // No PHP, proxy auto-detection or third-party cookie is used for these API calls.
  window.OceanIntegration = Object.freeze({ apiUrl, fetchApi, basePath, apiMode: 'direct' });
})();
