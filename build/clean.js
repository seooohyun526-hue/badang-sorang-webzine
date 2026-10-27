  /* =========================================================
     2-1) 해녀들의 해양정화 이야기 — grail-app.com Chapter 3 처럼, 한 장의 큰 종이가 '목적' 칸 아래에서 곧바로 올라와요 (내용은 CLEAN)
     · 종이 안: 큰 제목 → 01 바다를 돌보는 해녀(가운데 소개) → 세 가지 일 카드(BEFORE / AFTER 비교 손잡이) → 마무리 문장 → 후원 · 박물관 버튼
     · 고정(pin) 구간 없이 평소 스크롤 그대로. 들어올 때 기울고 작았다가 반듯해지고, 끝까지 읽으면 반대로 기울며 떠나요
     · 움직임 줄이기 설정: 기울기 · 등장 효과 없이 그대로 보여요
     ========================================================= */
  var Ocean = (function () {
    var sec = $('#ocean');
    if (!sec || typeof CLEAN === 'undefined') return {};
    var C = CLEAN;
    var br = function (s) { return String(s || '').split('\n').map(esc).join('<br>'); };
    $('.oc__kicker', sec).textContent = C.kicker || '';
    $('.oc__side', sec).textContent = C.nav || '';
    $('#ocTitle').textContent = C.srTitle || C.nav || '';                        // 큰 제목은 빼고(사용자 요청), 화면 읽기 프로그램용 이름만

    // ── 그림: 같은 바다의 BEFORE / AFTER (이해를 돕기 위한 일러스트) ──
    var uid = 0;
    function fish(x, y, s, c, flip) {
      return '<g transform="translate(' + x + ' ' + y + ') scale(' + (flip ? -s : s) + ' ' + s + ')"><path d="M0 0q14-10 28 0q-14 10-28 0zM27 0l10-7v14z" fill="' + c + '"/><circle cx="7" cy="-1.5" r="1.6" fill="#24403E"/></g>';
    }
    function star(x, y, r) { return '<path d="M' + x + ' ' + (y - r) + 'Q' + x + ' ' + y + ' ' + (x + r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + r) + 'Q' + x + ' ' + y + ' ' + (x - r) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - r) + 'z" fill="#fff"/>'; }
    function blade(x, y, h, w, lean, c) {   // 미역 · 해조류 잎 (밑에서 위로 물결치며 자라요)
      return '<path d="M' + x + ' ' + y + 'C' + (x - w) + ' ' + (y - h * .35) + ' ' + (x + w + lean * .5) + ' ' + (y - h * .6) + ' ' + (x + lean) + ' ' + (y - h) +
        'C' + (x + lean + w * 1.2) + ' ' + (y - h * .62) + ' ' + (x + w * 1.4) + ' ' + (y - h * .32) + ' ' + (x + w * .5) + ' ' + y + 'z" fill="' + c + '"/>';
    }
    // 털실 인형 스타일 장면 그림(CLEAN_ART · media/ocean/)이 있으면 그 그림을, 없으면 아래 간단한 그림을 써요
    function scene(kind, after) {
      var key = kind + '-' + (after ? 'after' : 'before'), art = (typeof CLEAN_ART !== 'undefined') && CLEAN_ART[key];
      if (art) return '<img src="' + esc(art) + '" alt="' + esc((C.alts || {})[key] || '') + '" decoding="async" loading="lazy" draggable="false">';
      return flat(kind, after);
    }
    function flat(kind, after) {
      var id = 'ocs' + (++uid), clear = !!after, s = '';
      s += '<defs><linearGradient id="' + id + 'w" x1="0" y1="0" x2="0" y2="1">' +
        (clear ? '<stop offset="0" stop-color="#E7F5F1"/><stop offset=".22" stop-color="#B5E0D6"/><stop offset="1" stop-color="#78C0B2"/>'
               : '<stop offset="0" stop-color="#E2E7E2"/><stop offset=".22" stop-color="#B9C6BF"/><stop offset="1" stop-color="#8FA59C"/>') +
        '</linearGradient><pattern id="' + id + 'n" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><path d="M0 0H16M0 0V16" stroke="#3F4C46" stroke-width="1.8"/></pattern></defs>';
      s += '<rect width="400" height="240" fill="url(#' + id + 'w)"/>';
      s += '<path d="M0 24Q25 19 50 24T100 24T150 24T200 24T250 24T300 24T350 24T400 24" fill="none" stroke="#fff" stroke-opacity=".85" stroke-width="2"/>';
      s += '<g fill="#fff" opacity="' + (clear ? .22 : .1) + '"><path d="M70 24L40 240H100Z"/><path d="M230 24L210 240H270Z"/><path d="M350 24L340 240H385Z"/></g>';
      s += '<path d="M0 206Q60 196 120 204T240 202T400 200V240H0Z" fill="#E8D6B0"/><path d="M0 222Q90 214 180 222T400 218V240H0Z" fill="#DCC79E"/>';
      if (kind === 'gaet') {
        var rock = 'M40 214Q48 152 140 144Q232 140 250 214Z';
        if (!clear) {
          s += '<path d="' + rock + '" fill="#6E695D"/><path d="M58 196Q70 160 140 154Q214 150 236 198Q160 176 58 196Z" fill="#5C6B46" opacity=".75"/>';
          for (var k = 0; k < 22; k++) { var x = 66 + k * 8 + (k % 3) * 2, y = 172 - Math.sin(k / 21 * Math.PI) * 18 + (k % 2) * 3, a = (k % 5 - 2) * 9;
            s += '<path d="M' + x + ' ' + (y + 14) + 'q' + (a / 3) + ' -10 ' + a / 2 + ' -' + (16 + (k % 4) * 4) + '" stroke="' + (k % 2 ? '#7E9C3E' : '#5F7F2E') + '" stroke-width="2.4" fill="none" stroke-linecap="round"/>'; }
        } else {
          s += '<path d="' + rock + '" fill="#A39D90"/><path d="M70 186Q100 160 150 156" stroke="#C4BEB2" stroke-width="4" fill="none" stroke-linecap="round"/>';
          s += blade(118, 156, 46, 8, 6, '#8A782C') + blade(168, 148, 54, 9, -8, '#9A8632') + blade(212, 166, 40, 7, 10, '#8A782C');
          s += star(300, 70, 7) + star(330, 120, 5) + star(90, 90, 5);
        }
      } else if (kind === 'rest') {
        var rk = 'M70 214Q86 170 180 166Q270 166 296 214Z';
        s += '<path d="' + rk + '" fill="' + (clear ? '#8E887C' : '#77736A') + '"/>';
        if (!clear) {
          s += '<rect x="140" y="156" width="5" height="12" rx="2" fill="#8C7A2C"/><rect x="196" y="154" width="5" height="14" rx="2" fill="#8C7A2C"/><rect x="236" y="160" width="4" height="9" rx="2" fill="#8C7A2C"/>';
        } else {
          s += blade(130, 172, 120, 16, -14, '#8F7A2C') + blade(170, 168, 150, 18, 10, '#A08A33') + blade(210, 170, 128, 16, -6, '#8F7A2C') + blade(246, 176, 98, 14, 16, '#A08A33');
          s += '<g fill="#C98A5A" stroke="#9E6A40" stroke-width="1"><path d="M318 222l12-22 12 22z"/><path d="M60 224l10-18 10 18z"/><path d="M350 226l9-16 9 16z"/></g>';
          s += star(80, 70, 6);
        }
      } else if (kind === 'net') {
        if (!clear) {
          s += '<path d="M8 60C60 40 180 52 240 70C262 120 246 190 214 214C150 222 70 214 20 200C2 160 0 100 8 60Z" fill="url(#' + id + 'n)" opacity=".85"/>';
          s += fish(120, 136, 1.3, '#F08A3C') + fish(166, 110, 1.05, '#F5A53C', true);
          s += '<path d="M8 60C60 40 180 52 240 70C262 120 246 190 214 214C150 222 70 214 20 200C2 160 0 100 8 60Z" fill="url(#' + id + 'n)" opacity=".55"/>';
          s += '<path d="M8 60C60 40 180 52 240 70C262 120 246 190 214 214" fill="none" stroke="#3F4C46" stroke-width="3" stroke-linecap="round"/>';
        } else {
          s += '<line x1="262" y1="38" x2="262" y2="62" stroke="#F3EBDD" stroke-width="2"/>';
          s += '<ellipse cx="262" cy="24" rx="20" ry="15" fill="#E97842"/><path d="M242 24Q262 34 282 24M262 9Q254 24 262 39" stroke="#FBF6EC" stroke-width="2.4" fill="none"/>';
          s += '<path d="M244 62H280L274 122Q262 130 250 122Z" fill="url(#' + id + 'n)" opacity=".85" stroke="#3F4C46" stroke-width="2"/>';
          s += '<g transform="translate(262 94) rotate(-18)"><rect x="-7" y="-16" width="14" height="30" rx="5" fill="#D3EBF2" stroke="#7FA9B5" stroke-width="1.5"/><rect x="-4" y="-21" width="8" height="6" rx="1" fill="#7FA9B5"/></g>';
          s += fish(330, 110, 1.05, '#F5B73C', true) + fish(110, 150, 1.25, '#F08A3C');
          s += blade(300, 214, 46, 7, -6, '#5FA45A') + blade(324, 214, 60, 8, 8, '#4E9450') + blade(80, 212, 38, 6, 6, '#5FA45A');
          s += star(180, 60, 6);
        }
      }
      return '<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + s + '</svg>';
    }
    var arrows = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 7l-5 5 5 5M15 7l5 5-5 5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    // ── 종이 안 내용 ──
    var I = C.intro || {}, html = '';
    html += '<section class="oc-intro oc-rv" aria-labelledby="ocIntroT">' +
      '<h3 class="oc-intro__title oc-r" style="--at:.04" id="ocIntroT">' + br(I.title) + '</h3>' +
      '<p class="oc-intro__body oc-r" style="--at:.1"><b>' + esc(I.lead) + '</b><em>' + esc(I.em) + '</em></p>' +
      (I.hint ? '<p class="oc-hint oc-r" style="--at:.14">' + arrows + esc(I.hint) + '</p>' : '') + '</section>';
    html += '<div class="oc-cards">' + (C.cards || []).map(function (c, i) {
      return '<article class="oc-card oc-rv" aria-labelledby="ocCard' + i + '">' +
        '<div class="oc-cmp oc-r" style="--at:0;--p:50%">' +
          '<div class="oc-cmp__img">' + scene(c.art, false) + '</div>' +
          '<div class="oc-cmp__img oc-cmp__after">' + scene(c.art, true) + '</div>' +
          '<span class="oc-cmp__tag">' + esc(C.before || 'BEFORE') + '</span><span class="oc-cmp__tag oc-cmp__tag--after">' + esc(C.after || 'AFTER') + '</span>' +
          '<span class="oc-cmp__line" aria-hidden="true"></span>' +
          '<button type="button" class="oc-cmp__knob" role="slider" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50" aria-valuetext="반반" aria-label="' + esc(c.label + ' 전후 비교 — 왼쪽은 BEFORE, 오른쪽은 AFTER') + '">' + arrows + '</button>' +
        '</div>' +
        '<div class="oc-card__body oc-r" style="--at:.1">' +
          '<p class="oc-card__label"><b>' + esc(c.no) + '</b>' + esc(c.label) + '</p>' +
          '<h4 class="oc-card__title" id="ocCard' + i + '">' + esc(c.title) + '</h4>' +
          '<p class="oc-card__text">' + esc(c.text) + '</p>' +
        '</div></article>';
    }).join('') + '</div>';
    var CL = C.closing || {};
    html += '<div class="oc-closing oc-rv"><p class="oc-closing__line oc-r" style="--at:0">' + esc(CL.line1) + '<br><em>' + esc(CL.em) + '</em>' + esc(CL.rest) + '</p></div>';
    // 후원 · 박물관 버튼: 누르면 그 페이지가 새 탭으로 열려요 (주소가 없는 버튼은 숨겨요)
    var A = C.cta || {}, S = A.support || {}, M = A.museum || {};
    var link = function (o, cls) { return has(o.url) ? '<a class="oc-cta__btn' + cls + '" href="' + esc(o.url) + '" target="_blank" rel="noopener">' + esc(o.button) + '<span class="sr-only"> (새 탭에서 열려요)</span></a>' : ''; };
    html += '<div class="oc-cta oc-rv"><div class="oc-cta__row oc-r" style="--at:0">' + link(S, '') + link(M, ' oc-cta__btn--line') + '</div></div>';
    $('.oc-paper__rows', sec).innerHTML = html;

    // ── BEFORE / AFTER 손잡이: 끌기(마우스 · 손가락) · 키보드 ← → ──
    $$('.oc-cmp', sec).forEach(function (box) {
      var knob = $('.oc-cmp__knob', box), drag = false;
      function set(p) {
        p = Math.max(3, Math.min(97, p));
        box.style.setProperty('--p', p + '%');
        knob.setAttribute('aria-valuenow', String(Math.round(p)));
        knob.setAttribute('aria-valuetext', p < 35 ? 'AFTER 가 더 많이 보여요' : p > 65 ? 'BEFORE 가 더 많이 보여요' : '반반');
      }
      function at(e) { var r = box.getBoundingClientRect(); set((e.clientX - r.left) / r.width * 100); }
      box.addEventListener('pointerdown', function (e) {
        if (e.button && e.button !== 0) return;
        drag = true; box.classList.add('is-drag'); try { box.setPointerCapture(e.pointerId); } catch (x) {} at(e);
        if (e.pointerType === 'mouse') e.preventDefault();
      });
      box.addEventListener('pointermove', function (e) { if (drag) at(e); });
      var stop = function () { drag = false; box.classList.remove('is-drag'); };
      box.addEventListener('pointerup', stop); box.addEventListener('pointercancel', stop); box.addEventListener('lostpointercapture', stop);
      knob.addEventListener('keydown', function (e) {
        var p = parseFloat(box.style.getPropertyValue('--p')) || 50;
        if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(p - 5); }
        else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(p + 5); }
        else if (e.key === 'Home') { e.preventDefault(); set(3); }
        else if (e.key === 'End') { e.preventDefault(); set(97); }
      });
    });

    // ── 움직임 (grail-app.com Chapter 3 과 같은 방식) ──
    var paper = $('.oc-paper', sec), revs = $$('.oc-paper__top, .oc-rv', sec);
    var clamp01 = function (x) { return x < 0 ? 0 : x > 1 ? 1 : x; };
    var mqs = matchMedia('(max-width:760px)');
    var raf = 0, inView = false;
    function paint() {
      raf = 0;
      if (reduce) return;
      var vh = innerHeight, r = paper.getBoundingClientRect(), small = mqs.matches;
      var tilt = small ? 3.2 : 6, shrink = small ? 0.07 : 0.14;
      var enter = clamp01(r.top / vh), leave = clamp01((vh - r.bottom) / vh);
      var rot = enter * tilt - leave * (tilt + 0.5), sc = 1 - enter * shrink - leave * (shrink + 0.01);
      paper.style.transformOrigin = enter > 0 || leave === 0 ? '50% ' + Math.min(r.height / 2, vh * 0.7).toFixed(0) + 'px'
                                                           : '50% calc(100% - ' + Math.min(r.height / 2, vh * 0.7).toFixed(0) + 'px)';
      paper.style.transform = 'rotate(' + rot.toFixed(3) + 'deg) scale(' + sc.toFixed(4) + ')';
      revs.forEach(function (el) { var b = el.getBoundingClientRect(); el.style.setProperty('--r', clamp01((vh - b.top) / (vh * 0.55)).toFixed(3)); });
    }
    function kick() { if (!raf) raf = requestAnimationFrame(paint); }
    addEventListener('scroll', function () { if (inView) kick(); }, { passive: true });
    addEventListener('resize', kick);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { inView = en[0].isIntersecting; if (inView) kick(); }, { rootMargin: '300px 0px' }).observe(sec);
    else inView = true;
    // 종이를 읽는 동안에는 오른쪽 아래 게임 배너를 잠깐 숨겨요 (종이를 가리지 않게)
    if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { document.body.classList.toggle('in-ocean', en[0].isIntersecting); }, { rootMargin: '-35% 0px -35% 0px' }).observe(sec);
    kick();
    return {};
  })();
