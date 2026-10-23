import { basePath, siteOrigin, upstreamOrigin } from '../configuration.mjs';

const routes = Object.freeze({ profile: ['GET', 'POST'], session: ['POST'], submit: ['POST'],
  leaderboard: ['GET'], 'event-status': ['GET'], 'event-entry': ['POST'] });
const maximumBody = 2048;
function json(status, error, extraHeaders = {}) {
  return new Response(JSON.stringify({ error }), { status, headers: {
    'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff', ...extraHeaders
  } });
}
function playerCookie(value = '') {
  return value.split(';').map(part => part.trim()).find(part => /^ocean_player=[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(part)) || '';
}
async function readLimitedBody(request) {
  if (Number(request.headers.get('content-length') || 0) > maximumBody) throw Error('TOO_LARGE');
  const reader = request.body?.getReader();if (!reader) return '';
  let total = 0;const chunks = [];
  for (;;) {
    const { value, done } = await reader.read();if (done) break;
    total += value.byteLength;
    if (total > maximumBody) { await reader.cancel();throw Error('TOO_LARGE'); }
    chunks.push(value);
  }
  return Buffer.concat(chunks, total).toString('utf8');
}

/** Framework-neutral Web Request -> Response adapter. Node 22+; server-side only. */
export async function handleGameApi(request, options = {}) {
  const prefix = options.basePath || basePath;
  const origin = options.siteOrigin || siteOrigin;
  const upstream = options.upstreamOrigin || upstreamOrigin;
  const fetchUpstream = options.fetch || globalThis.fetch;
  const url = new URL(request.url);
  const apiPrefix = prefix + 'api/';
  if (!url.pathname.startsWith(apiPrefix)) return json(404, '요청 경로를 확인해 주세요.');
  const endpoint = url.pathname.slice(apiPrefix.length);
  if (!Object.hasOwn(routes, endpoint)) return json(404, '요청 경로를 확인해 주세요.');
  if (!routes[endpoint].includes(request.method)) return json(405, '지원하지 않는 요청입니다.', { Allow: routes[endpoint].join(', ') });
  const suppliedOrigin = request.headers.get('origin');
  // Validate the browser's real origin BEFORE translating the request for the upstream.
  if ((suppliedOrigin && suppliedOrigin !== origin) || request.headers.get('sec-fetch-site') === 'cross-site') return json(403, '접근할 수 없습니다.');
  if (request.method === 'POST' && suppliedOrigin !== origin) return json(403, '접근할 수 없습니다.');
  let body;
  if (request.method === 'POST') {
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) return json(415, '잘못된 요청입니다.');
    try { body = await readLimitedBody(request);JSON.parse(body); }
    catch (error) { return json(error.message === 'TOO_LARGE' ? 413 : 400, '잘못된 요청입니다.'); }
  }
  const headers = new Headers({ Accept: 'application/json' });
  const cookie = playerCookie(request.headers.get('cookie') || '');if (cookie) headers.set('Cookie', cookie);
  if (request.method === 'POST') { headers.set('Content-Type', 'application/json');headers.set('Origin', upstream); }
  try {
    const result = await fetchUpstream(new URL('/api/' + endpoint + url.search, upstream), {
      method: request.method, headers, body, redirect: 'error', signal: AbortSignal.timeout(12000)
    });
    if (!result.headers.get('content-type')?.includes('application/json')) return json(502, '게임 서버에 연결하지 못했어요.');
    const responseHeaders = new Headers({ 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    // Do not forward unrelated upstream cookies or cookies belonging to the webzine.
    for (const raw of result.headers.getSetCookie()) {
      if (!/^ocean_player=[0-9a-f-]{36}\.[0-9a-f]{64};/i.test(raw)) continue;
      const maxAge = raw.match(/(?:^|;)\s*Max-Age=(\d+)/i)?.[1] || '31536000';
      responseHeaders.append('Set-Cookie', raw.split(';')[0] + '; Path=' + prefix + '; Max-Age=' + maxAge + '; HttpOnly; Secure; SameSite=Strict');
    }
    return new Response(await result.text(), { status: result.status, headers: responseHeaders });
  } catch {
    return json(502, '게임 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.');
  }
}
