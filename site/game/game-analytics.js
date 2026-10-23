(() => {
  const config = window.OCEAN_CONFIG?.analytics || {};
  // Local previews never contact analytics. Form values, nicknames and IDs are excluded.
  if (!config.allowedHosts?.includes(location.hostname)) return;
  window.dataLayer = window.dataLayer || [];
  if (config.mode === 'gtag') {
    if (!/^G-[A-Z0-9]+$/.test(config.measurementId || '')) throw Error('Set the webzine GA4 measurementId');
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', config.measurementId, { page_location: location.origin + location.pathname });
    const tag = document.createElement('script');tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.measurementId);
    document.head.appendChild(tag);
  } else if (config.mode === 'gtm') {
    if (!/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId || '')) throw Error('Set the webzine GTM containerId');
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const tag = document.createElement('script');tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtm.js?id=' + encodeURIComponent(config.gtmContainerId);
    document.head.appendChild(tag);
  } else if (config.mode !== 'host') return;
  function track(event, extra = {}) {
    const parameters = { game_name: 'haenyeo_badang_path', game_language: window.oceanLanguage === 'en' ? 'en' : 'ko', ...extra };
    if (config.mode !== 'gtm' && typeof window.gtag === 'function') window.gtag('event', event, parameters);
    else window.dataLayer.push({ event, ...parameters });
  }
  const count = value => Number.isFinite(Number(value)) ? Math.min(10000000, Math.max(0, Math.floor(Number(value)))) : 0;
  let ready = false, active = false, paused = false, startedAt = 0;
  window.addEventListener('ocean-game', ({ detail: data }) => {
    if (!data || typeof data.phase !== 'string') return;
    if (data.phase === 'title' && !ready) { ready = true;track('game_ready'); }
    if (data.phase === 'begin') { active = true;paused = false;startedAt = performance.now();track('game_start'); }
    if (data.phase === 'view-paused' && active && !paused) { paused = true;track('game_pause'); }
    if (data.phase === 'view-playing' && active && paused) { paused = false;track('game_resume'); }
    if (data.phase === 'end' && active) {
      active = false;
      track('game_end', { score: count(data.score), cleaned: count(data.cleaned), collected: count(data.collected),
        furthest: count(data.furthest), duration_seconds: count((performance.now() - startedAt) / 1000) });
    }
  });
  window.addEventListener('ocean-record-saved', ({ detail: data }) => {
    track('game_record_saved', { score: count(data?.score), cleaned: count(data?.cleaned) });
  });
})();
