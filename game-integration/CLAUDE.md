# Claude Code 통합 지침

사용자가 요청한 목표는 기존 웹진의 세부페이지 **https://lxwebzine.hankyung.com/2026-1/team6/game**에 실제 Unity 게임을 직접 실행하고, 기존 Neon 랭킹/응모 DB를 유지하면서 **웹진의 GA4**로 측정하는 것입니다. 먼저 `README-KO.md`를 읽으세요.

## 실행할 작업

1. 현재 웹진 저장소의 AGENTS.md/CLAUDE.md와 배포 구성을 확인하세요. 단순 HTML인지 Next인지, 한경 서버에 정적 파일만 올리는지, API reverse proxy를 설정할 수 있는지 실제 증거로 판단하세요.
2. `public/2026-1/team6/game/`의 실제 Unity 실행 파일을 웹진에 병합하세요. 기존 웹진의 다른 파일을 덮어쓰거나 전체를 이 패키지로 교체하지 마세요. Unity 재빌드는 필요 없습니다.
3. `/2026-1/team6/game`와 `/2026-1/team6/game/`에서 동일한 게임 HTML을 제공하세요. HTML의 base 경로를 유지하고 Build/Fonts/StreamingAssets/JS/CSS 요청이 SPA fallback으로 바뀌지 않게 하세요.
4. 같은 출처의 `/2026-1/team6/game/api/{endpoint}`를 구성하세요. 프레임워크와 무관한 Node 핸들러는 `server/game-api-proxy.mjs`입니다. 포함한 Node 서비스+Nginx 또는 Next 어댑터를 실제 환경에 맞게 선택하세요. 서버가 다른 언어만 지원하면 핸들러의 검증/쿠키/제한/응답 계약을 옮기고 테스트하세요.
5. 기존 upstream `https://haenyeo-ocean-online.vercel.app`는 유지하세요. 기존 서버가 Neon 연결과 이메일 암호화를 처리합니다. 프런트나 웹진 저장소에 Neon API 키/DB URL/서버 비밀을 추가할 필요가 없습니다. DB를 새로 만들거나 스키마를 변경하지 마세요.
6. 웹진이 실제로 사용하는 GA4 측정 ID/GTM 컨테이너와 설치 방식을 확인하세요. `configuration.mjs`의 analytics는 기본 host 모드입니다. 독립된 게임 HTML에도 웹진 공통 태그가 실제로 포함되게 하거나 gtag/gtm 중 한 가지 모드로 연결하세요. 현재 게임의 옛 ID라고 해서 웹진 ID로 가정하지 마세요. 페이지뷰와 게임 이벤트가 중복되지 않게 하세요. GTM 모드의 custom event 트리거/GA4 이벤트 태그도 설정·게시가 필요합니다.
7. `npm run build`, `npm test`, `npm run check`를 실행하세요. localhost에서 테스트할 때는 `npm run preview`를 사용하면 실제 DB에 점수를 쓰지 않습니다.
8. 최종 배포 주소에서 Unity 로딩, 한국어/영어, 시작/재시작, 닉네임 선점, 점수 저장/랭킹, 한국어 응모를 확인하세요. 실제 응모를 검증할 때는 사용자의 실제 개인정보나 가짜 응모를 임의로 제출하지 말고 승인된 테스트 환경을 사용하세요. GA4는 웹진 hostname/path와 이벤트 1회 전송을 확인하세요.

## 유지할 조건

- 게임 이름, 픽셀 디자인, 조작, 난이도, 해류, 채집/정화 점수, 닉네임별 최고 기록 집계, 한국어/영어 선택을 유지하세요.
- 영어에서는 응모 안내/접수를 노출하지 않는 기존 동작을 유지하세요.
- 응모는 게임 종료 후 해당 판 점수·정화 기록과 연결됩니다. 이메일은 분석 도구로 보내지 마세요.
- SameSite=Strict 쿠키와 같은 출처 POST 검사를 없애는 방식으로 통합하지 마세요. 외부 도메인의 iframe이나 API CORS *만으로 해결한 것으로 보고하지 마세요.
- 웹진 로그인/GA 쿠키 전체를 Vercel에 전달하지 마세요. event-maintenance 등 운영 경로를 프록시로 공개하지 마세요.
- Unity의 .unityweb 파일에 임의 Content-Encoding:gzip을 붙이지 마세요. 현재 빌드는 Unity 내장 압축 해제 fallback을 사용합니다.
- 최종 사이트 보안 정책(CSP)이 script/worker/blob/WebAssembly/Google 태그 등을 막는 경우 필요한 범위만 조정하고 실제 브라우저에서 확인하세요. 보안 헤더 전체를 지우지 마세요.
- 원래 Vercel 도메인의 브라우저 쿠키는 한경 도메인으로 자동 이전되지 않습니다. 기존 닉네임 소유권을 이름만 보고 넘기지 마세요.

## 정적 서버만 가능한 경우의 결과 보고

게임 화면만 올려놓고 DB/GA4 연결도 끝났다고 보고하지 마세요. 서버 측 프록시를 둘 수 없다면, 필요한 경로와 설정 예시를 서버 담당자가 적용할 수 있게 정리하고 무엇이 실제 검증됐는지 구분해 주세요. 한경 서버 설정 접근 권한이 없는 상황을 코드만으로 해결했다고 주장하지 마세요.

