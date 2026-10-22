# 바당소랑 웹진

제주 해녀의 바다와 삶을 담은 웹진입니다. '바당'은 바다, '소랑'은 사랑이라는 뜻의 제주어예요.

## 바로 보기

`바당소랑 웹진_배경추가.html` 파일 하나를 내려받아 브라우저로 열면 됩니다.
영상 · 사진 · 글꼴이 모두 이 파일 안에 들어 있어서 인터넷 연결 없이도 열려요(약 16MB).

## 웹진 구성

| 칸 | 내용 |
|---|---|
| 첫 화면 | 사라지는 해녀 — 1970년부터 줄어든 해녀 수를 '색이 빠지는 해녀'로 보여 줘요 |
| 해녀 이야기 | 해녀 인터뷰 카드 (영상 · 사진) |
| 목적 | 유네스코 인류무형문화유산 — 해산물 인형을 누르면 물질 · 잠수굿 · 해녀노래 · 공동체 이야기 팝업 |
| 바다 지키기 | 갯닦기 · 금채 · 바다 쓰레기 수거를 BEFORE / AFTER 로 비교 + '응원 온도' 창 |
| 해녀의 바당길 | 미니 게임 안내와 HIGH SCORE (게임: https://haenyeo-ocean-online.vercel.app/) |
| 바당소랑 | 우리 소개 — 같이 잇다, 가치를 잇다 |

화면 오른쪽에는 '게임하러 가기' · '해녀 응원하러 가기' 미니 팝업이 떠 있어요.

## 폴더

```
바당소랑 웹진_배경추가.html   완성된 웹진 (이 파일 하나로 열려요)
media/                       캐릭터 · 털실 인형 · 장면 그림 원본
build/                       웹진을 다시 만드는 빌드 스크립트와 재료
  build_sea.py               빌드 스크립트 (base_loader.html 에 각 칸의 코드 · 그림을 차례로 넣어요)
  *_data.js                  글 · 숫자 데이터 (문구를 바꿀 때는 여기를 고쳐요)
  *.js / *.css               각 칸의 동작과 모양
  tools/                     그림 배경 지우기 · 장면 그리기 · 글꼴 줄이기 도구
```

## 다시 만들기

Python 3 와 Pillow · NumPy · OpenCV 가 필요해요. 이 폴더(저장소 맨 위)에서 실행해요.

```bash
BS_PURPOSE=v2 BS_GAME=v2 BS_OCEAN=v2 BS_SEABG=v2 PYTHONUTF8=1 python build/build_sea.py build/base_loader.html build "바당소랑 웹진_배경추가.html" media/haenyeo-line.svg
```

`BS_SEABG=v2` 를 빼면 실사 바다 배경이 없는 판이 만들어져요.

## 문구 · 링크 바꾸는 곳

| 바꿀 것 | 파일 |
|---|---|
| 게임 주소 · 게임 미니 팝업 문구 | `build/game_data.js` (`GAME.url`, `popButton`, `popBubble`) |
| 응원 미니 팝업 문구 | `build/float_data.js` (`SUPPORT`) |
| 바다 지키기 칸 글 · 응원 온도 창 · 후원 계좌 · 박물관 주소 | `build/clean_data.js` (`CLEAN`, `CLEAN.cheer`, `CLEAN.cta`) |
| 목적 칸 글 · 해녀문화 팝업 | `build/explore_data.js` (`SEA`) |
| 해녀문화 팝업 사진 | `media/popup/` 에 `01_물질_대표.jpg` 같은 이름으로 넣고 다시 빌드 |

## 알아 두기

- '응원 온도'(좋아요 · 응원의 한 마디)는 서버가 없어서 **보는 사람의 브라우저에만** 저장돼요. 모두의 응원을 모으려면 서버를 연결해야 해요 (`build/ocean_pop.js` 의 `load` · `save`).
- HIGH SCORE 는 지금 디자인 확인용 샘플 데이터예요 (`build/game_data.js` 의 `RANKING.mode`).
- 후원 계좌와 제주해녀박물관 주소는 아직 비어 있어서 누르면 '준비 중' 안내가 나와요.
- 그림은 이해를 돕기 위한 일러스트예요. 해녀 수 출처는 웹진 첫 화면 아래에 적혀 있어요.
