export interface RecommendedActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  materials: string[];
  developmentAreas: string[];
  emoji: string;
  difficulty: "easy" | "medium";
  ageRange: string;
}

export interface MonthActivities {
  month: number;
  activities: RecommendedActivity[];
}

const allMonthActivities: MonthActivities[] = [
  {
    month: 0,
    activities: [
      {
        id: "act_0_1",
        title: "흑백 모빌 보여주기",
        description:
          "아기의 눈에서 20~30cm 거리에 흑백 모빌을 걸어주세요. 신생아는 흑백 대비가 강한 패턴을 가장 잘 인식합니다. 천천히 움직이며 아기의 시선이 따라가는지 관찰해 보세요.",
        duration: "5~10분",
        materials: ["흑백 모빌", "아기 매트"],
        developmentAreas: ["시각 발달", "집중력"],
        emoji: "🎯",
        difficulty: "easy",
        ageRange: "0~2개월",
      },
      {
        id: "act_0_2",
        title: "터미 타임 (엎드려 놀기)",
        description:
          "깨어 있을 때 아기를 엎드려 놓고 짧은 시간 연습시켜 주세요. 처음에는 1~2분부터 시작하고 점차 시간을 늘려가세요. 목과 어깨 근육 발달에 매우 중요합니다.",
        duration: "1~3분",
        materials: ["부드러운 매트", "작은 쿠션"],
        developmentAreas: ["목 근육 발달", "운동 능력"],
        emoji: "💪",
        difficulty: "easy",
        ageRange: "0~1개월",
      },
      {
        id: "act_0_3",
        title: "음악 들려주기",
        description:
          "부드러운 클래식 음악이나 자장가를 들려주세요. 엄마 아빠의 목소리로 직접 불러주면 더욱 좋습니다. 아기가 소리에 반응하는지 표정을 관찰해 보세요.",
        duration: "10~15분",
        materials: ["스피커 또는 오르골"],
        developmentAreas: ["청각 발달", "정서 안정"],
        emoji: "🎵",
        difficulty: "easy",
        ageRange: "0~2개월",
      },
      {
        id: "act_0_4",
        title: "얼굴 가까이 보여주기",
        description:
          "아기와 눈을 맞추며 다양한 표정을 지어주세요. 신생아는 사람의 얼굴에 가장 큰 관심을 보입니다. 말을 걸며 미소를 지으면 유대감 형성에 도움이 됩니다.",
        duration: "5~10분",
        materials: [],
        developmentAreas: ["사회성 발달", "시각 발달"],
        emoji: "😊",
        difficulty: "easy",
        ageRange: "0~1개월",
      },
      {
        id: "act_0_5",
        title: "손바닥 자극 놀이",
        description:
          "아기의 손바닥을 부드럽게 만져주거나 손가락을 쥐게 해주세요. 파악 반사를 이용한 자연스러운 놀이로, 손의 감각 발달에 도움이 됩니다.",
        duration: "3~5분",
        materials: [],
        developmentAreas: ["촉각 발달", "소근육 발달"],
        emoji: "✋",
        difficulty: "easy",
        ageRange: "0~1개월",
      },
    ],
  },
  {
    month: 1,
    activities: [
      {
        id: "act_1_1",
        title: "빨간색 장난감 따라가기",
        description:
          "선명한 빨간색 장난감을 아기 눈앞에서 천천히 좌우로 움직여주세요. 아기가 시선으로 따라가는 추적 능력을 발달시킬 수 있습니다. 약 20cm 거리에서 천천히 움직여 주세요.",
        duration: "5~10분",
        materials: ["빨간색 장난감", "딸랑이"],
        developmentAreas: ["시각 추적", "집중력"],
        emoji: "🔴",
        difficulty: "easy",
        ageRange: "1~2개월",
      },
      {
        id: "act_1_2",
        title: "다양한 소리 들려주기",
        description:
          "딸랑이, 종이 구기는 소리, 물소리 등 다양한 소리를 아기에게 들려주세요. 소리가 나는 방향으로 고개를 돌리는지 관찰하며 청각 발달을 자극해 주세요.",
        duration: "5~10분",
        materials: ["딸랑이", "바스락거리는 종이"],
        developmentAreas: ["청각 발달", "소리 방향 인지"],
        emoji: "🔔",
        difficulty: "easy",
        ageRange: "1~2개월",
      },
      {
        id: "act_1_3",
        title: "아기 마사지",
        description:
          "베이비 오일을 손에 바르고 아기의 팔, 다리, 배를 부드럽게 마사지해 주세요. 혈액 순환과 소화를 돕고 안정감을 줍니다. 목욕 후나 잠자기 전에 하면 좋습니다.",
        duration: "10~15분",
        materials: ["베이비 오일", "부드러운 타올"],
        developmentAreas: ["촉각 발달", "정서 안정"],
        emoji: "🤲",
        difficulty: "easy",
        ageRange: "1~3개월",
      },
      {
        id: "act_1_4",
        title: "말 걸어주기 놀이",
        description:
          "아기에게 일상을 설명하듯 계속 말을 걸어주세요. '기저귀 갈자~', '맘마 먹자~' 등 반복적인 말이 좋습니다. 아기는 목소리의 억양과 리듬에 반응합니다.",
        duration: "수시로",
        materials: [],
        developmentAreas: ["언어 발달", "유대감 형성"],
        emoji: "💬",
        difficulty: "easy",
        ageRange: "1~3개월",
      },
      {
        id: "act_1_5",
        title: "컬러풀 모빌 보기",
        description:
          "흑백에서 점차 원색 모빌로 바꿔주세요. 1개월이 되면 아기의 색 인식 능력이 발달하기 시작합니다. 빨강, 노랑 등 선명한 색상의 모빌을 매달아 주세요.",
        duration: "10~15분",
        materials: ["컬러 모빌"],
        developmentAreas: ["색 인식", "시각 발달"],
        emoji: "🌈",
        difficulty: "easy",
        ageRange: "1~2개월",
      },
    ],
  },
  {
    month: 2,
    activities: [
      {
        id: "act_2_1",
        title: "손 인형 놀이",
        description:
          "손 인형을 끼고 아기에게 말을 걸어보세요. 다양한 목소리와 표정으로 아기의 관심을 끌어주세요. 아기가 인형을 바라보며 옹알이를 시작할 수 있습니다.",
        duration: "5~10분",
        materials: ["손 인형"],
        developmentAreas: ["사회성 발달", "시각 집중"],
        emoji: "🧸",
        difficulty: "easy",
        ageRange: "2~4개월",
      },
      {
        id: "act_2_2",
        title: "거울 보기",
        description:
          "아기에게 깨지지 않는 안전 거울을 보여주세요. 거울 속 자신의 모습에 반응하는 것을 관찰해 보세요. 자기 인식 발달의 첫 단계가 됩니다.",
        duration: "5~10분",
        materials: ["안전 거울 (아기용)"],
        developmentAreas: ["자기 인식", "시각 발달"],
        emoji: "🪞",
        difficulty: "easy",
        ageRange: "2~4개월",
      },
      {
        id: "act_2_3",
        title: "발차기 놀이",
        description:
          "아기 발이 닿는 곳에 소리나는 장난감을 놓아주세요. 발로 차면 소리가 나는 것을 경험하며 인과관계를 배웁니다. 아기 체육관(짐)을 활용해도 좋습니다.",
        duration: "10~15분",
        materials: ["아기 체육관(짐)", "소리나는 장난감"],
        developmentAreas: ["대근육 발달", "인과관계 학습"],
        emoji: "🦶",
        difficulty: "easy",
        ageRange: "2~4개월",
      },
      {
        id: "act_2_4",
        title: "노래 불러주기",
        description:
          "동요나 자장가를 직접 불러주세요. '곰 세 마리', '나비야' 같은 반복적인 노래가 좋습니다. 손동작을 함께 하면 시각과 청각을 동시에 자극할 수 있습니다.",
        duration: "10분",
        materials: [],
        developmentAreas: ["청각 발달", "언어 발달"],
        emoji: "🎤",
        difficulty: "easy",
        ageRange: "2~4개월",
      },
      {
        id: "act_2_5",
        title: "옹알이 대화",
        description:
          "아기가 옹알이를 하면 같은 소리로 대답해 주세요. '아~' 하면 '아~ 그래?' 하고 반응해 주세요. 대화의 주고받기 패턴을 자연스럽게 배우게 됩니다.",
        duration: "수시로",
        materials: [],
        developmentAreas: ["언어 발달", "의사소통"],
        emoji: "🗣️",
        difficulty: "easy",
        ageRange: "2~4개월",
      },
    ],
  },
  {
    month: 3,
    activities: [
      {
        id: "act_3_1",
        title: "딸랑이 놀이",
        description:
          "아기 손에 가벼운 딸랑이를 쥐어주세요. 흔들면 소리가 나는 것을 발견하고 반복하게 됩니다. 손의 파악력과 인과관계 이해에 도움이 됩니다.",
        duration: "5~10분",
        materials: ["딸랑이", "가벼운 손잡이 장난감"],
        developmentAreas: ["소근육 발달", "인과관계 학습"],
        emoji: "🎊",
        difficulty: "easy",
        ageRange: "3~5개월",
      },
      {
        id: "act_3_2",
        title: "거울 보며 표정 놀이",
        description:
          "거울 앞에서 아기를 안고 다양한 표정을 지어보세요. 웃기, 놀라기, 혀 내밀기 등을 보여주세요. 아기가 표정을 따라하려고 시도하는 것을 볼 수 있습니다.",
        duration: "5~10분",
        materials: ["거울"],
        developmentAreas: ["사회성 발달", "모방 능력"],
        emoji: "🤗",
        difficulty: "easy",
        ageRange: "3~5개월",
      },
      {
        id: "act_3_3",
        title: "물건 잡기 연습",
        description:
          "부드럽고 잡기 쉬운 장난감을 아기 손이 닿을 곳에 놓아주세요. 스스로 손을 뻗어 잡는 연습을 합니다. 다양한 질감의 장난감으로 촉각도 자극해 주세요.",
        duration: "10분",
        materials: ["부드러운 장난감", "촉감 공"],
        developmentAreas: ["눈-손 협응", "소근육 발달"],
        emoji: "🤏",
        difficulty: "easy",
        ageRange: "3~5개월",
      },
      {
        id: "act_3_4",
        title: "비행기 놀이",
        description:
          "아기를 안전하게 들어 올려 '비행기~' 하고 좌우로 움직여 주세요. 공간 감각과 균형 감각을 발달시키고 즐거운 경험을 제공합니다. 목을 충분히 가눌 때 시작하세요.",
        duration: "3~5분",
        materials: [],
        developmentAreas: ["균형 감각", "공간 인지"],
        emoji: "✈️",
        difficulty: "easy",
        ageRange: "3~5개월",
      },
      {
        id: "act_3_5",
        title: "촉감 놀이",
        description:
          "다양한 촉감의 천(실크, 면, 벨벳)을 아기 손이나 발에 대어주세요. 각각의 느낌이 다르다는 것을 경험하게 합니다. 안전한 소재만 사용해 주세요.",
        duration: "5~10분",
        materials: ["다양한 촉감 천", "촉감 책"],
        developmentAreas: ["촉각 발달", "감각 탐색"],
        emoji: "🧶",
        difficulty: "easy",
        ageRange: "3~5개월",
      },
    ],
  },
  {
    month: 4,
    activities: [
      {
        id: "act_4_1",
        title: "까꿍 놀이",
        description:
          "손이나 천으로 얼굴을 가렸다가 '까꿍!' 하고 보여주세요. 대상 영속성을 배우는 중요한 놀이입니다. 아기가 까르르 웃으면 반복해 주세요.",
        duration: "5~10분",
        materials: ["손수건", "작은 담요"],
        developmentAreas: ["대상 영속성", "인지 발달"],
        emoji: "🙈",
        difficulty: "easy",
        ageRange: "4~6개월",
      },
      {
        id: "act_4_2",
        title: "뒤집기 도와주기",
        description:
          "아기가 뒤집기를 시도할 때 엉덩이를 살짝 밀어 도와주세요. 장난감으로 관심을 끌어 옆으로 돌게 유도하세요. 앞뒤로 뒤집는 연습을 반복해 주세요.",
        duration: "5~10분",
        materials: ["관심 끌 장난감", "매트"],
        developmentAreas: ["대근육 발달", "신체 조절력"],
        emoji: "🔄",
        difficulty: "easy",
        ageRange: "4~6개월",
      },
      {
        id: "act_4_3",
        title: "소리 나는 장난감 찾기",
        description:
          "아기 주변에서 소리 나는 장난감을 흔들어 소리의 방향을 찾게 해주세요. 왼쪽, 오른쪽, 위 등 다양한 위치에서 소리를 내보세요.",
        duration: "5~10분",
        materials: ["소리 나는 장난감 여러 개"],
        developmentAreas: ["청각 발달", "방향 인지"],
        emoji: "🔊",
        difficulty: "easy",
        ageRange: "4~6개월",
      },
      {
        id: "act_4_4",
        title: "발 잡기 놀이",
        description:
          "아기가 누운 상태에서 자기 발을 잡도록 유도해 주세요. 양말에 방울을 달아주면 관심을 가지고 발을 잡으려 합니다. 신체 인식 발달에 중요합니다.",
        duration: "5~10분",
        materials: ["방울 양말"],
        developmentAreas: ["신체 인식", "유연성"],
        emoji: "🦶",
        difficulty: "easy",
        ageRange: "4~6개월",
      },
      {
        id: "act_4_5",
        title: "풍선 관찰하기",
        description:
          "헬륨 풍선을 아기 발에 리본으로 묶어주세요(안전 주의). 발을 차면 풍선이 움직이는 것을 보며 인과관계를 학습합니다. 항상 보호자 감독하에 진행하세요.",
        duration: "10분",
        materials: ["풍선", "리본"],
        developmentAreas: ["인과관계 학습", "시각 추적"],
        emoji: "🎈",
        difficulty: "medium",
        ageRange: "4~6개월",
      },
    ],
  },
  {
    month: 5,
    activities: [
      {
        id: "act_5_1",
        title: "물건 옮겨 잡기",
        description:
          "아기에게 장난감을 쥐어주고, 다른 손에도 장난감을 주세요. 한 손에서 다른 손으로 물건을 옮기는 연습을 합니다. 양손 협응력이 발달합니다.",
        duration: "5~10분",
        materials: ["작은 장난감 2개"],
        developmentAreas: ["양손 협응", "소근육 발달"],
        emoji: "🤹",
        difficulty: "easy",
        ageRange: "5~7개월",
      },
      {
        id: "act_5_2",
        title: "까꿍 담요 놀이",
        description:
          "장난감을 담요로 반쯤 덮고 아기가 찾게 해주세요. 점점 더 많이 가리면서 난이도를 올려보세요. 대상 영속성 개념이 발달합니다.",
        duration: "5~10분",
        materials: ["담요", "좋아하는 장난감"],
        developmentAreas: ["대상 영속성", "문제 해결"],
        emoji: "🔍",
        difficulty: "easy",
        ageRange: "5~7개월",
      },
      {
        id: "act_5_3",
        title: "앉기 연습",
        description:
          "아기를 앉혀놓고 쿠션으로 지지해 주세요. 앞에 장난감을 놓아 관심을 유지시키세요. 균형을 잡으며 코어 근육이 발달합니다.",
        duration: "5~10분",
        materials: ["지지용 쿠션", "장난감"],
        developmentAreas: ["대근육 발달", "균형 감각"],
        emoji: "🧘",
        difficulty: "easy",
        ageRange: "5~7개월",
      },
      {
        id: "act_5_4",
        title: "입에 넣기 탐색",
        description:
          "안전한 치발기나 장난감을 제공하여 입으로 탐색하게 해주세요. 이 시기 아기는 입으로 물건을 탐색합니다. 삼킬 수 없는 크기의 안전한 것만 주세요.",
        duration: "10~15분",
        materials: ["치발기", "안전 장난감"],
        developmentAreas: ["감각 탐색", "구강 발달"],
        emoji: "👄",
        difficulty: "easy",
        ageRange: "5~7개월",
      },
    ],
  },
  {
    month: 6,
    activities: [
      {
        id: "act_6_1",
        title: "까꿍 놀이 (변형)",
        description:
          "다양한 변형으로 까꿍 놀이를 해보세요. 문 뒤에 숨었다 나타나기, 상자 뒤에 숨기 등 장소를 바꿔가며 놀아주세요. 아기가 직접 숨으려고 시도하기도 합니다.",
        duration: "10~15분",
        materials: ["큰 상자", "담요"],
        developmentAreas: ["대상 영속성", "사회성 발달"],
        emoji: "🙈",
        difficulty: "easy",
        ageRange: "6~8개월",
      },
      {
        id: "act_6_2",
        title: "블록 쌓기",
        description:
          "부드러운 블록을 쌓아 보여주고 아기가 무너뜨리게 해주세요. 이 시기에는 쌓기보다 무너뜨리기를 더 좋아합니다. 인과관계와 공간 개념을 배웁니다.",
        duration: "10~15분",
        materials: ["소프트 블록", "쌓기 장난감"],
        developmentAreas: ["인과관계 학습", "소근육 발달"],
        emoji: "🧱",
        difficulty: "easy",
        ageRange: "6~8개월",
      },
      {
        id: "act_6_3",
        title: "컵 쌓기 놀이",
        description:
          "여러 크기의 컵을 쌓거나 겹쳐 보여주세요. 아기가 컵을 집어 탐색하고, 작은 컵을 큰 컵 안에 넣는 것을 시도합니다. 크기 개념을 자연스럽게 배웁니다.",
        duration: "10분",
        materials: ["스태킹 컵"],
        developmentAreas: ["크기 인지", "눈-손 협응"],
        emoji: "🥤",
        difficulty: "easy",
        ageRange: "6~9개월",
      },
      {
        id: "act_6_4",
        title: "박수 치기 놀이",
        description:
          "'짝짜꿍' 노래에 맞춰 박수를 쳐보세요. 아기의 손을 잡고 함께 박수를 치게 도와주세요. 리듬감과 사회적 상호작용 능력이 발달합니다.",
        duration: "5~10분",
        materials: [],
        developmentAreas: ["리듬감", "사회적 상호작용"],
        emoji: "👏",
        difficulty: "easy",
        ageRange: "6~8개월",
      },
      {
        id: "act_6_5",
        title: "이유식 탐색 놀이",
        description:
          "으깬 바나나, 부드러운 두부 등을 손으로 만지고 탐색하게 해주세요. 음식의 질감을 경험하며 감각이 발달합니다. 지저분해져도 괜찮으니 자유롭게 탐색시켜 주세요.",
        duration: "10~20분",
        materials: ["부드러운 이유식", "턱받이", "매트"],
        developmentAreas: ["촉각 발달", "자기 주도 식사"],
        emoji: "🍌",
        difficulty: "medium",
        ageRange: "6~8개월",
      },
    ],
  },
  {
    month: 7,
    activities: [
      {
        id: "act_7_1",
        title: "기어가기 유도",
        description:
          "아기가 좋아하는 장난감을 살짝 멀리 놓아 기어가도록 유도하세요. 엎드린 상태에서 팔과 다리를 사용해 앞으로 이동하는 연습을 합니다. 안전한 공간을 확보해 주세요.",
        duration: "10~15분",
        materials: ["좋아하는 장난감", "안전 매트"],
        developmentAreas: ["대근육 발달", "이동 능력"],
        emoji: "🏃",
        difficulty: "easy",
        ageRange: "7~9개월",
      },
      {
        id: "act_7_2",
        title: "물놀이",
        description:
          "목욕 시간에 물에 뜨는 장난감으로 놀이를 해주세요. 컵으로 물을 따르고, 물장구를 치며 물의 성질을 탐색합니다. 항상 보호자가 함께 해주세요.",
        duration: "15~20분",
        materials: ["물놀이 장난감", "작은 컵", "물 뜨는 장난감"],
        developmentAreas: ["감각 탐색", "인과관계 학습"],
        emoji: "🛁",
        difficulty: "easy",
        ageRange: "7~9개월",
      },
      {
        id: "act_7_3",
        title: "두드리기 놀이",
        description:
          "냄비, 나무 숟가락 등 안전한 물건을 주고 두드리게 해주세요. 다양한 소리를 만들어내며 리듬감과 인과관계를 경험합니다. 아기만의 음악을 만들어 보세요.",
        duration: "10분",
        materials: ["냄비", "나무 숟가락", "플라스틱 그릇"],
        developmentAreas: ["청각 발달", "리듬감"],
        emoji: "🥁",
        difficulty: "easy",
        ageRange: "7~9개월",
      },
      {
        id: "act_7_4",
        title: "상자 열고 닫기",
        description:
          "뚜껑이 있는 작은 상자에 장난감을 넣고 아기가 열어보게 해주세요. 뚜껑을 열면 장난감이 나타나는 놀이를 반복합니다. 문제 해결 능력을 기릅니다.",
        duration: "10분",
        materials: ["뚜껑 있는 상자", "작은 장난감"],
        developmentAreas: ["문제 해결", "소근육 발달"],
        emoji: "📦",
        difficulty: "medium",
        ageRange: "7~9개월",
      },
      {
        id: "act_7_5",
        title: "손 흔들기 (바이바이)",
        description:
          "바이바이 손 흔들기를 보여주고 따라하게 해주세요. 헤어질 때마다 반복하면 자연스럽게 배웁니다. 사회적 제스처를 배우는 첫 단계입니다.",
        duration: "수시로",
        materials: [],
        developmentAreas: ["사회성 발달", "모방 능력"],
        emoji: "👋",
        difficulty: "easy",
        ageRange: "7~10개월",
      },
    ],
  },
  {
    month: 8,
    activities: [
      {
        id: "act_8_1",
        title: "그림책 읽기",
        description:
          "두꺼운 보드북을 함께 보며 그림을 가리키고 이름을 말해주세요. '멍멍이 어디 있지?' 하고 질문하며 아기의 반응을 유도하세요. 아기가 직접 책장을 넘기게 해주세요.",
        duration: "10~15분",
        materials: ["보드북", "촉감 책"],
        developmentAreas: ["언어 발달", "인지 발달"],
        emoji: "📚",
        difficulty: "easy",
        ageRange: "8~10개월",
      },
      {
        id: "act_8_2",
        title: "통 안에 넣고 빼기",
        description:
          "작은 블록이나 공을 통 안에 넣고 빼는 놀이를 해보세요. 넣을 때와 꺼낼 때의 동작을 반복하며 소근육이 발달합니다. 아기가 스스로 시도하게 격려해 주세요.",
        duration: "10분",
        materials: ["넓은 입구 통", "작은 공이나 블록"],
        developmentAreas: ["소근육 발달", "공간 개념"],
        emoji: "🪣",
        difficulty: "easy",
        ageRange: "8~10개월",
      },
      {
        id: "act_8_3",
        title: "숨바꼭질 놀이",
        description:
          "장난감을 담요 아래 완전히 숨기고 아기가 찾게 해보세요. '어디 갔지~?' 하고 물으면 아기가 담요를 들추어 찾습니다. 대상 영속성이 완성되어 가는 시기입니다.",
        duration: "10분",
        materials: ["담요", "좋아하는 장난감"],
        developmentAreas: ["대상 영속성", "기억력"],
        emoji: "🕵️",
        difficulty: "easy",
        ageRange: "8~10개월",
      },
      {
        id: "act_8_4",
        title: "끌기 장난감 놀이",
        description:
          "줄이 달린 장난감을 끌어당기는 놀이를 해보세요. 줄을 당기면 장난감이 다가오는 인과관계를 경험합니다. 기어다니며 장난감을 끌고 다니기도 합니다.",
        duration: "10분",
        materials: ["끌기 장난감"],
        developmentAreas: ["인과관계 학습", "대근육 발달"],
        emoji: "🚂",
        difficulty: "easy",
        ageRange: "8~10개월",
      },
      {
        id: "act_8_5",
        title: "동물 소리 흉내",
        description:
          "동물 그림을 보여주며 소리를 흉내 내주세요. '강아지는 멍멍!', '고양이는 야옹~' 하고 반복해 주세요. 아기가 따라서 소리를 내려고 시도합니다.",
        duration: "10분",
        materials: ["동물 그림책", "동물 인형"],
        developmentAreas: ["언어 발달", "모방 능력"],
        emoji: "🐶",
        difficulty: "easy",
        ageRange: "8~11개월",
      },
    ],
  },
  {
    month: 9,
    activities: [
      {
        id: "act_9_1",
        title: "공 굴리기",
        description:
          "아기와 마주 앉아 부드러운 공을 굴려보세요. 공을 받아 다시 굴려보내는 놀이를 합니다. 주고받기의 사회적 상호작용을 배우고 눈-손 협응력이 발달합니다.",
        duration: "10~15분",
        materials: ["부드러운 공"],
        developmentAreas: ["눈-손 협응", "사회적 상호작용"],
        emoji: "⚽",
        difficulty: "easy",
        ageRange: "9~11개월",
      },
      {
        id: "act_9_2",
        title: "핑거 푸드 집기",
        description:
          "작은 과일 조각, 씨리얼 등 핑거 푸드를 접시에 놓고 집어먹게 해주세요. 엄지와 검지로 집는 '집게 잡기'가 발달하는 시기입니다. 질식 위험이 없는 크기로 주세요.",
        duration: "15~20분",
        materials: ["핑거 푸드", "흡착 접시"],
        developmentAreas: ["소근육 발달", "자기 주도 식사"],
        emoji: "🫐",
        difficulty: "easy",
        ageRange: "9~11개월",
      },
      {
        id: "act_9_3",
        title: "음악에 맞춰 몸 흔들기",
        description:
          "경쾌한 음악을 틀고 함께 몸을 흔들어 보세요. 손뼉 치기, 몸 흔들기 등을 보여주면 따라합니다. 리듬감과 대근육 발달에 좋습니다.",
        duration: "10분",
        materials: ["음악 재생 장치", "마라카스"],
        developmentAreas: ["리듬감", "대근육 발달"],
        emoji: "💃",
        difficulty: "easy",
        ageRange: "9~11개월",
      },
      {
        id: "act_9_4",
        title: "쌓기 놀이",
        description:
          "블록을 2~3개 쌓는 것을 보여주고 따라하게 해주세요. 이 시기에는 무너뜨리기뿐 아니라 직접 쌓기를 시도합니다. 집중력과 소근육 조절 능력이 발달합니다.",
        duration: "10~15분",
        materials: ["큰 블록", "쌓기 장난감"],
        developmentAreas: ["소근육 발달", "집중력"],
        emoji: "🏗️",
        difficulty: "medium",
        ageRange: "9~12개월",
      },
      {
        id: "act_9_5",
        title: "그림책 가리키기",
        description:
          "그림책을 보며 '강아지 어디 있어?' 하고 물어보세요. 아기가 손가락으로 가리키는 연습을 합니다. 언어 이해력과 의사소통 능력이 크게 발달하는 시기입니다.",
        duration: "10분",
        materials: ["그림책"],
        developmentAreas: ["언어 이해", "의사소통"],
        emoji: "👆",
        difficulty: "easy",
        ageRange: "9~12개월",
      },
    ],
  },
  {
    month: 10,
    activities: [
      {
        id: "act_10_1",
        title: "서기 연습",
        description:
          "안전한 가구를 잡고 서는 연습을 도와주세요. 소파나 낮은 테이블 옆에서 장난감으로 유인하며 서게 합니다. 다리 근력과 균형감이 발달합니다.",
        duration: "10~15분",
        materials: ["안전한 가구", "장난감"],
        developmentAreas: ["대근육 발달", "균형 감각"],
        emoji: "🧍",
        difficulty: "easy",
        ageRange: "10~12개월",
      },
      {
        id: "act_10_2",
        title: "컵에 물 따르기 놀이",
        description:
          "목욕 시간에 작은 컵으로 물을 따르는 놀이를 해보세요. 한 컵에서 다른 컵으로 물을 옮기는 것을 보여주세요. 양 개념과 인과관계를 배웁니다.",
        duration: "10~15분",
        materials: ["작은 컵 2개", "물놀이 장난감"],
        developmentAreas: ["인지 발달", "소근육 발달"],
        emoji: "🥛",
        difficulty: "easy",
        ageRange: "10~12개월",
      },
      {
        id: "act_10_3",
        title: "전화 놀이",
        description:
          "장난감 전화기를 귀에 대고 '여보세요~' 하고 흉내내 보세요. 아기가 따라서 전화기를 귀에 대는 상징 놀이가 시작됩니다. 사회적 행동을 모방하는 중요한 발달 단계입니다.",
        duration: "5~10분",
        materials: ["장난감 전화기"],
        developmentAreas: ["상징 놀이", "언어 발달"],
        emoji: "📱",
        difficulty: "easy",
        ageRange: "10~12개월",
      },
      {
        id: "act_10_4",
        title: "분류 놀이",
        description:
          "큰 공과 작은 공, 빨간 블록과 파란 블록 등을 분류해 보여주세요. 아기가 비슷한 것끼리 모으려는 시도를 합니다. 분류와 범주화 개념의 기초를 배웁니다.",
        duration: "10분",
        materials: ["다양한 색상/크기의 블록이나 공"],
        developmentAreas: ["인지 발달", "분류 능력"],
        emoji: "🔵",
        difficulty: "medium",
        ageRange: "10~12개월",
      },
      {
        id: "act_10_5",
        title: "노래 율동",
        description:
          "'곰 세 마리', '머리 어깨 무릎 발' 같은 율동 노래를 함께 해보세요. 가사에 맞춰 몸을 움직이는 것을 보여주면 따라하려 합니다. 신체 인식과 언어 발달에 도움됩니다.",
        duration: "10분",
        materials: [],
        developmentAreas: ["리듬감", "신체 인식"],
        emoji: "🎶",
        difficulty: "easy",
        ageRange: "10~12개월",
      },
    ],
  },
  {
    month: 11,
    activities: [
      {
        id: "act_11_1",
        title: "걸음마 보조",
        description:
          "아기의 양손을 잡고 걸음마를 도와주세요. 점차 한 손으로 잡게 하고 혼자 서보게 합니다. 무리하지 말고 아기의 속도에 맞춰 주세요.",
        duration: "10~15분",
        materials: ["푹신한 매트"],
        developmentAreas: ["대근육 발달", "균형 감각"],
        emoji: "🚶",
        difficulty: "medium",
        ageRange: "11~12개월",
      },
      {
        id: "act_11_2",
        title: "도형 맞추기",
        description:
          "도형 맞추기 장난감(쉐이프 소터)으로 놀이를 해보세요. 동그라미부터 시작하여 세모, 네모를 맞춰보게 합니다. 공간 인지와 문제 해결 능력이 발달합니다.",
        duration: "10~15분",
        materials: ["도형 맞추기 장난감"],
        developmentAreas: ["문제 해결", "공간 인지"],
        emoji: "🔺",
        difficulty: "medium",
        ageRange: "11~12개월",
      },
      {
        id: "act_11_3",
        title: "끼적이기 놀이",
        description:
          "큰 종이와 안전한 크레용을 주고 자유롭게 끼적이게 해주세요. 색이 나타나는 것을 보며 인과관계를 경험합니다. 식용 크레용을 사용하면 안전합니다.",
        duration: "10~15분",
        materials: ["큰 종이", "안전 크레용"],
        developmentAreas: ["소근육 발달", "창의력"],
        emoji: "🖍️",
        difficulty: "easy",
        ageRange: "11~12개월",
      },
      {
        id: "act_11_4",
        title: "인형 먹이기 놀이",
        description:
          "인형에게 밥을 먹이는 흉내를 내보세요. '아~ 맛있어~' 하며 숟가락을 가져다대는 상징 놀이입니다. 아기가 따라하며 돌봄 행동을 배웁니다.",
        duration: "10분",
        materials: ["인형", "장난감 숟가락과 그릇"],
        developmentAreas: ["상징 놀이", "사회성 발달"],
        emoji: "🍼",
        difficulty: "easy",
        ageRange: "11~12개월",
      },
      {
        id: "act_11_5",
        title: "공 던지기",
        description:
          "부드러운 공을 던지는 연습을 해보세요. 처음에는 앞으로 굴리다가 점차 공중으로 던지는 것을 시도합니다. 팔 근력과 눈-손 협응력이 발달합니다.",
        duration: "10분",
        materials: ["부드러운 공"],
        developmentAreas: ["대근육 발달", "눈-손 협응"],
        emoji: "🏐",
        difficulty: "easy",
        ageRange: "11~12개월",
      },
    ],
  },
  {
    month: 12,
    activities: [
      {
        id: "act_12_1",
        title: "크레용 쥐기 & 그리기",
        description:
          "굵은 크레용을 쥐고 종이에 선을 긋는 연습을 해보세요. 동그라미, 직선 등을 그려 보여주고 따라하게 합니다. 쥐는 힘과 표현력이 발달합니다.",
        duration: "15~20분",
        materials: ["굵은 크레용", "큰 종이"],
        developmentAreas: ["소근육 발달", "창의력"],
        emoji: "🖊️",
        difficulty: "easy",
        ageRange: "12개월~",
      },
      {
        id: "act_12_2",
        title: "걷기 연습",
        description:
          "안전한 환경에서 혼자 걷는 연습을 도와주세요. 몇 걸음 앞에서 팔을 벌리고 '이리 와~' 하고 불러주세요. 넘어져도 격려해 주고 다시 시도하게 해주세요.",
        duration: "수시로",
        materials: ["안전 매트", "걸음마 보조 장난감"],
        developmentAreas: ["대근육 발달", "균형 감각"],
        emoji: "👣",
        difficulty: "medium",
        ageRange: "12개월~",
      },
      {
        id: "act_12_3",
        title: "블록 쌓기 놀이",
        description:
          "블록을 3~4개 이상 쌓아보는 놀이를 해보세요. 탑을 쌓고 무너뜨리기를 반복합니다. 쌓는 동안 '하나, 둘, 셋' 하고 세어주면 숫자 개념도 접합니다.",
        duration: "15분",
        materials: ["블록 세트"],
        developmentAreas: ["소근육 발달", "수 개념"],
        emoji: "🏰",
        difficulty: "medium",
        ageRange: "12개월~",
      },
      {
        id: "act_12_4",
        title: "그림책 함께 읽기",
        description:
          "그림을 가리키며 '이건 뭐야?' 하고 물어보세요. 아기가 한 단어로 대답하거나 소리를 내려 시도합니다. 매일 규칙적으로 읽어주면 언어 폭발기에 큰 도움이 됩니다.",
        duration: "15~20분",
        materials: ["다양한 그림책"],
        developmentAreas: ["언어 발달", "인지 발달"],
        emoji: "📖",
        difficulty: "easy",
        ageRange: "12개월~",
      },
      {
        id: "act_12_5",
        title: "흉내 내기 놀이",
        description:
          "일상 행동을 흉내 내보세요. 전화하기, 빗질하기, 청소하기 등을 장난감으로 해봅니다. 상징적 사고가 발달하며 어른의 행동을 모방하려는 욕구가 커집니다.",
        duration: "15분",
        materials: ["소꿉놀이 세트", "장난감 전화기"],
        developmentAreas: ["상징 놀이", "인지 발달"],
        emoji: "🎭",
        difficulty: "easy",
        ageRange: "12개월~",
      },
      {
        id: "act_12_6",
        title: "계단 오르기 연습",
        description:
          "낮은 계단이나 한두 칸 정도의 계단을 네발로 기어 오르게 해보세요. 반드시 보호자가 바로 뒤에서 도와주세요. 다리 근력과 협응력이 크게 발달합니다.",
        duration: "5~10분",
        materials: [],
        developmentAreas: ["대근육 발달", "신체 조절력"],
        emoji: "🪜",
        difficulty: "medium",
        ageRange: "12개월~",
      },
    ],
  },
];

export function getActivitiesForMonth(
  month: number
): MonthActivities | undefined {
  return allMonthActivities.find((m) => m.month === month);
}

export { allMonthActivities };
