# 해양정화 카드의 BEFORE / AFTER 장면을 웹진의 털실 인형 스타일로 그려요
# (펠트 질감 바위 · 이끼 · 폐그물 · 바다 + 기존 털실 인형 그림을 흰 스티커 테두리와 그림자로 붙임)
import sys, math, numpy as np, cv2
from PIL import Image, ImageFilter, ImageDraw
D = 'plush'; OUT = sys.argv[1] if len(sys.argv) > 1 else 'scenes'
W, H = 800, 480
rng = np.random.default_rng(3)

# ── 펠트 질감 (문어 인형의 털 무늬를 빌려서) ──
mu = np.asarray(Image.open(f'{D}/plush-muneo.webp').convert('RGB')).astype(np.float32).mean(2)
patch = mu[40:200, 250:420]
hp = patch - cv2.GaussianBlur(patch, (0, 0), 6); hp /= hp.std() + 1e-6
tile = np.block([[hp, hp[:, ::-1]], [hp[::-1], hp[::-1, ::-1]]])
TEX = np.tile(tile, (H // tile.shape[0] + 2, W // tile.shape[1] + 2))[:H, :W].astype(np.float32)

def noise(scale, seed):
    r = np.random.default_rng(seed).random((H // scale + 3, W // scale + 3)).astype(np.float32)
    return cv2.resize(r, (W + scale * 3, H + scale * 3), interpolation=cv2.INTER_CUBIC)[:H, :W]

yy, xx = np.mgrid[:H, :W].astype(np.float32)

def background(clear):
    t = yy / H
    if clear: top, mid, bot = np.array([233, 246, 242]), np.array([164, 220, 210]), np.array([104, 186, 172])
    else:     top, mid, bot = np.array([222, 228, 223]), np.array([172, 190, 182]), np.array([128, 152, 143])
    c = np.where((t < .3)[..., None], top + (mid - top) * (t / .3)[..., None], mid + (bot - mid) * ((t - .3) / .7)[..., None])
    img = c.astype(np.float32)
    # 위에서 내려오는 빛
    for x0, w0, a in ((140, 70, .16), (430, 46, .12), (650, 90, .14)):
        ray = np.clip(1 - np.abs(xx - (x0 + (yy * .25))) / w0, 0, 1) * np.clip(1 - yy / (H * .95), 0, 1) * a * (1.2 if clear else .7)
        img = img + ray[..., None] * 255 * .9
    # 수면 물결선
    surf = 34 + 5 * np.sin(xx / 42)
    line = np.exp(-((yy - surf) ** 2) / 4)
    img = img * (1 - line[..., None] * .8) + 255 * line[..., None] * .8
    img[yy < surf] = img[yy < surf] * .6 + 255 * .4
    # 모래 바닥 (펠트)
    sand_y = 398 + 9 * np.sin(xx / 70) + 5 * np.sin(xx / 23 + 1)
    sand = yy > sand_y
    sc = np.array([230, 212, 172], np.float32) * (1 - .1 * np.clip((yy - sand_y) / 80, 0, 1))[..., None]
    sc = sc * (1 + .045 * TEX)[..., None]
    img = np.where(sand[..., None], sc, img)
    # 전체 펠트 질감 (아주 약하게)
    soft = cv2.GaussianBlur(TEX, (0, 0), 1.2)
    img = img * (1 + np.where(sand, .02, .008) * soft)[..., None]
    if not clear:   # 탁한 바다: 회색 막
        img = img * .92 + np.array([150, 160, 150]) * .08
    return np.clip(img, 0, 255)

def to_rgba(img): return Image.fromarray(np.dstack([img, np.full((H, W), 255)]).astype(np.uint8), 'RGBA')

def sticker(im, outline=5, shadow=(0, 10, 10, .32)):
    """아래 그림자만 (흰 스티커 테두리 없음)"""
    a = im.getchannel('A')
    pad = outline + 24
    big = Image.new('RGBA', (im.width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    big.alpha_composite(im, (pad, pad))
    A = big.getchannel('A')
    ring = A.filter(ImageFilter.MaxFilter(outline * 2 + 1)) if outline > 0 else A
    sh = Image.new('RGBA', big.size, (20, 50, 52, 0)); sh.putalpha(ring.point(lambda v: int(v * shadow[3])))
    sh = sh.filter(ImageFilter.GaussianBlur(shadow[2]))
    out = Image.new('RGBA', big.size, (0, 0, 0, 0))
    out.alpha_composite(sh, (shadow[0], shadow[1]))
    out.alpha_composite(big)   # 흰 테두리는 그리지 않아요 (사용자 요청)
    return out, pad

def place(canvas, im, cx, cy, w, rot=0, outline=5, shadow=(0, 10, 10, .32)):
    s = w / im.width
    t = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    if rot: t = t.rotate(-rot, expand=True, resample=Image.BICUBIC)
    st, pad = sticker(t, outline, shadow)
    canvas.alpha_composite(st, (round(cx - st.width / 2), round(cy - st.height / 2)))

def felt_shape(mask, color, shade_k=.55, tex_k=.09, light=(-.5, -.7)):
    """마스크 모양의 펠트 덩어리 (둥글게 부푼 음영 + 털 질감 + 보송한 가장자리)"""
    m = cv2.GaussianBlur(mask.astype(np.float32), (0, 0), 1.6)
    dist = cv2.distanceTransform((mask > .5).astype(np.uint8), cv2.DIST_L2, 5)
    hgt = np.sqrt(np.clip(dist / (dist.max() + 1e-6), 0, 1))
    gy, gx = np.gradient(cv2.GaussianBlur(hgt, (0, 0), 6))
    nrm = np.dstack([-gx * 40, -gy * 40, np.ones_like(gx)]); nrm /= np.linalg.norm(nrm, axis=2, keepdims=True)
    L = np.array([light[0], light[1], .6]); L /= np.linalg.norm(L)
    lit = np.clip((nrm * L).sum(2), 0, 1)
    sh = (1 - shade_k) + shade_k * 1.25 * lit
    rgb = np.array(color, np.float32)[None, None] * sh[..., None] * (1 + tex_k * TEX)[..., None]
    fuzz = np.clip((m + (noise(3, 9) - .5) * .5 - .5) * 5 + .5, 0, 1) * (m > .02)
    return Image.fromarray(np.dstack([np.clip(rgb, 0, 255), fuzz * 255]).astype(np.uint8), 'RGBA')

def dome(cx, base, rx, ry):
    u = (xx - cx) / rx; v = (base - yy) / ry
    return ((u * u + v * v) < 1) & (yy < base + 6)

def rock_layer(cx, base, rx, ry, color):
    m = dome(cx, base, rx, ry) | (((xx - cx) / (rx * .55)) ** 2 + ((yy - (base - ry * .55)) / (ry * .7)) ** 2 < 1) & (yy < base)
    return felt_shape(m.astype(np.float32), color, .5, .1)

def moss(cx, base, rx, ry, seed):
    """바위 위 잡조류 · 이끼 (보송한 초록 덩어리 여러 개)"""
    r = np.random.default_rng(seed); m = np.zeros((H, W), np.float32)
    for k in range(70):
        a = r.uniform(.12, .88) * math.pi
        x = cx - math.cos(a) * rx * r.uniform(.2, .98); y = base - math.sin(a) * ry * r.uniform(.75, 1.02)
        rr = r.uniform(9, 18)
        m = np.maximum(m, (((xx - x) ** 2 + (yy - y) ** 2) < rr * rr).astype(np.float32))
    col = felt_shape(m, (118, 142, 64), .45, .14)
    # 실처럼 삐죽한 잡초
    d = ImageDraw.Draw(col)
    for k in range(34):
        a = r.uniform(.15, .85) * math.pi
        x = cx - math.cos(a) * rx * r.uniform(.3, .95); y = base - math.sin(a) * ry * r.uniform(.85, 1.0)
        h = r.uniform(18, 34); lean = r.uniform(-10, 10)
        d.line([(x, y), (x + lean * .5, y - h * .5), (x + lean, y - h)], fill=(96, 128, 52, 255) if k % 2 else (138, 160, 70, 255), width=4, joint='curve')
    return col

def sparkle(canvas, x, y, r):
    d = ImageDraw.Draw(canvas)
    pts = [(x, y - r), (x + r * .25, y - r * .25), (x + r, y), (x + r * .25, y + r * .25), (x, y + r), (x - r * .25, y + r * .25), (x - r, y), (x - r * .25, y - r * .25)]
    d.polygon(pts, fill=(255, 255, 255, 235))

def ghost_net(canvas, poly, gap=34, rope=6):
    """폐그물: 펠트 밧줄로 짠 그물 (그물 안 생물을 덮어요)"""
    mask = Image.new('L', (W, H), 0); ImageDraw.Draw(mask).polygon(poly, fill=255)
    lines = Image.new('L', (W, H), 0); d = ImageDraw.Draw(lines)
    for k in range(-30, 30):
        o = k * gap
        d.line([(o, 0), (o + H, H)], fill=255, width=rope); d.line([(o + H, 0), (o, H)], fill=255, width=rope)
    m = (np.asarray(lines, np.float32) / 255) * (np.asarray(mask.filter(ImageFilter.GaussianBlur(1)), np.float32) / 255)
    rope = felt_shape(m, (74, 88, 80), .35, .18)
    canvas.alpha_composite(rope)
    edge = Image.new('L', (W, H), 0); ImageDraw.Draw(edge).line(poly + [poly[0]], fill=255, width=11, joint='curve')
    canvas.alpha_composite(felt_shape(np.asarray(edge, np.float32) / 255, (88, 100, 90), .35, .16))

def bottle(h, tint=(205, 232, 240)):
    """펠트 페트병"""
    w = int(h * .42); m = np.zeros((h + 10, w + 10), np.float32)
    im = Image.new('L', (w + 10, h + 10), 0); d = ImageDraw.Draw(im)
    d.rounded_rectangle([5, int(h * .22) + 5, w + 5, h + 5], radius=int(w * .38), fill=255)
    d.rounded_rectangle([int(w * .3) + 5, 5, int(w * .7) + 5, int(h * .28) + 5], radius=4, fill=255)
    arr = np.asarray(im, np.float32) / 255
    global H, W, xx, yy, TEX
    H0, W0, xx0, yy0, T0 = H, W, xx, yy, TEX
    H, W = arr.shape; yy, xx = np.mgrid[:H, :W].astype(np.float32); TEX = T0[:H, :W]
    out = felt_shape(arr, tint, .4, .08)
    cap = Image.new('L', (W, H), 0); ImageDraw.Draw(cap).rounded_rectangle([int(w * .3) + 5, 5, int(w * .7) + 5, int(h * .12) + 5], radius=3, fill=255)
    out.alpha_composite(felt_shape(np.asarray(cap, np.float32) / 255, (233, 120, 66), .4, .08))
    H, W, xx, yy, TEX = H0, W0, xx0, yy0, T0
    return out

def load(n): return Image.open(f'{D}/plush-{n}.webp').convert('RGBA')
def scene(clear):
    return to_rgba(background(clear))

def save(im, name):
    im.convert('RGB').save(f'{OUT}/{name}.webp', 'WEBP', quality=80, method=6)

import os; os.makedirs(OUT, exist_ok=True)
fish_col = [(240, 138, 60), (245, 183, 60)]

def ground(canvas, cx, y, rx, k=.34):
    """모래 위에 닿는 그림자"""
    sh = Image.new('L', (W, H), 0); ImageDraw.Draw(sh).ellipse([cx - rx, y - rx * .09, cx + rx, y + rx * .09], fill=int(255 * k))
    c = Image.new('RGBA', (W, H), (40, 60, 50, 0)); c.putalpha(sh.filter(ImageFilter.GaussianBlur(10)))
    canvas.alpha_composite(c)

def sit(canvas, im, cx, bottom, w, rot=0, shadow=True):
    """그림 아랫끝을 bottom 에 맞춰 앉혀요"""
    h = im.height * w / im.width
    if shadow: ground(canvas, cx, bottom - 4, w * .46)
    place(canvas, im, cx, bottom - h / 2, w, rot, 2, (0, 6, 8, .22))

# ── 01 갯닦기: 이끼 덮인 슬픈 바위 → 깨끗해져 웃는 바위 + 미역 · 성게 ──
b = scene(False)
sit(b, load('rock-moss'), 300, 452, 500)
save(b, 'gaet-before')
a = scene(True)
sit(a, load('rock'), 300, 452, 500)
place(a, load('miyeok'), 240, 158, 115, -8, 0)      # 깨끗해진 바위 위에 미역이 붙어 자라요 (얼굴이 가리지 않게 바위 앞)
place(a, load('miyeok'), 458, 240, 125, 12, 0)
sit(a, load('seongge'), 650, 458, 124)
for x, y, r in ((640, 110, 14), (720, 200, 9), (150, 130, 10)): sparkle(a, x, y, r)
save(a, 'gaet-after')

# ── 02 금채: 쉬는 바다 → 다시 자란 미역 · 조개 가족 · 뿔소라 ──
rock2 = (300, 446, 400)
b = scene(False)
place(b, load('miyeok'), 300, 250, 44, -6, 0)
sit(b, load('rock'), *rock2)
save(b, 'rest-before')
a = scene(True)
sit(a, load('rock'), *rock2)
place(a, load('miyeok'), 270, 180, 140, -6, 0)
place(a, load('miyeok'), 432, 246, 150, 12, 0)
sit(a, load('clams'), 640, 466, 270)
sit(a, load('sora'), 92, 466, 120, 8)
for x, y, r in ((650, 110, 13), (540, 170, 8)): sparkle(a, x, y, r)
save(a, 'rest-after')

# ── 03 바다 쓰레기 수거: 폐그물에 걸린 바다거북 → 풀려난 거북 + 쓰레기를 담은 망사리 ──
b = scene(False)
place(b, load('turtle'), 225, 290, 360, 6, 0, (0, 8, 10, .25))
ghost_net(b, [(30, 160), (210, 112), (395, 150), (400, 330), (360, 445), (120, 455), (25, 390)], 46, 5)
place(b, bottle(90), 330, 425, 40, 72, 0, (0, 6, 6, .25))
save(b, 'net-before')
a = scene(True)
place(a, load('turtle'), 400, 215, 360, -8, 0, (0, 14, 14, .22))
place(a, load('mangsari'), 660, 330, 190, 0, 0)
place(a, bottle(80), 640, 300, 34, -14, 0, (0, 4, 4, .2))
for x, y, r in ((170, 120, 13), (130, 330, 9), (720, 110, 9)): sparkle(a, x, y, r)
save(a, 'net-after')
print('ok')
