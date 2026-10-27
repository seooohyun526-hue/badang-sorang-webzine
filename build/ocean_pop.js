  /* =========================================================
     2-2) '응원 온도' 창 — '바다 지키기' 칸에 들어오면 화면 가운데 떠요 (내용은 CLEAN.cheer)
     · 사랑의 열매 '사랑의 온도탑' · 스포츠 '우리 팀 응원하기' 처럼: 좋아요(여러 번 눌러도 돼요) · 응원의 한 마디를 남기면 온도계가 올라가요
       온도 = base + 좋아요 × likeStep + 한 마디 × commentStep (goal 에서 멈춰요) · 온도계 눈금은 min ℃ ~ goal ℃
     · 응원 저장: CLEAN.cheer.supabase 에 주소(url) · 공개 키(anonKey)가 있으면 모두가 함께 보는 공용 저장소(Supabase · cheer-supabase/schema.sql)에
       — 좋아요 · 응원이 한 온도계에 모여요. 비어 있으면 예전처럼 이 브라우저(localStorage 'bs-cheer')에만 저장해요
       · Supabase 의 표는 잠겨 있고, 정해진 함수 4개(cheer_state · cheer_like · cheer_comment · cheer_import)로만 다뤄요 — 글 검사 · 좋아요 횟수도 그 안에서
     · 좋아요: 저장은 한 사람(브라우저)당 P.likeMax(5)번까지 — 하지만 보는 사람에게는 제한이 보이지 않아요 (2026-10-27 사용자 요청)
       누를 때마다 하트가 뿅뿅 · 숫자 +1 · '+℃' 가 계속 나오고, 5번이 넘은 것은 서버에 보내지 않고 이 브라우저 화면에만 더해요 ('bs-cheer-extra')
       (브라우저 이름표 'bs-cheer-me' · 서버에 보낸 수 'bs-cheer-mylikes' — 서버도 같은 이름표로 5번까지 세요) · 응원 한 마디는 횟수 제한 없음
     · 욕설 · 비속어: 남기기 전에 여기서 먼저 막고(bad), 목록에서도 빼요 — 최종 판단은 서버(schema.sql 의 cheer__bad · 같은 낱말 목록)
       · 예전에 이 브라우저에만 남긴 응원은 공용 저장소에 처음 닿을 때 한 번 옮겨요 (같은 응원은 두 번 올라가지 않아요 · 'bs-cheer-moved')
       · 보내는 동안 버튼을 잠가 두 번 저장되지 않게 · 실패하면 창 안에 안내 · 남이 쓴 글은 글자 그대로(esc)만 보여요
     · 오늘 하루 보지 않기: 닫고, 오늘이 끝날 때까지 이 칸에서 저절로 뜨지 않아요 (localStorage 'bs-ocean-pop-hide' = 오늘 날짜)
       → 날짜가 바뀌면 다시 떠요. 저장소를 못 쓰는 환경이면 이 화면에서만 기억해요
     · 그냥 나가기(또는 Esc): 창만 닫고 이 칸에 그대로 있어요. 칸을 완전히 벗어났다 다시 들어오면 다시 떠요
     · 오른쪽 '바당 소랑 응원하기' 미니 팝업을 누르면 언제든 이 창이 열려요 (window.BSCheer.open)
     · 떠 있는 동안: 뒤 화면은 스크롤 · 클릭 · 키보드가 막혀요 (inert) — 닫히면 그대로 돌아와요
     · 종이가 올라오는 움직임(2-1)은 건드리지 않아요
     ========================================================= */
  var OceanPop = (function () {
    var sec = $('#ocean'), P = (typeof CLEAN !== 'undefined' && CLEAN.cheer) || null;
    if (!sec || !P) return {};
    var HIDE = 'bs-ocean-pop-hide', DATA = 'bs-cheer', MOVED = 'bs-cheer-moved', memHide = '', memData = null;
    var SB = P.supabase || {}, SB_URL = String(SB.url || '').trim().replace(/\/+$/, ''), SB_KEY = String(SB.anonKey || '').trim();
    var shared = !!(SB_URL && SB_KEY), cur = null, busy = false;   // cur: 공용 저장소에서 받아 온 지금 상태
    function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    function hiddenToday() { var v = memHide; try { v = localStorage.getItem(HIDE) || memHide; } catch (e) {} return v === today(); }
    function hideToday() { memHide = today(); try { localStorage.setItem(HIDE, memHide); } catch (e) {} }
    // 응원 기록 { likes: 숫자, comments: [{ t: 글, at: 시각 }] } — 서버를 붙일 땐 이 두 함수만 바꿔요
    function load() {
      var d = memData;
      try { var raw = localStorage.getItem(DATA); if (raw) d = JSON.parse(raw); } catch (e) {}
      d = d && typeof d === 'object' ? d : {};
      var cs = Array.isArray(d.comments) ? d.comments.filter(function (c) { return c && typeof c.t === 'string'; }).slice(0, 50) : [];
      return { likes: Math.max(0, +d.likes || 0), comments: cs, commentCount: cs.length };
    }
    function save(d) { memData = d; try { localStorage.setItem(DATA, JSON.stringify({ likes: d.likes, comments: d.comments })); } catch (e) {} }
    // 지금 보여 줄 상태: 공용이면 받아 온 것(아직이면 빈 상태), 아니면 이 브라우저
    function state() { return shared ? (cur || { likes: 0, comments: [], commentCount: 0 }) : load(); }
    function fromServer(x) {
      var cs = x && Array.isArray(x.comments) ? x.comments.filter(function (c) { return c && typeof c.t === 'string'; }).slice(0, 50) : [];
      return { likes: Math.max(0, +(x && x.likes) || 0), comments: cs, commentCount: Math.max(cs.length, +(x && x.commentCount) || 0) };
    }
    // 공용 저장소(Supabase 함수)에 묻기 — 8초 넘게 답이 없으면 실패로 봐요
    //  api('GET') → cheer_state · api('POST', { type: 'like' | 'comment' | 'import', … }) → cheer_like · cheer_comment · cheer_import
    //  답: { status, data } — 함수가 { error } 를 돌려주면 too_fast → 429, text · id · bad · limit → 400, 새로 저장 → 201, 나머지 → 200 으로 맞춰요
    function api(method, body) {
      if (body && body.type === 'like')                              // 서버 규칙을 새로 Run 하기 전(이름표를 모르는 예전 cheer_like)이면 이름표 없이 한 번 더
        return rpc('cheer_like', { p_who: me() }).then(function (res) { return res.status === 404 ? rpc('cheer_like', {}) : res; });
      if (body && body.type === 'comment') return rpc('cheer_comment', { p_id: body.id, p_body: body.t });
      if (body && body.type === 'import') return rpc('cheer_import', { p_comments: body.comments });
      return rpc('cheer_state', {});
    }
    function rpc(fn, args) {
      var ctl = window.AbortController ? new AbortController() : null, tm = setTimeout(function () { if (ctl) ctl.abort(); }, 8000);
      return fetch(SB_URL + '/rest/v1/rpc/' + fn, {
        method: 'POST', cache: 'no-store', signal: ctl ? ctl.signal : undefined,
        headers: { 'Content-Type': 'application/json', apikey: SB_KEY, Authorization: 'Bearer ' + SB_KEY },
        body: JSON.stringify(args)
      })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (data) {
          if (!r.ok) return { status: r.status || 0, data: {} };
          data = data && typeof data === 'object' ? data : {};
          var st = data.error === 'too_fast' ? 429 : (data.error ? 400 : (data.created ? 201 : 200));
          return { status: st, data: data };
        }); })
        .catch(function () { return { status: 0, data: {} }; })
        .then(function (res) { clearTimeout(tm); return res; });
    }
    function uuid() {
      if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
      var b = new Uint8Array(16), i;
      if (window.crypto && crypto.getRandomValues) crypto.getRandomValues(b); else for (i = 0; i < 16; i++) b[i] = Math.random() * 256;
      b[6] = (b[6] & 15) | 64; b[8] = (b[8] & 63) | 128;
      var h = [].map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
      return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
    }
    // 이 브라우저의 이름표 (좋아요를 한 사람당 몇 번 눌렀는지 서버가 세는 데만 써요) · 내가 누른 좋아요 수
    var ME = 'bs-cheer-me', MINE = 'bs-cheer-mylikes', memMe = '', memMine = 0;
    function me() { var v = memMe; try { v = localStorage.getItem(ME) || memMe; } catch (e) {} if (!v) { v = uuid(); memMe = v; try { localStorage.setItem(ME, v); } catch (e) {} } return v; }
    function myLikes() { var v = memMine; try { v = +localStorage.getItem(MINE) || memMine; } catch (e) {} return Math.max(0, v || 0); }
    function setMyLikes(n) { memMine = n; try { localStorage.setItem(MINE, String(n)); } catch (e) {} }
    // 5번이 넘은 좋아요: 서버에는 안 보내고 이 브라우저 화면에만 더해 보여요 (누른 사람은 제한을 모르게)
    var EXTRA = 'bs-cheer-extra', memExtra = 0;
    function extraLikes() { var v = memExtra; try { v = +localStorage.getItem(EXTRA) || memExtra; } catch (e) {} return Math.max(0, v || 0); }
    function addExtra() { memExtra = extraLikes() + 1; try { localStorage.setItem(EXTRA, String(memExtra)); } catch (e) {} }
    // 욕설 · 비속어인지 — schema.sql 의 cheer__bad 와 같은 낱말 · 같은 방법 (대소문자 · 전각 · 문장부호 · 띄어쓰기를 바꿔 써도 같게 봐요)
    var BAD_TIGHT = ['씨발', '씨빨', '씨팔', '씨바', '씨부랄', 'ㅆㅂ', 'ㅅㅂ', 'ㅂㅅ', 'ㅄ', 'ㅈㄴ', 'ㅈㄹ', 'ㅅㄲ', 'ㅁㅊ', 'ㅗㅗ', '좆', '존나', '개새끼', '개새기', '개색끼', '개쉐이', '지랄', '미친놈', '미친년', '또라이', '엿먹', '엠창', '느금', '니애미', '니애비', '썅', '쌍년', '쌍놈', '씹새', '씹할', '씹창', '씹년', '염병', '육시랄', '후레자식', '호로자식', '창녀', '섹스', 'fuck', 'shit', 'bitch', 'asshole', 'motherfucker', 'tlqkf', 'qudtls', '死ね', 'くたばれ', 'ファック'];
    var BAD_SPACED = ['시발', '시팔', '병신', '븅신', '빙신', '닥쳐', '니미', '등신'];   // 띄어쓰기는 두고 봐요 (예: '다시 발견' 은 괜찮게)
    function bad(t) {
      t = String(t || '');
      return [t.normalize ? t.normalize('NFC') : t, t.normalize ? t.normalize('NFKC') : t].some(function (n) {
        n = n.toLowerCase();
        var tight = n.replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ぀-ヿ一-鿿]/g, ''), spaced = n.replace(/[^0-9a-z가-힣ㄱ-ㅎㅏ-ㅣ぀-ヿ一-鿿 ]/g, '');
        return BAD_TIGHT.some(function (w) { return tight.indexOf(w) > -1; }) || BAD_SPACED.some(function (w) { return spaced.indexOf(w) > -1; });
      });
    }
    var goal = +P.goal || 100, base = +P.base || 0, min = Math.min(+P.min || 0, base), likeStep = +P.likeStep || 3, comStep = +P.commentStep || 7, maxLen = +P.maxLen || 100;
    var likeMax = +P.likeMax || 5;                                  // 좋아요: 한 사람(브라우저)당 이만큼까지
    function level(t) { return Math.max(0, Math.min(1, (t - min) / (goal - min))).toFixed(4); }   // 온도계 눈금 높이 (0 = 맨 아래 min ℃ · 1 = goal ℃)
    function tempOf(d) { return Math.min(goal, base + (d.likes + extraLikes()) * likeStep + d.commentCount * comStep); }
    var fmt = function (t) { return (Math.round(t * 10) / 10).toFixed(1); };

    var heart = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.8 6.6 4.8c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.6 4.2 7C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>';
    var talk = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17.5h-9l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z" fill="currentColor"/><circle cx="8" cy="11.5" r="1.3" style="fill:var(--dot,#fff)"/><circle cx="12" cy="11.5" r="1.3" style="fill:var(--dot,#fff)"/><circle cx="16" cy="11.5" r="1.3" style="fill:var(--dot,#fff)"/></svg>';
    var root = document.createElement('div');
    root.className = 'ocp'; root.id = 'oceanPop'; root.hidden = true;
    root.innerHTML = '<div class="ocp__dim"></div>' +
      '<div class="ocp__box" role="dialog" aria-modal="true" aria-labelledby="ocpTitle" aria-describedby="ocpSub" tabindex="-1">' +
        '<button type="button" class="ocp__x" data-act="close" aria-label="' + esc(P.close || '닫기') + '">×</button><div class="ocp__in">' +
        '<div class="chr-scene" role="meter" aria-valuemin="' + min + '" aria-valuemax="' + goal + '" aria-label="' + esc(P.tempLabel || '') + '">' +
          (has(MEDIA.cheerThermo) ? '<img class="chr-scene__img" src="' + MEDIA.cheerThermo + '" alt="" decoding="async" draggable="false">' : '') +
          '<span class="chr-merc" aria-hidden="true"></span>' +
        '</div>' +
        '<div class="chr-main">' +
          '<p class="ocp__brand"><span>' + esc(P.brand || '') + '</span><svg viewBox="0 0 28 18" aria-hidden="true" focusable="false"><path d="M2 4q3-3 6 0t6 0 6 0 6 0M2 9q3-3 6 0t6 0 6 0 6 0M2 14q3-3 6 0t6 0 6 0 6 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg></p>' +
          '<h2 class="ocp__title" id="ocpTitle">' + esc(P.title || '') + '</h2>' +
          '<p class="ocp__sub" id="ocpSub">' + esc(P.sub || '') + '</p>' +
          '<div class="chr-temp"><span class="chr-temp__k">' + esc(P.tempLabel || '') + '</span>' +
            '<b class="chr-temp__v"><span class="chr-temp__n">' + fmt(base) + '</span>℃</b><span class="chr-temp__goal">/ ' + goal + '℃</span>' +
            '<span class="chr-temp__up" aria-hidden="true"></span></div>' +
          '<p class="chr-stat"><span class="chr-stat__l">' + heart + esc(P.like || '') + ' <b class="chr-likes">0</b></span><span class="chr-stat__c">' + talk + esc(P.comment || '') + ' <b class="chr-coms">0</b></span></p>' +
          '<div class="chr-acts">' +
            '<button type="button" class="chr-btn chr-btn--like">' + heart + '<span>' + esc(P.like || '') + '</span></button>' +
            '<button type="button" class="chr-btn chr-btn--talk" aria-expanded="false" aria-controls="chrForm">' + talk + '<span>' + esc(P.comment || '') + '</span></button>' +
          '</div>' +
          '<form class="chr-form" id="chrForm" hidden novalidate>' +
            '<label class="sr-only" for="chrText">' + esc(P.comment || '') + '</label>' +
            '<textarea id="chrText" rows="2" maxlength="' + maxLen + '" placeholder="' + esc(P.placeholder || '') + '"></textarea>' +
            '<div class="chr-form__row"><span class="chr-form__hint" aria-live="polite"></span><span class="chr-form__count">0 / ' + maxLen + '</span><button type="submit" class="chr-btn chr-btn--send">' + esc(P.submit || '') + '</button></div>' +
          '</form>' +
          '<p class="chr-msg" role="status"></p>' +
          '<div class="chr-list"><p class="chr-list__k">' + esc((shared ? P.listTitleShared : P.listTitle) || '') + '</p><ul class="chr-list__ul"></ul></div>' +
          '<p class="chr-note">' + esc((shared ? P.noteShared : P.note) || '') + '</p>' +
          '<p class="sr-only chr-live" aria-live="polite"></p>' +
          '<div class="ocp__acts">' +
            '<button type="button" class="ocp__today" data-act="today">' + esc(P.today || '오늘 하루 보지 않기') + '</button>' +
          '</div>' +
        '</div>' +
      '</div></div>';
    document.body.appendChild(root);
    var box = $('.ocp__box', root), scene = $('.chr-scene', root), merc = $('.chr-merc', root), num = $('.chr-temp__n', root), up = $('.chr-temp__up', root);
    var form = $('.chr-form', root), text = $('#chrText', root), hint = $('.chr-form__hint', root), count = $('.chr-form__count', root);
    var talkBtn = $('.chr-btn--talk', root), likeBtn = $('.chr-btn--like', root), list = $('.chr-list__ul', root), live = $('.chr-live', root);
    var sendBtn = $('.chr-btn--send', root), msg = $('.chr-msg', root), listState = '';   // listState: '' · 'loading' · 'error' (공용 목록을 아직 못 받았을 때)
    function say(t) { msg.textContent = t || ''; }

    // ── 온도계 · 숫자 · 목록 그리기 ──
    var shown = base, tween = 0;
    function draw(d, bump, quiet) {                                // bump: 이번에 오른 온도 · quiet: '+℃' 표시 없이 차오르기만
      var t = tempOf(d);
      root.style.setProperty('--lv', level(t));
      scene.setAttribute('aria-valuenow', fmt(t)); scene.setAttribute('aria-valuetext', fmt(t) + '℃ / ' + goal + '℃');
      var cs = d.comments.filter(function (c) { return !bad(c.t); });   // 욕설 · 비속어가 든 응원은 목록에서 빼요
      $('.chr-likes', root).textContent = d.likes + extraLikes(); $('.chr-coms', root).textContent = Math.max(0, d.commentCount - (d.comments.length - cs.length));
      root.classList.toggle('is-goal', t >= goal);
      // 숫자는 올라가는 만큼 살짝 세어 올라가요
      cancelAnimationFrame(tween);
      var from = shown, t0 = performance.now(), dur = reduce || !bump ? 0 : (quiet ? 1100 : 700);
      (function step(now) {
        var k = dur ? Math.min(1, (now - t0) / dur) : 1; shown = from + (t - from) * (1 - Math.pow(1 - k, 3));
        num.textContent = fmt(shown); if (k < 1) tween = requestAnimationFrame(step);
      })(t0);
      if (bump && !quiet) {
        up.textContent = '+' + fmt(bump) + '℃'; up.classList.remove('is-on'); void up.offsetWidth; up.classList.add('is-on');
        live.textContent = (P.tempLabel || '') + ' ' + fmt(t) + '℃' + (t >= goal ? ' · ' + (P.reached || '') : '');
      }
      var none = listState === 'loading' ? P.loading : listState === 'error' ? P.loadError : P.empty;
      list.innerHTML = cs.length ? cs.map(function (c) {
        var at = new Date(c.at || 0), when = isNaN(at) ? '' : (at.getMonth() + 1) + '.' + at.getDate();
        return '<li><span>' + esc(c.t) + '</span><time>' + esc(when) + '</time></li>';   // 남이 쓴 글은 글자 그대로만 (HTML 로 읽지 않아요)
      }).join('') : '<li class="is-empty">' + esc(none || '') + '</li>';
    }
    // 공용 저장소에서 지금 상태 받아 오기 → 다 받으면 then(d)
    function refresh(then) {
      if (!cur) { listState = 'loading'; draw(state()); }
      return api('GET').then(function (res) {
        if (res.status === 200) { cur = fromServer(res.data); listState = ''; if (then) then(cur); else draw(cur); moveOld(); }
        else if (!cur) { listState = 'error'; draw(state()); }
      });
    }
    // 예전에 이 브라우저에만 남긴 응원을 공용 저장소로 한 번 옮겨요 (같은 응원 id 는 두 번 저장되지 않아요)
    var moving = false;
    function moveOld() {
      var moved = false; try { moved = localStorage.getItem(MOVED) === '1'; } catch (e) { return; }
      if (moved || moving) return;
      var d = load(); if (!d.comments.length) { try { localStorage.setItem(MOVED, '1'); } catch (e) {} return; }
      d.comments.forEach(function (c) { if (!c.id) c.id = uuid(); }); save(d);   // id 를 먼저 적어 두면 중간에 끊겨도 다시 옮길 때 겹치지 않아요
      moving = true;
      api('POST', { type: 'import', comments: d.comments.slice(0, 20).map(function (c) { return { id: c.id, t: c.t, at: c.at }; }) }).then(function (res) {
        moving = false;
        if (res.status === 200) { try { localStorage.setItem(MOVED, '1'); } catch (e) {} cur = fromServer(res.data); if (open) draw(cur); }
      });
    }
    function setBusy(on) { busy = on; likeBtn.disabled = on; sendBtn.disabled = on; text.readOnly = on; form.setAttribute('aria-busy', String(on)); }
    // 하트 뿅뿅: 좋아요 버튼에서 작은 하트들이 위로 튀어 올라 사라져요 (움직임 줄이기 설정이면 제자리에서 잠깐 떴다 사라져요)
    var HEART_COLORS = ['#FF3D68', '#FF6F91', '#E62E5C', '#FF5FA2', '#F7456E', '#FF8A3D'];
    function hearts() {
      var wrap = document.createElement('span'); wrap.className = 'chr-hearts'; wrap.setAttribute('aria-hidden', 'true');
      for (var i = 0; i < 7; i++) {
        var h = document.createElement('i');
        h.style.cssText = '--x:' + Math.round(Math.random() * 120 - 60) + 'px;--y:' + Math.round(-90 - Math.random() * 70) + 'px;--r:' + Math.round(Math.random() * 50 - 25) + 'deg;' +
          '--s:' + (0.7 + Math.random() * 0.7).toFixed(2) + ';--d:' + Math.round(i * 45 + Math.random() * 40) + 'ms;color:' + HEART_COLORS[i % HEART_COLORS.length];
        h.innerHTML = heart; wrap.appendChild(h);
      }
      likeBtn.appendChild(wrap);
      setTimeout(function () { wrap.remove(); }, 1400);
    }
    likeBtn.addEventListener('click', function () {
      var d = state(), n = myLikes();                                // 목표 온도(goal)에 닿은 뒤에도 좋아요는 눌러져요 (온도 숫자는 goal 에서 멈춰요)
      likeBtn.classList.remove('is-pop'); void likeBtn.offsetWidth; likeBtn.classList.add('is-pop'); hearts(); say('');
      if (n >= likeMax) { addExtra(); draw(d, likeStep); return; }     // 5번 넘음: 서버에 안 보내고 화면에만 +1 (하트 · '+℃' 는 그대로)
      setMyLikes(n + 1);
      if (!shared) { d.likes += 1; save(d); draw(d, likeStep); return; }
      // 공용: 눌렀다는 느낌은 바로(먼저 +1), 저장소 답을 받으면 모두의 숫자로 맞춰요 (빨리 여러 번 눌러도 하나씩 다 세요)
      cur = { likes: d.likes + 1, comments: d.comments, commentCount: d.commentCount }; draw(cur, likeStep);
      api('POST', { type: 'like' }).then(function (res) {
        var s = cur || d;
        if (res.status === 200 || ((res.status === 400 || res.status === 429) && res.data.error)) {
          var x = fromServer(res.data);
          cur = { likes: Math.max(x.likes, res.data.error ? 0 : s.likes), comments: x.comments, commentCount: x.commentCount };   // 답이 늦게 온 순서로 숫자가 줄어 보이지 않게
          if (res.data.error === 'limit') { setMyLikes(likeMax); addExtra(); }   // 서버가 이미 5번이라고 하면: 이번 것도 화면에만 (안내 없이)
          else if (typeof res.data.mine === 'number') setMyLikes(Math.max(myLikes(), res.data.mine));
          draw(cur);
        } else { cur = { likes: Math.max(0, s.likes - 1), comments: s.comments, commentCount: s.commentCount }; setMyLikes(Math.max(0, myLikes() - 1)); draw(cur); say(P.sendError); }
      });
    });
    talkBtn.addEventListener('click', function () {
      var open_ = form.hidden; form.hidden = !open_; talkBtn.setAttribute('aria-expanded', String(open_));
      if (open_) text.focus();
    });
    text.addEventListener('input', function () { count.textContent = text.value.length + ' / ' + maxLen; hint.textContent = ''; });
    var pending = null;                                              // 보내다 실패한 응원 { t, id } — 같은 글을 다시 보내면 같은 id 로 (두 번 저장되지 않게)
    function done() {                                                // 응원이 실제로 저장됐을 때만 불려요 (빈칸 · 욕설 · 429 · 400 · 서버 오류 때는 안 불려요)
      try { (window.dataLayer = window.dataLayer || []).push({ event: 'message_save' }); } catch (e) {}   // GTM 댓글 수 세기 — 글 내용 같은 개인정보는 보내지 않아요
      text.value = ''; count.textContent = '0 / ' + maxLen; form.hidden = true; talkBtn.setAttribute('aria-expanded', 'false'); talkBtn.focus();
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (busy) return;                                              // 보내는 중에 또 누르면 무시
      var t = text.value.replace(/\s+/g, ' ').trim().slice(0, maxLen);
      if (!t) { hint.textContent = P.tooShort || ''; text.focus(); return; }
      if (bad(t)) { hint.textContent = P.badWord || ''; text.focus(); return; }   // 욕설 · 비속어는 보내지 않아요 (서버도 한 번 더 막아요)
      var d = state(), before = tempOf(d);
      if (!shared) {
        d.comments.unshift({ t: t, at: Date.now() }); d.comments = d.comments.slice(0, 50); d.commentCount = d.comments.length; save(d);
        draw(d, tempOf(d) - before); done(); return;
      }
      var id = pending && pending.t === t ? pending.id : uuid(); pending = { t: t, id: id };
      setBusy(true); hint.textContent = P.sending || '';
      api('POST', { type: 'comment', id: id, t: t }).then(function (res) {
        setBusy(false); hint.textContent = '';
        if (res.status === 201 || res.status === 200) {
          pending = null; listState = ''; cur = fromServer(res.data); draw(cur, Math.max(0, tempOf(cur) - before)); done(); say('');
        } else if (res.status === 429) { hint.textContent = P.tooFast || ''; text.focus(); }
        else if (res.status === 400 && res.data && res.data.error === 'bad') { hint.textContent = P.badWord || ''; text.focus(); }   // 욕설 · 비속어 (서버가 판단)
        else if (res.status === 400) { hint.textContent = P.tooShort || ''; text.focus(); }
        else { hint.textContent = P.sendError || ''; text.focus(); }  // 글은 그대로 두어 다시 보낼 수 있어요
      });
    });

    // ── 열기 · 닫기 ──
    var armed = true, open = false, inside = false, timer = 0, back = null, muted = [];
    function canShow() {
      return armed && !open && inside && !hiddenToday() && gate.hidden && !body.classList.contains('in-sub') &&
        !body.classList.contains('is-locked') && !document.documentElement.classList.contains('sx-lock');
    }
    function show() {
      if (open) return;
      open = true; back = document.activeElement;
      if (inside) armed = false;                                     // (칸 밖에서 미니 팝업으로 연 것은 '이번 방문'으로 치지 않아요)
      say(''); var d0 = state(); draw(d0, 0);                        // 숫자 · 목록을 먼저 채우고
      // 뒤 화면은 잠깐 누를 수도, 키보드로 갈 수도 없게
      muted = [].filter.call(document.body.children, function (el) { return el !== root && !el.inert; });
      muted.forEach(function (el) { el.inert = true; });
      document.documentElement.classList.add('ocp-lock');
      root.hidden = false; void root.offsetWidth; root.classList.add('is-on');
      // 창이 열리면 온도계가 처음(체온)에서 지금 온도까지 차올라요
      if (!reduce && tempOf(d0) > base) {
        root.style.setProperty('--lv', level(base)); shown = base; num.textContent = fmt(base);
        setTimeout(function () { var d = state(); draw(d, tempOf(d) - base, true); }, 300);   // 그 사이 새로 받아 온 응원이 있으면 그걸로
      }
      // 공용: 열 때마다 모두의 최신 응원을 받아 와요 (그 사이 다른 사람이 남긴 것도 보여요)
      if (shared) refresh(function (d) { draw(d, Math.max(0, tempOf(d) - shown), true); });
      box.focus({ preventScroll: true });                            // 창 자체에 초점 (화면 읽기 프로그램이 제목을 읽어요 · Tab 으로 버튼)
    }
    function close(act) {
      if (!open) return;
      if (act === 'today') hideToday();
      open = false; root.classList.remove('is-on');
      muted.forEach(function (el) { el.inert = false; }); muted = [];
      document.documentElement.classList.remove('ocp-lock');
      setTimeout(function () { if (!open) { root.hidden = true; form.hidden = true; talkBtn.setAttribute('aria-expanded', 'false'); } }, reduce ? 0 : 240);
      if (back && back.focus && document.contains(back)) try { back.focus({ preventScroll: true }); } catch (e) {}
    }
    $$('[data-act]', root).forEach(function (b) { b.addEventListener('click', function () { close(b.getAttribute('data-act')); }); });
    root.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close('close'); return; }
      if (e.key !== 'Tab') return;                                   // Tab 은 창 안에서만 돌아요
      var f = $$('button, textarea', box).filter(function (el) { return !el.closest('[hidden]') && !el.disabled; });
      var i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
    });

    // 칸에 '들어왔다' = 칸이 화면 가운데 30%를 채움 (바다 지키기 칸 표시와 같은 기준) · 잠깐 머물면(0.45초) 떠요
    // 칸을 '완전히 벗어나면' 다시 뜰 준비를 해요 (그냥 나가기 뒤에 다른 칸에 갔다 돌아오면 다시 떠요)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        inside = en[0].isIntersecting; clearTimeout(timer);
        if (inside) timer = setTimeout(function () { if (canShow()) show(); }, 450);
      }, { rootMargin: '-35% 0px -35% 0px' }).observe(sec);
      new IntersectionObserver(function (en) { if (!en[0].isIntersecting) armed = true; }).observe(sec);
    }
    window.BSCheer = { open: show, close: close };                    // 오른쪽 '바당 소랑 응원하기' 미니 팝업이 이걸로 열어요
    return { show: show, close: close };
  })();

