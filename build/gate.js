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
      fillImg.parentNode.style.setProperty('--drain', (clamp(1 - v / FIRST[1]) * 100).toFixed(2) + '%');   // 틀(.drain__clip)에 걸면 그림도 함께 따라요
    }
    // 숫자 · 연도: 글자마다 같은 폭의 칸에 넣어서, 굴러가며 바뀌어도 옆으로 흔들리지 않아요 ('1' 이 다른 숫자보다 좁아요)
    var digits = function (s) { return esc(String(s)).replace(/\d/g, '<span class="gd">$&</span>'); };
    function paint(year, num) { yearEl.innerHTML = digits(year) + '년'; numEl.innerHTML = digits(fmt(num)); }
    // 처음(1970년)과 끝(2025년)은 실제 기록 그대로 보여 줘요
    function showPoint(r) { paint(r[0], r[1]); }
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

    // 그림은 1970년 높이에서 2025년 높이까지 하나의 부드러운 곡선으로 멈춤 없이 내려가요 (처음과 끝만 살짝 천천히)
    // 숫자는 그림 높이와 똑같이 촤르륵 굴러 내려가고, 연도도 실제 기록을 따라 함께 굴러가요 → 마지막엔 실제 기록(2025년 2,371명)에 딱 멈춰요
    //  (가는 동안 보이는 숫자 · 연도는 기록 사이를 잇는 '세는 효과'예요)
    var KV = SERIES.map(function (r) { return r[1]; });
    function levelAt(p) { return lerp(FIRST[1], LAST[1], p); }
    function yearAt(v) {                                      // 이 인원에 해당하는 해 (기록 두 점 사이를 이어서)
      for (var k = 1; k < KV.length; k++) if (v >= KV[k]) return Math.round(lerp(SERIES[k - 1][0], SERIES[k][0], (KV[k - 1] - v) / ((KV[k - 1] - KV[k]) || 1)));
      return LAST[0];
    }
    var soft = function (t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; };   // 천천히 시작해 천천히 멈춰요
    function runSea() {
      if (SERIES.length < 2) return finish();
      gate.classList.add('is-draining');
      var start = 0, shown = 0;
      function frame(now) {
        try {
          if (!start) start = now;
          var q = clamp((now - start) / DRAIN), p = soft(q), v = levelAt(p), n = Math.round(v), y = yearAt(v);
          setLevel(v);
          if (n !== shown) { shown = n; paint(y, n); }                     // 촤르륵 — 프레임마다 숫자가 굴러가요
          if (q < 1) { raf = requestAnimationFrame(frame); return; }
          setLevel(LAST[1]); showPoint(LAST);
          gate.classList.remove('is-draining'); gate.classList.add('is-sea-done');
          setNote(endNoteHTML());
          later(finish, ENDHOLD);
        } catch (e) { finish(); }
      }
      raf = requestAnimationFrame(frame);
    }
    // 해녀 그림이 화면에 들어왔을 때 한 번 시작해요 (휴대폰에서 아래쪽에 있으면 보일 때까지 기다려요)
    function stopWatch() { if (io) { io.disconnect(); io = null; } }
    // 배경 영상이 막 재생을 시작하는 순간(풀어서 그리기 시작할 때)은 화면이 잠깐 버벅여요
    // → 영상이 실제로 흐르기 시작하고 조금 지난 뒤에 색이 빠지기 시작해요 (영상이 없거나 늦으면 최대 1.6초만 기다려요)
    function afterVideo(fn) {
      if (!video.src || video.style.display === 'none') return fn();
      var fired = false, run = function () { if (fired) return; fired = true; fn(); };
      if (!video.paused && video.currentTime > 0.25) return run();
      video.addEventListener('playing', function () { later(run, 350); }, { once: true });
      later(run, 1600);
    }
    function watch() {
      var go = function () { stopWatch(); afterVideo(function () { later(function () { try { runSea(); } catch (e) { finish(); } }, HOLD); }); };
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
      showPoint(LAST);
      noteEl.classList.remove('is-swap'); noteEl.innerHTML = finalNoteHTML();
      setTimeout(function () { $('#btnStart').focus({ preventScroll: true }); }, 900);
    }

    function play(direct) {   // direct: 첫 진입 로딩 뒤처럼 물방울 · 빼꼼 장면 없이 바다 화면부터
      clearAll(); stopWatch(); done = false;
      gate.classList.remove('is-open', 'is-peek', 'is-viz', 'is-done', 'is-proj', 'is-zero', 'is-direct', 'is-draining', 'is-sea-done');
      tryPlay();
      // 한 번 끝까지 본 뒤에는 처음으로 돌아와도 다시 돌리지 않고 완성된 바다를 보여 줘요 (새로 열면 다시 재생)
      if (seaDone) { gate.classList.add('is-direct'); return finish(); }
      setLevel(FIRST[1]); showPoint(FIRST); noteEl.innerHTML = '';
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

