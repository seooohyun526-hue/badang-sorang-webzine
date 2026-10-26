(() => {
  const config = window.OCEAN_CONFIG;
  if (!config?.basePath?.startsWith('/') || !config.basePath.endsWith('/')) throw Error('Invalid game basePath');
  const base = new URL(config.basePath, location.origin);
  if (base.origin !== location.origin) throw Error('The game must use the webzine origin');
  function apiUrl(path) {
    if (!/^(profile|session|submit|leaderboard|event-status|event-entry)(\?[^#]*)?$/.test(path)) throw Error('Invalid game API');
    if (config.apiMode !== 'php') return new URL('api/' + path, base).href;
    // Apache/PHP: api-proxy.php?endpoint=… (same folder) instead of the /api/ routes.
    // configuration.mjs/integration-config.js and the webzine GA4/GTM are preserved.
    const relative = new URL('api/' + path, base);
    const url = new URL('api-proxy.php', base);
    const endpoint = relative.pathname.slice((base.pathname + 'api/').length);
    url.searchParams.set('endpoint', endpoint);
    for (const [name, value] of relative.searchParams) {
      if (name === 'endpoint') throw Error('Invalid game API parameter');
      url.searchParams.append(name, value);
    }
    return url.href;
  }
  window.OceanIntegration = Object.freeze({ apiUrl, basePath: base.pathname });
})();
