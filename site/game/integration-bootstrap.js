(() => {
  const config = window.OCEAN_CONFIG;
  if (!config?.basePath?.startsWith('/') || !config.basePath.endsWith('/')) throw Error('Invalid game basePath');
  const base = new URL(config.basePath, location.origin);
  if (base.origin !== location.origin) throw Error('The game must use the webzine origin');
  function apiUrl(path) {
    if (!/^(profile|session|submit|leaderboard|event-status|event-entry)(\?[^#]*)?$/.test(path)) throw Error('Invalid game API');
    return new URL('api/' + path, base).href;
  }
  window.OceanIntegration = Object.freeze({ apiUrl, basePath: base.pathname });
})();
