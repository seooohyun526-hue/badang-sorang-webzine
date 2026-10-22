# 함렛(Hahmlet) 굵은 명조를 필요한 글자만 담아 다시 만들어요 — 지금 담긴 글자 + 해양정화 칸 제목 · 마무리 문장
import io
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools import subset
extra = "해녀가 다녀가면,\n바다가 달라져요 해녀가 줄어드는 만큼, 바다를 돌보던 손길도 줄어듭니다. 0123456789· 같이 잇다, 가치를 잇다"
for w in (700, 800):
    have = set(TTFont(f'hahmlet_{w}.woff2').getBestCmap())
    chars = have | {ord(c) for c in extra if c.strip()} | {32}
    f = instancer.instantiateVariableFont(TTFont('../game_src/fonts/Hahmlet-VF.ttf'), {'wght': w})
    o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']; o.name_IDs = ['*']
    s = subset.Subsetter(o); s.populate(unicodes=chars); s.subset(f)
    f.flavor = 'woff2'; f.save(f'hahmlet_{w}.woff2'); print(w, len(have), '->', len(chars))
