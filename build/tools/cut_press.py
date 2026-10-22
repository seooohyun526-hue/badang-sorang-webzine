# 해양정화 안내 팝업 캐릭터 (사용자가 만든 '버튼 누르는 해녀' 그림 그대로)
#  · 흰 배경을 지우고, 손 밑의 파란 알약(예시 버튼)도 지워요 → 그 자리에 실제 '그냥 나가기' 버튼이 와요
#  · 파란 알약이 있던 자리(가로 · 위쪽 끝)를 함께 적어 둬요 (팝업에서 버튼과 손 위치를 맞추는 데 써요)
import sys, json, numpy as np, cv2
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
rgb = np.asarray(Image.open(SRC).convert('RGB')).copy(); a = rgb.astype(int); h, w = a.shape[:2]
hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
# 파란 알약: 파랑 ~ 보라(알약 왼쪽은 보랏빛) + 진한 채도
blue = (hsv[..., 0] >= 95) & (hsv[..., 0] <= 158) & (hsv[..., 1] > 90) & (hsv[..., 2] > 90)
n, lab, st, _ = cv2.connectedComponentsWithStats(blue.astype(np.uint8), 8)
k = 1 + int(np.argmax(st[1:, 4])); pill = lab == k
pill = cv2.morphologyEx(pill.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((9, 9), np.uint8)).astype(bool)
ys, xs = np.where(pill); pbox = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]
# 흰 배경: 가장자리와 이어진 밝고 채도 낮은 곳 (알약 밑 옅은 그림자 포함)
cand = ((a.max(2) - a.min(2)) <= 18) & (a.min(2) >= 214)
n, lab, st, _ = cv2.connectedComponentsWithStats(cand.astype(np.uint8), 4); bg = np.zeros((h, w), bool)
for i in range(1, n):
    x, y, ww, hh, area = st[i]
    if x == 0 or y == 0 or x + ww >= w or y + hh >= h: bg |= lab == i
# 알약 테두리의 밝은 반사 띠도 함께 (알약 상자 안의 파랑 근처 밝은 것)
near = cv2.dilate(pill.astype(np.uint8), np.ones((15, 15), np.uint8)).astype(bool)
pill_all = pill | (near & (hsv[..., 1] < 70) & (a.min(2) > 170))
fg = ~bg & ~pill_all
n, lab, st, _ = cv2.connectedComponentsWithStats(fg.astype(np.uint8), 8); big = st[1:, 4].max(); keep = np.zeros((h, w), bool)
for i in range(1, n):
    if st[i, 4] > big * .0004: keep |= lab == i          # 노란 '꾹' 선 같은 작은 장식도 남겨요
keep = cv2.erode(keep.astype(np.uint8), np.ones((3, 3), np.uint8))
alpha = np.clip((cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 1.0) - .15) / .7, 0, 1)
rgba = np.dstack([rgb, (alpha * 255).astype(np.uint8)])
yy, xx = np.where(alpha > .02); p = 4
x0, y0, x1, y1 = max(0, xx.min() - p), max(0, yy.min() - p), min(w, xx.max() + p), min(h, yy.max() + p)
im = Image.fromarray(rgba[y0:y1, x0:x1], 'RGBA'); W0, H0 = im.size
s = 560 / max(im.size); im = im.resize((round(W0 * s), round(H0 * s)), Image.LANCZOS)
im.save(OUT + '/ocean-press.webp', 'WEBP', quality=88, method=6)
meta = {'w': im.width, 'h': im.height,
        'pillLeft': round((pbox[0] - x0) / W0, 4), 'pillRight': round((pbox[2] - x0) / W0, 4), 'pillTop': round((pbox[1] - y0) / H0, 4)}
print(json.dumps(meta))
