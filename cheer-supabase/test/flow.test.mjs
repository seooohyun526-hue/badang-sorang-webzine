// schema.sql 규칙 시험 (Supabase 와 같은 Postgres 를 컴퓨터 안에서):  npm test
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeDb } from './pg.mjs';

const { db, rpc } = await makeDb();
const H = (ip) => ({ 'x-forwarded-for': ip + ', 10.0.0.1' });
let n = 0; const ok = (name) => console.log('  ✓', ++n, name);

// 1) 처음엔 비어 있어요
let r = await rpc('cheer_state');
assert.deepEqual(r, { likes: 0, commentCount: 0, comments: [] }); ok('빈 목록 조회');

// 2) 응원 남기기 → 바로 목록에 (글 정리: 빈칸 · 보이지 않는 글자)
const id1 = randomUUID();
r = await rpc('cheer_comment', { p_id: id1, p_body: '  해녀님   힘내세요!​ ' }, H('1.1.1.1'));
assert.equal(r.created, true); assert.equal(r.commentCount, 1); assert.equal(r.comments[0].t, '해녀님 힘내세요!'); assert.equal(r.comments[0].id, id1);
ok('응원 저장 · 바로 목록에');

// 3) 같은 응원을 다시 보내도 하나만
r = await rpc('cheer_comment', { p_id: id1, p_body: '해녀님 힘내세요!' }, H('1.1.1.1'));
assert.equal(r.duplicate, true); assert.equal(r.commentCount, 1); ok('같은 응원 두 번 → 한 번만 저장');

// 4) 같은 접속 주소에서 바로 또 → 잠깐 기다리게 · 다른 사람은 바로
r = await rpc('cheer_comment', { p_id: randomUUID(), p_body: '또 응원해요' }, H('1.1.1.1'));
assert.equal(r.error, 'too_fast'); assert.ok(r.retryAfter >= 1); ok('연달아 남기기 제한');
r = await rpc('cheer_comment', { p_id: randomUUID(), p_body: '<script>alert(1)</script> 바다 최고' }, H('2.2.2.2'));
assert.equal(r.created, true); assert.equal(r.comments[0].t, '<script>alert(1)</script> 바다 최고'); ok('다른 방문자 응원 · 글자 그대로 저장');

// 5) 잘못된 입력은 거절
for (const [args, err, why] of [[{ p_id: randomUUID(), p_body: '   ' }, 'text', '빈 글'], [{ p_id: randomUUID(), p_body: 'ㄱ'.repeat(101) }, 'text', '너무 긴 글'],
  [{ p_id: 'abc', p_body: '안녕' }, 'id', '이상한 id'], [{ p_id: null, p_body: '안녕' }, 'id', 'id 없음'], [{ p_id: randomUUID(), p_body: null }, 'text', '글 없음']]) {
  r = await rpc('cheer_comment', args, H('3.3.3.3')); assert.equal(r.error, err, why);
}
ok('빈 글 · 긴 글 · 이상한 id 거절');
r = await rpc('cheer_comment', { p_id: randomUUID(), p_body: 'ㄱ'.repeat(100) }, H('4.4.4.4')); assert.equal(r.created, true); ok('100자 딱 맞으면 저장');

// 6) 좋아요 — 모두의 숫자 · 연타 제한
r = await rpc('cheer_like', {}, H('5.5.5.5')); assert.equal(r.likes, 1); assert.equal(r.error, undefined);
r = await rpc('cheer_like', {}, H('5.5.5.5')); assert.equal(r.error, 'too_fast'); assert.equal(r.likes, 1);
r = await rpc('cheer_like', {}, H('6.6.6.6')); assert.equal(r.likes, 2); ok('좋아요 공용 숫자 · 연타 제한');

// 7) 예전 응원 옮기기 — 두 번 해도 한 번만 · 미래 시각은 지금으로 · 이상한 것은 건너뛰기
const old = [{ id: randomUUID(), t: '예전 응원 1', at: Date.now() - 864e5 }, { id: randomUUID(), t: '예전 응원 2', at: Date.now() + 9e9 }, { id: 'x', t: '이상한 것' }, { id: randomUUID(), t: '' }];
r = await rpc('cheer_import', { p_comments: old }, H('7.7.7.7')); assert.equal(r.imported, 2);
r = await rpc('cheer_import', { p_comments: old }, H('7.7.7.7')); assert.equal(r.imported, 0);
assert.ok(r.comments.every((c) => c.at <= Date.now() + 1000));
r = await rpc('cheer_import', { p_comments: Array.from({ length: 30 }, (_, i) => ({ id: randomUUID(), t: '많이 ' + i, at: Date.now() - 1e6 })) }, H('7.7.7.7'));
assert.equal(r.imported, 20); ok('예전 응원 옮기기 (중복 없음 · 시각 보정 · 한 번에 20개)');

// 8) 다시 조회해도 그대로 (새로고침 · 다른 기기)
r = await rpc('cheer_state', {}, H('9.9.9.9')); assert.equal(r.commentCount, 25); assert.equal(r.likes, 2); assert.equal(r.comments.length, 25);
ok('다시 조회해도 모두의 응원 그대로');

// 9) 공개 키(anon)로는 표를 직접 못 읽고 · 못 쓰고 · 도우미 함수도 못 불러요
for (const [sql, why] of [['select * from public.cheer_comments', '응원 표 읽기'], ["insert into public.cheer_likes (ip_hash) values ('x')", '좋아요 표 쓰기'],
  ['select * from public.cheer_config', '비밀 글자 읽기'], ["update public.cheer_comments set hidden = true", '숨기기'], ['select public.cheer__who()', '도우미 함수']]) {
  await assert.rejects(db.transaction(async (tx) => { await tx.exec('set local role anon'); await tx.query(sql); }), /permission denied/, why);
}
ok('공개 키로 표 직접 접근 · 도우미 함수 차단');

// 10) 숨긴 응원은 안 보여요
await db.query('update public.cheer_comments set hidden = true where id = $1', [id1]);
r = await rpc('cheer_state'); assert.equal(r.commentCount, 24); assert.ok(!r.comments.some((c) => c.id === id1)); ok('숨긴 응원은 목록에서 빠짐');

// 11) 50개 넘으면 최근 50개만 · 숫자는 전체
for (let i = 0; i < 40; i++) await db.query("insert into public.cheer_comments (id, body, ip_hash) values (gen_random_uuid(), $1, 'seed')", ['더미 ' + i]);
r = await rpc('cheer_state'); assert.equal(r.comments.length, 50); assert.equal(r.commentCount, 64); ok('목록은 최근 50개 · 숫자는 전체');

// 12) 욕설 · 비속어는 저장하지 않아요 (바꿔 써도) · 보통 말은 그대로 · 옮기기 · 목록에서도 걸러요
let ipN = 20;
for (const bad of ['씨발 바다', '시.발', '씨 발 해녀', 'ㅅㅂ', '병신', '개새끼야', '존 나 별로', 'FUCK this', 'ｆｕｃｋ', '미친놈', '死ね']) {
  r = await rpc('cheer_comment', { p_id: randomUUID(), p_body: bad }, H('10.0.0.' + ipN++)); assert.equal(r.error, 'bad', bad);
}
ok('욕설 · 비속어 거절 (띄어쓰기 · 문장부호 · 대소문자 · 전각 바꿔 써도)');
for (const good of ['다시 발견한 제주 바다, 해녀님 고마워요', '새끼 거북이도 지켜 주셔서 감사해요', '바다 불빛이 꺼져도 응원할게요', '해녀님 힘내세요!', '보지 못했던 바다를 알게 됐어요', '이 미친 듯이 아름다운 바다']) {
  r = await rpc('cheer_comment', { p_id: randomUUID(), p_body: good }, H('10.0.1.' + ipN++)); assert.equal(r.created, true, good);
}
ok('보통 말은 그대로 저장 (다시 발견 · 새끼 거북이 · 불빛이 꺼져도 …)');
r = await rpc('cheer_import', { p_comments: [{ id: randomUUID(), t: '좋은 응원' }, { id: randomUUID(), t: '씨발' }] }, H('10.0.2.1')); assert.equal(r.imported, 1);
await db.query("insert into public.cheer_comments (id, body, ip_hash) values (gen_random_uuid(), 'ㅅㅂ 예전 글', 'seed')");
r = await rpc('cheer_state'); assert.ok(!r.comments.some((c) => /ㅅㅂ|씨발/.test(c.t))); ok('옛 응원 옮기기 · 목록에서도 욕설은 빠짐');
await assert.rejects(db.transaction(async (tx) => { await tx.exec('set local role anon'); await tx.query("select public.cheer__bad('x')"); }), /permission denied/, '비속어 도우미');

console.log(`\n모두 통과 (${n}개)`);
