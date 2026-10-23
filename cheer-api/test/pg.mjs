// 시험용 Postgres (PGlite — 실제 Postgres 를 컴퓨터 안에서 돌려요) · dataDir 을 주면 껐다 켜도 남아요
import { PGlite } from '@electric-sql/pglite';
export async function makeDb(dataDir) {
  const db = new PGlite(dataDir);
  await db.waitReady;
  const q = async (text, params = []) => (await db.query(text, params)).rows;
  return { db, q };
}
