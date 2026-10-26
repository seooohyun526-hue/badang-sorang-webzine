// Direct Vercel API client (2026-10-26 patch): token saved/reused, cookies omitted, routes restricted, built UI uses fetchApi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { gameDir, scriptVersion } from '../configuration.mjs';
const source = await readFile(new URL('../integration/integration-bootstrap.js', import.meta.url), 'utf8');
const token = 'v1.12345678-1234-1234-1234-123456789abc.1793000000.' + 'a'.repeat(64);

test('profile token is saved and reused across reloads, without cookies or token URLs', async () => {
  const saved = new Map(), calls = [];
  const context = { window: { OCEAN_CONFIG: { basePath: '/2026-1/team6/game/', analytics: { gtmContainerId: 'GTM-M2LF732B' } } }, URL, Headers, AbortSignal,
    localStorage: { getItem: key => saved.get(key) || null, setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) },
    fetch: async (url, options) => { calls.push({ url, options }); return Response.json({ nickname: 'fixture' }, { headers: { 'X-Ocean-Player': token } }); } };
  runInNewContext(source, context);
  const api = context.window.OceanIntegration;
  await api.fetchApi('profile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"nickname":"fixture"}' });
  await api.fetchApi('session', { method: 'POST', body: '{}' });
  assert.equal(calls[0].url, 'https://haenyeo-ocean-online.vercel.app/api/profile');
  assert.equal(calls[0].options.credentials, 'omit'); assert.equal(calls[0].options.mode, 'cors');
  assert.equal(calls[0].options.headers.get('Authorization'), null);
  assert.equal(calls[1].options.headers.get('Authorization'), 'Bearer ' + token);
  assert.equal(saved.size, 1); assert.ok(!calls.some(call => call.url.includes(token)));
  assert.equal(context.window.OCEAN_CONFIG.analytics.gtmContainerId, 'GTM-M2LF732B');
  assert.throws(() => api.apiUrl('../event-maintenance'));
  const reload = { ...context, window: { OCEAN_CONFIG: { basePath: '/2026-1/team6/game/' } } };
  runInNewContext(source, reload); await reload.window.OceanIntegration.fetchApi('profile');
  assert.equal(calls.at(-1).options.headers.get('Authorization'), 'Bearer ' + token);
});

test('built ranking and prize UI use the authenticated transport, with the new cache version', async () => {
  for (const name of ['online.js', 'event.js']) {
    const file = await readFile(gameDir + name, 'utf8');
    assert.ok(file.includes('window.OceanIntegration.fetchApi(path,'));
    assert.ok(!file.includes('fetch(window.OceanIntegration.apiUrl(path),'));
  }
  const html = await readFile(gameDir + 'index.html', 'utf8');
  for (const name of ['integration-bootstrap.js', 'online.js', 'event.js']) assert.ok(html.includes(name + '?v=' + scriptVersion), name);
  assert.ok(!html.includes('api-proxy.php'));
});
