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
  amount: string;
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
  testingMethod: string;
  emergencySigns: string[];
}

export interface BabyFoodGuideData {
  stages: StageInfo[];
  allergyGuide: AllergyGuide;
  generalTips: string[];
}

const allIngredients: IngredientInfo[] = [
  // 4-5개월: 쌀
  { name: '쌀', emoji: '🍚', startMonth: 4, category: 'grain', allergyRisk: false, tip: '불린 쌀을 곱게 갈아 10배죽으로 시작하세요' },

  // 5-6개월: 채소, 과일
  { name: '감자', emoji: '🥔', startMonth: 5, category: 'vegetable', allergyRisk: false, tip: '삶아서 으깬 후 쌀미음에 섞어주세요' },
  { name: '고구마', emoji: '🍠', startMonth: 5, category: 'vegetable', allergyRisk: false, tip: '찐 고구마를 체에 내려 부드럽게 만드세요' },
  { name: '애호박', emoji: '🥒', startMonth: 5, category: 'vegetable', allergyRisk: false, tip: '껍질과 씨를 제거하고 푹 삶아주세요' },
  { name: '브로콜리', emoji: '🥦', startMonth: 5, category: 'vegetable', allergyRisk: false, tip: '꽃 부분만 사용하고 줄기는 제거하세요' },
  { name: '당근', emoji: '🥕', startMonth: 5, category: 'vegetable', allergyRisk: false, tip: '충분히 익혀야 소화가 잘 됩니다' },
  { name: '시금치', emoji: '🥬', startMonth: 5, category: 'vegetable', allergyRisk: false, tip: '데친 후 찬물에 헹궈 잎부분만 사용하세요' },
  { name: '사과', emoji: '🍎', startMonth: 5, category: 'fruit', allergyRisk: false, tip: '껍질을 벗기고 강판에 갈아주세요' },
  { name: '배', emoji: '🍐', startMonth: 5, category: 'fruit', allergyRisk: false, tip: '갈아서 즙을 내거나 쪄서 으깨주세요' },
  { name: '바나나', emoji: '🍌', startMonth: 5, category: 'fruit', allergyRisk: false, tip: '잘 익은 바나나를 포크로 으깨주세요' },

  // 7-8개월: 단백질, 추가 채소
  { name: '두부', emoji: '🧈', startMonth: 7, category: 'protein', allergyRisk: true, tip: '끓는 물에 데친 후 으깨서 사용하세요' },
  { name: '닭가슴살', emoji: '🍗', startMonth: 7, category: 'protein', allergyRisk: false, tip: '푹 삶아 결대로 찢은 후 곱게 다져주세요' },
  { name: '소고기', emoji: '🥩', startMonth: 7, category: 'protein', allergyRisk: false, tip: '기름기 적은 부위를 곱게 다져 익히세요. 철분 보충에 좋습니다' },
  { name: '달걀노른자', emoji: '🥚', startMonth: 7, category: 'protein', allergyRisk: true, tip: '완숙으로 삶아 노른자만 으깨서 사용하세요' },
  { name: '오이', emoji: '🥒', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '껍질과 씨를 제거하고 갈아서 사용하세요' },
  { name: '양배추', emoji: '🥗', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '부드러운 안쪽 잎을 푹 삶아 다져주세요' },
  { name: '무', emoji: '🟤', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '푹 삶아 부드럽게 으깨주세요' },
  { name: '미역', emoji: '🌿', startMonth: 7, category: 'vegetable', allergyRisk: false, tip: '불린 후 잘게 다져 죽에 넣어주세요' },

  // 9-10개월
  { name: '달걀흰자', emoji: '🥚', startMonth: 9, category: 'protein', allergyRisk: true, tip: '노른자에 적응한 후 소량부터 시작하세요' },
  { name: '돼지고기', emoji: '🥓', startMonth: 9, category: 'protein', allergyRisk: false, tip: '지방이 적은 안심 부위를 곱게 다져주세요' },
  { name: '흰살생선', emoji: '🐟', startMonth: 9, category: 'protein', allergyRisk: true, tip: '가시를 완전히 제거하고 살만 발라 사용하세요' },
  { name: '버섯', emoji: '🍄', startMonth: 9, category: 'vegetable', allergyRisk: false, tip: '느타리, 새송이 등을 잘게 다져 사용하세요' },
  { name: '파프리카', emoji: '🫑', startMonth: 9, category: 'vegetable', allergyRisk: false, tip: '껍질을 구워 벗긴 후 다져서 사용하세요' },
  { name: '치즈', emoji: '🧀', startMonth: 9, category: 'dairy', allergyRisk: true, tip: '아기용 무염 치즈를 소량 사용하세요' },

  // 11-12개월
  { name: '우유(조리용)', emoji: '🥛', startMonth: 11, category: 'dairy', allergyRisk: true, tip: '조리용으로만 사용하고, 돌 이후 음용 가능합니다' },
  { name: '새우', emoji: '🦐', startMonth: 11, category: 'protein', allergyRisk: true, tip: '잘게 다져 소량부터 시작, 알레르기 주의하세요' },
  { name: '견과류(갈아서)', emoji: '🥜', startMonth: 11, category: 'grain', allergyRisk: true, tip: '곱게 갈아 소량만 사용하세요. 통째로 주면 질식 위험!' },
  { name: '토마토', emoji: '🍅', startMonth: 11, category: 'fruit', allergyRisk: false, tip: '껍질과 씨를 제거하고 익혀서 사용하세요' },
];

const stages: StageInfo[] = [
  {
    stage: '초기 1단계',
    monthRange: '만 4~5개월',
    emoji: '🥣',
    description: '이유식의 첫걸음! 쌀미음으로 시작하여 숟가락에 익숙해지는 시기입니다. 모유/분유가 여전히 주식이며, 이유식은 맛보기 수준으로 진행합니다.',
    texture: '묽은 미음 (10배죽)',
    frequency: '1일 1회',
    amount: '1~2큰술 (30~50ml)',
    startMonth: 4,
    endMonth: 5,
    newIngredients: allIngredients.filter(i => i.startMonth >= 4 && i.startMonth <= 5),
    cookingTips: [
      '쌀을 30분 이상 불린 후 물과 1:10 비율로 끓여 미음을 만드세요',
      '처음에는 쌀미음만 3~5일간 먹여 반응을 확인하세요',
      '이유식 온도는 체온 정도(36~37°C)가 적당합니다',
      '실리콘 숟가락을 사용하고, 아이 입술에 살짝 대어 스스로 빨아먹게 하세요',
      '남은 이유식은 실온에 1시간 이상 두지 마세요',
    ],
    cautionPoints: [
      '꿀은 만 1세 이전 절대 금지 (보툴리눔 독소 위험)',
      '소금, 설탕 등 조미료를 넣지 마세요',
      '아이가 거부하면 억지로 먹이지 말고 다음에 다시 시도하세요',
      '이유식 시작 시기는 목을 가눌 수 있고, 음식에 관심을 보일 때가 적절합니다',
    ],
    sampleMenu: [
      '쌀미음',
      '감자미음',
      '고구마미음',
      '애호박미음',
      '브로콜리미음',
    ],
  },
  {
    stage: '초기 2단계',
    monthRange: '만 6개월',
    emoji: '🥄',
    description: '다양한 채소와 과일을 한 가지씩 추가하는 시기입니다. 새로운 식재료는 3~5일 간격으로 도입하여 알레르기 반응을 확인합니다.',
    texture: '걸쭉한 미음~묽은 죽 (8배죽)',
    frequency: '1일 1~2회',
    amount: '50~80ml',
    startMonth: 6,
    endMonth: 6,
    newIngredients: allIngredients.filter(i => i.startMonth === 5 || i.startMonth === 6),
    cookingTips: [
      '채소는 푹 삶아 곱게 으깬 후 쌀죽에 섞어주세요',
      '과일은 열을 가해 익힌 후 갈아서 제공하세요 (생과일은 아직 이릅니다)',
      '한 번에 한 가지 새 재료만 추가하세요',
      '이유식 농도를 서서히 걸쭉하게 조절하세요',
      '냉동 보관 시 1회분씩 소분하여 얼리세요 (1주일 내 사용)',
    ],
    cautionPoints: [
      '새 식재료 도입 시 오전에 먹여 알레르기 반응을 관찰하세요',
      '피부 발진, 구토, 설사 등이 나타나면 해당 식재료를 중단하세요',
      '과일만으로 식사를 대체하지 마세요 (단맛에 길들 수 있음)',
      '이유식 후 모유/분유를 충분히 먹이세요',
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
    description: '죽의 농도를 높이고 단백질 식품을 도입하는 중요한 시기입니다. 두부, 닭고기, 소고기 등을 다져서 넣어 철분과 단백질을 보충합니다.',
    texture: '죽 (5~7배죽), 곱게 다진 재료',
    frequency: '1일 2회',
    amount: '80~120ml',
    startMonth: 7,
    endMonth: 8,
    newIngredients: allIngredients.filter(i => i.startMonth >= 7 && i.startMonth <= 8),
    cookingTips: [
      '소고기는 핏물을 빼고 곱게 다져 죽에 넣어주세요',
      '닭가슴살은 결대로 찢은 후 잘게 다져 사용하세요',
      '채소는 5mm 이하로 다져 죽에 넣으세요',
      '두부는 끓는 물에 데친 후 으깨서 사용하세요',
      '이유식에 참기름을 1~2방울 넣으면 영양 흡수가 좋아집니다',
    ],
    cautionPoints: [
      '고기는 반드시 완전히 익혀야 합니다',
      '달걀은 노른자부터 시작하고 흰자는 9개월 이후에 시도하세요',
      '새 재료 2가지를 동시에 시작하지 마세요',
      '손으로 음식을 잡으려 하면 핑거푸드를 소량 제공해볼 수 있습니다',
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
    description: '무른밥으로 전환하고 다양한 식감을 경험하는 시기입니다. 잇몸으로 으깰 수 있는 크기로 재료를 잘라주고, 하루 3회 이유식을 먹입니다.',
    texture: '무른밥 (3~4배죽), 잘게 썬 재료',
    frequency: '1일 3회',
    amount: '120~150ml',
    startMonth: 9,
    endMonth: 11,
    newIngredients: allIngredients.filter(i => i.startMonth >= 9 && i.startMonth <= 11),
    cookingTips: [
      '재료를 7~10mm 크기로 잘라 잇몸으로 으깰 수 있게 하세요',
      '흰살생선은 가시를 완전히 제거하고 으깨 사용하세요',
      '간식으로 과일 스틱이나 떡뻥을 제공할 수 있습니다',
      '아기 스스로 숟가락을 잡도록 격려해주세요',
      '치즈는 무염 아기용 치즈를 선택하세요',
    ],
    cautionPoints: [
      '포도, 방울토마토 등 둥근 과일은 반으로 잘라주세요 (질식 위험)',
      '견과류는 통째로 주지 말고 반드시 갈아서 사용하세요',
      '새우, 조개 등 갑각류는 알레르기 위험이 높으니 소량부터 시작하세요',
      '이유식이 주식이 되어가므로 모유/분유량을 서서히 줄여가세요',
    ],
    sampleMenu: [
      '소고기버섯무른밥',
      '흰살생선파프리카무른밥',
      '달걀노른자시금치무른밥',
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
    amount: '150~200ml',
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

const allergyGuide: AllergyGuide = {
  title: '이유식 알레르기 가이드',
  description: '식품 알레르기는 영아기에 가장 흔하게 나타납니다. 새로운 식재료를 도입할 때는 반드시 소량부터 시작하고 반응을 관찰하세요.',
  highRiskFoods: [
    '달걀 (특히 흰자)',
    '우유 및 유제품',
    '밀 (밀가루)',
    '땅콩',
    '대두 (두부, 두유)',
    '갑각류 (새우, 게)',
    '견과류 (호두, 아몬드 등)',
    '생선',
  ],
  testingMethod: '새로운 식재료는 3~5일 간격으로 한 가지씩 소량(1/2~1작은술)부터 시작하세요. 오전 중에 먹여 낮 동안 반응을 관찰하고, 이상이 없으면 양을 서서히 늘려가세요. 2가지 이상의 새 재료를 동시에 시작하지 마세요.',
  emergencySigns: [
    '피부 두드러기, 발진, 부종',
    '구토 또는 반복적인 설사',
    '입술이나 혀의 부종',
    '호흡 곤란 또는 쌕쌕거림',
    '심한 보챔이나 축 처짐',
    '얼굴이 창백해지거나 파래짐',
  ],
};

const generalTips: string[] = [
  '이유식은 가능한 직접 만들어 신선한 재료를 사용하세요',
  '이유식 도구(냄비, 칼, 도마)는 별도로 사용하고 열탕 소독하세요',
  '남은 이유식은 즉시 냉장/냉동 보관하고, 재가열은 1회만 하세요',
  '아이의 컨디션이 안 좋거나 예방접종 당일에는 새 식재료를 도입하지 마세요',
  '이유식 시간을 규칙적으로 정해 식사 리듬을 만들어주세요',
  '먹는 양에 집착하지 말고 즐거운 식사 분위기를 만들어주세요',
  '수분 보충을 위해 이유식 후 보리차나 물을 소량 제공하세요',
  '식재료는 유기농, 무농약 제품을 선택하면 더 좋습니다',
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
