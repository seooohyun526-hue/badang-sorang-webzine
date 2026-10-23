// 내 컴퓨터에서 응원 API 돌려 보기:  npm run dev  → http://localhost:8787/api/cheers
//  · 실제 배포(Vercel)와 같은 처리(lib/core.js)를 쓰고, DB 만 PGlite(컴퓨터 안 Postgres)예요
//  · 데이터는 CHEER_DB 폴더(기본: 운영체제 임시 폴더)에 남아서 껐다 켜도 그대로예요
//  · 다른 방문자인 척 시험하려면 요청에 X-Forwarded-For 머리글을 붙여요
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { handle } from '../lib/core.js';
import { makeDb } from './pg.mjs';

const PORT = +process.env.PORT || 8787;
const dir = process.env.CHEER_DB || path.join(os.tmpdir(), 'badang-cheer-db');
const { q } = await makeDb(dir);

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname !== '/api/cheers') { res.writeHead(404); return res.end(); }
  let raw = '';
  for await (const ch of req) { raw += ch; if (raw.length > 20000) break; }
  const ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  const out = await handle({ method: req.method, origin: req.headers.origin, ip, body: raw || null }, q, process.env);
  res.writeHead(out.status, out.headers);
  res.end(out.body == null ? undefined : JSON.stringify(out.body));
}).listen(PORT, () => console.log(`응원 API: http://localhost:${PORT}/api/cheers  (DB: ${dir})`));
