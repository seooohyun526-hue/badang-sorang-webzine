  /* =========================================================
     5) 물질의 세계 — 미니 게임 '해녀의 바닷길'
     · 게임은 '물질하러 출발' 버튼과, 오른쪽 휴대폰 그림 속 '물질하러 출발' 칸에서 새 탭으로 열려요 (웹진은 그대로)
     · 오른쪽 휴대폰 틀은 실제 게임 시작 화면 그림이에요 — 그림 속 버튼 자리에만 링크를 겹쳐 두었어요
     ========================================================= */
  var Game = (function () {
    $('#gameHow').innerHTML = (GAME.how || []).map(function (h) {
      return Array.isArray(h) ? '<li><b>' + esc(h[0]) + '</b><span>' + esc(h[1]) + '</span></li>' : '<li><span>' + esc(h) + '</span></li>';
    }).join('');
    if ($('#gameHowTitle')) $('#gameHowTitle').textContent = GAME.howTitle || '조작 방법';
    $('#gamePlay').href = GAME.url;
    if ($('#gameShotPlay')) $('#gameShotPlay').href = GAME.url;
    if ($('#gamePlayNote')) $('#gamePlayNote').textContent = GAME.playNote || '';
    var shot = $('#gameShot');
    if (shot && has(GAME.shot)) { shot.src = GAME.shot; shot.alt = GAME.shotAlt || ''; }
    return {};
  })();

  /* =========================================================
     5-1) 바당 소랑 HIGH SCORE — 게임 칸 아래 랭킹 (내용 · 연결 방식은 RANKING)
     · sample: 디자인용 샘플 (화면에 '샘플 데이터'라고 크게 표시)
     · live  : 게임 서버의 실제 랭킹 (실패하면 '불러오지 못했어요' — 샘플로 바꿔 보여 주지 않아요)
     · ?rank=loading|empty|error|sample|live 로 상태를 미리 볼 수 있어요
     ========================================================= */
  var Rank = (function () {
    var R = (typeof RANKING !== 'undefined') ? RANKING : null, box = $('#gameRank');
    if (!R || !box) return {};
    var board = $('#grankBoard'), badge = $('#grankBadge'), note = $('#grankNote');
    $('#grankKicker').textContent = R.kicker || 'HIGH SCORE';
    $('#grankTitle').textContent = R.title || '';
    $('#grankSub').textContent = R.sub || '';
    var q = /[?&]rank=(loading|empty|error|sample|live)\b/.exec(location.search);
    var mode = q ? q[1] : (R.mode === 'live' ? 'live' : 'sample');
    var cols = R.cols || ['RANK', 'DIVER', 'SCORE', 'DATE'];
    var num = function (v) { return Number(v).toLocaleString('en-US'); };
    var day = function (d) { var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(d || '')); return m ? m[1] + '.' + m[2] + '.' + m[3] : '—'; };
    // 픽셀 그림 (왕관 · 메달) — 문자열 한 줄 = 픽셀 한 줄
    function pix(rowsArr, pal, cls) {
      var h = rowsArr.length, w = rowsArr[0].length, r = '';
      rowsArr.forEach(function (line, y) { for (var x = 0; x < w; x++) { var c = pal[line[x]]; if (c) r += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="' + c + '"/>'; } });
      return '<svg class="' + cls + '" viewBox="0 0 ' + w + ' ' + h + '" shape-rendering="crispEdges" aria-hidden="true">' + r + '</svg>';
    }
    var CROWN = ['a...a...a', 'aa.aaa.aa', 'aaaaaaaaa', 'abaabaaba', 'aaaaaaaaa', 'ccccccccc'];
    var MEDAL = ['rr....rr', '.rr..rr.', '..rrrr..', '..aaaa..', '.aaaaaa.', 'aabbaaaa', 'aabaaaaa', '.aaaaaa.', '..aaaa..'];
    var ICON = {
      1: pix(CROWN, { a: '#ffd25a', b: '#ff8a6b', c: '#c8901c' }, 'grank__ico'),
      2: pix(MEDAL, { a: '#dbeef5', b: '#ffffff', r: '#5cd6f2' }, 'grank__ico'),
      3: pix(MEDAL, { a: '#f0a46b', b: '#ffd2ad', r: '#ff8a6b' }, 'grank__ico')
    };
    function table(list) {
      return '<table class="grank__table"><caption class="sr-only">' + esc(R.title) + ' — 상위 ' + list.length + '명' + (mode === 'live' ? '' : ' (샘플 데이터)') + '</caption>' +
        '<thead><tr><th scope="col">' + esc(cols[0]) + '</th><th scope="col">' + esc(cols[1]) + '</th><th scope="col" class="grank__num">' + esc(cols[2]) + '</th><th scope="col" class="grank__date">' + esc(cols[3]) + '</th></tr></thead><tbody>' +
        list.map(function (e, i) {
          var rk = i + 1;
          return '<tr class="grank__row grank__row--' + (rk <= 3 ? rk : 'n') + '">' +
            '<td class="grank__rank"><span class="grank__rk">' + (ICON[rk] || '') + '<span>' + String(rk).padStart(2, '0') + '</span></span></td>' +
            '<td class="grank__name"><span class="grank__nm" title="' + esc(e.name) + '">' + esc(e.name) + '</span><span class="grank__d-m">' + day(e.date) + '</span></td>' +
            '<td class="grank__num">' + num(e.score) + '</td>' +
            '<td class="grank__date">' + day(e.date) + '</td></tr>';
        }).join('') + '</tbody></table>';
    }
    function state(kind, text) {
      board.innerHTML = '<div class="grank__state grank__state--' + kind + '" role="status">' +
        (kind === 'loading' ? '<span class="grank__dots" aria-hidden="true"><i></i><i></i><i></i></span><b>LOADING</b>' : '') +
        (kind === 'empty' ? '<b>NO RECORD</b>' : '') + (kind === 'error' ? '<b>CONNECTION LOST</b>' : '') +
        '<p>' + esc(text) + '</p>' +
        (kind === 'error' ? '<button type="button" class="grank__retry" data-retry>' + esc(R.retry || '다시 불러오기') + '</button>' : '') + '</div>';
    }
    function setBadge(live) {
      box.classList.toggle('is-sample', !live); box.classList.toggle('is-live', live);
      badge.textContent = live ? (R.badgeLive || '실시간 랭킹') : (R.badgeSample || '샘플 데이터');
      note.textContent = live ? (R.noteLive || '') : (R.noteSample || '');
    }
    // 게임 서버 응답 → 닉네임별 최고 점수 · 높은 순 · 상위 N명 (이상한 값은 버려요)
    function normalize(entries) {
      var best = {}, out = [];
      (entries || []).forEach(function (e) {
        var name = String(e.nickname || e.name || '').normalize('NFKC').trim().slice(0, 16), score = Number(e.value != null ? e.value : e.score);
        if (!name || !isFinite(score) || score < 0) return;
        var row = { name: name, score: score, date: e.date || e.at || e.createdAt || e.created_at || '' };
        if (!R.bestPerPlayer) { out.push(row); return; }
        var k = name.toLowerCase();
        if (!best[k] || best[k].score < score) best[k] = row;
      });
      if (R.bestPerPlayer) out = Object.keys(best).map(function (k) { return best[k]; });
      return out.sort(function (a, b) { return b.score - a.score; }).slice(0, R.limit || 10);
    }
    var busy = false, shown = false, timer = 0;
    function load(first) {
      if (busy) return; busy = true;
      if (first) state('loading', R.loading);
      fetch(R.endpoint, { cache: 'no-store' })
        .then(function (r) { if (!r.ok) throw Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) { var list = normalize(data && data.entries); if (list.length) board.innerHTML = table(list); else state('empty', R.empty); })
        .catch(function () { state('error', R.error); })
        .then(function () { busy = false; });
    }
    board.addEventListener('click', function (e) { if (e.target.closest('[data-retry]')) { if (mode === 'live') load(true); } });
    setBadge(mode === 'live');
    if (mode === 'sample') board.innerHTML = table((R.sample || []).slice().sort(function (a, b) { return b.score - a.score; }).slice(0, R.limit || 10));
    else if (mode === 'loading') state('loading', R.loading);
    else if (mode === 'empty') state('empty', R.empty);
    else if (mode === 'error') state('error', R.error);
    else {
      // 실제 랭킹: 칸이 화면에 들어오면 불러오고, 보이는 동안만 주기적으로 다시 불러와요
      state('loading', R.loading);
      var tick = function () { if (shown && document.visibilityState === 'visible') load(false); };
      if ('IntersectionObserver' in window) new IntersectionObserver(function (en) {
        var was = shown; shown = en[0].isIntersecting;
        if (shown && !was) { load(!board.querySelector('table')); clearInterval(timer); timer = setInterval(tick, Math.max(10, R.refreshSeconds || 30) * 1000); }
        if (!shown) clearInterval(timer);
      }, { threshold: 0.1 }).observe(box);
      else { shown = true; load(true); }
    }
    return { mode: mode };
  })();
