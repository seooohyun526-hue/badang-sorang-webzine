# 랭킹(HIGH SCORE) 한글 픽셀체 만들기: 모나S12 Bold(SIL OFL, https://github.com/Monad-ABXY/MonaS12) 원본 otf 에서
# 영문 · 숫자 · 한글 11,172자 · 자모 · 자주 쓰는 문장부호만 담아 build/fonts/MonaS12-Bold-ko.woff2 로 저장해요
# 사용법: python build/tools/pixel_ko_subset.py <MonaS12-Bold.otf 경로>
import sys, os
from fontTools.ttLib import TTFont
from fontTools import subset
src = sys.argv[1]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'fonts', 'MonaS12-Bold-ko.woff2')
U = set(range(0x20, 0x7F)) | set(range(0xAC00, 0xD7A4)) | set(range(0x3131, 0x318F)) | {0xB7, 0x2026, 0x2014, 0x2019, 0x201C, 0x201D, 0xA0}
f = TTFont(src); U &= set(f.getBestCmap())
o = subset.Options(); o.flavor = 'woff2'; o.layout_features = ['*']
s = subset.Subsetter(o); s.populate(unicodes=U); s.subset(f)
f.flavor = 'woff2'; f.save(out); print(out, os.path.getsize(out) // 1024, 'KB')
