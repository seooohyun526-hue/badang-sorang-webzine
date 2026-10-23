import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleGameApi } from '../server/game-api-proxy.mjs';
import { basePath, siteOrigin, upstreamOrigin } from '../configuration.mjs';
const cookie = 'ocean_player=12345678-1234-1234-1234-123456789abc.' + 'a'.repeat(64);
const request = (endpoint, method = 'GET', options = {}) => new Request(siteOrigin + basePath + 'api/' + endpoint, {
  method, headers: { ...(method === 'POST' ? { Origin: siteOrigin, 'Content-Type': 'application/json' } : {}), ...options.headers },
  body: method === 'POST' ? (options.body ?? JSON.stringify({ nickname: '해녀테스트' })) : undefined
});
test('rank query, only the game cookie, and no shared webzine cookies reach upstream', async () => {
  let observed;
  const result = await handleGameApi(request('leaderboard?metric=score&period=all', 'GET', {
    headers: { Cookie: 'webzine_login=PRIVATE; _ga=PRIVATE; ' + cookie }
  }), { fetch: async (url, init) => { observed = { url, init };return Response.json({ entries: [], me: null }); } });
  assert.equal(result.status, 200);
  assert.equal(observed.url.href, upstreamOrigin + '/api/leaderboard?metric=score&period=all');
  assert.equal(observed.init.headers.get('cookie'), cookie);
  assert.equal(result.headers.get('cache-control'), 'no-store');
  assert.equal(result.headers.get('access-control-allow-origin'), null);
});
test('profile cookie is issued for the game path and preserves player identity', async () => {
  let sent;
  const result = await handleGameApi(request('profile', 'POST'), { fetch: async (url, init) => {
    sent = init;
    return Response.json({ nickname: '해녀테스트' }, { headers: { 'Set-Cookie': cookie + '; Path=/; Domain=vercel.app; HttpOnly; Secure; SameSite=Strict; Max-Age=31536000' } });
  } });
  assert.equal(sent.headers.get('origin'), upstreamOrigin);
  const set = result.headers.get('set-cookie');
  assert.ok(set.startsWith(cookie + ';'));
  assert.ok(set.includes('Path=' + basePath + ';'));
  assert.ok(!set.includes('Domain='));
  assert.ok(set.includes('HttpOnly; Secure; SameSite=Strict'));
});
test('a nickname-session-submit round trip retains its signed cookie through the proxy', async () => {
  let playerId, submitted = false;
  const upstream = async (url, init) => {
    const endpoint = url.pathname.split('/').pop();
    if (endpoint === 'profile') return Response.json({ nickname: '해녀테스트' }, { headers: { 'Set-Cookie': cookie + '; Path=/; Secure' } });
    assert.equal(init.headers.get('cookie'), playerId);
    if (endpoint === 'session') return Response.json({ runId: '12345678-1234-1234-1234-123456789abc' });
    if (endpoint === 'submit') { submitted = true;return Response.json({ saved: true }); }
    throw Error('Unexpected endpoint');
  };
  const profile = await handleGameApi(request('profile', 'POST'), { fetch: upstream });
  playerId = profile.headers.get('set-cookie').split(';')[0];
  const session = await handleGameApi(request('session', 'POST', { headers: { Cookie: playerId } }), { fetch: upstream });
  const { runId } = await session.json();
  const submission = await handleGameApi(request('submit', 'POST', { headers: { Cookie: playerId }, body: JSON.stringify({ runId, score: 6, furthest: 1, collected: 1, cleaned: 0 }) }), { fetch: upstream });
  assert.equal(submission.status, 200);assert.ok(submitted);
});
test('foreign and absent POST origins, cross-site GET and administrative routes are rejected', async () => {
  const never = () => { throw Error('Upstream must not be called'); };
  for (const origin of ['https://evil.example', 'null', '']) {
    assert.equal((await handleGameApi(request('submit', 'POST', { headers: { Origin: origin } }), { fetch: never })).status, 403);
  }
  assert.equal((await handleGameApi(request('leaderboard', 'GET', { headers: { 'Sec-Fetch-Site': 'cross-site' } }), { fetch: never })).status, 403);
  for (const endpoint of ['event-maintenance', 'constructor', 'unknown', 'profile/extra']) assert.equal((await handleGameApi(request(endpoint), { fetch: never })).status, 404);
  assert.equal((await handleGameApi(request('submit'), { fetch: never })).status, 405);
});
test('invalid JSON, excessive UTF-8 body, and incorrect content type are rejected', async () => {
  const never = () => { throw Error('Upstream must not be called'); };
  assert.equal((await handleGameApi(request('profile', 'POST', { body: '{' }), { fetch: never })).status, 400);
  assert.equal((await handleGameApi(request('profile', 'POST', { body: JSON.stringify({ text: '해'.repeat(800) }) }), { fetch: never })).status, 413);
  assert.equal((await handleGameApi(request('profile', 'POST', { headers: { 'Content-Type': 'text/plain' } }), { fetch: never })).status, 415);
});
test('upstream status is preserved and HTML or network failures become safe JSON errors', async () => {
  const duplicate = await handleGameApi(request('profile', 'POST'), { fetch: async () => Response.json({ error: '이미 사용 중인 닉네임이에요.' }, { status: 409 }) });
  assert.equal(duplicate.status, 409);
  assert.match((await duplicate.json()).error, /닉네임/);
  for (const upstream of [async () => new Response('<html>error</html>'), async () => { throw Error('PRIVATE'); }]) {
    const response = await handleGameApi(request('leaderboard'), { fetch: upstream });
    assert.equal(response.status, 502);assert.ok(!(await response.text()).includes('PRIVATE'));
  }
});
