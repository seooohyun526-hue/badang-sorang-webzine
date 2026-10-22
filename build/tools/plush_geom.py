# 털실 인형 이미지마다 '눌리는 자리'(윤곽선 다각형, % 단위)를 만들어 JS 로 내보내요
import sys, json, base64, numpy as np, cv2
from PIL import Image

D = sys.argv[1]; OUT = sys.argv[2]
names = ['net', 'netfront', 'seongge', 'sora', 'muneo', 'miyeok']
art = {}
for n in names:
    p = f'{D}/plush-{n}.webp'
    im = Image.open(p); w, h = im.size
    a = (np.asarray(im.getchannel('A')) > 60).astype(np.uint8)
    a = cv2.dilate(a, np.ones((7, 7), np.uint8))
    cs, _ = cv2.findContours(a, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cs, key=cv2.contourArea)
    c = cv2.approxPolyDP(c, 0.006 * max(w, h), True)[:, 0, :]
    poly = 'polygon(' + ','.join(f'{x / w * 100:.1f}% {y / h * 100:.1f}%' for x, y in c) + ')'
    src = 'data:image/webp;base64,' + base64.b64encode(open(p, 'rb').read()).decode()
    art[n] = {'src': src, 'ratio': round(h / w, 4), 'hit': poly}
    print(n, w, h, len(c), 'pts', len(src) // 1024, 'KB')
open(OUT, 'w', encoding='utf-8').write('/* 테왁 위의 바다: 털실 인형 그림 (투명 배경 · 이 파일 안에 담아 둠) */\nvar SEA_ART = ' + json.dumps(art, ensure_ascii=False) + ';\n')
