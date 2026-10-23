# 웹진메인(한경 lxwebzine 2026-1) 홍보 이미지 4장 + 한 줄 소개 → zip
#  · 웹진의 그림 · 글꼴 · 색을 그대로 써서 홍보용 장면을 짜요 (site/ 를 먼저 빌드해 두세요)
#      tall  1080×1350 (4:5)  '사라지는 해녀들을 만나다' + 3D 해녀 + 2,371명
#      wide  1600×900  (16:9) 같은 이야기 가로판 + 망사리 속 바다 친구들
#      side1  800×600  (4:3)  유네스코 인류무형문화유산 — 망사리 속 바다 친구들
#      side2  800×600  (4:3)  미니 게임 '해녀의 바당길' — 게임 화면 + 게임하는 해녀
#  · 숫자 · 문구는 웹진에 있는 그대로예요 (2025년 2,371명 · 1970년보다 83% · 14,000명 → 2,300여 명)
#  · 저장소 맨 위에서: python build/tools/make_promo.py  → 웹진메인_이미지/ 와 team6_웹진메인_이미지.zip
import asyncio, functools, glob, http.server, io, os, socketserver, threading, zipfile
from PIL import Image
from playwright.async_api import async_playwright

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
OUT = os.path.join(ROOT, '웹진메인_이미지')
ZIP = os.path.join(ROOT, 'team6_웹진메인_이미지.zip')
TEAM = 'team6'
ONE_LINE = '바당은 바다, 소랑은 사랑 — 사라져 가는 제주 해녀의 바다와 삶을 인터뷰 영상과 미니 게임으로 만나는 웹진 바당소랑'
NO_POP = "try{const d=new Date();localStorage.setItem('bs-ocean-pop-hide', d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2));localStorage.setItem('bs-lang','ko')}catch(e){}"

def media(prefix):                                   # site/media 의 파일 이름 (빌드마다 뒤 글자가 바뀌어요)
    f = sorted(glob.glob(os.path.join(ROOT, 'site', 'media', prefix + '*')))
    assert f, prefix
    return '/site/media/' + os.path.basename(f[0])
def font(prefix):
    return '/site/fonts/' + os.path.basename(sorted(glob.glob(os.path.join(ROOT, 'site', 'fonts', prefix + '*')))[0])

def serve():
    h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=ROOT)
    h.log_message = lambda *a: None
    srv = socketserver.TCPServer(('127.0.0.1', 0), h)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv, 'http://127.0.0.1:%d' % srv.server_address[1]

CSS = '''
@font-face{font-family:'Gotgam'; src:url(%(gotgam)s) format('woff')}
@font-face{font-family:'Board'; src:url(%(board)s) format('woff2')}
@font-face{font-family:'RoundNum'; src:url(%(num)s) format('woff2')}
@font-face{font-family:'PixTitle'; src:url(/build/pixel_title.woff2) format('woff2')}
@font-face{font-family:'PixKo'; src:url(%(pixko)s) format('woff2')}
@font-face{font-family:'Press'; src:url(%(press)s) format('woff2')}
*{box-sizing:border-box; margin:0; padding:0}
html,body{width:%(w)dpx; height:%(h)dpx; overflow:hidden; background:transparent}
body{position:relative; font-family:'Board', 'Malgun Gothic', sans-serif; color:#fff; word-break:keep-all}
.sea{position:absolute; inset:0; background:url(%(sea)s) 50%% 50%%/cover; filter:saturate(.95) brightness(1.18)}
.veil{position:absolute; inset:0}
.abs{position:absolute}
.logo{width:var(--lw); filter:drop-shadow(0 2px 6px rgba(8,40,44,.35))}
.kicker{font-family:'Board'; letter-spacing:.08em; color:#EAF7F3; text-shadow:0 1px 3px rgba(8,40,44,.5)}
.title{font-family:'Gotgam'; line-height:1.12; letter-spacing:-.01em; color:#fff; text-shadow:0 3px 0 rgba(15,60,62,.25), 0 6px 26px rgba(8,40,44,.45)}
.sub{line-height:1.5; color:#F3FBF8; text-shadow:0 1px 3px rgba(8,40,44,.6), 0 0 14px rgba(8,40,44,.3)}
.chips{display:flex; flex-wrap:wrap; gap:var(--cg)}
.chip{padding:.42em 1em; border-radius:999px; background:#FBF6EC; color:#1F4A48; font-family:'Board'; box-shadow:0 6px 16px -8px rgba(6,40,44,.6); white-space:nowrap}
.chip.coral{background:#E97842; color:#fff}
.bubble{padding:.7em 1.1em .75em; border-radius:22px; background:#FBF6EC; color:#1F4A48; box-shadow:0 14px 30px -14px rgba(6,40,44,.7); line-height:1.25}
.bubble::after{content:''; position:absolute; width:22px; height:22px; background:#FBF6EC; transform:rotate(45deg); border-radius:4px}
.bubble b{font-family:'RoundNum', 'Gotgam'; color:#1F5E58}
.bubble small{display:block; font-family:'Board'; color:#C85A28}
.mascot{filter:drop-shadow(0 26px 30px rgba(6,40,44,.45))}
.cream{position:absolute; inset:0; background:#FBF6EC}
'''

PAGES = {
 'tall': (1080, 1350, '''
  <div class="sea"></div>
  <div class="veil" style="background:linear-gradient(180deg, rgba(31,94,88,.55) 0%%, rgba(43,128,124,.18) 46%%, rgba(31,94,88,.5) 100%%)"></div>
  <img class="abs logo" src="%(logo)s" style="--lw:150px; left:64px; top:60px">
  <p class="abs kicker" style="right:64px; top:84px; font-size:26px">BADANG SORANG · 제주 해녀 웹진</p>
  <h1 class="abs title" style="left:64px; top:190px; font-size:118px">사라지는 해녀들을<br>만나다</h1>
  <p class="abs sub" style="left:68px; top:470px; font-size:34px">바다와 함께 살아온 사람들,<br>우리가 미처 몰랐던 해녀의 이야기</p>
  <div class="abs chips" style="--cg:12px; left:64px; top:600px; font-size:28px; width:960px">
    <span class="chip">해녀 인터뷰 영상</span><span class="chip">유네스코 무형유산</span><span class="chip coral">미니 게임</span></div>
  <img class="abs" src="%(net)s" style="left:-60px; bottom:-30px; width:560px; filter:drop-shadow(0 20px 26px rgba(6,40,44,.4))">
  <img class="abs mascot" src="%(mascot)s" style="right:40px; bottom:-20px; height:760px">
  <div class="abs bubble" style="left:380px; top:800px; font-size:36px; text-align:center">
    <small style="font-size:24px; margin-bottom:4px">2025년 제주 해녀</small><b style="font-size:72px">2,371</b> 명<small style="font-size:24px; margin-top:4px">1970년보다 83% 줄었어요</small>
    <i style="position:absolute; right:-9px; top:50%%; width:22px; height:22px; background:#FBF6EC; transform:translateY(-50%%) rotate(45deg); border-radius:4px"></i></div>
 '''),
 'wide': (1600, 900, '''
  <div class="sea"></div>
  <div class="veil" style="background:linear-gradient(90deg, rgba(31,94,88,.62) 0%%, rgba(43,128,124,.25) 55%%, rgba(31,94,88,.15) 100%%)"></div>
  <img class="abs logo" src="%(logo)s" style="--lw:140px; left:80px; top:62px">
  <p class="abs kicker" style="left:250px; top:96px; font-size:24px">BADANG SORANG · 제주 해녀 웹진</p>
  <h1 class="abs title" style="left:80px; top:200px; font-size:100px">사라지는 해녀들을<br>만나다</h1>
  <p class="abs sub" style="left:84px; top:450px; font-size:32px">바다와 함께 살아온 사람들,<br>우리가 미처 몰랐던 해녀의 이야기</p>
  <div class="abs chips" style="--cg:12px; left:80px; top:590px; font-size:27px">
    <span class="chip">해녀 인터뷰 영상</span><span class="chip">유네스코 무형유산</span><span class="chip coral">미니 게임</span></div>
  <img class="abs" src="%(net)s" style="right:350px; bottom:-40px; width:480px; filter:drop-shadow(0 20px 26px rgba(6,40,44,.4))">
  <img class="abs mascot" src="%(mascot)s" style="right:70px; bottom:-30px; height:650px">
  <div class="abs bubble" style="right:60px; top:44px; font-size:34px; text-align:center">
    <small style="font-size:22px; margin-bottom:4px">2025년 제주 해녀</small><b style="font-size:68px">2,371</b> 명<small style="font-size:22px; margin-top:4px">1970년보다 83% 줄었어요</small>
    <i style="position:absolute; left:60px; bottom:-9px; width:22px; height:22px; background:#FBF6EC; transform:rotate(45deg); border-radius:4px"></i></div>
 '''),
 'side1': (800, 600, '''
  <div class="sea"></div>
  <div class="veil" style="background:linear-gradient(180deg, rgba(36,111,108,.55) 0%%, rgba(43,128,124,.35) 60%%, rgba(31,85,83,.6) 100%%)"></div>
  <p class="abs kicker" style="left:40px; top:34px; font-size:17px">BADANG SORANG · 제주 해녀 웹진</p>
  <h2 class="abs title" style="left:40px; top:66px; font-size:58px; color:#A6DAFF">유네스코</h2>
  <h2 class="abs title" style="left:40px; top:132px; font-size:36px">인류무형문화유산, 제주 해녀</h2>
  <img class="abs" src="%(net)s" style="left:-14px; bottom:-26px; width:470px; filter:drop-shadow(0 18px 22px rgba(6,40,44,.45))">
  <div class="abs bubble" style="right:30px; top:226px; width:330px; font-family:'Gotgam'; font-size:25px; line-height:1.45; white-space:nowrap">
    바다를 품은<br><b style="font-size:38px">14,000</b>명의 숨,<br>이제 <b style="font-size:38px">2,300</b>여 명만<br>남았습니다.
    <i style="position:absolute; left:-9px; top:50%%; width:22px; height:22px; background:#FBF6EC; transform:translateY(-50%%) rotate(45deg); border-radius:4px"></i></div>
  <span class="abs chip coral" style="right:34px; bottom:34px; font-size:20px">물질 · 잠수굿 · 해녀노래 · 공동체</span>
 '''),
 'side2': (800, 600, '''
  <div style="position:absolute; inset:0; background:radial-gradient(ellipse 90%% 80%% at 70%% 20%%, #3E9E98 0%%, #26737A 50%%, #1C5A60 100%%)"></div>
  <div style="position:absolute; inset:0; background-image:linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px); background-size:24px 24px"></div>
  <p class="abs" style="left:40px; top:44px; font-family:'PixKo', 'Press'; font-size:16px; color:#75F2C9; letter-spacing:.04em">■ 물질의 세계 · MINI GAME</p>
  <h2 class="abs" style="left:38px; top:80px; font-family:'PixTitle'; font-size:76px; line-height:1.08; color:#fff; text-shadow:4px 4px 0 #0E3B40">해녀의<br>바당길</h2>
  <p class="abs" style="left:42px; top:260px; font-family:'PixKo'; font-size:22px; color:#FFE17A">바닷속, 한 걸음씩</p>
  <p class="abs" style="left:42px; top:300px; width:300px; font-family:'PixKo'; font-size:16px; line-height:1.6; color:#E3F6F1">해녀가 되어 바닷속을 탐험하고<br>나만의 기록을 남겨 보세요</p>
  <span class="abs" style="left:42px; top:384px; padding:12px 18px; font-family:'PixKo'; font-size:19px; color:#0E3B40; background:#75F2C9; box-shadow:4px 4px 0 #0E3B40">물질하러 출발 ↗</span>
  <span class="abs" style="left:42px; top:452px; padding:8px 12px; font-family:'Press'; font-size:12px; color:#FFE17A; border:2px dashed #FFE17A">HIGH SCORE 실시간 랭킹</span>
  <div class="abs" style="right:150px; top:38px; width:262px; height:524px; padding:10px; border-radius:34px; background:#0E2E33; box-shadow:0 24px 40px -18px rgba(0,0,0,.6), inset 0 0 0 3px #3BB8B0">
    <img src="%(shot)s" style="display:block; width:100%%; height:100%%; object-fit:cover; border-radius:26px"></div>
  <img class="abs mascot" src="%(gamer)s" style="right:-6px; bottom:-14px; width:270px">
 '''),
}

async def main():
    os.makedirs(OUT, exist_ok=True)
    srv, base = serve()
    made = []
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='chrome')
        # 1) 망사리 속 바다 친구들: 웹진 '유네스코' 칸의 그림만 투명 배경으로 떠 와요
        ctx = await b.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2)
        await ctx.add_init_script(NO_POP)
        pg = await ctx.new_page()
        await pg.goto(base + '/site/index.html#purpose', timeout=120000)
        await pg.wait_for_timeout(4000)
        await pg.add_style_tag(content='html,body,.purpose,.sx,.sea-bg,#site{background:transparent!important} .sea-bg,.fdock,.sound,.lang,.hd,.sx__big,.sx__ask,.sx__tip,.sx__purpose{display:none!important} .sx-obj{animation:none!important}')
        await pg.wait_for_timeout(1500)
        stage = await pg.query_selector('#sxStage')
        net = Image.open(io.BytesIO(await stage.screenshot(omit_background=True)))
        bbox = net.getbbox(); net = net.crop(bbox)
        net_path = os.path.join(OUT, '_net.png'); net.save(net_path)
        await ctx.close()
        # 2) 홍보 장면 4장
        vals = dict(gotgam=font('sangjugotgam'), board=font('schoolsafeboardmarker'), num=font('bs-round-num'), pixko=font('bs-pixel-ko'), press=font('press-start'),
                    sea=media('asset-eb7e7dee'), logo=media('logo'), mascot=media('ld-img'), net='/웹진메인_이미지/_net.png', shot=media('game-shot'), gamer=media('floatgame'))
        for name, (w, h, body) in PAGES.items():
            for k, v in vals.items(): body = body.replace('%%(%s)s' % k, v)   # 글 속 '83%' 같은 % 는 그대로 두고 그림 주소만 넣어요
            html = '<!doctype html><meta charset="utf-8"><style>' + CSS % dict(vals, w=w, h=h) + '</style><body>' + body.replace('%%', '%') + '</body>'
            tmp = os.path.join(OUT, '_%s.html' % name); open(tmp, 'w', encoding='utf-8').write(html)
            ctx = await b.new_context(viewport={'width': w, 'height': h}, device_scale_factor=1)
            pg = await ctx.new_page()
            await pg.goto(base + '/웹진메인_이미지/_%s.html' % name)
            await pg.evaluate("document.fonts.ready.then(()=>1)"); await pg.wait_for_load_state('networkidle'); await pg.wait_for_timeout(600)
            path = os.path.join(OUT, '%s-%s.png' % (TEAM, name))
            Image.open(io.BytesIO(await pg.screenshot())).convert('RGB').save(path, optimize=True)
            made.append(path); await ctx.close(); os.remove(tmp)
        await b.close()
    srv.shutdown(); os.remove(net_path)
    txt = os.path.join(OUT, '%s_한줄소개.txt' % TEAM)
    open(txt, 'w', encoding='utf-8').write(ONE_LINE + '\n')
    made.append(txt)
    with zipfile.ZipFile(ZIP, 'w', zipfile.ZIP_DEFLATED) as z:
        for f in made: z.write(f, os.path.basename(f))
    for f in made: print(os.path.basename(f), os.path.getsize(f) // 1024, 'KB', Image.open(f).size if f.endswith('.png') else '')
    print('zip:', ZIP)

asyncio.run(main())
