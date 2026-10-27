/* ───────── 2-1. 해녀들의 해양정화 이야기 ('목적' 다음 · '해녀의 바당길' 앞) ─────────
   '목적' 칸 아래에서 한 장의 큰 종이가 기울어진 채 올라와 반듯해지고, 끝까지 읽으면 반대로 기울며 떠나요.
   · intro: 가운데 정렬 소개 (lead 는 진하게, em 은 주황으로)
   · cards: 해녀가 바다에서 하는 세 가지 일 — 그림 가운데 손잡이를 밀면 BEFORE / AFTER 를 비교할 수 있어요
     ※ 그림은 이해를 돕기 위한 일러스트예요
   · cheer: 이 칸에 들어오면 뜨는 '응원 온도' 창 — 좋아요 · 응원의 한 마디로 온도계가 올라가요 (그림: media/cheer-thermo.webp)
   · cta: 맨 아래 버튼 두 개 — 누르면 url 의 후원 · 박물관 페이지가 새 탭으로 열려요 (url 을 비우면 그 버튼은 숨어요) */
var CLEAN = {
  nav: "바다 지키기",
  srTitle: "해녀의 바다 지키기 — 갯닦기 · 금채 · 바다 쓰레기 수거",   // 화면에 안 보이는 칸 제목 (화면 읽기 · 검색 · AI 용)
  kicker: "해양정화 · OCEAN CARE",
  intro: {
    no: "01", label: "바다를 돌보는 해녀",
    title: "해녀가 다녀가면,\n바다가 달라져요",
    lead: "해녀는 바다를 캐기만 하지 않아요.",
    em: "바위를 닦고, 바다를 쉬게 하고, 쓰레기를 건져 올려요.",
    hint: "그림의 손잡이를 밀어 전후를 비교해 보세요"
  },
  before: "BEFORE", after: "AFTER",
  // 전 · 후 그림 설명 (alt · 검색 · 화면 읽기) — 키: 그림 이름-before / -after
  alts: {
    "gaet-before": "갯닦기 전 — 초록 잡조류로 뒤덮여 찡그린 바위",
    "gaet-after": "갯닦기 후 — 깨끗해진 바위에 미역이 자라고 성게가 곁에 있는 모습",
    "rest-before": "금채 전 — 해조류가 거의 없이 싹 하나만 남은 맨 바위",
    "rest-after": "금채 후 — 바위에 미역이 자라고 소라와 조개가 모여든 모습",
    "net-before": "바다 쓰레기 수거 전 — 버려진 그물에 갇힌 바다거북과 바닥의 플라스틱 병",
    "net-after": "바다 쓰레기 수거 후 — 그물에서 풀려나 헤엄치는 바다거북과 쓰레기를 담은 망사리"
  },
  cards: [
    { no: "01", label: "갯닦기", art: "gaet",
      title: "바다숲이 자랄 자리를 만들어요",
      text: "잡조류를 긁어낸 바위에 미역 포자가 붙어 자라요." },
    { no: "02", label: "금채", art: "rest",
      title: "바다에 회복할 시간을 줘요",
      text: "캐지 않는 시기를 정해 해조류와 어패류가 자랄 시간을 지켜요." },
    { no: "03", label: "바다 쓰레기 수거", art: "net",
      title: "덜 갇히는 바다를 만들어요",
      text: "폐그물·플라스틱을 건져 올리고, 그물에 걸린 생물을 풀어 줘요." }
  ],
  // 이 칸에 들어오면(또는 오른쪽 '바당 소랑 응원하기'를 누르면) 화면 가운데 뜨는 '응원 온도' 창
  //  · 사랑의 열매 '사랑의 온도탑' · 스포츠 '우리 팀 응원하기' 처럼, 좋아요와 응원의 한 마디가 쌓일수록 온도계가 올라가요
  //  · supabase: 응원 공용 저장소 (Supabase · 만드는 법은 cheer-supabase/README.md)
  //      url · anonKey 가 있으면 → 모든 방문자의 좋아요 · 응원이 한 온도계와 목록에 모여요 (새로고침 · 다른 기기에서도 그대로)
  //      비우면 → 예전처럼 보는 사람의 브라우저(localStorage 'bs-cheer')에만 저장돼요
  //      anonKey 는 '공개 키'(anon public)예요 — 웹페이지에 넣도록 만든 키라 여기 적어도 괜찮아요 (service_role 키는 절대 넣지 마세요)
  cheer: {
    supabase: {
      url: "https://wdyfkwjamanzvvadrtbu.supabase.co",   // Supabase 프로젝트 badang-sorang (서울 · 2026-10-26)
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkeWZrd2phbWFuenZ2YWRydGJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMDY3NTksImV4cCI6MjEwODU4Mjc1OX0.XSAXde-ACFkzI4ajqi9a-_uaFwc8YiQYznvGRsUZeds"   // Supabase → Project Settings → API Keys → Legacy → anon public (공개용)
    },
    brand: "BADANG SORANG",
    title: "바다를 지키는 해녀들을 응원해 주세요",
    sub: "좋아요와 응원의 한 마디가 모일수록 바다의 온도가 올라가요.",
    tempLabel: "바다의 온도",
    base: 36.5,             // 처음 온도 (℃) — 사람의 체온에서 시작해요
    min: 30,                // 온도계 맨 아래 눈금 (℃) — 처음엔 관이 거의 비어 있다가 응원으로 차올라요
    goal: 100,              // 목표 온도 (℃) — 온도계 맨 위
    likeStep: 3,            // 좋아요 한 번에 올라가는 온도 (눈에 보이게 쑥 오르도록)
    commentStep: 7,         // 응원의 한 마디 하나에 올라가는 온도
    like: "좋아요",
    likeMax: 5,             // 좋아요는 한 사람(브라우저)당 이만큼까지 (서버 규칙 schema.sql 도 5번 — 바꾸려면 둘 다)
    likeDone: "좋아요를 5번 모두 눌렀어요. 응원 고마워요!",
    likeLimit: "좋아요는 한 사람당 5번까지 누를 수 있어요. 응원의 한 마디도 남겨 주세요!",
    comment: "응원의 한 마디",
    placeholder: "해녀들에게 응원의 한 마디를 남겨 주세요",
    maxLen: 100,
    submit: "남기기",
    tooShort: "한 글자 이상 적어 주세요",
    badWord: "고운 말로 응원을 남겨 주세요. 욕설 · 비속어는 남길 수 없어요.",   // 욕설 · 비속어가 들어간 응원 (웹진 · 서버가 막아요)
    listTitle: "내가 남긴 응원",              // (브라우저에만 저장할 때)
    listTitleShared: "모두가 남긴 응원",       // (공용 저장소를 쓸 때)
    empty: "아직 남긴 응원이 없어요. 첫 응원을 남겨 주세요!",
    reached: "목표 온도에 닿았어요! 응원 고마워요",
    note: "응원은 이 기기(브라우저)에 저장돼요.",
    noteShared: "남긴 응원은 웹진을 찾는 모든 분께 보여요.",
    loading: "응원을 불러오는 중이에요…",
    loadError: "응원을 불러오지 못했어요. 잠시 후 다시 열어 주세요.",
    sending: "보내는 중…",
    sendError: "응원을 남기지 못했어요. 잠시 후 다시 시도해 주세요.",
    tooFast: "조금 뒤에 다시 남겨 주세요.",
    today: "오늘 하루 보지 않기",    // 누르면 오늘이 끝날 때까지 이 칸에 들어와도 저절로 뜨지 않아요 (이 브라우저)
    close: "닫기"                    // 오른쪽 위 × (화면 읽기 프로그램이 읽는 이름) — 누르면 창만 닫히고 이 칸에 그대로 있어요
  },
  closing: { line1: "해녀가 줄어드는 만큼,", em: "바다를 돌보던 손길", rest: "도 줄어듭니다." },
  cta: {
    support: {
      url: "https://www.jejuhaenyeos.com/support",       // (사)제주해녀협회 후원하기 페이지 (새 탭)
      button: "해녀 응원 후원하기 →" },
    museum: {
      url: "https://www.jeju.go.kr/haenyeo/index.htm",   // 제주해녀박물관 홈페이지 (새 탭)
      button: "제주해녀박물관 둘러보기 →" }
  }
};
