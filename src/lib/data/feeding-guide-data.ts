import type { HealthEvidence } from "./health-faq-data";
import { solidFoodPreparation } from "./baby-food-guide-data";

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
  feedingCues: string[];
  positions: FeedingPosition[];
  burpingTips: string[];
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
      "엄마와 아기가 나란히 옆으로 누워 수유하는 자세입니다. 야간 수유나 회복기에 엄마의 체력 부담을 줄여줍니다. 수유를 마치고 재울 때는 단단하고 평평한 별도 잠자리에 아기를 등을 대고 눕혀주세요.",
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
      "수유할 때마다 씻어요. 손을 씻고 깨끗한 전용 대야에 따뜻한 물과 주방용 세제를 받아 전용 솔로 닦아요. 싱크대 바닥에 부품을 바로 놓지 마세요.",
    emoji: "🧽",
  },
  {
    step: 3,
    title: "헹굼",
    description:
      "깨끗한 흐르는 물로 부품을 충분히 헹궈요. 젖꼭지 구멍으로 물을 통과시켜 찌꺼기가 남지 않게 해요.",
    emoji: "💧",
  },
  {
    step: 4,
    title: "소독",
    description:
      "세척한 뒤 제품 설명서에 맞는 방법으로 소독해요. CDC는 생후 2개월 미만, 미숙아, 면역력이 약한 아기에게 최소 하루 한 번 소독을 권해요.",
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

const evidence = (scope: string, title: string, url: string): HealthEvidence => ({
  scope, checkedOn: "2026-11-13", sources: [{ title, url }],
});

export const feedingCueEvidence = evidence("아기의 배고픔·포만 신호", "CDC · 배고픔과 포만 신호", "https://www.cdc.gov/infant-toddler-nutrition/mealtime/signs-your-child-is-hungry-or-full.html");
export const bottleCleaningEvidence = evidence("젖병 세척·소독과 영아별 주의사항", "CDC · 젖병 세척과 소독", "https://www.cdc.gov/hygiene/about/clean-sanitize-store-infant-feeding-items.html");

export const milkSafety = {
  breastMilk: {
    title: "모유 보관",
    entries: [
      { label: "갓 짠 모유", text: "실온 25°C 이하에서 최대 4시간, 냉장 4°C 이하에서 최대 4일이에요. 냉동 −18°C 이하에서는 6개월 이내가 가장 좋아요." },
      { label: "해동한 모유", text: "냉장실에서 완전히 녹은 시점부터 24시간 안에 사용해요. 실온에 두거나 데운 뒤에는 2시간 안에 사용하고, 해동한 모유는 다시 얼리지 마세요." },
      { label: "먹다 남긴 모유", text: "아기가 먹기를 마친 시점부터 2시간 안에 사용하고, 시간이 지나면 버려요." },
    ],
    evidence: evidence("건강한 아기의 가정 내 유축 모유 보관", "CDC · 모유 보관과 해동", "https://www.cdc.gov/breastfeeding/breast-milk-preparation-and-storage/handling-breastmilk.html"),
  },
  formula: {
    title: "분유 조제·보관",
    entries: [
      { label: "조제할 때", text: "손을 씻고 깨끗한 젖병에 안전한 물을 제품 표시량만큼 먼저 넣어요. 제품에 적힌 물과 가루의 비율을 그대로 지키세요. 생후 2개월 미만, 미숙아, 면역력이 약한 아기는 분말 분유를 안전하게 준비하는 방법이나 액상 제품 사용 여부를 의료진과 먼저 상의하세요." },
      { label: "입을 대기 전", text: "실온에서는 조제 후 2시간 안에 사용해요. 바로 먹이지 않을 분유는 조제 후 곧바로 냉장하고 24시간 안에 사용하세요." },
      { label: "먹기 시작한 분유", text: "수유를 시작한 뒤 1시간과 조제 후 2시간(실온) 중 먼저 닿는 시한을 지켜요. 먹다 남긴 분유는 버리고 다시 냉장하지 마세요. 데울 때 전자레인지를 쓰지 마세요." },
    ],
    evidence: evidence("조제 분유의 안전한 준비·보관과 고위험 영아 주의사항", "CDC · 분유 조제와 보관", "https://www.cdc.gov/infant-toddler-nutrition/formula-feeding/preparation-and-storage.html"),
  },
};

interface MonthFeedingConfig {
  feedingType: string;
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
          "거부하는 쪽 젖을 먼저 물려보세요. 풋볼 안기 자세로 바꿔 시도하거나, 아기가 깨어 있고 편안할 때 다시 시도해 보세요.",
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
    mixedFeedingTips: [
      "수유 패턴이 안정되어 혼합 수유가 수월해지는 시기입니다.",
      "밤에도 아기의 배고픔과 포만 신호에 맞춰 수유해요.",
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
          "밤중 수유의 필요성은 아기의 성장·섭취 상태에 따라 달라요. 월령만으로 줄이거나 물로 대체하지 말고, 조절이 필요하면 의료진과 상담하세요.",
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
    mixedFeedingTips: [
      "이유식 시작 징후(목 가누기, 음식에 관심)가 보이면 이유식 준비를 시작하세요.",
      "이유식 시작 전까지는 모유/분유만으로 충분합니다.",
      "이유식을 시작하더라도 모유나 영아용 분유가 첫돌 전까지 주요 영양원이에요.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "수유 간격이 불규칙해요",
        solution:
          "아기가 배고프다는 신호를 보이면 수유하고, 입을 닫거나 고개를 돌리면 멈춰요. 갑자기 잘 못 먹거나 젖은 기저귀가 줄면 소아청소년과에 상담하세요.",
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
          solidFoodPreparation,
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
    feedingType: "모유/영아용 분유",
    mixedFeedingTips: [
      solidFoodPreparation,
      "미숙아의 시작 시기나 알레르기 위험이 걱정되면 의료진과 미리 상의하세요.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "이유식 시작 후 수유를 거부하면 어떻게 하나요?",
        solution:
          "이유식을 시작한 뒤에도 첫돌 전에는 모유나 영아용 분유를 계속 제공해요. 잘 못 먹는 상태가 이어지거나 젖은 기저귀가 줄면 소아청소년과에 상담하세요.",
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
    mixedFeedingTips: [
      "모유나 영아용 분유를 이어가면서 아기가 받아들일 만큼 이유식을 제공해요.",
      "이유식이 본격적으로 시작되지만, 모유/분유가 여전히 주요 영양원입니다.",
      "이유식 시간을 정해 규칙적인 식사 습관을 만들어가세요.",
    ],
    burpingTips: baseBurpingTips,
    troubleshooting: [
      {
        issue: "밤중 수유가 다시 늘었어요",
        solution:
          "밤중 수유가 늘 수 있어요. 밤에 덜 먹이기 위해 이유식 양을 늘리거나 분유를 묽게 타지 마세요. 먹는 양이나 성장이 걱정되면 의료진과 상담하세요.",
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
          "알레르기를 일으킬 수 있는 재료는 한 번에 한 종류씩 소량부터 제공해요. 반응이 있으면 그 식품을 중단하고 의료진에게 상담하세요. 입술·혀가 붓거나 숨쉬기 어렵거나 축 늘어지면 바로 119에 연락하세요.",
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
    mixedFeedingTips: [
      "이유식과 수유를 병행하면서 아기의 반응을 살펴요.",
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
          "모유나 영아용 분유를 계속 제공하면서 먹는 신호와 성장 경과를 살펴요. 섭취가 부족할까 걱정되면 의료진과 상의하세요.",
        emoji: "📏",
        urgency: "info",
      },
    ],
  },
  // 8개월
  {
    feedingType: "모유/분유 + 이유식 중기",
    mixedFeedingTips: [
      "수유를 이어가며 아기의 먹는 연습과 식사 기회를 조금씩 늘려요.",
      "핑거푸드(스틱형 채소, 과일 등)를 소개하여 자기주도 식사를 시작할 수 있습니다.",
      "모유나 영아용 분유를 계속 주고, 이유식은 아기가 준비된 질감으로 다양하게 제공해요.",
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
          "깨어 있을 때 편안한 환경에서 다시 수유를 시도해요. 거부가 반복되거나 젖은 기저귀가 줄면 소아청소년과에 상담하세요.",
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
          "밤중 수유의 필요성은 아기의 성장·섭취 상태에 따라 달라요. 월령만으로 줄이거나 물로 대체하지 말고, 조절이 필요하면 의료진과 상담하세요.",
        emoji: "🌙",
        urgency: "info",
      },
    ],
  },
  // 9개월
  {
    feedingType: "모유/분유 + 이유식 후기",
    mixedFeedingTips: [
      "식사 리듬을 만들면서 아기가 보이는 신호에 맞춰 수유도 계속해요.",
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
          "첫돌 전에는 모유나 영아용 분유를 계속 제공해요. 수유 거부가 계속되거나 성장·소변량이 걱정되면 의료진과 상담하세요.",
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
          "떡뻥, 쌀과자, 바나나, 부드럽게 삶은 채소 스틱 등이 좋습니다. 설탕, 소금이 첨가된 과자는 피하고, 포도·방울토마토 등 둥근 과일은 세로로 작게 4조각 내고, 질감도 먹기 능력에 맞춰 준비하세요. 보호자가 곁에서 지켜보세요.",
        emoji: "🍪",
        urgency: "info",
      },
    ],
  },
  // 11개월
  {
    feedingType: "모유/분유 + 이유식 후기",
    mixedFeedingTips: [
      "가족 식사에 함께 앉는 기회를 늘리고, 배고픔과 포만 신호에 맞춰 식사와 수유를 이어가요.",
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
    mixedFeedingTips: [
      "만 12개월부터 살균한 무가당 전지우유를 컵으로 제공할 수 있어요. 계속 모유 수유를 해도 돼요.",
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
          "우유를 먹은 뒤 설사가 반복되면 먹은 양과 증상을 기록하고, 다시 먹이기 전에 소아청소년과에 상담하세요. 숨쉬기 어렵거나 입술·혀가 붓거나 축 늘어지면 바로 119에 연락하세요.",
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
          "우유로 식사를 대신하면 철분이 들어 있는 식품을 충분히 먹기 어려워요. 우유는 식사를 대신하지 않도록 주고, 아이에게 맞는 양은 식사와 성장 상태를 보면서 의료진과 상의하세요.",
        emoji: "⚠️",
        urgency: "warning",
      },
    ],
  },
];

const infantFeedingCues = [
  "배고파요 · 손을 입으로 가져가거나 젖·젖병 쪽으로 고개를 돌려요.",
  "배불러요 · 입을 닫거나 고개를 돌리면 쉬거나 수유를 마쳐요.",
  "신생아가 깨우기 어렵거나 잘 못 먹고 젖은 기저귀가 줄면 진료를 받아요. 출생 후 받은 수유 계획이 있다면 그 안내를 따르세요.",
];

const complementaryFeedingCues = [
  "배고파요 · 숟가락이 다가오면 입을 벌리거나 음식 쪽으로 몸을 기울여요.",
  "배불러요 · 입을 닫거나 고개를 돌리면 억지로 먹이지 않고 마쳐요.",
  "첫돌 전에는 이유식과 함께 모유나 영아용 분유를 계속 제공해요.",
];

const feedingGuideDataMap: Map<number, FeedingGuideData> = new Map();

for (let m = 0; m <= 12; m++) {
  const config = monthConfigs[m];
  feedingGuideDataMap.set(m, {
    month: m,
    feedingType: config.feedingType,
    feedingCues: m < 6 ? infantFeedingCues : complementaryFeedingCues,
    positions: feedingPositions,
    burpingTips: config.burpingTips,
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
