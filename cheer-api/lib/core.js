// 바당소랑 '응원 온도' 공용 저장소 — 요청 하나를 처리하는 핵심 (DB 는 밖에서 넣어 줘요: Vercel 에서는 Neon, 시험할 때는 PGlite)
//  GET  /api/cheers                         → { likes, commentCount, comments:[{ id, t, at }] }  (최근 응원 50개)
//  POST /api/cheers { type:'comment', id, t } → 응원 한 마디 남기기 (id 는 브라우저가 만든 UUID — 같은 id 는 한 번만 저장돼요)
//  POST /api/cheers { type:'like' }           → 좋아요 한 번
//  POST /api/cheers { type:'import', comments:[{ id, t, at }] } → 예전에 브라우저에만 남긴 응원 옮기기 (한 번에 20개까지)
import { createHash } from 'node:crypto';

export const LIMITS = {
  maxLen: 100,            // 응원 한 마디 최대 글자 수 (웹진 CLEAN.cheer.maxLen 과 같게)
  listSize: 50,           // 창에 보여 주는 최근 응원 수
  commentGapSec: 8,       // 같은 접속 주소에서 응원을 다시 남기려면 기다려야 하는 시간 (학교 · 회사처럼 여러 명이 한 주소를 쓰기도 해서 짧게)
  commentsPerHour: 30,    // 같은 접속 주소에서 1시간에 남길 수 있는 응원 수
  likeGapMs: 800,         // 좋아요 연타 간격
  likesPerDay: 1000,      // 같은 접속 주소에서 하루에 누를 수 있는 좋아요 수
  importMax: 20,          // 예전 응원 옮기기 — 한 번에 받는 수
};

const DEFAULT_ORIGINS = [
  'https://seooohyun526-hue.github.io',   // GitHub Pages
  'https://lxwebzine.hankyung.com',       // 한경닷컴 웹진 서버
  'http://localhost:8765',                // 내 컴퓨터에서 미리 보기
  'null',                                 // 내 컴퓨터에서 html 파일을 바로 열 때 (file://)
];

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g;

export const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS cheer_comments (
     id uuid PRIMARY KEY,
     body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND ${LIMITS.maxLen}),
     created_at timestamptz NOT NULL DEFAULT now(),
     ip_hash text NOT NULL,
     hidden boolean NOT NULL DEFAULT false)`,
  `CREATE INDEX IF NOT EXISTS cheer_comments_created ON cheer_comments (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS cheer_comments_ip ON cheer_comments (ip_hash, created_at DESC)`,
  `CREATE TABLE IF NOT EXISTS cheer_likes (
     id bigserial PRIMARY KEY,
     created_at timestamptz NOT NULL DEFAULT now(),
     ip_hash text NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS cheer_likes_ip ON cheer_likes (ip_hash, created_at DESC)`,
];

// 글 다듬기: 보이지 않는 제어 문자 빼기 · 빈칸 하나로 · 앞뒤 빈칸 빼기 → 1~100자만 받아요 (화면에는 웹진이 글자 그대로(esc) 보여 줘요)
export function cleanText(v) {
  if (typeof v !== 'string') return null;
  const t = v.normalize('NFC').replace(CONTROL, '').replace(/\s+/g, ' ').trim();
  if (!t || [...t].length > LIMITS.maxLen) return null;
  return t;
}

export function allowedOrigins(env) {
  const s = (env.ALLOWED_ORIGINS || '').split(',').map((x) => x.trim()).filter(Boolean);
  return s.length ? s : DEFAULT_ORIGINS;
}

function ipHash(ip, env) {
  return createHash('sha256').update((env.IP_SALT || 'badang-sorang') + '|' + (ip || 'unknown')).digest('hex').slice(0, 32);
}

let ready = null;                                       // 표는 처음 한 번만 만들어요 (이미 있으면 그대로)
async function ensure(q) {
  if (!ready) ready = (async () => { for (const s of SCHEMA) await q(s); })().catch((e) => { ready = null; throw e; });
  return ready;
}
export function resetSchemaCache() { ready = null; }

async function state(q) {
  const [lk] = await q('SELECT count(*)::int AS n FROM cheer_likes');
  const [cc] = await q('SELECT count(*)::int AS n FROM cheer_comments WHERE NOT hidden');
  const rows = await q('SELECT id, body, created_at FROM cheer_comments WHERE NOT hidden ORDER BY created_at DESC, id LIMIT $1', [LIMITS.listSize]);
  return {
    likes: lk.n, commentCount: cc.n,
    comments: rows.map((r) => ({ id: r.id, t: r.body, at: new Date(r.created_at).getTime() })),
  };
}

const json = (status, body, extra) => ({ status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra }, body });

// req: { method, origin, ip, body(객체 또는 문자열) } · q(sql, params) → rows
export async function handle(req, q, env = {}) {
  const origins = allowedOrigins(env);
  const cors = origins.includes(req.origin)
    ? { 'Access-Control-Allow-Origin': req.origin, 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400', Vary: 'Origin' }
    : { Vary: 'Origin' };
  if (req.method === 'OPTIONS') return { status: 204, headers: cors, body: null };
  if (req.origin && !origins.includes(req.origin)) return json(403, { error: 'origin' }, cors);   // 다른 사이트에서 몰래 쓰지 못하게
  try {
    await ensure(q);
    if (req.method === 'GET') return json(200, await state(q), cors);
    if (req.method !== 'POST') return json(405, { error: 'method' }, cors);

    let b = req.body;
    if (typeof b === 'string') { try { b = JSON.parse(b); } catch { return json(400, { error: 'json' }, cors); } }
    if (!b || typeof b !== 'object') return json(400, { error: 'json' }, cors);
    const who = ipHash(req.ip, env);

    if (b.type === 'like') {
      const [r] = await q(`SELECT count(*)::int AS day, coalesce(extract(epoch FROM now() - max(created_at)) * 1000, 1e12) AS gap
                           FROM cheer_likes WHERE ip_hash = $1 AND created_at > now() - interval '1 day'`, [who]);
      if (r.gap < LIMITS.likeGapMs || r.day >= LIMITS.likesPerDay) return json(429, { error: 'too_fast', ...(await state(q)) }, cors);
      await q('INSERT INTO cheer_likes (ip_hash) VALUES ($1)', [who]);
      return json(200, await state(q), cors);
    }

    if (b.type === 'comment') {
      const t = cleanText(b.t);
      if (!t) return json(400, { error: 'text' }, cors);
      if (typeof b.id !== 'string' || !UUID.test(b.id)) return json(400, { error: 'id' }, cors);
      const [dup] = await q('SELECT 1 AS x FROM cheer_comments WHERE id = $1', [b.id]);
      if (dup) return json(200, { duplicate: true, ...(await state(q)) }, cors);   // 같은 응원을 두 번 보내도 한 번만
      const [r] = await q(`SELECT count(*)::int AS hour, coalesce(extract(epoch FROM now() - max(created_at)), 1e9) AS gap
                           FROM cheer_comments WHERE ip_hash = $1 AND created_at > now() - interval '1 hour'`, [who]);
      if (r.gap < LIMITS.commentGapSec || r.hour >= LIMITS.commentsPerHour) return json(429, { error: 'too_fast', retryAfter: Math.max(1, Math.ceil(LIMITS.commentGapSec - r.gap)) }, cors);
      await q('INSERT INTO cheer_comments (id, body, ip_hash) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING', [b.id, t, who]);
      return json(201, await state(q), cors);
    }

    if (b.type === 'import') {
      const list = Array.isArray(b.comments) ? b.comments.slice(0, LIMITS.importMax) : [];
      const now = Date.now(), oldest = now - 2 * 365 * 864e5;
      let added = 0;
      for (const c of list) {
        const t = c && cleanText(c.t);
        if (!t || typeof c.id !== 'string' || !UUID.test(c.id)) continue;
        const at = Number.isFinite(+c.at) ? Math.min(now, Math.max(oldest, +c.at)) : now;   // 미래 · 너무 옛날 시각은 고쳐서
        const r = await q('INSERT INTO cheer_comments (id, body, created_at, ip_hash) VALUES ($1, $2, to_timestamp($3 / 1000.0), $4) ON CONFLICT (id) DO NOTHING RETURNING id', [c.id, t, at, who]);
        added += r.length;
      }
      return json(200, { imported: added, ...(await state(q)) }, cors);
    }
    return json(400, { error: 'type' }, cors);
  } catch (e) {
    console.error('[cheers]', e);
    return json(500, { error: 'server' }, cors);
  }
}
