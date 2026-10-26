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
| 웹진의 게임 버튼 | 웹진 안 게임(`game/`, 한경 `/2026-1/team6/game/`)으로 열려요. API 는 3번처럼 브라우저가 기존 Vercel 서버로 직접 불러요. |

## 3. (2026-10-26 최종) 게임 API — 브라우저가 기존 Vercel 서버로 직접 연결

한경 서버는 파일만 보내 줘요(`api-proxy.php` 를 실행하지 않고 글자 그대로 보냄). 그래서 PHP · Node 프록시 방식은 쓰지 않고, 게임 제작 쪽 전달본 `haenyeo-webzine-direct-api-2026-10-26.zip` 방식으로 바꿨어요.

- 게임 화면 · GA4 주소는 그대로 `https://lxwebzine.hankyung.com/2026-1/team6/game/`.
- 브라우저가 `https://haenyeo-ocean-online.vercel.app/api/…` 를 직접 불러요 (기존 Vercel → 기존 Neon). Vercel 서버는 출처 `https://lxwebzine.hankyung.com` 만 정확히 허용하도록 이미 배포됨(`dpl_3Z39vcDRaoSAAiVXwh6cNz6Fm9sC`).
- 인증: profile 이 돌려주는 서명 토큰(`X-Ocean-Player`)을 localStorage `haenyeo.webzine.player.v1` 에 두고 `Authorization: Bearer` 로 보내요. 쿠키는 보내지 않아요(`credentials: 'omit'`). 토큰은 URL · 분석 이벤트에 넣지 않아요.
- 바뀐 파일 3개: `integration-bootstrap.js`(새 `fetchApi`) · `online.js` · `event.js`(API 호출 한 곳씩 `window.OceanIntegration.fetchApi(path, …)`). `index.html` 은 이 세 스크립트에 `?v=20261026-direct1`(`configuration.mjs` 의 `scriptVersion`)만 붙어요.
- 한경 서버 담당자는 **site/ 최신본을 배포**만 하면 돼요. PHP · Node · 프록시 설정은 필요 없어요. 앞으로 CSP `connect-src` 를 둔다면 `https://haenyeo-ocean-online.vercel.app` 을 허용해야 해요.
- GitHub Pages 미리 보기(`seooohyun526-hue.github.io`)는 허용 출처가 아니라서 그곳 `/game/` 에서는 랭킹 · 닉네임이 연결되지 않아요(정상).
- 예전 PHP 어댑터 · 테스트는 지웠어요(혼용 금지). `deployment/*.example`(Node 프록시)은 참고용으로만 남아 있어요.

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
