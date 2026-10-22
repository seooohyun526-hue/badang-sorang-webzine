# 새로 받은 털실 인형(슬픈 이끼 바위 · 웃는 바위 · 바다거북 · 조개 가족)의 배경 · 흰 번짐을 지워 투명 webp 로 만들어요
import sys, numpy as np, cv2
from PIL import Image
IMG, OUT = sys.argv[1], sys.argv[2]

def keep_big(fg, frac=.02):
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg.astype(np.uint8), 8)
    big = st[1:, 4].max(); out = np.zeros(fg.shape, bool)
    for k in range(1, n):
        if st[k, 4] > big * frac: out |= lab == k
    return out

def fill_holes(fg):
    h, w = fg.shape; m = (~fg).astype(np.uint8) * 255
    ff = m.copy(); cv2.floodFill(ff, np.zeros((h + 2, w + 2), np.uint8), (0, 0), 0)
    return fg | (ff > 0)

def finish(rgb, fg, name, maxd=720):
    fg = keep_big(cv2.morphologyEx(fg.astype(np.uint8), cv2.MORPH_OPEN, np.ones((5, 5), np.uint8)) > 0)
    fg = fill_holes(fg)
    fg = cv2.erode(fg.astype(np.uint8), np.ones((3, 3), np.uint8))
    alpha = np.clip((cv2.GaussianBlur(fg.astype(np.float32), (0, 0), 1.1) - .15) / .7, 0, 1)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    ys, xs = np.where(alpha > .02); p = 6
    rgba = rgba[max(0, ys.min() - p):ys.max() + p, max(0, xs.min() - p):xs.max() + p]
    im = Image.fromarray(rgba, 'RGBA'); s = maxd / max(im.size)
    if s < 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(f'{OUT}/plush-{name}.webp', 'WEBP', quality=86, method=6); print(name, im.size)

# 42 슬픈 이끼 바위: 바둑판 무늬(밝은 회색 · 흰색) 바탕
rgb = np.asarray(Image.open(f'{IMG}/42.webp').convert('RGB')).copy(); a = rgb.astype(int)
bg = ((a.max(2) - a.min(2)) <= 14) & (a.min(2) >= 200)
finish(rgb, ~bg, 'rock-moss')
# 43~45: 이미 투명하지만 둘레에 흰 번짐이 있어요 → 거의 불투명한 곳만
for n, name, th in ((43, 'rock', 200), (44, 'turtle', 235), (45, 'clams', 235)):
    im = np.asarray(Image.open(f'{IMG}/{n}.webp').convert('RGBA'))
    finish(im[..., :3].copy(), im[..., 3] > th, name)
