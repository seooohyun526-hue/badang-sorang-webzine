# 바당소랑 웹진에 '해녀의 바당길' 게임 통합 — 결과와 남은 일

받은 전달본(`haenyeo-webzine-integration-2026-10-23.zip`)의 `CLAUDE.md` · `README-KO.md` 지침을 이 웹진에 맞춰 적용한 기록이에요.

## 1. 이 웹진의 배포 방식 (확인한 사실)

- 웹진은 단순 HTML 이에요. `build/` 로 만든 `site/` 폴더가 한경 서버의 `https://lxwebzine.hankyung.com/2026-1/team6/` 에 올라가요. GitHub Pages 에도 같은 `site/` 를 올려요.
- 한경 서버는 **Apache 2.4 정적 호스팅**이에요 (응답 머리글 `Server: Apache/2.4.63`). 2026-10-23 기준 `/2026-1/team6/game` 과 `/2026-1/team6/api/…` 는 404였어요.
- 이 저장소에서 한경 서버의 Apache 설정이나 Node 서비스는 바꿀 수 없어요 → **README-KO.md 4-C (정적 업로드만 가능한 경우)** 에 해당해요.

## 2. 한 일

| 항목 | 내용 |
|---|---|
| 게임 화면 · 실행 파일 | `site/game/` 에 넣었어요 → 한경 주소 `/2026-1/team6/game/`. Unity 재빌드 없음. 웹진의 다른 파일은 그대로예요. |
| 통합 코드 | 이 폴더 `game-integration/` (설정 · 빌드 · 프록시 · 시험). 빌드 결과는 `site/game/` 으로 바로 나와요 (`configuration.mjs` 의 `gameDir`). Unity 원본(`source/Unity`) · 운영 서버 참조 복사본(`source/backend`)은 저장소에 넣지 않았어요 — 받은 zip 에 있어요. |
| 경로 | `<base href="/2026-1/team6/game/">` 유지. 끝 `/` 없는 주소에서도 Unity 가 `StreamingAssets` 를 바른 곳에서 찾도록 `source/frontend/index.html` 의 `streamingAssetsUrl` 을 base 기준 주소로 바꿨어요. |
| GA4 | 웹진은 **GTM `GTM-M2LF732B`** 로 GA4 를 넣고 있고, 그 컨테이너에 GA4 측정 ID **`G-Z57PKSMHPK`** 가 들어 있어요 (공개 gtm.js 에서 확인). 게임 페이지도 **같은 컨테이너 하나만** 불러오게 했어요 (`mode: 'gtm'`). 따로 gtag 를 넣지 않아서 페이지뷰가 두 번 잡히지 않아요. 예전 게임의 GA/GTM ID 는 쓰지 않았어요. |
| DB | 기존 Vercel 서버 → 기존 Neon 그대로. DB 주소 · 키 · 비밀은 저장소에 없어요. DB · 스키마는 손대지 않았어요. |
| 웹진의 게임 버튼 | 아직 기존 Vercel 게임 주소 그대로예요. API 연결(3번)이 끝나기 전에 바꾸면 닉네임 · 점수 저장이 안 되는 게임으로 보내게 돼서요. |

## 3-0. (2026-10-26 추가) Apache 에서 PHP 를 실행할 수 있으면 — 배포 한 번으로 끝

랭킹 오류("온라인 랭킹 서버에 연결하지 못했어요")의 원인은 `/2026-1/team6/game/api/…` 가 404 인 것이었어요.
`site/game/api-proxy.php` (PHP 7.4+ · cURL) 가 같은 출처에서 기존 Vercel API(→ 기존 Neon)로 전달해요. DB 비밀은 없어요.

- 게임은 `apiMode: 'auto'` 예요. 열릴 때 `api-proxy.php?endpoint=__probe` 에 한 번 물어보고 (Vercel 로 요청하지 않음)
  - JSON 으로 답하면 → 모든 게임 API 를 `api-proxy.php?endpoint=…` 로
  - 아니면(404 · PHP 소스 그대로 · 오류) → 지금처럼 `/game/api/…` (아래 3번의 Node 프록시가 있으면 그걸로)
- 그래서 한경 담당자는 **site/ 최신본을 한 번만 배포**하면 돼요.
- 배포 후 확인: `…/game/api-proxy.php?endpoint=profile` · `…/game/api-proxy.php?endpoint=leaderboard&metric=score&period=all` 이 HTTP 200 `application/json`
  - 503 `CURL_REQUIRED`: PHP 는 되지만 cURL 확장이 없음 · 502 `UPSTREAM_UNAVAILABLE`: 서버 → Vercel HTTPS 연결 확인 (TLS 검증은 끄지 않기)
  - PHP 소스가 그대로 보이면 PHP 실행 설정이 없는 것 → 아래 3번(Node 프록시)

## 3. 서버 담당자가 해야 할 일 (이게 있어야 닉네임 · 점수 · 랭킹 · 응모가 동작해요)

1. 서버에 Node 22 이상을 두고, 이 `game-integration/` 폴더를 **공개 폴더 밖**에 둬요.
2. `PORT=8787 SITE_ORIGIN=https://lxwebzine.hankyung.com npm start` 를 서비스로 상시 실행해요 (서버 안 `127.0.0.1:8787` 에서만).
3. 기존 HTTPS VirtualHost 에 `deployment/apache.conf.example` 의 `Location` 한 블록만 추가해요 (API 경로만 Node 로 넘김). 게임 화면 · 실행 파일은 지금처럼 Apache 가 `site/game/` 에서 그대로 줘요.
4. CORS `*` · 외부 iframe 으로 대신하지 않아요. `.unityweb` 에 `Content-Encoding: gzip` 을 붙이지 않아요.

## 4. GTM 에서 게시할 것 (게임 이벤트를 GA4 로 보내려면)

GTM `GTM-M2LF732B` → 작업공간에서:

1. **변수 › 사용자 정의 변수 › 데이터 영역 변수**: `game_name`, `game_language`, `score`, `cleaned`, `collected`, `furthest`, `duration_seconds`
2. **트리거 › 맞춤 이벤트**: 이벤트 이름 `^game_(ready|start|pause|resume|end|record_saved)$`, 정규식 일치 사용 ✔
3. **태그 › Google 애널리틱스: GA4 이벤트**: 측정 ID `G-Z57PKSMHPK` · 이벤트 이름 `{{Event}}` · 매개변수에 1번 변수들 → 트리거는 2번
4. 기존 Google 태그(`G-Z57PKSMHPK`)가 **모든 페이지**에서 실행되는지 확인 (게임 페이지 페이지뷰는 이것 하나로)
5. **미리보기**로 `https://lxwebzine.hankyung.com/2026-1/team6/game/` 에서 이벤트 확인 → **제출(게시)**
6. GA4 에서 언어 · 정화 수 등을 보려면 맞춤 측정기준/측정항목을 등록해요. 게임 코드는 이메일 · 닉네임 · 플레이어 ID 를 보내지 않아요. 응모 폼이 있으니 향상된 측정의 '양식 상호작용'이 개인정보를 모으지 않는지도 확인해요.

## 5. 확인한 것 / 아직 확인 못 한 것

확인함 (내 컴퓨터, 2026-10-23)
- `npm run build` · `npm test` (9개 통과) · `npm run check` 통과
- 읽기 전용 연결 확인: 프록시 → 기존 Vercel 랭킹 API → HTTP 200, 69명 (쓰기 없음)
- `npm run preview` (DB 쓰기 없음) 에서: Unity 로딩, `/game` · `/game/` 둘 다 같은 화면, 실행 파일 404 없음, 한국어(체험권 이벤트 보임) · 영어(이벤트 안 보임), API 요청이 `/2026-1/team6/game/api/…` 로 감, 운영 경로 · 소스 경로는 404
- GTM: 게임 페이지가 `GTM-M2LF732B` 한 개만 불러오고 `game_ready` 가 dataLayer 에 한 번 올라감 (시험 중 구글로 가는 요청은 막아서 실제 데이터는 보내지 않았어요)

아직 못 함 (한경 서버 · GTM 설정이 끝나야 가능)
- 한경 주소에서 API 프록시 동작, 실제 닉네임 선점 · 점수 저장 · 랭킹 반영 · 한국어 응모
- GA4 실시간/DebugView 에서 hostname `lxwebzine.hankyung.com` · 경로 `/2026-1/team6/game/` 와 이벤트 1회 수집
- 기존 Vercel 게임에서 쓰던 닉네임은 한경 주소로 자동으로 넘어오지 않아요 (브라우저 쿠키가 도메인마다 따로예요)

## 6. 다시 만들기

```bash
cd game-integration
npm run build     # site/game/ 의 HTML · JS · 설정을 다시 만들어요
npm test
npm run check
npm run preview   # http://127.0.0.1:8095/2026-1/team6/game/ — DB 에 쓰지 않는 시험용
```
