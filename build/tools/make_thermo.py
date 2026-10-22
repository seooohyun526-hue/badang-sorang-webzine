# '응원 온도' 창 그림 (사용자가 만든 온도계 해녀 장면) — 관 속 빨간 눈금만 지워 빈 유리관으로 만들어요
#  · 빈 관은 빨간 눈금 바로 위 유리 부분의 가로 무늬를 아래로 이어 칠해요 (흰 반사 띠 포함)
#  · 아래 둥근 구슬(빨강)은 그대로 — 실제 눈금(수은)은 웹진이 CSS 로 그 위에 올려요 (ocean_pop.css 의 .chr-merc)
#  · 관 안쪽 자리를 퍼센트로 출력해요 → ocean_pop.css 의 .chr-merc / .chr-scene 숫자를 이 값으로 맞춰요
#  사용법: python make_thermo.py <원본 그림> <저장 폴더> [64|58]
#    64 = 엎드려 턱 괸 해녀 + 가로로 긴 장면 (2026-10-22, 지금 쓰는 그림) · 58 = 예전 세로 장면
import sys, json, numpy as np, cv2
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]; KIND = sys.argv[3] if len(sys.argv) > 3 else '64'
P = {  # 관 안쪽 x 범위(조금 넉넉히) · 유리 무늬를 가져올 줄 · 칠하기 시작할 줄 · 구슬 위 · 관 위 · 관 안쪽 실제 x · 폭
    '64': dict(X0=812, X1=884, PROF=(466, 476), START=480, BULB=838, TOP=410, IX=815, IW=65),
    '58': dict(X0=660, X1=731, PROF=(582, 590), START=596, BULB=968, TOP=505, IX=663, IW=64),
}[KIND]
im = Image.open(SRC).convert('RGB'); a = np.asarray(im).astype(np.float32).copy(); H, W = a.shape[:2]
X0, X1, S, B = P['X0'], P['X1'], P['START'], P['BULB']
prof = a[P['PROF'][0]:P['PROF'][1], X0:X1].mean(0)     # 빈 유리 한 줄 (가로 무늬)
for y in range(S, B + 4):
    k = .9 + .1 * (1 - (y - S) / (B - S))               # 아래로 갈수록 아주 살짝 진하게 (유리 그늘)
    a[y, X0:X1] = prof * k
band = a[S - 6:S + 8, X0 - 2:X1 + 2].copy(); a[S - 6:S + 8, X0 - 2:X1 + 2] = cv2.GaussianBlur(band, (0, 0), 1.6)
out = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))
s = 720 / W; out = out.resize((720, round(H * s)), Image.LANCZOS)
out.save(OUT + '/cheer-thermo.webp', 'WEBP', quality=86, method=6)
print(json.dumps({'w': out.width, 'h': out.height, 'left': round(P['IX'] / W * 100, 3), 'width': round(P['IW'] / W * 100, 3),
                  'top': round(P['TOP'] / H * 100, 3), 'bulb': round(B / H * 100, 3), 'span': round((B - P['TOP']) / H * 100, 3)}))
