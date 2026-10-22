  /* =========================================================
     1-2) 목적 — 그린피스 '활동' 칸처럼: 대표 글 하나 + 글 목록 (내용은 PURPOSE)
     ========================================================= */
  (function () {
    var feat = $('#puFeature'), list = $('#puList'); if (!feat || !list || typeof PURPOSE === 'undefined') return;
    var CLOCK = '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.6V8l2.3 1.5" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';
    // 그림: "poster"(첫 화면 바다 사진) · "head"(해녀 얼굴) · "tewak" · "conch" · "shell" · 또는 사진 경로
    function pic(img) {
      if (img === 'poster') return has(MEDIA.introPoster) ? '<span class="pu-img pu-img--photo" style="background-image:' + esc(cssUrl(MEDIA.introPoster)) + '"></span>' : '<span class="pu-img pu-img--sea"></span>';
      if (img === 'head') return '<span class="pu-img pu-img--art">' + (has(MEDIA.gameHead) ? '<img src="' + MEDIA.gameHead + '" alt="">' : ART.char({ shadow: false })) + '</span>';
      if (img === 'tewak' || img === 'conch' || img === 'shell') return '<span class="pu-img pu-img--art">' + artHTML(img) + '</span>';
      if (has(img)) return '<span class="pu-img pu-img--photo" style="background-image:' + esc(cssUrl(img)) + '"></span>';
      return '<span class="pu-img pu-img--sea"></span>';
    }
    function cat(it) { return '<p class="pu-cat"><b>' + esc(it.tag) + '</b><span>' + esc(it.type) + '</span>' + (guides ? '<em class="pu-ex">예시</em>' : '') + '</p>'; }
    function when(it) { return '<p class="pu-when">' + CLOCK + '<span>' + esc(it.time) + '</span><span>' + esc(it.date) + '</span></p>'; }
    function wrap(it, inner, cls) { return has(it.href) ? '<a class="' + cls + '" href="' + esc(it.href) + '">' + inner + '</a>' : '<div class="' + cls + '">' + inner + '</div>'; }
    var f = PURPOSE.feature || {};
    feat.innerHTML = wrap(f, '<span class="pu-feature__pic">' + pic(f.img) + '</span>' +
      '<div class="pu-feature__row">' + cat(f) + when(f) + '</div>' +
      '<h3 class="pu-feature__title">' + esc(f.title) + '</h3>', 'pu-feature__link');
    list.innerHTML = (PURPOSE.list || []).map(function (it, i) {
      return '<li class="pu-item rv" style="--d:' + (i * 0.08).toFixed(2) + 's">' + wrap(it,
        '<div class="pu-item__text">' + cat(it) + '<h3 class="pu-item__title">' + esc(it.title) + '</h3>' + when(it) + '</div>' +
        '<span class="pu-item__pic">' + pic(it.img) + '</span>', 'pu-item__link') + '</li>';
    }).join('');
  })();

