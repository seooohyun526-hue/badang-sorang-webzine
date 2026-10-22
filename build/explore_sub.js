  /* ---------- 해녀문화 카드: '목적' 칸의 팝업과 #sea-id 상세 화면이 함께 써요 (디자이너 전달용 v3 · 갤러리형) ----------
     ① 사진 갤러리(3장 · PC ‹ › 버튼 · 휴대폰 밀어서 넘기기) ② 사진 설명 · '1 / 3' ③ 점 표시 ④ 캐릭터(작은 원)
     ⑤ 이 문화가 지키는 가치(태그 2개 + 한 문장) · 이전/다음 · 사진 출처 */
  window.SeaCard = (function () {
    var two = function (i) { return String(i + 1).padStart(2, '0'); };
    function src(it, k, up) {
      var p = (it.photos || [])[k]; if (!p) return '';
      var s = p[2] || ('media/popup/' + p[0]);
      return up ? up(s) : s;
    }
    function html(list, i, o) {
      o = o || {};
      var it = list[i], n = list.length, ph = it.photos || [], H = o.h || 'h3';
      var art = (typeof SEA_ART !== 'undefined' && it.art && SEA_ART[it.art]) || null;
      var slides = ph.map(function (p, k) {
        return '<figure class="sxc-slide" style="--tint:' + esc(it.tint || '#E7E2D2') + '" aria-label="' + (k + 1) + ' / ' + ph.length + '">' +
          '<img class="sxc-photo" src="' + esc(src(it, k, o.up)) + '" alt="' + esc(p[1]) + '" decoding="async" loading="' + (k ? 'lazy' : 'eager') + '" draggable="false">' +
          '<span class="sxc-miss" aria-hidden="true">' + (art ? '<img src="' + esc(art.src) + '" alt="">' : '') + '<b>' + esc(SEA.photoMissing || '사진 준비 중') + '</b></span>' +
          '<figcaption>' + esc(p[1]) + '</figcaption></figure>';
      }).join('');
      var dots = ph.map(function (p, k) { return '<button type="button" class="sxc-dot" data-dot="' + k + '" aria-label="' + (k + 1) + '번째 사진"' + (k ? '' : ' aria-current="true"') + '></button>'; }).join('');
      var prev = list[i - 1], next = list[i + 1];
      var step = function (x, j, dir) {
        if (!x) return '<span></span>';
        var t = dir < 0 ? '← ' + esc(x.topic || x.name) : esc(x.topic || x.name) + ' →';
        var cls = 'sxc-step' + (dir > 0 ? ' sxc-step--next' : '');
        return o.link ? '<a class="' + cls + '" href="' + esc(o.link(x)) + '">' + t + '</a>' : '<button type="button" class="' + cls + '" data-go="' + j + '">' + t + '</button>';
      };
      var v = it.values || {};
      return '<div class="sxc">' +
        '<div class="sxc-gal">' +
          '<div class="sxc-track" tabindex="0" aria-label="사진 ' + ph.length + '장 — 옆으로 넘겨 보세요">' + slides + '</div>' +
          (ph.length > 1 ? '<span class="sxc-count" aria-hidden="true">1 / ' + ph.length + '</span>' +
            '<button type="button" class="sxc-arrow sxc-arrow--prev" data-gal="-1" aria-label="이전 사진">‹</button>' +
            '<button type="button" class="sxc-arrow sxc-arrow--next" data-gal="1" aria-label="다음 사진">›</button>' +
            '<span class="sxc-hint" aria-hidden="true">← ' + esc(SEA.swipeHint || '옆으로 밀어서 넘기기') + ' →</span>' : '') +
          (art ? '<span class="sxc-char" aria-hidden="true"><img src="' + esc(art.src) + '" alt=""></span>' : '') +
        '</div>' +
        (ph.length > 1 ? '<div class="sxc-dots">' + dots + '</div>' : '') +
        '<div class="sxc-body">' +
          '<p class="sxc-kicker">' + esc(it.name) + ' · ' + two(i) + ' / ' + String(n).padStart(2, '0') + '</p>' +
          '<' + H + ' class="sxc-title"' + (o.titleId ? ' id="' + o.titleId + '"' : '') + '>' + esc(it.topic || it.name) + '</' + H + '>' +
          (has(it.sub) ? '<p class="sxc-sub">' + esc(it.sub) + '</p>' : '') +
          (has(it.body) ? '<p class="sxc-text">' + esc(it.body) + '</p>' : '') +
          ((v.tags && v.tags.length) || has(v.text) ? '<div class="sxc-values"><p class="sxc-values__label">' + esc(SEA.valuesLabel || '이 문화가 지키는 가치') + '</p>' +
            '<ul class="sxc-tags">' + (v.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
            (has(v.text) ? '<p class="sxc-values__text">' + esc(v.text) + '</p>' : '') + '</div>' : '') +
          '<nav class="sxc-nav" aria-label="다른 해녀 문화 이야기">' + step(prev, i - 1, -1) + step(next, i + 1, 1) + '</nav>' +
          (has(it.credit) ? '<p class="sxc-credit">' + esc(it.credit) + '</p>' : '') +
        '</div></div>';
    }
    // 갤러리 움직임: 밀어서 넘기기(네이티브 스크롤) · ‹ › · 점 · 키보드 ← → · 사진이 없으면 '사진 준비 중'
    function wire(root) {
      var gal = root.querySelector('.sxc-gal'); if (!gal) return;
      var track = gal.querySelector('.sxc-track'), slides = [].slice.call(track.children);
      var count = gal.querySelector('.sxc-count'), dots = [].slice.call(root.querySelectorAll('.sxc-dot')), cur = 0, t = 0;
      slides.forEach(function (f) {
        var im = f.querySelector('.sxc-photo');
        var miss = function () { f.classList.add('is-missing'); };
        if (!im.getAttribute('src')) miss();
        else { im.addEventListener('error', miss); if (im.complete && !im.naturalWidth) miss(); }
      });
      function go(k) { k = Math.max(0, Math.min(slides.length - 1, k)); track.scrollTo({ left: k * track.clientWidth, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
      function mark() {
        var k = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
        if (k === cur) return; cur = k;
        if (count) count.textContent = (k + 1) + ' / ' + slides.length;
        dots.forEach(function (d, j) { if (j === k) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
        gal.classList.add('is-swiped');
      }
      track.addEventListener('scroll', function () { cancelAnimationFrame(t); t = requestAnimationFrame(mark); }, { passive: true });
      gal.addEventListener('click', function (e) { var b = e.target.closest('[data-gal]'); if (b) go(cur + (+b.getAttribute('data-gal'))); });
      dots.forEach(function (d) { d.addEventListener('click', function () { go(+d.getAttribute('data-dot')); }); });
      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
      });
    }
    return { html: html, wire: wire };
  })();

  /* ---------- 해녀 문화 상세: '목적' 칸에서 고른 해산물이 여는 이야기 (#sea-id) — 팝업과 같은 카드를 화면 가운데에 ---------- */
  function sea(root, id, o) {
    var list = ((typeof SEA !== 'undefined' && SEA.items) || []).filter(function (x) { return !x.href; }), k = -1;
    list.forEach(function (it, i) { if (String(it.id) === String(id)) k = i; });
    var it = list[k];
    var back = (typeof SEA !== 'undefined' && SEA.backLabel) || '← 웹진으로 돌아가기';
    var bar = '<div class="page__bar"><a class="page__back" href="' + o.home + '#purpose">' + esc(back) + '</a>' +
      '<a href="' + o.home + '#stories" aria-label="' + esc(SITE.name) + ' 웹진으로"><span class="logo-mask page__logo" aria-hidden="true"></span></a></div>';
    if (!it) {
      root.insertAdjacentHTML('beforeend', bar + '<main class="sp-top"><h1 class="sp-title">이야기를 찾을 수 없어요</h1><p><a class="btn btn--coral" href="' + o.home + '#purpose">돌아가기</a></p></main>');
      return function () {};
    }
    root.insertAdjacentHTML('beforeend', bar +
      '<main class="sxd"><div class="sxd-card">' +
        SeaCard.html(list, k, { up: o.up, h: 'h1', titleId: 'sxdTitle', link: function (x) { return '#sea-' + encodeURIComponent(x.id); } }) +
      '</div>' +
      '<section class="sp-more"><a class="btn btn--coral sp-more__btn" href="' + o.home + '#purpose">다른 해녀 문화 보기</a></section>' +
      '</main>');
    SeaCard.wire(root.querySelector('.sxd-card'));
    document.title = (it.topic || it.name) + ' — ' + SITE.name;
    return function () {};
  }
