// Vercel 서버리스 함수 — 주소: https://<프로젝트>.vercel.app/api/cheers
// 필요한 환경 변수 (Vercel → Settings → Environment Variables)
//   DATABASE_URL    Neon 데이터베이스 연결 주소 (꼭 필요 · 채팅이나 코드에 적지 말고 Vercel 에만 넣어요)
//   IP_SALT         접속 주소를 감추어 저장할 때 섞는 아무 글자 (권장)
//   ALLOWED_ORIGINS 웹진 주소 목록, 쉼표로 구분 (비우면 lib/core.js 의 기본 목록)
import { neon } from '@neondatabase/serverless';
import { handle } from '../lib/core.js';

let sql = null;
const q = (text, params = []) => {
  if (!sql) sql = neon(process.env.DATABASE_URL);
  return sql.query(text, params);
};

export default async function handler(req, res) {
  const ip = String(req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  const out = await handle({ method: req.method, origin: req.headers.origin, ip, body: req.body }, q, process.env);
  for (const [k, v] of Object.entries(out.headers || {})) res.setHeader(k, v);
  res.status(out.status);
  if (out.body == null) return res.end();
  return res.send(JSON.stringify(out.body));
}
