import http from 'node:http';
import { stat } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { basePath, siteOrigin, gameDir } from '../configuration.mjs';
import { handleGameApi } from './game-api-proxy.mjs';
const preview = process.argv.includes('--preview');
const port = Number(process.env.PORT || (preview ? 8095 : 8787));
const origin = preview ? 'http://127.0.0.1:' + port : (process.env.SITE_ORIGIN || siteOrigin);
const root = resolve(gameDir);
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.otf': 'font/otf', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.png': 'image/png', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8' };
async function sendWebResponse(result, res) {
  const headers = Object.fromEntries([...result.headers].filter(([name]) => name !== 'set-cookie'));
  const cookies = result.headers.getSetCookie();if (cookies.length) headers['set-cookie'] = cookies;
  res.writeHead(result.status, headers);res.end(Buffer.from(await result.arrayBuffer()));
}
function reply(res, status, object) { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });res.end(JSON.stringify(object)); }
const server = http.createServer(async (req, res) => {
  try {
    if (!req.url?.startsWith('/') || req.url.startsWith('//')) return reply(res, 400, { error: 'Invalid path' });
    const url = new URL(req.url, origin);
    if (url.pathname.startsWith(basePath + 'api/')) {
      if (preview) {
        const endpoint = url.pathname.slice((basePath + 'api/').length);
        if (req.method === 'GET' && endpoint === 'profile') return reply(res, 200, { nickname: null });
        if (req.method === 'GET' && endpoint === 'leaderboard') return reply(res, 200, { entries: [], me: null });
        if (req.method === 'GET' && endpoint === 'event-status') return reply(res, 200, { phase: 'before', run: null, entered: false });
        if (req.method === 'POST' && endpoint === 'profile') return reply(res, 200, { nickname: 'Preview' });
        if (req.method === 'POST' && endpoint === 'session') return reply(res, 200, { runId: '00000000-0000-4000-8000-000000000001' });
        if (req.method === 'POST' && endpoint === 'submit') return reply(res, 200, { saved: true, preview: true });
        return reply(res, 403, { error: 'Preview: 응모 및 실제 DB 저장은 비활성화되어 있어요.' });
      }
      if (Number(req.headers['content-length'] || 0) > 2048) { req.resume();return reply(res, 413, { error: '요청이 너무 큽니다.' }); }
      let body;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        const chunks = [];let size = 0;
        for await (const chunk of req) { size += chunk.length;if (size > 2048) return reply(res, 413, { error: '요청이 너무 큽니다.' });chunks.push(chunk); }
        body = Buffer.concat(chunks);
      }
      const request = new Request(url, { method: req.method, headers: req.headers, body });
      return await sendWebResponse(await handleGameApi(request, { siteOrigin: origin }), res);
    }
    if (!['GET', 'HEAD'].includes(req.method)) return reply(res, 405, { error: 'Method not allowed' });
    if (url.pathname !== basePath.slice(0, -1) && !url.pathname.startsWith(basePath)) return reply(res, 404, { error: 'Not found' });
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.includes('\\') || pathname.includes('\0') || pathname.split('/').some(part => part.startsWith('.'))) return reply(res, 400, { error: 'Invalid path' });
    if (pathname === basePath || pathname === basePath.slice(0, -1)) pathname = basePath + 'index.html';
    const file = resolve(root, '.' + pathname.slice(basePath.length - 1));
    if (!file.startsWith(resolve(root) + sep)) return reply(res, 400, { error: 'Invalid path' });
    const info = await stat(file);if (!info.isFile()) return reply(res, 404, { error: 'Not found' });
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'Content-Length': info.size,
      'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'same-origin', 'X-Frame-Options': 'SAMEORIGIN' });
    if (req.method === 'HEAD') return res.end();
    createReadStream(file).on('error', () => res.destroy()).pipe(res);
  } catch { if (!res.headersSent) reply(res, 404, { error: 'Not found' });else res.destroy(); }
});
server.requestTimeout = 20000;
server.listen(port, '127.0.0.1', () => {
  console.log((preview ? 'PREVIEW (NO DATABASE WRITES) ' : 'GAME SERVER ') + origin + basePath);
});
