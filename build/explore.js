  /* =========================================================
     1-2) 목적 (버전2) — '유네스코 인류무형문화유산'
     · 오른쪽: 바당소랑의 목적 (SEA.purpose) — 처음부터 보이고, 왼쪽과 상관없이 그대로예요
     · 왼쪽 그림 4개: 네 가지 해녀 문화(SEA.items[].topic: 01 물질 · 02 잠수굿 · 03 해녀노래 · 04 해녀 공동체와 전승)
       — 팝업 카드는 SeaCard(사진 갤러리 · 가치 · 출처)를 써요. #sea-id 상세 화면도 같은 카드예요
       · PC: 마우스를 올리거나 키보드로 초점을 옮기면 작은 미리보기 창 (소개 · 다룰 것)
       · 누르면(마우스 · 키보드 · 터치 모두) 이 페이지 위에 상세 팝업 (휴대폰에서는 아래에서 올라오는 시트)
     · 망사리와 테왁(SEA.base)은 해산물을 담고 있는 그림이라 눌리지 않아요
       앞뒤: 망사리 뒤쪽(뒷벽 · 테왁) → 입구 안쪽 그늘 → 문어 · 미역 · 뿔소라 · 성게 → 망사리 앞쪽(낮은 앞 테두리 · 반쯤 비치는 그물)
     ========================================================= */
  var SeaArt = (function () {
    var art = (typeof SEA_ART !== 'undefined') ? SEA_ART : {};
    function get(it) { var a = it && it.art; if (!a) return null; return art[a] || { src: a, ratio: 1 }; }
    return { get: get };
  })();

  (function () {
    var sec = $('#purpose'), stage = $('#sxStage');
    if (!stage || typeof SEA === 'undefined') return;
    var items = SEA.items || [];
    var title = $('#sxTitle span');
    if (title) title.innerHTML = String(SEA.title || '').split('\n').map(function (l) { return '<span class="sx__big-line">' + esc(l) + '</span>'; }).join('');

    // ── 오른쪽: 프로젝트 목적 (처음부터 보이고, 왼쪽 그림과 따로 움직여요) ──
    var P = SEA.purpose || {}, pt = $('#sxPurposeTitle'), pb = $('#sxPurposeBody');
    if ($('#sxPurposeLabel')) $('#sxPurposeLabel').textContent = P.label || '';
    if (pt) pt.innerHTML = String(P.title || '').split('\n').map(function (line) {
      return '<span class="sx-pp__line">' + esc(line)
        .replace('{a}', '<em class="sx-pp__num sx-pp__num--was">' + esc(P.a) + '</em>')
        .replace('{b}', '<em class="sx-pp__num sx-pp__num--now">' + esc(P.b) + '</em>')
        .replace(/(<em class="sx-pp__num[^>]*>[^<]*<\/em>[^\s<]*(?:\s[^\s<]+,)?)/g, '<span class="sx-pp__keep">$1</span>') + '</span>';   // 숫자와 바로 뒤 말이 갈라지지 않게
    }).join('');
    if (pb) pb.innerHTML = (P.body || []).map(function (t, i) { return '<p' + (i === 1 ? ' class="is-key"' : '') + '>' + esc(t) + '</p>'; }).join('');

    // ── 왼쪽: 망사리에 담긴 콜라주 ──
    var pos = function (p, a) { return '--x:' + p[0] + ';--y:' + p[1] + ';--w:' + p[2] + ';--r:' + (p[3] || 0) + ';--z:' + (p[4] || 3) + ';--ar:' + (1 / (a.ratio || 1)); };
    // 맞닿는 곳의 접촉 그림자 [가로 %, 세로 %, 너비 %, 높이 %, 진하기] (그림 상자 기준)
    var shade = function (s) { return s ? ';--shx:' + s[0] + ';--shy:' + s[1] + ';--shw:' + s[2] + ';--shh:' + s[3] + ';--sho:' + s[4] : ''; };
    var html = '', frontHtml = '', tagHtml = '', base = SEA.base && SeaArt.get(SEA.base);
    // 망사리 뒤쪽 (그림만)
    if (base && SEA.base.pos) {
      var bs = pos(SEA.base.pos, base), im = '<img src="' + esc(base.src) + '" alt="" decoding="async" draggable="false"';
      html += '<span class="sx-base" aria-hidden="true" style="' + bs + '">' + im + '></span>';
      // 망사리 앞쪽: 해산물 아랫부분을 감싸요 (그물 구멍은 반쯤 비쳐서 안에 담긴 몸이 보여요)
      var fr = SEA.base.front && SeaArt.get({ art: SEA.base.front });
      if (fr) frontHtml = '<span class="sx-netfront" aria-hidden="true" style="' + bs + '"><img src="' + esc(fr.src) + '" alt="" decoding="async" draggable="false"></span>';
    }
    var two = function (i) { return String(i + 1).padStart(2, '0'); };
    items.forEach(function (it, i) {
      var a = SeaArt.get(it), p = it.pos;
      if (!a || !p) return;
      // 오브젝트 = 상세 팝업을 여는 버튼
      html += '<button type="button" class="sx-obj' + (it.shadow ? ' has-sh' : '') + '" data-i="' + i + '" style="' + pos(p, a) + shade(it.shadow) + '"' +
        ' aria-haspopup="dialog" aria-controls="sxDialog" aria-label="' + esc(fill(SEA.objLabel || '{name}', { name: it.name, topic: it.topic || it.name })) + '">' +
        '<img src="' + esc(a.src) + '" alt="" decoding="async" draggable="false">' +
        '<span class="sx-obj__hit"' + (a.hit ? ' style="clip-path:' + esc(a.hit) + '"' : '') + '></span></button>';
    });
    // 미리보기 창 (PC: 마우스 · 키보드 초점)
    tagHtml += '<div class="sx-pop" id="sxPop" aria-hidden="true"></div>';
    stage.insertAdjacentHTML('beforeend', html + frontHtml + tagHtml);
    var objs = $$('.sx-obj', stage), pop = $('#sxPop');

    function preview(i, o) {
      var it = items[i]; if (!it) return;
      pop.innerHTML = '<p class="sx-pop__kicker"><b>' + esc(it.name) + '</b> · ' + two(i) + ' / ' + String(items.length).padStart(2, '0') + '</p>' +
        '<p class="sx-pop__title">' + esc(it.topic || it.name) + '</p>' +
        '<p class="sx-pop__intro">' + esc(it.sub || '') + '</p>' +
        '<ul class="sx-pop__tags">' + ((it.values && it.values.tags) || []).map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        '<p class="sx-pop__hint">' + esc(SEA.previewHint || '눌러서 자세히 보기') + '</p>';
      // 그림 옆 빈 쪽에 띄우고, 무대 밖으로 나가지 않게
      var sr = stage.getBoundingClientRect(), r = (o.querySelector('.sx-obj__hit') || o).getBoundingClientRect();
      pop.classList.add('is-measure');
      var pw = pop.offsetWidth, ph = pop.offsetHeight, gap = 12;
      var right = (r.left + r.width / 2 - sr.left) < sr.width / 2;
      var x = right ? r.right - sr.left - r.width * 0.12 + gap : r.left - sr.left + r.width * 0.12 - pw - gap;
      var y = r.top - sr.top + r.height * 0.18;
      x = Math.max(6, Math.min(sr.width - pw - 6, x)); y = Math.max(6, Math.min(sr.height - ph - 6, y));
      pop.style.left = x + 'px'; pop.style.top = y + 'px';
      pop.classList.remove('is-measure'); pop.classList.add('is-on');
    }
    function unpreview() { pop.classList.remove('is-on'); }

    // ── 상세 팝업 (이 페이지 위에서 보여요 · 휴대폰에서는 아래에서 올라오는 시트) ──
    document.body.insertAdjacentHTML('beforeend',
      '<div class="sx-dlg" id="sxDialog" hidden>' +
        '<div class="sx-dlg__bg" data-close></div>' +
        '<div class="sx-dlg__card" role="dialog" aria-modal="true" aria-labelledby="sxDlgTitle" tabindex="-1">' +
          '<button type="button" class="sx-dlg__x" data-close aria-label="' + esc(SEA.closeLabel || '닫기') + '">×</button>' +
          '<div class="sx-dlg__body" id="sxDlgBody"></div>' +
        '</div>' +
      '</div>');
    var dlg = $('#sxDialog'), dlgBody = $('#sxDlgBody'), card = $('.sx-dlg__card', dlg), opener = null, cur = -1;
    function render(i) {
      dlgBody.innerHTML = SeaCard.html(items, i, { titleId: 'sxDlgTitle' });
      SeaCard.wire(dlgBody);
      cur = i;
    }
    function open(i, from) {
      unpreview(); render(i); opener = from || null;
      dlg.hidden = false; void dlg.offsetWidth; dlg.classList.add('is-on');
      document.documentElement.classList.add('sx-lock');
      objs.forEach(function (o) { o.setAttribute('aria-expanded', String(+o.getAttribute('data-i') === i)); });
      $('.sx-dlg__x', dlg).focus({ preventScroll: true });
    }
    function close() {
      if (dlg.hidden) return;
      dlg.classList.remove('is-on'); document.documentElement.classList.remove('sx-lock');
      objs.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); });
      setTimeout(function () { dlg.hidden = true; }, reduce ? 0 : 220);
      if (opener) opener.focus({ preventScroll: true });
    }
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { close(); return; }
      var g = e.target.closest('[data-go]');
      if (g) { render(+g.getAttribute('data-go')); card.scrollTop = 0; dlgBody.scrollTop = 0; $('.sx-dlg__x', dlg).focus({ preventScroll: true });
        objs.forEach(function (o) { o.setAttribute('aria-expanded', String(+o.getAttribute('data-i') === cur)); }); }
    });
    // 키보드: Esc 로 닫기, Tab 은 팝업 안에서만 돌아요
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('button, a[href]', card).filter(function (x) { return x.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    addEventListener('hashchange', close);

    // 오브젝트: 마우스 → 미리보기, 누르면 → 상세 팝업
    objs.forEach(function (o) {
      var i = +o.getAttribute('data-i');
      o.addEventListener('pointerover', function (e) { if (e.pointerType === 'mouse') { o.classList.add('is-hover'); preview(i, o); } });
      o.addEventListener('pointerout', function (e) { if (e.pointerType === 'mouse') { o.classList.remove('is-hover'); unpreview(); } });
      o.addEventListener('focus', function () { if (o.matches(':focus-visible')) preview(i, o); });
      o.addEventListener('blur', unpreview);
      o.addEventListener('click', function () { open(i, o); });
    });

    // 칸이 화면에 들어오면 해산물이 망사리에서 하나씩 올라와요 (한 번만)
    if (sec) {
      sec.classList.add('is-ready');
      var go = function () { sec.classList.add('is-in'); };
      if (reduce || !('IntersectionObserver' in window)) go();
      else { var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { go(); io.disconnect(); } }, { threshold: 0.2 }); io.observe(stage); }
    }
  })();
