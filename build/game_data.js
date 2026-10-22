/* ───────── 3. 물질의 세계: 미니 게임 '해녀의 바당길' ─────────
   · 게임은 '물질하러 출발' 버튼 하나로만 새 탭에서 열려요 (오른쪽 휴대폰 화면은 눌리지 않는 그림이에요)
   · how: 게임 시작 화면에 적힌 조작법과 같게 맞췄어요 (게임이 바뀌면 함께 고쳐 주세요) */
var GAME = {
  url: "https://haenyeo-ocean-online.vercel.app/",   // 게임 주소 (주소가 바뀌면 여기만 고치세요)
  poster: "media/game-poster.jpg",               // (예전 게임 화면 사진 — 게임 상세 화면에서만 써요)
  shot: "media/game-start.webp",                 // 오른쪽 휴대폰 틀에 들어가는 실제 게임 시작 화면
  shotAlt: "'해녀의 바당길' 게임 시작 화면 — 물질하러 출발 버튼과 최고 기록, 조작 안내가 보여요",
  embed: false,                                  // (게임 상세 화면용) 새 게임 사이트는 다른 웹사이트 안에 넣는 것(iframe)을 막아 둬서(X-Frame-Options: SAMEORIGIN) false 로 둬요
  launchLabel: "게임 시작하기",
  kicker: "물질의 세계 · MINI GAME",
  title: "해녀의\n바당길",
  sub: "바닷속, 한 걸음씩",
  lead: "해녀가 되어 바닷속을 탐험하고, 해양 생물과 함께 나만의 기록을 만들어 보세요.",
  // 조작법: [동작, 설명] — 게임 시작 화면의 안내(탭해서 전진 · 밀어서 방향 이동 · 뒤처지면 종료 · 노란 화살표는 해류 경고)와 같아요
  howTitle: "조작 방법",
  how: [["탭", "앞으로 한 칸 전진"], ["밀기", "밀어서 방향 이동"], ["뒤처지면", "게임 종료 — 화면 아래로 밀리지 않게"], ["노란 화살표", "해류 경고"]],
  playLabel: "물질하러 출발",
  playNote: "게임은 새 탭에서 열려요. 웹진은 이 자리에 그대로 있어요.",
  popKicker: "미니 게임",                         // 오른쪽 미니 팝업(위)의 게임 카드 — 지금 화면에는 popButton · popBubble 만 보여요
  popTitle: "해녀의 바당길",
  popButton: "게임하러 가기",                     // 카드 버튼 글
  popBubble: "바닷속 탐험하러 갈래?",             // 마우스를 올리면 옆에 뜨는 말풍선
  openLabel: "새 창에서 크게 하기"                 // (게임 상세 화면에만 남아 있어요)
};

/* ───────── 3-1. 바당 소랑 HIGH SCORE (게임 칸 아래 랭킹) ─────────
   ★ mode
     "sample" — 디자인 확인용 샘플 데이터 (지금). 화면에 '랭킹 미리보기 · 샘플 데이터'라고 크게 표시돼요. 실제 기록이 아니에요.
     "live"   — 게임 서버의 실제 랭킹을 불러와요. ※ 게임 서버(api/leaderboard)가 웹진 주소를 허용(CORS)해야 열려요.
                 허용되지 않았으면 '불러오지 못했어요' 화면이 보여요 (샘플로 바꿔 보여 주지 않아요)
   · 확인용: 주소 끝에 ?rank=loading · empty · error · sample · live 를 붙이면 그 상태를 미리 볼 수 있어요 */
var RANKING = {
  mode: "sample",
  endpoint: "https://haenyeo-ocean-online.vercel.app/api/leaderboard?metric=score&period=all",
  refreshSeconds: 30,              // live: 화면에 보이는 동안 몇 초마다 다시 불러올지
  bestPerPlayer: true,             // live: 같은 닉네임은 최고 점수 한 번만 (게임 서버는 '판마다' 순위를 줘요)
  limit: 10,
  kicker: "HIGH SCORE",
  title: "바당 소랑 HIGH SCORE",
  sub: "오늘의 바당길 챔피언은 누구일까요?",
  badgeSample: "랭킹 미리보기 · 샘플 데이터",
  badgeLive: "실시간 랭킹",
  noteSample: "지금 보이는 이름과 점수는 디자인을 확인하기 위한 샘플이에요. 실제 참여자의 기록이 아니에요.",
  noteLive: "게임 서버에 저장된 기록이에요. 점수는 게임 화면에서 보낸 값이라 공식 인증 기록은 아니에요.",
  cols: ["RANK", "DIVER", "SCORE", "DATE"],
  loading: "기록을 불러오는 중…",
  empty: "아직 기록이 없어요. 첫 번째 챔피언이 되어 보세요!",
  error: "랭킹을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.",
  retry: "다시 불러오기",
  // 디자인 확인용 샘플 (실제 기록 아님)
  sample: [
    { name: "SEA_MASTER", score: 12500, date: "2026-10-18" },
    { name: "BLUE_DIVER", score: 10800, date: "2026-10-17" },
    { name: "OCEAN_09", score: 9600, date: "2026-10-19" },
    { name: "BADANG_02", score: 8400, date: "2026-10-15" },
    { name: "SORANG_01", score: 7900, date: "2026-10-20" },
    { name: "TEWAK_77", score: 7200, date: "2026-10-16" },
    { name: "SUMBI_SOUND", score: 6650, date: "2026-10-14" },
    { name: "JEJU_WAVE", score: 6100, date: "2026-10-19" },
    { name: "MANGSARI_K", score: 5480, date: "2026-10-13" },
    { name: "BULTEOK_FIRE", score: 4920, date: "2026-10-20" }
  ]
};
