// 시험용 Postgres (PGlite) 에 Supabase 와 비슷한 바탕(역할 anon · authenticated)을 만들고 schema.sql 을 실행해요
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

export async function makeDb(dataDir) {
  const db = new PGlite(dataDir);
  await db.waitReady;
  await db.exec(`
    do $$ begin
      if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; end if;
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
    end $$;
    grant usage on schema public to anon, authenticated;`);
  await db.exec(await readFile(new URL('../schema.sql', import.meta.url), 'utf8'));
  // PostgREST 처럼: 요청 머리글을 request.headers 에 넣고, anon 역할로 함수 하나를 불러요
  const rpc = async (fn, args = {}, headers = {}) => db.transaction(async (tx) => {
    await tx.query(`select set_config('request.headers', $1, true)`, [JSON.stringify(headers)]);
    await tx.exec('set local role anon');
    const names = Object.keys(args);
    const sql = `select public.${fn}(${names.map((k, i) => `${k} => $${i + 1}`).join(', ')}) as r`;
    const vals = names.map((k) => (args[k] !== null && typeof args[k] === 'object' ? JSON.stringify(args[k]) : args[k]));
    return (await tx.query(sql, vals)).rows[0].r;
  });
  return { db, rpc };
}
