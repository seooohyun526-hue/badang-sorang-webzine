// 저장 · 조회 흐름 시험:  npm test
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { handle, resetSchemaCache, LIMITS } from '../lib/core.js';
import { makeDb } from './pg.mjs';

const { q } = await makeDb();
resetSchemaCache();
const O = 'https://seooohyun526-hue.github.io';
const call = (method, body, ip = '1.1.1.1', origin = O) => handle({ method, origin, ip, body }, q, {});
let n = 0; const ok = (name) => console.log('  ✓', ++n, name);

// 1) 처음엔 비어 있어요
let r = await call('GET');
assert.equal(r.status, 200); assert.deepEqual(r.body, { likes: 0, commentCount: 0, comments: [] });
assert.equal(r.headers['Access-Control-Allow-Origin'], O); ok('빈 목록 조회 + CORS 허용');

// 2) 응원 남기기 → 목록에 바로 보여요 (글은 정리해서 저장: 빈칸 · 제어 문자)
const id1 = randomUUID();
r = await call('POST', { type: 'comment', id: id1, t: '  해녀님   힘내세요!​ ' });
assert.equal(r.status, 201); assert.equal(r.body.commentCount, 1); assert.equal(r.body.comments[0].t, '해녀님 힘내세요!'); assert.equal(r.body.comments[0].id, id1);
ok('응원 저장 · 바로 목록에');

// 3) 같은 응원을 다시 보내도(두 번 클릭 · 다시 시도) 하나만
r = await call('POST', { type: 'comment', id: id1, t: '해녀님 힘내세요!' });
assert.equal(r.status, 200); assert.equal(r.body.duplicate, true); assert.equal(r.body.commentCount, 1); ok('같은 응원 두 번 → 한 번만 저장');

// 4) 너무 빨리 또 남기면 잠깐 기다리게 (같은 접속 주소)
r = await call('POST', { type: 'comment', id: randomUUID(), t: '또 응원해요' });
assert.equal(r.status, 429); assert.ok(r.body.retryAfter >= 1); ok('연달아 남기기 제한 (429)');
// 다른 사람(다른 접속 주소)은 바로 남길 수 있어요
r = await call('POST', { type: 'comment', id: randomUUID(), t: '<script>alert(1)</script> 바다 최고' }, '2.2.2.2');
assert.equal(r.status, 201); assert.equal(r.body.comments[0].t, '<script>alert(1)</script> 바다 최고'); ok('다른 방문자 응원 · 글자는 그대로 저장(화면에서 글자로만 보여요)');

// 5) 잘못된 입력은 거절
for (const [body, why] of [[{ type: 'comment', id: randomUUID(), t: '   ' }, '빈 글'], [{ type: 'comment', id: randomUUID(), t: 'ㄱ'.repeat(LIMITS.maxLen + 1) }, '너무 긴 글'],
  [{ type: 'comment', id: 'abc', t: '안녕' }, '이상한 id'], [{ type: 'comment', id: randomUUID(), t: 123 }, '글이 아님'], ['{bad json', '깨진 JSON'], [{ type: 'hack' }, '모르는 종류']]) {
  r = await call('POST', body, '3.3.3.3'); assert.equal(r.status, 400, why);
}
ok('빈 글 · 긴 글 · 이상한 id · 깨진 요청 거절 (400)');
r = await call('POST', { type: 'comment', id: randomUUID(), t: 'ㄱ'.repeat(LIMITS.maxLen) }, '4.4.4.4'); assert.equal(r.status, 201); ok('100자 딱 맞으면 저장');

// 6) 좋아요 — 모두의 숫자로 쌓여요 · 연타는 막아요
r = await call('POST', { type: 'like' }, '5.5.5.5'); assert.equal(r.status, 200); assert.equal(r.body.likes, 1);
r = await call('POST', { type: 'like' }, '5.5.5.5'); assert.equal(r.status, 429); assert.equal(r.body.likes, 1);
r = await call('POST', { type: 'like' }, '6.6.6.6'); assert.equal(r.body.likes, 2); ok('좋아요 공용 숫자 · 연타 제한');

// 7) 예전에 브라우저에만 남긴 응원 옮기기 — 두 번 해도 한 번만 · 미래 시각은 지금으로
const old = [{ id: randomUUID(), t: '예전 응원 1', at: Date.now() - 864e5 }, { id: randomUUID(), t: '예전 응원 2', at: Date.now() + 9e9 }, { id: 'x', t: '이상한 것' }];
r = await call('POST', { type: 'import', comments: old }, '7.7.7.7'); assert.equal(r.body.imported, 2);
r = await call('POST', { type: 'import', comments: old }, '7.7.7.7'); assert.equal(r.body.imported, 0);
assert.ok(r.body.comments.every((c) => c.at <= Date.now() + 1000)); ok('예전 응원 옮기기 (중복 없음 · 시각 보정)');

// 8) 새로고침 · 다른 기기 = 다시 조회해도 그대로
r = await call('GET', null, '9.9.9.9'); assert.equal(r.body.commentCount, 5); assert.equal(r.body.likes, 2); assert.equal(r.body.comments[0].t.length > 0, true);
ok('다시 조회해도 모두의 응원이 그대로 (5개 · 좋아요 2)');

// 9) 허용하지 않은 사이트에서 오면 막아요 · 미리 묻기(OPTIONS) 응답
r = await call('POST', { type: 'like' }, '8.8.8.8', 'https://evil.example'); assert.equal(r.status, 403);
r = await call('OPTIONS', null, '8.8.8.8'); assert.equal(r.status, 204); assert.match(r.headers['Access-Control-Allow-Methods'], /POST/);
r = await call('GET', null, '8.8.8.8', 'null'); assert.equal(r.headers['Access-Control-Allow-Origin'], 'null'); ok('다른 사이트 차단 · 파일로 열 때(null) 허용');

// 10) 숨긴 응원은 안 보여요 (지울 때: UPDATE cheer_comments SET hidden = true WHERE id = '…')
await q('UPDATE cheer_comments SET hidden = true WHERE id = $1', [id1]);
r = await call('GET'); assert.equal(r.body.commentCount, 4); assert.ok(!r.body.comments.some((c) => c.id === id1)); ok('숨긴 응원은 목록에서 빠짐');

console.log(`\n모두 통과 (${n}개)`);
