  /* =========================================================
     2-2) '응원 온도' 창 — '바다 지키기' 칸에 들어오면 화면 가운데 떠요 (내용은 CLEAN.cheer)
     · 사랑의 열매 '사랑의 온도탑' · 스포츠 '우리 팀 응원하기' 처럼: 좋아요(여러 번 눌러도 돼요) · 응원의 한 마디를 남기면 온도계가 올라가요
       온도 = base + 좋아요 × likeStep + 한 마디 × commentStep (goal 에서 멈춰요) · 온도계 눈금은 min ℃ ~ goal ℃
     · 응원 저장: 지금은 이 브라우저(localStorage 'bs-cheer')에만 — 서버를 붙이려면 아래 load · save 두 곳만 바꾸면 돼요
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
    var HIDE = 'bs-ocean-pop-hide', DATA = 'bs-cheer', memHide = '', memData = null;
    function today() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
    function hiddenToday() { var v = memHide; try { v = localStorage.getItem(HIDE) || memHide; } catch (e) {} return v === today(); }
    function hideToday() { memHide = today(); try { localStorage.setItem(HIDE, memHide); } catch (e) {} }
    // 응원 기록 { likes: 숫자, comments: [{ t: 글, at: 시각 }] } — 서버를 붙일 땐 이 두 함수만 바꿔요
    function load() {
      var d = memData;
      try { var raw = localStorage.getItem(DATA); if (raw) d = JSON.parse(raw); } catch (e) {}
      d = d && typeof d === 'object' ? d : {};
      return { likes: Math.max(0, +d.likes || 0), comments: Array.isArray(d.comments) ? d.comments.filter(function (c) { return c && typeof c.t === 'string'; }).slice(0, 50) : [] };
    }
    function save(d) { memData = d; try { localStorage.setItem(DATA, JSON.stringify(d)); } catch (e) {} }
    var goal = +P.goal || 100, base = +P.base || 0, min = Math.min(+P.min || 0, base), likeStep = +P.likeStep || 3, comStep = +P.commentStep || 7, maxLen = +P.maxLen || 100;
    function level(t) { return Math.max(0, Math.min(1, (t - min) / (goal - min))).toFixed(4); }   // 온도계 눈금 높이 (0 = 맨 아래 min ℃ · 1 = goal ℃)
    function tempOf(d) { return Math.min(goal, base + d.likes * likeStep + d.comments.length * comStep); }
    var fmt = function (t) { return (Math.round(t * 10) / 10).toFixed(1); };

    var heart = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.8 6.6 4.8c2.1 0 3.6 1.2 5.4 3.2 1.8-2 3.3-3.2 5.4-3.2 3.6 0 5.7 3.6 4.2 7C19.5 16.4 12 21 12 21z" fill="currentColor"/></svg>';
    var talk = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 5.5h16a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 20 17.5h-9l-4.5 3.5v-3.5H4A1.5 1.5 0 0 1 2.5 16V7A1.5 1.5 0 0 1 4 5.5z" fill="currentColor"/><circle cx="8" cy="11.5" r="1.3" style="fill:var(--dot,#fff)"/><circle cx="12" cy="11.5" r="1.3" style="fill:var(--dot,#fff)"/><circle cx="16" cy="11.5" r="1.3" style="fill:var(--dot,#fff)"/></svg>';
    var root = document.createElement('div');
    root.className = 'ocp'; root.id = 'oceanPop'; root.hidden = true;
    root.innerHTML = '<div class="ocp__dim"></div>' +
      '<div class="ocp__box" role="dialog" aria-modal="true" aria-labelledby="ocpTitle" aria-describedby="ocpSub" tabindex="-1"><div class="ocp__in">' +
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
          '<div class="chr-list"><p class="chr-list__k">' + esc(P.listTitle || '') + '</p><ul class="chr-list__ul"></ul></div>' +
          '<p class="chr-note">' + esc(P.note || '') + '</p>' +
          '<p class="sr-only chr-live" aria-live="polite"></p>' +
          '<div class="ocp__acts">' +
            '<button type="button" class="ocp__btn ocp__btn--sub" data-act="today">' + esc(P.today || '오늘 하루 보지 않기') + '</button>' +
            '<button type="button" class="ocp__btn ocp__btn--main" data-act="close">' + esc(P.close || '그냥 나가기') + '</button>' +
          '</div>' +
        '</div>' +
      '</div></div>';
    document.body.appendChild(root);
    var box = $('.ocp__box', root), scene = $('.chr-scene', root), merc = $('.chr-merc', root), num = $('.chr-temp__n', root), up = $('.chr-temp__up', root);
    var form = $('.chr-form', root), text = $('#chrText', root), hint = $('.chr-form__hint', root), count = $('.chr-form__count', root);
    var talkBtn = $('.chr-btn--talk', root), likeBtn = $('.chr-btn--like', root), list = $('.chr-list__ul', root), live = $('.chr-live', root);

    // ── 온도계 · 숫자 · 목록 그리기 ──
    var shown = base, tween = 0;
    function draw(d, bump, quiet) {                                // bump: 이번에 오른 온도 · quiet: '+℃' 표시 없이 차오르기만
      var t = tempOf(d);
      root.style.setProperty('--lv', level(t));
      scene.setAttribute('aria-valuenow', fmt(t)); scene.setAttribute('aria-valuetext', fmt(t) + '℃ / ' + goal + '℃');
      $('.chr-likes', root).textContent = d.likes; $('.chr-coms', root).textContent = d.comments.length;
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
      list.innerHTML = d.comments.length ? d.comments.map(function (c) {
        var at = new Date(c.at || 0), when = isNaN(at) ? '' : (at.getMonth() + 1) + '.' + at.getDate();
        return '<li><span>' + esc(c.t) + '</span><time>' + esc(when) + '</time></li>';
      }).join('') : '<li class="is-empty">' + esc(P.empty || '') + '</li>';
    }
    likeBtn.addEventListener('click', function () {
      var d = load(); if (tempOf(d) >= goal) { draw(d); return; }
      var before = tempOf(d); d.likes += 1; save(d); draw(d, tempOf(d) - before);
      likeBtn.classList.remove('is-pop'); void likeBtn.offsetWidth; likeBtn.classList.add('is-pop');
    });
    talkBtn.addEventListener('click', function () {
      var open_ = form.hidden; form.hidden = !open_; talkBtn.setAttribute('aria-expanded', String(open_));
      if (open_) text.focus();
    });
    text.addEventListener('input', function () { count.textContent = text.value.length + ' / ' + maxLen; hint.textContent = ''; });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var t = text.value.replace(/\s+/g, ' ').trim().slice(0, maxLen);
      if (!t) { hint.textContent = P.tooShort || ''; text.focus(); return; }
      var d = load(), before = tempOf(d);
      d.comments.unshift({ t: t, at: Date.now() }); d.comments = d.comments.slice(0, 50); save(d);
      draw(d, tempOf(d) - before);
      text.value = ''; count.textContent = '0 / ' + maxLen; form.hidden = true; talkBtn.setAttribute('aria-expanded', 'false'); talkBtn.focus();
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
      var d0 = load(); draw(d0, 0);                                  // 숫자 · 목록을 먼저 채우고
      // 뒤 화면은 잠깐 누를 수도, 키보드로 갈 수도 없게
      muted = [].filter.call(document.body.children, function (el) { return el !== root && !el.inert; });
      muted.forEach(function (el) { el.inert = true; });
      document.documentElement.classList.add('ocp-lock');
      root.hidden = false; void root.offsetWidth; root.classList.add('is-on');
      // 창이 열리면 온도계가 처음(체온)에서 지금 온도까지 차올라요
      if (!reduce && tempOf(d0) > base) {
        root.style.setProperty('--lv', level(base)); shown = base; num.textContent = fmt(base);
        setTimeout(function () { draw(d0, tempOf(d0) - base, true); }, 300);
      }
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
    $$('.ocp__btn', root).forEach(function (b) { b.addEventListener('click', function () { close(b.getAttribute('data-act')); }); });
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

