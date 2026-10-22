# 첨부한 털실 인형 이미지의 배경을 지워 투명 webp 로 만들어요
import sys, numpy as np, cv2
from PIL import Image

IMG = sys.argv[1]; OUT = sys.argv[2]
names = {21: 'mangsari', 22: 'seongge', 23: 'sora', 24: 'muneo', 25: 'miyeok'}

def checker_mask(a):
    mx, mn = a.max(2), a.min(2)
    cand = ((mx - mn) <= 9) & (mn >= 220)
    n, lab, st, _ = cv2.connectedComponentsWithStats(cand.astype(np.uint8), 4)
    bg = np.zeros(cand.shape, bool)
    h, w = cand.shape
    for k in range(1, n):
        x, y, ww, hh, area = st[k]
        edge = x == 0 or y == 0 or x + ww >= w or y + hh >= h
        if edge or area > 120:            # 바깥 바탕 + 그물 구멍 사이로 보이는 바탕
            bg |= lab == k
    return ~bg

def finish(rgb, fg, name, maxd=640):
    fg = fg.astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    # 가장 큰 덩어리와 그에 붙은 것만
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
    keep = np.zeros_like(fg)
    big = st[1:, 4].max()
    for k in range(1, n):
        if st[k, 4] > big * 0.02: keep[lab == k] = 1
    keep = cv2.erode(keep, np.ones((3, 3), np.uint8))
    alpha = cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 1.1)
    alpha = np.clip((alpha - 0.15) / 0.7, 0, 1)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    ys, xs = np.where(alpha > 0.02)
    pad = 6
    rgba = rgba[max(0, ys.min() - pad):ys.max() + pad, max(0, xs.min() - pad):xs.max() + pad]
    im = Image.fromarray(rgba, 'RGBA')
    s = maxd / max(im.size)
    if s < 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(f'{OUT}/plush-{name}.webp', 'WEBP', quality=84, method=6)
    print(name, im.size)

for i, name in names.items():
    im = Image.open(f'{IMG}/{i}.webp')
    if i == 23:
        a = np.asarray(im.convert('RGBA'))
        finish(a[..., :3].copy(), a[..., 3] > 100, name)
        continue
    rgb = np.asarray(im.convert('RGB')).copy()
    if i == 22:
        h, w = rgb.shape[:2]
        mask = np.full((h, w), cv2.GC_BGD, np.uint8)
        mask[380:1045, 255:1000] = cv2.GC_PR_BGD
        yy, xx = np.mgrid[:h, :w]
        body = ((xx - 630) / 330.0) ** 2 + ((yy - 700) / 300.0) ** 2 < 1
        mask[body] = cv2.GC_PR_FGD
        core = ((xx - 640) / 250.0) ** 2 + ((yy - 720) / 230.0) ** 2 < 1
        mask[core] = cv2.GC_FGD
        hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
        blue = (hsv[..., 0] > 85) & (hsv[..., 0] < 130) & (hsv[..., 1] > 60)
        mask[blue & ~core] = cv2.GC_BGD
        bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        bm, fm = np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64)
        cv2.grabCut(bgr, mask, None, bm, fm, 8, cv2.GC_INIT_WITH_MASK)
        fg = (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD)
        # 발 아래 바위 조각 지우기 (바위는 회색 = 채도가 낮음, 발은 자주색)
        low = np.zeros_like(fg); low[930:, :] = True
        fg &= ~(low & (hsv[..., 1] < 62))
        fg = cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)).astype(bool)
        finish(rgb, fg, name)
        continue
    finish(rgb, checker_mask(rgb.astype(int)), name)
