<script>
/* ★ 실사 바다 배경을 일렁이게 — 바다 사진 한 장을 WebGL 로 아주 천천히 물결처럼 흔들고, 수면의 빛 무늬가 흘러가요
   · 바다색 칸(해녀 이야기 · 목적 · 바다 지키기 · 해녀의 바당길)이 화면에 있을 때만 움직여요 (첫 화면 · 크림색 칸 · 다른 탭이면 멈춤)
   · 초당 30번만 그리고 화면보다 작게 그려서 휴대폰에서도 가볍게
   · 움직임 줄이기 설정이거나 WebGL 이 안 되면: 지금처럼 멈춘 사진 그대로 */
(function () {
  var box = document.querySelector('.sea-bg');
  if (!box || !window.WebGLRenderingContext) return;
  if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var m = /url\(["']?(data:[^"')]+)["']?\)/.exec(getComputedStyle(box).backgroundImage || '');
  if (!m) return;
  var cv = document.createElement('canvas'), gl = cv.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
  if (!gl) return;
  var VS = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision mediump float;',
    'uniform sampler2D T;uniform vec2 R;uniform vec2 I;uniform float t;varying vec2 v;',
    'void main(){',
    '  vec2 uv=vec2(v.x,1.-v.y);',
    '  float ra=R.x/R.y, ri=I.x/I.y;',
    '  vec2 s=ra>ri?vec2(1.,ri/ra):vec2(ra/ri,1.);',                       // 화면을 꽉 채우게(cover)
    '  uv=(uv-.5)*s*.92+.5+vec2(sin(t*.05),cos(t*.04))*.018;',            // 아주 느린 흘러감
    '  vec2 q=uv*vec2(ra,1.);',
    '  vec2 d=vec2(sin(q.y*9.+t*.8)+sin((q.x+q.y)*6.-t*.6), cos(q.x*8.-t*.7)+sin((q.x-q.y)*7.+t*.5))*.0055;',   // 물결 일렁임
    '  vec3 c=texture2D(T,uv+d).rgb;',
    '  float k=sin(q.x*22.+t*1.1+sin(q.y*17.+t*.9)*1.6)*sin(q.y*20.-t*.95+sin(q.x*15.-t*.7)*1.6);',             // 수면의 빛 무늬
    '  c+=smoothstep(.5,1.,k)*.1+smoothstep(.85,1.,k)*.08;',
    '  gl_FragColor=vec4(c,1.);',
    '}'].join('\n');
  function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); return gl.getShaderParameter(o, gl.COMPILE_STATUS) ? o : null; }
  var vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return;
  var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var uR = gl.getUniformLocation(pr, 'R'), uI = gl.getUniformLocation(pr, 'I'), uT = gl.getUniformLocation(pr, 't');
  var img = new Image(), ready = false;
  img.onload = function () {
    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
    gl.uniform2f(uI, img.naturalWidth, img.naturalHeight);
    ready = true; size(); box.appendChild(cv); box.classList.add('is-gl'); wake();
  };
  img.src = m[1];
  function size() {
    var sc = Math.min(1, 1280 / Math.max(1, innerWidth)) * 0.75;           // 화면보다 작게 그려도 반투명 칸 아래라 티가 나지 않아요
    cv.width = Math.max(2, Math.round(innerWidth * sc)); cv.height = Math.max(2, Math.round(innerHeight * sc));
    gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(uR, cv.width, cv.height);
  }
  addEventListener('resize', function () { if (ready) { size(); draw(last); } });
  // 바다색 칸이 보일 때만 움직여요
  var seen = {}, on = false, raf = 0, last = 0, t0 = performance.now(), prev = 0;
  function want() {
    if (document.hidden || document.body.classList.contains('is-gate')) return false;
    for (var k in seen) if (seen[k]) return true;
    return false;
  }
  function draw(now) { if (!ready) return; gl.uniform1f(uT, (now - t0) / 1000); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
  function loop(now) {
    raf = 0; if (!want()) { on = false; return; }
    if (now - prev >= 33) { prev = now; last = now; draw(now); }     // 초당 30번
    raf = requestAnimationFrame(loop);
  }
  function wake() { if (ready && !raf && want()) { on = true; raf = requestAnimationFrame(loop); } }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { en.forEach(function (e) { seen[e.target.id] = e.isIntersecting; }); wake(); });
    ['stories', 'purpose', 'ocean', 'badatgil'].forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  } else seen.all = true;
  document.addEventListener('visibilitychange', wake);
  new MutationObserver(wake).observe(document.body, { attributes: true, attributeFilter: ['class'] });   // 첫 화면에서 웹진으로 들어가면 시작
  window.BSSea = { running: function () { return on; } };
})();
</script>
