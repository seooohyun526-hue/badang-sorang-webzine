# 오른쪽 미니 팝업 캐릭터 (사용자가 만든 이미지 그대로) — 배경만 지우고 빈 여백만 잘라요. 그림 · 비율은 그대로예요
#  1번 게임 팝업: 바둑판 무늬(가짜 투명) 배경이 그림에 박혀 있어요 → 가장자리와 이어진 회색 · 흰 칸만 지워요
#  2번 후원(응원) 팝업: → cut_support.py (하트를 든 해녀 + 사랑의 온도계)
import sys, numpy as np, cv2
from PIL import Image
IMG, OUT = sys.argv[1], sys.argv[2]

def save(rgb, fg, name, maxd=480):
    fg = fg.astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg, 8)
    big = st[1:, 4].max(); keep = np.zeros(fg.shape, bool)
    for k in range(1, n):
        if st[k, 4] > big * .0004: keep |= lab == k       # 반짝이 · 신난 선 같은 작은 장식도 남겨요
    keep = cv2.erode(keep.astype(np.uint8), np.ones((3, 3), np.uint8))
    alpha = np.clip((cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 1.0) - .15) / .7, 0, 1)
    rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
    ys, xs = np.where(alpha > .02); p = 4
    rgba = rgba[max(0, ys.min() - p):ys.max() + p, max(0, xs.min() - p):xs.max() + p]
    im = Image.fromarray(rgba, 'RGBA'); s = maxd / max(im.size)
    if s < 1: im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    im.save(f'{OUT}/{name}.webp', 'WEBP', quality=88, method=6); print(name, im.size)

# 1번: 게임
rgb = np.asarray(Image.open(f'{IMG}/49.webp').convert('RGB')).copy(); a = rgb.astype(int)
cand = ((a.max(2) - a.min(2)) <= 10) & (a.min(2) >= 222)
n, lab, st, _ = cv2.connectedComponentsWithStats(cand.astype(np.uint8), 4)
h, w = cand.shape; bg = np.zeros(cand.shape, bool)
for k in range(1, n):
    x, y, ww, hh, area = st[k]
    if x == 0 or y == 0 or x + ww >= w or y + hh >= h: bg |= lab == k
# 바둑판 칸 사이 경계(살짝 어두운 선)도 배경이니, 배경으로 둘러싸인 가는 틈을 메워요
bg = cv2.morphologyEx(bg.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool)
save(rgb, ~bg, 'float-game')
# 2번: 후원(응원) 캐릭터는 cut_support.py 가 만들어요 (말풍선 대신 '사랑의 온도계'를 그려 넣어요)
