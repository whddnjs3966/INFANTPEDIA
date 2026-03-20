// Development Milestone Data (0-12 months)
// Based on Korean pediatric development standards (대한소아과학회)
// All text in Korean (한국어)

export interface MilestoneItem {
  id: string; // e.g. "0_gross_1"
  domain: "gross_motor" | "fine_motor" | "language" | "social";
  title: string; // Korean
  description: string; // Korean - detailed explanation
  emoji: string;
}

export interface MonthMilestones {
  month: number;
  milestones: MilestoneItem[];
}

export const domainInfo = {
  gross_motor: {
    label: "대근육",
    emoji: "🏃",
    color: "blue",
  },
  fine_motor: {
    label: "소근육",
    emoji: "✋",
    color: "green",
  },
  language: {
    label: "언어",
    emoji: "🗣️",
    color: "orange",
  },
  social: {
    label: "사회성",
    emoji: "👶",
    color: "pink",
  },
} as const;

export type MilestoneDomain = keyof typeof domainInfo;

const milestoneData: MonthMilestones[] = [
  {
    month: 0,
    milestones: [
      // 대근육
      { id: "0_gross_1", domain: "gross_motor", title: "고개를 좌우로 돌릴 수 있어요", description: "엎드려 놓으면 고개를 한쪽으로 돌려 놓을 수 있습니다. 목 근육 발달의 첫 단계예요.", emoji: "🔄" },
      { id: "0_gross_2", domain: "gross_motor", title: "팔다리를 구부렸다 펴요", description: "신생아 특유의 굴곡 자세에서 팔다리를 움직이며 근육을 발달시킵니다.", emoji: "💪" },
      { id: "0_gross_3", domain: "gross_motor", title: "엎드리면 잠깐 고개를 들어요", description: "턱을 살짝 들어올릴 수 있으며, 이는 목 근육이 발달하고 있다는 신호예요.", emoji: "🙂" },
      // 소근육
      { id: "0_fine_1", domain: "fine_motor", title: "손을 꽉 쥐고 있어요 (파악 반사)", description: "손바닥에 물건이 닿으면 반사적으로 꽉 쥡니다. 이는 정상적인 신생아 반사예요.", emoji: "✊" },
      { id: "0_fine_2", domain: "fine_motor", title: "손가락을 가끔 펼 수 있어요", description: "대부분 주먹을 쥐고 있지만 가끔 손가락을 펴기도 합니다.", emoji: "🖐️" },
      { id: "0_fine_3", domain: "fine_motor", title: "손을 입으로 가져가요", description: "반사적으로 손을 입 쪽으로 가져가는 행동을 보입니다.", emoji: "👄" },
      // 언어
      { id: "0_lang_1", domain: "language", title: "울음으로 의사를 표현해요", description: "배고픔, 불편함, 졸림 등을 울음으로 표현합니다. 아기의 첫 번째 의사소통 수단이에요.", emoji: "😢" },
      { id: "0_lang_2", domain: "language", title: "큰 소리에 반응해요", description: "갑작스러운 큰 소리에 깜짝 놀라는 모로 반사를 보입니다.", emoji: "👂" },
      { id: "0_lang_3", domain: "language", title: "엄마 목소리를 구별해요", description: "태내에서부터 들어온 엄마의 목소리에 특별히 반응합니다.", emoji: "🎵" },
      // 사회성
      { id: "0_social_1", domain: "social", title: "얼굴을 잠깐 응시할 수 있어요", description: "20-30cm 거리에서 사람 얼굴을 잠시 바라볼 수 있습니다.", emoji: "👀" },
      { id: "0_social_2", domain: "social", title: "안아주면 안정돼요", description: "양육자의 품에 안기면 울음을 멈추고 안정감을 느낍니다.", emoji: "🤱" },
      { id: "0_social_3", domain: "social", title: "피부 접촉에 반응해요", description: "스킨십을 통해 안정감을 느끼고, 피부 접촉 시 편안한 표정을 짓습니다.", emoji: "💕" },
    ],
  },
  {
    month: 1,
    milestones: [
      { id: "1_gross_1", domain: "gross_motor", title: "엎드리면 잠깐 고개를 들어요", description: "엎드린 상태에서 45도 정도로 고개를 들 수 있습니다. 목 근육이 강해지고 있어요.", emoji: "💪" },
      { id: "1_gross_2", domain: "gross_motor", title: "누워서 팔다리를 활발히 움직여요", description: "바닥에 누워서 팔과 다리를 자유롭게 움직이며 근육을 키웁니다.", emoji: "🦵" },
      { id: "1_gross_3", domain: "gross_motor", title: "안아 올리면 머리를 잠깐 세워요", description: "세워서 안으면 잠깐 동안 머리를 가눌 수 있지만 아직 지지가 필요해요.", emoji: "🙂" },
      { id: "1_fine_1", domain: "fine_motor", title: "손에 물건을 잠깐 쥘 수 있어요", description: "딸랑이 등을 손에 쥐어주면 반사적으로 잡고 잠시 들고 있을 수 있습니다.", emoji: "🎯" },
      { id: "1_fine_2", domain: "fine_motor", title: "손을 펴기 시작해요", description: "주먹을 쥐고 있던 손을 점점 더 자주 펴게 됩니다.", emoji: "🖐️" },
      { id: "1_fine_3", domain: "fine_motor", title: "손을 바라보기 시작해요", description: "자신의 손에 관심을 보이며 손을 바라보는 행동이 시작됩니다.", emoji: "👀" },
      { id: "1_lang_1", domain: "language", title: "다양한 울음소리를 내요", description: "배고플 때, 불편할 때, 졸릴 때 각각 다른 울음소리를 냅니다.", emoji: "😤" },
      { id: "1_lang_2", domain: "language", title: "'아', '으' 같은 모음 소리를 내요", description: "쿠잉(cooing)의 시작으로, 기분 좋을 때 목에서 소리를 냅니다.", emoji: "🔊" },
      { id: "1_lang_3", domain: "language", title: "말소리에 반응하여 조용해져요", description: "양육자가 말을 걸면 울음을 멈추고 귀를 기울이는 모습을 보입니다.", emoji: "🤫" },
      { id: "1_social_1", domain: "social", title: "눈을 맞추고 응시해요", description: "양육자의 눈을 바라보며 관심을 보이기 시작합니다. 사회적 유대감의 시작이에요.", emoji: "👁️" },
      { id: "1_social_2", domain: "social", title: "반사적 미소를 지어요", description: "수면 중이나 만족스러울 때 자연스럽게 미소를 짓습니다. 아직 사회적 미소는 아니에요.", emoji: "😊" },
      { id: "1_social_3", domain: "social", title: "사람 얼굴에 관심을 보여요", description: "사물보다 사람 얼굴에 더 많은 관심을 보이며 시선을 고정합니다.", emoji: "🧑" },
    ],
  },
  {
    month: 2,
    milestones: [
      { id: "2_gross_1", domain: "gross_motor", title: "엎드려서 가슴까지 들어올려요", description: "팔의 힘으로 가슴을 바닥에서 들어올릴 수 있어요. 상체 근력이 발달하고 있습니다.", emoji: "💪" },
      { id: "2_gross_2", domain: "gross_motor", title: "고개를 좌우로 돌릴 수 있어요", description: "엎드린 상태에서 머리를 좌우로 자유롭게 돌릴 수 있습니다.", emoji: "🔄" },
      { id: "2_gross_3", domain: "gross_motor", title: "다리로 밀어내는 힘이 생겨요", description: "바닥에 발을 대면 다리로 밀어내는 동작을 합니다.", emoji: "🦶" },
      { id: "2_fine_1", domain: "fine_motor", title: "물건을 손으로 치기 시작해요", description: "모빌이나 장난감을 향해 손을 뻗어 치려고 시도합니다.", emoji: "👋" },
      { id: "2_fine_2", domain: "fine_motor", title: "양손을 모을 수 있어요", description: "가슴 앞에서 양손을 모으는 동작이 가능해집니다.", emoji: "🙏" },
      { id: "2_fine_3", domain: "fine_motor", title: "손가락을 빨아요", description: "자기 손가락을 입에 넣고 빠는 행동을 자주 합니다. 자기 위안 행동이에요.", emoji: "👶" },
      { id: "2_lang_1", domain: "language", title: "쿠잉 소리를 활발히 내요", description: "'아구', '우구' 같은 쿠잉 소리를 내며 기분을 표현합니다.", emoji: "🗣️" },
      { id: "2_lang_2", domain: "language", title: "소리 나는 방향으로 고개를 돌려요", description: "소리가 나는 쪽으로 머리를 돌려 소리의 출처를 찾으려 합니다.", emoji: "👂" },
      { id: "2_lang_3", domain: "language", title: "양육자와 '대화'를 시도해요", description: "말을 걸면 소리로 대답하듯 반응하며, 번갈아 소리를 내려 합니다.", emoji: "💬" },
      { id: "2_social_1", domain: "social", title: "사회적 미소를 지어요", description: "양육자를 보고 의도적으로 미소를 짓습니다. 진정한 사회적 상호작용의 시작이에요.", emoji: "😄" },
      { id: "2_social_2", domain: "social", title: "움직이는 물체를 눈으로 따라가요", description: "눈앞에서 움직이는 사물이나 사람을 시선으로 추적할 수 있습니다.", emoji: "👀" },
      { id: "2_social_3", domain: "social", title: "양육자 얼굴을 알아봐요", description: "익숙한 얼굴과 낯선 얼굴의 차이를 인식하기 시작합니다.", emoji: "🥰" },
      { id: "2_social_4", domain: "social", title: "기분 좋으면 소리와 함께 웃어요", description: "즐거울 때 소리 내어 웃기 시작합니다. 감정 표현이 풍부해져요.", emoji: "😆" },
    ],
  },
  {
    month: 3,
    milestones: [
      { id: "3_gross_1", domain: "gross_motor", title: "목을 가눌 수 있어요", description: "세워서 안았을 때 머리를 안정적으로 가눌 수 있게 됩니다. 중요한 이정표예요!", emoji: "✅" },
      { id: "3_gross_2", domain: "gross_motor", title: "엎드려서 팔로 상체를 지탱해요", description: "팔꿈치로 상체를 받치고 고개를 높이 들 수 있습니다.", emoji: "💪" },
      { id: "3_gross_3", domain: "gross_motor", title: "뒤집기를 시도해요", description: "옆으로 몸을 돌리려는 시도를 하며, 일부 아기는 뒤집기에 성공하기도 해요.", emoji: "🔄" },
      { id: "3_gross_4", domain: "gross_motor", title: "세워 안으면 다리에 힘을 줘요", description: "세워서 발을 바닥에 대면 다리에 힘을 주고 체중을 지탱하려 합니다.", emoji: "🦵" },
      { id: "3_fine_1", domain: "fine_motor", title: "물건을 잡으려고 손을 뻗어요", description: "눈앞의 물건을 향해 의도적으로 손을 뻗어 잡으려 시도합니다.", emoji: "🤲" },
      { id: "3_fine_2", domain: "fine_motor", title: "딸랑이를 흔들 수 있어요", description: "손에 쥔 딸랑이를 흔들어 소리를 낼 수 있습니다.", emoji: "🔔" },
      { id: "3_fine_3", domain: "fine_motor", title: "양손을 깍지 끼며 놀아요", description: "양손을 맞잡고 손가락을 탐색하며 놀 수 있습니다.", emoji: "🤝" },
      { id: "3_lang_1", domain: "language", title: "'아구구' 같은 소리를 내요", description: "모음과 자음이 결합된 소리를 내기 시작하며, 옹알이의 전 단계입니다.", emoji: "🔊" },
      { id: "3_lang_2", domain: "language", title: "소리 내어 웃어요", description: "기분이 좋을 때 '까르르' 소리 내어 웃습니다. 감정 표현이 분명해져요.", emoji: "😂" },
      { id: "3_lang_3", domain: "language", title: "다양한 높낮이의 소리를 내요", description: "높은 소리, 낮은 소리 등 다양한 음높이로 소리를 실험합니다.", emoji: "🎶" },
      { id: "3_social_1", domain: "social", title: "거울 속 자신에게 반응해요", description: "거울에 비친 자신의 모습을 보고 미소 짓거나 관심을 보입니다.", emoji: "🪞" },
      { id: "3_social_2", domain: "social", title: "놀아주면 신나서 반응해요", description: "양육자가 놀아주면 손발을 움직이며 신나는 반응을 보입니다.", emoji: "🎉" },
      { id: "3_social_3", domain: "social", title: "표정을 따라 해요", description: "양육자가 혀를 내밀거나 입을 크게 벌리면 따라하려 합니다.", emoji: "😛" },
    ],
  },
  {
    month: 4,
    milestones: [
      { id: "4_gross_1", domain: "gross_motor", title: "뒤집기를 할 수 있어요", description: "앞에서 뒤로 또는 뒤에서 앞으로 뒤집기를 할 수 있게 됩니다.", emoji: "🔄" },
      { id: "4_gross_2", domain: "gross_motor", title: "엎드려서 팔을 쭉 펴고 상체를 들어요", description: "팔을 완전히 펴서 상체를 높이 들어올릴 수 있습니다.", emoji: "💪" },
      { id: "4_gross_3", domain: "gross_motor", title: "잡아주면 앉는 자세를 유지해요", description: "양쪽을 잡아주면 앉은 자세를 잠시 유지할 수 있습니다.", emoji: "🪑" },
      { id: "4_fine_1", domain: "fine_motor", title: "물건을 한 손으로 잡아요", description: "원하는 물건을 한 손으로 잡고 쥘 수 있게 됩니다.", emoji: "🤏" },
      { id: "4_fine_2", domain: "fine_motor", title: "물건을 입으로 가져가 탐색해요", description: "잡은 물건을 입으로 가져가서 맛보고 느끼며 탐색합니다.", emoji: "👄" },
      { id: "4_fine_3", domain: "fine_motor", title: "두 손으로 물건을 잡아요", description: "양손을 사용해 큰 물건을 잡을 수 있습니다.", emoji: "🤲" },
      { id: "4_fine_4", domain: "fine_motor", title: "손으로 물건을 쳐서 소리를 내요", description: "테이블이나 바닥을 손으로 쳐서 소리 내는 것을 즐깁니다.", emoji: "🥁" },
      { id: "4_lang_1", domain: "language", title: "옹알이가 시작돼요", description: "'바바', '마마' 같은 자음+모음 조합의 옹알이가 시작됩니다.", emoji: "🗣️" },
      { id: "4_lang_2", domain: "language", title: "이름을 부르면 반응해요", description: "자신의 이름을 부르면 고개를 돌리거나 반응을 보이기 시작합니다.", emoji: "📣" },
      { id: "4_lang_3", domain: "language", title: "감정에 따라 다른 소리를 내요", description: "기쁠 때, 화날 때, 불만족할 때 각각 다른 소리로 표현합니다.", emoji: "🎭" },
      { id: "4_social_1", domain: "social", title: "낯선 사람에게도 미소를 지어요", description: "사회적 미소가 확장되어 낯선 사람에게도 웃음을 보입니다.", emoji: "😊" },
      { id: "4_social_2", domain: "social", title: "놀이를 중단하면 불만을 표현해요", description: "함께 놀다가 멈추면 울거나 보채며 계속 놀기를 원합니다.", emoji: "😤" },
      { id: "4_social_3", domain: "social", title: "까꿍 놀이에 반응해요", description: "까꿍 놀이를 하면 웃음을 터뜨리며 즐거워합니다.", emoji: "🙈" },
    ],
  },
  {
    month: 5,
    milestones: [
      { id: "5_gross_1", domain: "gross_motor", title: "양방향 뒤집기가 가능해요", description: "앞→뒤, 뒤→앞 양방향으로 자유롭게 뒤집을 수 있습니다.", emoji: "🔄" },
      { id: "5_gross_2", domain: "gross_motor", title: "지지하면 앉을 수 있어요", description: "쿠션이나 손으로 지지해주면 앉은 자세를 유지할 수 있습니다.", emoji: "🪑" },
      { id: "5_gross_3", domain: "gross_motor", title: "세워서 잡아주면 발로 뛰어요", description: "겨드랑이를 잡아주면 발로 바닥을 차며 뛰는 동작을 합니다.", emoji: "🦘" },
      { id: "5_fine_1", domain: "fine_motor", title: "손 전체로 긁어서 물건을 잡아요", description: "갈퀴 잡기(rake grasp)로 작은 물건을 잡으려 시도합니다.", emoji: "🤏" },
      { id: "5_fine_2", domain: "fine_motor", title: "한 손에서 다른 손으로 옮겨요", description: "물건을 한 손에서 다른 손으로 옮길 수 있게 됩니다.", emoji: "🔀" },
      { id: "5_fine_3", domain: "fine_motor", title: "발을 잡고 놀아요", description: "누워서 자신의 발을 잡고 입으로 가져가며 탐색합니다.", emoji: "🦶" },
      { id: "5_lang_1", domain: "language", title: "반복적인 옹알이를 해요", description: "'다다다', '바바바' 같이 같은 소리를 반복하는 옹알이를 합니다.", emoji: "🔁" },
      { id: "5_lang_2", domain: "language", title: "소리를 듣고 모방하려 해요", description: "양육자의 소리를 듣고 비슷한 소리를 내려고 시도합니다.", emoji: "🦜" },
      { id: "5_lang_3", domain: "language", title: "높은 소리로 소리 질러요", description: "자신의 목소리를 실험하며 높은 소리로 소리를 지르기도 합니다.", emoji: "📢" },
      { id: "5_social_1", domain: "social", title: "거울 속 자신을 보고 웃어요", description: "거울에 비친 자신의 모습을 보고 웃으며 손을 뻗어 만지려 합니다.", emoji: "🪞" },
      { id: "5_social_2", domain: "social", title: "다른 아기에게 관심을 보여요", description: "또래 아기를 보면 관심을 갖고 쳐다보거나 손을 뻗습니다.", emoji: "👶" },
      { id: "5_social_3", domain: "social", title: "양육자와 분리 시 불안해해요", description: "주 양육자가 시야에서 사라지면 불안해하거나 울기 시작합니다.", emoji: "😢" },
    ],
  },
  {
    month: 6,
    milestones: [
      { id: "6_gross_1", domain: "gross_motor", title: "혼자 앉을 수 있어요", description: "지지 없이 혼자 앉아 있을 수 있게 됩니다. 중요한 발달 이정표예요!", emoji: "🎉" },
      { id: "6_gross_2", domain: "gross_motor", title: "배밀이를 시작해요", description: "엎드린 상태에서 팔과 다리를 이용해 앞으로 움직이려 합니다.", emoji: "🐛" },
      { id: "6_gross_3", domain: "gross_motor", title: "앉아서 양손을 자유롭게 사용해요", description: "안정적으로 앉아서 양손으로 장난감을 가지고 놀 수 있습니다.", emoji: "🧸" },
      { id: "6_gross_4", domain: "gross_motor", title: "잡고 서는 연습을 해요", description: "가구나 양육자 손을 잡고 일어서려고 시도합니다.", emoji: "🧍" },
      { id: "6_fine_1", domain: "fine_motor", title: "손가락으로 집으려 해요", description: "작은 물건을 엄지와 나머지 손가락으로 집으려 시도합니다.", emoji: "🤏" },
      { id: "6_fine_2", domain: "fine_motor", title: "양손에 각각 물건을 잡아요", description: "양손에 하나씩 물건을 잡고 부딪치거나 비교하며 놀 수 있습니다.", emoji: "🤹" },
      { id: "6_fine_3", domain: "fine_motor", title: "의도적으로 물건을 떨어뜨려요", description: "물건을 잡았다 놓는 것을 반복하며 인과관계를 학습합니다.", emoji: "⬇️" },
      { id: "6_lang_1", domain: "language", title: "다양한 자음의 옹알이를 해요", description: "'마마', '다다', '바바' 등 다양한 자음과 모음 조합으로 옹알이합니다.", emoji: "🗣️" },
      { id: "6_lang_2", domain: "language", title: "'안 돼'라는 말의 어조를 이해해요", description: "단호한 어조의 '안 돼'에 반응하며 행동을 멈추기도 합니다.", emoji: "🚫" },
      { id: "6_lang_3", domain: "language", title: "감정을 소리로 표현해요", description: "기쁨, 불만, 놀람 등의 감정을 다양한 소리와 억양으로 표현합니다.", emoji: "🎭" },
      { id: "6_social_1", domain: "social", title: "낯가림이 시작돼요", description: "낯선 사람을 보면 불안해하거나 양육자에게 매달립니다.", emoji: "😰" },
      { id: "6_social_2", domain: "social", title: "까꿍 놀이를 즐겨요", description: "까꿍 놀이에서 사라졌다 나타나는 것을 즐기며 웃습니다.", emoji: "🙈" },
      { id: "6_social_3", domain: "social", title: "음식에 관심을 보여요", description: "양육자가 먹는 모습을 보고 관심을 갖고 손을 뻗습니다.", emoji: "🍽️" },
      { id: "6_social_4", domain: "social", title: "좋아하는 장난감이 생겨요", description: "특정 장난감이나 물건에 대한 선호도가 나타나기 시작합니다.", emoji: "⭐" },
    ],
  },
  {
    month: 7,
    milestones: [
      { id: "7_gross_1", domain: "gross_motor", title: "혼자 앉아서 놀 수 있어요", description: "안정적으로 혼자 앉아 양손을 자유롭게 사용하며 놀 수 있습니다.", emoji: "🧸" },
      { id: "7_gross_2", domain: "gross_motor", title: "기기 시작해요", description: "배밀이에서 발전하여 네 발로 기기를 시작합니다. 이동 능력의 큰 발전이에요!", emoji: "🐾" },
      { id: "7_gross_3", domain: "gross_motor", title: "가구를 잡고 일어서요", description: "소파나 테이블을 잡고 스스로 일어설 수 있게 됩니다.", emoji: "🧍" },
      { id: "7_fine_1", domain: "fine_motor", title: "엄지와 검지로 집기 시작해요", description: "핀서 그래스프(pincer grasp)가 발달하기 시작하여 작은 물건을 집을 수 있어요.", emoji: "🤏" },
      { id: "7_fine_2", domain: "fine_motor", title: "물건을 두드려서 소리를 내요", description: "물건을 테이블이나 다른 물건에 두드려 소리를 탐색합니다.", emoji: "🥁" },
      { id: "7_fine_3", domain: "fine_motor", title: "컵을 잡고 마시려 해요", description: "양손으로 컵을 잡고 입으로 가져가려 시도합니다.", emoji: "🥤" },
      { id: "7_fine_4", domain: "fine_motor", title: "손가락으로 가리켜요", description: "관심 있는 물건을 손가락으로 가리키기 시작합니다.", emoji: "👆" },
      { id: "7_lang_1", domain: "language", title: "대화하듯 옹알이해요", description: "억양과 리듬이 있는 옹알이로 마치 대화하는 것처럼 소리를 냅니다.", emoji: "💬" },
      { id: "7_lang_2", domain: "language", title: "간단한 단어의 의미를 이해해요", description: "'맘마', '빠빠', '까까' 등 자주 듣는 단어의 의미를 이해하기 시작합니다.", emoji: "💡" },
      { id: "7_lang_3", domain: "language", title: "몸짓으로 의사를 표현해요", description: "손을 뻗거나, 고개를 젓거나, 소리를 내어 원하는 것을 표현합니다.", emoji: "🙋" },
      { id: "7_social_1", domain: "social", title: "분리 불안이 뚜렷해져요", description: "양육자와 떨어지면 심하게 울고, 낯선 환경에서 불안해합니다.", emoji: "😭" },
      { id: "7_social_2", domain: "social", title: "다른 사람의 감정에 반응해요", description: "주변 사람이 울거나 웃으면 따라서 감정적 반응을 보입니다.", emoji: "🤝" },
      { id: "7_social_3", domain: "social", title: "간단한 게임을 이해해요", description: "박수치기, 짝짜꿍 등의 간단한 놀이 규칙을 이해하고 참여합니다.", emoji: "👏" },
    ],
  },
  {
    month: 8,
    milestones: [
      { id: "8_gross_1", domain: "gross_motor", title: "능숙하게 기어다녀요", description: "네 발로 빠르게 기어다니며 원하는 곳으로 이동할 수 있습니다.", emoji: "🐾" },
      { id: "8_gross_2", domain: "gross_motor", title: "잡고 서서 옆으로 이동해요", description: "가구를 잡고 선 상태에서 옆으로 이동(크루징)을 시작합니다.", emoji: "🚶" },
      { id: "8_gross_3", domain: "gross_motor", title: "앉았다 일어서기를 반복해요", description: "가구를 잡고 앉았다 일어서기를 반복하며 다리 근육을 키웁니다.", emoji: "🔄" },
      { id: "8_fine_1", domain: "fine_motor", title: "핀서 그래스프가 발달해요", description: "엄지와 검지 끝으로 작은 물건을 정교하게 집을 수 있습니다.", emoji: "🤏" },
      { id: "8_fine_2", domain: "fine_motor", title: "물건을 통에 넣고 빼요", description: "물건을 통에 넣고 빼는 놀이를 하며 공간 개념을 배웁니다.", emoji: "📦" },
      { id: "8_fine_3", domain: "fine_motor", title: "손가락으로 음식을 집어 먹어요", description: "핑거 푸드를 손가락으로 집어 입에 넣을 수 있습니다.", emoji: "🍪" },
      { id: "8_lang_1", domain: "language", title: "'엄마', '아빠' 소리를 내요", description: "의미를 정확히 알지는 못하지만 '맘마', '빠빠' 소리를 자주 냅니다.", emoji: "🗣️" },
      { id: "8_lang_2", domain: "language", title: "간단한 지시를 이해해요", description: "'이리 와', '줘봐' 같은 간단한 지시를 이해하고 반응합니다.", emoji: "✅" },
      { id: "8_lang_3", domain: "language", title: "고개를 저으며 '싫어'를 표현해요", description: "싫은 것에 대해 고개를 젓거나 손으로 밀어내며 거부를 표현합니다.", emoji: "🙅" },
      { id: "8_social_1", domain: "social", title: "까꿍 놀이를 스스로 시작해요", description: "양육자에게 먼저 까꿍 놀이를 시도하며 상호작용을 주도합니다.", emoji: "🙈" },
      { id: "8_social_2", domain: "social", title: "행동을 모방해요", description: "박수치기, 손 흔들기 등 양육자의 행동을 따라합니다.", emoji: "🪞" },
      { id: "8_social_3", domain: "social", title: "관심 있는 것을 손가락으로 가리켜요", description: "원하는 것이나 관심 있는 대상을 손가락으로 가리키며 공유합니다.", emoji: "👆" },
      { id: "8_social_4", domain: "social", title: "낯선 사람에게 경계심을 보여요", description: "익숙하지 않은 사람에게 불안하거나 경계하는 모습을 보입니다.", emoji: "😨" },
    ],
  },
  {
    month: 9,
    milestones: [
      { id: "9_gross_1", domain: "gross_motor", title: "붙잡고 서서 한 손을 뗄 수 있어요", description: "가구를 잡고 서서 한 손을 떼고 균형을 잡을 수 있습니다.", emoji: "🧍" },
      { id: "9_gross_2", domain: "gross_motor", title: "가구를 따라 옆걸음을 해요", description: "가구를 잡고 능숙하게 옆으로 이동하며 탐색 범위를 넓힙니다.", emoji: "🚶" },
      { id: "9_gross_3", domain: "gross_motor", title: "기어서 계단을 오르려 해요", description: "계단을 발견하면 기어서 올라가려 시도합니다. 안전에 주의하세요!", emoji: "⬆️" },
      { id: "9_fine_1", domain: "fine_motor", title: "블록을 쌓으려 시도해요", description: "블록 2개를 쌓으려 시도하지만 아직 쉽게 무너질 수 있어요.", emoji: "🧱" },
      { id: "9_fine_2", domain: "fine_motor", title: "책장을 넘길 수 있어요", description: "두꺼운 책의 페이지를 넘길 수 있게 됩니다.", emoji: "📖" },
      { id: "9_fine_3", domain: "fine_motor", title: "숟가락을 잡고 입에 가져가요", description: "숟가락을 잡고 입으로 가져가는 시도를 하며, 스스로 먹기의 시작이에요.", emoji: "🥄" },
      { id: "9_lang_1", domain: "language", title: "'엄마', '아빠'를 의미 있게 말해요", description: "엄마를 보고 '엄마', 아빠를 보고 '아빠'라고 의미 있게 부릅니다.", emoji: "❤️" },
      { id: "9_lang_2", domain: "language", title: "간단한 질문에 몸으로 대답해요", description: "'공 어디 있어?'라고 물으면 공을 찾아 가리킬 수 있습니다.", emoji: "❓" },
      { id: "9_lang_3", domain: "language", title: "의미 있는 몸짓을 사용해요", description: "손을 흔들어 '안녕', 고개를 끄덕이거나 젓는 등의 몸짓을 사용합니다.", emoji: "👋" },
      { id: "9_social_1", domain: "social", title: "어른의 행동을 따라 해요", description: "전화기를 귀에 대거나, 빗으로 머리를 빗는 흉내를 냅니다.", emoji: "📱" },
      { id: "9_social_2", domain: "social", title: "간단한 게임 규칙을 이해해요", description: "'공 주세요' 하면 공을 굴려주는 등 주고받기 놀이를 할 수 있어요.", emoji: "⚽" },
      { id: "9_social_3", domain: "social", title: "관심을 끌기 위한 행동을 해요", description: "양육자의 관심을 끌기 위해 소리를 지르거나 물건을 던지기도 합니다.", emoji: "📣" },
    ],
  },
  {
    month: 10,
    milestones: [
      { id: "10_gross_1", domain: "gross_motor", title: "혼자 잠깐 서 있을 수 있어요", description: "아무것도 잡지 않고 몇 초간 혼자 서 있을 수 있습니다.", emoji: "🧍" },
      { id: "10_gross_2", domain: "gross_motor", title: "손을 잡아주면 걸어요", description: "양육자의 손을 잡으면 한 발씩 걸음을 뗄 수 있습니다.", emoji: "🚶" },
      { id: "10_gross_3", domain: "gross_motor", title: "가구 사이를 옮겨 다녀요", description: "한 가구에서 다른 가구로 손을 옮겨 잡으며 이동합니다.", emoji: "🔄" },
      { id: "10_fine_1", domain: "fine_motor", title: "정교한 핀서 그래스프를 해요", description: "엄지와 검지 끝으로 아주 작은 물건도 정밀하게 집을 수 있습니다.", emoji: "🤏" },
      { id: "10_fine_2", domain: "fine_motor", title: "블록 2-3개를 쌓아요", description: "블록을 2-3개까지 쌓을 수 있게 되며, 무너지면 다시 시도합니다.", emoji: "🧱" },
      { id: "10_fine_3", domain: "fine_motor", title: "뚜껑을 열고 닫으려 해요", description: "통의 뚜껑을 열고 닫는 행동을 반복하며 탐색합니다.", emoji: "📦" },
      { id: "10_fine_4", domain: "fine_motor", title: "크레용으로 끄적거려요", description: "크레용을 잡고 종이에 끄적거리는 시도를 합니다.", emoji: "🖍️" },
      { id: "10_lang_1", domain: "language", title: "1-2개의 단어를 말해요", description: "'엄마', '아빠' 외에 '맘마', '까까' 등의 단어를 사용합니다.", emoji: "🗣️" },
      { id: "10_lang_2", domain: "language", title: "'주세요' 등의 요구를 이해해요", description: "일상적인 요구 사항의 의미를 이해하고 적절히 반응합니다.", emoji: "🤲" },
      { id: "10_lang_3", domain: "language", title: "책을 읽어주면 집중해요", description: "짧은 그림책을 읽어주면 집중하며 그림을 가리키기도 합니다.", emoji: "📚" },
      { id: "10_social_1", domain: "social", title: "박수를 치며 기뻐해요", description: "기분 좋을 때 스스로 박수를 치며 기쁨을 표현합니다.", emoji: "👏" },
      { id: "10_social_2", domain: "social", title: "가족과 낯선 사람을 구분해요", description: "가족 구성원을 확실히 알아보고 낯선 사람과 구별합니다.", emoji: "👨‍👩‍👧" },
      { id: "10_social_3", domain: "social", title: "원하는 것을 분명히 표현해요", description: "원하는 물건을 가리키고, 소리를 내고, 몸짓으로 의사를 전달합니다.", emoji: "☝️" },
    ],
  },
  {
    month: 11,
    milestones: [
      { id: "11_gross_1", domain: "gross_motor", title: "혼자 서 있는 시간이 길어져요", description: "지지 없이 10초 이상 혼자 서 있을 수 있게 됩니다.", emoji: "🧍" },
      { id: "11_gross_2", domain: "gross_motor", title: "한 손만 잡으면 걸어요", description: "한 손만 잡아줘도 걸을 수 있으며, 곧 독립 보행에 가까워지고 있어요.", emoji: "🤝" },
      { id: "11_gross_3", domain: "gross_motor", title: "쪼그리고 앉았다 일어서요", description: "서 있는 상태에서 쪼그리고 앉아 물건을 줍고 다시 일어설 수 있습니다.", emoji: "⬆️" },
      { id: "11_gross_4", domain: "gross_motor", title: "계단을 기어서 올라가요", description: "계단을 네 발로 기어서 올라갈 수 있습니다. 내려오기는 아직 어려워요.", emoji: "🪜" },
      { id: "11_fine_1", domain: "fine_motor", title: "물건을 정확하게 놓을 수 있어요", description: "물건을 원하는 위치에 정확히 놓을 수 있게 됩니다.", emoji: "🎯" },
      { id: "11_fine_2", domain: "fine_motor", title: "숟가락으로 먹으려 시도해요", description: "숟가락에 음식을 담아 입으로 가져가려 하지만, 아직 많이 흘립니다.", emoji: "🥄" },
      { id: "11_fine_3", domain: "fine_motor", title: "간단한 모양 맞추기를 해요", description: "동그라미 모양을 맞는 구멍에 넣으려 시도합니다.", emoji: "🔵" },
      { id: "11_lang_1", domain: "language", title: "2-3개의 의미 있는 단어를 말해요", description: "'엄마', '아빠', '맘마', '까까' 등 의미를 알고 사용하는 단어가 늘어납니다.", emoji: "📝" },
      { id: "11_lang_2", domain: "language", title: "간단한 지시를 따를 수 있어요", description: "'신발 가져와', '앉아' 등 간단한 지시를 이해하고 따릅니다.", emoji: "✅" },
      { id: "11_lang_3", domain: "language", title: "억양이 있는 옹알이를 해요", description: "마치 문장을 말하는 것처럼 억양과 리듬이 있는 옹알이를 합니다.", emoji: "🎵" },
      { id: "11_social_1", domain: "social", title: "어른 흉내를 내며 놀아요", description: "전화하기, 청소하기, 요리하기 등 어른의 행동을 모방합니다.", emoji: "🧹" },
      { id: "11_social_2", domain: "social", title: "책 읽기를 요청해요", description: "좋아하는 책을 가져와 읽어달라고 내밀며 요청합니다.", emoji: "📚" },
      { id: "11_social_3", domain: "social", title: "안녕, 빠이빠이를 해요", description: "사람이 떠날 때 손을 흔들며 인사할 수 있습니다.", emoji: "👋" },
    ],
  },
  {
    month: 12,
    milestones: [
      { id: "12_gross_1", domain: "gross_motor", title: "첫 걸음을 떼요", description: "드디어 혼자 걸을 수 있게 됩니다! 아직 불안정하지만 큰 발달 이정표예요.", emoji: "🎉" },
      { id: "12_gross_2", domain: "gross_motor", title: "혼자 서서 균형을 잡아요", description: "안정적으로 혼자 서 있으며 균형을 잘 유지할 수 있습니다.", emoji: "🧍" },
      { id: "12_gross_3", domain: "gross_motor", title: "앉았다 일어서기가 자유로워요", description: "도움 없이 바닥에서 일어서고 다시 앉을 수 있습니다.", emoji: "🔄" },
      { id: "12_gross_4", domain: "gross_motor", title: "공을 굴리거나 던져요", description: "공을 앞으로 굴리거나 던질 수 있게 됩니다.", emoji: "⚽" },
      { id: "12_fine_1", domain: "fine_motor", title: "블록 3-4개를 쌓아요", description: "블록을 3-4개까지 안정적으로 쌓을 수 있습니다.", emoji: "🧱" },
      { id: "12_fine_2", domain: "fine_motor", title: "크레용으로 선을 그어요", description: "크레용을 잡고 종이에 선을 긋는 낙서를 할 수 있습니다.", emoji: "🖍️" },
      { id: "12_fine_3", domain: "fine_motor", title: "컵으로 마실 수 있어요", description: "양손으로 컵을 잡고 음료를 마실 수 있습니다.", emoji: "🥤" },
      { id: "12_fine_4", domain: "fine_motor", title: "숟가락 사용이 나아져요", description: "숟가락으로 음식을 떠서 입으로 가져가는 것이 점점 능숙해집니다.", emoji: "🥄" },
      { id: "12_lang_1", domain: "language", title: "3-5개의 단어를 말해요", description: "의미를 이해하고 사용하는 어휘가 3-5개로 늘어납니다.", emoji: "🗣️" },
      { id: "12_lang_2", domain: "language", title: "간단한 요구 사항을 말로 해요", description: "'줘', '더', '싫어' 등 간단한 요구를 말로 표현합니다.", emoji: "💬" },
      { id: "12_lang_3", domain: "language", title: "동물 소리를 흉내 내요", description: "강아지, 고양이 등 동물 소리를 흉내 내려 시도합니다.", emoji: "🐶" },
      { id: "12_lang_4", domain: "language", title: "50개 이상의 단어를 이해해요", description: "말하지는 못하지만 이해하는 단어가 50개 이상이 됩니다.", emoji: "🧠" },
      { id: "12_social_1", domain: "social", title: "간단한 역할 놀이를 해요", description: "인형에게 밥 먹이기, 재우기 등 간단한 역할 놀이를 합니다.", emoji: "🎭" },
      { id: "12_social_2", domain: "social", title: "다른 아이와 나란히 놀아요", description: "또래 아이 옆에서 병행 놀이(parallel play)를 할 수 있습니다.", emoji: "👫" },
      { id: "12_social_3", domain: "social", title: "칭찬에 반응하고 반복해요", description: "칭찬받은 행동을 기억하고 다시 반복하려 합니다.", emoji: "⭐" },
      { id: "12_social_4", domain: "social", title: "감정 표현이 다양해져요", description: "기쁨, 슬픔, 화남, 두려움 등 다양한 감정을 표현할 수 있습니다.", emoji: "🎨" },
    ],
  },
];

export function getMilestonesForMonth(month: number): MonthMilestones | undefined {
  return milestoneData.find((m) => m.month === month);
}

export function getAllMilestoneData(): MonthMilestones[] {
  return milestoneData;
}
