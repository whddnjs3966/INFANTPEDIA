export interface IngredientDetail {
  name: string;
  amount: string;
  emoji: string;
}

export interface MealItem {
  meal: string;
  menu: string;
  emoji: string;
  ingredients?: IngredientDetail[];
}

export interface WeeklyMealPlan {
  day: string;
  meals: MealItem[];
}

export interface MealPlanData {
  month: number;
  stage: string;
  description: string;
  texture: string;
  totalPerMeal: string;
  dailyFrequency: string;
  weeklyPlan: WeeklyMealPlan[];
  tips: string[];
  allergyNote?: string;
}

export const mealPlans: MealPlanData[] = [
  {
    month: 5,
    stage: '이유식 초기 (1회)',
    description: '쌀미음부터 시작, 하루 1회 1~2숟가락',
    texture: '묽은 미음 (10배죽)',
    totalPerMeal: '30~50ml',
    dailyFrequency: '하루 1회',
    weeklyPlan: [
      { day: '월', meals: [{ meal: '이유식', menu: '쌀미음', emoji: '🍚', ingredients: [{ name: '쌀미음', amount: '30~50ml', emoji: '🍚' }] }] },
      { day: '화', meals: [{ meal: '이유식', menu: '쌀미음', emoji: '🍚', ingredients: [{ name: '쌀미음', amount: '30~50ml', emoji: '🍚' }] }] },
      { day: '수', meals: [{ meal: '이유식', menu: '쌀미음', emoji: '🍚', ingredients: [{ name: '쌀미음', amount: '30~50ml', emoji: '🍚' }] }] },
      { day: '목', meals: [{ meal: '이유식', menu: '감자미음', emoji: '🥔', ingredients: [{ name: '쌀미음', amount: '20ml', emoji: '🍚' }, { name: '감자', amount: '10g', emoji: '🥔' }] }] },
      { day: '금', meals: [{ meal: '이유식', menu: '감자미음', emoji: '🥔', ingredients: [{ name: '쌀미음', amount: '20ml', emoji: '🍚' }, { name: '감자', amount: '10g', emoji: '🥔' }] }] },
      { day: '토', meals: [{ meal: '이유식', menu: '감자미음', emoji: '🥔', ingredients: [{ name: '쌀미음', amount: '20ml', emoji: '🍚' }, { name: '감자', amount: '10g', emoji: '🥔' }] }] },
      { day: '일', meals: [{ meal: '이유식', menu: '고구마미음', emoji: '🍠', ingredients: [{ name: '쌀미음', amount: '20ml', emoji: '🍚' }, { name: '고구마', amount: '10g', emoji: '🍠' }] }] },
    ],
    tips: [
      '새 식재료는 3일간 같은 것만 먹여 알레르기 반응을 확인하세요',
      '숟가락으로 1~2숟가락부터 시작해 점차 늘리세요',
      '이유식 후 모유/분유를 보충해 주세요',
    ],
  },
  {
    month: 6,
    stage: '이유식 초기 2단계 (1~2회)',
    description: '채소 → 과일 → 고기 순으로 식재료 확대',
    texture: '걸쭉한 미음~묽은 죽 (8배죽)',
    totalPerMeal: '50~80ml',
    dailyFrequency: '하루 1~2회',
    weeklyPlan: [
      { day: '월', meals: [
        { meal: '오전', menu: '브로콜리죽', emoji: '🥦', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '브로콜리', amount: '10g', emoji: '🥦' }] },
        { meal: '오후', menu: '쌀미음', emoji: '🍚', ingredients: [{ name: '쌀미음', amount: '50ml', emoji: '🍚' }] },
      ]},
      { day: '화', meals: [
        { meal: '오전', menu: '애호박죽', emoji: '🥒', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '애호박', amount: '10g', emoji: '🥒' }] },
        { meal: '오후', menu: '감자미음', emoji: '🥔', ingredients: [{ name: '쌀미음', amount: '40ml', emoji: '🍚' }, { name: '감자', amount: '10g', emoji: '🥔' }] },
      ]},
      { day: '수', meals: [
        { meal: '오전', menu: '당근죽', emoji: '🥕', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '당근', amount: '10g', emoji: '🥕' }] },
        { meal: '오후', menu: '고구마미음', emoji: '🍠', ingredients: [{ name: '쌀미음', amount: '40ml', emoji: '🍚' }, { name: '고구마', amount: '10g', emoji: '🍠' }] },
      ]},
      { day: '목', meals: [
        { meal: '오전', menu: '소고기미음', emoji: '🥩', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '소고기', amount: '10g', emoji: '🥩' }] },
        { meal: '오후', menu: '브로콜리죽', emoji: '🥦', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '브로콜리', amount: '10g', emoji: '🥦' }] },
      ]},
      { day: '금', meals: [
        { meal: '오전', menu: '소고기당근죽', emoji: '🥩', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '소고기', amount: '10g', emoji: '🥩' }, { name: '당근', amount: '10g', emoji: '🥕' }] },
        { meal: '오후', menu: '애호박죽', emoji: '🥒', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '애호박', amount: '10g', emoji: '🥒' }] },
      ]},
      { day: '토', meals: [
        { meal: '오전', menu: '닭가슴살죽', emoji: '🍗', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '닭가슴살', amount: '10g', emoji: '🍗' }] },
        { meal: '오후', menu: '감자죽', emoji: '🥔', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '감자', amount: '10g', emoji: '🥔' }] },
      ]},
      { day: '일', meals: [
        { meal: '오전', menu: '배죽', emoji: '🍐', ingredients: [{ name: '쌀죽', amount: '40ml', emoji: '🍚' }, { name: '배', amount: '10g', emoji: '🍐' }] },
        { meal: '오후', menu: '쌀죽', emoji: '🍚', ingredients: [{ name: '쌀죽', amount: '50ml', emoji: '🍚' }] },
      ]},
    ],
    tips: [
      '철분 보충을 위해 소고기를 빨리 시작하세요',
      '한 끼 50~80ml 정도가 적당해요',
      '계란 노른자는 소량부터 시도해 보세요',
    ],
    allergyNote: '계란, 밀, 우유는 소량씩 시작하고 3일간 반응 관찰',
  },
  {
    month: 7,
    stage: '이유식 중기 (2회)',
    description: '다진 형태로 업그레이드, 다양한 식재료 시도',
    texture: '으깬 형태~잘게 다진 형태 (5~6배죽)',
    totalPerMeal: '80~120ml',
    dailyFrequency: '하루 2회',
    weeklyPlan: [
      { day: '월', meals: [
        { meal: '오전', menu: '소고기감자죽', emoji: '🥩', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '소고기', amount: '15g', emoji: '🥩' }, { name: '감자', amount: '15g', emoji: '🥔' }] },
        { meal: '오후', menu: '두부브로콜리죽', emoji: '🥦', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '두부', amount: '15g', emoji: '🫘' }, { name: '브로콜리', amount: '15g', emoji: '🥦' }] },
      ]},
      { day: '화', meals: [
        { meal: '오전', menu: '닭가슴살채소죽', emoji: '🍗', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '닭가슴살', amount: '15g', emoji: '🍗' }, { name: '채소', amount: '15g', emoji: '🥬' }] },
        { meal: '오후', menu: '고구마사과죽', emoji: '🍠', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '고구마', amount: '10g', emoji: '🍠' }, { name: '사과', amount: '10g', emoji: '🍎' }] },
      ]},
      { day: '수', meals: [
        { meal: '오전', menu: '소고기당근애호박죽', emoji: '🥕', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '소고기', amount: '15g', emoji: '🥩' }, { name: '당근', amount: '10g', emoji: '🥕' }, { name: '애호박', amount: '10g', emoji: '🥒' }] },
        { meal: '오후', menu: '바나나오트밀', emoji: '🍌', ingredients: [{ name: '오트밀', amount: '50ml', emoji: '🥣' }, { name: '바나나', amount: '15g', emoji: '🍌' }] },
      ]},
      { day: '목', meals: [
        { meal: '오전', menu: '흰살생선감자죽', emoji: '🐟', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '흰살생선', amount: '15g', emoji: '🐟' }, { name: '감자', amount: '15g', emoji: '🥔' }] },
        { meal: '오후', menu: '달걀노른자죽', emoji: '🥚', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '달걀노른자', amount: '1/3개', emoji: '🥚' }] },
      ]},
      { day: '금', meals: [
        { meal: '오전', menu: '소고기시금치죽', emoji: '🥬', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '소고기', amount: '15g', emoji: '🥩' }, { name: '시금치', amount: '15g', emoji: '🥬' }] },
        { meal: '오후', menu: '단호박죽', emoji: '🎃', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '단호박', amount: '15g', emoji: '🎃' }] },
      ]},
      { day: '토', meals: [
        { meal: '오전', menu: '닭가슴살배죽', emoji: '🍗', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '닭가슴살', amount: '15g', emoji: '🍗' }, { name: '배', amount: '10g', emoji: '🍐' }] },
        { meal: '오후', menu: '두부당근죽', emoji: '🥕', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '두부', amount: '15g', emoji: '🫘' }, { name: '당근', amount: '15g', emoji: '🥕' }] },
      ]},
      { day: '일', meals: [
        { meal: '오전', menu: '소고기비타민죽', emoji: '🥩', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '소고기', amount: '15g', emoji: '🥩' }, { name: '채소', amount: '15g', emoji: '🥬' }] },
        { meal: '오후', menu: '감자치즈죽', emoji: '🧀', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '감자', amount: '10g', emoji: '🥔' }, { name: '치즈', amount: '5g', emoji: '🧀' }] },
      ]},
    ],
    tips: [
      '덩어리를 조금씩 남겨 씹는 연습을 시켜주세요',
      '컵으로 물 마시는 연습을 시작하세요',
      '한 끼 80~120ml 정도가 적당해요',
    ],
  },
  {
    month: 8,
    stage: '이유식 중기 (2회)',
    description: '핑거푸드 시작, 직접 잡고 먹는 연습',
    texture: '부드럽게 다진 형태 (4~5배죽)',
    totalPerMeal: '100~120ml',
    dailyFrequency: '하루 2회',
    weeklyPlan: [
      { day: '월', meals: [
        { meal: '오전', menu: '소고기야채진밥', emoji: '🥩', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '소고기', amount: '20g', emoji: '🥩' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '오후', menu: '두부스틱 + 감자죽', emoji: '🥔', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '두부', amount: '20g', emoji: '🫘' }, { name: '감자', amount: '20g', emoji: '🥔' }] },
      ]},
      { day: '화', meals: [
        { meal: '오전', menu: '닭가슴살리소토', emoji: '🍗', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '닭가슴살', amount: '20g', emoji: '🍗' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '오후', menu: '바나나팬케이크', emoji: '🍌', ingredients: [{ name: '쌀가루', amount: '30g', emoji: '🍚' }, { name: '바나나', amount: '20g', emoji: '🍌' }, { name: '달걀', amount: '1/2개', emoji: '🥚' }] },
      ]},
      { day: '수', meals: [
        { meal: '오전', menu: '연어감자매시', emoji: '🐟', ingredients: [{ name: '감자', amount: '50g', emoji: '🥔' }, { name: '연어', amount: '20g', emoji: '🐟' }, { name: '채소', amount: '15g', emoji: '🥬' }] },
        { meal: '오후', menu: '당근스틱 + 애호박죽', emoji: '🥕', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '당근', amount: '15g', emoji: '🥕' }, { name: '애호박', amount: '15g', emoji: '🥒' }] },
      ]},
      { day: '목', meals: [
        { meal: '오전', menu: '소고기미역죽', emoji: '🥩', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '소고기', amount: '20g', emoji: '🥩' }, { name: '미역', amount: '5g', emoji: '🌿' }] },
        { meal: '오후', menu: '고구마스틱 + 과일', emoji: '🍠', ingredients: [{ name: '고구마', amount: '40g', emoji: '🍠' }, { name: '과일', amount: '20g', emoji: '🍎' }] },
      ]},
      { day: '금', meals: [
        { meal: '오전', menu: '달걀찜 + 야채죽', emoji: '🥚', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '달걀', amount: '1/2개', emoji: '🥚' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '오후', menu: '두부구이 + 브로콜리', emoji: '🥦', ingredients: [{ name: '쌀죽', amount: '60ml', emoji: '🍚' }, { name: '두부', amount: '20g', emoji: '🫘' }, { name: '브로콜리', amount: '15g', emoji: '🥦' }] },
      ]},
      { day: '토', meals: [
        { meal: '오전', menu: '닭가슴살야채죽', emoji: '🍗', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '닭가슴살', amount: '20g', emoji: '🍗' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '오후', menu: '감자매시 + 사과', emoji: '🍎', ingredients: [{ name: '감자', amount: '50g', emoji: '🥔' }, { name: '사과', amount: '20g', emoji: '🍎' }] },
      ]},
      { day: '일', meals: [
        { meal: '오전', menu: '소고기단호박죽', emoji: '🎃', ingredients: [{ name: '쌀죽', amount: '70ml', emoji: '🍚' }, { name: '소고기', amount: '20g', emoji: '🥩' }, { name: '단호박', amount: '20g', emoji: '🎃' }] },
        { meal: '오후', menu: '오트밀 + 배', emoji: '🍐', ingredients: [{ name: '오트밀', amount: '50ml', emoji: '🥣' }, { name: '배', amount: '20g', emoji: '🍐' }] },
      ]},
    ],
    tips: [
      '핑거푸드로 삶은 당근, 바나나, 두부를 시도해 보세요',
      '스스로 잡고 먹는 연습이 소근육 발달에 좋아요',
      '한 끼 100~120ml 정도가 적당해요',
    ],
  },
  {
    month: 9,
    stage: '이유식 후기 (3회)',
    description: '하루 3끼 + 간식 1~2회, 밥/반찬 형태로 전환',
    texture: '잘게 다진 형태~무른 밥 (3배죽~진밥)',
    totalPerMeal: '120~150ml',
    dailyFrequency: '하루 3회',
    weeklyPlan: [
      { day: '월', meals: [
        { meal: '아침', menu: '소고기야채진밥', emoji: '🥩', ingredients: [{ name: '진밥', amount: '80g', emoji: '🍚' }, { name: '소고기', amount: '25g', emoji: '🥩' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
        { meal: '점심', menu: '닭가슴살감자수프', emoji: '🍗', ingredients: [{ name: '감자', amount: '50g', emoji: '🥔' }, { name: '닭가슴살', amount: '25g', emoji: '🍗' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '저녁', menu: '두부시금치무른밥', emoji: '🥬', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '두부', amount: '20g', emoji: '🫘' }, { name: '시금치', amount: '20g', emoji: '🥬' }] },
      ]},
      { day: '화', meals: [
        { meal: '아침', menu: '달걀야채볶음밥', emoji: '🥚', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '달걀', amount: '1/2개', emoji: '🥚' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
        { meal: '점심', menu: '소고기미역무른밥', emoji: '🥩', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '소고기', amount: '25g', emoji: '🥩' }, { name: '미역', amount: '5g', emoji: '🌿' }] },
        { meal: '저녁', menu: '흰살생선구이 + 야채', emoji: '🐟', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '흰살생선', amount: '25g', emoji: '🐟' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
      ]},
      { day: '수', meals: [
        { meal: '아침', menu: '감자치즈옴렛', emoji: '🧀', ingredients: [{ name: '감자', amount: '40g', emoji: '🥔' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '치즈', amount: '5g', emoji: '🧀' }] },
        { meal: '점심', menu: '닭가슴살리소토', emoji: '🍗', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '닭가슴살', amount: '25g', emoji: '🍗' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '저녁', menu: '소고기당근무른밥', emoji: '🥕', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '소고기', amount: '25g', emoji: '🥩' }, { name: '당근', amount: '25g', emoji: '🥕' }] },
      ]},
      { day: '목', meals: [
        { meal: '아침', menu: '오트밀 + 과일', emoji: '🍌', ingredients: [{ name: '오트밀', amount: '60ml', emoji: '🥣' }, { name: '과일', amount: '30g', emoji: '🍌' }] },
        { meal: '점심', menu: '소고기브로콜리밥', emoji: '🥦', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '소고기', amount: '25g', emoji: '🥩' }, { name: '브로콜리', amount: '25g', emoji: '🥦' }] },
        { meal: '저녁', menu: '두부구이 + 야채밥', emoji: '🥣', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '두부', amount: '25g', emoji: '🫘' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
      ]},
      { day: '금', meals: [
        { meal: '아침', menu: '달걀찜 + 무른밥', emoji: '🥚', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '채소', amount: '15g', emoji: '🥬' }] },
        { meal: '점심', menu: '연어감자매시', emoji: '🐟', ingredients: [{ name: '감자', amount: '60g', emoji: '🥔' }, { name: '연어', amount: '25g', emoji: '🐟' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '저녁', menu: '닭가슴살야채수프', emoji: '🍗', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '닭가슴살', amount: '25g', emoji: '🍗' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
      ]},
      { day: '토', meals: [
        { meal: '아침', menu: '고구마팬케이크', emoji: '🍠', ingredients: [{ name: '고구마', amount: '40g', emoji: '🍠' }, { name: '쌀가루', amount: '20g', emoji: '🍚' }, { name: '달걀', amount: '1/2개', emoji: '🥚' }] },
        { meal: '점심', menu: '소고기단호박밥', emoji: '🎃', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '소고기', amount: '25g', emoji: '🥩' }, { name: '단호박', amount: '25g', emoji: '🎃' }] },
        { meal: '저녁', menu: '두부채소무른밥', emoji: '🥣', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '두부', amount: '20g', emoji: '🫘' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
      ]},
      { day: '일', meals: [
        { meal: '아침', menu: '바나나오트밀', emoji: '🍌', ingredients: [{ name: '오트밀', amount: '60ml', emoji: '🥣' }, { name: '바나나', amount: '30g', emoji: '🍌' }] },
        { meal: '점심', menu: '닭가슴살감자밥', emoji: '🍗', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '닭가슴살', amount: '25g', emoji: '🍗' }, { name: '감자', amount: '25g', emoji: '🥔' }] },
        { meal: '저녁', menu: '소고기시금치밥', emoji: '🥬', ingredients: [{ name: '무른밥', amount: '80g', emoji: '🍚' }, { name: '소고기', amount: '25g', emoji: '🥩' }, { name: '시금치', amount: '25g', emoji: '🥬' }] },
      ]},
    ],
    tips: [
      '가족과 함께 식탁에서 먹는 습관을 시작하세요',
      '새로운 음식은 거부해도 10~15회 반복 시도하세요',
      '한 끼 120~150ml 정도가 적당해요',
    ],
  },
  {
    month: 10,
    stage: '이유식 후기 (3회)',
    description: '스스로 먹기 격려, 다양한 식감 경험',
    texture: '무른 밥~진밥, 잘게 썬 반찬',
    totalPerMeal: '130~150ml',
    dailyFrequency: '하루 3회',
    weeklyPlan: [
      { day: '월', meals: [
        { meal: '아침', menu: '소고기야채밥 + 달걀찜', emoji: '🥩', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '채소', amount: '30g', emoji: '🥬' }, { name: '달걀', amount: '1/2개', emoji: '🥚' }] },
        { meal: '점심', menu: '닭가슴살카레밥', emoji: '🍗', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '30g', emoji: '🍗' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '두부시금치밥 + 과일', emoji: '🥬', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '25g', emoji: '🫘' }, { name: '시금치', amount: '25g', emoji: '🥬' }] },
      ]},
      { day: '화', meals: [
        { meal: '아침', menu: '감자옴렛 + 토스트', emoji: '🥚', ingredients: [{ name: '감자', amount: '40g', emoji: '🥔' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '식빵', amount: '1/2장', emoji: '🍞' }] },
        { meal: '점심', menu: '소고기미역밥', emoji: '🥩', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '미역', amount: '5g', emoji: '🌿' }] },
        { meal: '저녁', menu: '생선구이 + 야채밥', emoji: '🐟', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '흰살생선', amount: '30g', emoji: '🐟' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '수', meals: [
        { meal: '아침', menu: '치즈리소토', emoji: '🧀', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '치즈', amount: '10g', emoji: '🧀' }, { name: '채소', amount: '20g', emoji: '🥬' }] },
        { meal: '점심', menu: '닭가슴살채소볶음밥', emoji: '🍗', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '30g', emoji: '🍗' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '소고기브로콜리밥', emoji: '🥦', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '브로콜리', amount: '30g', emoji: '🥦' }] },
      ]},
      { day: '목', meals: [
        { meal: '아침', menu: '오트밀 + 바나나', emoji: '🍌', ingredients: [{ name: '오트밀', amount: '70ml', emoji: '🥣' }, { name: '바나나', amount: '30g', emoji: '🍌' }] },
        { meal: '점심', menu: '두부구이정식', emoji: '🥣', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '30g', emoji: '🫘' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
        { meal: '저녁', menu: '소고기단호박진밥', emoji: '🎃', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '단호박', amount: '30g', emoji: '🎃' }] },
      ]},
      { day: '금', meals: [
        { meal: '아침', menu: '고구마팬케이크', emoji: '🍠', ingredients: [{ name: '고구마', amount: '50g', emoji: '🍠' }, { name: '쌀가루', amount: '20g', emoji: '🍚' }, { name: '달걀', amount: '1/2개', emoji: '🥚' }] },
        { meal: '점심', menu: '연어파스타', emoji: '🐟', ingredients: [{ name: '파스타면', amount: '60g', emoji: '🍝' }, { name: '연어', amount: '30g', emoji: '🐟' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
        { meal: '저녁', menu: '닭가슴살야채밥', emoji: '🍗', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '30g', emoji: '🍗' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '토', meals: [
        { meal: '아침', menu: '프렌치토스트', emoji: '🍞', ingredients: [{ name: '식빵', amount: '1장', emoji: '🍞' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '우유', amount: '30ml', emoji: '🥛' }] },
        { meal: '점심', menu: '소고기감자조림 + 밥', emoji: '🥩', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '감자', amount: '30g', emoji: '🥔' }] },
        { meal: '저녁', menu: '두부채소볶음 + 밥', emoji: '🥣', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '25g', emoji: '🫘' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '일', meals: [
        { meal: '아침', menu: '달걀채소볶음밥', emoji: '🥚', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '채소', amount: '25g', emoji: '🥬' }] },
        { meal: '점심', menu: '닭가슴살수프 + 빵', emoji: '🍗', ingredients: [{ name: '식빵', amount: '1장', emoji: '🍞' }, { name: '닭가슴살', amount: '30g', emoji: '🍗' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '소고기시금치밥', emoji: '🥬', ingredients: [{ name: '진밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '시금치', amount: '25g', emoji: '🥬' }] },
      ]},
    ],
    tips: [
      '아기용 숟가락을 쥐게 해 스스로 먹는 연습을 시작하세요',
      '엉망이 되어도 괜찮아요! 자율 식사가 발달에 좋아요',
      '한 끼 130~150ml 정도가 적당해요',
    ],
  },
  {
    month: 11,
    stage: '이유식 후기~유아식 전환 (3회)',
    description: '가족 식단 적용 시작, 염분/당분 줄여서',
    texture: '진밥~일반 밥, 잘게 썬 반찬',
    totalPerMeal: '140~150ml',
    dailyFrequency: '하루 3회',
    weeklyPlan: [
      { day: '월', meals: [
        { meal: '아침', menu: '소고기야채죽 + 과일', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '채소', amount: '30g', emoji: '🥬' }, { name: '과일', amount: '20g', emoji: '🍎' }] },
        { meal: '점심', menu: '닭볶음밥 (순한맛)', emoji: '🍗', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '두부조림 + 밥 + 야채', emoji: '🥣', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '30g', emoji: '🫘' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '화', meals: [
        { meal: '아침', menu: '달걀볶음 + 밥 + 우유', emoji: '🥚', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '소고기카레밥', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '생선조림 + 밥 + 나물', emoji: '🐟', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '흰살생선', amount: '30g', emoji: '🐟' }, { name: '나물', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '수', meals: [
        { meal: '아침', menu: '치즈토스트 + 우유', emoji: '🧀', ingredients: [{ name: '식빵', amount: '1장', emoji: '🍞' }, { name: '치즈', amount: '15g', emoji: '🧀' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '닭가슴살비빔밥', emoji: '🍗', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
        { meal: '저녁', menu: '소고기미역국 + 밥', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '30g', emoji: '🥩' }, { name: '미역', amount: '10g', emoji: '🌿' }] },
      ]},
      { day: '목', meals: [
        { meal: '아침', menu: '감자수프 + 빵', emoji: '🥔', ingredients: [{ name: '감자', amount: '60g', emoji: '🥔' }, { name: '식빵', amount: '1장', emoji: '🍞' }, { name: '우유', amount: '50ml', emoji: '🥛' }] },
        { meal: '점심', menu: '두부채소볶음밥', emoji: '🥣', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '30g', emoji: '🫘' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
        { meal: '저녁', menu: '닭가슴살스프 + 밥', emoji: '🍗', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '금', meals: [
        { meal: '아침', menu: '바나나팬케이크 + 우유', emoji: '🍌', ingredients: [{ name: '쌀가루', amount: '30g', emoji: '🍚' }, { name: '바나나', amount: '30g', emoji: '🍌' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '소고기잡채밥', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
        { meal: '저녁', menu: '달걀찜 + 야채밥', emoji: '🥚', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '토', meals: [
        { meal: '아침', menu: '고구마 + 우유 + 과일', emoji: '🍠', ingredients: [{ name: '고구마', amount: '60g', emoji: '🍠' }, { name: '우유', amount: '100ml', emoji: '🥛' }, { name: '과일', amount: '30g', emoji: '🍎' }] },
        { meal: '점심', menu: '새우볶음밥 (순한맛)', emoji: '🦐', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '새우', amount: '30g', emoji: '🦐' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '소고기감자조림 + 밥', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '감자', amount: '30g', emoji: '🥔' }] },
      ]},
      { day: '일', meals: [
        { meal: '아침', menu: '오트밀 + 과일 + 우유', emoji: '🍌', ingredients: [{ name: '오트밀', amount: '70ml', emoji: '🥣' }, { name: '과일', amount: '30g', emoji: '🍌' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '닭가슴살파스타', emoji: '🍗', ingredients: [{ name: '파스타면', amount: '70g', emoji: '🍝' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '두부된장국 + 밥 (저염)', emoji: '🥣', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '30g', emoji: '🫘' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
    ],
    tips: [
      '가족 식단에서 염분·당분만 줄여 함께 먹어요',
      '꿀, 통째 견과류는 아직 주의하세요',
      '젖병 대신 컵으로 우유 마시는 연습을 하세요',
    ],
  },
  {
    month: 12,
    stage: '유아식 (3회 + 간식 2회)',
    description: '생우유 전환, 거의 가족 식단과 동일',
    texture: '일반 밥, 부드러운 반찬 (작게 썰기)',
    totalPerMeal: '150~200ml',
    dailyFrequency: '하루 3회 + 간식 2회',
    weeklyPlan: [
      { day: '월', meals: [
        { meal: '아침', menu: '달걀프라이 + 밥 + 우유', emoji: '🥚', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '소고기카레밥 + 야채', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
        { meal: '저녁', menu: '닭구이 + 밥 + 시금치', emoji: '🍗', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '시금치', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '화', meals: [
        { meal: '아침', menu: '치즈토스트 + 우유 + 과일', emoji: '🧀', ingredients: [{ name: '식빵', amount: '1장', emoji: '🍞' }, { name: '치즈', amount: '15g', emoji: '🧀' }, { name: '우유', amount: '100ml', emoji: '🥛' }, { name: '과일', amount: '30g', emoji: '🍎' }] },
        { meal: '점심', menu: '소고기비빔밥', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '채소', amount: '40g', emoji: '🥬' }] },
        { meal: '저녁', menu: '생선구이 + 밥 + 국', emoji: '🐟', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '흰살생선', amount: '35g', emoji: '🐟' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '수', meals: [
        { meal: '아침', menu: '감자옴렛 + 우유', emoji: '🥔', ingredients: [{ name: '감자', amount: '50g', emoji: '🥔' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '닭볶음밥 + 야채', emoji: '🍗', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
        { meal: '저녁', menu: '두부조림 + 밥 + 나물', emoji: '🥣', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '30g', emoji: '🫘' }, { name: '나물', amount: '30g', emoji: '🥬' }] },
      ]},
      { day: '목', meals: [
        { meal: '아침', menu: '바나나팬케이크 + 우유', emoji: '🍌', ingredients: [{ name: '쌀가루', amount: '30g', emoji: '🍚' }, { name: '바나나', amount: '30g', emoji: '🍌' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '소고기미역국 + 밥', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '미역', amount: '10g', emoji: '🌿' }] },
        { meal: '저녁', menu: '달걀찜 + 잡채밥', emoji: '🥚', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
      ]},
      { day: '금', meals: [
        { meal: '아침', menu: '고구마 + 우유 + 과일', emoji: '🍠', ingredients: [{ name: '고구마', amount: '60g', emoji: '🍠' }, { name: '우유', amount: '100ml', emoji: '🥛' }, { name: '과일', amount: '30g', emoji: '🍎' }] },
        { meal: '점심', menu: '연어파스타', emoji: '🐟', ingredients: [{ name: '파스타면', amount: '70g', emoji: '🍝' }, { name: '연어', amount: '35g', emoji: '🐟' }, { name: '채소', amount: '30g', emoji: '🥬' }] },
        { meal: '저녁', menu: '닭가슴살스프 + 빵', emoji: '🍗', ingredients: [{ name: '식빵', amount: '1장', emoji: '🍞' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
      ]},
      { day: '토', meals: [
        { meal: '아침', menu: '프렌치토스트 + 우유', emoji: '🍞', ingredients: [{ name: '식빵', amount: '1장', emoji: '🍞' }, { name: '달걀', amount: '1개', emoji: '🥚' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '소고기감자조림 + 밥', emoji: '🥩', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '감자', amount: '35g', emoji: '🥔' }] },
        { meal: '저녁', menu: '두부채소볶음 + 밥', emoji: '🥣', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '두부', amount: '30g', emoji: '🫘' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
      ]},
      { day: '일', meals: [
        { meal: '아침', menu: '오트밀 + 과일 + 우유', emoji: '🍌', ingredients: [{ name: '오트밀', amount: '70ml', emoji: '🥣' }, { name: '과일', amount: '30g', emoji: '🍌' }, { name: '우유', amount: '100ml', emoji: '🥛' }] },
        { meal: '점심', menu: '닭가슴살카레밥', emoji: '🍗', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '닭가슴살', amount: '35g', emoji: '🍗' }, { name: '채소', amount: '35g', emoji: '🥬' }] },
        { meal: '저녁', menu: '소고기시금치밥 + 국', emoji: '🥬', ingredients: [{ name: '밥', amount: '90g', emoji: '🍚' }, { name: '소고기', amount: '35g', emoji: '🥩' }, { name: '시금치', amount: '30g', emoji: '🥬' }] },
      ]},
    ],
    tips: [
      '생우유(멸균우유) 하루 400~500ml로 전환하세요',
      '간식은 오전·오후 2회, 과일/쌀과자/치즈 등',
      '다양한 식감과 색감의 음식을 경험하게 해주세요',
    ],
  },
];

export function getMealPlanForMonth(month: number): MealPlanData | undefined {
  return mealPlans.find((p) => p.month === month);
}
