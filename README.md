# 바당소랑 웹진

제주 해녀의 바다와 삶을 담은 웹진입니다. '바당'은 바다, '소랑'은 사랑이라는 뜻의 제주어예요.

- 웹진 주소: https://lxwebzine.hankyung.com/2026-1/team6/
- 서버(한경닷컴)는 이 저장소의 **`site/` 폴더만** 올려요. 첫 화면은 `site/index.html` 이에요.

## site/ (서버에 올라가는 폴더)

```
site/
  index.html      웹진 (글 · 디자인 · 동작이 모두 들어 있어요, 약 350KB)
  media/          사진(webp) · 첫 화면 영상(mp4) · 파도 소리(m4a) — index.html 이 상대 경로(media/…)로 불러와요
  fonts/          글꼴(woff2)
  og.jpg          공유 미리보기 그림 (1200×630)
  webzine.json    웹진메인 카드 정보 (이름 · 문구 · 사진 · 칸 링크)
```

`site/` 안의 파일은 모두 아래 빌드로 만들어져요. 직접 고치지 말고 `build/` 를 고친 뒤 다시 빌드해요.

## 미리 보기 (GitHub Pages)

- 주소: https://seooohyun526-hue.github.io/badang-sorang-webzine/
- `gh-pages` 브랜치에 `site/` 폴더만 올라가 있어요. `site/` 를 다시 만든 뒤 커밋하고, 아래 명령으로 Pages 도 갱신해요.

```bash
git push origin `git subtree split --prefix site main`:refs/heads/gh-pages --force
```

## 웹진 구성

| 칸 (주소) | 내용 |
|---|---|
| 첫 화면 | 사라지는 해녀 — 1970년부터 줄어든 해녀 수를 '색이 빠지는 해녀'로 보여 줘요 |
| 해녀 이야기 (`#stories`) | 해녀 인터뷰 카드 (영상 · 사진) |
| 목적 (`#purpose`) | 유네스코 인류무형문화유산 — 해산물 인형을 누르면 물질 · 잠수굿 · 해녀노래 · 공동체 이야기 팝업 |
| 바다 지키기 (`#ocean`) | 갯닦기 · 금채 · 바다 쓰레기 수거 BEFORE / AFTER + '응원 온도' 창 |
| 해녀의 바당길 (`#badatgil`) | 미니 게임 안내와 HIGH SCORE (게임: https://haenyeo-ocean-online.vercel.app/) |
| 바당소랑 (`#about`) | 우리 소개 — 같이 잇다, 가치를 잇다 |

화면 오른쪽에는 '게임하러 가기' · '해녀 응원하러 가기' 미니 팝업이 떠 있어요.

## 다시 만들기

Python 3 · Pillow · NumPy · OpenCV 가 필요해요 (카드 사진은 playwright + 크롬도). 저장소 맨 위에서 실행해요.

```bash
BS_FONT=gotgam BS_PURPOSE=v2 BS_GAME=v2 BS_OCEAN=v2 BS_SEABG=v2 PYTHONUTF8=1 python build/build_sea.py build/base_loader.html build site/index.html media/haenyeo-line.svg
```

- 지금 올라간 웹진은 글씨체 `BS_FONT=gotgam`(제목 상주곶감체 · 본문 학교안심 보드마카)이에요. 빼면 예전 기본 글씨체로 만들어져요.
- 상주곶감체 파일은 저장소의 `build/fonts/` 에 없어요(글꼴 파일 수정 · 재배포 금지). 다시 만들 때는 눈누(https://noonnu.cc/font_page/786)에서 받은 `SANJUGotgam.woff` 를 `build/fonts/` 에 넣어 두세요. 웹진(`site/fonts/`)에는 웹폰트로 쓰기 위해 원본 그대로 담겨요.

- 결과: `site/index.html` 과 `site/media/` · `site/fonts/` (사진 · 영상 · 글꼴을 HTML 안에 넣지 않고 파일로 따로 둬요. 사진은 webp · 한 장 500KB 이하)
- 웹진 이름(브라우저 탭 · 공유 미리보기)은 `바당소랑_웹진_1` 이에요. 바꾸려면 `BS_SITE_NAME=…` 을 앞에 붙여요.
- `BS_SEABG=v2` 를 빼면 실사 바다 배경이 없는 판이 만들어져요.

웹진메인 카드(`site/webzine.json`) · 카드 사진 · 공유 미리보기 그림(`site/og.jpg`)은 빌드한 다음에 이렇게 만들어요. 지금 웹진 화면을 찍어 잘라 쓰고, 문구는 웹진 안의 글에서 그대로 가져와요.

```bash
python build/tools/make_cards.py
```

내 컴퓨터에서 미리 볼 때는 파일을 두 번 눌러 열기보다 간단한 서버로 여는 게 정확해요 (파도 소리 · 배경 물결이 브라우저 보안 규칙 때문에 파일로 열면 안 될 수 있어요).

```bash
python -m http.server 8000 -d site
```

## 폴더

```
site/            서버에 올라가는 완성본 (빌드가 만들어요)
build/           빌드 스크립트와 재료
  build_sea.py   빌드 스크립트 (base_loader.html 에 각 칸의 코드 · 그림을 차례로 넣고, site/ 로 내보내요)
  *_data.js      글 · 숫자 데이터 (문구를 바꿀 때는 여기를 고쳐요)
  *.js / *.css   각 칸의 동작과 모양
  tools/         그림 배경 지우기 · 장면 그리기 · 글꼴 줄이기 · 카드 만들기 도구
media/           그림 원본 (캐릭터 · 털실 인형 · 장면)
```

## 글씨체 시안

`BS_FONT=gumi` 를 붙여 빌드하면 제목 = 낭만있구미체(구미시), 본문 = 학교안심 보드마카(KERIS · OFL)로 바뀐 시안이 만들어져요 (게임 칸은 그대로).
낭만있구미체 파일은 배포가 금지라 저장소에 없어요. 시안을 만들 때 `https://cdn.jsdelivr.net/gh/projectnoonnu/2410-1@1.0/GumiRomanceTTF.woff2` 를 `build/fonts/` 에 받아 두세요.
시안은 `site/` 가 아닌 다른 폴더로 내보내요 (예: `preview/gumi/index.html`).

## 문구 · 링크 바꾸는 곳

| 바꿀 것 | 파일 |
|---|---|
| 게임 주소 · 게임 미니 팝업 문구 | `build/game_data.js` (`GAME.url`, `popButton`, `popBubble`) |
| 응원 미니 팝업 문구 | `build/float_data.js` (`SUPPORT`) |
| 바다 지키기 칸 글 · 응원 온도 창 · 후원 · 박물관 주소 | `build/clean_data.js` (`CLEAN`, `CLEAN.cheer`, `CLEAN.cta`) |
| 목적 칸 글 · 해녀문화 팝업 | `build/explore_data.js` (`SEA`) |
| 해녀문화 팝업 사진 | `media/popup/` 에 `01_물질_대표.jpg` 같은 이름으로 넣고 다시 빌드 |
| 영어 · 일본어 번역 | `build/i18n_en.js` · `build/i18n_ja.js` (왼쪽 한국어 원문 → 오른쪽 번역) |

## 언어 (한국어 · English · 日本語)

- 오른쪽 위 언어 줄에서 고른 언어는 브라우저에 기억돼요(`localStorage 'bs-lang'`). 보이는 언어가 바뀌면 보던 자리 그대로 다시 열려요.
- 번역 사전은 `build/i18n_en.js`(English) · `build/i18n_ja.js`(日本語) 예요. 두 사전의 왼쪽(한국어 원문)은 똑같아요. 한국어 글을 고치면 두 사전의 왼쪽도 똑같이 고쳐 주세요. 한 글자라도 다르면 그 글만 한국어로 남아요.
- 다른 언어를 더하려면 사전을 복사해 `build/i18n_<언어>.js` 로 저장하고, 맨 위를 `I18N.<언어> = {` 로 바꾼 뒤 오른쪽만 고쳐요. 언어 줄 버튼은 `build/lang.js` 의 `LANGS` 에 있어요.
- 번역 입히는 코드는 `build/i18n.js`, 언어별 모양 맞춤은 `build/i18n.css` 예요 (그 언어일 때만 적용돼요). 일본어는 컴퓨터 · 휴대폰의 일본어 고딕 · 명조로 보여요.
- 사진 · 영상 · 게임 화면 그림 속 한글은 그림이라 그대로예요. 랭킹 닉네임 · 응원 글처럼 사람이 쓴 글도 바꾸지 않아요.

## 알아 두기

- '응원 온도'(좋아요 · 응원의 한 마디)는 서버가 없어서 **보는 사람의 브라우저에만** 저장돼요. 모두의 응원을 모으려면 서버를 연결해야 해요 (`build/ocean_pop.js` 의 `load` · `save`).
- HIGH SCORE 는 지금 디자인 확인용 샘플 데이터예요 (`build/game_data.js` 의 `RANKING.mode`).
- 바다 지키기 맨 아래 버튼: 후원 = (사)제주해녀협회 후원하기 페이지, 박물관 = 제주해녀박물관 홈페이지 (새 탭).
- 해녀 이야기 3 · 4번은 아직 사진이 없어서 그림으로 보여요.
- 그림은 이해를 돕기 위한 일러스트예요. 해녀 수 출처는 웹진 첫 화면 아래에 적혀 있어요.
