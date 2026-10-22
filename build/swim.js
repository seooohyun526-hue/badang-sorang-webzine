<script>
/* =========================================================
   ★ 헤엄치는 해녀 — 움직임 ('바당소랑' 소개 칸 안에서만. 이 부분만 지우면 예전처럼 돌아가요)
   · 목표 지점을 골라 물속처럼 천천히 방향을 틀며 헤엄쳐 가요 (갑자기 꺾이거나 순간이동하지 않아요)
   · 발차기(힘껏 나감) → 미끄러지기(천천히 멈춤)를 되풀이하고, 다리는 그 박자에 맞춰 번갈아 물장구쳐요
   · 몸은 나아가는 쪽으로 기울고, 물에 뜬 것처럼 천천히 오르내려요
   · 글자 · 카드 · 버튼이 없는 빈자리를 골라 다니고, 지나칠 때는 살짝 투명해져요
   · 마우스(손가락)가 가까이 오면 놀라서 물장구치며 비켜 가요
   · 소개 칸 위쪽(큰 제목 ~ 소개 문장)을 벗어나지 않고, 그 칸이 화면에 없을 때 · 메뉴가 열렸을 때 · 움직임 줄이기 설정에서는 쉬어요
   ========================================================= */
(function () {
  'use strict';
  var root = document.getElementById('swim'), sec = document.getElementById('about'); if (!root || !sec) return;
  var fish = root.querySelector('.swim__fish'), shadow = root.querySelector('.swim__shadow');
  var body = document.body, gate = document.getElementById('gate');
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var BUSY = 'h1,h2,h3,h4,p,a,button,input,textarea,select,video,iframe,img,figure,blockquote,li,label,.st-card,.ar-card,.btn,.gfab,.fcard,.sound,.hd,.kicker';
  var rnd = function (a, b) { return a + Math.random() * (b - a); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  var vw = 0, vh = 0, W = 0, H = 0, top0 = 70;
  var x = -200, y = 0, vx = 60, vy = 0, tx = 0, ty = 0;
  var maxV = 100, phase = 0, strokeHz = .7, kickP = 0, t = 0, face = 1, faceS = 1, flipT = 0, ang = 0, op = 1;
  var flee = 0, nextTarget = 0, nextBub = 1.5, last = 0, raf = 0, running = false, cells = [], cols = 0, rows = 0, bubbles = 0;
  var mx = -9999, my = -9999, cmx = -9999, cmy = -9999, seen = false, rect = { left: 0, top: 0 };

  // 헤엄치는 범위: 소개 칸의 맨 위부터 소개 문장(.about__mid) 아래까지 (아래쪽 '왜' 목록으로는 내려가지 않아요)
  function measure() {
    var mid = sec.querySelector('.about__mid');
    var h = mid ? Math.min(sec.clientHeight, mid.offsetTop + mid.offsetHeight + 30) : sec.clientHeight;
    root.style.setProperty('--swim-h', h + 'px');
    vw = sec.clientWidth; vh = h; top0 = 10;
    W = fish.offsetWidth || 140; H = fish.offsetHeight || 102;
  }
  // 화면을 칸으로 나눠, 글자 · 카드 · 버튼이 있는 칸을 표시해요 (0.7초마다)
  function scan() {
    cols = vw < 600 ? 4 : vw < 1000 ? 6 : 8; rows = vh < 700 ? 5 : 6; cells = [];
    for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
      var cx = (c + .5) * vw / cols, cy = top0 + (r + .5) * (vh - top0) / rows;
      var px = rect.left + cx, py = rect.top + cy;              // 화면 좌표로 바꿔서 그 자리에 무엇이 있는지 봐요
      var el = (px >= 0 && py >= 0 && px < innerWidth && py < innerHeight) ? document.elementFromPoint(px, py) : null;
      var busy = !!(el && el.closest && el.closest(BUSY));
      cells.push({ x: cx, y: cy, busy: busy });
    }
  }
  function busyAt(px, py) {
    if (!cells.length) return false;
    var c = clamp(Math.floor(px / (vw / cols)), 0, cols - 1), r = clamp(Math.floor((py - top0) / ((vh - top0) / rows)), 0, rows - 1);
    var cell = cells[r * cols + c]; return !!(cell && cell.busy);
  }
  function inBounds(px, py) { return [clamp(px, W * .6, vw - W * .6), clamp(py, top0 + H * .7, vh - H * .7)]; }
  // 다음 목적지: 지금 헤엄치는 방향의 앞쪽 · 적당히 먼 곳 · 글자가 없는 빈자리를 골라요
  //  (도착하기 전에 미리 다음 곳을 정해서, 멈칫하거나 갑자기 되돌아가지 않고 큰 곡선으로 이어 가요)
  function pickTarget() {
    var sp = Math.hypot(vx, vy) || 1, hx = vx / sp, hy = vy / sp, best = null, bestS = -1e9;
    for (var i = 0; i < 18; i++) {
      var b = inBounds(rnd(0, vw), rnd(top0, vh)), dx = b[0] - x, dy = b[1] - y, d = Math.hypot(dx, dy) || 1;
      var fwd = (dx * hx + dy * hy) / d;                  // 1 = 앞, -1 = 뒤
      var s = fwd * 1.5 - Math.abs(d - Math.min(420, vw * .45)) / 260 - (busyAt(b[0], b[1]) ? 1.6 : 0) + rnd(0, .9);
      if (s > bestS) { bestS = s; best = b; }
    }
    tx = best[0]; ty = best[1];
    maxV = (vw < 600 ? rnd(46, 78) : rnd(70, 125));       // 속도도 매번 조금씩
    strokeHz = rnd(.55, .85);
    nextTarget = t + rnd(5, 9);
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    rect = root.getBoundingClientRect(); mx = cmx - rect.left; my = cmy - rect.top;   // 마우스를 칸 안 좌표로
    var dt = Math.min(.05, ((now - (last || now)) / 1000) || .016); last = now; t += dt;

    // 발차기 박자: 힘껏 나갈 때(thrust↑)와 미끄러질 때(thrust↓)
    phase += dt * strokeHz;
    var thrust = .32 + .68 * Math.pow(Math.max(0, Math.sin(phase * Math.PI * 2)), 2);
    if (flee > 0) { flee -= dt; thrust = 1.15; }

    if (t > nextTarget || Math.hypot(tx - x, ty - y) < 150) pickTarget();
    // 손이 가까이 오면 반대쪽으로 비켜 가요
    var md = Math.hypot(mx - x, my - y);
    if (md < Math.max(120, W * 1.1) && flee <= 0) {
      var ax = (x - mx) / (md || 1), ay = (y - my) / (md || 1), b = inBounds(x + ax * 280, y + ay * 200);
      tx = b[0]; ty = b[1]; flee = 1.1; nextTarget = t + 4;
    }

    // 조향: 원하는 속도로 천천히 맞춰 가요 (힘의 크기를 제한해 급격히 꺾이지 않아요)
    var dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy) || 1;
    var want = maxV * thrust * (flee > 0 ? 1.6 : 1);
    var sx = dx / dist * want - vx, sy = dy / dist * want - vy, sm = Math.hypot(sx, sy), maxF = (flee > 0 ? 200 : 85);
    if (sm > maxF) { sx = sx / sm * maxF; sy = sy / sm * maxF; }
    vx += sx * dt; vy += sy * dt;
    // 화면 가장자리: 부드럽게 밀어 돌려보내요
    var m = 30;
    if (x < W * .5 + m) vx += (W * .5 + m - x) * 2.2 * dt;
    if (x > vw - W * .5 - m) vx -= (x - (vw - W * .5 - m)) * 2.2 * dt;
    if (y < top0 + H * .5) vy += (top0 + H * .5 - y) * 2.2 * dt;
    if (y > vh - H * .5 - m) vy -= (y - (vh - H * .5 - m)) * 2.2 * dt;
    vx *= 1 - .55 * dt; vy *= 1 - .55 * dt;                 // 물의 저항
    x += vx * dt; y += vy * dt;

    // 방향 바꾸기: 반대로 한동안 헤엄칠 때만, 몸을 천천히 돌려요 (휙 뒤집히지 않게)
    var wantFace = vx < -30 ? -1 : vx > 30 ? 1 : face;
    if (wantFace !== face) { flipT += dt; if (flipT > .6) { face = wantFace; flipT = 0; } } else flipT = 0;
    faceS += (face - faceS) * Math.min(1, dt * 4.5);
    // 기울기: 오르면 머리가 들리고, 내려가면 숙여요
    var pitch = Math.atan2(vy, Math.abs(vx) + 25) * 180 / Math.PI * .85;
    ang += (clamp(pitch, -28, 28) * face - ang) * Math.min(1, dt * 2.6);
    // 물에 뜬 듯 천천히 오르내림
    var bob = Math.sin(t * 1.25) * 5 + Math.sin(t * .47 + 1) * 3;
    var roll = Math.sin(t * 1.25 + .6) * 2.2;
    // 물장구: 나갈 때 빠르게, 미끄러질 때 느리게. 두 다리가 번갈아
    kickP += dt * (2.2 + 7 * thrust);
    var ka = Math.sin(kickP) * (5 + 5 * thrust), kb = -Math.sin(kickP) * (6 + 6 * thrust);
    // 힘껏 나갈 때 몸이 살짝 늘어나요
    var st = 1 + .035 * (thrust - .32), sq = 1 - .025 * (thrust - .32);

    // 글자 · 카드 위를 지날 때는 살짝 투명하게
    var wantOp = busyAt(x, y) ? .5 : 1;
    if (Math.abs(wantOp - op) > .01) { op = wantOp; fish.style.opacity = op; }

    fish.style.setProperty('--ka', ka.toFixed(2) + 'deg'); fish.style.setProperty('--kb', kb.toFixed(2) + 'deg');
    fish.style.transform = 'translate3d(' + (x - W / 2).toFixed(1) + 'px,' + (y - H / 2 + bob).toFixed(1) + 'px,0) rotate(' + (ang + roll).toFixed(2) + 'deg) scale(' + (faceS * st).toFixed(3) + ',' + sq.toFixed(3) + ')';
    shadow.style.transform = 'translate3d(' + (x - W * .31 + 26).toFixed(1) + 'px,' + (y + H * .62 - bob * .4).toFixed(1) + 'px,0) scale(' + (1 - bob / 60).toFixed(3) + ')';
    shadow.style.opacity = (op * (.85 - bob / 40)).toFixed(2);

    // 가끔 입가에서 기포가 올라가요
    if (t > nextBub && bubbles < 6) { bubble(); nextBub = t + rnd(1.4, 2.8); }
  }
  function bubble() {
    var b = document.createElement('i'); b.className = 'swim__bub';
    var hx = x + face * W * .34, hy = y - H * .28;
    b.style.left = hx.toFixed(0) + 'px'; b.style.top = hy.toFixed(0) + 'px';
    b.style.setProperty('--s', rnd(5, 11).toFixed(0) + 'px'); b.style.setProperty('--t', rnd(2.2, 3.2).toFixed(2) + 's'); b.style.setProperty('--dx', rnd(-14, 14).toFixed(0) + 'px');
    bubbles++; b.addEventListener('animationend', function () { bubbles--; b.remove(); });
    root.appendChild(b);
  }

  // 언제 헤엄칠지: 웹진 · 상세 화면에서만 (첫 화면 · 메뉴 열림 · 탭이 뒤에 있을 때 · 움직임 줄이기에서는 쉬어요)
  function shouldRun() { return seen && !mq.matches && !document.hidden && gate && gate.hidden && !body.classList.contains('is-locked') && !document.querySelector('.hd.is-open'); }
  function tick() {
    var go = shouldRun();
    if (go && !running) {
      running = true; root.classList.remove('is-rest'); rect = root.getBoundingClientRect(); measure(); scan();
      if (x < -W || x > vw + W || y < 0 || y > vh) { x = -W * .6; y = rnd(vh * .3, vh * .7); vx = 90; vy = 0; face = faceS = 1; }   // 왼쪽에서 헤엄쳐 들어와요
      pickTarget(); last = 0; raf = requestAnimationFrame(frame);
    } else if (!go && running) {
      running = false; cancelAnimationFrame(raf); root.classList.add('is-rest');
    } else if (go) { rect = root.getBoundingClientRect(); measure(); scan(); }
  }
  addEventListener('pointermove', function (e) { cmx = e.clientX; cmy = e.clientY; }, { passive: true });
  addEventListener('pointerdown', function (e) { cmx = e.clientX; cmy = e.clientY; }, { passive: true });
  document.addEventListener('pointerleave', function () { cmx = cmy = -99999; });
  addEventListener('resize', function () { if (running) { measure(); scan(); } });
  // 소개 칸이 화면에 들어왔을 때만 헤엄쳐요
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { seen = en[0].isIntersecting; tick(); }, { threshold: 0.1 }).observe(root);   // 헤엄치는 범위(소개 칸 위쪽)가 보일 때
  else seen = true;
  document.addEventListener('visibilitychange', tick);
  setInterval(tick, 700);
  tick();
})();
</script>
