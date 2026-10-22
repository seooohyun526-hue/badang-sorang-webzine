# 오른쪽 미니 팝업(아래) '바당 소랑 응원하기' 캐릭터 — 사용자가 만든 '하트를 든 해녀 + 사랑의 온도계' 그림(62.webp) 그대로
#  · 그림에 박힌 바둑판(가짜 투명) 배경만 지우고, 여백을 잘라 긴 변 480px 로 저장해요 (media/float-support.webp)
#  · 온도계 테두리가 크림색이라, 바둑판은 '완전한 회색'(채널 차이 4 이하) · 가장자리와 이어진 칸만 배경으로 봐요
#  (예전: 57.webp 의 말풍선을 지우고 온도계를 코드로 그려 넣었는데, 사용자가 직접 만든 이 그림으로 바꿨어요)
import sys, numpy as np, cv2
from PIL import Image
IMG, OUT = sys.argv[1], sys.argv[2]
rgb = np.asarray(Image.open(f'{IMG}/62.webp').convert('RGB')).copy(); a = rgb.astype(int); H, W = a.shape[:2]
cand = ((a.max(2) - a.min(2)) <= 4) & (a.min(2) >= 222)
n, lab, st, _ = cv2.connectedComponentsWithStats(cand.astype(np.uint8), 4); bg = np.zeros((H, W), bool)
for k in range(1, n):
    x, y, ww, hh, area = st[k]
    if x == 0 or y == 0 or x + ww >= W or y + hh >= H: bg |= lab == k
bg = cv2.morphologyEx(bg.astype(np.uint8), cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8)).astype(bool)
n, lab, st, _ = cv2.connectedComponentsWithStats((~bg).astype(np.uint8), 8); big = st[1:, 4].max(); keep = np.zeros((H, W), bool)
for k in range(1, n):
    if st[k, 4] > big * .0004: keep |= lab == k        # 하트 · 반짝이 · 신난 선 같은 작은 장식도 남겨요
keep = cv2.erode(keep.astype(np.uint8), np.ones((3, 3), np.uint8))
alpha = np.clip((cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 1.0) - .15) / .7, 0, 1)
out = Image.fromarray(np.dstack([rgb, (alpha * 255).astype(np.uint8)]), 'RGBA')
ys, xs = np.where(alpha > .02); p = 4
out = out.crop((max(0, xs.min() - p), max(0, ys.min() - p), min(W, xs.max() + p), min(H, ys.max() + p)))
s = 480 / max(out.size)
if s < 1: out = out.resize((round(out.width * s), round(out.height * s)), Image.LANCZOS)
out.save(f'{OUT}/float-support.webp', 'WEBP', quality=88, method=6); print('float-support', out.size)
