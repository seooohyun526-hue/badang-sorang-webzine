import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { basePath, siteOrigin } from '../configuration.mjs';
const read = name => readFile(new URL('../integration/' + name, import.meta.url), 'utf8');
test('client API URLs stay under the webzine subdirectory, including its no-slash entry URL', async () => {
  const window = { OCEAN_CONFIG: { basePath } };
  runInNewContext(await read('integration-bootstrap.js'), { window, location: new URL(siteOrigin + basePath.slice(0, -1)), URL });
  assert.equal(window.OceanIntegration.apiUrl('leaderboard?metric=score&period=all'), siteOrigin + basePath + 'api/leaderboard?metric=score&period=all');
  assert.throws(() => window.OceanIntegration.apiUrl('https://evil.example'));
  assert.throws(() => window.OceanIntegration.apiUrl('../event-maintenance'));
});
test('GA4 emits gameplay numbers and webzine language, excluding nickname/email/runId', async () => {
  const listeners = {}, events = [];
  const window = { OCEAN_CONFIG: { analytics: { mode: 'host', allowedHosts: ['lxwebzine.hankyung.com'] } }, oceanLanguage: 'ko',
    gtag: (...args) => events.push(args), addEventListener: (name, action) => { listeners[name] = action; } };
  let time = 0;
  runInNewContext(await read('game-analytics.js'), { window, location: new URL(siteOrigin + basePath), performance: { now: () => time } });
  const game = phase => listeners['ocean-game']({ detail: { phase, score: 105, cleaned: 31, collected: 10, furthest: 55, nickname: 'PRIVATE', email: 'PRIVATE@example.com', runId: 'PRIVATE' } });
  game('title');game('title');game('begin');time = 45000;game('view-paused');game('view-playing');game('end');game('end');
  listeners['ocean-record-saved']({ detail: { score: 105, cleaned: 31, email: 'PRIVATE@example.com', runId: 'PRIVATE' } });
  assert.deepEqual(events.map(event => event[1]), ['game_ready', 'game_start', 'game_pause', 'game_resume', 'game_end', 'game_record_saved']);
  assert.equal(events.find(event => event[1] === 'game_end')[2].duration_seconds, 45);
  assert.ok(!JSON.stringify(events).includes('PRIVATE'));
  assert.ok(events.every(event => !['page_view', 'config'].includes(event[1])));
});
test('local preview does not initialize tracking or add listeners', async () => {
  runInNewContext(await read('game-analytics.js'), { window: { OCEAN_CONFIG: { analytics: { allowedHosts: ['lxwebzine.hankyung.com'] } } }, location: new URL('http://127.0.0.1:8095' + basePath) });
});
