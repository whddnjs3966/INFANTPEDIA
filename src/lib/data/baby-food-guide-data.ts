import type { HealthEvidence } from "./health-faq-data";

export interface IngredientInfo {
  name: string;
  emoji: string;
  startMonth: number;
  category: 'grain' | 'vegetable' | 'fruit' | 'protein' | 'dairy';
  allergyRisk: boolean;
  tip?: string;
}

export interface StageInfo {
  stage: string;
  monthRange: string;
  emoji: string;
  description: string;
  texture: string;
  frequency: string;
  startMonth: number;
  endMonth: number;
  newIngredients: IngredientInfo[];
  cookingTips: string[];
  cautionPoints: string[];
  sampleMenu: string[];
}

export interface AllergyGuide {
  title: string;
  description: string;
  highRiskFoods: string[];
  introduction: string;
  higherRisk: string;
  emergencyAction: string;
  evidence: HealthEvidence;
  emergencySigns: string[];
}

export interface BabyFoodGuideData {
  stages: StageInfo[];
  allergyGuide: AllergyGuide;
  generalTips: string[];
}

const allIngredients: IngredientInfo[] = [
  // 이유식을 시작할 때 참고할 재료 예시
  { name: '쌀', emoji: '🍚', startMonth: 6, category: 'grain', allergyRisk: false, tip: '충분히 익혀 아기가 삼킬 수 있는 부드러운 질감으로 준비하세요' },

  // 채소와 과일
  { name: '감자', emoji: '🥔', startMonth: 6, category: 'vegetable', allergyRisk: false, tip: '푹 익혀 으깨 주세요' },
  { name: '고구마', emoji: '🍠', startMonth: 6, category: 'vegetable', allergyRisk: false, tip: '찐 고구마를 체에 내려 부드럽게 만드세요' },
  { name: '애호박', emoji: '🥒', startMonth: 6, category: 'vegetable', allergyRisk: false, tip: '껍질과 씨를 제거하고 푹 삶아주세요' },
  { name: '브로콜리', emoji: '🥦', startMonth: 6, category: 'vegetable', allergyRisk: false, tip: '꽃 부분만 사용하고 줄기는 제거하세요' },
  { name: '당근', emoji: '🥕', startMonth: 6, category: 'vegetable', allergyRisk: false, tip: '충분히 익혀야 소화가 잘 됩니다' },
  { name: '시금치', emoji: '🥬', startMonth: 6, category: 'vegetable', allergyRisk: false, tip: '데친 후 찬물에 헹궈 잎부분만 사용하세요' },
  { name: '사과', emoji: '🍎', startMonth: 6, category: 'fruit', allergyRisk: false, tip: '껍질을 벗기고 강판에 갈아주세요' },
  { name: '배', emoji: '🍐', startMonth: 6, category: 'fruit', allergyRisk: false, tip: '쪄서 으깨 주세요' },
  { name: '바나나', emoji: '🍌', startMonth: 6, category: 'fruit', allergyRisk: false, tip: '잘 익은 바나나를 포크로 으깨주세요' },

  // 7-8개월: 단백질, 추가 채소
  { name: '두부', emoji: '🧈', startMonth: 7, category: 'protein', allergyRisk: true, tip: '끓는 물에 데친 후 으깨서 사용하세요' },
  { name: '닭가슴살', emoji: '🍗', startMonth: 7, category: 'protein', allergyRisk: false, tip: '푹 삶아 결대로 찢은 후 곱게 다져주세요' },
  { name: '소고기', emoji: '🥩', startMonth: 6, category: 'protein', allergyRisk: false, tip: '완전히 익혀 아기가 삼킬 수 있도록 부드럽게 다져요' },
  { name: '완전히 익힌 달걀', emoji: '🥚', startMonth: 6, category: 'protein', allergyRisk: true, tip: '흰자와 노른자를 모두 익혀 아기가 삼킬 수 있게 으깨요' },
  { name: '오이', emoji: '🥒', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '껍질과 씨를 제거하고 갈아서 사용하세요' },
  { name: '양배추', emoji: '🥗', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '부드러운 안쪽 잎을 푹 삶아 다져주세요' },
  { name: '무', emoji: '🟤', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '푹 삶아 부드럽게 으깨주세요' },
  { name: '미역', emoji: '🌿', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '불린 후 잘게 다져 죽에 넣어주세요' },

  // 9-10개월
  { name: '돼지고기', emoji: '🥓', startMonth: 9, category: 'protein', allergyRisk: false, tip: '지방이 적은 안심 부위를 곱게 다져주세요' },
  { name: '흰살생선', emoji: '🐟', startMonth: 9, category: 'protein', allergyRisk: true, tip: '가시를 완전히 제거하고 살만 발라 사용하세요' },
  { name: '버섯', emoji: '🍄', startMonth: 9, category: 'vegetable', allergyRisk: false, tip: '느타리, 새송이 등을 잘게 다져 사용하세요' },
  { name: '파프리카', emoji: '🫑', startMonth: 9, category: 'vegetable', allergyRisk: false, tip: '껍질을 구워 벗긴 후 다져서 사용하세요' },
  { name: '치즈', emoji: '🧀', startMonth: 9, category: 'dairy', allergyRisk: true, tip: '아기용 무염 치즈를 소량 사용하세요' },

  // 11-12개월
  { name: '우유(조리용)', emoji: '🥛', startMonth: 11, category: 'dairy', allergyRisk: true, tip: '조리용으로만 사용하고, 돌 이후 음용 가능합니다' },
  { name: '새우', emoji: '🦐', startMonth: 11, category: 'protein', allergyRisk: true, tip: '잘게 다져 소량부터 시작, 알레르기 주의하세요' },
  { name: '땅콩·견과류(곱게 갈아 섞기)', emoji: '🥜', startMonth: 6, category: 'protein', allergyRisk: true, tip: '한 종류씩 곱게 갈아 부드러운 음식에 섞어요. 통견과나 땅콩버터 덩어리는 피하세요' },
  { name: '토마토', emoji: '🍅', startMonth: 11, category: 'fruit', allergyRisk: false, tip: '껍질과 씨를 제거하고 익혀서 사용하세요' },
];

export const solidFoodPreparation = '이유식은 대체로 생후 6개월 무렵에 시작해요. 아기가 머리와 목을 가누고 도움을 받으면 똑바로 앉으며, 음식을 혀로 밀어내기보다 삼킬 수 있는지 살펴요.';
export const solidFoodEvidence: HealthEvidence = {
  checkedOn: '2026-11-13', scope: '이유식 시작 시기·준비 신호·질감',
  sources: [
    { title: 'WHO · 이유식 지침', url: 'https://www.who.int/health-topics/complementary-feeding' },
    { title: 'CDC · 첫 이유식 준비 신호', url: 'https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html' },
  ],
};

const stages: StageInfo[] = [
  {
    stage: '이유식 준비',
    monthRange: '만 4~5개월',
    emoji: '🥣',
    description: solidFoodPreparation,
    texture: '준비 신호 살피기',
    frequency: '아기가 준비되면 시작',
    startMonth: 4,
    endMonth: 5,
    newIngredients: [],
    cookingTips: [],
    cautionPoints: [],
    sampleMenu: [],
  },
  {
    stage: '초기 2단계',
    monthRange: '만 6개월',
    emoji: '🥄',
    description: '아기가 준비됐다면 소량부터 맛보고 삼키는 연습을 해요. 채소·곡류와 함께 부드럽게 익힌 고기나 콩류 등 철분이 있는 재료를 포함해요.',
    texture: '부드럽게 으깨거나 갈아 삼키기 쉬운 형태',
    frequency: '소량부터 시작해 식사 기회를 늘려요',
    startMonth: 6,
    endMonth: 6,
    newIngredients: allIngredients.filter(i => i.startMonth === 6),
    cookingTips: [
      '채소는 푹 삶아 곱게 으깬 후 쌀죽에 섞어주세요',
      '단단한 과일은 익혀 으깨고, 잘 익은 바나나처럼 부드러운 과일은 으깨 제공해요',
      '알레르기를 일으킬 수 있는 새 재료는 한 번에 한 종류씩 소량부터 제공해요',
      '이유식 농도를 서서히 걸쭉하게 조절하세요',
      '조리분은 먹일 만큼만 덜고, 나머지는 보관 안내에 따라 소분해요',
    ],
    cautionPoints: [
      '알레르기 반응을 관찰할 수 있을 때 새 식재료를 제공해요',
      '먹고 나서 발진이나 구토가 생기면 해당 식품을 중단하고 의료진과 상담하세요',
      '과일과 채소, 곡류, 철분이 있는 식품을 다양하게 제공해요',
      '모유나 영아용 분유를 아기 신호에 맞춰 계속 제공해요',
    ],
    sampleMenu: [
      '당근감자죽',
      '시금치쌀미음',
      '사과배퓨레',
      '브로콜리감자죽',
      '애호박고구마죽',
    ],
  },
  {
    stage: '중기',
    monthRange: '만 7~8개월',
    emoji: '🥗',
    description: '아기의 먹는 능력에 맞춰 질감을 조금씩 높여요. 두부, 닭고기, 소고기 등 다양한 재료를 부드럽게 준비해요.',
    texture: '부드러운 죽·으깬 재료',
    frequency: '식사 기회 하루 2~3회 참고',
    startMonth: 7,
    endMonth: 8,
    newIngredients: allIngredients.filter(i => i.startMonth >= 7 && i.startMonth <= 8),
    cookingTips: [
      '소고기는 핏물을 빼고 곱게 다져 죽에 넣어주세요',
      '닭가슴살은 결대로 찢은 후 잘게 다져 사용하세요',
      '채소를 충분히 익혀 손가락으로 눌렀을 때 부드럽게 으깨지는지 확인해요',
      '두부는 끓는 물에 데친 후 으깨서 사용하세요',
      '완전히 익힌 재료를 먹을 수 있는 질감으로 섞어 제공해요',
    ],
    cautionPoints: [
      '고기는 반드시 완전히 익혀야 합니다',
      '달걀은 흰자와 노른자를 완전히 익혀 소량부터 제공해요. 습진이 심하거나 이미 음식 알레르기가 있으면 도입 전에 의료진과 상담하세요',
      '알레르기를 일으킬 수 있는 식품은 한 번에 한 종류씩 도입해요',
      '아기가 똑바로 앉아 스스로 집어 먹을 수 있을 때 손에 쥐기 쉽고 부드러운 음식을 줘요. 보호자가 옆에서 지켜봐요',
    ],
    sampleMenu: [
      '소고기당근죽',
      '닭가슴살브로콜리죽',
      '두부시금치죽',
      '소고기미역죽',
      '닭가슴살감자양배추죽',
    ],
  },
  {
    stage: '후기',
    monthRange: '만 9~11개월',
    emoji: '🍲',
    description: '무른밥과 부드러운 재료로 다양한 식감을 경험해요. 씹고 삼키는 능력에 맞춰 질감을 조절해요.',
    texture: '무른밥·부드럽게 잘라 낸 재료',
    frequency: '식사 기회 하루 3~4회 참고',
    startMonth: 9,
    endMonth: 11,
    newIngredients: allIngredients.filter(i => i.startMonth >= 9 && i.startMonth <= 11),
    cookingTips: [
      '재료는 부드럽게 익히고 둥근 재료는 작게 세로로 나눠요',
      '흰살생선은 가시를 완전히 제거하고 으깨 사용하세요',
      '과일은 익혀 부드럽게 하거나 잘 익어 쉽게 으깨지는 것을 준비해요',
      '아기 스스로 숟가락을 잡도록 격려해주세요',
      '치즈는 무염 아기용 치즈를 선택하세요',
    ],
    cautionPoints: [
      '포도·방울토마토 등 둥근 과일은 세로로 작게 4조각 내고 단단한 재료는 부드럽게 준비하세요. 아기가 바르게 앉아 먹도록 하고 보호자가 곁에서 지켜보세요.',
      '견과류는 통째로 주지 말고 반드시 갈아서 사용하세요',
      '새우, 조개 등 갑각류는 알레르기 위험이 높으니 소량부터 시작하세요',
      '첫돌 전에는 모유나 영아용 분유가 주요 영양원이에요. 이유식과 함께 계속 제공해요',
    ],
    sampleMenu: [
      '소고기버섯무른밥',
      '흰살생선파프리카무른밥',
      '완숙 달걀시금치무른밥',
      '돼지고기양배추무른밥',
      '닭가슴살치즈리조또',
    ],
  },
  {
    stage: '완료기',
    monthRange: '만 12개월~',
    emoji: '🍽️',
    description: '어른 식사와 비슷한 형태로 전환하는 시기입니다. 진밥이나 일반밥을 먹고, 가족과 함께 식사하는 습관을 들입니다. 간은 여전히 싱겁게 합니다.',
    texture: '진밥~일반밥, 작게 썬 재료',
    frequency: '1일 3회 + 간식 1~2회',
    startMonth: 12,
    endMonth: 12,
    newIngredients: allIngredients.filter(i => i.startMonth >= 11 && i.startMonth <= 12),
    cookingTips: [
      '어른 반찬에서 간하기 전에 아이 몫을 덜어주세요',
      '우유는 하루 400~500ml 이내로 제공하세요',
      '다양한 식감과 색의 음식을 경험하게 해주세요',
      '가족과 함께 식탁에서 먹는 습관을 만들어주세요',
      '숟가락과 포크 사용을 연습시켜주세요',
    ],
    cautionPoints: [
      '어른 음식의 간은 아기에게 짜므로 별도로 준비하세요',
      '단 음식(주스, 과자)에 너무 일찍 노출시키지 마세요',
      '편식이 시작될 수 있으니 다양한 재료를 꾸준히 제공하세요',
      '식사 시간은 30분 이내로 하고 돌아다니며 먹지 않게 하세요',
    ],
    sampleMenu: [
      '소고기채소볶음밥',
      '생선구이 + 무른밥 + 채소반찬',
      '닭고기카레라이스 (순한맛)',
      '두부채소전 + 밥',
      '토마토소고기리조또',
    ],
  },
];

export const babyFoodStorage = {
  title: '조리한 이유식 보관·재가열',
  entries: [
    { label: '덜어 담고 식히기', text: '먹일 양을 깨끗한 그릇에 먼저 덜어요. 조리한 음식은 가능한 한 1~2시간 안에 식혀 냉장 또는 냉동하고, 쌀밥·쌀죽은 1시간 안에 식혀 바로 냉장 또는 냉동해요.' },
    { label: '보관한 이유식', text: '냉장한 이유식은 2일 안에 사용하고, 쌀밥·쌀죽은 24시간 안에 사용해요. 냉동한 음식은 냉장 해동하고 완전히 녹은 뒤 24시간 안에 사용해요.' },
    { label: '데우고 먹인 뒤', text: '속까지 충분히 뜨겁게 데운 뒤 섞고, 먹기 좋은 온도로 식혀요. 한 번만 재가열하고 아기가 먹다 남긴 음식은 보관하지 말고 버려요.' },
  ],
  evidence: {
    checkedOn: '2026-11-13', scope: '조리된 영유아 음식과 쌀 음식의 보관·재가열',
    sources: [{ title: 'NHS · 이유식 보관과 재가열', url: 'https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/storing-and-reheating-food/' }],
  },
};

const allergyGuide: AllergyGuide = {
  title: '이유식 알레르기 가이드',
  description: '아기가 이유식을 먹을 준비가 되면, 알레르기를 일으킬 수 있는 식품을 한 번에 한 종류씩 소량으로 도입해요. 별다른 반응 없이 먹었다면 이후 식사에도 꾸준히 포함할 수 있어요.',
  highRiskFoods: ['완전히 익힌 달걀', '우유 및 유제품', '밀', '땅콩', '대두', '갑각류', '견과류', '생선', '참깨'],
  introduction: '달걀은 흰자와 노른자를 완전히 익혀 부드럽게 으깨요. 땅콩·견과류는 곱게 갈아 음식에 섞고 통째로 주거나 땅콩버터를 덩어리째 주지 마세요. 의심되는 반응이 있으면 해당 식품을 중단하고 의료진에게 상담하세요.',
  higherRisk: '심한 습진이나 달걀 알레르기가 있으면 땅콩을 처음 먹이기 전에 소아청소년과에 도입 시기와 방법을 확인하세요. 이미 진단받은 식품 알레르기는 담당 의료진의 안내를 따라요.',
  emergencyAction: '아래 증상이 나타나면 바로 119에 연락하세요.',
  emergencySigns: ['숨쉬기 어려움 또는 갑작스러운 쌕쌕거림', '입술·혀·목이 갑자기 부음', '아기가 축 늘어지거나 평소처럼 반응하지 않음'],
  evidence: {
    checkedOn: '2026-11-13', scope: '알레르기 유발 식품 도입·고위험군·응급 징후',
    sources: [
      { title: 'NHS · 영유아 식품 알레르기', url: 'https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/' },
      { title: 'NIAID · 영아 땅콩 도입 지침', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC5226648/' },
      { title: 'NHS · 아나필락시스', url: 'https://www.nhs.uk/conditions/anaphylaxis/' },
    ],
  },
};

const generalTips: string[] = [
  '아기가 똑바로 앉아 먹도록 하고 보호자가 곁에서 지켜보세요',
  '손과 조리도구를 씻고 생고기·생선이 익힌 음식에 닿지 않게 분리하세요',
  '생후 12개월 전에는 꿀을 넣거나 우유를 음료로 주지 마세요',
  '먹는 양은 아기의 배고픔·포만 신호에 맞춰요',
  '생후 6개월 무렵 이유식과 함께 컵에 담은 물을 몇 모금 제공할 수 있어요',
];

export function getBabyFoodGuide(): BabyFoodGuideData {
  return {
    stages,
    allergyGuide,
    generalTips,
  };
}

export function getStageForMonth(month: number): StageInfo | undefined {
  return stages.find(s => month >= s.startMonth && month <= s.endMonth);
}

export function getAvailableIngredients(month: number): IngredientInfo[] {
  return allIngredients.filter(i => i.startMonth <= month);
}

export function getNewIngredients(month: number): IngredientInfo[] {
  return allIngredients.filter(i => i.startMonth === month);
}
