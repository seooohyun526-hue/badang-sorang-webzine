# 바당소랑 응원 공용 저장소 — Supabase (`cheer-supabase/`)

웹진 '바다 지키기' 칸의 **응원 온도 창**에서 남긴 좋아요 · 응원의 한 마디를 모든 방문자가 함께 보도록 Supabase 에 저장해요.
서버(Vercel 등)는 따로 필요 없어요. Supabase 하나로 끝나요.

## 어떻게 지켜지나

- 표(`cheer_comments` · `cheer_likes`)는 **잠가 둬요(RLS)**. 웹진은 표를 직접 읽거나 쓰지 못하고, 정해진 함수 4개만 불러요.

  | 함수 | 하는 일 |
  |---|---|
  | `cheer_state()` | 좋아요 수 · 응원 수 · 최근 응원 50개 |
  | `cheer_comment(p_id, p_body)` | 응원 남기기 — 같은 `p_id`(브라우저가 만든 UUID)는 한 번만 저장 → 두 번 눌러도 하나 |
  | `cheer_like()` | 좋아요 |
  | `cheer_import(p_comments)` | 예전에 브라우저에만 남긴 응원 옮기기 (한 번에 20개) |

- 글: 1~100자, 보이지 않는 제어 문자 빼고 빈칸 정리. 웹진은 글을 **글자 그대로만** 보여 줘요 (HTML 로 읽지 않음).
- 연달아 쓰기 제한 (같은 접속 주소): 응원은 8초에 한 번 · 1시간 30개, 좋아요는 0.8초에 한 번 · 하루 1000번.
- 접속 주소(IP)는 그대로 저장하지 않고, 비밀 글자와 섞은 값(해시)만 연달아 쓰기 제한에 써요.
- 다른 사이트에서 함수를 부르는 것까지 막지는 못해요 (Supabase 는 어디서나 부를 수 있어요). 대신 위 규칙은 어디서 불러도 똑같이 지켜져요.

## 처음 한 번 — 만들기 (10분)

1. https://supabase.com 에 가입 → **New project** (이름 예: `badang-sorang`, 지역: Northeast Asia (Seoul), 데이터베이스 비밀번호는 따로 잘 보관).
2. 왼쪽 **SQL Editor** → New query → 이 폴더의 **`schema.sql` 내용을 통째로 붙여 넣고 Run**.
   `Success. No rows returned` 가 나오면 끝이에요. (여러 번 실행해도 괜찮아요 — 저장된 응원은 그대로예요)
3. 왼쪽 아래 **Project Settings → Data API** 에서 **Project URL** (예: `https://abcdefghijklmnop.supabase.co`),
   **Project Settings → API Keys** 에서 **`anon` `public`** 키 (또는 `Publishable key`)를 복사해요.
   - 이 두 가지는 웹페이지에 넣도록 만든 **공개용**이라 웹진에 적어도 괜찮아요.
   - **`service_role` / `secret` 키는 절대 웹진이나 채팅에 넣지 마세요** (모든 걸 열 수 있는 키예요).
4. 웹진에 연결: `build/clean_data.js` 의 `CLEAN.cheer.supabase` 에
   ```js
   supabase: {
     url: "https://abcdefghijklmnop.supabase.co",
     anonKey: "eyJhbGciOi…(anon public 키)"
   },
   ```
   를 적고 다시 빌드 → 올리기. (빌드 명령 앞에 `BS_SUPABASE_URL=… BS_SUPABASE_KEY=…` 를 붙여도 돼요)
5. 확인: 웹진 응원 창 목록 제목이 **'모두가 남긴 응원'** 으로 바뀌고, 다른 브라우저에서 열어도 같은 응원이 보이면 성공이에요.

## 예전에 브라우저에만 남긴 응원

- 웹진이 Supabase 에 처음 닿을 때, 그 브라우저에 남아 있던 응원(최대 20개)을 **자동으로 한 번** 옮겨요. 같은 응원은 두 번 올라가지 않아요.
- 좋아요 숫자는 옮기지 않아요 (브라우저마다 따로 센 숫자라 합치면 실제보다 커져요). 공용 좋아요는 0부터 모여요.
- 옮겨지는 건 **그 브라우저로 다시 웹진을 연 사람의 것**만이에요.

## 관리 (Supabase → SQL Editor)

- 응원 숨기기: `update cheer_comments set hidden = true where body like '%숨길 말%';`
- 다시 보이기: `... set hidden = false ...` · 지우기: `delete from cheer_comments where id = '…';`
- 표 보기: 왼쪽 **Table Editor** → `cheer_comments` (관리자 화면에서는 잠금과 상관없이 보여요)
- 온도 점수: 좋아요 1점 · 응원 3점 · 500점 = 100℃ (웹진 `clean_data.js` 의 `likePoint` · `commentPoint` · `goalScore`).
  점수는 `cheer_config.score_since` 시각 뒤에 저장된 것만 세요 (비어 있으면 처음부터 다). 한 사람당 좋아요 5번도 이 시각부터 다시 세요.
- 온도 리셋 (36.5℃ 부터 다시) — 셋 중 하나만 Run:
  - 남기고 점수만 0부터: `update cheer_config set score_since = now() where id = 1;` (응원 목록은 그대로 보여요)
  - 날짜 기준으로 새로 세기: `update cheer_config set score_since = '2026-10-29 00:00+09' where id = 1;`
  - 모두 지우고 새로 (되돌릴 수 없어요): `delete from cheer_likes; delete from cheer_comments; update cheer_config set score_since = now() where id = 1;`
  - 앞의 두 가지는 `update cheer_config set score_since = null where id = 1;` 로 되돌릴 수 있어요.
- 무료 요금제는 1주일 동안 아무 요청이 없으면 프로젝트가 잠들어요. 대시보드에서 **Restore** 를 누르면 그대로 돌아와요.

## 내 컴퓨터에서 시험

```bash
cd cheer-supabase && npm install && npm test
```

- `npm test` : `schema.sql` 을 컴퓨터 안 Postgres(PGlite)에 그대로 실행해서 저장 · 조회 · 중복 · 연달아 쓰기 · 잘못된 입력 · 옮기기 · 잠금 · 숨기기 13가지를 확인해요.
- `npm run dev` : Supabase 와 같은 모양의 주소(`http://localhost:8788/rest/v1/rpc/…`)를 띄워요.
  웹진을 `BS_SUPABASE_URL=http://localhost:8788 BS_SUPABASE_KEY=local-test-key` 로 빌드하면 화면에서 바로 시험할 수 있어요.
