// 일상 회화 빈도 최상위 30개 패턴 — 하루 5개씩 6일 과정
// ex[0]은 원본 예문, 나머지는 "자신의 문장으로 바꿔 써보기" 참고용 추가 예문
const PATTERNS = [
  { en: "I'm trying to", ko: "~하려고 하는 중이야", use: "지금 노력하고 있는 것", ex: [
    ["I'm trying to sleep.", "나 자려고 하고 있어."],
    ["I'm trying to be healthy.", "건강해지려고 노력 중이야."],
    ["I'm trying to fix my English.", "영어를 고치려고 노력 중이야."]]},
  { en: "I'm supposed to", ko: "~하기로 되어 있어", use: "약속·의무", ex: [
    ["I'm supposed to be there now.", "나 지금 거기 가 있어야 돼."],
    ["I'm supposed to meet her at six.", "여섯 시에 그녀를 만나기로 했어."],
    ["You're supposed to wear a mask here.", "여기선 마스크를 써야 해."]]},
  { en: "I was about to", ko: "막 ~하려던 참이었어", use: "막 하려던 일", ex: [
    ["I was about to call you.", "너한테 막 전화하려던 참이었어."],
    ["I was about to leave.", "막 나가려던 참이었어."],
    ["I was about to say the same thing.", "나도 막 똑같은 말 하려던 참이었어."]]},
  { en: "I'm here to", ko: "~하러 왔어", use: "방문 목적", ex: [
    ["I'm here to help you.", "너 도와주러 왔어."],
    ["I'm here to pick up my order.", "주문한 거 찾으러 왔어요."],
    ["I'm here to see Dr. Kim.", "김 선생님 뵈러 왔어요."]]},
  { en: "I've been ~ing", ko: "그동안 쭉 ~해 왔어", use: "계속해 온 일", ex: [
    ["I've been waiting for you.", "계속 널 기다리고 있었어."],
    ["I've been working all day.", "하루 종일 일했어."],
    ["I've been thinking about it.", "그거 계속 생각해 봤어."]]},

  { en: "Let me", ko: "내가 ~할게", use: "내가 하겠다는 의지", ex: [
    ["Let me check.", "내가 확인해 볼게."],
    ["Let me think about it.", "생각 좀 해볼게."],
    ["Let me help you with that.", "그거 내가 도와줄게."]]},
  { en: "Can I get", ko: "~ 주실래요?", use: "주문·요청", ex: [
    ["Can I get a coffee?", "커피 한 잔 주실래요?"],
    ["Can I get the check, please?", "계산서 좀 주시겠어요?"],
    ["Can I get a refill?", "리필 좀 해주실 수 있나요?"]]},
  { en: "Can you", ko: "~해 줄 수 있어?", use: "부탁", ex: [
    ["Can you help me?", "나 좀 도와줄 수 있어?"],
    ["Can you say that again?", "다시 말해줄 수 있어?"],
    ["Can you send me the file?", "파일 좀 보내줄 수 있어?"]]},
  { en: "Do you mind ~ing", ko: "~해도 괜찮을까요?", use: "공손한 부탁", ex: [
    ["Do you mind opening the window?", "창문 좀 열어주셔도 괜찮을까요?"],
    ["Do you mind waiting a minute?", "잠깐만 기다려 주실 수 있을까요?"],
    ["Do you mind if I sit here?", "여기 앉아도 될까요?"]]},
  { en: "I'm not sure if", ko: "~인지 잘 모르겠어", use: "확신이 없을 때", ex: [
    ["I'm not sure if it works.", "이게 되는지 잘 모르겠어."],
    ["I'm not sure if I can make it.", "내가 갈 수 있을지 모르겠어."],
    ["I'm not sure if he knows.", "그가 아는지 잘 모르겠어."]]},

  { en: "I don't think", ko: "~아닌 것 같아", use: "부드러운 부정", ex: [
    ["I don't think that's true.", "그건 사실이 아닌 것 같아."],
    ["I don't think so.", "아닌 것 같아."],
    ["I don't think I can go today.", "오늘은 못 갈 것 같아."]]},
  { en: "I think you should", ko: "~하는 게 좋을 것 같아", use: "조언", ex: [
    ["I think you should try it.", "그거 한번 해보는 게 좋을 것 같아."],
    ["I think you should see a doctor.", "병원에 가보는 게 좋을 것 같아."],
    ["I think you should take a break.", "좀 쉬는 게 좋을 것 같아."]]},
  { en: "It feels like", ko: "~처럼 느껴져", use: "감각·느낌", ex: [
    ["It feels like summer.", "여름처럼 느껴져."],
    ["It feels like a dream.", "꿈만 같아."],
    ["It feels like yesterday.", "엊그제 일 같아."]]},
  { en: "It looks like", ko: "~인 것 같아 (보니까)", use: "눈으로 보고 판단", ex: [
    ["It looks like rain.", "비 올 것 같아."],
    ["It looks like we're late.", "우리 늦은 것 같아."],
    ["It looks like you're busy.", "너 바빠 보이네."]]},
  { en: "It sounds like", ko: "~인 것 같네 (들어보니)", use: "듣고 판단", ex: [
    ["It sounds like a plan.", "그거 좋은 생각이네."],
    ["It sounds like fun.", "재밌겠다."],
    ["It sounds like you had a long day.", "힘든 하루였나 보네."]]},

  { en: "There is, there are", ko: "~이 있어", use: "존재", ex: [
    ["There is a problem.", "문제가 하나 있어."],
    ["There's a cafe near here.", "이 근처에 카페가 하나 있어."],
    ["There are too many people here.", "여기 사람이 너무 많아."]]},
  { en: "I'd like to", ko: "~하고 싶어요", use: "공손한 의지", ex: [
    ["I'd like to order now.", "지금 주문하고 싶어요."],
    ["I'd like to make a reservation.", "예약하고 싶어요."],
    ["I'd like to try this on.", "이거 입어보고 싶어요."]]},
  { en: "I need you to", ko: "네가 ~해 줬으면 해", use: "상대에게 요청", ex: [
    ["I need you to wait.", "조금만 기다려 줬으면 해."],
    ["I need you to listen to me.", "내 말 좀 들어줬으면 해."],
    ["I need you to call me back.", "나한테 다시 전화해 줬으면 해."]]},
  { en: "I just wanted to", ko: "그냥 ~하고 싶었어", use: "부드럽게 말 꺼내기", ex: [
    ["I just wanted to say thank you.", "그냥 고맙다고 말하고 싶었어."],
    ["I just wanted to check in.", "그냥 잘 지내나 확인하고 싶었어."],
    ["I just wanted to let you know.", "그냥 알려주고 싶었어."]]},
  { en: "I was wondering if", ko: "혹시 ~할 수 있나 해서요", use: "정중한 질문", ex: [
    ["I was wondering if you could help.", "혹시 도와주실 수 있나 해서요."],
    ["I was wondering if you're free tonight.", "혹시 오늘 밤 시간 되나 해서요."],
    ["I was wondering if I could leave early.", "혹시 일찍 가도 될까 해서요."]]},

  { en: "The thing is", ko: "사실은 말이야", use: "상황 설명 시작", ex: [
    ["The thing is, I'm busy today.", "사실은 내가 오늘 바빠."],
    ["The thing is, I don't have time.", "문제는 내가 시간이 없다는 거야."],
    ["The thing is, she already knows.", "사실 그녀가 이미 알고 있어."]]},
  { en: "As far as I know", ko: "내가 알기로는", use: "아는 범위 안에서", ex: [
    ["As far as I know, he left.", "내가 알기론 그는 떠났어."],
    ["As far as I know, it's free.", "내가 알기론 그거 무료야."],
    ["As far as I know, the store is closed today.", "내가 알기론 그 가게 오늘 문 닫았어."]]},
  { en: "You don't have to", ko: "~할 필요 없어", use: "필요 없음", ex: [
    ["You don't have to worry.", "걱정할 필요 없어."],
    ["You don't have to come.", "안 와도 돼."],
    ["You don't have to pay for it.", "그거 돈 안 내도 돼."]]},
  { en: "You might want to", ko: "~하는 게 좋을 거야", use: "가벼운 조언", ex: [
    ["You might want to check again.", "다시 확인해 보는 게 좋을 거야."],
    ["You might want to bring an umbrella.", "우산 챙기는 게 좋을 거야."],
    ["You might want to leave early.", "일찍 출발하는 게 좋을 거야."]]},
  { en: "It depends on", ko: "~에 따라 달라", use: "조건에 따라 다름", ex: [
    ["It depends on the situation.", "그건 상황에 따라 달라."],
    ["It depends on the weather.", "날씨에 따라 달라."],
    ["It depends on how much it costs.", "가격이 얼마냐에 따라 달라."]]},

  { en: "I'll let you know", ko: "알려줄게", use: "나중에 알려주기", ex: [
    ["I'll let you know later.", "나중에 알려줄게."],
    ["I'll let you know when I get there.", "도착하면 알려줄게."],
    ["I'll let you know if anything changes.", "뭐 바뀌면 알려줄게."]]},
  { en: "I didn't mean to", ko: "~하려던 건 아니었어", use: "의도치 않음", ex: [
    ["I didn't mean to hurt you.", "널 다치게 하려던 건 아니었어."],
    ["I didn't mean to be rude.", "무례하게 굴려던 건 아니었어."],
    ["I didn't mean to wake you up.", "깨우려던 건 아니었어."]]},
  { en: "I can't wait to", ko: "빨리 ~하고 싶어", use: "기대감", ex: [
    ["I can't wait to see you.", "널 만나는 게 너무 기대돼."],
    ["I can't wait to go home.", "빨리 집에 가고 싶어."],
    ["I can't wait to try it.", "빨리 해보고 싶어."]]},
  { en: "That's why", ko: "그래서 ~한 거야", use: "이유 설명", ex: [
    ["That's why I left early.", "그래서 내가 일찍 나간 거야."],
    ["That's why I called you.", "그래서 너한테 전화한 거야."],
    ["That's why I love this place.", "그래서 내가 여기를 좋아하는 거야."]]},
  { en: "That's what I mean", ko: "그게 내 말이야", use: "내 말 강조", ex: [
    ["That's what I mean.", "그러니까 그게 내가 하고 싶은 말이야."],
    ["That's exactly what I mean.", "바로 그게 내 말이야."],
    ["That's not what I mean.", "그런 뜻이 아니야."]]}
];

// 재미로 보기 (선택) — 가사 인용 없이 곡 제목·짧은 명대사·슬랭만
// t: song | kpop | movie | slang
const FUN = {
  0:  [{t:'movie', s:'Star Wars — 요다', q:'"Do or do not. There is no try."', n:'try의 가장 유명한 대사: 하든가 말든가, 시도란 없다'},
       {t:'slang', q:"I'm tryna sleep.", n:'trying to → tryna (구어체 축약)'}],
  1:  [{t:'slang', q:"I'm s'posed to be at work.", n:'supposed to는 빨리 말하면 "스포스터"처럼 들려요'}],
  2:  [{t:'slang', q:'I was literally just about to text you!', n:'연락이 딱 겹쳤을 때 단골 멘트'}],
  3:  [{t:'movie', s:'They Live (1988)', q:'"I\'m here to kick ass and chew bubblegum."', n:'액션 영화 명대사 — I\'m here to의 전설'}],
  4:  [{t:'song', s:'Londonbeat', q:"I've Been Thinking About You", n:'곡 제목 자체가 패턴'},
       {t:'song', s:'Johnny Cash', q:"I've Been Everywhere", n:'안 가본 데가 없어'}],
  5:  [{t:'song', s:'DJ Snake ft. Justin Bieber', q:'Let Me Love You', n:'곡 제목 = Let me + 동사'},
       {t:'movie', s:'겨울왕국', q:'Let It Go', n:'Let + 목적어 + 동사 응용형'}],
  6:  [{t:'slang', q:'Can I get an amen?', n:'"다들 동의하지?" 하고 호응을 유도할 때'}],
  7:  [{t:'song', s:'Elton John (라이온 킹)', q:'Can You Feel the Love Tonight', n:'곡 제목 = Can you + 동사'}],
  8:  [{t:'slang', q:'Do you mind?!', n:'단독으로 쓰면 "좀 그만할래?" 하는 짜증 표현'}],
  9:  [{t:'slang', q:'Not sure if serious or joking.', n:'유명 밈(퓨처라마 프라이) — I\'m을 빼고 쓰기도'}],
  10: [{t:'song', s:'Charlie Puth', q:"I Don't Think That I Like Her", n:'곡 제목 = I don\'t think + 문장'}],
  11: [{t:'slang', q:'You should totally go.', n:'totally를 넣으면 강력 추천 느낌'}],
  12: [{t:'slang', q:'It feels like forever.', n:'"진짜 오랜만이다" 할 때 자주 써요'}],
  13: [{t:'movie', s:'영화 단골 대사', q:"Looks like we've got company.", n:'"손님(적)이 온 것 같군" — It 생략'}],
  14: [{t:'slang', q:'Sounds like a plan!', n:'"좋아, 그렇게 하자" — 원어민 최애 맞장구'}],
  15: [{t:'movie', s:'오즈의 마법사', q:'"There\'s no place like home."', n:'there is 부정형의 명대사: 집만 한 곳은 없어'},
       {t:'song', s:'The Smiths', q:'There Is a Light That Never Goes Out', n:'곡 제목 = There is + 명사'}],
  16: [{t:'song', s:'The New Seekers', q:"I'd Like to Teach the World to Sing", n:'곡 제목 = I\'d like to + 동사'}],
  17: [{t:'kpop', s:'BTS', q:'I NEED U', n:'I need you to의 앞부분 — 뒤에 to + 동사를 붙여보세요'}],
  18: [{t:'song', s:'Stevie Wonder', q:'I Just Called to Say I Love You', n:'I just ~ to 구조가 같아요'}],
  19: [{t:'song', s:'Adele — Hello', q:'첫 소절', n:'Hello 바로 다음 소절이 I was wondering if로 시작해요. 들으면서 찾아보세요!'}],
  20: [{t:'slang', q:"Thing is, I'm broke.", n:'구어에선 The를 자주 생략'}],
  21: [{t:'slang', q:'AFAIK', n:'채팅 약어: As Far As I Know'}],
  22: [{t:'song', s:'Dusty Springfield', q:"You Don't Have to Say You Love Me", n:'곡 제목 = You don\'t have to + 동사'}],
  23: [{t:'slang', q:'You might wanna sit down for this.', n:'"앉아서 들어야 할 거야" — 충격 소식 예고'}],
  24: [{t:'slang', q:'Depends.', n:'한 단어로 "그때그때 달라"'}],
  25: [{t:'slang', q:'LMK', n:'채팅 약어: Let Me Know (알려줘)'}],
  26: [{t:'slang', q:"My bad, didn't mean to.", n:'가볍게 사과할 때 I를 생략'}],
  27: [{t:'song', s:'라이온 킹', q:"I Just Can't Wait to Be King", n:'곡 제목 = I can\'t wait to + 동사'},
       {t:'kpop', s:'TWICE', q:"I CAN'T STOP ME", n:"can't + 동사 응용"}],
  28: [{t:'song', s:'Michael Learns to Rock', q:"That's Why (You Go Away)", n:'곡 제목 = That\'s why'}],
  29: [{t:'song', s:'Bruno Mars', q:"That's What I Like", n:'That\'s what I + 동사 응용'}]
};
