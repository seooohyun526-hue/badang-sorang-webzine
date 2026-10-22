/* =========================================================
   ★ 번역 입히기 — 오른쪽 위 언어 선택에서 고른 언어(localStorage 'bs-lang')의 사전(I18N.en …)이 있을 때만 움직여요
   1) 화면을 그리기 전에: 웹진 내용(SITE · GATE · … · CLEAN)의 한국어 글을 사전대로 바꿔 둬요 → 그 뒤로는 원래 코드가 영어 글로 화면을 그려요
   2) 화면 틀(메뉴 · 버튼 · 안내 · 읽어 주는 이름): 그려진 글자 · 속성을 사전대로 바꾸고, 새로 그려지는 것도 계속 지켜봐요
   · 사전: build/i18n_en.js (English) · build/i18n_ja.js (日本語) — 한국어를 고르면 아무것도 하지 않아요 → 원래 웹진 그대로
   · 사전에 없는 글은 한국어로 남아요 — 빠진 글은 그 언어 사전의 words 에 더하면 돼요
   · 랭킹 닉네임 · 내가 남긴 응원 글처럼 사람이 직접 쓴 글은 바꾸지 않아요
   ========================================================= */
(function () {
  'use strict';
  var lang = 'ko';
  try { lang = localStorage.getItem('bs-lang') || 'ko'; } catch (e) {}
  var D = window.I18N && window.I18N[lang];
  var HANGUL = /[가-힣ㄱ-ㆎ]/, FILE = /\.(jpe?g|png|webp|gif|svg|mp4|m4a|webm)$/i;
  var own = function (o, k) { return Object.prototype.hasOwnProperty.call(o, k); };

  // 글 하나 번역: 사전(words) → 끼워 넣는 글(patterns) 순서. 못 찾으면 그대로
  function t(s) {
    if (!D || typeof s !== 'string' || !HANGUL.test(s)) return s;
    if (own(D.words, s)) return D.words[s];
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(s), core = m[2];
    if (own(D.words, core)) return m[1] + D.words[core] + m[3];
    var P = D.patterns || [];
    for (var i = 0; i < P.length; i++) {
      if (!P[i][0].test(core)) continue;
      var rep = P[i][1];
      return m[1] + core.replace(P[i][0], function () {
        var a = [].slice.call(arguments, 0, -2).map(function (g, k) { return k && g ? t(g) : g; });   // 끼어 있던 이름 · 글도 번역
        return typeof rep === 'function' ? rep.apply(null, a) : rep.replace(/\$(\d)/g, function (_, n) { return a[+n] == null ? '' : a[+n]; });
      }) + m[3];
    }
    return s;
  }
  window.BSI18N = { lang: D ? lang : 'ko', t: t };
  if (!D) return;
  document.documentElement.lang = lang;

  /* 1) 웹진 내용 */
  var paths = D.paths || {};
  function walk(o, path) {
    for (var k in o) {
      if (!own(o, k)) continue;
      var v = o[k], p = path + '.' + k;
      if (typeof v === 'string') { if (own(paths, p)) o[k] = paths[p]; else if (!FILE.test(v)) o[k] = t(v); }
      else if (v && typeof v === 'object') walk(v, p);
    }
  }
  ['SITE', 'GATE', 'STATS', 'STORIES', 'INTERVIEWS', 'PURPOSE', 'ARTICLES', 'ABOUT', 'GAME', 'RANKING', 'ENDING', 'SEA', 'CLEAN', 'SUPPORT']
    .forEach(function (n) { if (window[n] && typeof window[n] === 'object') walk(window[n], n); });

  /* 2) 화면 틀 */
  var ATTRS = ['aria-label', 'title', 'alt', 'placeholder', 'aria-valuetext', 'content'];
  var SKIP = '#langSel, script, style, noscript, textarea, .grank__nm, .chr-list__ul > li:not(.is-empty)';
  function skipped(el) { return !el || el.nodeType !== 1 || !!el.closest(SKIP); }
  function fixText(n) {
    var v = n.nodeValue;
    if (!v || !HANGUL.test(v) || skipped(n.parentNode)) return;
    var r = t(v); if (r !== v) n.nodeValue = r;
  }
  function fixAttr(el, a) {
    var v = el.getAttribute(a);
    if (!v || !HANGUL.test(v) || (a === 'content' && el.tagName !== 'META')) return;
    var r = t(v); if (r !== v) el.setAttribute(a, r);
  }
  function fixEl(el) { for (var i = 0; i < ATTRS.length; i++) if (el.hasAttribute(ATTRS[i])) fixAttr(el, ATTRS[i]); }
  var REJECT = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1 };
  function fix(root) {
    if (root.nodeType === 3) return fixText(root);
    if (root.nodeType !== 1 || skipped(root)) return;
    fixEl(root);
    var w = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.nodeType === 1 && (REJECT[n.tagName] || n.id === 'langSel' || n.matches('.grank__nm, .chr-list__ul > li:not(.is-empty)')) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    for (var n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) fixText(n); else fixEl(n); }
  }
  new MutationObserver(function (list) {
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.type === 'childList') for (var j = 0; j < m.addedNodes.length; j++) fix(m.addedNodes[j]);
      else if (m.type === 'characterData') fixText(m.target);
      else if (!skipped(m.target)) fixAttr(m.target, m.attributeName);
    }
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  fix(document.documentElement);
})();
