import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const source = await readFile(new URL('../integration/integration-bootstrap.js', import.meta.url), 'utf8');
const load = apiMode => {
  const window = { OCEAN_CONFIG: { basePath: '/2026-1/team6/game/', apiMode, analytics: { mode: 'gtm', gtmContainerId: 'GTM-M2LF732B' } } };
  runInNewContext(source, { window, location: new URL('https://lxwebzine.hankyung.com/2026-1/team6/game/'), URL });
  return window;
};
test('php mode: same-origin api-proxy.php URLs, query parameters, endpoint allowlist, webzine GTM kept', () => {
  const window = load('php');
  assert.equal(window.OceanIntegration.apiUrl('leaderboard?metric=score&period=all'), 'https://lxwebzine.hankyung.com/2026-1/team6/game/api-proxy.php?endpoint=leaderboard&metric=score&period=all');
  assert.equal(window.OceanIntegration.apiUrl('profile'), 'https://lxwebzine.hankyung.com/2026-1/team6/game/api-proxy.php?endpoint=profile');
  assert.equal(new URL(window.OceanIntegration.apiUrl('event-status?runId=sample')).searchParams.get('runId'), 'sample');
  assert.throws(() => window.OceanIntegration.apiUrl('../event-maintenance'));
  assert.throws(() => window.OceanIntegration.apiUrl('profile?endpoint=event-maintenance'));
  assert.equal(window.OCEAN_CONFIG.analytics.gtmContainerId, 'GTM-M2LF732B');
});
test('path mode (default) keeps /game/api/{endpoint}', () => {
  for (const mode of ['path', undefined]) {
    assert.equal(load(mode).OceanIntegration.apiUrl('profile'), 'https://lxwebzine.hankyung.com/2026-1/team6/game/api/profile');
  }
});
test('auto mode: a JSON answer from api-proxy.php switches every game API request to PHP', async () => {
  const calls = [];
  const fetch = async (url) => { calls.push(String(url)); return { headers: new Map([['content-type', 'application/json; charset=utf-8']]) }; };
  const window = { fetch, OCEAN_CONFIG: { basePath: '/2026-1/team6/game/', apiMode: 'auto', analytics: { mode: 'gtm', gtmContainerId: 'GTM-M2LF732B' } } };
  runInNewContext(source, { window, location: new URL('https://lxwebzine.hankyung.com/2026-1/team6/game/'), URL });
  assert.equal(await window.OceanIntegration.apiMode(), 'php');
  await window.fetch(window.OceanIntegration.apiUrl('leaderboard?metric=score&period=all'));
  await window.fetch('https://www.googletagmanager.com/gtm.js?id=GTM-M2LF732B');
  assert.deepEqual(calls, [
    'https://lxwebzine.hankyung.com/2026-1/team6/game/api-proxy.php?endpoint=__probe',
    'https://lxwebzine.hankyung.com/2026-1/team6/game/api-proxy.php?endpoint=leaderboard&metric=score&period=all',
    'https://www.googletagmanager.com/gtm.js?id=GTM-M2LF732B']);
});
test('auto mode: no PHP (404 HTML, PHP source, network error) keeps the /api/ path routes', async () => {
  for (const answer of [async () => ({ headers: new Map([['content-type', 'text/html; charset=iso-8859-1']]) }),
    async () => ({ headers: new Map([['content-type', 'application/x-httpd-php']]) }), async () => { throw Error('offline'); }]) {
    const calls = [];
    const window = { fetch: async (url) => { calls.push(String(url)); return answer(); }, OCEAN_CONFIG: { basePath: '/2026-1/team6/game/', apiMode: 'auto' } };
    runInNewContext(source, { window, location: new URL('https://lxwebzine.hankyung.com/2026-1/team6/game/'), URL });
    assert.equal(await window.OceanIntegration.apiMode(), 'path');
    await window.fetch(window.OceanIntegration.apiUrl('profile')).catch(() => {});
    assert.equal(calls.at(-1), 'https://lxwebzine.hankyung.com/2026-1/team6/game/api/profile');
  }
});
