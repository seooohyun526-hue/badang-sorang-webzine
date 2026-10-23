// 내 컴퓨터에서 Supabase 흉내 내기:  npm run dev  → http://localhost:8788
//  · Supabase 와 같은 주소 모양(POST /rest/v1/rpc/cheer_…)과 같은 머리글(apikey · Authorization)을 받아, schema.sql 함수를 그대로 불러요
//  · 웹진을 BS_SUPABASE_URL=http://localhost:8788 BS_SUPABASE_KEY=local-test-key 로 빌드하면 화면에서 바로 시험할 수 있어요
//  · 실제 Supabase 가 아니에요 — 규칙(schema.sql)과 웹진 쪽 흐름을 확인하는 용도예요
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { makeDb } from './pg.mjs';

const PORT = +process.env.PORT || 8788;
const dir = process.env.CHEER_DB || path.join(os.tmpdir(), 'badang-cheer-supabase');
const { rpc } = await makeDb(dir);
const FNS = new Set(['cheer_state', 'cheer_like', 'cheer_comment', 'cheer_import']);
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'apikey, authorization, content-type, x-client-info' };

http.createServer(async (req, res) => {
  const send = (status, body) => { res.writeHead(status, { 'Content-Type': 'application/json', ...CORS }); res.end(JSON.stringify(body)); };
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end(); }
  const m = /^\/rest\/v1\/rpc\/([a-z_]+)$/.exec(new URL(req.url, 'http://x').pathname);
  if (!m || !FNS.has(m[1])) return send(404, { message: 'not found' });
  if (req.method !== 'POST') return send(405, { message: 'method' });
  if (!req.headers.apikey) return send(401, { message: 'No API key found in request' });
  let raw = ''; for await (const ch of req) raw += ch;
  let args = {}; try { args = raw ? JSON.parse(raw) : {}; } catch { return send(400, { message: 'bad json' }); }
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '');
  try { send(200, await rpc(m[1], args, { 'x-forwarded-for': ip })); }
  catch (e) { send(400, { message: String(e.message || e) }); }
}).listen(PORT, () => console.log(`Supabase 흉내: http://localhost:${PORT}/rest/v1/rpc/cheer_state  (DB: ${dir})`));
