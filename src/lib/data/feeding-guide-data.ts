export interface FeedingPosition {
  id: string;
  name: string;
  description: string;
  suitableFor: string;
  emoji: string;
}

export interface BottleCleaningStep {
  step: number;
  title: string;
  description: string;
  emoji: string;
}

export interface FeedingTroubleshooting {
  issue: string;
  solution: string;
  emoji: string;
  urgency: "info" | "caution" | "warning";
}

export interface FeedingGuideData {
  month: number;
  feedingType: string;
  perFeedAmount: string;
  dailyTotal: string;
  frequency: string;
  interval: string;
  positions: FeedingPosition[];
  burpingTips: string[];
  breastMilkStorage: {
    roomTemp: string;
    fridge: string;
    freezer: string;
    thawing: string;
  };
  bottleCleaning: BottleCleaningStep[];
  mixedFeedingTips: string[];
  troubleshooting: FeedingTroubleshooting[];
}

const feedingPositions: FeedingPosition[] = [
  {
    id: "cradle",
    name: "요람 안기",
    description:
      "아기의 머리를 팔꿈치 안쪽에 올리고 몸 전체를 팔로 감싸 안는 자세입니다. 가장 기본적이고 안정적인 수유 자세로, 엄마와 아기 모두 편안합니다.",
    suitableFor: "신생아~12개월",
    emoji: "🤱",
  },
  {
    id: "crossCradle",
    name: "교차 요람 안기",
    description:
      "수유할 젖과 반대쪽 팔로 아기를 안는 자세입니다. 손으로 아기의 목과 머리를 지지하여 젖물림을 조절하기 쉽습니다. 젖물림이 어려운 초보 엄마에게 추천합니다.",
    suitableFor: "신생아~3개월",
    emoji: "👶",
  },
  {
    id: "football",
    name: "풋볼 안기",
    description:
      "아기를 옆구리에 끼고 럭비공을 안듯이 안는 자세입니다. 제왕절개 후 배에 압박을 주지 않아 좋고, 쌍둥이 동시 수유 시에도 활용합니다.",
    suitableFor: "제왕절개 후, 쌍둥이",
    emoji: "🏈",
  },
  {
    id: "sideLying",
    name: "사이드 라잉",
    description:
      "엄마와 아기가 나란히 옆으로 누워 수유하는 자세입니다. 야간 수유나 회복기에 엄마의 체력 부담을 줄여줍니다. 수유 후 아기를 바로 눕히지 않도록 주의하세요.",
    suitableFor: "야간 수유, 회복기",
    emoji: "🛏️",
  },
  {
    id: "laidBack",
    name: "리클라이닝 자세",
    description:
      "엄마가 뒤로 기대어 편안히 누운 상태에서 아기를 가슴 위에 엎드려 놓는 자세입니다. 아기가 본능적으로 젖을 찾아 물게 되며, 모유 흐름이 빠를 때 유용합니다.",
    suitableFor: "모유 과다 분비 시",
    emoji: "🪑",
  },
];

const bottleCleaningSteps: BottleCleaningStep[] = [
  {
    step: 1,
    title: "분해",
    description:
      "젖병, 젖꼭지, 캡, 링 등 모든 부품을 분리합니다. 찌꺼기가 남지 않도록 완전히 분해하세요.",
    emoji: "🔧",
  },
  {
    step: 2,
    title: "세척",
    description:
      "전용 젖병 세정제와 젖병솔을 사용해 구석구석 닦아줍니다. 젖꼭지 구멍까지 꼼꼼히 세척하세요.",
    emoji: "🧽",
  },
  {
    step: 3,
    title: "헹굼",
    description:
      "흐르는 물에 세정제가 남지 않도록 충분히 헹굽니다. 잔류 세정제는 아기에게 해로울 수 있습니다.",
    emoji: "💧",
  },
  {
    step: 4,
    title: "소독",
    description:
      "끓는 물에 3~5분 또는 전용 소독기를 사용합니다. 젖꼭지는 2~3분이면 충분합니다. 과도한 열소독은 변형을 유발할 수 있습니다.",
    emoji: "♨️",
  },
  {
    step: 5,
    title: "건조",
    description:
      "젖병 건조대에 거꾸로 세워 자연 건조합니다. 행주로 닦으면 세균이 옮겨질 수 있으니 자연 건조를 권장합니다.",
    emoji: "☀️",
  },
  {
    step: 6,
    title: "보관",
    description:
      "완전히 건조된 후 뚜껑을 닫아 먼지가 들어가지 않게 보관합니다. 밀폐 용기나 전용 보관함을 사용하세요.",
    emoji: "📦",
  },
];

const breastMilkStorage = {
  roomTemp: "25°C 이하 4시간",
  fridge: "4°C 이하 4일",
  freezer: "-18°C 이하 6개월",
  thawing: "냉장 해동 후 24시간 내 사용",
};

interface MonthFeedingConfig {
  feedingType: string;
  perFeedAmount: string;
  dailyTotal: string;
  frequency: string;
  interval: string;
  mixedFeedingTips: string[];
  troubleshooting: FeedingTroubleshooting[];
  burpingTips: string[];
}

const baseBurpingTips = [
  "수유 후 아기를 어깨에 기대어 세운 뒤 등을 부드럽게 토닥여 주세요.",
  "한 번에 트림이 안 나오면 5분 정도 세워 안은 후 다시 시도하세요.",
  "수유 중간(반쯤 먹었을 때)에도 한 번 트림을 시켜주면 좋습니다.",
  "트림이 안 나올 때는 아기를 무릎에 앉히고 상체를 살짝 앞으로 기울여 등을 쓸어주세요.",
];

const monthConfigs: MonthFeedingConfig[] = [
  // 0개월 (신생아)
  {
    feedingType: "모유/분유",
    perFeedAmount: "40~80ml",
    dailyTotal: "400~600ml",
    frequency: "8~12회",
    interval: "2~3시간 간격",
    mixedFeedingTips: [
      "초유는 면역력의 핵심이므로 가능하면 생후 1시간 이내에 첫 수유를 시작하세요.",
      "혼합 수유 시 모유를 먼저 먹인 후 분유를 보충하는 것이 좋습니다.",
      "신생아 시기에는 분유보다 모유를 우선하면 유두혼동을 예방할 수 있습니다.",
      "모유 수유가 자리 잡기 전(2~4주)에는 젖병 사용을 최소화하세요.",
    ],
    burpingTips: [
      ...baseBurpingTips,
      "신생아는 소화기관이 미숙하므로 수유 후 반드시 트림을 시켜주세요.",
    ],
    troubleshooting: [
      {
        issue: "젖물림이 잘 안 돼요",
        solution:
          "아기의 입이 유륜까지 깊이 물도록 해주세요. 아기 입이 120도 이상 벌어져야 하며, 아래턱이 먼저 닿도록 합니다. C홀드나 U홀드로 유방을 잡아주면 도움이 됩니다.",
        emoji: "😣",
        urgency: "caution",
      },
      {
        issue: "모유량이 부족한 것 같아요",
        solution:
          "하루 8~12회 이상 자주 수유하면 모유량이 늘어납니다. 충분한 수분 섭취(하루 2L 이상)와 영양가 있는 식사가 중요합니다. 하루 소변 기저귀 6장 이상이면 충분히 먹고 있는 것입니다.",
        emoji: "💧",
        urgency: "info",
      },
      {
        issue: "수유 중 아기가 자꾸 잠들어요",
        solution:
          "발바닥을 살짝 자극하거나 등을 쓸어주세요. 옷을 살짝 벗겨 시원하게 해주면 깨어 있는 데 도움이 됩니다. 한쪽 젖을 5~10분 먹인 후 기저귀를 갈아주며 깨운 뒤 반대쪽을 먹이세요.",
        emoji: "😴",
        urgency: "info",
      },
      {
        issue: "수유 후 토하는 양이 많아요",
        solution:
          "소량의 역류(입가로 흘러나오는 정도)는 정상입니다. 수유 후 20~30분 세워 안아주세요. 분수토(입에서 세게 뿜어내는 구토)가 반복되면 소아과를 방문하세요.",
        emoji: "🤮",
        urgency: "warning",
      },
      {
        issue: "유두가 아프고 갈라져요",
        solution:
          "젖물림 자세를 교정하면 대부분 호전됩니다. 라놀린 크림이나 모유를 발라 자연 치유를 돕고, 심한 경우 유두 보호기를 사용할 수 있습니다.",
        emoji: "😖",
        urgency: "caution",
      },
    ],
  },
  // 1개월
  {
    feedingType: "모유/분유",
    perFeedAmount: "80~120ml",
    dailyTotal: "560~720ml",
    frequency: "7~8회",
    interval: "2.5~3시간 간격",
    mixedFeedingTips: [
      "모유 수유 후 부족한 양만큼 분유를 보충하세요.",
      "유두혼동 방지를 위해 느린 유속의 젖꼭지(SS 사이즈)를 사용하세요.",
      "모유 수유 패턴이 안정될 때까지 인내심을 가지세요. 보통 4~6주가 걸립니다.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "유두혼동이 생겼어요",
        solution:
          "젖병보다 모유를 먼저 물려주세요. 느린 유속의 젖꼭지를 사용하고, 컵피딩이나 숟가락 수유를 시도해볼 수 있습니다. 피부 접촉(캥거루케어)을 자주 해주세요.",
        emoji: "😟",
        urgency: "caution",
      },
      {
        issue: "영아산통으로 많이 울어요",
        solution:
          "수유 중 공기를 삼키지 않도록 자세를 점검하고, 수유 후 트림을 충분히 시켜주세요. 배를 시계방향으로 마사지하고, 다리를 배 쪽으로 구부려 가스 배출을 도와주세요.",
        emoji: "😭",
        urgency: "info",
      },
      {
        issue: "한쪽 젖만 선호해요",
        solution:
          "거부하는 쪽 젖을 먼저 물려보세요. 풋볼 안기 자세로 바꿔 시도하거나, 아기가 졸릴 때 거부하는 쪽을 물려보는 것도 방법입니다.",
        emoji: "🤔",
        urgency: "info",
      },
      {
        issue: "젖몸살이 심해요",
        solution:
          "수유 전 따뜻한 수건으로 찜질 후 수유하고, 수유 후에는 냉찜질을 해주세요. 남은 모유는 유축기로 비워주되, 완전히 비우면 더 생산되므로 적당히만 비워주세요.",
        emoji: "🔥",
        urgency: "warning",
      },
      {
        issue: "분유를 거부해요",
        solution:
          "다른 사람이 먹여보세요(엄마 냄새가 나면 모유를 찾을 수 있습니다). 분유 온도를 체온(36~37°C)에 맞추고, 다른 브랜드를 시도해볼 수도 있습니다.",
        emoji: "🍼",
        urgency: "info",
      },
    ],
  },
  // 2개월
  {
    feedingType: "모유/분유",
    perFeedAmount: "120~150ml",
    dailyTotal: "700~900ml",
    frequency: "6~7회",
    interval: "3시간 간격",
    mixedFeedingTips: [
      "수유 패턴이 안정되어 혼합 수유가 수월해지는 시기입니다.",
      "밤중 수유 간격이 늘어나기 시작하므로, 자기 전 충분히 먹여주세요.",
      "모유를 유축하여 보관하면 다른 보호자도 수유에 참여할 수 있습니다.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "수유량이 갑자기 줄었어요",
        solution:
          "급성장기(growth spurt)에는 일시적으로 수유 패턴이 변할 수 있습니다. 2~3일 내에 돌아오는 경우가 많습니다. 하루 소변 기저귀 6장 이상이면 걱정하지 않아도 됩니다.",
        emoji: "📉",
        urgency: "info",
      },
      {
        issue: "수유 중 물고 놓기를 반복해요",
        solution:
          "모유 사출이 너무 빠르거나 느릴 수 있습니다. 사출이 빠르면 리클라이닝 자세로, 느리면 유방 압박법을 시도하세요.",
        emoji: "🔄",
        urgency: "info",
      },
      {
        issue: "역류가 잦아요",
        solution:
          "소량 역류는 6개월경까지 흔합니다. 수유 후 20~30분 세워 안고, 수유량을 약간 줄이고 횟수를 늘려보세요. 체중 증가가 정상이면 크게 걱정하지 않아도 됩니다.",
        emoji: "💦",
        urgency: "caution",
      },
      {
        issue: "변비가 생겼어요 (분유 수유)",
        solution:
          "분유 아기는 모유 아기보다 변이 단단할 수 있습니다. 배 마사지와 자전거 운동을 해주세요. 2~3일 이상 대변이 없으면 소아과에 상담하세요.",
        emoji: "😓",
        urgency: "caution",
      },
    ],
  },
  // 3개월
  {
    feedingType: "모유/분유",
    perFeedAmount: "150~180ml",
    dailyTotal: "750~900ml",
    frequency: "5~6회",
    interval: "3~3.5시간 간격",
    mixedFeedingTips: [
      "모유 수유가 안정기에 접어드는 시기로, 유축 후 냉동 보관을 시작하기 좋습니다.",
      "3개월 위기(수유 거부)가 올 수 있으니 당황하지 마세요.",
      "직장 복귀를 앞두고 있다면 유축 연습과 젖병 적응을 서서히 시작하세요.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "3개월 수유 거부가 왔어요",
        solution:
          "주변에 관심이 많아지면서 수유에 집중하지 못하는 시기입니다. 조용하고 어두운 환경에서 수유하세요. 졸릴 때(낮잠 전후) 먹이면 잘 먹는 경우가 많습니다.",
        emoji: "🙅",
        urgency: "caution",
      },
      {
        issue: "밤중 수유를 줄이고 싶어요",
        solution:
          "자기 전 마지막 수유를 충분히 먹이고(꿈수유), 밤중에는 깨더라도 바로 수유하지 말고 2~3분 기다려보세요. 3개월 이후부터 밤중 수유를 서서히 줄일 수 있습니다.",
        emoji: "🌙",
        urgency: "info",
      },
      {
        issue: "모유가 줄어든 것 같아요",
        solution:
          "3개월경 모유 생산이 수요-공급 방식으로 전환됩니다. 젖이 덜 차는 느낌이 들어도 아기가 원할 때 충분히 먹고 있다면 정상입니다. 체중 증가를 확인하세요.",
        emoji: "📊",
        urgency: "info",
      },
      {
        issue: "수유 중 깨물어요",
        solution:
          "잇몸이 간지러운 시기가 시작될 수 있습니다. 수유 전 차가운 치발기를 물려주면 도움이 됩니다. 깨물면 조용히 젖을 떼고 잠시 기다린 후 다시 물려주세요.",
        emoji: "😬",
        urgency: "caution",
      },
    ],
  },
  // 4개월
  {
    feedingType: "모유/분유",
    perFeedAmount: "180~210ml",
    dailyTotal: "800~1000ml",
    frequency: "5~6회",
    interval: "3.5~4시간 간격",
    mixedFeedingTips: [
      "이유식 시작 징후(목 가누기, 음식에 관심)가 보이면 이유식 준비를 시작하세요.",
      "이유식 시작 전까지는 모유/분유만으로 충분합니다.",
      "혼합 수유 중이라면 이유식 시작 후 분유를 우선 줄이는 것이 좋습니다.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "수유 간격이 불규칙해요",
        solution:
          "4개월경부터는 3~4시간 간격으로 규칙적인 수유 스케줄을 만들어가기 좋은 시기입니다. 먹고-놀고-자는 패턴(EAT-PLAY-SLEEP)을 시도해보세요.",
        emoji: "⏰",
        urgency: "info",
      },
      {
        issue: "침을 많이 흘리고 뭐든 입에 넣어요",
        solution:
          "이 시기에 정상적인 발달입니다. 이가 나기 시작하는 신호일 수 있습니다. 깨끗한 치발기를 제공하고, 수유와 혼동하지 마세요.",
        emoji: "🤤",
        urgency: "info",
      },
      {
        issue: "이유식을 시작해도 될까요?",
        solution:
          "목을 가누고, 받쳐 앉을 수 있으며, 음식에 관심을 보이고, 혀 내밀기 반사가 줄었다면 시작할 수 있습니다. 쌀미음부터 한 숟가락씩 시작하세요.",
        emoji: "🥄",
        urgency: "info",
      },
      {
        issue: "수유 중 산만해요",
        solution:
          "시각과 청각이 발달하면서 주변에 관심이 많아집니다. 조용한 환경에서 수유하고, 수유 커버를 사용해 자극을 줄여보세요.",
        emoji: "👀",
        urgency: "info",
      },
    ],
  },
  // 5개월
  {
    feedingType: "모유/분유 (+ 이유식 초기)",
    perFeedAmount: "180~210ml",
    dailyTotal: "800~1000ml",
    frequency: "4~5회",
    interval: "3.5~4시간 간격",
    mixedFeedingTips: [
      "이유식을 시작했다면 모유/분유 수유량은 유지하면서 이유식을 추가하세요.",
      "이유식은 하루 1회, 1~2숟가락부터 시작합니다.",
      "이유식 후 모유/분유를 먹여 충분한 영양을 보충하세요.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "이유식을 먹으면서 모유/분유를 거부해요",
        solution:
          "이유식은 아직 보충식이므로 모유/분유가 주식입니다. 이유식 양을 줄이고 모유/분유를 먼저 먹인 후 이유식을 시도하세요.",
        emoji: "🥣",
        urgency: "caution",
      },
      {
        issue: "이유식을 거부해요",
        solution:
          "처음에는 거부하는 것이 자연스럽습니다. 같은 식재료를 10~15회 이상 제공해야 받아들이기도 합니다. 억지로 먹이지 말고 긍정적인 분위기를 유지하세요.",
        emoji: "🙅",
        urgency: "info",
      },
      {
        issue: "변 색깔이 바뀌었어요",
        solution:
          "이유식 시작 후 변의 색깔, 냄새, 농도가 변하는 것은 정상입니다. 당근을 먹으면 주황색, 시금치를 먹으면 녹색 변이 나올 수 있습니다.",
        emoji: "💩",
        urgency: "info",
      },
      {
        issue: "젖떼기를 시작해야 하나요?",
        solution:
          "WHO는 만 2세까지 모유 수유를 권장합니다. 5개월에 젖떼기를 서두를 필요는 없습니다. 엄마와 아기가 모두 준비되었을 때 서서히 진행하세요.",
        emoji: "🤱",
        urgency: "info",
      },
    ],
  },
  // 6개월
  {
    feedingType: "모유/분유 + 이유식 초기",
    perFeedAmount: "180~210ml",
    dailyTotal: "700~900ml",
    frequency: "4~5회",
    interval: "3.5~4시간 간격",
    mixedFeedingTips: [
      "이유식 1~2회와 모유/분유 4~5회를 병행합니다.",
      "이유식이 본격적으로 시작되지만, 모유/분유가 여전히 주요 영양원입니다.",
      "이유식 시간을 정해 규칙적인 식사 습관을 만들어가세요.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "밤중 수유가 다시 늘었어요",
        solution:
          "6개월경 급성장기가 올 수 있습니다. 낮 동안 충분히 먹이고, 이유식 양을 서서히 늘려 밤중 배고픔을 줄여보세요.",
        emoji: "🌙",
        urgency: "info",
      },
      {
        issue: "이가 나면서 수유를 힘들어해요",
        solution:
          "잇몸이 아파서 수유를 거부할 수 있습니다. 수유 전 차가운 치발기를 물려주고, 잇몸 마사지를 해주세요. 아기가 깨물면 조용히 젖을 떼세요.",
        emoji: "🦷",
        urgency: "caution",
      },
      {
        issue: "알레르기 반응이 의심돼요",
        solution:
          "새로운 식재료는 3~5일 간격으로 한 가지씩 시도하세요. 발진, 구토, 설사, 호흡곤란 증상이 있으면 즉시 중단하고 소아과를 방문하세요.",
        emoji: "🚨",
        urgency: "warning",
      },
      {
        issue: "물은 언제부터 먹일 수 있나요?",
        solution:
          "이유식 시작 후부터 소량(1~2모금)의 물을 줄 수 있습니다. 빨대컵이나 아기컵으로 연습을 시작하세요. 모유/분유 수유량이 줄지 않도록 소량만 제공합니다.",
        emoji: "💧",
        urgency: "info",
      },
      {
        issue: "컵 사용을 시작해야 하나요?",
        solution:
          "6개월부터 빨대컵이나 시피컵을 소개할 수 있습니다. 처음에는 물로 연습하고, 익숙해지면 서서히 젖병 대신 사용 빈도를 늘려가세요.",
        emoji: "🥤",
        urgency: "info",
      },
    ],
  },
  // 7개월
  {
    feedingType: "모유/분유 + 이유식 중기",
    perFeedAmount: "180~210ml",
    dailyTotal: "600~800ml",
    frequency: "3~4회",
    interval: "4시간 간격",
    mixedFeedingTips: [
      "이유식 2회와 모유/분유 3~4회를 병행합니다.",
      "이유식 양이 늘면서 모유/분유 양이 자연스럽게 조금씩 줄어듭니다.",
      "간식(과일 퓌레 등)을 소개하기 시작할 수 있습니다.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "이유식 입자를 거부해요",
        solution:
          "중기 이유식으로 전환 시 입자 크기를 서서히 늘려가세요. 갑자기 바꾸면 거부할 수 있습니다. 으깬 것과 곱게 간 것을 섞어 점진적으로 적응시키세요.",
        emoji: "🥄",
        urgency: "info",
      },
      {
        issue: "편식이 시작됐어요",
        solution:
          "한 가지 음식을 거부해도 포기하지 마세요. 다양한 방식(퓌레, 핑거푸드)으로 반복 제공하면 수용할 가능성이 높아집니다.",
        emoji: "🥦",
        urgency: "info",
      },
      {
        issue: "분리불안으로 수유 시 보채요",
        solution:
          "7개월경 분리불안이 시작될 수 있습니다. 안정감을 주면서 수유하고, 일관된 수유 루틴을 유지하세요.",
        emoji: "😢",
        urgency: "info",
      },
      {
        issue: "모유/분유 양을 얼마나 줄여야 하나요?",
        solution:
          "이유식 2회를 잘 먹는다면 하루 모유/분유 총량이 700~800ml 정도면 적정합니다. 아기의 성장 곡선을 확인하면서 조절하세요.",
        emoji: "📏",
        urgency: "info",
      },
    ],
  },
  // 8개월
  {
    feedingType: "모유/분유 + 이유식 중기",
    perFeedAmount: "180~210ml",
    dailyTotal: "600~700ml",
    frequency: "3~4회",
    interval: "4~4.5시간 간격",
    mixedFeedingTips: [
      "이유식 2~3회로 늘리면서 모유/분유 횟수를 조절하세요.",
      "핑거푸드(스틱형 채소, 과일 등)를 소개하여 자기주도 식사를 시작할 수 있습니다.",
      "모유/분유와 이유식의 비율이 약 6:4 정도가 적절합니다.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "핑거푸드를 먹다가 구역질을 해요",
        solution:
          "가그 반사(구역질)는 질식과 다릅니다. 아기의 자연스러운 보호 반사로, 스스로 뱉어내는 법을 배우는 과정입니다. 당황하지 말고 지켜보되, 질식 응급처치법은 꼭 알아두세요.",
        emoji: "😰",
        urgency: "caution",
      },
      {
        issue: "수유 거부기가 왔어요",
        solution:
          "이유식에 흥미가 생기면서 모유/분유를 거부할 수 있습니다. 이유식에 모유/분유를 섞거나, 졸릴 때 수유해보세요. 하루 총량(600ml 이상)을 확인하세요.",
        emoji: "🙅",
        urgency: "caution",
      },
      {
        issue: "철분 부족이 걱정돼요",
        solution:
          "모유 내 철분은 6개월 이후 감소합니다. 소고기, 닭고기, 시금치 등 철분이 풍부한 이유식을 적극적으로 먹이세요. 9개월 정기검진 시 빈혈 검사를 받으세요.",
        emoji: "💉",
        urgency: "caution",
      },
      {
        issue: "밤에 자주 깨서 먹으려 해요",
        solution:
          "8개월 아기는 밤에 먹지 않아도 될 수 있습니다. 자기 전 이유식 + 모유/분유를 충분히 먹이고, 밤중에는 물을 조금만 주거나 토닥여 재워보세요.",
        emoji: "🌙",
        urgency: "info",
      },
    ],
  },
  // 9개월
  {
    feedingType: "모유/분유 + 이유식 후기",
    perFeedAmount: "180~210ml",
    dailyTotal: "500~600ml",
    frequency: "3회",
    interval: "4~5시간 간격",
    mixedFeedingTips: [
      "이유식 3회를 규칙적으로 먹이고, 모유/분유 3회를 보충합니다.",
      "후기 이유식으로 전환하여 잘게 다진 음식을 시도하세요.",
      "가족 식사 시간에 함께 앉아 먹는 습관을 만들어가세요.",
    ],
    burpingTips: [
      "이유식 양이 늘면서 트림의 필요성이 조금 줄어들 수 있습니다.",
      "모유/분유 수유 후에는 여전히 트림을 시켜주세요.",
      "아기가 스스로 트림을 할 수 있게 되는 시기입니다.",
    ],
    troubleshooting: [
      {
        issue: "이유식은 잘 먹는데 모유/분유를 안 먹어요",
        solution:
          "이유식만으로는 칼슘과 지방 섭취가 부족할 수 있습니다. 모유/분유를 하루 최소 400~500ml는 먹이세요. 이유식에 분유를 넣어 조리하는 것도 방법입니다.",
        emoji: "🍼",
        urgency: "caution",
      },
      {
        issue: "음식을 던지고 놀아요",
        solution:
          "9개월경 음식을 탐색하고 실험하는 것은 정상 발달입니다. 식사 시간을 20~30분으로 제한하고, 놀기 시작하면 정리하세요.",
        emoji: "🎯",
        urgency: "info",
      },
      {
        issue: "젖떼기를 준비하고 싶어요",
        solution:
          "서서히 수유 횟수를 줄여가세요. 가장 애착이 적은 수유 시간부터 빼고, 컵으로 대체합니다. 낮 수유부터 줄이고 밤 수유를 마지막에 끊으세요.",
        emoji: "👋",
        urgency: "info",
      },
      {
        issue: "음식 알레르기가 걱정돼요",
        solution:
          "9개월부터 계란 흰자, 생선 등 다양한 식재료를 시도할 수 있습니다. 새로운 식재료는 오전에, 소량부터 시작하세요. 이상 반응이 없으면 양을 늘려가세요.",
        emoji: "⚠️",
        urgency: "caution",
      },
    ],
  },
  // 10개월
  {
    feedingType: "모유/분유 + 이유식 후기",
    perFeedAmount: "180~210ml",
    dailyTotal: "500~600ml",
    frequency: "2~3회",
    interval: "5시간 간격",
    mixedFeedingTips: [
      "이유식이 주식이 되어가는 시기입니다. 모유/분유는 보충 역할을 합니다.",
      "스스로 숟가락을 잡고 먹으려는 시도를 격려해주세요.",
      "모유/분유와 이유식의 비율이 약 4:6으로 변해갑니다.",
    ],
    burpingTips: [
      "이유식이 주식이 되면서 트림 필요성이 줄어듭니다.",
      "모유/분유 수유 후에는 여전히 트림을 시켜주는 것이 좋습니다.",
      "아기가 불편해하지 않으면 트림에 너무 집착하지 않아도 됩니다.",
    ],
    troubleshooting: [
      {
        issue: "식사량이 들쭉날쭉해요",
        solution:
          "10개월 아기는 자기 조절 능력이 생겨 배부르면 거부합니다. 억지로 먹이지 말고 아기의 배고픔 신호를 존중하세요. 하루 전체 섭취량으로 판단하세요.",
        emoji: "📊",
        urgency: "info",
      },
      {
        issue: "젖병을 떼야 하나요?",
        solution:
          "12~18개월까지 젖병을 끊는 것이 권장됩니다. 10개월부터 컵으로 전환을 시작하세요. 간식 시간에 컵을 사용하는 것부터 시작하면 좋습니다.",
        emoji: "🥤",
        urgency: "info",
      },
      {
        issue: "우유를 먹여도 될까요?",
        solution:
          "일반 우유는 만 1세(12개월) 이후에 시작합니다. 10개월에는 모유/분유를 유지하세요. 요거트나 치즈 형태로는 소량 제공 가능합니다.",
        emoji: "🥛",
        urgency: "caution",
      },
      {
        issue: "간식은 어떤 걸 줘야 하나요?",
        solution:
          "떡뻥, 쌀과자, 바나나, 부드럽게 삶은 채소 스틱 등이 좋습니다. 설탕, 소금이 첨가된 과자는 피하고, 질식 위험이 있는 둥근 음식(포도, 체리토마토)은 반으로 잘라주세요.",
        emoji: "🍪",
        urgency: "info",
      },
    ],
  },
  // 11개월
  {
    feedingType: "모유/분유 + 이유식 후기",
    perFeedAmount: "180~210ml",
    dailyTotal: "400~500ml",
    frequency: "2~3회",
    interval: "5~6시간 간격",
    mixedFeedingTips: [
      "이유식 3회 + 간식 1~2회 + 모유/분유 2~3회가 적절합니다.",
      "성인 식사와 비슷한 형태(잘게 다진 밥, 반찬)로 전환합니다.",
      "젖병에서 컵으로의 전환을 본격적으로 시도하세요.",
    ],
    burpingTips: [
      "이유식 위주의 식사에서는 트림이 크게 필요하지 않습니다.",
      "모유/분유 수유 시에만 가볍게 트림을 시켜주세요.",
      "아기가 불편해하는 기색이 있을 때만 도와주면 됩니다.",
    ],
    troubleshooting: [
      {
        issue: "밥을 안 먹고 모유/분유만 찾아요",
        solution:
          "모유/분유 양을 서서히 줄여 배고플 때 이유식을 먹도록 유도하세요. 식사 시간 30분 전에는 모유/분유를 주지 마세요.",
        emoji: "🍚",
        urgency: "caution",
      },
      {
        issue: "돌 전에 먹이면 안 되는 음식이 있나요?",
        solution:
          "꿀(보툴리눔 독소 위험), 생우유, 견과류(통째로), 날생선은 돌 전에 피하세요. 소금, 설탕 등 조미료도 최소화하세요.",
        emoji: "🚫",
        urgency: "warning",
      },
      {
        issue: "혼자 먹겠다고 고집부려요",
        solution:
          "자기주도 식사(BLW)는 발달에 매우 긍정적입니다. 바닥에 매트를 깔고, 긴소매 턱받이를 입혀 자유롭게 탐색하게 하세요. 엉망이 되더라도 격려해주세요.",
        emoji: "👏",
        urgency: "info",
      },
      {
        issue: "체중 증가가 둔해졌어요",
        solution:
          "돌 전후로 체중 증가 속도가 자연스럽게 줄어듭니다. 성장곡선 내에 있다면 정상입니다. 걱정되면 소아과 정기검진에서 상담하세요.",
        emoji: "📉",
        urgency: "info",
      },
    ],
  },
  // 12개월
  {
    feedingType: "유아식 전환 + 생우유",
    perFeedAmount: "180~210ml",
    dailyTotal: "300~400ml",
    frequency: "2~3회",
    interval: "식사 사이",
    mixedFeedingTips: [
      "생우유(전지유)를 시작할 수 있습니다. 하루 400~500ml가 적절합니다.",
      "유아식 3회 + 간식 2회를 기본으로, 모유는 원하는 만큼 병행 가능합니다.",
      "젖병을 완전히 끊고 컵으로 전환하는 것을 목표로 하세요.",
      "분유에서 생우유로 전환 시 서서히 비율을 바꿔가세요.",
    ],
    burpingTips: [
      "돌 이후에는 특별히 트림을 시킬 필요가 없습니다.",
      "식사 후 불편해하면 잠시 세워 안아주는 정도면 충분합니다.",
    ],
    troubleshooting: [
      {
        issue: "생우유로 전환 후 설사를 해요",
        solution:
          "유당불내증일 수 있습니다. 처음에는 소량(50ml)부터 시작하여 서서히 늘려가세요. 증상이 지속되면 소아과에서 검사받으세요.",
        emoji: "🥛",
        urgency: "caution",
      },
      {
        issue: "젖떼기가 힘들어요",
        solution:
          "갑자기 끊지 말고 2~4주에 걸쳐 서서히 줄여가세요. 수유 대신 안아주기, 놀아주기 등 다른 방식으로 애착을 표현하세요. 아빠나 다른 양육자의 도움이 중요합니다.",
        emoji: "💔",
        urgency: "info",
      },
      {
        issue: "편식이 심해졌어요",
        solution:
          "12개월 전후 '음식 네오포비아(새 음식 거부)'는 정상 발달입니다. 강요하지 말고 다양한 음식을 반복 노출하세요. 부모가 맛있게 먹는 모습을 보여주는 것이 효과적입니다.",
        emoji: "🥬",
        urgency: "info",
      },
      {
        issue: "아직 젖병을 떼지 못했어요",
        solution:
          "18개월까지는 완전히 끊는 것이 치아 건강에 좋습니다. 좋아하는 캐릭터 컵을 사주거나, 빨대컵으로 전환하세요. 자기 전 젖병 물고 자는 습관은 충치의 원인이 됩니다.",
        emoji: "🍼",
        urgency: "caution",
      },
      {
        issue: "하루에 우유를 너무 많이 먹어요",
        solution:
          "우유를 하루 500ml 이상 먹으면 철분 흡수를 방해하여 빈혈이 올 수 있습니다. 400~500ml로 제한하고, 식사를 통해 다양한 영양소를 섭취하게 하세요.",
        emoji: "⚠️",
        urgency: "warning",
      },
    ],
  },
];

const feedingGuideDataMap: Map<number, FeedingGuideData> = new Map();

for (let m = 0; m <= 12; m++) {
  const config = monthConfigs[m];
  feedingGuideDataMap.set(m, {
    month: m,
    feedingType: config.feedingType,
    perFeedAmount: config.perFeedAmount,
    dailyTotal: config.dailyTotal,
    frequency: config.frequency,
    interval: config.interval,
    positions: feedingPositions,
    burpingTips: config.burpingTips,
    breastMilkStorage,
    bottleCleaning: bottleCleaningSteps,
    mixedFeedingTips: config.mixedFeedingTips,
    troubleshooting: config.troubleshooting,
  });
}

export function getFeedingGuideForMonth(
  month: number
): FeedingGuideData | undefined {
  if (month < 0 || month > 12) return undefined;
  return feedingGuideDataMap.get(month);
}
