  var Gate = (function () {
    var video = $('#gateVideo'), bg = $('#gateBg');
    var yearEl = $('#gYear'), numEl = $('#gNum'), noteEl = $('#gNote');
    var sea = $('#gSea'), fillImg = $('#gFill');
    var timers = [], raf = 0, done = false, seaDone = false, io = null;
    var HOLD = Math.max(0, +GATE.holdSeconds || 0) * 1000;        // 1970년, 물이 가득한 바다에서 잠깐 머무는 시간
    var DRAIN = Math.max(.5, +GATE.drainSeconds || 2.2) * 1000;   // 색이 1970 → 2025 높이까지 빠지는 시간
    var ENDHOLD = 700;                                            // 2025년 문장 뒤 마지막 메시지까지
    var XX = GATE.unknownYear || '20XX';
    var tryPlay = function () { if (gate.hidden || !video.src || !video.paused) return; var p = video.play(); if (p && p.catch) p.catch(function () {}); };

    // 배경 영상 (없으면 사진 → 바다색)
    if (has(MEDIA.introPoster)) { bg.style.setProperty('--poster', cssUrl(MEDIA.introPoster)); video.poster = MEDIA.introPoster; }
    if (has(MEDIA.introVideo)) {
      video.src = MEDIA.introVideo;
      video.addEventListener('error', function () { video.style.display = 'none'; });
      ['loadeddata', 'canplay'].forEach(function (e) { video.addEventListener(e, tryPlay); });
      gate.addEventListener('pointerdown', tryPlay, { passive: true });
    } else video.style.display = 'none';

    // 제목
    $('#gateTitle').innerHTML = String(GATE.title).split('\n').map(function (l) { return '<span class="ln"><span>' + esc(l) + '</span></span>'; }).join('');
    $('#gateSub').innerHTML = nl(GATE.sub);
    $('#gSrc').textContent = '자료: ' + STATS.source;
    // 휴대폰에서는 출처가 한 줄로 줄어 있어요. 누르면 전체가 보여요
    $('#gSrc').title = '자료: ' + STATS.source;
    $('#gSrc').addEventListener('click', function () { this.classList.toggle('is-open'); });

    /* ── 색이 빠지는 해녀 ──
       채워진 높이는 해녀 수를 빗대어 정해요: 1970년 기록 = 머리끝까지 가득, 0명 = 텅 빈 선
       ※ 줄어드는 해녀 수를 그림 속 색이 빠지는 모습으로 보여 주는 표현이에요 */
    function setLevel(v) {
      fillImg.style.setProperty('--drain', (clamp(1 - v / FIRST[1]) * 100).toFixed(2) + '%');
    }
    // 숫자는 실제 기록(STATS.byYear)에 있는 연도 · 인원만 보여 줘요 (사이 값을 지어내지 않아요)
    function showPoint(r, tick) {
      yearEl.textContent = r[0] + '년'; numEl.textContent = fmt(r[1]);
      if (tick) { numEl.classList.remove('is-tick'); void numEl.offsetWidth; numEl.classList.add('is-tick'); }
    }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function clearAll() { timers.forEach(clearTimeout); timers = []; cancelAnimationFrame(raf); }
    function setNote(html) {
      noteEl.classList.add('is-swap');
      later(function () { noteEl.innerHTML = html; noteEl.classList.remove('is-swap'); }, 260);
    }
    var endNoteHTML = function () { return esc(fill(GATE.endNote, { y: LAST[0], v: fmt(LAST[1]), y0: FIRST[0], p: dropPct(LAST[1]) })); };
    var projNoteHTML = function () {
      return nl(fill(GATE.projNote, { z: XX })) +
        '<span class="gate__care">' + esc(GATE.projCare) + '</span>';
    };
    var finalNoteHTML = function () { return PROJ ? '<span class="gate__end">' + endNoteHTML() + '</span>' + projNoteHTML() : endNoteHTML(); };

    // 기록 사이 시간 = 줄어든 인원(60%) + 흐른 해(40%) 비율로 나눠서, 물이 한꺼번에 쏟아지지 않고 고르게 빠져요
    var SEGS = (function () {
      var span = (LAST[0] - FIRST[0]) || 1, drop = (FIRST[1] - LAST[1]) || 1, w = [], sum = 0, t = 0, k;
      for (k = 1; k < SERIES.length; k++) {
        var x = 0.6 * Math.abs(SERIES[k - 1][1] - SERIES[k][1]) / drop + 0.4 * (SERIES[k][0] - SERIES[k - 1][0]) / span;
        w.push(x); sum += x;
      }
      return w.map(function (x, i) { var s = { a: SERIES[i], b: SERIES[i + 1], t0: t / sum }; t += x; s.t1 = t / sum; return s; });
    })();
    var soft = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };   // 천천히 시작해 천천히 멈춰요

    function runSea() {
      if (!SEGS.length) return finish();
      gate.classList.add('is-draining');
      var start = 0, shown = 0;
      function frame(now) {
        try {
          if (!start) start = now;
          var q = clamp((now - start) / DRAIN), p = soft(q), s = SEGS[SEGS.length - 1], k, idx = 0;
          for (k = 0; k < SEGS.length; k++) if (p <= SEGS[k].t1) { s = SEGS[k]; break; }
          setLevel(lerp(s.a[1], s.b[1], clamp((p - s.t0) / ((s.t1 - s.t0) || 1))));
          for (k = 0; k < SEGS.length; k++) if (p >= SEGS[k].t1 - 1e-6) idx = k + 1;
          if (idx !== shown) { shown = idx; showPoint(SERIES[idx], true); }   // 수면이 기록 하나를 지날 때마다 그 해의 숫자로
          if (q < 1) { raf = requestAnimationFrame(frame); return; }
          setLevel(LAST[1]); showPoint(LAST, false);
          gate.classList.remove('is-draining'); gate.classList.add('is-sea-done');
          setNote(endNoteHTML());
          later(finish, ENDHOLD);
        } catch (e) { finish(); }
      }
      raf = requestAnimationFrame(frame);
    }
    // 해녀 그림이 화면에 들어왔을 때 한 번 시작해요 (휴대폰에서 아래쪽에 있으면 보일 때까지 기다려요)
    function stopWatch() { if (io) { io.disconnect(); io = null; } }
    function watch() {
      var go = function () { stopWatch(); later(function () { try { runSea(); } catch (e) { finish(); } }, HOLD); };
      if (!sea || !('IntersectionObserver' in window)) return go();
      io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) go(); }, { threshold: 0.35 });
      io.observe(sea);
    }

    function finish() {
      clearAll(); stopWatch();
      done = true; seaDone = true;
      gate.classList.remove('is-draining');
      gate.classList.add('is-open', 'is-viz', 'is-done', 'is-sea-done');
      try { setLevel(LAST[1]); } catch (e) {}
      showPoint(LAST, false);
      noteEl.classList.remove('is-swap'); noteEl.innerHTML = finalNoteHTML();
      setTimeout(function () { $('#btnStart').focus({ preventScroll: true }); }, 900);
    }

    function play(direct) {   // direct: 첫 진입 로딩 뒤처럼 물방울 · 빼꼼 장면 없이 바다 화면부터
      clearAll(); stopWatch(); done = false;
      gate.classList.remove('is-open', 'is-peek', 'is-viz', 'is-done', 'is-proj', 'is-zero', 'is-direct', 'is-draining', 'is-sea-done');
      tryPlay();
      // 한 번 끝까지 본 뒤에는 처음으로 돌아와도 다시 돌리지 않고 완성된 바다를 보여 줘요 (새로 열면 다시 재생)
      if (seaDone) { gate.classList.add('is-direct'); return finish(); }
      setLevel(FIRST[1]); showPoint(FIRST, false); noteEl.innerHTML = '';
      // 다시 보기를 위해 처음 물방울 애니메이션을 새로 시작해요
      var blob = $('.gate__blob'); blob.style.animation = 'none'; void blob.offsetWidth; blob.style.animation = '';
      if (reduce) { gate.classList.add('is-open', 'is-viz'); return finish(); }
      if (direct) { gate.classList.add('is-direct', 'is-open', 'is-viz'); later(watch, 600); return; }
      later(function () { gate.classList.add('is-peek'); }, 900);
      later(function () { gate.classList.add('is-open'); }, 2100);
      later(function () { gate.classList.add('is-viz'); }, 2500);
      later(watch, 3200);
    }
    $('#btnSkip').addEventListener('click', finish);
    return { play: play, stop: function () { clearAll(); stopWatch(); video.pause(); }, isDone: function () { return done; } };
  })();

