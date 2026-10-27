# 웹진메인 카드 정보(site/webzine.json) · 카드 사진 · 공유 미리보기 그림(site/og.jpg)을 만들어요
#  · 빌드(site/index.html)를 먼저 한 뒤에, 저장소 맨 위에서:  python build/tools/make_cards.py
#  · 사진은 지금 웹진 화면을 그대로 찍어 잘라요 (떠 있는 미니 팝업 · 소리 버튼은 숨기고 찍어요)
#      대표 가로 16:9 · 대표 세로 4:5 · 칸마다 16:9 → site/media/card-*.webp (한 장 500KB 이하)
#      공유 미리보기 1200×630 → site/og.jpg (500KB 이하)
#  · 문구는 웹진 안의 글(GATE · STORIES · SEA · CLEAN · GAME · ABOUT)에서 그대로 가져와요 — 새로 짓지 않아요
#  · 필요한 것: Python 3 · Pillow · playwright (+ 크롬)
import asyncio, io, json, os, sys, threading, functools, http.server, socketserver
from PIL import Image
from playwright.async_api import async_playwright

SITE = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'site')
SITE = os.path.abspath(SITE)
NAME = os.environ.get('BS_SITE_NAME', '바당소랑 — 제주 해녀 인터뷰 웹진')
HIDE_UI = '.fdock,.sound,.ld,#oceanPop,.lang{display:none!important}'   # 언어 선택 줄도 빼고 찍어요
NO_POP = "try{const d=new Date();localStorage.setItem('bs-ocean-pop-hide', d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2))}catch(e){}"
LIMIT = 500 * 1024

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=SITE)
    h.log_message = lambda *a: None
    srv = socketserver.TCPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, 'http://127.0.0.1:%d/index.html' % srv.server_address[1]

def save_webp(png, path, size=None):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    if size: im = im.resize(size, Image.LANCZOS)
    for q in (82, 74, 66, 58, 50):
        b = io.BytesIO(); im.save(b, 'WEBP', quality=q, method=6)
        if b.tell() <= LIMIT: break
    open(path, 'wb').write(b.getvalue()); return b.tell()

def save_jpg(png, path):
    im = Image.open(io.BytesIO(png)).convert('RGB')
    for q in (86, 80, 72, 64):
        b = io.BytesIO(); im.save(b, 'JPEG', quality=q, optimize=True, progressive=True)
        if b.tell() <= LIMIT: break
    open(path, 'wb').write(b.getvalue()); return b.tell()

async def gate_shot(b, url, w, h):
    ctx = await b.new_context(viewport={'width': w, 'height': h}); pg = await ctx.new_page()
    await pg.goto(url); await pg.add_style_tag(content=HIDE_UI)
    await pg.wait_for_function("document.querySelector('#gate.is-done') !== null", timeout=20000)
    await pg.evaluate("document.fonts.ready.then(() => 1)")   # 글꼴이 다 불러와진 뒤에 찍어요
    await pg.wait_for_timeout(800)
    png = await pg.screenshot(); await ctx.close(); return png

async def main():
    srv, url = serve()
    os.makedirs(os.path.join(SITE, 'media'), exist_ok=True)
    for f in os.listdir(os.path.join(SITE, 'media')):
        if f.startswith('card-'): os.remove(os.path.join(SITE, 'media', f))
    out = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='chrome')
        # 공유 미리보기 · 대표 사진 (첫 화면)
        out['og.jpg'] = save_jpg(await gate_shot(b, url, 1200, 630), os.path.join(SITE, 'og.jpg'))
        out['media/card-main-16x9.webp'] = save_webp(await gate_shot(b, url, 1600, 900), os.path.join(SITE, 'media', 'card-main-16x9.webp'))
        out['media/card-main-4x5.webp'] = save_webp(await gate_shot(b, url, 880, 1100), os.path.join(SITE, 'media', 'card-main-4x5.webp'))
        # 칸마다 (웹진 안으로 들어가서)
        ctx = await b.new_context(viewport={'width': 1600, 'height': 900}); await ctx.add_init_script(NO_POP)
        pg = await ctx.new_page(); await pg.goto(url)
        await pg.wait_for_function("document.querySelector('#gate.is-done') !== null", timeout=20000)
        await pg.evaluate("document.fonts.ready.then(() => 1)")   # 글꼴이 다 불러와진 뒤에 찍어요
        await pg.evaluate("document.getElementById('btnStart').click()"); await pg.wait_for_timeout(2600)
        await pg.add_style_tag(content=HIDE_UI); await pg.evaluate("document.documentElement.style.scrollBehavior='auto'")
        d = await pg.evaluate("""(()=>({gt:GATE.title, gs:GATE.sub, cap:(document.querySelector('.sea__cap-l')||{}).textContent,
          st:[STORIES.kicker, STORIES.title], pu:[(document.querySelector('a[href="#purpose"]')||{}).textContent, SEA.title],
          oc:[CLEAN.kicker, CLEAN.intro.title], ga:[GAME.kicker, GAME.title], ab:[ABOUT.kicker, ABOUT.lineA + ' ' + ABOUT.lineB]}))()""")
        one = lambda t: ' '.join(str(t or '').split())
        arts = []
        for sid, (kicker, title) in (('stories', d['st']), ('purpose', d['pu']), ('ocean', d['oc']), ('badatgil', d['ga']), ('about', d['ab'])):
            await pg.evaluate("id => { const s = document.getElementById(id); scrollTo(0, s.offsetTop + (id === 'ocean' ? 40 : 0)); }", sid)
            await pg.wait_for_timeout(1600)
            rel = 'media/card-%s.webp' % sid
            out[rel] = save_webp(await pg.screenshot(), os.path.join(SITE, rel))
            arts.append({'title': one(title), 'kicker': one(kicker), 'href': 'index.html#' + sid, 'image': rel, 'alt': one(title)})
        await b.close()
    srv.shutdown()
    card = {'name': NAME, 'title': one(d['gt']), 'lead': one(d['gs']),
            'image': 'media/card-main-16x9.webp', 'image45': 'media/card-main-4x5.webp', 'alt': one(d['cap']), 'href': 'index.html',
            'articles': arts}
    open(os.path.join(SITE, 'webzine.json'), 'w', encoding='utf-8').write(json.dumps(card, ensure_ascii=False, indent=2) + '\n')
    for k, v in out.items(): print('%-34s %4d KB' % (k, v // 1024))
    print('webzine.json ok')

asyncio.run(main())
