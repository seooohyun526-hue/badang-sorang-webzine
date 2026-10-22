  /* ---------- 오른쪽 미니 팝업 (아래): 바당 소랑 응원하기 (문구는 SUPPORT) ----------
     · 누르면 '응원 온도' 창(window.BSCheer — 좋아요 · 응원의 한 마디)이 열려요. 창이 없는 판이면 '바다 지키기' 칸으로 이동해요
     · 위쪽 게임 팝업처럼 첫 화면 · 웹진 · 상세 화면 모두에 보이고, 게임 칸(과 게임 상세 화면)에서만 숨어요. 닫기는 따로 작동해요 */
  var SupportPop = (function () {
    var card = $('#supportFab');
    if (!card || typeof SUPPORT === 'undefined') { if (card) card.hidden = true; return { sync: function () {} }; }
    var S = SUPPORT, go = $('.fcard__go', card), sec = $('#badatgil'), closed = false, inGame = false;
    $('.fcard__art', card).innerHTML = has(MEDIA.floatSupport)
      ? '<img class="fcard__img" src="' + MEDIA.floatSupport + '" alt="" decoding="async" draggable="false">' : '';
    $('.fcard__label', card).textContent = S.button || '';
    $('.fcard__bt', card).textContent = S.title || '';
    $('.fcard__bs', card).textContent = S.text || '';
    go.href = '#' + (S.section || 'ocean');
    go.setAttribute('aria-label', (S.button || '') + ' — 좋아요와 응원의 한 마디를 남기는 창이 열려요');
    function spot() {
      var t = (S.anchor && $(S.anchor)) || $('#' + (S.section || 'ocean'));
      if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
    go.addEventListener('click', function (e) {
      e.preventDefault();
      var cheer = window.BSCheer && window.BSCheer.open;
      if (!gate.hidden) { enterSite(go, function () { setTimeout(cheer || spot, 60); }); return; }   // 첫 화면 → 웹진으로 들어가며 창 열기
      if (cheer) { cheer(); return; }                                                    // 웹진 · 상세 화면 어디서든 그 자리에서 창이 열려요
      if (body.classList.contains('in-sub')) { location.hash = S.section || 'ocean'; setTimeout(spot, 1500); return; }
      spot();
    });
    function sync() {
      var onGamePage = body.classList.contains('in-sub') && decodeURIComponent(location.hash.slice(1)) === 'game';
      card.classList.toggle('is-on', !closed && !(inGame && gate.hidden && !body.classList.contains('in-sub')) && !onGamePage);
    }
    $('.fcard__close', card).addEventListener('click', function () { closed = true; sync(); });
    if ('IntersectionObserver' in window && sec) new IntersectionObserver(function (en) { inGame = en[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(sec);
    window.addEventListener('hashchange', function () { setTimeout(sync, 0); });
    sync();
    return { sync: sync };
  })();

  // 오른쪽 미니 팝업이 웹진의 주요 버튼(다음 이야기 화살표 · 인스타그램 · 시작하기 등)과 겹치게 되면, 그동안만 살짝 사라져 비켜요
  (function () {
    var dock = $('#floatDock');
    if (!dock) return;
    var KEY = '.btn, .btn-start, .gate__skip, .pix-btn, #stPrev, #stNext, #instaLink2, .oc-cta__btn, .oc-cmp__knob, .grank button, .sx-obj, #abTitle .row';   // .sx-obj: 목적 칸 해산물 · #abTitle: 화면 끝까지 닿는 '바당은 바다, 소랑은 사랑' 큰 제목
    var raf = 0;
    function check() {
      raf = 0;
      var cards = $$('.fcard.is-on .fcard__go', dock).map(function (g) { return g.getBoundingClientRect(); }), hit = false;
      // 지금 맨 위에 보이는 화면의 버튼만 봐요 (첫 화면이 덮고 있을 땐 첫 화면 · 상세 화면에선 상세 화면 · 아니면 웹진)
      var top = !gate.hidden ? gate : body.classList.contains('in-sub') ? $('#subView') : null;
      if (cards.length) $$(KEY).some(function (el) {
        if (el.closest('.fdock') || el.closest('[hidden]')) return false;
        if (top ? !top.contains(el) : (el.closest('#gate') || el.closest('#subView'))) return false;
        var r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return false;
        if (!cards.some(function (c) { return !(r.right <= c.left - 8 || c.right + 8 <= r.left || r.bottom <= c.top - 8 || c.bottom + 8 <= r.top); })) return false;
        var cs = getComputedStyle(el);                                            // 아직 안 보이는 버튼(첫 화면 '시작하기' 등)은 빼요
        return (hit = cs.visibility === 'visible' && +cs.opacity > 0.1);   // (목적 칸 해산물처럼 바깥은 pointer-events:none · 안쪽 모양만 눌리는 것도 비켜요)
      });
      dock.classList.toggle('is-dodge', hit);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(check); }
    addEventListener('scroll', kick, { passive: true });
    addEventListener('resize', kick);
    document.addEventListener('scroll', kick, { passive: true, capture: true });   // 옆으로 넘기는 이야기 카드 같은 안쪽 스크롤도
    setInterval(kick, 1000);                                                      // 첫 화면 애니메이션처럼 스크롤 없이 움직이는 것도
    kick();
  })();

