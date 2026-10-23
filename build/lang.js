  /* =========================================================
     언어 선택 (오른쪽 위) — 한국어 | English | 日本語 를 한 줄로 늘 보여 줘요 (외국인도 누르기 전에 한눈에)
     · 사이트(서버 · Pages): 언어마다 주소가 따로 있어요 — 한국어 ./ · 영어 ./en/ · 일본어 ./ja/ (window.BS_PAGE_LANG · BS_LANG_HOME)
       → 누르면 그 언어 주소로 이동해요. 보던 칸 · 상세 화면(#story-1 등)은 그대로 따라가요
     · 한 파일 판: 고른 언어는 이 브라우저에 기억해요 (localStorage 'bs-lang') → 새로고침 · 다른 화면에서도 그대로
     · <html data-lang="ko|en|ja"> 로 표시하고 'bs:langchange' 이벤트를 보내요
     · 번역(i18n.js)은 화면을 그리기 전에 입혀요 → 보이는 언어가 바뀌면 지금 보던 자리(칸 · 상세 화면)로 다시 열어요
       (사전이 없는 언어는 한국어로 보여요 — 그런 언어와 한국어 사이에서는 다시 열지 않아요)
     · <html lang> 은 번역이 입혀졌을 때만 바뀌어요 (i18n.js)
     · 휴대폰에서는 English 를 EN 으로 줄여 보여 줘요 (읽어 주는 이름은 English 그대로)
     ========================================================= */
  var Lang = (function () {
    var LANGS = [{ code: 'ko', label: '한국어', short: '한국어' }, { code: 'en', label: 'English', short: 'EN' }, { code: 'ja', label: '日本語', short: '日本語' }];
    var KEY = 'bs-lang', mem = '', PAGE = window.BS_PAGE_LANG || '', HOME = window.BS_LANG_HOME || './';
    function load() {
      if (PAGE) return PAGE;                                     // 언어별 주소 페이지: 이 페이지의 언어
      var v = mem; try { v = localStorage.getItem(KEY) || mem; } catch (e) {} return LANGS.some(function (l) { return l.code === v; }) ? v : 'ko';
    }
    function urlOf(code) { return HOME + (code === 'ko' ? '' : code + '/'); }
    function save(v) { mem = v; try { localStorage.setItem(KEY, v); } catch (e) {} }
    var cur = load();
    var root = document.createElement('div');
    root.className = 'lang'; root.id = 'langSel';
    root.setAttribute('role', 'radiogroup'); root.setAttribute('aria-label', '언어 선택 · Language · 言語');
    root.innerHTML = LANGS.map(function (l) {
      return '<button type="button" class="lang__opt" role="radio" lang="' + l.code + '" data-lang="' + l.code + '" aria-checked="false" aria-label="' + l.label + '">' +
        '<span class="lang__full">' + l.label + '</span><span class="lang__short" aria-hidden="true">' + l.short + '</span></button>';
    }).join('');
    document.body.insertBefore(root, document.body.firstChild);
    var opts = [].slice.call(root.querySelectorAll('.lang__opt'));

    function show(code, announce) {
      cur = code;
      opts.forEach(function (o) { var on = o.getAttribute('data-lang') === code; o.setAttribute('aria-checked', String(on)); o.tabIndex = on ? 0 : -1; });
      document.documentElement.setAttribute('data-lang', code);
      if (announce) try { window.dispatchEvent(new CustomEvent('bs:langchange', { detail: { lang: code } })); } catch (e) {}
    }
    function shown(c) { return window.I18N && window.I18N[c] ? c : 'ko'; }   // 실제로 보이는 언어 (사전이 없으면 한국어)
    function pick(code) {
      if (code === cur) return;
      var before = shown(cur); save(code); show(code, true);
      if (PAGE) reopen(urlOf(code));                            // 그 언어 주소로
      else if (shown(code) !== before) reopen();
    }
    // 같은 자리로 다시 열기: 웹진 안이면 지금 보던 칸 + 칸 안에서 내려온 만큼을 기억해요 (상세 화면 · 첫 화면은 주소 그대로)
    var POS = 'bs-lang-pos';
    function reopen(to) {
      var hash = location.hash;                                  // 상세 화면(#story-1 …) · 칸 주소는 그대로 가져가요
      try {
        var b = document.body;
        if (!b.classList.contains('is-gate') && !b.classList.contains('in-sub')) {
          var y = window.scrollY || 0, at = null;
          ['stories', 'purpose', 'ocean', 'badatgil', 'about', 'ending'].forEach(function (id) { var el = document.getElementById(id); if (el && el.offsetTop <= y + 2) at = el; });
          at = at || document.getElementById('stories');
          if (at) {
            sessionStorage.setItem(POS, JSON.stringify({ id: at.id, dy: y - at.offsetTop, hash: location.hash }));
            hash = '#' + at.id;
            if (!to) history.replaceState(history.state, '', location.pathname + location.search + hash);
          }
        }
      } catch (e) {}
      if (to) location.href = to + hash; else location.reload();
    }
    (function back() {                                   // 다시 열린 뒤: 기억한 자리로 · 주소는 원래대로
      var p = null; try { p = JSON.parse(sessionStorage.getItem(POS) || 'null'); sessionStorage.removeItem(POS); } catch (e) {}
      if (!p || !p.id) return;
      var go = function () {
        var el = document.getElementById(p.id); if (!el || document.body.classList.contains('is-gate')) return;
        var html = document.documentElement, sb = html.style.scrollBehavior; html.style.scrollBehavior = 'auto';
        window.scrollTo(0, el.offsetTop + (p.dy || 0)); html.style.scrollBehavior = sb;
        try { history.replaceState(history.state, '', location.pathname + location.search + (p.hash || '')); } catch (e) {}
      };
      if (document.readyState === 'complete') setTimeout(go, 60); else window.addEventListener('load', function () { setTimeout(go, 60); });
    })();
    opts.forEach(function (o, i) {
      o.addEventListener('click', function () { pick(o.getAttribute('data-lang')); });
      o.addEventListener('keydown', function (e) {               // 라디오 버튼처럼 ← → 로 옮기며 골라요
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % opts.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i - 1 + opts.length) % opts.length;
        else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = opts.length - 1;
        if (n === null) return;
        e.preventDefault(); opts[n].focus(); pick(opts[n].getAttribute('data-lang'));
      });
    });
    show(cur, false);
    return { get: function () { return cur; }, set: function (c) { if (LANGS.some(function (l) { return l.code === c; })) pick(c); } };
  })();
  window.BSLang = Lang;

