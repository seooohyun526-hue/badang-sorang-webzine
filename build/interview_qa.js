/* =========================================================
   ★ 인터뷰 문답 (간결한 문답) — 모든 인터뷰 상세 화면에서 영상 위에 보여요 (빌드 30단계)
   · 순서: 인터뷰 제목(원래 화면) → [왼쪽 해녀님 캐릭터 스티커 | 오른쪽 인물 소개 · 짧은 도입문 · '전체 영상으로 바로 가기'] → 문답 → 원래 인터뷰 영상
     스티커는 build/interview_qa_sticker_<id>.webp (빌드가 INTERVIEW_QA_STICKER 로 넣어요 · 없으면 글만 가운데)
   · 내용은 build/interview_qa_data.js 의 INTERVIEW_QA (인터뷰 id 마다) · 모양은 build/interview_qa.css
   · 열린 답은 한 페이지에 늘 하나 이하 — '지금 열린 질문 id' 하나(openId)로만 관리해요
     처음 들어오면 첫 질문만 열림 · 다른 질문을 누르면 그 질문만 열림 · 열린 질문을 다시 누르면 닫힘(모두 닫힘도 괜찮아요)
     다른 인터뷰로 가면 그 인터뷰의 첫 질문부터 · 언어를 바꾸면(같은 인터뷰) 보던 질문이 그대로 열려요 (sessionStorage 'bs-qa-open')
   · 답이 펼쳐지거나 위의 답이 닫혀도 누른 질문은 화면에서 제자리에 있어요 (튀지 않게 스크롤을 맞춰요)
   · 화면 글자는 고른 언어(ko · en · ja)로 — 사전 번역(i18n.js)을 거치지 않고 데이터의 그 언어 글을 그대로 써요
   ========================================================= */
var InterviewQA = (function () {
  'use strict';
  var UI = {
    ko: { go: '전체 영상으로 바로 가기', note: '인터뷰 자막을 바탕으로 답변을 짧게 정리했습니다.', seek: '영상에서 보기', by: '답' },
    en: { go: 'Go to the full video', note: 'Answers are short summaries based on the interview subtitles.', seek: 'Watch this part', by: 'Answer' },
    ja: { go: '全編映像へ移動', note: 'インタビューの字幕をもとに、回答を短くまとめました。', seek: '映像で見る', by: '回答' }
  };
  var KEY = 'bs-qa-open';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function txt(o, lang) { return o ? (o[lang] || o.ko || '') : ''; }
  function sec(t) { var p = String(t || '').split(':'); return p.length === 2 ? (+p[0]) * 60 + (+p[1]) : -1; }
  function langOf(l) { return UI[l] ? l : 'ko'; }
  function dataOf(it) { var D = window.INTERVIEW_QA; return D && it && D[String(it.id)]; }

  // 문답 HTML — video: 상세 화면의 영상 정보 (유튜브 · 파일이면 '영상에서 보기' 시각 버튼을 달아요)
  function html(it, lang, video) {
    var d = dataOf(it);
    if (!d || !d.items || !d.items.length) return '';
    lang = langOf(lang);
    var u = UI[lang], base = 'iqa-' + String(it.id), seekable = !!(video && video.k !== 'vimeo');
    var st = window.INTERVIEW_QA_STICKER && INTERVIEW_QA_STICKER[String(it.id)];   // 해녀님 캐릭터 스티커 (빌드가 넣어요)
    var intro = txt(d.intro, lang); if (!Array.isArray(intro)) intro = [intro];     // 도입문: 문단마다 한 줄씩
    return '<section class="iqa" lang="' + lang + '" aria-labelledby="' + base + '-title">' +
      '<div class="iqa__lead' + (st ? ' has-sticker' : '') + '">' +
        (st ? '<img class="iqa__sticker" src="' + st.src + '" width="' + st.w + '" height="' + st.h + '" alt="" aria-hidden="true" decoding="async">' : '') +
        '<div class="iqa__leadtext">' +
          '<p class="iqa__who">' + esc(txt(d.who, lang)) + '</p>' +
          '<div class="iqa__intro">' + intro.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' +
          '<button type="button" class="iqa__jump">' + esc(u.go) + ' <span aria-hidden="true">↓</span></button>' +
        '</div>' +
      '</div>' +
      '<div class="iqa__box">' +
        '<h3 class="iqa__title" id="' + base + '-title">' + esc(txt(d.title, lang)) + '</h3>' +
        '<p class="iqa__note">' + esc(u.note) + '</p>' +
        '<div class="iqa__list">' +
          d.items.map(function (x) {
            var id = base + '-' + x.qid, who = x.by && d.by && d.by[x.by];
            var t = x.src && x.src[0] ? x.src[0][0] : '', s = sec(t);
            return '<div class="iqa__item" data-qid="' + esc(x.qid) + '">' +
              '<h4 class="iqa__h"><button type="button" class="iqa__q" id="' + id + '-q" aria-expanded="false" aria-controls="' + id + '-a">' +
                '<span class="iqa__qtext">' + esc(txt(x.q, lang)) + '</span><span class="iqa__sign" aria-hidden="true"></span>' +
              '</button></h4>' +
              '<div class="iqa__a" id="' + id + '-a" role="region" aria-labelledby="' + id + '-q" hidden>' +
                (who ? '<p class="iqa__by">' + esc(u.by) + ' · ' + esc(txt(who, lang)) + '</p>' : '') +
                '<p class="iqa__text">' + esc(txt(x.a, lang)) + '</p>' +
                (seekable && s >= 0 ? '<button type="button" class="iqa__seek" data-t="' + s + '"><span aria-hidden="true">▶</span> ' + esc(u.seek) + ' · ' + esc(t) + '</button>' : '') +
              '</div>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +
    '</section>';
  }

  // 동작 — o.frame: 영상 칸 · o.play(초): 그 시각부터 재생 (상세 화면이 넘겨줘요). 정리 함수를 돌려줘요
  function mount(root, it, lang, o) {
    var box = root && root.querySelector('.iqa');
    if (!box) return function () {};
    lang = langOf(lang); o = o || {};
    var iid = String(it.id), items = [].slice.call(box.querySelectorAll('.iqa__item'));
    var ids = items.map(function (el) { return el.getAttribute('data-qid'); });
    var openId = ids[0];                                           // 처음엔 첫 질문만
    try {                                                          // 같은 인터뷰를 다른 언어로 바꿔 열었으면: 보던 질문 그대로
      var m = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (m && m.iid === iid && m.lang !== lang && (m.qid === null || ids.indexOf(m.qid) >= 0)) openId = m.qid;
    } catch (e) {}
    function save() { try { sessionStorage.setItem(KEY, JSON.stringify({ iid: iid, qid: openId, lang: lang })); } catch (e) {} }
    function draw() {
      items.forEach(function (el) {
        var on = el.getAttribute('data-qid') === openId;
        el.classList.toggle('is-open', on);
        el.querySelector('.iqa__q').setAttribute('aria-expanded', on ? 'true' : 'false');
        el.querySelector('.iqa__a').hidden = !on;
      });
    }
    function toVideo(t) {
      var fr = o.frame; if (!fr) return;
      var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
      fr.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
      if (t >= 0 && o.play) o.play(t);
      else { var c = fr.querySelector('.vframe__cover, iframe, video'); if (c) try { c.focus({ preventScroll: true }); } catch (e) {} }
    }
    function onClick(e) {
      var q = e.target.closest('.iqa__q');
      if (q) {
        var qid = q.closest('.iqa__item').getAttribute('data-qid'), y0 = q.getBoundingClientRect().top;
        openId = openId === qid ? null : qid;                      // 열린 질문을 다시 누르면 닫혀요
        draw(); save();
        var dy = q.getBoundingClientRect().top - y0;               // 위에서 열려 있던 답이 닫혀 질문이 올라갔으면 그만큼 되돌려요
        if (Math.abs(dy) > 1) window.scrollTo({ top: (window.scrollY || 0) + dy, left: 0, behavior: 'instant' });
        return;
      }
      if (e.target.closest('.iqa__jump')) { toVideo(-1); return; }
      var s = e.target.closest('.iqa__seek');
      if (s) toVideo(+s.getAttribute('data-t'));
    }
    draw(); save();
    box.addEventListener('click', onClick);
    return function () { box.removeEventListener('click', onClick); };
  }

  return { html: html, mount: mount };
})();
