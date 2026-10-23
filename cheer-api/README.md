# 바당소랑 응원 API (`cheer-api/`)

웹진 '바다 지키기' 칸의 **응원 온도 창**에서 남긴 좋아요 · 응원의 한 마디를 모든 방문자가 함께 보도록 저장하는 작은 서버예요.
Vercel 서버리스 함수 + Neon(Postgres) — 게임 랭킹과 같은 조합이에요.

| 주소 | 하는 일 |
|---|---|
| `GET /api/cheers` | 좋아요 수 · 응원 수 · 최근 응원 50개 |
| `POST /api/cheers` `{ "type": "comment", "id": "<UUID>", "t": "글" }` | 응원 남기기 (같은 id 는 한 번만 저장 → 두 번 눌러도 하나) |
| `POST /api/cheers` `{ "type": "like" }` | 좋아요 |
| `POST /api/cheers` `{ "type": "import", "comments": [...] }` | 예전에 브라우저에만 남긴 응원 옮기기 (웹진이 알아서 한 번 보내요) |

지키는 것
- 글: 1~100자, 보이지 않는 제어 문자 빼고 빈칸 정리. 웹진은 글을 **글자 그대로만** 보여 줘요 (HTML 로 읽지 않음).
- 연달아 쓰기 제한: 같은 접속 주소에서 응원은 8초에 한 번 · 1시간 30개, 좋아요는 0.8초에 한 번 · 하루 1000번 (`lib/core.js` 의 `LIMITS`).
- 허용한 웹진 주소에서만 받아요 (CORS · 기본: GitHub Pages, 한경 웹진 서버, 내 컴퓨터 미리 보기).
- 접속 주소(IP)는 그대로 저장하지 않고, 섞어서(해시) 연달아 쓰기 제한에만 써요.

## 처음 한 번 — 배포하기

1. **Neon** (게임에서 쓰는 Neon 계정 그대로 써도 돼요)
   - Neon 콘솔 → 프로젝트(새로 만들거나 기존 것) → **Connection string** 복사 (Pooled connection 권장).
   - 이 주소는 비밀번호와 같아요. **채팅 · 코드 · GitHub 에 적지 말고 3번의 Vercel 설정에만** 넣어요.
   - 표(`cheer_comments`, `cheer_likes`)는 첫 요청 때 저절로 만들어져요.
2. **GitHub**: 이 폴더(`cheer-api/`)가 저장소에 올라가 있어야 해요.
3. **Vercel** → Add New → Project → `badang-sorang-webzine` 저장소 Import
   - **Root Directory: `cheer-api`** (웹진 site/ 가 아니라 이 폴더만)
   - Framework Preset: Other · Build 설정은 비워 둬요
   - Environment Variables
     - `DATABASE_URL` = 1번에서 복사한 Neon 주소 (필수)
     - `IP_SALT` = 아무 긴 글자 (권장, 예: 비밀번호 생성기로 만든 32자)
     - `ALLOWED_ORIGINS` = (선택) 웹진 주소를 쉼표로. 비우면 기본 목록
   - Deploy → 받은 주소 예: `https://badang-sorang-cheer.vercel.app`
4. 확인: 브라우저에서 `https://<받은 주소>/api/cheers` 를 열어 `{"likes":0,"commentCount":0,"comments":[]}` 가 보이면 성공.
5. **웹진에 연결**: `build/clean_data.js` 의 `CLEAN.cheer.api` 에 `https://<받은 주소>/api/cheers` 를 적고 다시 빌드 → 올리기.
   (빌드 명령 앞에 `BS_CHEER_API=https://<받은 주소>/api/cheers` 를 붙여도 돼요)

## 예전에 브라우저에만 남긴 응원

- 웹진이 공용 저장소에 처음 닿을 때, 그 브라우저에 남아 있던 응원(최대 20개)을 **자동으로 한 번** 옮겨요. 같은 응원은 두 번 올라가지 않아요.
- 좋아요 숫자는 옮기지 않아요 (브라우저마다 따로 센 숫자라 합치면 실제보다 커져요). 공용 좋아요는 0부터 모여요.
- 옮겨지는 건 **그 브라우저로 다시 웹진을 연 사람의 것**만이에요. 다른 사람 기기에 남은 응원은 그 사람이 다시 들어와야 옮겨져요.

## 관리

- 응원 숨기기 (Neon 콘솔 → SQL Editor): `UPDATE cheer_comments SET hidden = true WHERE body LIKE '%숨길 말%';`
- 다시 보이기: `... SET hidden = false ...` · 지우기: `DELETE FROM cheer_comments WHERE id = '…';`

## 내 컴퓨터에서 시험

```bash
cd cheer-api && npm install && npm test
```

- `npm test` : 저장 · 조회 · 중복 · 연달아 쓰기 · 잘못된 입력 · 옮기기 · CORS · 숨기기를 컴퓨터 안 Postgres(PGlite)로 확인해요.
- `npm run dev` : `http://localhost:8787/api/cheers` 로 띄워요. 웹진을 `BS_CHEER_API=http://localhost:8787/api/cheers` 로 빌드하면 화면에서 바로 시험할 수 있어요.
