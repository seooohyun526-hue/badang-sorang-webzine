# 전복 이미지가 없어서, 다른 털실 인형과 어울리게 '펠트 전복'을 그려요 (문어 인형의 털 질감을 빌려 씀)
import sys, numpy as np, cv2
from PIL import Image

D = sys.argv[1]
S = 2                                  # 두 배로 그린 뒤 줄여서 가장자리를 매끄럽게
W, H = 640 * S, 480 * S
yy, xx = np.mgrid[:H, :W].astype(np.float32)
rng = np.random.default_rng(7)

# ── 털 질감: 문어 머리 부분의 밝기 무늬(고주파)만 가져와 거울 반복 ──
mu = np.asarray(Image.open(f'{D}/plush-muneo.webp').convert('RGBA')).astype(np.float32)
patch = mu[40:200, 250:420, :3].mean(2)
hp = patch - cv2.GaussianBlur(patch, (0, 0), 6)
hp /= hp.std() + 1e-6
tile = np.block([[hp, hp[:, ::-1]], [hp[::-1], hp[::-1, ::-1]]])
tile = cv2.resize(tile, (tile.shape[1] * S, tile.shape[0] * S), interpolation=cv2.INTER_CUBIC)
reps = (H // tile.shape[0] + 2, W // tile.shape[1] + 2)
tex = np.tile(tile, reps)[:H, :W]

def noise(scale, seed):
    r = np.random.default_rng(seed).random((H // scale + 2, W // scale + 2)).astype(np.float32)
    return cv2.resize(r, (W + scale * 2, H + scale * 2), interpolation=cv2.INTER_CUBIC)[:H, :W]

def ell(cx, cy, rx, ry, rot=0):
    c, s = np.cos(np.radians(rot)), np.sin(np.radians(rot))
    dx, dy = xx - cx * S, yy - cy * S
    u = (dx * c + dy * s) / (rx * S); v = (-dx * s + dy * c) / (ry * S)
    return u, v, u * u + v * v

def fuzzy(m, amt=0.32, blur=1.5):
    a = cv2.GaussianBlur(m.astype(np.float32), (0, 0), blur * S)
    a = a + (noise(3, 11) - 0.5) * amt
    return np.clip((a - 0.5) * 6 + 0.5, 0, 1)

L = np.array([-0.45, -0.62, 0.64]); L /= np.linalg.norm(L)
def shade(u, v, r2, k=0.55):
    h = np.sqrt(np.clip(1 - r2, 0, 1))
    n = np.dstack([u * 0.8, v * 0.8, h]); n /= np.linalg.norm(n, axis=2, keepdims=True) + 1e-6
    d = np.clip((n * L).sum(2), 0, 1)
    return (1 - k) + k * 1.25 * d

img = np.zeros((H, W, 3), np.float32); alpha = np.zeros((H, W), np.float32)
def put(mask_a, rgb):
    global img, alpha
    a = mask_a[..., None]
    img = img * (1 - a) + rgb * a
    alpha = alpha + mask_a * (1 - alpha)

# 1) 아래에서 빼꼼 나온 몸 (뿔소라 인형처럼 황갈색 펠트 + 얼굴)
u, v, r2 = ell(322, 318, 232, 92)
body = fuzzy(r2 < 1)
col = np.array([214, 150, 92], np.float32) / 255
rgb = col[None, None] * shade(u, v, r2, .5)[..., None]
put(body, rgb)
# 몸 가장자리의 작은 돌기 (전복 발 둘레의 촉수)
for k in range(13):
    t = np.radians(200 - k * 17.5)
    bx, by = 322 + 222 * np.cos(t) * -1, 318 + 70 * abs(np.sin(t)) + 8
    uu, vv, rr2 = ell(bx, by, 13, 11)
    put(fuzzy(rr2 < 1, .25, 1.0), (np.array([196, 132, 80], np.float32) / 255)[None, None] * shade(uu, vv, rr2, .55)[..., None])
# 2) 껍데기 안쪽 크림색 테두리 (입술)
u2, v2, r22 = ell(332, 186, 266, 128, -6)
lip = fuzzy(r22 < 1)
nac = np.dstack([0.93 + 0.04 * np.sin(xx / S / 40), 0.88 + 0.03 * np.sin(xx / S / 33 + 1), 0.86 + 0.06 * np.sin(xx / S / 47 + 2)])
put(lip, nac * shade(u2, v2, r22, .3)[..., None])
# 3) 껍데기 (올리브 갈색 + 분홍 · 초록 얼룩, 위에서 비치는 빛)
u3, v3, r23 = ell(336, 176, 260, 120, -6)
shell = fuzzy(r23 < 1)
base = np.array([150, 132, 102], np.float32) / 255
pink = np.array([170, 128, 142], np.float32) / 255
green = np.array([124, 138, 104], np.float32) / 255
n1, n2 = noise(36, 3), noise(28, 5)
c = base[None, None] * np.ones((H, W, 1), np.float32)
c = c * (1 - (np.clip(n1 - .55, 0, 1) * 2.2)[..., None]) + pink * (np.clip(n1 - .55, 0, 1) * 2.2)[..., None]
c = c * (1 - (np.clip(n2 - .6, 0, 1) * 2)[..., None]) + green * (np.clip(n2 - .6, 0, 1) * 2)[..., None]
# 성장선 (오른쪽 뒤 꼭지에서 퍼지는 고리)
ax, ay = 500 * S, 140 * S
rr = np.sqrt(((xx - ax) / 1.25) ** 2 + (yy - ay) ** 2) / S
ring = 0.5 + 0.5 * np.cos(rr / 30 * 2 * np.pi)
c = c * (1 - 0.16 * (ring ** 6)[..., None])
c = c * shade(u3, v3, r23, .62)[..., None]
spec = np.exp(-(((u3 + .38) ** 2) / .07 + ((v3 + .5) ** 2) / .05)) * .26
c = c + spec[..., None]
put(shell, c)
# 4) 숨구멍 줄 (왼쪽 위 가장자리를 따라, 앞에서 뒤로 작아짐)
pores = [(126, 170, 15), (152, 136, 14), (188, 110, 13), (230, 92, 12), (276, 80, 11), (322, 74, 10)]
for (px, py, pr) in pores:
    uu, vv, rr2 = ell(px, py, pr * 1.25, pr)
    put(fuzzy(rr2 < 1, .35, .9) * shell, (np.array([176, 160, 128], np.float32) / 255)[None, None] * shade(uu, vv, rr2, .5)[..., None])
    uu, vv, rr2 = ell(px + 1, py + 1, pr * .62, pr * .5)
    put(fuzzy(rr2 < 1, .25, .7) * shell, np.array([46, 38, 32], np.float32)[None, None] / 255)
# 5) 얼굴 (구슬 눈 + 반짝임 + 웃는 입)
for ex in (282, 356):
    uu, vv, rr2 = ell(ex, 346, 10.5, 11)
    put(np.clip((1 - rr2) * 8, 0, 1), np.array([18, 16, 18], np.float32)[None, None] / 255)
    uu, vv, rr2 = ell(ex - 3.5, 342, 3, 3)
    put(np.clip((1 - rr2) * 4, 0, 1) * .9, np.ones(3, np.float32)[None, None])
smile = np.zeros((H, W), np.uint8)
cv2.ellipse(smile, (319 * S, 354 * S), (19 * S, 12 * S), 0, 25, 155, 255, int(3.2 * S), cv2.LINE_AA)
put(smile.astype(np.float32) / 255, np.array([22, 18, 18], np.float32)[None, None] / 255)
# 볼 터치
for ex in (256, 382):
    uu, vv, rr2 = ell(ex, 364, 16, 9)
    put(np.clip(1 - rr2, 0, 1) * .25, np.array([226, 120, 110], np.float32)[None, None] / 255)

# 털 질감을 밝기에 곱하고, 가장자리는 살짝 어둡게
inside = cv2.GaussianBlur((alpha > .5).astype(np.float32), (0, 0), 10 * S)
img = img * (1 + 0.085 * tex)[..., None] * (0.82 + 0.18 * np.clip(inside * 1.6, 0, 1))[..., None]
img = np.clip(img, 0, 1)
out = np.dstack([img * 255, alpha * 255]).astype(np.uint8)
im = Image.fromarray(out, 'RGBA').resize((640, 480), Image.LANCZOS)
bb = im.getchannel('A').point(lambda p: 255 if p > 8 else 0).getbbox()
im = im.crop((bb[0] - 4, bb[1] - 4, bb[2] + 4, bb[3] + 4))
im.save(f'{D}/plush-jeonbok.webp', 'WEBP', quality=86, method=6)
print('jeonbok', im.size)
