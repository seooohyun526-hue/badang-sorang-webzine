# 해녀의 바당길 — 웹진 통합 전달본

## 1. 목표와 현재 준비 상태

목표 주소: **https://lxwebzine.hankyung.com/2026-1/team6/game**

2026-10-23 현재 게임의 복사본입니다. 원래 Vercel 게임이나 DB를 변경하지 않았습니다. 게임을 다른 주소의 iframe으로 감싸는 대신 웹진 주소에서 직접 실행하는 전달본입니다.

- `public/2026-1/team6/game/`: 업로드 가능한 HTML, JS, CSS, 폰트, Unity 실행 파일. Unity 재설치·재빌드 없이 실행 가능합니다.
- `server/`: 기존 서버 API를 웹진의 같은 출처에서 호출하기 위한 Node 22+ 프록시. 외부 패키지 설치가 필요 없습니다.
- `integration/`: 경로 설정과 GA4 게임 이벤트 연결 코드.
- `source/frontend/`: HTML/랭킹/이벤트/언어 UI 수정용 원본.
- `source/Unity/`: Unity 6000.3.26f1 프로젝트의 Assets, Packages, ProjectSettings. Library/Temp 등 캐시는 제외했습니다.
- `source/backend/`: 운영 중 API와 DB 처리 소스의 참조용 복사본. 이전·재배포가 필요할 때만 사용합니다.
- `deployment/nginx.conf.example`, `adapters/next-route.js.example`: 서버 환경에 맞게 선택할 연결 예시.
- `CLAUDE.md`: Claude Code가 먼저 읽을 실제 통합 지침.

## 2. 구조

```text
브라우저
  https://lxwebzine.hankyung.com/2026-1/team6/game
    ├─ 게임 HTML / Build / Fonts / StreamingAssets
    ├─ 웹진의 GA4 또는 GTM → 웹진 주소로 페이지·게임 이벤트 측정
    └─ /2026-1/team6/game/api/{endpoint}
          웹진 서버의 Node 프록시
            → 기존 Vercel /api/{endpoint}
              → 기존 Neon DB
```

게임 점수/응모 저장은 그대로 기존 Neon을 사용합니다. 프런트에 DATABASE_URL, Neon 관리자 키, Vercel 토큰을 넣지 않습니다. 이 방식은 DB 비밀번호나 기존 서버의 환경변수 없이 사용할 수 있습니다. **기존 Vercel 백엔드는 계속 운영해야 합니다.**

## 3. 다른 컴퓨터에서 로컬 확인

Node.js 22 이상에서 이 폴더를 열고 실행합니다. 의존성 설치는 필요 없습니다.

```sh
npm run build
npm test
npm run check
npm run preview
```

브라우저에서 `http://127.0.0.1:8095/2026-1/team6/game/`에 접속합니다. `index.html`을 파일로 더블클릭하면 Unity가 실행되지 않습니다.

**preview는 테스트용입니다.** 닉네임은 Preview, 랭킹은 빈 목록이고 점수/응모를 실제 DB에 저장하지 않습니다. GA4도 localhost에서는 전송하지 않습니다. 실제 운영에서는 `npm start`를 사용합니다.

## 4. 웹진 서버에 적용

### A. Node 서비스 + 기존 웹서버 프록시 (포함 코드의 기본 방식)

1. 전달본을 서버의 공개 디렉터리 밖에 보관합니다. `source/`, `server/`, `test/`를 정적 파일로 공개하지 않습니다.
2. `configuration.mjs`의 주소/경로를 확인합니다. 요청한 웹진 주소로 이미 설정되어 있습니다.
3. 아래 5절의 GA4 연결 방식을 선택한 다음 `npm run build`를 실행합니다.
4. Node 22+에서 `npm start`를 서비스 관리자로 상시 실행합니다. 기본 바인딩은 `127.0.0.1:8787`입니다. 공개 HTTPS는 기존 웹서버가 처리합니다.
5. 기존 `lxwebzine.hankyung.com` HTTPS 서버에 `deployment/nginx.conf.example`의 두 경로만 추가합니다. 다른 팀/웹진 페이지 설정을 덮어쓰지 않습니다.
6. 페이지, 실행 파일, API가 모두 `lxwebzine.hankyung.com/2026-1/team6/game...`에서 응답하는지 확인합니다.

### B. 이미 Next.js 서버가 있는 웹진

- 이 전달본의 `public/2026-1/team6/game/`을 웹진의 `public/2026-1/team6/game/`에 병합합니다.
- `server/game-api-proxy.mjs`와 `configuration.mjs`를 서버 코드 영역에 복사합니다.
- `adapters/next-route.js.example`의 설명대로 App Router API 경로를 연결합니다. import 경로는 프로젝트에 맞게 조정합니다.
- `/2026-1/team6/game` 페이지가 복사한 HTML을 반환하도록 라우팅합니다. 일반 SPA의 fallback HTML이 Unity JS/API 요청까지 가로채지 않게 합니다.

### C. 한경 서버가 정적 파일 업로드만 허용하는 경우

`public/` 복사만으로 게임 화면을 띄울 수 있지만, **닉네임·점수·응모 저장을 같은 출처에서 처리하려면 API 프록시 경로가 추가로 필요합니다.** 서버 담당자에게 A 방식의 경로 연결을 요청하거나, 서버가 지원하는 언어로 `server/game-api-proxy.mjs`의 동작을 옮겨야 합니다.

HTML에서 API 주소만 기존 Vercel 주소로 바꾸지 마세요. 현재 API의 POST 출처 검사 및 플레이어 쿠키가 다른 도메인 직접 호출과 맞지 않습니다. CORS `*`만 추가해도 해결되지 않습니다. 정적 호스팅에 Node 코드만 올리는 것으로 서버 기능이 생기지 않습니다.

## 5. 웹진 도메인 기준 GA4

기존 게임의 고정 GA4/GTM 삽입과 Vercel Analytics 삽입은 이 전달본 HTML에서 제외했습니다. **웹진의 측정 ID/태그를 연결하는 최종 설정이 필요하며, ID를 추정해서 넣지 않았습니다.**

`configuration.mjs`에서 아래 중 **한 가지 방식**을 선택합니다.

### 이미 웹진 공통 태그를 게임 문서에도 넣는 경우: `mode: 'host'` (기본값)

게임은 페이지뷰를 따로 발송하지 않습니다. 게임 HTML에도 웹진의 공통 GA4/GTM 코드가 실제로 들어가야 합니다. 웹진의 다른 HTML에 태그가 있다는 이유만으로 독립된 게임 HTML에도 자동으로 적용되는 것은 아닙니다.

공통 태그는 `source/frontend/index.html`의 `<head>`에 추가하고 `npm run build`를 실행합니다. 소스에서 유지해야 빌드 후에도 남습니다. 이미 `gtag()`가 있으면 게임 이벤트를 그 태그로 보냅니다. GTM만 있으면 dataLayer에 이벤트를 올리므로 아래 이벤트 이름을 받는 GA4 이벤트 태그를 GTM에 게시해야 합니다.

### 게임 HTML이 독립적이고 공통 태그가 없는 경우: `mode: 'gtag'`

```js
export const analytics = {
  mode: 'gtag',
  measurementId: 'G-웹진의실제측정ID',
  gtmContainerId: '',
  allowedHosts: ['lxwebzine.hankyung.com']
};
```

위 예시는 자리표시자입니다. 실제 GA4 ID로 바꾼 뒤 빌드합니다. 페이지뷰는 이 코드에서 한 번 설정하며, 별도 GTM/공통 태그에서 동일 ID로 다시 페이지뷰를 보내지 않습니다.

### 웹진 GTM 컨테이너로 연결하는 경우: `mode: 'gtm'`

웹진의 실제 `gtmContainerId`를 지정합니다. 컨테이너 로더와 noscript가 만들어집니다. 페이지뷰용 Google 태그, `game_*`용 GA4 이벤트 태그를 그 컨테이너에서 설정·게시합니다. 별도 gtag 직접 설치 방식과 동시에 사용하지 않습니다.

### 제공하는 이벤트

| 이벤트 | 시점 | 매개변수 |
| --- | --- | --- |
| game_ready | 게임 타이틀 준비 완료, 페이지당 1회 | game_name, game_language |
| game_start | 새 판 시작 | game_name, game_language |
| game_pause / game_resume | 일시정지 / 재개 | game_name, game_language |
| game_end | 한 판 종료 | score, cleaned, collected, furthest, duration_seconds, game_name, game_language |
| game_record_saved | 서버 기록 저장 성공 | score, cleaned, game_name, game_language |

`duration_seconds`는 해당 판 시작부터 종료까지의 경과시간으로 일시정지 시간도 포함합니다. 게임의 `score`는 게임 점수로, GA4 기본 참여 점수 등의 다른 지표와 구분합니다. 언어/정화 수 등은 GA4 탐색에서 사용하려면 맞는 범위의 맞춤 측정기준/측정항목을 등록합니다.

이메일·닉네임·runId·플레이어 ID·폼 내용은 이 이벤트 코드가 전송하지 않습니다. 이벤트 응모 폼이 있으므로 웹진 공통 태그의 향상된 측정/별도 폼 추적도 개인정보 값을 수집하지 않는지 확인합니다.

최종 HTTPS 페이지에서 GA4 DebugView/실시간 및 Network의 `collect` 요청을 확인합니다. 페이지 위치(`dl`)의 hostname은 `lxwebzine.hankyung.com`, 경로는 `/2026-1/team6/game` 또는 끝에 `/`가 붙은 형태여야 합니다. iframe 속 Vercel 주소를 페이지 위치로 억지로 덮어쓰는 방식은 사용하지 않습니다.

## 6. API 프록시가 처리하는 것

- 공개 경로: `profile`, `session`, `submit`, `leaderboard`, `event-status`, `event-entry`만 허용합니다.
- POST는 웹진과 정확히 같은 Origin의 JSON 요청만 받습니다. 2KB 제한, 12초 upstream 제한을 적용합니다.
- 브라우저 출처를 먼저 검증한 뒤, 기존 서버가 이해할 수 있도록 서버 간 POST의 Origin만 Vercel로 변환합니다.
- 웹진의 로그인/GA 쿠키를 upstream에 보내지 않습니다. 서명된 `ocean_player` 쿠키 하나만 전달합니다.
- 새 플레이어 쿠키를 웹진 호스트 전용, 게임 경로 전용, HttpOnly/Secure/SameSite=Strict로 다시 설정합니다.
- 응모자 정보나 유지관리용 API를 새로 공개하지 않습니다. event-maintenance는 전달하지 않습니다.
- DB/기존 API 로직과 점수 검증을 유지하며, JSON 응답 상태코드를 보존합니다.

## 7. 기록과 닉네임 이전 관련

기존 랭킹 데이터는 Neon에 남아 새 페이지에서도 같은 목록을 조회합니다. 다만 Vercel 주소에 저장된 쿠키/localStorage는 다른 도메인의 웹진으로 자동 이동하지 않습니다. 기존 Vercel 방문자가 새 웹진에서 처음 접속하면 새 플레이어로 인식됩니다. 기존에 선점된 닉네임을 같은 사용자에게 넘기려면 별도 본인 확인/이전 기능이 필요합니다. 닉네임만 같다고 자동 소유권을 넘기지 않습니다.

이메일·응모 기준·기간·개인정보 안내는 현재 게임의 내용을 유지했습니다. 새 접수/DB 생성/추첨/개인정보 삭제를 이 전달 작업에서 실행하지 않았습니다.

## 8. 수정과 재빌드

- 웹 UI: `source/frontend/web/` 수정 → `npm run build`.
- 기본 HTML: `source/frontend/index.html` 수정 → `npm run build`.
- API 경로/분석 연결: `configuration.mjs`, `integration/` 수정 → `npm run build`.
- Unity 게임 자체: `source/Unity`를 Unity Hub에서 열고 원래 빌드 과정을 사용합니다. 결과의 Build/Fonts/StreamingAssets를 `public/2026-1/team6/game/`에 갱신합니다. 이 문서의 게임 HTML 템플릿은 보존합니다.
- DB: 기본 통합에서는 기존 서버가 담당합니다. `source/backend`의 migration 스크립트를 웹진 통합 과정에서 자동 실행하지 않습니다.

완성된 public은 하위 경로가 고정된 전달본입니다. 다른 경로로 바꿀 때는 configuration과 서버 라우팅을 함께 바꾸고 바이너리 폴더도 새 경로로 옮겨야 합니다.

## 9. 검증 범위

`npm test`는 프록시 출처 검사, 쿠키 전달/재설정, 닉네임→세션→점수 저장 연결의 모의 응답, 오류 처리, 중첩 경로, GA 이벤트의 개인정보 제외/중복 방지 등을 확인합니다. mock 테스트를 실제 Neon 쓰기 검증으로 간주하지 않습니다.

로컬 브라우저에서 Unity 타이틀 로딩과 시작/닉네임 흐름을 확인했습니다. 최종 한경 서버의 라우팅·보안 헤더·GA4 수집·실제 닉네임 및 점수/응모 저장은 웹진 배포 후 해당 환경에서 확인해야 합니다. 이 패키지를 만든 것만으로 한경 주소에 배포된 것은 아닙니다.

공식 참고:
- https://developers.google.com/tag-platform/gtagjs/reference
- https://nginx.org/en/docs/http/ngx_http_proxy_module.html
- https://vercel.com/docs/rewrites

