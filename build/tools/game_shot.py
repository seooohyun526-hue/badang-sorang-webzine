# 실제 게임(유니티 WebGL)의 시작 화면을 휴대폰 크기로 찍어요 (이벤트 팝업은 '오늘 하루 안 보기'로 닫아 둔 상태)
import asyncio, sys, datetime
from playwright.async_api import async_playwright
OUT = sys.argv[1]
URL = 'https://haenyeo-ocean-online.vercel.app/'
day = (datetime.datetime.utcnow() + datetime.timedelta(hours=9)).strftime('%Y-%m-%d')

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='chrome', args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        ctx = await b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        await ctx.add_init_script("try{localStorage.setItem('ocean.event.badang-2026-autumn.hiddenDay','%s')}catch(e){}" % day)
        pg = await ctx.new_page()
        logs = []
        pg.on('console', lambda m: logs.append(m.text[:160]))
        await pg.goto(URL, timeout=120000)
        for i in range(60):
            await pg.wait_for_timeout(2000)
            if await pg.evaluate("!!window.unityInstance && getComputedStyle(document.getElementById('loading')).display==='none'"):
                break
        await pg.wait_for_timeout(6000)
        await pg.screenshot(path=f'{OUT}/game_title.png')
        info = await pg.evaluate("[document.getElementById('rank-open') && !document.getElementById('rank-open').hidden, document.getElementById('event-panel') && document.getElementById('event-panel').open]")
        print('loaded', bool(await pg.evaluate('!!window.unityInstance')), 'rankBtn/eventOpen', info)
        print('\n'.join(logs[-12:]))
        await b.close()
asyncio.run(main())
