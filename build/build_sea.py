import re, sys
base, sp, out, hnsvg = sys.argv[1:5]
s = open(base, encoding='utf-8', newline='').read()
nl = '\r\n' if '\r\n' in s[:5000] else '\n'


def one(old, new):
    global s
    assert s.count(old) == 1, (old[:80], s.count(old))
    s = s.replace(old, new)


def N(t): return t.replace('\r\n', '\n').replace('\n', nl)


import base64
def uri(path): return 'data:image/webp;base64,' + base64.b64encode(open(path, 'rb').read()).decode()
fill_uri = uri(hnsvg.replace('haenyeo-line.svg', 'haenyeo-cutout.webp'))
line_uri = uri(hnsvg.replace('haenyeo-line.svg', 'haenyeo-3d-line.webp'))
scene = f'''      <figure class="sea" id="gSea">
        <!-- 해녀 그림 두 겹: 아래는 얇은 선(media/haenyeo-3d-line.webp), 위는 색이 찬 3D 해녀(media/haenyeo-cutout.webp)
             위 그림이 위에서부터 잘려 나가며 색이 빠지고 선만 남아요. 그림을 바꾸려면 두 src 를 파일 경로로 바꿔요 -->
        <div class="drain" role="img" aria-label="테왁을 안은 해녀 그림. 그림 속 색이 위에서부터 빠져나가 선만 남아요">
          <img class="drain__line" alt="" decoding="async" src="{line_uri}">
          <span class="drain__clip"><img class="drain__fill" id="gFill" alt="" decoding="async" src="{fill_uri}"></span>
        </div>
        <figcaption class="sea__cap"><span class="sea__cap-l">해녀 그림 속 색이 빠져나가는 모습은 줄어드는 해녀의 수를 빗댄 표현이에요.</span><span class="sea__cap-s">색이 빠지는 그림은 줄어드는 해녀 수를 빗댄 표현이에요.</span></figcaption>
      </figure>
'''

# 1) markup: graph → sea
one(N('''        <span class="gate__unit"><svg viewBox="0 0 40 52" aria-hidden="true"><use href="#pict"/></svg><span id="gUnit"></span></span>
        <div class="people" id="gPeople" aria-hidden="true"></div>
        <svg class="chart" id="gChart" viewBox="0 0 640 170" role="img" aria-label="연도별 해녀 수 그래프"></svg>
'''), N(scene))

# 2) css
css = open(sp + '/sea.css', encoding='utf-8').read().strip()
one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(css) + nl + '<script>document.documentElement')

# 3) gate script
a = s.index('  var Gate = (function () {')
b = s.index('  /* ---------- 들어가기 · 처음으로 ---------- */')
s = s[:a] + N(open(sp + '/gate.js', encoding='utf-8').read()) + s[b:]

# 4) settings
one(N('''  holdSeconds: 0.4,                    // 1970년 숫자(14,143명)에서 잠깐 멈춰 있는 시간 (초)
'''), N('''  holdSeconds: 0.4,                    // 1970년 숫자(14,143명) · 색이 가득 찬 해녀에서 잠깐 멈춰 있는 시간 (초)
  drainSeconds: 2.2,                   // 1970년 → 2025년, 해녀 그림 속 색이 빠지는 시간 (초)
  // ※ 아래 dropSeconds · endHoldSeconds · projSeconds 와 peopleUnit · unitLabel 은 예전 그래프용이에요 (지금은 쓰지 않아요)
'''))
one('/* ───────── 해녀 수 (첫 화면 그래프 · 사람 모형) ─────────', '/* ───────── 해녀 수 (첫 화면 · 색이 빠지는 해녀 그림과 숫자) ─────────')


# 5) 해녀 캐릭터 통일 (ART.char → 3D 이미지)
one(N("""  waves: "media/waves.m4a"             // 왼쪽 아래 버튼으로 켜는 파도 소리 ("" 이면 버튼이 숨겨져요)
"""), N("""  waves: "media/waves.m4a",            // 왼쪽 아래 버튼으로 켜는 파도 소리 ("" 이면 버튼이 숨겨져요)
  mascot: "media/haenyeo-cutout.webp"  // 해녀 캐릭터 (3D · 투명 배경). 로딩 · 첫 화면 · 이야기 카드 · 게임 팝업 등 모든 해녀가 이 그림으로 보여요
"""))
one(N("""    MEDIA.introVideo = URL.createObjectURL(new Blob([u], { type: "video/mp4" })); } catch (e) { MEDIA.introVideo = "data:video/mp4;base64," + s; } })();
</script>
"""), N("""    MEDIA.introVideo = URL.createObjectURL(new Blob([u], { type: "video/mp4" })); } catch (e) { MEDIA.introVideo = "data:video/mp4;base64," + s; } })();
/* 해녀 캐릭터(3D): 첫 화면 해녀 그림(#gFill)에 들어 있는 이미지를 웹진 곳곳에서 함께 써요 (한 번만 담아 두고 나눠 써요) */
(function () { var im = document.getElementById('gFill'), s = im && im.getAttribute('src');
  if (!s) return; if (s.indexOf('data:') !== 0) { MEDIA.mascot = s; return; }
  try { var b = atob(s.split(',')[1]), u = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) u[i] = b.charCodeAt(i);
    MEDIA.mascot = URL.createObjectURL(new Blob([u], { type: "image/webp" })); } catch (e) { MEDIA.mascot = s; } })();
</script>
"""))
one(N("""    var s = '<svg class="char char--' + pose + '" viewBox="0 0 240 270" ' + aria + ' focusable="false">' + title;
"""), N("""    // 바당소랑 3D 캐릭터 이미지가 있으면 모든 해녀를 그 그림으로 (빗창 자세 'dive' 는 좌우를 뒤집어 변화를 줘요)
    if (window.MEDIA && has3D(MEDIA.mascot)) {
      return '<img class="char char--' + pose + ' mascot' + (pose === 'dive' ? ' mascot--flip' : '') + '" src="' + MEDIA.mascot + '" alt="' + (opts.title || '') + '"' +
        (opts.title ? '' : ' aria-hidden="true"') + ' decoding="async" draggable="false">';
    }
    var s = '<svg class="char char--' + pose + '" viewBox="0 0 240 270" ' + aria + ' focusable="false">' + title;
"""))
one(N("""  function char(opts) {
"""), N("""  function has3D(v) { return typeof v === 'string' && v !== ''; }
  function char(opts) {
"""))
mcss = open(sp + '/mascot.css', encoding='utf-8').read().strip()
one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(mcss) + nl + '<script>document.documentElement')


# 6) 게임 배너: 해녀 얼굴 이미지
head_uri = uri(hnsvg.replace('haenyeo-line.svg', 'haenyeo-head.webp'))
one(N("""  mascot: "media/haenyeo-cutout.webp"  // 해녀 캐릭터 (3D · 투명 배경). 로딩 · 첫 화면 · 이야기 카드 · 게임 팝업 등 모든 해녀가 이 그림으로 보여요
"""), N("""  mascot: "media/haenyeo-cutout.webp", // 해녀 캐릭터 (3D · 투명 배경). 로딩 · 첫 화면 · 이야기 카드 등 모든 해녀가 이 그림으로 보여요
  gameHead: "media/haenyeo-head.webp"  // 오른쪽 아래 게임 배너의 해녀 얼굴 (3D · 투명 배경)
"""))
one(N("""    MEDIA.mascot = URL.createObjectURL(new Blob([u], { type: "image/webp" })); } catch (e) { MEDIA.mascot = s; } })();
"""), N("""    MEDIA.mascot = URL.createObjectURL(new Blob([u], { type: "image/webp" })); } catch (e) { MEDIA.mascot = s; } })();
MEDIA.gameHead = "%s";
""" % head_uri))
one(N("""    $('.gfab__art', fab).innerHTML = ART.char({ shadow: false });
"""), N("""    $('.gfab__art', fab).innerHTML = has(MEDIA.gameHead)
      ? '<img class="gfab__head" src="' + MEDIA.gameHead + '" alt="" decoding="async" draggable="false">'
      : ART.char({ shadow: false });
"""))

# 7) 화면이 바뀔 때마다 같은 로딩 캐릭터 + 게임 배너는 모든 화면에
one(N("""  var MIN = 1800, waiting = [], revealed = false, step = 0, timers = [];
"""), N("""  var MIN = 1800, waiting = [], revealed = false, step = 0, timers = [];
  var tpl = ld ? ld.cloneNode(true) : null;   // 화면 전환 때 다시 쓰려고 로딩 화면을 하나 복사해 둬요
"""))
one(N("""  window.BSIntro = { onReveal: function (fn) { if (revealed) fn(); else waiting.push(fn); } };
"""), N("""  window.BSIntro = { onReveal: function (fn) { if (revealed) fn(); else waiting.push(fn); }, transition: transition };
  // 화면이 바뀔 때(첫 화면 ↔ 웹진, 웹진 ↔ 상세 화면)도 같은 로딩 화면이 약 1.2초 나왔다가 사라져요
  //  mid: 로딩 화면이 다 덮었을 때 실제로 화면을 바꾸는 일
  var cur = null, tOut = 0, tRm = 0;
  function settle() {                      // 바뀐 화면을 잠깐 덮고 있다가 스르르 사라져요
    clearTimeout(tOut); clearTimeout(tRm);
    tOut = setTimeout(function () {
      if (!cur) return; cur.classList.add('is-out');
      tRm = setTimeout(function () { if (cur && cur.parentNode) cur.parentNode.removeChild(cur); cur = null; }, 450);
    }, 250);
  }
  function transition(mid) {
    var run = function () { try { mid(); } catch (e) { setTimeout(function () { throw e; }); } };
    if (!tpl || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)) return run();
    if (cur) { cur.classList.remove('is-out'); run(); settle(); return; }   // 이미 떠 있으면 그 안에서 바꿔요
    cur = tpl.cloneNode(true);
    cur.removeAttribute('id'); cur.classList.add('ld--pt'); cur.setAttribute('aria-label', '화면을 여는 중이에요');
    document.body.appendChild(cur); void cur.offsetWidth; cur.classList.add('is-show');
    setTimeout(function () { run(); settle(); }, 300);
  }
"""))
one(N("""  function wipeAt(btn, mid) {
"""), N("""  function wipeAt(btn, mid) {
    if (window.BSIntro && BSIntro.transition) return BSIntro.transition(mid);   // 원 대신 같은 로딩 캐릭터로 넘어가요
"""))
one(N("""  $('#btnStart').addEventListener('click', function () {
    Sound.userStart();
    wipeAt(this, function () {
"""), N("""  // 웹진으로 들어가기 (시작하기 · 첫 화면의 게임 배너가 같이 써요)
  function enterSite(btn, after) {
    Sound.userStart();
    wipeAt(btn, function () {
"""))
one(N("""      $('.hd__logo').focus({ preventScroll: true });
      GamePop.show();
    });
  });
"""), N("""      $('.hd__logo').focus({ preventScroll: true });
      GamePop.show();
      if (after) after();
    });
  }
  $('#btnStart').addEventListener('click', function () { enterSite(this); });
"""))
one(N("""      closeMenu(); GamePop.hide();
"""), N("""      closeMenu(); GamePop.sync();
"""))
one(N("""  if (SINGLE) window.addEventListener('hashchange', routeSub);
"""), N("""  // 상세 화면을 열고 닫을 때(뒤로 가기 포함)는 로딩 캐릭터가 잠깐 덮었다가 바뀌어요 (웹진 안 #about 같은 이동은 그대로)
  function routeWithLoader() {
    var done = function () { routeSub(); GamePop.sync(); };
    if (!SINGLE || !gate.hidden) return done();
    var h = decodeURIComponent(location.hash.slice(1));
    var change = subKind(h) || (!subView.hidden && !(h && subView.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(h) : h))));
    if (change && window.BSIntro && BSIntro.transition) BSIntro.transition(done); else done();
  }
  if (SINGLE) window.addEventListener('hashchange', routeWithLoader);
"""))
one(N("""    function sync() { fab.classList.toggle('is-on', !closed && !inGame && gate.hidden); }
    $('.gfab__go', fab).addEventListener('click', function () {
"""), N("""    // 모든 화면(첫 화면 · 웹진 · 상세 화면)에서 보여요. 게임 칸을 보고 있을 때와 게임 상세 화면에서만 숨어요
    function sync() {
      var onGamePage = body.classList.contains('in-sub') && decodeURIComponent(location.hash.slice(1)) === 'game';
      fab.classList.toggle('is-on', !closed && !(inGame && gate.hidden && !body.classList.contains('in-sub')) && !onGamePage);
    }
    $('.gfab__go', fab).addEventListener('click', function (e) {
      if (!gate.hidden) { e.stopImmediatePropagation(); enterSite(this, function () { jump(sec.offsetTop); }); return; }   // 첫 화면 → 웹진의 게임 칸으로
      if (body.classList.contains('in-sub')) { e.stopImmediatePropagation(); location.hash = 'badatgil'; return; }          // 상세 화면 → 웹진의 게임 칸으로
"""))
one(N("""      hide: function () { fab.classList.remove('is-on'); }
"""), N("""      hide: function () { fab.classList.remove('is-on'); },
      sync: sync
"""))
one(N("""  else Gate.play();
})();
"""), N("""  else Gate.play();
  if (!gate.hidden) GamePop.show();   // 첫 화면에서도 게임 배너가 보여요
})();
"""))
one(N("""    if (subView.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(h) : h))) return;   // 상세 화면 안의 '#others' 등
"""), N("""    if (h && subView.querySelector('#' + (window.CSS && CSS.escape ? CSS.escape(h) : h))) return;   // 상세 화면 안의 '#others' 등 (주소에 # 이 없으면 건너뛰어요)
"""))

# 8) 헤엄치는 해녀 (웹진 위를 자유롭게 유영)
swim_uri = uri(hnsvg.replace('haenyeo-line.svg', 'haenyeo-swim.webp'))
one(N("""    <section class="about" id="about" aria-labelledby="abTitle">
"""), N("""    <section class="about" id="about" aria-labelledby="abTitle">
      <!-- ★ 헤엄치는 해녀: 이 소개 칸 안에서만 유영해요 (그림은 아래 --swim-img 한 곳. 예) url('media/haenyeo-swim.webp')) -->
      <div class="swim is-rest" id="swim" aria-hidden="true" style="--swim-img:url('%s')">
        <div class="swim__shadow"></div>
        <div class="swim__fish"><div class="swim__inner">
          <span class="swim__p swim__leg swim__leg--a"></span>
          <span class="swim__p swim__leg swim__leg--b"></span>
          <span class="swim__p swim__main"></span>
        </div></div>
      </div>
""" % swim_uri))
scss = open(sp + '/swim.css', encoding='utf-8').read().strip()
one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(scss) + nl + '<script>document.documentElement')
sjs = open(sp + '/swim.js', encoding='utf-8').read().strip()
one('</body>', N(sjs) + nl + '</body>')

# 9) '바당소랑' 소개 칸: 가만히 있는 해녀 둘(오른쪽 위 빼꼼 · 제목 속)은 빼고 헤엄치는 해녀만
one(N("""      <div class="peek-in peek-in--r" data-art="char" aria-hidden="true"></div>
"""), "")
one('<em>sorang</em><span class="pill pill--char" data-art="char" aria-hidden="true"></span>', '<em>sorang</em>')

# 10) 기사 칸 빼기 · 인터뷰 다음에 '목적' 칸 · 밝은 팔레트
# 10-1 기사 칸과 메뉴 링크를 빼요 (ARTICLES 내용은 그대로 남겨 둬요)
one(N("""    <!-- ===== 3. 기사 3편: 비스듬히 쌓인 카드에서 한 장 골라 뽑기 — 내용은 js/data.js 의 ARTICLES ===== -->
    <section class="articles" id="articles" aria-labelledby="arTitle">
      <div class="ar-head">
        <div class="rv">
          <p class="kicker" data-t="ARTICLES.kicker"></p>
          <h2 class="ar-title-main" id="arTitle" data-t="ARTICLES.title"></h2>
        </div>
        <p class="ar-lead rv" style="--d:.1s" data-t="ARTICLES.lead"></p>
      </div>
      <p class="ar-hint rv" data-t="ARTICLES.hint"></p>
      <div class="ar-stage" id="arStage"></div>
    </section>
    <div class="ar-toast" id="arToast" role="status" aria-live="polite" hidden></div>

"""), "")
one(N("""      <a href="#stories">해녀 이야기</a>
      <a href="#badatgil">해녀의 바닷길</a>
      <a href="#articles">기사</a>
"""), N("""      <a href="#stories">해녀 이야기</a>
      <a href="#purpose">목적</a>
      <a href="#badatgil">해녀의 바닷길</a>
"""))
one(N("""    var stage = $('#arStage'), toast = $('#arToast'), L = ARTICLES.list || [];
"""), N("""    var stage = $('#arStage'), toast = $('#arToast'), L = ARTICLES.list || [];
    if (!stage) return { spread: function () {} };   // 기사 칸을 뺐을 때는 아무것도 하지 않아요
"""))
one("  var SECTIONS = ['stories', 'badatgil', 'articles', 'about', 'ending'].map(function (id) { return document.getElementById(id); });",
    "  var SECTIONS = ['stories', 'purpose', 'badatgil', 'about', 'ending'].map(function (id) { return document.getElementById(id); }).filter(Boolean);")
one("    hd.classList.toggle('is-light', id === 'articles' || id === 'about' || id === 'ending');",
    "    hd.classList.toggle('is-light', id === 'purpose' || id === 'about' || id === 'ending');")
# 10-2 목적 칸 (인터뷰 바로 다음, 게임 앞)
one(N("""    <!-- ===== 2. 물질의 세계: 미니 게임"""), N("""    <!-- ===== 1-2. 목적: 바당소랑이 하는 일 (그린피스 '활동' 칸 참고) — 내용은 PURPOSE ===== -->
    <section class="purpose" id="purpose" aria-labelledby="puTitle">
      <div class="pu__inner">
        <div class="pu__side">
          <p class="kicker rv" data-t="PURPOSE.kicker"></p>
          <h2 class="pu__title rv" id="puTitle"><span data-t="PURPOSE.title"></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5.5 2.5 11 8l-5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></h2>
          <p class="pu__lead rv" style="--d:.08s" data-t="PURPOSE.lead"></p>
          <div class="pu__char" data-art="char" aria-hidden="true"></div>
        </div>
        <div class="pu__feature rv" style="--d:.1s" id="puFeature"></div>
        <ul class="pu__list" id="puList"></ul>
      </div>
    </section>

    <!-- ===== 2. 물질의 세계: 미니 게임"""))
one(N("""var ARTICLES = {
"""), N("""/* ───────── 1-2. 목적 (인터뷰 다음 칸) — 그린피스 '그린피스 활동' 칸처럼: 큰 제목 · 대표 글 하나 · 글 목록 셋 ─────────
   ※ 지금 글은 모두 '예시'예요. 실제 활동 · 날짜 · 링크로 바꿔 주세요. (SITE.showGuides 가 true 면 '예시' 표시가 붙어요)
   · href: 누르면 갈 주소 (비워 두면 눌리지 않아요)
   · img: "poster"(첫 화면 바다 사진) · "head"(해녀 얼굴) · "tewak" · "conch" · "shell" · 또는 사진 경로 "media/사진.jpg" */
var PURPOSE = {
  kicker: "목적",
  title: "바당소랑이\\n하는 일",
  lead: "사라져 가는 해녀의 삶과 제주 바다를 기록하고,\\n더 많은 사람과 나누기 위해 이런 일을 해요.",
  feature: { tag: "기록", type: "프로젝트", time: "5분", date: "2026년 10월 20일", img: "poster", href: "",
             title: "[기록] 바다에서 들은 이야기 — 제주 해녀 인터뷰 아카이브 프로젝트" },
  list: [
    { tag: "교육", type: "체험", time: "4분", date: "2026년 09월 12일", img: "tewak", href: "",
      title: "테왁 하나로 배우는 물질 — 해녀학교 체험 기록" },
    { tag: "바다", type: "캠페인", time: "3분", date: "2026년 08월 30일", img: "shell", href: "",
      title: "해녀의 바다를 지키는 해안 정화 '바당 줍깅'" },
    { tag: "문화", type: "리포트", time: "6분", date: "2026년 07월 15일", img: "head", href: "",
      title: "[리포트] 숫자로 보는 제주 해녀, 1970년부터 2025년까지" }
  ]
};

var ARTICLES = {
"""))
one("  var NS = { GATE: GATE, STORIES: STORIES, ARTICLES: ARTICLES, ABOUT: ABOUT, GAME: GAME, ENDING: ENDING };",
    "  var NS = { GATE: GATE, STORIES: STORIES, PURPOSE: (typeof PURPOSE !== 'undefined' ? PURPOSE : {}), ARTICLES: ARTICLES, ABOUT: ABOUT, GAME: GAME, ENDING: ENDING };")
pjs = open(sp + '/purpose.js', encoding='utf-8').read()
one(N("""  var Articles = (function () {
"""), N(pjs) + N("""  var Articles = (function () {
"""))
# 10-3 밝은 팔레트 + 목적 칸 스타일 (맨 끝에 두어 앞의 색을 덮어써요)
for f_ in ('purpose.css', 'palette.css'):
    c_ = open(sp + '/' + f_, encoding='utf-8').read().strip()
    one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(c_) + nl + '<script>document.documentElement')
one('<meta name="theme-color" content="#0b4652">', '<meta name="theme-color" content="#287F7B">')
one('<feFlood flood-color="#0b4652"/>', '<feFlood flood-color="#244A49"/>')


# 12) 웹진에 들어오자마자 머리 메뉴 색을 맞춰요 (밝은 칸이 맨 위에 올 때를 위해)
one(N("""      Stories.layout();
      $('.hd__logo').focus({ preventScroll: true });
"""), N("""      Stories.layout(); onHeader();
      $('.hd__logo').focus({ preventScroll: true });
"""))


# 13) 휴대폰 · 태블릿(가로 900px 이하): 인터뷰 카드를 손가락으로 옆으로 넘겨요 (세로 스크롤로 옆으로 움직이던 방식 대신)
SWIPE_CSS = """<style id="swipe-style">
/* ★ 인터뷰 카드 — 휴대폰 · 태블릿에서는 손가락으로 옆으로 넘겨요 (화면을 붙잡아 두지 않아서 세로 스크롤은 그대로 지나가요) */
@media (max-width:900px){
  .stories.is-swipe .stories__pin{position:relative}
  .stories.is-swipe .stories__viewport{overflow-x:auto; overflow-y:hidden; scroll-snap-type:x mandatory; overscroll-behavior-x:contain;
    -webkit-overflow-scrolling:touch; scrollbar-width:none; touch-action:pan-x pan-y}
  .stories.is-swipe .stories__viewport::-webkit-scrollbar{display:none}
  .stories.is-swipe .stories__track{flex:none; transform:none!important}
  .stories.is-swipe .st-card{scroll-snap-align:center; scroll-snap-stop:always}
  /* 다음 인터뷰가 오른쪽에 살짝 보이게: 기울기 · 앞뒤 거리 없이 나란히 (손가락으로 넘기는 판에서만) */
  .stories.is-swipe .stories__track{gap:14px}
  .stories.is-swipe .st-card{transform:none!important; opacity:1!important}
}
</style>"""
one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(SWIPE_CSS) + nl + '<script>document.documentElement')
# 13-1) 휴대폰 인터뷰 카드 폭: 화면의 72% (양옆에 이전 · 다음 카드가 살짝 보여요) — 두 군데(웹진 · 상세 화면 아래 '다른 영상')
s = s.replace("cw = W < 700 ? Math.min(W * 0.78, 420, H * 0.46)", "cw = W < 700 ? Math.min(W * 0.72, 420, H * 0.46)")


SW_LAYOUT = """      // 휴대폰 · 태블릿: 손가락으로 옆으로 넘기기 (세로 스크롤은 그대로 지나가요)
      var was = swipe; swipe = mqSwipe.matches; sec.classList.toggle('is-swipe', swipe);
      if (hintEl) hintEl.textContent = swipe ? (STORIES.swipeHint || '옆으로 넘겨 보세요') : hintTxt;
      if (swipe) { sec.style.height = ''; track.style.transform = 'none'; } else { sec.style.height = (innerHeight + maxX) + 'px'; if (was) vp.scrollLeft = 0; }
"""
# --- 메인 '해녀 이야기'
one(N("""    var W = 0, cw = 0, maxX = 0, cur = 0, target = 0, running = false, visible = false, n = cards.length, centers = [];
"""), N("""    var W = 0, cw = 0, maxX = 0, cur = 0, target = 0, running = false, visible = false, n = cards.length, centers = [];
    var mqSwipe = matchMedia('(max-width: 900px)'), swipe = false, hintEl = $('.stories__hint > span', sec), hintTxt = hintEl ? hintEl.textContent : '';
"""))
one(N("""      maxX = Math.max(0, track.scrollWidth - W);
      sec.style.height = (innerHeight + maxX) + 'px';
      centers = cards.map(function (c) { return c.offsetLeft + cw / 2; });
      update(true);
    }
    function progress() { return maxX ? clamp((window.scrollY - sec.offsetTop) / maxX) : 0; }
"""), N("""      maxX = Math.max(0, track.scrollWidth - W);
""" + SW_LAYOUT + """      centers = cards.map(function (c) { return c.offsetLeft + cw / 2; });
      update(true);
    }
    function progress() { if (swipe) return maxX ? clamp(vp.scrollLeft / maxX) : 0; return maxX ? clamp((window.scrollY - sec.offsetTop) / maxX) : 0; }
"""))
one("      cur = reduce ? target : lerp(cur, target, 0.1);", "      cur = (reduce || swipe) ? target : lerp(cur, target, 0.1);")
one(N("""    function goTo(i) {
      i = clamp(i, 0, n - 1);
      var y = sec.offsetTop"""), N("""    function goTo(i) {
      i = clamp(i, 0, n - 1);
      if (swipe) { vp.scrollTo({ left: centers[i] - W / 2, behavior: reduce ? 'auto' : 'smooth' }); return; }
      var y = sec.offsetTop"""))
one(N("""    track.addEventListener('click', function (e) { var b = e.target.closest('[data-open]'); if (b) openSub('story', INTERVIEWS[+b.getAttribute('data-open')].id); });
"""), N("""    track.addEventListener('click', function (e) { var b = e.target.closest('[data-open]'); if (b) openSub('story', INTERVIEWS[+b.getAttribute('data-open')].id); });
    vp.addEventListener('scroll', function () { if (swipe) update(); }, { passive: true });   // 옆으로 넘길 때 번호 · 막대 · 카드 기울기를 맞춰요
"""))
# --- 두 모듈 공통: 옆으로 넘기기에서는 카드 줄을 직접 옮기지 않아요
assert s.count("      track.style.transform = 'translate3d(' + (-cur).toFixed(1) + 'px,0,0)';") == 2
s = s.replace("      track.style.transform = 'translate3d(' + (-cur).toFixed(1) + 'px,0,0)';", "      if (!swipe) track.style.transform = 'translate3d(' + (-cur).toFixed(1) + 'px,0,0)';")
# --- 상세 화면의 '다른 영상 보러 가기'
one(N("""    var W = 0, cw = 0, maxX = 0, cur = 0, target = 0, running = false, centers = [], alive = true;
"""), N("""    var W = 0, cw = 0, maxX = 0, cur = 0, target = 0, running = false, centers = [], alive = true;
    var mqSwipe = matchMedia('(max-width: 900px)'), swipe = false, hintEl = $('.stories__hint > span', sec), hintTxt = hintEl ? hintEl.textContent : '';
"""))
one(N("""      maxX = Math.max(0, track.scrollWidth - W);
      sec.style.height = (innerHeight + maxX) + 'px';
      centers = cards.map(function (c) { return c.offsetLeft + cw / 2; });
      update(true);
    }
    function progress() { return maxX ? clamp((scrollY - sec.offsetTop) / maxX, 0, 1) : 0; }
"""), N("""      maxX = Math.max(0, track.scrollWidth - W);
""" + SW_LAYOUT + """      centers = cards.map(function (c) { return c.offsetLeft + cw / 2; });
      update(true);
    }
    function progress() { if (swipe) return maxX ? clamp(vp.scrollLeft / maxX, 0, 1) : 0; return maxX ? clamp((scrollY - sec.offsetTop) / maxX, 0, 1) : 0; }
"""))
one("      cur = reduce ? target : cur + (target - cur) * 0.1;", "      cur = (reduce || swipe) ? target : cur + (target - cur) * 0.1;")
one(N("""    function goTo(i) {
      i = clamp(i, 0, n - 1);
      scrollTo({ top: sec.offsetTop"""), N("""    function goTo(i) {
      i = clamp(i, 0, n - 1);
      if (swipe) { vp.scrollTo({ left: centers[i] - W / 2, behavior: reduce ? 'auto' : 'smooth' }); return; }
      scrollTo({ top: sec.offsetTop"""))
one(N("""    var onScroll = function () { update(); };
"""), N("""    var onScroll = function () { update(); };
    vp.addEventListener('scroll', function () { if (swipe) update(); }, { passive: true });
"""))

import os
# 14) (목적 버전2) BS_PURPOSE=v2 이면 '목적' 칸을 '테왁 위의 바다'로 바꿔요
#     왼쪽: 망사리에 담긴 털실 인형 4개(물질 · 공동체와 문화전승 · 잠수굿 · 해녀노래 상세 화면으로) / 오른쪽: 프로젝트 목적 글
if os.environ.get('BS_PURPOSE') == 'v2':
    a_ = s.index('    <!-- ===== 1-2. 목적'); b_ = s.index('    <!-- ===== 2. 물질의 세계')
    s = s[:a_] + N('''    <!-- ===== 1-2. 목적 (버전2): '테왁 위의 바다' — 왼쪽 해녀 문화 콜라주(누르면 상세 화면) · 오른쪽 프로젝트 목적 (내용은 SEA) ===== -->
    <section class="purpose sx" id="purpose" aria-labelledby="sxTitle">
      <div class="sx__inner">
        <div class="sx__left">
          <div class="sx__stage" id="sxStage">
            <h2 class="sx__big" id="sxTitle"><span></span></h2>
            <p class="sx__ask" aria-hidden="true" data-t="SEA.ask"></p>
            <p class="sx__tip" aria-hidden="true" data-t="SEA.tip"></p>
          </div>
        </div>
        <div class="sx__purpose">
          <p class="sx-pp__label" id="sxPurposeLabel"></p>
          <h3 class="sx-pp__title" id="sxPurposeTitle"></h3>
          <div class="sx-pp__body" id="sxPurposeBody"></div>
        </div>
      </div>
    </section>

''') + s[b_:]
    # 털실 인형 그림 (이 파일 안에 한 번만 담아 두고, 콜라주 · 목록 · 상세 화면이 함께 써요)
    one('MEDIA.gameHead = "data:', open(sp + '/sea_art.js', encoding='utf-8').read() + 'MEDIA.gameHead = "data:')
    # 내용
    one(N("var ARTICLES = {\n"), N(open(sp + '/explore_data.js', encoding='utf-8').read() + "var ARTICLES = {\n"))
    one("ENDING: ENDING };", "ENDING: ENDING, SEA: (typeof SEA !== 'undefined' ? SEA : {}) };")
    # 해녀문화 팝업 사진: 웹진 폴더의 media/popup/ 에 파일이 있으면 가로 1280px 로 줄여 이 파일 안에 담아요 (없으면 '사진 준비 중')
    import re as _re, json as _json, io as _io, base64 as _bp
    _pdir = os.path.join(os.path.dirname(os.path.abspath(hnsvg)), 'popup')                 # 원본 그림 폴더(저장소 맨 위 media/)
    _lists = [_json.loads(x) for x in _re.findall(r'photos: (\[\[.*?\]\])', open(sp + '/explore_data.js', encoding='utf-8').read())]
    _emb, _got = '', 0
    for _k, _ph in enumerate(_lists):
        for _j, _p in enumerate(_ph):
            _f = os.path.join(_pdir, _p[0])
            if not os.path.isfile(_f): continue
            from PIL import Image as _Im
            _im = _Im.open(_f).convert('RGB')
            if _im.width > 1280: _im = _im.resize((1280, round(_im.height * 1280 / _im.width)), _Im.LANCZOS)
            _bf = _io.BytesIO(); _im.save(_bf, 'JPEG', quality=80, optimize=True, progressive=True)
            _emb += 'SEA.items[%d].photos[%d][2] = "data:image/jpeg;base64,%s";' % (_k, _j, _bp.b64encode(_bf.getvalue()).decode()) + nl
            _got += 1
    print('popup photos embedded:', _got, '/', sum(len(x) for x in _lists))
    if _emb: one('MEDIA.gameHead = "data:', '/* 해녀문화 팝업 사진 (media/popup/) */' + nl + _emb + 'MEDIA.gameHead = "data:')
    # 왼쪽 콜라주 ↔ 오른쪽 목록
    one(N("  var Articles = (function () {\n"), N(open(sp + '/explore.js', encoding='utf-8').read() + "  var Articles = (function () {\n"))
    # 상세 화면 (#sea-id) — 기존 상세 화면(인터뷰 · 게임)과 같은 방식으로
    one(N("  /* ---------- 그리기: root 안에"), N(open(sp + '/explore_sub.js', encoding='utf-8').read() + "  /* ---------- 그리기: root 안에"))
    one("    return page === 'game' ? game(root, o) : story(root, id, o);", "    return page === 'game' ? game(root, o) : page === 'sea' ? sea(root, id, o) : story(root, id, o);")
    one("  function subKind(h) { var m = /^story-(.+)$/.exec(h || ''); return m ? { page: 'story', id: m[1] } : (h === 'game' ? { page: 'game' } : null); }",
        "  function subKind(h) { var m = /^story-(.+)$/.exec(h || ''), q = /^sea-(.+)$/.exec(h || ''); return m ? { page: 'story', id: m[1] } : q ? { page: 'sea', id: q[1] } : (h === 'game' ? { page: 'game' } : null); }")
    # '테왁 위의 바다'는 어두운 바다 칸이라 머리 메뉴를 밝은 글씨로
    one("    hd.classList.toggle('is-light', id === 'purpose' || id === 'about' || id === 'ending');",
        "    hd.classList.toggle('is-light', id === 'about' || id === 'ending');")
    # 게임 배너가 오른쪽 목록 끝을 가리지 않게: 이 칸을 보는 동안에는 잠깐 숨어요 (게임 칸을 볼 때처럼)
    one("    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inGame = en[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(sec);",
        "    if ('IntersectionObserver' in window) { var seen = {}, io = new IntersectionObserver(function (en) { en.forEach(function (e) { seen[e.target.id] = e.isIntersecting; }); inGame = !!(seen.badatgil || seen.purpose); sync(); }, { threshold: 0.25 });\n      io.observe(sec); if ($('#purpose')) io.observe($('#purpose')); }")
    ecss = open(sp + '/explore.css', encoding='utf-8').read().strip()
    # 목적 칸 큰 제목 · 목적 문구 글꼴: 함렛(굵은 명조, SIL OFL) — 필요한 글자만 담아 인터넷 없이도 보여요 (글자를 바꾸면 subset 을 다시 만들어 주세요)
    import base64 as _bh
    _ff = ''.join("@font-face{font-family:'Hahmlet'; font-weight:%d; font-display:block; src:url(data:font/woff2;base64,%s) format('woff2')}\n" % (_w, _bh.b64encode(open(sp + '/hahmlet_%d.woff2' % _w, 'rb').read()).decode()) for _w in (700, 800))
    ecss = ecss.replace('<style id="explore-style">', '<style id="explore-style">\n' + _ff, 1)
    one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(ecss) + nl + '<script>document.documentElement')
    one('<title>바당소랑 — 사라지는 해녀들을 만나다</title>', '<title>바당소랑 — 사라지는 해녀들을 만나다 (목적 버전2)</title>')

# 15) (게임 칸 리뉴얼) BS_GAME=v2 이면 '해녀의 바닷길' 칸을 새 게임(haenyeo-ocean-online)에 맞춰 바꾸고, 아래에 HIGH SCORE 랭킹을 붙여요
if os.environ.get('BS_GAME') == 'v2':
    import base64 as _b64
    def _pix(rows, pal, cls):
        h, w = len(rows), len(rows[0]); r = ''
        for y, line in enumerate(rows):
            for x, ch in enumerate(line):
                if pal.get(ch): r += '<rect x="%d" y="%d" width="1" height="1" fill="%s"/>' % (x, y, pal[ch])
        return '<svg class="%s" viewBox="0 0 %d %d" shape-rendering="crispEdges" aria-hidden="true">%s</svg>' % (cls, w, h, r)
    FISH = ['....aaaa.....', '..aaaaaaaa.aa', '.aabaaaaaaaa.', 'aaaaaaacaaa..', '.aaaaaaaaaaa.', '..aaaaaaaa.aa', '....aaaa.....']
    KELP = ['..a...', '.ab...', '.a..a.', '..a.ab', '.ab.a.', '.a..a.', '..a.a.', '.ab.a.', '.a..ab', '..a.a.', '..aaa.', '..aa..']
    deco = ('<span class="game__deco" aria-hidden="true">' +
            _pix(FISH, {'a': '#ff8a6b', 'b': '#051b2b', 'c': '#ffd2ad'}, 'gd-fish--a') +
            _pix(FISH, {'a': '#ffd25a', 'b': '#051b2b', 'c': '#fff1b8'}, 'gd-fish--b') +
            _pix(FISH, {'a': '#5cd6f2', 'b': '#051b2b', 'c': '#cffaff'}, 'gd-fish--c') +
            _pix(KELP, {'a': '#7fe36f', 'b': '#3fae5a'}, 'gd-kelp--a') +
            _pix(KELP, {'a': '#b98cf5', 'b': '#8a5fd6'}, 'gd-kelp--b') +
            '<i class="gd-bub gd-bub--a"></i><i class="gd-bub gd-bub--b"></i><i class="gd-bub gd-bub--c"></i><i class="gd-bub gd-bub--d"></i></span>')
    a_ = s.index('      <div class="game__inner">', s.index('<section class="game" id="badatgil"'))
    b_ = s.index('    </section>', a_)
    s = s[:a_] + N('''      <div class="game__inner">
        <div class="game__text">
          <p class="game__kicker rv" data-t="GAME.kicker"></p>
          <h2 class="game__title rv" id="gmTitle" data-t="GAME.title"></h2>
          <p class="game__sub rv" data-t="GAME.sub"></p>
          <p class="game__lead rv" data-t="GAME.lead"></p>
          <p class="game__howt rv" id="gameHowTitle"></p>
          <ul class="game__how rv" id="gameHow"></ul>
          <div class="game__btns rv">
            <!-- 게임으로 가는 버튼은 이것 하나뿐이에요 (새 탭) -->
            <a class="pix-btn" id="gamePlay" target="_blank" rel="noopener"><span data-t="GAME.playLabel"></span> ↗<span class="sr-only"> (새 탭에서 열려요)</span></a>
            <p class="game__note" id="gamePlayNote"></p>
          </div>
        </div>
        <!-- 오른쪽: 실제 게임 시작 화면 그림 — 그림 속 '물질하러 출발' 칸을 누르면 게임이 새 탭에서 열려요 -->
        <div class="game__device rv" style="--d:.1s">
          ''' + deco + '''
          <div class="game__screen" id="gameScreen">
            <img class="game__shot" id="gameShot" alt="" decoding="async" draggable="false">
            <a class="game__shotplay" id="gameShotPlay" target="_blank" rel="noopener"><span class="sr-only">물질하러 출발 — 게임이 새 탭에서 열려요</span></a>
            <span class="game__notch" aria-hidden="true"></span>
          </div>
        </div>
        <!-- 셋째 칸: 바당 소랑 HIGH SCORE (내용 · 연결은 RANKING) -->
        <div class="grank rv" id="gameRank" aria-labelledby="grankTitle" style="--d:.2s">
        <div class="grank__head">
          <p class="grank__kicker" id="grankKicker"></p>
          <h3 class="grank__title" id="grankTitle"></h3>
          <p class="grank__sub" id="grankSub"></p>
          <p class="grank__badge" id="grankBadge"></p>
          <p class="grank__note" id="grankNote"></p>
        </div>
        <div class="grank__board" id="grankBoard" aria-live="polite"></div>
        </div>
      </div>
''') + s[b_:]
    # 내용: GAME (새 게임 주소 · 문구) + RANKING
    g0 = s.index("/* ───────── 3. 물질의 세계: 미니 게임 '해녀의 바닷길' ─────────")
    g1 = s.index("};", s.index("var GAME = {", g0)) + 2
    s = s[:g0] + N(open(sp + '/game_data.js', encoding='utf-8').read().rstrip()) + s[g1:]
    if "ENDING: ENDING, SEA:" in s: one("ENDING: ENDING, SEA:", "ENDING: ENDING, RANKING: (typeof RANKING !== 'undefined' ? RANKING : {}), SEA:")
    else: one("ENDING: ENDING };", "ENDING: ENDING, RANKING: (typeof RANKING !== 'undefined' ? RANKING : {}) };")
    # 실제 게임 시작 화면 그림 (이 파일 안에 담아 둬요)
    shot = 'data:image/webp;base64,' + _b64.b64encode(open(sp + '/game_shots/game-start.webp', 'rb').read()).decode()
    one('MEDIA.gameHead = "data:', 'GAME.shot = "' + shot + '";' + nl + 'MEDIA.gameHead = "data:')
    # 게임 칸 동작: 버튼 하나 · 그림은 그림만 + 랭킹
    g0 = s.index("  /* =========================================================\n     5) 물질의 세계".replace('\n', nl))
    g1 = s.index("  /* ---------- 오른쪽 아래 게임 팝업")
    s = s[:g0] + N(open(sp + '/game.js', encoding='utf-8').read()) + nl + s[g1:]
    # 게임 상세 화면(#game)의 조작법 목록도 새 형식([동작, 설명])을 읽게
    one("    var how = (GAME.how || []).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('');",
        "    var how = (GAME.how || []).map(function (h) { return '<li>' + esc(Array.isArray(h) ? h.join(' · ') : h) + '</li>'; }).join('');")
    # 픽셀 글꼴 (랭킹 숫자 · 라벨)
    one('<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap">',
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap">' + nl +
        '  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap">')
    # 게임 이름: '해녀의 바닷길' → '해녀의 바당길' (게임 화면의 이름과 같게)
    s = s.replace('해녀의 바닷길', '해녀의 바당길').replace('해녀의\n바닷길', '해녀의\n바당길').replace('오늘의 바닷길 챔피언', '오늘의 바당길 챔피언')
    gcss = open(sp + '/game.css', encoding='utf-8').read().strip()
    gcss = gcss.replace('__PIXEL_TITLE_WOFF2__', _b64.b64encode(open(sp + '/pixel_title.woff2', 'rb').read()).decode())
    gcss = gcss.replace('__PIXEL_KO_WOFF2__', _b64.b64encode(open(sp + '/fonts/MonaS12-Bold-ko.woff2', 'rb').read()).decode())   # 랭킹 한글 픽셀체
    # 랭킹 숫자 · 라벨 글꼴 Press Start 2P (SIL OFL) — 웹진은 바깥 글꼴을 불러오지 않아서 영문 · 숫자만 담아 넣어요
    gcss = gcss.replace('<style id="game-v2-style">', '<style id="game-v2-style">\n' + "@font-face{font-family:'Press Start 2P'; font-display:block; src:url(data:font/woff2;base64," + _b64.b64encode(open(sp + '/pressstart2p.woff2', 'rb').read()).decode() + ") format('woff2')}", 1)
    one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(gcss) + nl + '<script>document.documentElement')

# 16) (해양정화 칸) BS_OCEAN=v2 이면 '목적' 다음 · '해녀의 바당길' 앞에 '해녀들의 해양정화 이야기'(#ocean)를 넣어요
if os.environ.get('BS_OCEAN') == 'v2':
    one('    <!-- ===== 2. 물질의 세계', N('''    <!-- ===== 2-1. 해녀들의 해양정화 이야기 — 한 장의 큰 종이가 아래에서 올라와요 (grail-app.com Chapter 3 방식, 내용은 CLEAN) ===== -->
    <section class="oc" id="ocean" aria-labelledby="ocTitle">
      <div class="oc-paper">
        <div class="oc-paper__in">
          <header class="oc-paper__top">
            <div class="oc__bar"><p class="oc__kicker"></p><p class="oc__side"></p></div>
            <h2 class="sr-only" id="ocTitle"></h2>
          </header>
          <div class="oc-paper__rows"></div>
        </div>
      </div>
    </section>

''') + '    <!-- ===== 2. 물질의 세계')
    # 내용
    one(N("var ARTICLES = {\n"), N(open(sp + '/clean_data.js', encoding='utf-8').read() + "\nvar ARTICLES = {\n"))
    # 메뉴 · 머리 메뉴가 지금 칸을 알아보게
    one('      <a href="#badatgil">', '      <a href="#ocean">바다 지키기</a>' + nl + '      <a href="#badatgil">')
    one("var SECTIONS = ['stories', 'purpose', 'badatgil',", "var SECTIONS = ['stories', 'purpose', 'ocean', 'badatgil',")
    # 종이 위에서는 머리 메뉴를 밝은 바탕 · 진한 글씨로
    one("    hd.classList.toggle('is-light', id === 'about' || id === 'ending');", "    hd.classList.toggle('is-light', id === 'ocean' || id === 'about' || id === 'ending');")
    # 해양정화 카드 BEFORE / AFTER 장면 (털실 인형 스타일 · media/ocean/) — 이 파일 안에 담아 둬요
    import base64 as _bo
    _arts = {}
    for _k in ('gaet', 'rest', 'net'):
        for _s in ('before', 'after'):
            _arts[_k + '-' + _s] = 'data:image/webp;base64,' + _bo.b64encode(open(sp + '/scenes/%s-%s.webp' % (_k, _s), 'rb').read()).decode()
    one('MEDIA.gameHead = "data:', 'window.CLEAN_ART = ' + __import__('json').dumps(_arts) + ';' + nl + 'MEDIA.gameHead = "data:')
    # 움직임 (게임 칸 앞에)
    one(N("  var Game = (function () {\n"), N(open(sp + '/clean.js', encoding='utf-8').read() + "\n  var Game = (function () {\n"))
    ocss = open(sp + '/clean.css', encoding='utf-8').read().strip()
    one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + N(ocss) + nl + '<script>document.documentElement')

# 17) 인터뷰 카드 썸네일 · 이름 (1번 김은영 해녀 · 2번 조은별 해녀 · 3번 카일리 해녀 · 4번 전 해녀 학교 강사 최명수 & 박신혜 해녀) — 사진은 이 파일 안에 담아 둬요
if True:
    import base64 as _b64i
    one('    name: "○○○ 해녀",                 // 이름 또는 공개 가능한 호칭\n    title: "",                         // 한 줄 소개 (예: "○○마을 해녀") — 확인된 내용만\n    theme: "해녀의 하루",'.replace('\n', nl),
        '    name: "김은영 해녀",              // 이름 또는 공개 가능한 호칭\n    title: "",                         // 한 줄 소개 (예: "○○마을 해녀") — 확인된 내용만\n    theme: "해녀의 하루",'.replace('\n', nl))
    one('    photo: "images/interview-1.jpg",   // 대표 사진 (없으면 일러스트가 보여요)', '    photo: "media/interview-1.webp",   // 대표 사진 (영상 썸네일 · 없으면 일러스트가 보여요)')
    one('    label: "이야기 둘",' + nl + '    name: "○○○ 해녀",', '    label: "이야기 둘",' + nl + '    name: "조은별 해녀",')
    # 3번 카일리 해녀 · 4번 전 해녀 학교 강사 최명수 & 박신혜 해녀 (2026-10-23 사용자가 알려 줌)
    one('    label: "이야기 셋",' + nl + '    name: "○○○ 해녀",', '    label: "이야기 셋",' + nl + '    name: "카일리 해녀",')
    one('    label: "이야기 넷",' + nl + '    name: "○○○ 선생님",', '    label: "이야기 넷",' + nl + '    name: "전 해녀 학교 강사 최명수 & 박신혜 해녀",')
    one('    photo: "images/interview-2.jpg",', '    photo: "media/interview-2.webp",')
    emb = ''.join('INTERVIEWS[%d].photo = "data:image/webp;base64,%s";' % (k, _b64i.b64encode(open(sp + '/interview-%d.webp' % (k + 1), 'rb').read()).decode()) + nl for k in (0, 1))
    one('MEDIA.gameHead = "data:', '/* 인터뷰 카드 썸네일 (media/interview-1.webp · interview-2.webp 를 이 파일 안에 담음) */' + nl + emb + 'MEDIA.gameHead = "data:')

# 19) 바당소랑 칸(#about) 아래쪽 '우리가 해녀를 만나는 이유' → '같이 잇다, 가치를 잇다' (사용자가 준 문구 그대로)
#     왼쪽 제목은 굵은 명조 함렛(Hahmlet 700 — 목적 · 바다 지키기 칸과 같은 글꼴, 글자는 hahmlet_subset.py 로 담아요)
if True:
    one('  whyTitle: "우리가 해녀를 만나는 이유",', '  whyTitle: "같이 잇다,\\n가치를 잇다",')
    one('    { no: "01", text: "해녀는 줄어드는 숫자이기 전에,\\n지금도 바다에 드는 사람입니다." },' + nl +
        '    { no: "02", text: "우리가 만난 해녀들은 생각보다 밝았고,\\n좋은 이야기를 많이 들려주었습니다." },' + nl +
        '    { no: "03", text: "그래서 위기보다 먼저,\\n그 삶과 바다를 기록하기로 했습니다." }',
        '    { no: "01", text: "우리가 만난 해녀들은 줄어드는 숫자가 아니라,\\n지금도 밝게 바다에 드는 사람들이었습니다." },' + nl +
        '    { no: "02", text: "다른 일과 함께하면서도 바다를 놓지 않는 마음,\\n그 마음을 더 많은 사람과 같이 잇습니다." },' + nl +
        '    { no: "03", text: "바다를 돌보던 손길과 서로를 지키던 마음,\\n그 가치를 다음 세대로 잇습니다." }')
    # 줄바꿈 앞에 띄어쓰기를 둬서, 좁은 화면에서 줄바꿈을 숨겨도 '아니라, 지금도'처럼 띄어 읽혀요
    one("'</b><span>' + nl(w.text) + '</span></li>'", "'</b><span>' + nl(w.text).replace(/<br>/g, ' <br>') + '</span></li>'")
    one('</head>', N("""<style id="about-why-style">
/* 바당소랑 칸 '같이 잇다, 가치를 잇다' 제목 — 굵은 명조 함렛 */
.why__title{font-family:'Hahmlet',var(--serif); font-weight:700; line-height:1.38; letter-spacing:-.025em}
.why__list span{word-break:keep-all}
/* 좁은 화면에서는 억지 줄바꿈 없이 자연스럽게 흘러요 ('아니라,' 같은 말이 혼자 떨어지지 않게) */
@media (max-width:560px){.why__list span br{display:none}}
</style>
""") + '</head>')

# 20) 오른쪽 미니 팝업 2개 (위: 게임 · 아래: 후원) — 화면 오른쪽 가운데에 세로로 떠 있어요 (휴대폰은 오른쪽 아래 동그란 아이콘)
#     · 게임 팝업은 원래 것(#gameFab · GamePop: 누르면 '해녀의 바당길' 칸으로, 닫기)을 그대로 두고 모양 · 자리만 바꿔요
#     · 그림은 사용자가 만든 캐릭터: media/float-game.webp (게임) · media/float-support.webp (후원) — 배경만 지운 것 (scratchpad 의 cut_float.py)
#     · 후원 주소는 SUPPORT.url (float_data.js) 한 곳 — 비어 있으면 웹진 안 '바다 지키기' 후원 안내로 이동해요
#     · 모양: float.css · 후원 팝업 동작: float.js
if True:
    import base64 as _b64f, os
    _fl = lambda n: 'data:image/webp;base64,' + _b64f.b64encode(open(os.path.join(os.path.dirname(os.path.abspath(hnsvg)), n), 'rb').read()).decode()
    one('MEDIA.gameHead = "data:', '/* 오른쪽 미니 팝업 캐릭터 (media/float-game.webp · float-support.webp 를 이 파일 안에 담음) */' + nl +
        'MEDIA.floatGame = "' + _fl('float-game.webp') + '";' + nl + 'MEDIA.floatSupport = "' + _fl('float-support.webp') + '";' + nl + 'MEDIA.gameHead = "data:')
    one('var ABOUT = {', N(open(sp + '/float_data.js', encoding='utf-8').read()) + 'var ABOUT = {')
    # 게임 팝업 그림: 새 게임 캐릭터 (없으면 예전 해녀 얼굴 → 그림)
    one(N("""    $('.gfab__art', fab).innerHTML = has(MEDIA.gameHead)
      ? '<img class="gfab__head" src="' + MEDIA.gameHead + '" alt="" decoding="async" draggable="false">'
"""), N("""    $('.gfab__art', fab).innerHTML = has(MEDIA.floatGame)       // 오른쪽 미니 팝업: 사용자가 만든 게임 캐릭터 (media/float-game.webp)
      ? '<img class="fcard__img" src="' + MEDIA.floatGame + '" alt="" decoding="async" draggable="false">'
      : has(MEDIA.gameHead)
      ? '<img class="gfab__head" src="' + MEDIA.gameHead + '" alt="" decoding="async" draggable="false">'
"""))
    # 마크업: 게임 팝업을 오른쪽 세로 묶음(.fdock) 안으로 옮기고, 아래에 후원 팝업을 더해요
    one('<div class="gfab" id="gameFab">', N("""<!-- 오른쪽 미니 팝업 2개: 위 = 게임 · 아래 = 후원 (모양은 #float-style) -->
<div class="fdock" id="floatDock">
<div class="gfab fcard fcard--game" id="gameFab">"""))
    one('  <span class="gfab__bubble" aria-hidden="true"></span>', '  <span class="gfab__bubble fcard__bubble" aria-hidden="true"></span>')
    one('  <button class="gfab__go" type="button"', '  <button class="gfab__go fcard__go" type="button"')
    one('    <span class="gfab__art" aria-hidden="true"></span>', '    <span class="gfab__art fcard__art" aria-hidden="true"></span>')
    one('    <span class="gfab__btn"></span>', '    <span class="gfab__btn fcard__label"></span>')
    one(N("""  <button class="gfab__close" type="button" aria-label="게임 팝업 닫기">×</button>
</div>
"""), N("""  <button class="gfab__close fcard__close" type="button" aria-label="게임 팝업 닫기">×</button>
</div>
<div class="fcard fcard--support" id="supportFab">
  <span class="fcard__bubble" aria-hidden="true"><b class="fcard__bt"></b><span class="fcard__bs"></span></span>
  <a class="fcard__go">
    <span class="fcard__art" aria-hidden="true"></span>
    <span class="fcard__label"></span>
  </a>
  <button class="fcard__close" type="button" aria-label="후원 팝업 닫기">×</button>
</div>
</div>
"""))
    one(N("""      sync: sync
    };
  })();
"""), N("""      sync: sync
    };
  })();

""") + N(open(sp + '/float.js', encoding='utf-8').read()))
    # 예전 큰 배너는 '목적' 칸의 글을 가려서 거기서도 숨었는데, 작은 카드는 가리지 않아요 → 두 팝업 모두 '바다 지키기' · 게임 칸에서만 숨어요
    one("inGame = !!(seen.badatgil || seen.purpose); sync();", "inGame = !!seen.badatgil; sync();")
    one('</head>', N(open(sp + '/float.css', encoding='utf-8').read()) + '</head>')

# 21) (해양정화 칸) BS_OCEAN=v2 이면, '바다 지키기' 칸에 들어올 때 화면 가운데 '응원 온도' 창이 떠요 (내용은 CLEAN.cheer)
#     · 모양: ocean_pop.css · 동작: ocean_pop.js (좋아요 · 응원의 한 마디 → 온도계가 올라가요 · 응원 기록 localStorage 'bs-cheer'
#       · 오늘 하루 보지 않기 = localStorage 'bs-ocean-pop-hide' 에 오늘 날짜)
#     · 그림: media/cheer-thermo.webp — 사용자가 만든 '사랑의 온도' 해녀 장면에서 관 속 빨간 눈금만 지운 것 (scratchpad 의 make_thermo.py)
if os.environ.get('BS_OCEAN') == 'v2':
    import base64 as _b64o, os as _os
    _op = 'data:image/webp;base64,' + _b64o.b64encode(open(_os.path.join(_os.path.dirname(_os.path.abspath(hnsvg)), 'cheer-thermo.webp'), 'rb').read()).decode()
    one('MEDIA.gameHead = "data:', '/* 해양정화 응원 온도 창의 온도계 그림 (media/cheer-thermo.webp 를 이 파일 안에 담음) */' + nl + 'MEDIA.cheerThermo = "' + _op + '";' + nl + 'MEDIA.gameHead = "data:')
    one(N("  var Game = (function () {\n"), N(open(sp + '/ocean_pop.js', encoding='utf-8').read() + "  var Game = (function () {\n"))
    one('</head>', N(open(sp + '/ocean_pop.css', encoding='utf-8').read()) + '</head>')

# 22) 로딩: 새로고침할 때도 처음 열 때와 같은 로딩 캐릭터가 나와요 (예전엔 같은 탭에서 한 번만 → 새로고침하면 첫 화면의 바다 물방울 모양이 잠깐 보였어요)
#     · 짧게: 최소 0.7초(예전 1.8초) · 웹진이 다 읽히면 바로 0.45초 동안 스르르 사라져요
#     · 상세 화면 주소(#story-1 등)로 바로 들어올 때는 예전처럼 건너뛰어요
if True:
    one("   · 같은 탭에서 새로고침하면 다시 보이지 않아요 (주소 끝에 ?intro 를 붙이면 다시 볼 수 있어요)",
        "   · 처음 열 때도, 새로고침할 때도 같은 로딩 캐릭터가 짧게 나와요")
    one("   · 해녀가 최소 1.8초 뛰고, 웹진(영상이 든 큰 파일)이 다 읽히면 스르르 사라지며 바다 첫 화면이 바로 보여요",
        "   · 해녀가 최소 0.7초 뛰고, 웹진(영상이 든 큰 파일)이 다 읽히면 스르르 사라지며 바다 첫 화면이 바로 보여요")
    one("  var MIN = 1800, waiting = [], revealed = false, step = 0, timers = [];", "  var MIN = 700, waiting = [], revealed = false, step = 0, timers = [];")
    one(N("""    if (!ld || location.hash.length > 1 || (seen && !force)) return remove();
    try { sessionStorage.setItem('bs-intro', '1'); } catch (e) {}
"""), N("""    if (!ld || location.hash.length > 1) return remove();
"""))
    one("    var ready = function () { later(out, Math.max(150, (reduce ? 900 : MIN) - (Date.now() - t0))); };",
        "    var ready = function () { later(out, Math.max(100, (reduce ? 600 : MIN) - (Date.now() - t0))); };")
    one("    later(remove, 800);", "    later(remove, 480);")
    one(".ld.is-out{opacity:0; pointer-events:none; cursor:auto; transition:opacity .75s cubic-bezier(.4,0,.2,1)}",
        ".ld.is-out{opacity:0; pointer-events:none; cursor:auto; transition:opacity .45s cubic-bezier(.4,0,.2,1)}")
    one(".ld.is-out .ld__box{transform:translateY(-10px) scale(.96); transition:transform .75s cubic-bezier(.4,0,.2,1)}",
        ".ld.is-out .ld__box{transform:translateY(-10px) scale(.96); transition:transform .45s cubic-bezier(.4,0,.2,1)}")

# 23) (글씨체 시안) BS_FONT=gumi → 제목 낭만있구미체 · BS_FONT=gotgam → 제목 상주곶감체 · BS_FONT=cafe24 → 제목 카페24 클래식타입 · BS_FONT=keris → 제목 케리스 케듀체 · BS_FONT=mulgyeol → 제목 학교안심 물결(유네스코 칸 제목 제외), 본문은 둘 다 학교안심 보드마카 (게임 칸은 그대로)
#     · 글꼴 파일: build/fonts/ (눈누 웹폰트 · 파일을 자르지 않고 그대로 담아요) · 모양: build/font_gumi.css
#     · 결과 파일 이름 예: 바당소랑_웹진_글씨체_낭만있구미.html (여러 시안을 만들어 비교해요)
if os.environ.get('BS_FONT') in ('gumi', 'gotgam', 'cafe24', 'keris', 'mulgyeol'):
    import base64 as _b64g
    _gf = lambda n: _b64g.b64encode(open(sp + '/fonts/' + n, 'rb').read()).decode()
    _fk = os.environ.get('BS_FONT')
    _fc = open(sp + '/font_%s.css' % _fk, encoding='utf-8').read()
    _fc = _fc.replace('__BOARD__', _gf('HakgyoansimBoadmarkerR.woff2'))
    if _fk == 'gumi': _fc = _fc.replace('__GUMI__', _gf('GumiRomanceTTF.woff2'))
    if _fk == 'gotgam': _fc = _fc.replace('__GOTGAM__', _gf('SANJUGotgam.woff')).replace('__ROUNDNUM__', _gf('dunggeunmiso-B-num.woff2'))
    if _fk == 'cafe24': _fc = _fc.replace('__CAFE24__', _gf('Cafe24ClassicType-Regular.woff2')).replace('__ROUNDNUM__', _gf('dunggeunmiso-B-num.woff2'))
    if _fk == 'keris': _fc = _fc.replace('__KERIS__', _gf('KERISKEDU_B.woff2')).replace('__ROUNDNUM__', _gf('dunggeunmiso-B-num.woff2'))
    if _fk == 'mulgyeol': _fc = _fc.replace('__MULGYEOL__', _gf('TTHakgyoansimMulgyeolB.woff2')).replace('__ROUNDNUM__', _gf('dunggeunmiso-B-num.woff2'))
    one('</head>', N(_fc) + '</head>')

# 25) 언어 선택 (오른쪽 위 고정 · 모든 화면) — 한국어 · English · 日本語 (고른 언어를 표시 · 기억만, 번역은 아직) · 모양 lang.css · 동작 lang.js
if True:
    one(N("  var GamePop = (function () {\n"), N(open(sp + '/lang.js', encoding='utf-8').read() + "  var GamePop = (function () {\n"))
    one('</head>', N(open(sp + '/lang.css', encoding='utf-8').read()) + '</head>')

# 26) 영어판 · 일본어판 — 번역 사전(build/i18n_en.js · 나중에 i18n_ja.js 도 같은 모양으로) + 번역 입히기(i18n.js) + 영어판 모양 맞춤(i18n.css)
#     · 웹진 내용 글(SITE … CLEAN) 바로 뒤에 넣어요 → 화면을 그리기 전에 글을 바꿔 둘 수 있게
#     · 한국어를 고르면 아무것도 바뀌지 않아요
if True:
    import glob as _gl
    _dicts = ''.join(open(f, encoding='utf-8').read() for f in sorted(_gl.glob(sp + '/i18n_*.js')))
    _i18n = '<script>' + nl + N(_dicts + open(sp + '/i18n.js', encoding='utf-8').read()) + '</script>' + nl
    one('  big: "badang sorang"' + nl + '};' + nl + nl + '</script>' + nl, '  big: "badang sorang"' + nl + '};' + nl + nl + '</script>' + nl + _i18n)
    import base64 as _b64i
    _ff = lambda n: _b64i.b64encode(open(sp + '/fonts/' + n, 'rb').read()).decode()
    _ic = open(sp + '/i18n.css', encoding='utf-8').read()
    _ic = _ic.replace('__EN_TITLE__', _ff('HakgyoansimPuzzleTTF-Black.woff2')).replace('__EN_BODY__', _ff('HakgyoansimTTeokbokkiB.woff2'))   # 영어판 글씨체 (영어를 고를 때만 내려받아요)
    one('</head>', N(_ic) + '</head>')

# 27) 주황 글자 띠(물질 ✦ 숨비소리 ✦ 테왁 …)가 넓은 화면에서 양 끝이 잘리고 선이 어긋나던 것 바로잡기 — build/marquee.css
if True:
    one('</head>', N(open(sp + '/marquee.css', encoding='utf-8').read()) + '</head>')

# 28) 해녀마다 다른 파스텔 색으로 재생 버튼 · 영상 썸네일 테두리를 칠해요 (1 파랑 · 2 노랑 · 3 보라 · 4 주황) — build/card_colors.css
if True:
    one('</head>', N(open(sp + '/card_colors.css', encoding='utf-8').read()) + '</head>')

# 29) 응원 공용 저장소(Supabase)를 빌드할 때 넣기: BS_SUPABASE_URL=https://….supabase.co BS_SUPABASE_KEY=<anon 공개 키>
#     (비우면 clean_data.js 의 CLEAN.cheer.supabase 그대로)
if os.environ.get('BS_SUPABASE_URL') and os.environ.get('BS_SUPABASE_KEY'):
    _j = __import__('json')
    one('      url: "",', '      url: ' + _j.dumps(os.environ['BS_SUPABASE_URL']) + ',')
    one('      anonKey: ""', '      anonKey: ' + _j.dumps(os.environ['BS_SUPABASE_KEY']))

# 18) (배경 추가 시안) BS_SEABG=v2 이면 바다색 칸들(해녀 이야기 · 목적 · 바다 지키기 · 해녀의 바당길) 뒤에 실제 제주 바다 사진을 깔아요
#     사진은 첫 화면 영상의 포스터(드론으로 찍은 제주 바다)에서 해녀 · 테왁을 지운 한 장(media/sea-bg.webp, 약 70KB)이에요
#     화면에 고정된 한 장(.sea-bg)을 칸들이 반투명한 바다색으로 덮고 지나가요 (투명도는 아래 --sea-veil 로 조절)
if os.environ.get('BS_SEABG') == 'v2':
    one('<body class="is-gate">', '<body class="is-gate">' + nl + '  <div class="sea-bg" aria-hidden="true"></div>')
    import base64 as _b64s
    _sea = 'data:image/webp;base64,' + _b64s.b64encode(open(sp + '/sea-bg.webp', 'rb').read()).decode()
    bgcss = N('''<style id="seabg-style">
/* =========================================================
   ★ 실사 바다 배경 (시안) — 화면에 고정된 바다 사진 한 장 위로, 바다색 칸들이 반투명하게 지나가요
   --sea-veil: 칸 색의 진하기 (1 = 예전처럼 사진이 안 보임 · 0.6 = 사진이 꽤 비침). 지금은 0.74
   ========================================================= */
:root{--sea-veil:.74}
.sea-bg{position:fixed; inset:-2%; z-index:-1; pointer-events:none; background:var(--sea-photo, none) 50% 50%/cover no-repeat #2B807C;
  filter:saturate(.85) brightness(1.04); animation:seaDrift 40s ease-in-out infinite alternate}
.sea-bg{background-image:url(''' + _sea + ''')}
@keyframes seaDrift{from{transform:scale(1.03) translate3d(0,0,0)} to{transform:scale(1.08) translate3d(-1%,-1.2%,0)}}
@media (prefers-reduced-motion:reduce){ .sea-bg{animation:none; transform:scale(1.03)} }
.sea-bg canvas{position:absolute; inset:0; width:100%; height:100%; display:block}
.sea-bg.is-gl{animation:none; transform:none}   /* 물결 그림(WebGL)이 돌면 사진 대신 그 위에서 일렁여요 */
/* 바다색 칸: 같은 색 · 같은 흐름 그대로, 진하기만 반투명으로 (칸 사이 이음새 색도 같게 맞춰 띠가 생기지 않아요) */
html .stories{background:radial-gradient(120% 70% at 50% 0%, rgba(78,174,163,calc(var(--sea-veil) - .06)) 0%, rgba(47,139,133,var(--sea-veil)) 45%, rgba(36,111,108,calc(var(--sea-veil) + .1)) 100%)}
html .purpose.sx{background:
    radial-gradient(55% 45% at 30% 42%, rgba(141,224,208,.16) 0%, rgba(141,224,208,0) 70%),
    linear-gradient(180deg, rgba(36,111,108,calc(var(--sea-veil) + .1)) 0%, rgba(43,128,124,var(--sea-veil)) 38%, rgba(42,123,119,var(--sea-veil)) 70%, rgba(31,85,83,calc(var(--sea-veil) + .14)) 100%)}
html .oc{background:rgba(31,85,83,calc(var(--sea-veil) + .14))}
/* 상세 화면(인터뷰)도 바다 사진 위라서, 작은 머리글 · 제목을 흰 글씨로 또렷하게 */
.sp-top .kicker{color:#fff; text-shadow:0 1px 3px rgba(6,40,44,.55), 0 0 14px rgba(6,40,44,.35)}
.sp-top .kicker::before{background:#fff}
.sp-title{color:#fff; text-shadow:0 2px 4px rgba(6,40,44,.5), 0 0 22px rgba(6,40,44,.35)}
html .game{background:
    linear-gradient(180deg, rgba(31,85,83,calc(var(--sea-veil) + .14)) 0, rgba(31,85,83,0) 220px),
    radial-gradient(ellipse 90% 70% at 70% 10%, rgba(60,158,156,calc(var(--sea-veil) - .04)) 0%, rgba(38,115,122,var(--sea-veil)) 45%, rgba(31,95,99,calc(var(--sea-veil) + .1)) 100%)}
html .game__floor{opacity:.35}
</style>''')
    one('</style>' + nl + '<script>document.documentElement', '</style>' + nl + bgcss + nl + '<script>document.documentElement')
    # 물결 일렁임 (WebGL) — 웹진 맨 끝에
    one('</body>', N(open(sp + '/seabg.js', encoding='utf-8').read().strip()) + nl + '</body>')
    s = s.replace('<title>바당소랑 — 사라지는 해녀들을 만나다 (목적 버전2)</title>', '<title>바당소랑 — 사라지는 해녀들을 만나다 (배경 추가)</title>')

# 11) (비교용) 순서 바꾸기: BS_ORDER=purpose-first 이면 '목적' → '해녀 이야기(인터뷰)' 순서
import os
if os.environ.get('BS_ORDER') == 'purpose-first':
    a_ = s.index('    <!-- ===== 1-2. 목적')
    b_ = s.index('    <!-- ===== 2. 물질의 세계')
    block = s[a_:b_]
    s = s[:a_] + s[b_:]
    st_ = s.index('    <!-- ===== 1. 해녀 이야기')
    s = s[:st_] + block + s[st_:]
    one(N("""      <a href="#stories">해녀 이야기</a>
      <a href="#purpose">목적</a>
"""), N("""      <a href="#purpose">목적</a>
      <a href="#stories">해녀 이야기</a>
"""))
    one('<a class="hd__logo" href="#stories" aria-label="바당소랑 맨 위로">', '<a class="hd__logo" href="#purpose" aria-label="바당소랑 맨 위로">')
    one("  var SECTIONS = ['stories', 'purpose', 'badatgil', 'about', 'ending']", "  var SECTIONS = ['purpose', 'stories', 'badatgil', 'about', 'ending']")
    # 머리 메뉴는 인터뷰 칸이 끝날 때까지 늘 보여요 (원래처럼)
    one("    var storiesEnd = SECTIONS[0].offsetTop + SECTIONS[0].offsetHeight;",
        "    var stEl = document.getElementById('stories'), storiesEnd = stEl ? stEl.offsetTop + stEl.offsetHeight : 0;   // 목적 → 인터뷰 순서")
    one('<title>바당소랑 — 사라지는 해녀들을 만나다</title>', '<title>바당소랑 — 사라지는 해녀들을 만나다 (목적 먼저)</title>')
# 24) (사이트로 내보내기) 사진 · 영상 · 소리 · 글꼴을 HTML 안에 담지 않고, 결과 파일 옆 media/ · fonts/ 에 따로 두고 상대 경로로 불러와요
#     · 서버(한경닷컴 lxwebzine)는 저장소의 site/ 폴더만 올리고 첫 화면은 site/index.html → 결과를 site/index.html 로 내보내요
#     · 사진은 webp · 한 장 500KB 이하 (jpg · png 도 webp 로 바꿔요) · 2KB 이하의 아주 작은 그림은 그대로 둬요
#     · 탭 제목은 '바당소랑 — 사라지는 해녀들을 만나다'(BS_SITE_NAME 으로 바꿀 수 있어요) · 공유 미리보기(og · twitter) · canonical 을 넣어요 (og:image = site/og.jpg, make_cards.py 가 만들어요)
#     · BS_SPLIT=0 이면 예전처럼 한 파일에 모두 담아요
if os.environ.get('BS_SPLIT', '1') != '0':
    import hashlib as _hl, io as _io
    from PIL import Image as _Img
    _site = os.path.dirname(os.path.abspath(out))
    _md, _fd = os.path.join(_site, 'media'), os.path.join(_site, 'fonts')
    # 지난 빌드가 만든 파일은 지우고 다시 만들어요 (웹진메인 카드 사진 card-* 는 make_cards.py 가 만들어서 남겨 둬요)
    for _d in (_md, _fd):
        os.makedirs(_d, exist_ok=True)
        for _f in os.listdir(_d):
            if not _f.startswith('card-'): os.remove(os.path.join(_d, _f))
    _made = {}
    def _slug(ctx):
        for _p in (r'([A-Za-z_]\w*)(?:\[(\d+)\])?(?:\.([A-Za-z_]\w*))?\s*=\s*"$', r'"([\w-]+)":\s*\{"src":\s*"$', r'"([\w-]+)":\s*"$',
                   r"--([\w-]+):url\('?$", r"font-family:'([^']+)';(?:\s*font-weight:(\d+);)?[^{}]*src:url\($", r'class="([\w-]+)"[^<>]*src="$'):
            _m = re.search(_p, ctx)
            if _m: return '-'.join(g for g in _m.groups() if g)
        return 'asset'
    def _save(mime, raw, ctx):
        key = _hl.sha1(raw).hexdigest()[:8]
        if key in _made: return _made[key]
        slug = re.sub(r'[^a-z0-9-]+', '-', _slug(ctx).lower().replace('media-', '').replace('window-', '')).strip('-')[:40] or 'asset'
        if 'font' in mime:
            d, rel, data = _fd, 'fonts', raw
            ext = {'font/woff2': 'woff2', 'font/woff': 'woff', 'font/ttf': 'ttf', 'font/otf': 'otf'}.get(mime, 'woff2')
        elif mime.startswith('image/') and mime != 'image/svg+xml':
            d, rel, ext = _md, 'media', 'webp'
            if mime == 'image/webp' and len(raw) <= 500 * 1024: data = raw
            else:
                im = _Img.open(_io.BytesIO(raw)); im = im.convert('RGBA' if ('A' in im.mode or im.mode == 'P') else 'RGB')
                q = 88
                while True:
                    _b = _io.BytesIO(); im.save(_b, 'WEBP', quality=q, method=6); data = _b.getvalue()
                    if len(data) <= 500 * 1024 or q <= 56: break
                    q -= 8
                while len(data) > 500 * 1024:          # 그래도 크면 조금씩 줄여요
                    im = im.resize((int(im.width * .85), int(im.height * .85)), _Img.LANCZOS)
                    _b = _io.BytesIO(); im.save(_b, 'WEBP', quality=q, method=6); data = _b.getvalue()
        elif mime == 'image/svg+xml': d, rel, ext, data = _md, 'media', 'svg', raw
        else:
            d, rel, data = _md, 'media', raw
            ext = {'video/mp4': 'mp4', 'audio/mp4': 'm4a', 'audio/mpeg': 'mp3', 'audio/ogg': 'ogg', 'video/webm': 'webm'}.get(mime, mime.split('/')[-1])
        name = '%s-%s.%s' % (slug, key, ext)
        open(os.path.join(d, name), 'wb').write(data)
        _made[key] = rel + '/' + name
        return _made[key]
    # (1) 첫 화면 배경 영상: 글자(base64)로 담아 두고 화면에서 풀어 쓰던 것을 파일로
    _vm = re.search(r'\(function \(\) \{ var s = "([A-Za-z0-9+/=]{1000,})";\s*try \{ var bin = atob\(s\).*?\}\)\(\);', s, re.S)
    if _vm:
        _vp = _save('video/mp4', base64.b64decode(_vm.group(1)), 'MEDIA.introVideo = "')
        s = s[:_vm.start()] + 'MEDIA.introVideo = "' + _vp + '";   /* 첫 화면 배경 영상 (site/media 에 파일로 따로 둬요) */' + s[_vm.end():]
    # (2) data:…;base64,… 로 담긴 사진 · 소리 · 글꼴
    _src = s
    def _rep(m):
        if len(m.group(2)) < 2800: return m.group(0)
        return _save(m.group(1), base64.b64decode(m.group(2)), _src[max(0, m.start() - 120):m.start()])
    s = re.sub(r'data:([\w/+.-]+);base64,([A-Za-z0-9+/=]+)', _rep, _src)
    # (3) 제목 · 공유 미리보기
    _SITE = 'https://lxwebzine.hankyung.com/2026-1/team6/'
    _t = os.environ.get('BS_SITE_NAME', '바당소랑 — 사라지는 해녀들을 만나다')   # 브라우저 탭 · 공유 미리보기 제목 (2026-10-26 점검: 작업용 이름 '바당소랑_웹진_1' 대신 실제 제목)
    s = re.sub(r'<title>.*?</title>', lambda m: '<title>' + _t + '</title>', s, count=1)
    _dm = re.search(r'<meta name="description" content="([^"]*)">', s)
    _de = _dm.group(1)
    _meta = nl.join([
        '<link rel="canonical" href="%s">' % _SITE,
        '<meta property="og:type" content="website">',
        '<meta property="og:site_name" content="바당소랑">',
        '<meta property="og:title" content="%s">' % _t,
        '<meta property="og:description" content="%s">' % _de,
        '<meta property="og:url" content="%s">' % _SITE,
        '<meta property="og:image" content="%sog.jpg">' % _SITE,
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        '<meta property="og:locale" content="ko_KR">',
        '<meta name="twitter:card" content="summary_large_image">',
        '<meta name="twitter:title" content="%s">' % _t,
        '<meta name="twitter:description" content="%s">' % _de,
        '<meta name="twitter:image" content="%sog.jpg">' % _SITE])
    s = s[:_dm.end()] + nl + _meta + s[_dm.end():]

# 31) 배경 밝기 — 기본은 두 단계 밝게(bg2, 2026-10-23 사용자가 고름) · BS_BRIGHT=bg1 → 한 단계 · BS_BRIGHT=off → 예전 어두운 배경
#     · 바꾸는 것: 바다색 칸 뒤 바다 사진의 밝기 · 그 위 청록 막(색은 더 밝게, 진하기는 조금 옅게) · 첫 화면 영상과 그 위 어두운 막
#     · 그대로: 글씨 · 그림 · 카드 · 크림색 칸 / 칸과 칸이 만나는 색은 같은 비율로 바꿔서 이음새에 띠가 안 생겨요
#     · 배경이 밝아진 만큼 청록 칸의 흰 글씨에는 아주 옅은 그림자를 넣어 또렷하게
if os.environ.get('BS_BRIGHT', 'bg2') in ('bg1', 'bg2'):
    _bk = os.environ.get('BS_BRIGHT', 'bg2')
    _f, _veil, _photo, _shade, _video = {'bg1': (.12, .68, 1.16, .80, 1.06), 'bg2': (.22, .62, 1.28, .65, 1.12)}[_bk]
    def _c(rgb, alpha): return 'rgba(%d,%d,%d,%s)' % (tuple(round(c + (255 - c) * _f) for c in rgb) + (alpha,))
    V = 'var(--sea-veil)'
    def _a(x): return '%.2f' % (x * _shade)
    _bc = N("""<style id="bright-style">
/* ★ 배경 밝기 (BS_BRIGHT=%s) — 바다 사진 · 청록 막 · 첫 화면 막을 밝게 */
:root{--sea-veil:%s}
.sea-bg{filter:saturate(.9) brightness(%s)}
.gate__video{filter:brightness(%s)}
.gate__shade{background:
    radial-gradient(120%% 90%% at 78%% 40%%, rgba(30,82,79,%s) 0%%, rgba(30,82,79,%s) 100%%),
    linear-gradient(180deg, rgba(30,82,79,%s) 0%%, rgba(30,82,79,%s) 40%%, rgba(30,82,79,%s) 100%%)}
.gate.is-viz .gate__shade{background:
    radial-gradient(120%% 90%% at 78%% 40%%, rgba(30,82,79,%s) 0%%, rgba(30,82,79,%s) 100%%),
    linear-gradient(180deg, rgba(30,82,79,%s) 0%%, rgba(30,82,79,%s) 40%%, rgba(30,82,79,%s) 100%%)}
html .stories{background:radial-gradient(120%% 70%% at 50%% 0%%, %s 0%%, %s 45%%, %s 100%%)}
html .purpose.sx{background:
    radial-gradient(55%% 45%% at 30%% 42%%, rgba(141,224,208,.16) 0%%, rgba(141,224,208,0) 70%%),
    linear-gradient(180deg, %s 0%%, %s 38%%, %s 70%%, %s 100%%)}
html .oc{background:%s}
html .game{background:
    linear-gradient(180deg, %s 0, %s 220px),
    radial-gradient(ellipse 90%% 70%% at 70%% 10%%, %s 0%%, %s 45%%, %s 100%%)}
/* 밝아진 배경 위 흰 글씨를 또렷하게 (아주 옅은 그림자) */
:is(.stories, .purpose.sx, .game, .gate) :is(p, span, small, h1, h2, h3, b, em, a, li, time){text-shadow:0 1px 2px rgba(10,48,52,.38), 0 0 12px rgba(10,48,52,.18)}
:is(.st-card, .sx-pop, .sx-obj, .grank, .pix-btn, .btn, .game__shot, .gate__start, .btn-start) :is(p, span, small, h1, h2, h3, b, em, a, li, time){text-shadow:none}
/* 작은 흰 글씨(안내 · 본문)는 그림자를 조금 더 진하게 */
html body :is(.stories__hint, .stories__hint span, .st-quote, #sxPurposeBody p, .sx-pp__label, .game__lead, .game__note, .gate__note, .gate__care, .gate__src, .sea__cap, .sea__cap span){text-shadow:0 1px 2px rgba(8,40,44,.6), 0 0 10px rgba(8,40,44,.35)}
</style>
""" % (_bk, _veil, _photo, _video,
       _a(.12), _a(.45), _a(.25), _a(.08), _a(.55),
       _a(.34), _a(.62), _a(.36), _a(.2), _a(.7),
       _c((78, 174, 163), 'calc(%s - .06)' % V), _c((47, 139, 133), V), _c((36, 111, 108), 'calc(%s + .1)' % V),
       _c((36, 111, 108), 'calc(%s + .1)' % V), _c((43, 128, 124), V), _c((42, 123, 119), V), _c((31, 85, 83), 'calc(%s + .14)' % V),
       _c((31, 85, 83), 'calc(%s + .14)' % V),
       _c((31, 85, 83), 'calc(%s + .14)' % V), _c((31, 85, 83), '0'),
       _c((60, 158, 156), 'calc(%s - .04)' % V), _c((38, 115, 122), V), _c((31, 95, 99), 'calc(%s + .1)' % V)))
    one('</head>', _bc + '</head>')

# 30) Google Tag Manager — <head> 맨 위(글자 설정 바로 다음)와 <body> 바로 뒤에 넣어요 (구글이 안내한 코드 그대로)
#     · 컨테이너 ID 는 BS_GTM_ID 로 바꿀 수 있어요 (BS_GTM_ID=off 이면 넣지 않아요)
_gtm = os.environ.get('BS_GTM_ID', 'GTM-M2LF732B')
if _gtm and _gtm != 'off':
    assert re.fullmatch(r'GTM-[A-Z0-9]+', _gtm), _gtm
    _gh = N("""<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','""" + _gtm + """');</script>
<!-- End Google Tag Manager -->
""")
    _gb = N("""<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=""" + _gtm + """"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
""")
    _m = re.search(r'<head>\r?\n<meta charset="utf-8">\r?\n', s)
    assert _m, 'head'
    s = s[:_m.end()] + _gh + s[_m.end():]
    _m = re.search(r'(?m)^<body[^>]*>\r?\n', s)
    assert _m, 'body'
    s = s[:_m.end()] + _gb + s[_m.end():]

# 32) 언어별 주소 — 사이트로 내보낼 때(BS_SPLIT 기본) 한국어는 site/index.html, 영어는 site/en/index.html, 일본어는 site/ja/index.html
#     · 세 페이지는 내용이 같고, 페이지마다 언어가 정해져 있어요 (window.BS_PAGE_LANG) → 언어 줄을 누르면 그 언어 주소로 이동해요 (보던 칸 · 상세 화면 그대로)
#     · 탭 제목 · 설명 · 공유 미리보기(og · twitter)는 페이지마다 그 언어로 (검색 · 카톡 미리보기는 글을 바꾸는 코드를 돌리지 않아서 HTML 에 미리 적어 둬요)
#     · 서로의 언어판을 검색엔진에 알려 줘요 (hreflang) · 사진 · 영상 · 글꼴은 site/media · site/fonts 를 같이 써요 (../media/…)
#     · 한 파일 판(BS_SPLIT=0)은 예전처럼 언어를 브라우저에 기억해서 바꿔요
_pages = {}
if os.environ.get('BS_SPLIT', '1') != '0':
    import json as _js
    _LANGS = (('ko', 'ko_KR', ''), ('en', 'en_US', 'en/'), ('ja', 'ja_JP', 'ja/'))
    _alt = nl.join(['<link rel="alternate" hreflang="%s" href="%s%s">' % (c, _SITE, sub) for c, _, sub in _LANGS] +
                   ['<link rel="alternate" hreflang="x-default" href="%s">' % _SITE])
    def _word(code, ko):                                        # 번역 사전(build/i18n_<언어>.js)에서 한 줄 찾기
        _d = open(sp + '/i18n_%s.js' % code, encoding='utf-8').read()
        _m = re.search(re.escape(_js.dumps(ko, ensure_ascii=False)) + r'\s*:\s*("(?:[^"\\]|\\.)*")', _d)
        assert _m, (code, ko); return _js.loads(_m.group(1))
    def _esc(t): return t.replace('&', '&amp;').replace('"', '&quot;').replace('<', '&lt;')
    _koT = re.search(r'<title>(.*?)</title>', s).group(1); _koD = re.search(r'<meta name="description" content="([^"]*)">', s).group(1)
    for _c, _loc, _sub in _LANGS:
        _p = s
        _home = './' if not _sub else '../'
        _m = re.search(r'<meta charset="utf-8">\r?\n(?:<!-- Google Tag Manager -->.*?<!-- End Google Tag Manager -->\r?\n)?', _p, re.S)
        _p = _p[:_m.end()] + ("<script>window.BS_PAGE_LANG='%s';window.BS_LANG_HOME='%s';</script>" % (_c, _home)) + nl + _p[_m.end():]
        _p = _p.replace('<link rel="canonical" href="%s">' % _SITE, '<link rel="canonical" href="%s%s">' % (_SITE, _sub) + nl + _alt, 1)
        if _c != 'ko':
            _T, _D = _esc(_word(_c, _koT)), _esc(_word(_c, _koD))
            _p = re.sub(r'<html lang="ko">', '<html lang="%s">' % _c, _p, count=1)
            _p = _p.replace('<title>%s</title>' % _koT, '<title>%s</title>' % _T, 1)
            _p = _p.replace('<meta property="og:title" content="%s">' % _koT, '<meta property="og:title" content="%s">' % _T, 1)
            _p = _p.replace('<meta property="og:site_name" content="바당소랑">', '<meta property="og:site_name" content="%s">' % _esc(_word(_c, '바당소랑')), 1)
            _p = _p.replace('<meta name="twitter:title" content="%s">' % _koT, '<meta name="twitter:title" content="%s">' % _T, 1)
            for _k in ('<meta name="description" content="%s">', '<meta property="og:description" content="%s">', '<meta name="twitter:description" content="%s">'):
                _p = _p.replace(_k % _koD, _k % _D, 1)
            _p = _p.replace('<meta property="og:url" content="%s">' % _SITE, '<meta property="og:url" content="%s%s">' % (_SITE, _sub), 1)
            _p = _p.replace('<meta property="og:locale" content="ko_KR">', '<meta property="og:locale" content="%s">' % _loc, 1)
            _p = re.sub(r'(?<=["\'(])(media|fonts)/', r'../\1/', _p)   # 한 폴더 안쪽이라 그림 · 글꼴은 ../ 에서
            _p = _p.replace('  url: "game/",', '  url: "../game/",', 1)  # 게임 하러 가기 — 웹진 안 게임(../game/)
        # 구조화 데이터(JSON-LD) · 글자로 읽히는 웹진 소개 — 검색 · AI 검색은 화면을 그리는 코드를 돌리지 않고 HTML 글자를 읽어요
        #  (소개 글은 웹진에 실제로 있는 문장 그대로 · 화면에는 보이지 않는 noscript 안 · 번역은 각 언어 사전)
        _w = (lambda t: t) if _c == 'ko' else (lambda t: _word(_c, t))
        _sp = '' if _c == 'ja' else ' '                           # 줄바꿈 자리: 일본어는 붙여 쓰고, 한국어 · 영어는 한 칸
        _x = lambda t: _esc(_w(t)).replace(chr(10), _sp)
        _brand = _w('바당소랑')
        _ld = {'@context': 'https://schema.org', '@type': 'Article', 'headline': _w(_koT), 'description': _w(_koD), 'inLanguage': _c,
               'url': _SITE + _sub, 'image': _SITE + 'og.jpg', 'datePublished': '2026-10-22', 'dateModified': __import__('datetime').date.today().isoformat(),
               'author': {'@type': 'Organization', 'name': _brand}, 'publisher': {'@type': 'Organization', 'name': _brand}}
        _ldt = '<script type="application/ld+json">' + _js.dumps(_ld, ensure_ascii=False).replace('</', '<\\/') + '</script>'
        _p = _p.replace('<link rel="canonical" href="%s%s">' % (_SITE, _sub), _ldt + nl + '<link rel="canonical" href="%s%s">' % (_SITE, _sub), 1)
        _stat = _w('{y}년, {v}명. {y0}년보다 {p}% 줄었습니다.').replace('{y0}', '1970').replace('{y}', '2025').replace('{v}', '2,371').replace('{p}', '83')
        _names_ul = '<ul>%s</ul>' % ''.join('<li>%s</li>' % _x(n) for n in ('김은영 해녀', '조은별 해녀', '카일리 해녀', '전 해녀 학교 강사 최명수 & 박신혜 해녀'))
        _P = lambda *ts: '<p>%s</p>' % _sp.join(_x(t) for t in ts)
        _L = lambda *ts: '<ul>%s</ul>' % ''.join('<li>%s</li>' % _x(t) for t in ts)
        _D = lambda *pairs: '<ul>%s</ul>' % ''.join('<li><b>%s</b> — %s %s</li>' % (_x(a), _x(b), _x(c)) for a, b, c in pairs)
        _about = nl.join(['<noscript><article class="seo-summary" lang="%s">' % _c,
            _P('바다와 함께 살아온 사람들,\n우리가 미처 몰랐던 해녀의 이야기') + '<p>%s</p>' % _esc(_stat),
            '<h2>%s</h2>' % _x('해녀 이야기') + '<h3>%s</h3>' % _x('바다에서 만난 사람들') + _names_ul,
            _P('이야기는\n계속 기록 중이에요', '해녀가 되어 바닷속 길을 건너는\n미니 게임으로 이어져요.'),
            '<h2>%s</h2>' % _x('유네스코\n인류무형문화유산'),
            _P('바다 쓰레기를 건져 올리고 바다숲을 가꾸던 손길, 세대를 이어온 배려와 연대의 공동체.', '해녀가 사라진다는 것은 바다의 가장 오랜 돌봄이 사라진다는 뜻입니다.',
               '바당소랑은 사라져가는 해녀 문화를 이어, 그들이 일궈온 방식으로 바다를 지키고 푸르게 가꿔갑니다.'),
            '<h2>%s</h2>' % _x('해녀가 다녀가면,\n바다가 달라져요'),
            _P('해녀는 바다를 캐기만 하지 않아요.', '바위를 닦고, 바다를 쉬게 하고, 쓰레기를 건져 올려요.'),
            _D(('갯닦기', '바다숲이 자랄 자리를 만들어요', '잡조류를 긁어낸 바위에 미역 포자가 붙어 자라요.'),
               ('금채', '바다에 회복할 시간을 줘요', '캐지 않는 시기를 정해 해조류와 어패류가 자랄 시간을 지켜요.'),
               ('바다 쓰레기 수거', '덜 갇히는 바다를 만들어요', '폐그물·플라스틱을 건져 올리고, 그물에 걸린 생물을 풀어 줘요.')),
            '<h2>%s</h2>' % _x('해녀의\n바당길'),
            _P('바닷속, 한 걸음씩', '해녀가 되어 바닷속을 탐험하고, 해양 생물과 함께 나만의 기록을 만들어 보세요.'),
            '<h3>%s</h3>' % _x('조작 방법') + _L('앞으로 한 칸 전진', '밀어서 방향 이동', '게임 종료 — 화면 아래로 밀리지 않게', '해류 경고'),
            '<h2>%s%s%s</h2>' % (_x('바당은 바다,'), _sp, _x('소랑은 사랑.')),
            _P('제주 바다와, 그 바다를 살아온 해녀를 아끼는 마음으로 이 웹진을 만듭니다.'),
            '<h3>%s</h3>' % _x('같이 잇다,\n가치를 잇다'),
            _P('우리가 만난 해녀들은 줄어드는 숫자가 아니라,\n지금도 밝게 바다에 드는 사람들이었습니다.', '다른 일과 함께하면서도 바다를 놓지 않는 마음,\n그 마음을 더 많은 사람과 같이 잇습니다.',
               '바다를 돌보던 손길과 서로를 지키던 마음,\n그 가치를 다음 세대로 잇습니다.'),
            _P('바다는 여전히 그 자리에,\n그 바다를 살아온 사람들의 이야기를 기억합니다.'),
            '</article></noscript>']) + nl
        _h1 = '<h1 class="gate__title" id="gateTitle"></h1>'
        assert _p.count(_h1) == 1
        _p = _p.replace(_h1, '<h1 class="gate__title" id="gateTitle">%s</h1>' % ''.join('<span class="ln"><span>%s</span></span>' % _esc(l) for l in _w('사라지는 해녀들을\n만나다').split(chr(10))), 1)
        _gm = '<!-- End Google Tag Manager (noscript) -->' + nl
        assert _p.count(_gm) == 1
        _p = _p.replace(_gm, _gm + _about, 1)
        _pages[_sub] = _p
    s = _pages['']

os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
open(out, 'w', encoding='utf-8', newline='').write(s)
for _sub, _p in _pages.items():                                # 32) 영어 · 일본어 페이지
    if not _sub: continue
    _o = os.path.join(os.path.dirname(os.path.abspath(out)), _sub, 'index.html')
    os.makedirs(os.path.dirname(_o), exist_ok=True)
    open(_o, 'w', encoding='utf-8', newline='').write(_p)
print('ok', len(s))
