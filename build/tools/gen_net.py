# 망사리 입구를 넓게 연 그림을 만들고,  (지금 쓰는 값: python gen_net.py plush 1 1.35 1.8 0 0.9 4)
# 뒤쪽(뒷벽 · 테왁)과 앞쪽(앞벽 · 앞 테두리) 두 장으로 나눠요
#  · 망사리 몸통만 옆으로 넓히고(입구가 넓어짐), 입구 높이 구간을 위아래로 늘려(입구가 더 열려 보임) 테왁 공은 모양 그대로 다시 붙여요
#  · 앞쪽 그림의 그물 구멍(어두운 안쪽)은 반쯤 비치게 해서, 안에 담긴 해산물 아랫부분이 그물 사이로 보여요
import sys, json, numpy as np, cv2
from PIL import Image

D = sys.argv[1]
SX = float(sys.argv[4]) if len(sys.argv) > 4 else 1.3     # 옆으로 넓히기
SY = float(sys.argv[3]) if len(sys.argv) > 3 else 1.6     # 입구 구간 세로로 늘리기
CX = 265                    # 입구 가운데 (원본 x)
Y0, Y1 = 150, 350           # 세로로 늘릴 구간 (뒤 테두리 위 ~ 앞 테두리 아래)
src = np.asarray(Image.open(f'{D}/plush-mangsari.webp').convert('RGBA')).astype(np.float32)
h, w = src.shape[:2]
# 테왁 공(+줄 윗부분)은 따로 떼어 둬요
yy, xx = np.mgrid[:h, :w]
ballm = (xx > 400) & (yy < 215)
ball = src.copy(); ball[~ballm] = 0
body = src.copy(); body[ballm] = 0

def fy(y):   # 원본 y → 새 y
    y = np.asarray(y, np.float32)
    return np.where(y < Y0, y, np.where(y <= Y1, Y0 + (y - Y0) * SY, Y0 + (Y1 - Y0) * SY + (y - Y1)))
def fyi(Y):  # 새 y → 원본 y
    Y = np.asarray(Y, np.float32); T = Y0 + (Y1 - Y0) * SY
    return np.where(Y < Y0, Y, np.where(Y <= T, Y0 + (Y - Y0) / SY, Y1 + (Y - T)))
# 가로: 입구 구간(원본 x 92~446)은 SX 배, 바깥 옆벽은 SXS 배로 늘려요 → 망사리 크기에 비해 입구가 넓어져요
SXS = float(sys.argv[6]) if len(sys.argv) > 6 else SX
XA, XB = 92.0, 446.0
kx = [0.0, XA, XB, float(w)]
kX = [0.0, XA * SXS, XA * SXS + (XB - XA) * SX, XA * SXS + (XB - XA) * SX + (w - XB) * SXS]
OX = 4
W2 = int(np.ceil(kX[-1])) + 8
H2 = int(np.ceil(fy(h))) + 2
fx = lambda x: OX + np.interp(np.asarray(x, np.float32), kx, kX, left=-1e4, right=1e4)
Y, X = np.mgrid[:H2, :W2].astype(np.float32)
mx = np.interp(X - OX, kX, kx, left=-10, right=w + 10).astype(np.float32); my = fyi(Y).astype(np.float32)
out = cv2.remap(body, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
# 공을 줄 끝(원본 465, 215)에 맞춰 다시 붙이기 (모양 그대로)
dx, dy = int(round(fx(465) - 465)), int(round(float(fy(215)) - 215))
canvas = np.zeros_like(out)
bh, bw = ball.shape[:2]
x0, y0 = max(0, dx), max(0, dy)
canvas[y0:y0 + bh, x0:x0 + bw] = ball[:min(bh, H2 - y0), :min(bw, W2 - x0)]
a = canvas[..., 3:4] / 255
out = out * (1 - a) + canvas * a
out[..., 3] = np.maximum(out[..., 3], canvas[..., 3])
out = np.clip(out, 0, 255)

# 앞쪽 부분: 앞 테두리 줄의 위쪽 가장자리 아래 (원본에서 잰 점을 같은 방식으로 옮겨요)
front = [(0, 205), (92, 212), (104, 240), (130, 268), (170, 292), (220, 307), (280, 314), (340, 310), (390, 293), (425, 272), (446, 248), (462, 226)]
pts = [(float(fx(x)), float(fy(y))) for x, y in front]

# ★ 앞 테두리를 평평하고 낮게: 입구 안쪽(뒷벽)은 아래로 늘리고, 앞 테두리 · 앞벽은 아래로 내려요 (양 끝은 그대로)
#   → 해산물이 입구 안쪽 깊이 앉아도 앞 테두리가 몸을 가로지르지 않아요
K = float(sys.argv[2]) if len(sys.argv) > 2 else 0.8
back = [(100, 215), (130, 192), (180, 178), (240, 174), (300, 177), (360, 187), (410, 205), (440, 230)]   # 뒤 테두리 안쪽 가장자리 (원본)
bp = [(float(fx(x)), float(fy(y))) for x, y in back]
xs = np.arange(W2, dtype=np.float32)
rimF = np.interp(xs, [p[0] for p in pts[1:]], [p[1] for p in pts[1:]], left=np.nan, right=np.nan)
rimB = np.interp(xs, [p[0] for p in bp], [p[1] for p in bp], left=np.nan, right=np.nan)
xl, xr = pts[1][0], pts[-2][0]
low = np.nanmax(rimF)
WS = float(sys.argv[7]) if len(sys.argv) > 7 else 1.6     # 클수록 양 끝 가까이까지 평평
win = np.clip(np.sin(np.clip((xs - xl) / (xr - xl), 0, 1) * np.pi) * WS, 0, 1)
EXTRA = float(sys.argv[5]) if len(sys.argv) > 5 else 22
d = np.nan_to_num((low - rimF) * K * win + EXTRA * win)      # 가운데도 조금 더 낮게
d[np.isnan(rimF)] = 0
Ys = np.where(np.isnan(rimB) | np.isnan(rimF), 0, rimF - 0.55 * (rimF - np.nan_to_num(rimB)))
Ys = np.maximum(Ys, 0)
OFF = 12                                                  # 늘리는 경계를 앞 테두리 줄보다 조금 위로 (줄이 늘어나 번지지 않게)
rimF0 = np.nan_to_num(rimF - OFF, nan=H2)
T = rimF0 + d
Yo = np.arange(H2, dtype=np.float32)[:, None]
a_ = d / np.maximum(H2 - rimF0, 1)
src_y = np.where(Yo < Ys, Yo,
         np.where(Yo < T, Ys + (Yo - Ys) * (rimF0 - Ys) / np.maximum(T - Ys, 1),
                  (Yo - d - a_ * rimF0) / np.maximum(1 - a_, 1e-3)))
src_x = np.broadcast_to(xs[None, :], (H2, W2)).astype(np.float32)
out = cv2.remap(out.astype(np.float32), src_x, src_y.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
out = np.clip(out, 0, 255)
pts = [(x, y - 4 + float(np.interp(x, xs, d))) for x, y in pts]   # 앞쪽 그림은 앞 테두리 줄 윗가장자리부터
poly = [(-10, pts[0][1])] + pts + [(W2 + 10, pts[-1][1]), (W2 + 10, H2 + 10), (-10, H2 + 10)]
m = np.zeros((H2, W2), np.uint8)
cv2.fillPoly(m, [np.array(poly, np.int32)], 255)
m = cv2.GaussianBlur(m.astype(np.float32), (0, 0), 0.8) / 255
fr = out.copy()
# 그물 구멍(어두운 안쪽)은 반쯤 비치게: 밝기 70 이하 → 불투명도 45%, 120 이상 → 그대로
v = out[..., :3].max(2)
see = np.clip((v - 70) / 50, 0, 1) * 0.55 + 0.45
# 앞 테두리 줄(크림색)은 늘 불투명
cream = (out[..., 0] > 200) & (out[..., 1] > 190) & (out[..., 2] > 170)
see[cream] = 1
fr[..., 3] = out[..., 3] * m * see
Image.fromarray(out.astype(np.uint8), 'RGBA').save(f'{D}/plush-net.webp', 'WEBP', quality=86, method=6)
Image.fromarray(fr.astype(np.uint8), 'RGBA').save(f'{D}/plush-netfront.webp', 'WEBP', quality=86, method=6)
info = {'w': W2, 'h': H2, 'rimFront': [round(p[1] / H2, 3) for p in pts[1:]], 'rimX': [round(p[0] / W2, 3) for p in pts[1:]]}
print(json.dumps(info))
