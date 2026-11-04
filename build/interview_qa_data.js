/* ───────── 인터뷰 문답 내용 (영상 위 '간결한 문답') ─────────
   · 공통 모양 · 동작은 build/interview_qa.js 와 interview_qa.css — 여기는 인터뷰마다의 글만 있어요
   · 키는 INTERVIEWS 의 id (해녀님마다 그대로: 1 김은영 · 2 조은별 · 3 카일리 · 4 최명수 & 박신혜)
   · 글은 한국어(ko) · 영어(en) · 일본어(ja) 세 가지 — 같은 질문 구성 · 같은 뜻
   · 질문 id(qid)는 세 언어가 같아요 → 언어를 바꿔도 같은 질문이 열린 채로 이어져요
   · intro: 짧은 도입문 — 문단(문장)마다 한 칸씩 [ "첫 문단", "둘째 문단" ]
   · 왼쪽 캐릭터 스티커는 build/interview_qa_sticker_<id>.webp (원본: 바탕 화면\해녀 캐릭터 · 2026-11-04)
   · src: 이 답의 근거가 되는 자막 구간 (언어마다 영상 자막 시간이 같아요, "분:초") — 첫 구간 시작이 '영상에서 보기' 시각
   · by: 공동 인터뷰에서 답한 사람 (자막 내용으로 화자가 분명한 구간만 썼어요)
   · 바탕: 2026-11-04 받은 웹페이지용 자막(SRT) 네 편 × 세 언어. 자막에 없는 경험 · 감정 · 사실은 넣지 않았어요
     김은영 해녀님 한국어 자막의 빈 구간은 영어 · 일본어 자막이 같은 말을 하는 곳만 채웠어요 (아래 그 답에 적어 둠) */
var INTERVIEW_QA = {
  "3": {   // 카일리 해녀
    who: { ko: "미국에서 온 영락리 애기 해녀", en: "A newcomer haenyeo in Yeongnak-ri, originally from the United States", ja: "アメリカ出身、ヨンナクリの新米海女" },
    title: { ko: "카일리에게 물었습니다", en: "We asked Kylie", ja: "カイリーさんに聞きました" },
    intro: {
      ko: ["영어 선생님으로 한국에 왔던 카일리는 해녀학교를 거쳐 영락리 바다에서 물질을 시작했어요.",
           "외국 국적자로서 해녀증을 받기까지의 이야기와, 짧은 시간에도 눈에 보이는 바다의 변화를 들었어요."],
      en: ["Kylie first came to Korea as an English teacher, went through haenyeo school and began diving in the sea off Yeongnak-ri.",
           "She told us how she earned her haenyeo card as a foreign national, and how quickly she has seen the sea change."],
      ja: ["英語教師として韓国に来たカイリーさんは、海女学校を経て、ヨンナクリの海で潜り始めました。",
           "外国籍で海女証を受け取るまでの道のりと、短い間にも目に見える海の変化について聞きました。"]
    },
    items: [
      { qid: "kylie-teacher", src: [["0:09", "1:59"]],
        q: { ko: "영어 선생님이 어떻게 해녀가 됐나요?", en: "How did an English teacher become a haenyeo?", ja: "英語教師がどうして海女に？" },
        a: {
          ko: "진주에서 4년 동안 영어를 가르치다 2016년에 제주로 왔어요. 원어민 선생님 네 명 중 여자는 저 혼자라서 해녀 프로그램을 만들어야겠다고 생각했고, 2018년에 한수풀해녀학교를 졸업했어요. 남편이 해녀가 되고 싶냐고 물었을 때, 미국 사람에겐 흔치 않은 기회라 꼭 잡고 싶었어요.",
          en: "I taught English in Jinju for four years, then came to Jeju in 2016. Of the four native English teachers, I was the only woman, so I thought I'd develop a program about haenyeo, and in 2018 I graduated from Hansupul Haenyeo School. When my husband asked if I wanted to become a haenyeo, I wanted to take the chance. It's a rare experience for an American.",
          ja: "晋州で４年間英語を教えたあと、2016年に済州に来ました。ネイティブ教師４人のうち女性は私だけだったので、海女のプログラムを作ろうと思い、2018年にハンスプル海女学校を卒業しました。夫に「海女になりたい？」と聞かれたとき、アメリカ人にはなかなかできない経験なので、その機会をつかみたいと思いました。"
        } },
      { qid: "kylie-hardest", src: [["2:03", "3:08"]],
        q: { ko: "처음에 가장 어려웠던 건 뭐였나요?", en: "What was hardest at first?", ja: "最初に一番大変だったことは？" },
        a: {
          ko: "제주어를 알아듣는 게 가장 어려웠어요. 삼춘들이 뭘 시키는지 몰라서 실수를 많이 하고 많이 혼났어요. 나중에 온 육지 출신 후배들도 똑같은 실수를 하는 걸 보고 조금 안도했어요. 삼춘들이 크게 말씀하시는 건 무서운 게 아니라, 오래 물질하셔서 귀가 잘 안 들리시기 때문이에요.",
          en: "Understanding the Jeju language. I couldn't follow the senior haenyeo's instructions, so I made lots of mistakes and got scolded a lot. Seeing newcomers from the mainland make the same mistakes was a bit of a relief. When the senior haenyeo speak loudly, they're not trying to scare you. After so many years of diving, they're hard of hearing.",
          ja: "済州の言葉を理解することです。先輩たちの指示が分からず、何度も失敗して、ずいぶん叱られました。後から来た韓国本土出身の人たちも同じ失敗をしていて、少しほっとしました。先輩たちの声が大きいのは怖がらせるためではなく、長年潜ってきて耳が遠くなっているからなんです。"
        } },
      { qid: "kylie-why-share", src: [["4:18", "5:09"]],
        q: { ko: "외국인에게 해녀의 삶을 알리는 이유는요?", en: "Why share haenyeo life with people abroad?", ja: "海外の人に海女の暮らしを伝える理由は？" },
        a: {
          ko: "영어로 해녀 콘텐츠를 올려도 늘 ‘폭싹 속았수다’나 ‘웰컴투 삼달리’ 같다는 댓글이 달려요. 드라마만으로는 요즘 해녀의 삶을 알기 어렵고, 오해하는 부분도 있어요. 그래서 요즘 해녀들이 실제로 어떻게 사는지 외국인들에게 알려 주고 싶어요.",
          en: "My English posts always get the same comments: “Like When Life Gives You Tangerines or Welcome to Samdal-ri.” Dramas alone don't show what life is like for haenyeo today, and some things get misunderstood. So I want to show people abroad how haenyeo actually live now.",
          ja: "英語で発信しても、いつも「おつかれさま」や「サムダルリへようこそ」みたいだというコメントがつきます。ドラマだけでは今の海女の暮らしは分かりにくく、誤解されていることもあります。だから、今の海女が実際にどう暮らしているのかを海外の人に伝えたいんです。"
        } },
      { qid: "kylie-sea-change", src: [["11:04", "11:55"]],
        q: { ko: "물질하며 바다가 달라진 걸 느끼나요?", en: "Have you noticed the sea changing?", ja: "潜っていて海の変化を感じますか？" },
        a: {
          ko: "2024년 1월에 물질을 시작했는데, 이 짧은 시간에도 바다 상태가 바뀌는 게 보여요. 처음엔 해삼 철에 하루 한두 마리는 잡았는데, 작년엔 모두 합쳐 1년 동안 열 마리만 잡았어요. 그래서 바다 생태가 많이 바뀐 것 같아요.",
          en: "I started diving in January 2024, and even in that short time I've seen the sea change. At first, we caught one or two sea cucumbers a day in season, but last year we caught just ten between us all year. I think the marine ecosystem has changed a lot.",
          ja: "2024年１月に潜り始めましたが、この短い間にも海の状態が変わっていくのが分かります。最初はナマコの時期に１日１～２匹ほど採れていたのに、去年は全員合わせても１年間で10匹だけでした。海の生態系がずいぶん変わったと思います。"
        } },
      { qid: "kylie-proudest", src: [["12:00", "13:03"]],
        q: { ko: "가장 뿌듯했던 순간은 언제인가요?", en: "What was your proudest moment?", ja: "一番誇らしかった瞬間は？" },
        a: {
          ko: "드디어 해녀증을 받았을 때예요. 외국 국적자가 해녀증을 받은 적이 없어서, 정말 받을 수 있을지 계속 몰랐어요. 시작한 지 2년 후인 올해 4월에 받았는데, 어촌계장님이 직접 주고 싶어 하셔서 사무실로 받으러 갔어요. 물질 전부터 친구였던 동료와 함께 받아서 더 뜻깊었어요.",
          en: "Finally getting my haenyeo card. No foreign national had received one before, so I never knew for sure if I could. I got it this April, two years after I started, and our fishing village leader wanted to hand it over in person, so I went to the office. Getting it with a friend I'd known since before we began diving made it even more meaningful.",
          ja: "やっと海女証をもらえた時です。外国籍の人がもらった前例がなく、本当にもらえるのかずっと分かりませんでした。始めて２年後の今年４月、漁業共同体の代表が直接渡したいと言ってくださって、事務所で受け取りました。潜り始める前からの友達と一緒にもらえて、いっそう感慨深かったです。"
        } }
    ]
  },

  "4": {   // 최명수 강사 & 박신혜 해녀 (공동 인터뷰)
    who: {
      ko: "전 법환해녀학교 강사 최명수 · 5년 차 해녀 박신혜",
      en: "Choi Myeong-su, former Beophwan Haenyeo School instructor · Park Shin-hye, haenyeo in her fifth year",
      ja: "元・法還海女学校講師 チェ・ミョンスさん · 海女５年目 パク・シネさん"
    },
    title: { ko: "최명수 강사와 박신혜 해녀에게 물었습니다", en: "We asked Choi Myeong-su and Park Shin-hye", ja: "チェ・ミョンスさんとパク・シネさんに聞きました" },
    intro: {
      ko: ["법환해녀학교에서 해녀를 가르쳤던 20년 차 다이빙 강사 최명수, 그리고 회사를 떠나 5년째 물질하는 해녀 박신혜.",
           "해녀를 가르쳐 온 사람과 해녀로 사는 사람에게, 해녀가 된다는 것을 물었어요."],
      en: ["Choi Myeong-su is a diving instructor with 20 years of experience who taught at Beophwan Haenyeo School. Park Shin-hye left corporate life and is now in her fifth year as a haenyeo.",
           "We asked someone who teaches haenyeo and someone who lives as one what it takes to become a haenyeo."],
      ja: ["法還海女学校で講師を務めた指導歴20年のダイビングインストラクター、チェ・ミョンスさん。会社勤めを離れ、海女になって５年目のパク・シネさん。",
           "海女を教えてきた人と、海女として生きる人に、海女になるということを聞きました。"]
    },
    by: {   // 답한 사람 이름표
      choi: { ko: "최명수 강사", en: "Choi Myeong-su", ja: "チェ・ミョンスさん" },
      park: { ko: "박신혜 해녀", en: "Park Shin-hye", ja: "パク・シネさん" }
    },
    items: [
      { qid: "duo-breath", by: "park", src: [["13:03", "14:33"]],
        q: { ko: "해녀는 물속에서 숨을 얼마나 참나요?", en: "How long do haenyeo hold their breath?", ja: "海女は水中でどのくらい息を止めますか？" },
        a: {
          ko: "그 질문을 정말 많이 받아요. 저도 처음엔 오래 참다 나와서 삼춘께 엄청 혼났어요. 오래 있으면 오래 쉬어야 하니, 숨이 남았을 때 얼른 올라와 숨 고르고 다시 들어가는 게 중요하대요. 재 본 적은 없지만, 할머니들 물질을 기준으로 보면 저한텐 40초 정도가 가장 좋아요.",
          en: "I get asked that a lot. At first, I'd stay down too long, and the older haenyeo would scold me. If you stay down long, you need a long rest, so the point is to come up with breath to spare, recover and dive again. I don't time it, but judging by the older women's rhythm, about 40 seconds works best for me.",
          ja: "その質問はよく受けます。私も最初は長く潜っていて、先輩によく叱られました。長く潜れば長く休まなければならないので、息に余裕があるうちに上がって息を整え、また潜ることが大切なんです。測ったことはありませんが、先輩たちのリズムを見ると、私には40秒ほどがちょうどいいです。"
        } },
      { qid: "duo-first-lesson", by: "choi", src: [["2:06", "2:45"]],
        q: { ko: "해녀학교에서 가장 먼저 가르치는 건 무엇인가요?", en: "What do you teach first at haenyeo school?", ja: "海女学校で最初に教えることは？" },
        a: {
          ko: "가장 먼저 가르치는 건 안전이에요. 잠수를 잘하고 깊이 들어간다고 해서 배울 게 없는 게 아니에요. 자기 몸을 조절하고 바다를 잘 이해해야 하고, 잘한다고 너무 오래 참는 게 아니라 어떻게 해야 안전한지, 오래 하려면 체력 관리를 어떻게 해야 하는지가 가장 중요해요.",
          en: "Safety comes first. Being a strong diver who can go deep doesn't mean there's nothing left to learn. You need to control your own body and understand the sea well. Being good doesn't mean pushing your breath-hold too far. What matters most is knowing how to stay safe, and how to stay fit so you can keep going for years.",
          ja: "最初に教えるのは安全です。深く潜れるからといって、学ぶことがないわけではありません。自分の体をコントロールし、海をよく理解する必要があります。得意だからと息を止めすぎるのではなく、どうすれば安全に潜れるのか、長く続けるためにどう体力を管理するのかが最も大切です。"
        } },
      { qid: "duo-who-stays", by: "choi", src: [["2:50", "4:24"]],
        q: { ko: "어떤 사람이 해녀로 오래 남나요?", en: "Who stays on as a haenyeo?", ja: "どんな人が海女として長く続けられますか？" },
        a: {
          ko: "물질만 잘한다고 해녀가 되는 건 아니에요. 해녀의 삶을 이해하고, 자기가 잘못한 점을 인정하며 배우려는 학생이 오래 남는 것 같아요. 해녀가 되지 않았더라도 다른 일을 하며 해녀 문화를 알리는 분들도 저는 해녀라고 보고 있어요.",
          en: "Being good at harvesting isn't enough to make you a haenyeo. The students who understand the haenyeo way of life, admit their mistakes and come ready to learn tend to stay. Some never become working haenyeo but share the culture through other work, and I still see them as haenyeo in a way.",
          ja: "漁が上手だからといって、海女になれるわけではありません。海女の暮らしを理解し、自分の間違いを認めて学ぼうとする生徒が長く続けていると思います。実際に海女にならなくても、別の仕事を通して海女の文化を伝える方もいて、私はその方たちも海女だと思っています。"
        } },
      { qid: "duo-career", by: "park", src: [["9:21", "10:56"]],
        q: { ko: "회사원이 어떻게 해녀가 됐나요?", en: "How did an office worker become a haenyeo?", ja: "会社員がどうして海女に？" },
        a: {
          ko: "서울에서 15년 정도 직장생활을 하다가, 평생 할 수는 없겠다 싶어 좋아하는 일을 지금부터 천천히 시작해 보기로 했어요. 원래 물을 좋아했고 해녀학교를 알게 됐는데, 식품을 전공해서 수산물의 영양학적 가치와 엮어 보면 좋겠다고 생각했어요. 제주가 좋아서가 아니라 해녀를 하려고 제주에 왔고, 5년째 해녀로 일하고 있어요.",
          en: "I'd worked in Seoul for about 15 years and realized I couldn't stay in corporate life forever, so I decided to slowly start doing what I loved. I'd always loved the water, then I found out about haenyeo schools, and since I'd studied food science, I wanted to combine that with the nutritional value of seafood. I didn't come to Jeju simply because I liked it. I came to become a haenyeo, and I'm now in my fifth year.",
          ja: "ソウルで15年ほど会社勤めをして、一生は続けられないと思い、好きなことを少しずつ始めようと決めました。もともと水が好きで、海女学校を知り、大学で食品分野を学んでいたので、海産物の栄養価と組み合わせたいと思いました。済州が好きだからではなく、海女になるために来て、海女として５年目になります。"
        } },
      { qid: "duo-sea-change", by: "park", src: [["11:01", "11:48"]],
        q: { ko: "5년 사이 바다는 어떻게 달라졌나요?", en: "How has the sea changed in five years?", ja: "５年間で海はどう変わりましたか？" },
        a: {
          ko: "바다 환경은 마을마다 조금씩 다르지만, 우리 바다를 기준으로 보면 5년 전에는 잡을 수 있는 개체수가 훨씬 많았어요. 해가 갈수록 온난화와 기후 때문에 바다에 들어갈 수 있는 날도 적어지고, 들어가도 개체수가 현저히 줄었어요. 열대 생물들도 굉장히 많이 볼 수 있게 됐어요.",
          en: "Conditions vary from village to village, but in our waters there was much more to harvest five years ago. Each year, with global warming and changing weather, we have fewer days when we can dive, and when we do, there's far less marine life. We're also seeing a lot more tropical marine life.",
          ja: "海の環境は村ごとに違いますが、私たちの海では５年前のほうが採れるものがずっと多かったです。年々、温暖化や天候の変化で漁に出られる日が減り、海に入っても生き物が明らかに減りました。熱帯の生き物も多く見かけるようになりました。"
        } }
    ]
  },

  "1": {   // 김은영 해녀
    who: { ko: "서귀포에서 물질하는 3년 차 해녀", en: "A third-year haenyeo diving in Seogwipo", ja: "西帰浦で潜る海女３年目" },
    title: { ko: "김은영 해녀에게 물었습니다", en: "We asked Kim Eun-young", ja: "キム・ウニョンさんに聞きました" },
    intro: {
      ko: ["서울에서 공연예술 일을 하던 김은영은 제주로 이주해 직접 물질을 하며 해녀가 됐어요.",
           "바다에서 만난 돌고래, 손수 만드는 해녀 옷 소중이, 그리고 해녀 어머니들의 삶을 계속 기록하는 이유를 들었어요."],
      en: ["Kim Eun-young worked in the performing arts in Seoul, then moved to Jeju and became a haenyeo, diving herself.",
           "She told us about meeting dolphins at sea, the sojungi workwear she makes by hand, and why she keeps documenting the lives of older haenyeo."],
      ja: ["ソウルで舞台芸術の仕事をしていたキム・ウニョンさんは、済州に移住し、自ら潜って海女になりました。",
           "海で出会ったイルカ、手作りする海女の仕事着ソジュンイ、そして先輩海女たちの暮らしを記録し続ける理由を聞きました。"]
    },
    items: [
      // 한국어 자막 1:47-1:49 빈 구간: 영어 "one small being" · 일본어 "ただの一つの存在" 로 '하나의 존재' 확인
      { qid: "eunyoung-dolphins", src: [["1:23", "2:53"]],
        q: { ko: "바다에서 돌고래를 만난 적이 있나요?", en: "Have you ever met dolphins at sea?", ja: "海でイルカに出会ったことは？" },
        a: {
          ko: "돌고래는 길거리에서 강아지 만나듯 만날 수 있는 게 아니잖아요. 여름이었나, 어머님들이 ‘은영아’ 부르셔서 봤더니 작은 돌고래 세 마리가 와 있었어요. 그 경험을 하고 나니 내가 거대한 자연 속에 있는 하나의 존재라고 느껴졌어요. 지금도 ‘나 지금 어디 있는 거지’ 싶을 만큼 현실 같지 않았던 기억이에요.",
          en: "Dolphins aren't like dogs you might happen to meet on the street. I think it was summer when the older haenyeo called out, “Eun-young!” and there were three small dolphins. After that, I felt I was just one small being in this vast natural world. It still stays with me. I thought, “Where am I right now?” It didn't feel real.",
          ja: "イルカは、道で犬に出会うように会えるものではないでしょう。夏だったかな、先輩たちに「ウニョン！」と呼ばれて見ると、小さなイルカが３頭来ていました。その経験をしてから、自分はこの大きな自然の中の一つの存在なんだと感じました。「私、今どこにいるんだろう」と、今でも現実とは思えない出来事です。"
        } },
      // 한국어 자막 0:41-0:44 · 0:51-1:03 빈 구간: 영어 · 일본어가 같은 뜻 (물에서 나오는 해녀들을 도움 · 학교를 나왔다고 바로 받아 주지는 않음)
      { qid: "eunyoung-accepted", src: [["0:32", "1:10"]],
        q: { ko: "해녀학교를 나오면 바로 마을 해녀가 되나요?", en: "Does finishing haenyeo school make you a village haenyeo?", ja: "海女学校を出ればすぐ村の海女になれますか？" },
        a: {
          ko: "해녀학교를 나왔다고 마을에서 바로 받아 주는 건 아니에요. 저는 살고 싶은 마을이 있어서 계속 찾아가 하고 싶다고 요청드리고 인사를 드렸고, 물질을 마치고 나오시는 해녀들을 돕기도 했어요. 저는 외지인이고 서로 처음 보는 사이니까, 받아들여지기까지 조금 긴 것 같아요.",
          en: "Finishing haenyeo school won't get you accepted by a village. There was a village where I wanted to live, so I kept going there, asking to join, saying hello and helping the divers when they came ashore. I'm an outsider and we were strangers to each other, so being accepted seems to take a while.",
          ja: "海女学校を出たら、すぐに村に迎えてもらえるわけではないんです。私は住みたい村に通って、海女になりたいとお願いし、挨拶をして、海から戻る海女たちの荷物を運んだりもしました。私はよそから来た人間で、お互い初めて会うわけですから、受け入れてもらうまでには少し時間がかかると思います。"
        } },
      // 한국어 자막 3:56-4:03 빈 구간: 영어 · 일본어 모두 '고무 잠수복이 나오기 전 물에서 입던 작업복'
      { qid: "eunyoung-sojungi", src: [["3:30", "4:54"]],
        q: { ko: "직접 만든다는 ‘소중이’는 무엇인가요?", en: "What is the sojungi you make yourself?", ja: "自分で作っている「ソジュンイ」とは？" },
        a: {
          ko: "소중이는 고무 잠수복이 나오기 전에 해녀들이 물에서 입던 전통 작업복이에요. 멀리서 보면 다 비슷해 보이지만, 해녀들끼리는 멀리서도 ‘어 저거 누구 테왁’ 하고 알아봐요. 저는 제 몸에 맞는 것부터 만들면서, 예전엔 어땠을지 상상하고 제 나름대로 다시 해석해 보고 있어요.",
          en: "The sojungi is the traditional workwear haenyeo wore in the water before rubber wetsuits. From a distance they all look alike, but haenyeo can tell from far away, “That's her tewak.” I start by making one that fits my own body, imagining what it was like in the past and reinterpreting it through making.",
          ja: "ソジュンイは、ゴムの潜水服が登場する前に海女が海の中で着ていた伝統的な仕事着です。離れて見ると同じに見えますが、海女同士なら遠くからでも「あれは誰々のテワク」と分かります。私はまず自分の体に合うものを作り、昔はどうだったのだろうと想像しながら、自分なりに解釈して作っています。"
        } },
      // 한국어 자막 12:04-12:08 · 12:22-12:37 빈 구간: 영어 · 일본어 모두 '서둘러 배우고 기록하고 싶다' · '서울에서 돌아오니 돌아가셨다'
      { qid: "eunyoung-record", src: [["11:58", "12:48"]],
        q: { ko: "해녀 어머니들의 삶을 계속 기록하는 이유는요?", en: "Why do you keep documenting the older haenyeo's lives?", ja: "先輩海女たちの暮らしを記録し続ける理由は？" },
        a: {
          ko: "우리 마을 어머니들도 점점 줄고 있어서, 서둘러 배우고 기록하고 뭔가 잇고 싶어요. 제가 너무 좋아하던 은퇴하신 해녀 어머니가 계셨는데, 서울에 다녀왔더니 돌아가셨더라고요. 그때그때가 너무 소중하니까, 그래서 기록을 계속하게 되는 것 같아요.",
          en: "The older women in our village keep dwindling, so I want to hurry, learn, document and carry something on. There was a retired haenyeo I was very fond of. When I got back from Seoul, she had passed away. Every moment is so precious. I think that's why I keep documenting.",
          ja: "村の先輩たちはどんどん減っているので、早く学んで記録し、何かを受け継ぎたいと思います。大好きだった引退した海女の先輩がいたのですが、ソウルから戻ったら亡くなっていました。その時々が本当に大切だから、記録を続けているのだと思います。"
        } }
    ]
  },

  "2": {   // 조은별 해녀
    who: { ko: "표선 동상동에서 물질하는 해녀", en: "A haenyeo diving in Dongsang-dong, Pyoseon", ja: "表善のトンサンドンで潜る海女" },
    title: { ko: "조은별 해녀에게 물었습니다", en: "We asked Jo Eun-byeol", ja: "チョ・ウンビョルさんに聞きました" },
    intro: {
      ko: ["서울에서 13년 동안 사회복지사로 일한 조은별은 올레길을 걷다 제주 바다에서 살기로 마음먹었어요.",
           "마을의 규칙대로 2년을 기다려 물질을 시작했고, 이제는 13명의 엄마가 생겼다고 말해요."],
      en: ["Jo Eun-byeol worked as a social worker in Seoul for 13 years, until walking Jeju's Olle trails made her decide to live by this sea.",
           "She waited two years, as her village's rules required, before she began diving, and now says she has 13 mothers."],
      ja: ["ソウルで13年間ソーシャルワーカーとして働いたチョ・ウンビョルさんは、オルレを歩くうちに済州の海で生きようと決めました。",
           "村の決まりどおり２年待って漁を始め、今では「13人のお母さん」ができたと話します。"]
    },
    items: [
      { qid: "eunbyeol-mothers", src: [["8:17", "9:15"]],
        q: { ko: "13명의 엄마가 생겼다고요?", en: "You say you now have 13 mothers?", ja: "「13人のお母さん」ができたそうですね？" },
        a: {
          ko: "외지에서 온 사람에게 정을 다 줬다가 훌쩍 떠날 수도 있는데, 삼춘들은 그럼에도 저를 길게 알아보고 두 팔 벌려 환영해 주셨어요. 그래서 저한테 13명의 엄마가 생겼어요. ‘은별아 이거 갖다 먹어라’, ‘오늘 오일장 가자’ 하시며 늘 보살펴 주셔서, 저도 삼춘들께 든든한 물벗이 돼 드리고 싶어요.",
          en: "Someone from outside might win their hearts and then leave one day, but even so, the women took the time to get to know me and welcomed me with open arms. Now it's as if I have 13 mothers. “Eun-byeol, take this home to eat.” “Let's go to the market today.” They always look after me, and I want to be someone they can count on at sea.",
          ja: "島外から来た人に愛情を注いでも、突然去ってしまうかもしれません。それでも先輩たちは時間をかけて私を知ろうとし、両手を広げて歓迎してくれました。だから私には13人のお母さんができたんです。「ウンビョル、これ食べなさい」「今日は市場に行こう」といつも見守ってくれるので、私も頼れる海の仲間でありたいです。"
        } },
      { qid: "eunbyeol-career", src: [["3:09", "4:33"]],
        q: { ko: "사회복지사가 어떻게 해녀가 됐나요?", en: "How did a social worker become a haenyeo?", ja: "ソーシャルワーカーがどうして海女に？" },
        a: {
          ko: "서울에서 13년 정도 사회복지사로 일하면서, 지칠 때면 제주 올레길을 걸었어요. 하루 종일 걷다 보니 몸과 마음이 치유되는 느낌이었고, 제주를 한 바퀴 다 돌았을 때 이 바다에서 살아야겠다고 생각했어요. 해녀학교에서 즐거운 물벗 40명을 만나고 해녀 문화를 깊이 알아 갈수록, 해녀를 직업으로 삼아도 너무 행복할 것 같았어요.",
          en: "I worked as a social worker in Seoul for about 13 years, and when I felt burned out, I walked Jeju's Olle trails. Walking all day felt healing, both physically and mentally, and after walking all the way around Jeju, I knew I wanted to live by this sea. At haenyeo school I met 40 wonderful diving friends, and the more I learned about haenyeo culture, the more I thought I'd be happy doing this for a living.",
          ja: "ソウルで約13年間ソーシャルワーカーとして働き、疲れ切ったときには済州のオルレを歩いていました。一日中歩くと心も体も癒やされる気がして、済州島を一周したとき、この海で生きようと思ったんです。海女学校で40人の素敵な海の仲間に出会い、海女の文化を深く知るほど、海女を仕事にできたらきっと幸せだろうと思いました。"
        } },
      { qid: "eunbyeol-two-years", src: [["0:27", "1:01"], ["2:01", "2:31"]],
        q: { ko: "물질을 시작하기까지 2년을 기다렸다고요?", en: "You waited two years before you could dive?", ja: "漁を始めるまで２年待ったそうですね？" },
        a: {
          ko: "2020년에 해녀학교를 졸업했는데, 우리 동네에는 2년 이상 살아야 한다는 내부 규정이 있었어요. 여기에 뿌리를 내리고 2년을 채우고 오겠다고 했고, 삼춘들이 받아 주셔서 2022년부터 물질을 했어요. 기다리는 동안 복지관 봉사와 의용소방대 활동을 하며 동네를 알아 가서 그렇게 힘들진 않았어요.",
          en: "I graduated from haenyeo school in 2020, but my village had its own rule that you have to live there for at least two years. I said I'd put down roots and come back once I'd met that requirement, and the older women welcomed me, so I started diving in 2022. While I waited, I volunteered at the welfare center and joined the volunteer fire brigade, getting to know the village, so it wasn't especially hard.",
          ja: "2020年に海女学校を卒業しましたが、この村には２年以上住む必要があるという独自の決まりがありました。ここに根を下ろして２年たったらまた来ますと伝え、先輩たちが受け入れてくれて、2022年に漁を始めました。待つ間は福祉施設でのボランティアや地元の消防団の活動をしながら村を知っていったので、それほどつらくありませんでした。"
        } },
      { qid: "eunbyeol-climate", src: [["12:58", "13:47"], ["13:56", "14:26"]],
        q: { ko: "바다에서 기후 위기를 느끼나요?", en: "Do you feel the climate crisis at sea?", ja: "海で気候危機を感じますか？" },
        a: {
          ko: "12월, 1월의 겨울 바다도 춥지 않아요. 6월에 성게 작업을 하면 견디기 힘들 만큼 바다가 뜨겁고, 해파리도 굉장히 많아졌어요. 그래서 저희도 해양쓰레기를 줍고, 물이 빠졌을 때 석회가 붙어 하얘진 바위를 호맹이로 긁어내는 갯닦기를 삼춘들과 함께 해요.",
          en: "The sea doesn't feel cold even in December or January. When we harvest sea urchins in June, the water gets so warm it's almost unbearable, and there are many more jellyfish. So we collect marine debris too, and when the tide goes out, we scrape the white calcareous growth off the rocks with small hoes together with the older women.",
          ja: "12月も１月も、冬の海が寒くないんです。６月にウニ漁をすると耐えがたいほど水温が高く、クラゲもずいぶん増えました。だから私たちも海のごみを拾い、干潮のときには石灰質が付いて白くなった岩を、先輩たちと一緒に小さな鍬でこすり落としています。"
        } },
      { qid: "eunbyeol-wetsuit", src: [["9:19", "10:21"]],
        q: { ko: "해녀복은 어떻게 맞추나요?", en: "How is a haenyeo wetsuit made?", ja: "海女の潜水服はどうやって仕立てますか？" },
        a: {
          ko: "해녀복은 1년에 한 벌, 제주도에서 지원이 나와요. 팔목, 어깨선, 가슴둘레, 허리, 종아리까지 열다섯 군데쯤을 재서 만드는 맞춤 작업복이에요. 처음에 입던 기성 다이빙 슈트는 굉장히 타이트했는데, 이건 제 몸에 딱 맞아서 물 안에서 엄청 자유롭고, 4시간 정도 물질해도 춥지 않아요.",
          en: "Jeju provides support for one wetsuit a year. It's workwear tailored to each person, with about 15 measurements: wrists, shoulders, chest, waist and even calves. The off-the-rack diving suit I wore at first was very tight, but this one fits my body perfectly, so I feel much freer underwater and don't get cold even after about four hours of diving.",
          ja: "済州では年に１着、潜水服の支援があります。手首、肩のライン、胸囲、ウエスト、ふくらはぎまで15か所ほど採寸する、一人ひとりに合わせた仕事着です。初めの頃の既製のスーツはすごく窮屈でしたが、これは体にぴったりなので水中でとても自由に動けて、４時間ほど潜っても寒くありません。"
        } }
    ]
  }
};
