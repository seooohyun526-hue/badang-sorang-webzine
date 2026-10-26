(() => {
  const config = window.OCEAN_CONFIG;
  if (!config?.basePath?.startsWith('/') || !config.basePath.endsWith('/')) throw Error('Invalid game basePath');
  const base = new URL(config.basePath, location.origin);
  if (base.origin !== location.origin) throw Error('The game must use the webzine origin');
  const apiBase = new URL('api/', base).href;
  // Apache/PHP: api-proxy.php?endpoint=… (same folder) instead of the /api/ routes.
  function phpUrl(pathUrl) {
    const relative = new URL(pathUrl);
    const url = new URL('api-proxy.php', base);
    url.searchParams.set('endpoint', relative.pathname.slice(new URL(apiBase).pathname.length));
    for (const [name, value] of relative.searchParams) {
      if (name === 'endpoint') throw Error('Invalid game API parameter');
      url.searchParams.append(name, value);
    }
    return url.href;
  }
  function apiUrl(path) {
    if (!/^(profile|session|submit|leaderboard|event-status|event-entry)(\?[^#]*)?$/.test(path)) throw Error('Invalid game API');
    const pathUrl = new URL('api/' + path, base).href;
    return config.apiMode === 'php' ? phpUrl(pathUrl) : pathUrl;
  }
  // apiMode 'auto': ask api-proxy.php once (no upstream request). A JSON answer means the webzine server runs PHP,
  // so every game API request goes there; otherwise the /api/ path routes stay (e.g. a Node proxy behind Apache).
  // One mode is chosen per page load, so the two are never mixed.
  let mode = Promise.resolve(config.apiMode === 'php' ? 'php' : 'path');
  if (config.apiMode === 'auto' && typeof window.fetch === 'function') {
    const send = window.fetch.bind(window);
    mode = send(new URL('api-proxy.php?endpoint=__probe', base).href, { cache: 'no-store', credentials: 'same-origin' })
      .then(response => /application\/json/i.test(response.headers.get('content-type') || '') ? 'php' : 'path')
      .catch(() => 'path');
    window.fetch = function (input, init) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : '';
      if (!url.startsWith(apiBase)) return send(input, init);
      return mode.then(chosen => send(chosen === 'php' ? phpUrl(url) : url, init));
    };
  }
  window.OceanIntegration = Object.freeze({ apiUrl, basePath: base.pathname, apiMode: () => mode });
})();
