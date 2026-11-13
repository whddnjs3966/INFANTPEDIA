// Health FAQ Data for InfantPedia (0-12 months)
// Each answer with reference metadata carries its own source-check date.
// Evidence lists reference material only; no staff approval workflow.
// All user-facing text in Korean (한국어)

export type FAQCategory = 'fever' | 'skin' | 'digestion' | 'respiratory' | 'general';

export interface HealthEvidence {
  sources: { title: string; url: string }[];
  checkedOn?: string;
  scope?: string;
}

export interface HealthFAQItem {
  care?: { summary: string; steps: string[]; avoid: string[]; seekHelp: string };
  evidence?: HealthEvidence; // Reference metadata is available on selected answers.
  id: string;
  category: FAQCategory;
  question: string;
  answer: string;
  urgency: 'info' | 'caution' | 'emergency';
  tags: string[];
  applicableMonths: number[]; // empty = all months
  emoji: string;
}

export interface FAQCategoryInfo {
  id: FAQCategory;
  label: string;
  emoji: string;
  color: string;
  icon: string;
}

export const faqCategories: FAQCategoryInfo[] = [
  { id: 'fever', label: '발열', emoji: '🌡️', color: 'red', icon: 'Thermometer' },
  { id: 'skin', label: '피부', emoji: '🧴', color: 'pink', icon: 'Droplets' },
  { id: 'digestion', label: '소화', emoji: '🤢', color: 'green', icon: 'Apple' },
  { id: 'respiratory', label: '호흡기', emoji: '🫁', color: 'sky', icon: 'Wind' },
  { id: 'general', label: '일반', emoji: '💊', color: 'purple', icon: 'Pill' },
];

type Care = NonNullable<HealthFAQItem["care"]>;

function withCare(item: Omit<HealthFAQItem, "answer" | "care" | "evidence">, care: Care, evidence: HealthEvidence): HealthFAQItem {
  const answer = [
    care.summary,
    ...care.steps.map((step, index) => `${index + 1}. ${step}`),
    ...(care.avoid.length ? [`피해주세요: ${care.avoid.join(" ")}`] : []),
    `진료·도움: ${care.seekHelp}`,
  ].join("\n\n");
  return { ...item, answer, care, evidence };
}

export const healthFAQs: HealthFAQItem[] = [
  // ============================================================
  // FEVER (발열) — 18 items
  // ============================================================
  {
    id: 'fever_01',
    category: 'fever',
    question: '아기 체온은 어디에서 재는 것이 가장 정확한가요?',
    answer: "체온은 측정 부위와 기기에 따라 해석이 달라요. 측정한 값과 부위를 함께 확인하세요.\n\n1. 전자 체온계의 설명서에 맞게 측정하고 값·부위·시간을 기록하세요.\n\n2. 직장 체온 38°C 이상은 발열 기준입니다. 겨드랑이 등 다른 부위의 값을 일정한 차이로 환산해 진료 여부를 정하지 마세요.\n\n피해주세요: 익숙하지 않은 측정법을 무리하게 시도하지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.",
    urgency: "caution",
    tags: ['체온', '측정', '체온계', '겨드랑이', '고막', '항문'],
    applicableMonths: [],
    emoji: '🌡️',

    care: {"summary":"체온은 측정 부위와 기기에 따라 해석이 달라요. 측정한 값과 부위를 함께 확인하세요.","steps":["전자 체온계의 설명서에 맞게 측정하고 값·부위·시간을 기록하세요.","직장 체온 38°C 이상은 발열 기준입니다. 겨드랑이 등 다른 부위의 값을 일정한 차이로 환산해 진료 여부를 정하지 마세요."],"avoid":["익숙하지 않은 측정법을 무리하게 시도하지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요."},
    evidence: {"sources":[{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  withCare({
    id: 'fever_02',
    category: 'fever',
    question: '겨드랑이 체온계로 정확하게 재는 방법이 있나요?',
    urgency: 'info',
    tags: ['체온', '겨드랑이', '체온계', '측정법'],
    applicableMonths: [],
    emoji: '📏',
  }, {
    summary: "디지털 체온계 끝을 겨드랑이 위쪽 피부에 밀착해 재요.",
    steps: ["팔을 몸에 붙여 기기 안내에 따라 측정이 끝날 때까지 기다려요. 목욕 직후나 두껍게 싸맨 직후라면 잠시 기다렸다가 재고, 측정 부위와 수치를 기록해요."],
    avoid: ["측정 부위에 따라 임의로 일정한 온도를 더하지 마세요."],
    seekHelp: "생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 체온 측정", url: "https://www.nhs.uk/baby/health/how-to-take-your-babys-temperature/" },
      { title: "AAP · 영아의 발열", url: "https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx" },
    ],
  }),
  withCare({
    id: 'fever_03',
    category: 'fever',
    question: '고막 체온계는 몇 개월부터 사용할 수 있나요?',
    urgency: 'info',
    tags: ['고막', '체온계', '귀', '측정'],
    applicableMonths: [6, 7, 8, 9, 10, 11, 12],
    emoji: '👂',
  }, {
    summary: "생후 6개월 미만은 귓구멍이 작아 고막 체온계가 부정확할 수 있어요.",
    steps: ["어린 아기는 디지털 체온계로 겨드랑이를 재는 방법을 쓸 수 있어요. 고막 체온계를 사용할 때는 기기 안내에 따라 위치를 맞춰요."],
    avoid: ["고막 체온계의 수치 하나만 보고 아기가 괜찮다고 판단하지 마세요."],
    seekHelp: "생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 체온 측정", url: "https://www.nhs.uk/baby/health/how-to-take-your-babys-temperature/" },
      { title: "AAP · 영아의 발열", url: "https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx" },
    ],
  }),
  {
    id: 'fever_04',
    category: 'fever',
    question: '아기 체온이 37.5도입니다. 열이 있는 건가요?',
    answer: "37.5°C라는 숫자 하나만으로 아기의 상태를 판단하기는 어려워요.\n\n1. 측정 부위와 기기 사용법을 확인하세요. 목욕이나 두꺼운 옷으로 체온이 영향을 받았는지도 살펴보세요.\n\n2. 아기가 잘 먹는지, 소변과 반응·호흡이 평소와 같은지 함께 확인하세요.\n\n피해주세요: 아기가 아파 보이면 재측정 시간만 기다리지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['미열', '37.5도', '체온', '관찰'],
    applicableMonths: [],
    emoji: '🤒',

    care: {"summary":"37.5°C라는 숫자 하나만으로 아기의 상태를 판단하기는 어려워요.","steps":["측정 부위와 기기 사용법을 확인하세요. 목욕이나 두꺼운 옷으로 체온이 영향을 받았는지도 살펴보세요.","아기가 잘 먹는지, 소변과 반응·호흡이 평소와 같은지 함께 확인하세요."],"avoid":["아기가 아파 보이면 재측정 시간만 기다리지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_05',
    category: 'fever',
    question: '아기 체온이 38도일 때 어떻게 해야 하나요?',
    answer: "38°C 이상의 체온이 확인되면 나이와 현재 상태를 먼저 확인하세요.\n\n1. 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.\n\n2. 더 큰 아기도 반응·호흡·수유·소변 상태를 확인하고, 걱정되거나 상태가 나빠지면 의료진과 상담하세요.\n\n3. 모유·분유 등 평소 수분 공급을 이어가고 너무 덥게 싸지 마세요.\n\n피해주세요: 해열제를 먹이고 열이 내려가는지만으로 안전하다고 판단하지 마세요. 해열을 목적으로 물수건으로 몸을 닦거나 찬물로 식히지 마세요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['38도', '발열', '해열제', '수분'],
    applicableMonths: [],
    emoji: '🔥',

    care: {"summary":"38°C 이상의 체온이 확인되면 나이와 현재 상태를 먼저 확인하세요.","steps":["생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.","더 큰 아기도 반응·호흡·수유·소변 상태를 확인하고, 걱정되거나 상태가 나빠지면 의료진과 상담하세요.","모유·분유 등 평소 수분 공급을 이어가고 너무 덥게 싸지 마세요."],"avoid":["해열제를 먹이고 열이 내려가는지만으로 안전하다고 판단하지 마세요.","해열을 목적으로 물수건으로 몸을 닦거나 찬물로 식히지 마세요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_06',
    category: 'fever',
    question: '아기 체온이 39도 이상입니다. 응급 상황인가요?',
    answer: "고열은 체온과 함께 아기의 나이·반응·호흡·수분 상태를 살펴야 해요.\n\n1. 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.\n\n2. 수유를 잘 못 하거나 소변이 줄고 평소와 다르게 처지면 지체하지 말고 진료를 받으세요.\n\n피해주세요: 해열제 투여 후 정해진 시간까지 기다려야 진료받을 수 있는 것은 아니에요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "emergency",
    tags: ['고열', '39도', '응급', '해열제'],
    applicableMonths: [],
    emoji: '🚨',

    care: {"summary":"고열은 체온과 함께 아기의 나이·반응·호흡·수분 상태를 살펴야 해요.","steps":["생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.","수유를 잘 못 하거나 소변이 줄고 평소와 다르게 처지면 지체하지 말고 진료를 받으세요."],"avoid":["해열제 투여 후 정해진 시간까지 기다려야 진료받을 수 있는 것은 아니에요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_07',
    category: 'fever',
    question: '생후 3개월 미만 아기가 열이 나면 왜 위험한가요?',
    answer: "어린 영아는 열이 날 때 심각한 감염 여부를 빠르게 확인해야 해요.\n\n1. 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.\n\n2. 측정한 체온과 부위, 수유·소변 변화, 최근 접종과 먹인 약이 있다면 의료진에게 알려주세요.\n\n피해주세요: 아기가 겉으로 괜찮아 보여도 스스로 해열제만 먹이며 기다리지 마세요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "emergency",
    tags: ['신생아', '3개월 미만', '발열', '패혈증', '응급'],
    applicableMonths: [0, 1, 2],
    emoji: '⚠️',

    care: {"summary":"어린 영아는 열이 날 때 심각한 감염 여부를 빠르게 확인해야 해요.","steps":["생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.","측정한 체온과 부위, 수유·소변 변화, 최근 접종과 먹인 약이 있다면 의료진에게 알려주세요."],"avoid":["아기가 겉으로 괜찮아 보여도 스스로 해열제만 먹이며 기다리지 마세요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_08',
    category: 'fever',
    question: '아세트아미노펜(타이레놀) 해열제 복용법을 알려주세요.',
    answer: "아세트아미노펜은 제품 농도와 현재 체중을 확인해 의료진·약사의 안내대로 사용하세요.\n\n1. 약 이름뿐 아니라 성분·농도와 제품 설명서의 대상 연령·용량·간격을 확인하세요.\n\n2. 제공된 계량 도구를 쓰고 먹인 시간과 양을 기록하세요.\n\n피해주세요: 다른 감기약에 같은 성분이 들어 있지 않은지 확인하고 임의로 함께 먹이지 마세요. 오래된 체중이나 다른 제품의 mL 용량을 그대로 사용하지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.",
    urgency: "caution",
    tags: ['해열제', '타이레놀', '아세트아미노펜', '복용법', '용량'],
    applicableMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '💊',

    care: {"summary":"아세트아미노펜은 제품 농도와 현재 체중을 확인해 의료진·약사의 안내대로 사용하세요.","steps":["약 이름뿐 아니라 성분·농도와 제품 설명서의 대상 연령·용량·간격을 확인하세요.","제공된 계량 도구를 쓰고 먹인 시간과 양을 기록하세요."],"avoid":["다른 감기약에 같은 성분이 들어 있지 않은지 확인하고 임의로 함께 먹이지 마세요.","오래된 체중이나 다른 제품의 mL 용량을 그대로 사용하지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요."},
    evidence: {"sources":[{"title":"식약처 · 의약품 안전사용 매뉴얼","url":"https://nedrug.mfds.go.kr/pbp/CCBFC03/getItem?tchmtrId=SU201911240002"},{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_09',
    category: 'fever',
    question: '이부프로펜(부루펜) 해열제는 언제부터 먹일 수 있나요?',
    answer: "이부프로펜은 아기의 나이·체중·탈수 여부와 제품 허가사항을 먼저 확인해야 해요.\n\n1. 사용 가능한 대상과 용량은 국내 제품 설명서와 의료진·약사의 안내로 확인하세요.\n\n2. 약을 먹인 시간·성분·양을 기록하세요.\n\n피해주세요: 탈수가 의심되거나 구토·설사가 심하면 임의 투여하지 말고 의료진과 상담하세요. 다른 해열제와 임의로 교대하거나 용량을 늘리지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.",
    urgency: "caution",
    tags: ['해열제', '부루펜', '이부프로펜', '복용법'],
    applicableMonths: [6, 7, 8, 9, 10, 11, 12],
    emoji: '💊',

    care: {"summary":"이부프로펜은 아기의 나이·체중·탈수 여부와 제품 허가사항을 먼저 확인해야 해요.","steps":["사용 가능한 대상과 용량은 국내 제품 설명서와 의료진·약사의 안내로 확인하세요.","약을 먹인 시간·성분·양을 기록하세요."],"avoid":["탈수가 의심되거나 구토·설사가 심하면 임의 투여하지 말고 의료진과 상담하세요.","다른 해열제와 임의로 교대하거나 용량을 늘리지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요."},
    evidence: {"sources":[{"title":"식약처 · 의약품 안전사용 매뉴얼","url":"https://nedrug.mfds.go.kr/pbp/CCBFC03/getItem?tchmtrId=SU201911240002"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_10',
    category: 'fever',
    question: '해열제를 먹였는데 열이 안 내려가요. 어떻게 하나요?',
    answer: "해열제 후 체온이 정상으로 내려가지 않는다는 이유만으로 약을 더 먹이지 마세요.\n\n1. 아기의 호흡·반응·수유·소변 상태와 실제 투여한 성분·시간·양을 확인하세요.\n\n2. 약이 도움이 되지 않거나 열이 이어지면 의료진에게 상담하세요.\n\n피해주세요: 물수건 냉각이나 찬물 목욕으로 열을 내리려 하지 마세요. 정해진 간격을 줄이거나 다른 약을 임의로 추가하지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['해열제', '효과없음', '미온수', '교대투여'],
    applicableMonths: [],
    emoji: '😰',

    care: {"summary":"해열제 후 체온이 정상으로 내려가지 않는다는 이유만으로 약을 더 먹이지 마세요.","steps":["아기의 호흡·반응·수유·소변 상태와 실제 투여한 성분·시간·양을 확인하세요.","약이 도움이 되지 않거나 열이 이어지면 의료진에게 상담하세요."],"avoid":["물수건 냉각이나 찬물 목욕으로 열을 내리려 하지 마세요.","정해진 간격을 줄이거나 다른 약을 임의로 추가하지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"},{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  withCare({
    id: 'fever_11',
    category: 'fever',
    question: '열성 경련이란 무엇인가요? 어떻게 대처하나요?',
    urgency: 'emergency',
    tags: ['열성경련', '발작', '경련', '응급'],
    applicableMonths: [],
    emoji: '🚑',
  }, {
    summary: "열이 있는 아기가 처음 경련을 했다면 멈췄더라도 바로 119에 연락하세요.",
    steps: [
      "경련이 시작된 시각을 확인하고 주변 물건을 치워 다치지 않게 해요.",
      "경련이 멈추면 호흡을 확인해요. 숨을 쉬고 있다면 옆으로 돌려 눕히고 119 안내를 따라요.",
    ],
    avoid: ["팔다리를 억지로 잡거나 입에 손가락·물건·음식·약을 넣지 마세요."],
    seekHelp: "첫 경련, 5분 이상 지속되는 경련, 회복하지 못한 채 반복되는 경련이나 호흡곤란은 즉시 119에 연락할 상황이에요.",
  }, {
    checkedOn: "2026-11-13", scope: "열성 경련에서 즉시 도움받을 때와 응급처치",
    sources: [{"title":"NHS · 열성 경련","url":"https://www.nhs.uk/conditions/febrile-seizures/"}],
  }),
  {
    id: 'fever_12',
    category: 'fever',
    question: '예방접종 후 열이 나는데 정상인가요?',
    answer: "접종 후 열이 날 수 있지만, 아기의 나이와 상태를 함께 살펴야 해요.\n\n1. 접종한 백신과 날짜, 체온·측정 부위, 수유·소변·반응을 확인하세요.\n\n2. 열이 지속되거나 걱정되는 변화가 있으면 접종 의료기관에 상담하세요.\n\n피해주세요: 어린 영아의 발열을 접종 때문이라고 단정하며 진료를 미루지 마세요. 체온 숫자만 보고 해열제를 자동으로 먹이지 말고 의료진 안내를 확인하세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['예방접종', '발열', '부작용', '해열제'],
    applicableMonths: [],
    emoji: '💉',

    care: {"summary":"접종 후 열이 날 수 있지만, 아기의 나이와 상태를 함께 살펴야 해요.","steps":["접종한 백신과 날짜, 체온·측정 부위, 수유·소변·반응을 확인하세요.","열이 지속되거나 걱정되는 변화가 있으면 접종 의료기관에 상담하세요."],"avoid":["어린 영아의 발열을 접종 때문이라고 단정하며 진료를 미루지 마세요.","체온 숫자만 보고 해열제를 자동으로 먹이지 말고 의료진 안내를 확인하세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_13',
    category: 'fever',
    question: '열이 날 때 목욕을 시켜도 되나요?',
    answer: "열을 내리기 위한 목욕이나 물수건 닦기는 권하지 않아요.\n\n1. 아기가 편안하게 쉴 수 있게 하고 평소 수분 공급을 이어가세요.\n\n2. 너무 덥게 싸거나 반대로 춥게 벗기지 마세요.\n\n피해주세요: 찬물·얼음·알코올로 몸을 식히지 마세요. 불편해하는데 억지로 목욕시키지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['목욕', '발열', '미온수', '체온'],
    applicableMonths: [],
    emoji: '🛁',

    care: {"summary":"열을 내리기 위한 목욕이나 물수건 닦기는 권하지 않아요.","steps":["아기가 편안하게 쉴 수 있게 하고 평소 수분 공급을 이어가세요.","너무 덥게 싸거나 반대로 춥게 벗기지 마세요."],"avoid":["찬물·얼음·알코올로 몸을 식히지 마세요.","불편해하는데 억지로 목욕시키지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"},{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_14',
    category: 'fever',
    question: '열이 날 때 이불을 덮어서 땀을 내야 하나요?',
    answer: "두껍게 덮어 땀을 내게 하지 말고, 아기가 덥거나 춥지 않게 돌봐주세요.\n\n1. 과도한 옷과 두꺼운 침구를 피하세요.\n\n2. 잠잘 때는 단단하고 평평한 수면 면에 등을 대고 눕히고 느슨한 이불·베개를 치우세요.\n\n피해주세요: 해열 목적으로 일부러 땀을 내게 하거나 찬물로 식히지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['이불', '땀', '발열', '관리법'],
    applicableMonths: [],
    emoji: '🛏️',

    care: {"summary":"두껍게 덮어 땀을 내게 하지 말고, 아기가 덥거나 춥지 않게 돌봐주세요.","steps":["과도한 옷과 두꺼운 침구를 피하세요.","잠잘 때는 단단하고 평평한 수면 면에 등을 대고 눕히고 느슨한 이불·베개를 치우세요."],"avoid":["해열 목적으로 일부러 땀을 내게 하거나 찬물로 식히지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"},{"title":"NIH · 안전한 아기 수면 환경","url":"https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment"},{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_15',
    category: 'fever',
    question: '발열 시 병원에 꼭 가야 하는 경우는?',
    answer: "체온보다 먼저 확인할 위험 신호가 있어요.\n\n1. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.\n\n2. 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.\n\n3. 평소와 다르게 처지거나 잘 먹지 못하고 소변이 줄면 신속히 의료진과 상담하세요.\n\n피해주세요: 해열제 효과나 다음 날까지 기다리느라 도움 요청을 늦추지 마세요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "emergency",
    tags: ['병원', '응급', '발열', '진료'],
    applicableMonths: [],
    emoji: '🏥',

    care: {"summary":"체온보다 먼저 확인할 위험 신호가 있어요.","steps":["숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.","생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.","평소와 다르게 처지거나 잘 먹지 못하고 소변이 줄면 신속히 의료진과 상담하세요."],"avoid":["해열제 효과나 다음 날까지 기다리느라 도움 요청을 늦추지 마세요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"},{"title":"소방청 · 119 응급 안내·상담","url":"https://www.nfa.go.kr/nfa/news/pressrelease/explanation/?cntId=44&mode=view"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_16',
    category: 'fever',
    question: '해열제는 체온이 몇 도일 때 먹여야 하나요?',
    answer: "해열제 사용은 숫자 하나보다 아기의 불편감과 나이·상태를 함께 보고 정해요.\n\n1. 생후 3개월 미만의 발열은 우선 의료진에게 연락하세요.\n\n2. 더 큰 아기도 불편해하거나 힘들어하면 제품 설명서와 의료진·약사의 안내를 확인하세요.\n\n피해주세요: 체온을 정상 수치로 만들려고 반복 투여하지 마세요. 겨드랑이와 직장 체온을 고정된 차이로 바꿔 투여 기준을 정하지 마세요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['해열제', '투여시기', '체온', '기준'],
    applicableMonths: [],
    emoji: '🌡️',

    care: {"summary":"해열제 사용은 숫자 하나보다 아기의 불편감과 나이·상태를 함께 보고 정해요.","steps":["생후 3개월 미만의 발열은 우선 의료진에게 연락하세요.","더 큰 아기도 불편해하거나 힘들어하면 제품 설명서와 의료진·약사의 안내를 확인하세요."],"avoid":["체온을 정상 수치로 만들려고 반복 투여하지 마세요.","겨드랑이와 직장 체온을 고정된 차이로 바꿔 투여 기준을 정하지 마세요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"},{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"식약처 · 의약품 안전사용 매뉴얼","url":"https://nedrug.mfds.go.kr/pbp/CCBFC03/getItem?tchmtrId=SU201911240002"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'fever_17',
    category: 'fever',
    question: '해열제 두 종류를 교대로 먹여도 되나요?',
    answer: "두 종류의 해열제를 임의로 교대하지 마세요.\n\n1. 의료진이 교대를 지시했다면 약 성분·1회량·간격·하루 한도를 구체적으로 확인하세요.\n\n2. 먹인 시간과 양을 기록하고, 여러 양육자가 같은 기록을 확인하세요.\n\n피해주세요: 체온이 떨어지지 않는다고 다른 약을 추가하거나 간격을 줄이지 마세요.\n\n진료·도움: 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['교대투여', '해열제', '타이레놀', '부루펜'],
    applicableMonths: [],
    emoji: '💊',

    care: {"summary":"두 종류의 해열제를 임의로 교대하지 마세요.","steps":["의료진이 교대를 지시했다면 약 성분·1회량·간격·하루 한도를 구체적으로 확인하세요.","먹인 시간과 양을 기록하고, 여러 양육자가 같은 기록을 확인하세요."],"avoid":["체온이 떨어지지 않는다고 다른 약을 추가하거나 간격을 줄이지 마세요."],"seekHelp":"생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"},{"title":"식약처 · 의약품 안전사용 매뉴얼","url":"https://nedrug.mfds.go.kr/pbp/CCBFC03/getItem?tchmtrId=SU201911240002"},{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  withCare({
    id: 'fever_18',
    category: 'fever',
    question: '돌발진(장미진)이란 무엇인가요?',
    urgency: 'info',
    tags: ['돌발진', '장미진', '발진', '고열'],
    applicableMonths: [6, 7, 8, 9, 10, 11, 12],
    emoji: '🌹',
  }, {
    summary: "돌발진은 며칠간 열이 나다가 내려갈 무렵 몸통부터 발진이 나타날 수 있어요.",
    steps: ["수유와 젖은 기저귀, 발진이 시작된 시점, 아기 반응을 살펴요."],
    avoid: ["열이 내렸다는 이유로 모든 발진을 돌발진으로 단정하지 마세요."],
    seekHelp: "생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요. 눌러도 색이 옅어지지 않는 발진이나 호흡곤란, 반응 저하가 있으면 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 돌발진", url: "https://www.nhs.uk/conditions/roseola/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),

  // ============================================================
  // SKIN (피부) — 18 items
  // ============================================================
  withCare({
    id: 'skin_01',
    category: 'skin',
    question: '아기 아토피 피부염은 어떻게 관리하나요?',
    urgency: 'caution',
    tags: ['아토피', '보습', '피부염', '관리'],
    applicableMonths: [],
    emoji: '🧴',
  }, {
    summary: "건조하고 가려운 아토피 피부에는 무향 크림이나 연고형 보습제를 꾸준히 발라요.",
    steps: ["미지근한 물로 짧게 씻고, 가볍게 물기를 닦은 뒤 피부가 촉촉할 때 보습해요. 처방받은 바르는 약은 안내받은 부위와 방법을 따라 사용하세요."],
    avoid: ["향이 강한 제품이나 때를 미는 행동을 피하세요."],
    seekHelp: "진물·노란 딱지, 통증, 열이 생기거나 악화가 빠르면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 소아 아토피 피부염", url: "https://www.healthychildren.org/English/health-issues/conditions/skin/Pages/How-to-Treat-and-Control-Eczema-Rashes-in-Children.aspx" },
    ],
  }),
  withCare({
    id: 'skin_02',
    category: 'skin',
    question: '기저귀 발진이 심한데 어떻게 치료하나요?',
    urgency: 'caution',
    tags: ['기저귀', '발진', '엉덩이', '연고'],
    applicableMonths: [],
    emoji: '🍑',
  }, {
    summary: "기저귀가 젖거나 더러워지면 바로 갈고, 피부를 부드럽게 씻어 말려요.",
    steps: ["물이나 향료·알코올이 없는 물티슈로 닦고, 산화아연 등 보호용 크림을 바를 수 있어요."],
    avoid: ["피부를 세게 닦거나 파우더를 뿌리지 마세요."],
    seekHelp: "발진이 더 넓어지거나 가라앉지 않고, 물집·진물·발열이 있으면 소아청소년과에 상담하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 기저귀 발진", url: "https://www.nhs.uk/baby/caring-for-a-newborn/nappy-rash/" },
    ],
  }),
  withCare({
    id: 'skin_03',
    category: 'skin',
    question: '태열(신생아 홍반)은 무엇인가요?',
    urgency: 'info',
    tags: ['태열', '신생아', '홍반', '발진'],
    applicableMonths: [0, 1],
    emoji: '👶',
  }, {
    summary: "태열은 여러 아기 발진을 가리키는 표현이에요. 신생아에게는 며칠 뒤 저절로 사라지는 붉은 발진도 흔해요.",
    steps: ["발진이 언제 어디서 시작했는지와 체온·수유·반응을 함께 살펴요."],
    avoid: ["이름이나 사진만으로 원인을 단정하거나 남은 연고를 바르지 마세요."],
    seekHelp: "신생아에게 물집이 생기거나 아파 보이면 신속히 진료받으세요. 생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 신생아의 피부와 신체 변화", url: "https://www.healthychildren.org/English/ages-stages/baby/Pages/How-Your-Newborn-Looks.aspx" },
      { title: "NHS · 영유아 피부 발진", url: "https://www.nhs.uk/symptoms/rashes-babies-and-children/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'skin_04',
    category: 'skin',
    question: '영아 여드름은 왜 생기나요? 치료가 필요한가요?',
    urgency: 'info',
    tags: ['여드름', '신생아', '뾰루지', '호르몬'],
    applicableMonths: [0, 1, 2, 3],
    emoji: '😊',
  }, {
    summary: "생후 몇 주에 얼굴에 작은 뾰루지가 나타날 수 있고, 신생아 여드름은 흔히 저절로 좋아져요.",
    steps: ["미지근한 물로 부드럽게 씻고 악화하는지 살펴요."],
    avoid: ["짜거나 문지르지 말고 성인용 여드름 약을 쓰지 마세요."],
    seekHelp: "생후 6주 이후에 처음 생겼거나 깊은 멍울·흉터가 보이면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "미국피부과학회 · 신생아·영아 여드름", url: "https://www.aad.org/public/diseases/acne/really-acne/baby-acne" },
    ],
  }),
  withCare({
    id: 'skin_05',
    category: 'skin',
    question: '땀띠가 났어요. 어떻게 관리하나요?',
    urgency: 'info',
    tags: ['땀띠', '발진', '더위', '관리'],
    applicableMonths: [],
    emoji: '💦',
  }, {
    summary: "땀띠가 의심되면 시원한 곳에서 땀이 마르도록 도와줘요.",
    steps: ["가볍고 헐렁한 옷을 입히고, 피부에 닿는 침구와 옷을 가볍게 해요."],
    avoid: ["파우더를 뿌리거나 두껍게 덮어 땀을 더 내지 마세요."],
    seekHelp: "발진이 악화하거나 아기가 아파 보이면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 영유아 피부 발진", url: "https://www.nhs.uk/symptoms/rashes-babies-and-children/" },
    ],
  }),
  withCare({
    id: 'skin_06',
    category: 'skin',
    question: '아기에게 습진이 생겼어요. 아토피와 다른 건가요?',
    urgency: 'caution',
    tags: ['습진', '아토피', '보습', '건조'],
    applicableMonths: [],
    emoji: '🩹',
  }, {
    summary: "습진은 피부의 염증을 가리키고, 아토피 피부염은 가렵고 반복되기 쉬운 습진의 한 형태예요.",
    steps: ["건조한 부위는 무향 보습제로 관리하고, 언제 가렵고 악화되는지 관찰해요."],
    avoid: ["피부 모양만 보고 음식 알레르기로 단정하거나 식단을 임의로 제한하지 마세요."],
    seekHelp: "가려움이 수면을 방해하거나 진물·딱지가 생기면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 소아 아토피 피부염", url: "https://www.healthychildren.org/English/health-issues/conditions/skin/Pages/How-to-Treat-and-Control-Eczema-Rashes-in-Children.aspx" },
    ],
  }),
  {
    id: 'skin_07',
    category: 'skin',
    question: '두드러기가 갑자기 올라왔어요. 어떻게 하나요?',
    answer: "두드러기와 함께 입술·혀가 갑자기 붓거나 숨쉬기 힘들면 바로 119에 연락하세요.\n\n1. 발진만 있고 잘 숨 쉬며 평소처럼 반응한다면 언제 시작했는지와 직전에 먹은 음식이나 약을 기록하세요.\n\n2. 발진이 넓어지거나 반복되고 아기 상태가 걱정되면 소아청소년과에 상담하세요.\n\n피해주세요: 응급 징후가 있을 때 발진이 가라앉기를 기다리지 마세요.\n\n진료·도움: 입술·혀·목이 붓거나, 숨쉬기 어렵거나, 아기가 축 늘어지거나 반응이 떨어지면 119에 도움을 요청하세요.",
    urgency: 'caution',
    tags: ['두드러기', '알레르기', '가려움', '발진'],
    applicableMonths: [],
    emoji: '🔴',
    care: {"summary":"두드러기와 함께 입술·혀가 갑자기 붓거나 숨쉬기 힘들면 바로 119에 연락하세요.","steps":["발진만 있고 잘 숨 쉬며 평소처럼 반응한다면 언제 시작했는지와 직전에 먹은 음식이나 약을 기록하세요.","발진이 넓어지거나 반복되고 아기 상태가 걱정되면 소아청소년과에 상담하세요."],"avoid":["응급 징후가 있을 때 발진이 가라앉기를 기다리지 마세요."],"seekHelp":"입술·혀·목이 붓거나, 숨쉬기 어렵거나, 아기가 축 늘어지거나 반응이 떨어지면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 두드러기","url":"https://www.nhs.uk/conditions/hives/"},{"title":"NHS · 아나필락시스","url":"https://www.nhs.uk/conditions/anaphylaxis/"}],"checkedOn":"2026-11-13","scope":"두드러기와 중증 알레르기 반응"},
  },
  withCare({
    id: 'skin_08',
    category: 'skin',
    question: '아기 보습제는 어떤 것을 선택해야 하나요?',
    urgency: 'info',
    tags: ['보습제', '선택', '성분', '바르기'],
    applicableMonths: [],
    emoji: '🧴',
  }, {
    summary: "향이 없는 크림이나 연고형 보습제를 고르고, 물기를 가볍게 닦은 피부에 발라요.",
    steps: ["바른 뒤 자극이 생기면 사용을 중단하고 사용한 제품을 기록해요."],
    avoid: ["특정 성분이 반드시 들어가야 한다고 여기거나 향이 강한 제품을 고르지 마세요."],
    seekHelp: "보습을 해도 반복해서 갈라지거나 가려움이 심하면 소아청소년과에 상담하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 소아 아토피 피부염", url: "https://www.healthychildren.org/English/health-issues/conditions/skin/Pages/How-to-Treat-and-Control-Eczema-Rashes-in-Children.aspx" },
    ],
  }),
  {
    id: 'skin_09',
    category: 'skin',
    question: '지루성 피부염(유아지루)은 어떻게 치료하나요?',
    answer: "아기 두피에 노랗고 기름진 비늘이 생기는 경우가 있어요. 대개 시간이 지나면서 좋아져요.\n\n1. 아기용 순한 샴푸로 부드럽게 씻어 주세요.\n\n2. 비늘을 부드럽게 관리할 방법이 필요하면 아기에게 사용할 수 있는 보습제를 약사나 의료진에게 확인하세요.\n\n피해주세요: 딱지를 긁어 떼거나 올리브오일·성인용 비듬 샴푸를 사용하지 마세요.\n\n진료·도움: 진물이 나거나 붓거나, 넓게 퍼지거나 몇 주가 지나도 나아지지 않으면 소아청소년과에 상담하세요.",
    urgency: 'info',
    tags: ['지루성', '피부염', '두피', '딱지'],
    applicableMonths: [0, 1, 2, 3, 4],
    emoji: '👶',
    care: {"summary":"아기 두피에 노랗고 기름진 비늘이 생기는 경우가 있어요. 대개 시간이 지나면서 좋아져요.","steps":["아기용 순한 샴푸로 부드럽게 씻어 주세요.","비늘을 부드럽게 관리할 방법이 필요하면 아기에게 사용할 수 있는 보습제를 약사나 의료진에게 확인하세요."],"avoid":["딱지를 긁어 떼거나 올리브오일·성인용 비듬 샴푸를 사용하지 마세요."],"seekHelp":"진물이 나거나 붓거나, 넓게 퍼지거나 몇 주가 지나도 나아지지 않으면 소아청소년과에 상담하세요."},
    evidence: {"sources":[{"title":"NHS · 아기 두피 지루성 피부염","url":"https://www.nhs.uk/conditions/cradle-cap/"}],"checkedOn":"2026-11-13","scope":"영아 두피 지루성 피부염 관리"},
  },
  withCare({
    id: 'skin_10',
    category: 'skin',
    question: '몽고반점은 저절로 없어지나요?',
    urgency: 'info',
    tags: ['몽고반점', '반점', '청색', '멜라닌'],
    applicableMonths: [0, 1, 2, 3],
    emoji: '🔵',
  }, {
    summary: "태어날 때부터 보이는 청회색 반점은 자라면서 옅어질 수 있어요.",
    steps: ["첫 검진에서 위치와 모양을 기록해 두면 나중에 새로 생긴 멍과 구분하는 데 도움이 돼요."],
    avoid: ["나중에 갑자기 생긴 반점을 기존 출생 반점이라고 여기지 마세요."],
    seekHelp: "새로 생긴 멍이나 빠르게 변하는 반점은 진료를 받아 확인하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 출생 반점", url: "https://www.nhs.uk/conditions/birthmarks/" },
    ],
  }),
  withCare({
    id: 'skin_11',
    category: 'skin',
    question: '아기 목이나 겨드랑이에 짓무름이 있어요.',
    urgency: 'caution',
    tags: ['짓무름', '접힘', '목', '겨드랑이'],
    applicableMonths: [],
    emoji: '😫',
  }, {
    summary: "목이나 겨드랑이처럼 접히는 피부에는 침과 땀, 마찰로 발진이 생길 수 있어요.",
    steps: ["부드럽게 씻고 문지르지 않으며, 물기를 톡톡 눌러 닦고 젖은 옷을 갈아줘요."],
    avoid: ["남은 항진균제나 스테로이드 연고를 임의로 바르지 마세요."],
    seekHelp: "빨갛게 퍼지거나 통증·냄새·진물·발열이 생기면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "DermNet · 피부 접히는 부위의 발진", url: "https://dermnetnz.org/topics/intertrigo" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'skin_12',
    category: 'skin',
    question: '구강 칸디다증(아구창)은 어떻게 치료하나요?',
    urgency: 'caution',
    tags: ['아구창', '칸디다', '구강', '곰팡이'],
    applicableMonths: [0, 1, 2, 3, 4, 5],
    emoji: '👄',
  }, {
    summary: "입 안쪽에 닦이지 않는 흰 반점이 여러 곳에 보이거나 먹기 힘들어하면 아구창 여부를 확인받아요.",
    steps: ["젖병과 젖꼭지는 사용 뒤 씻고, 모유 수유 중 보호자의 유두 통증도 진료 시 함께 알려요."],
    avoid: ["흰 막을 억지로 긁어내거나 항진균제를 임의로 바르지 마세요."],
    seekHelp: "평소보다 잘 못 먹거나 젖은 기저귀가 크게 줄면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 구강 칸디다증", url: "https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/breastfeeding/breastfeeding-challenges/thrush/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'skin_13',
    category: 'skin',
    question: '아기 피부에 물집이 생겼어요. 수족구병인가요?',
    urgency: 'caution',
    tags: ['수족구', '물집', '바이러스', '발진'],
    applicableMonths: [6, 7, 8, 9, 10, 11, 12],
    emoji: '🖐️',
  }, {
    summary: "손·발·입 주변이나 입 안에 물집이 생기면 수족구병일 수 있어요.",
    steps: ["입 안이 아파도 수유할 수 있으면 평소의 모유나 영아용 분유를 계속 주고, 젖은 기저귀가 줄지 않는지 확인해요."],
    avoid: ["물집을 터뜨리거나 사진만으로 병명을 단정하지 마세요."],
    seekHelp: "먹기 힘들어하거나 소변이 줄면 신속히 진료받으세요. 생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 수족구병", url: "https://www.nhs.uk/conditions/hand-foot-mouth-disease/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'skin_14',
    category: 'skin',
    question: '아기 얼굴에 흰색 좁쌀 같은 게 있어요.',
    urgency: 'info',
    tags: ['비립종', '밀리아', '좁쌀', '하얀'],
    applicableMonths: [0, 1, 2],
    emoji: '⚪',
  }, {
    summary: "신생아의 코·볼에 보이는 작고 하얀 돌기는 비립종일 수 있고, 보통 시간이 지나며 사라져요.",
    steps: ["일상적으로 부드럽게 씻기면서 붉어지거나 커지는지 관찰해요."],
    avoid: ["짜거나 벗겨내고 여드름 약을 바르지 마세요."],
    seekHelp: "주변이 붓고 빨개지거나 진물이 나는 등 모습이 달라지면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 영유아 피부 발진", url: "https://www.nhs.uk/symptoms/rashes-babies-and-children/" },
      { title: "AAP · 신생아의 피부와 신체 변화", url: "https://www.healthychildren.org/English/ages-stages/baby/Pages/How-Your-Newborn-Looks.aspx" },
    ],
  }),
  withCare({
    id: 'skin_15',
    category: 'skin',
    question: '아기 목욕은 얼마나 자주 시켜야 하나요?',
    urgency: 'info',
    tags: ['목욕', '빈도', '세정제', '보습'],
    applicableMonths: [],
    emoji: '🛁',
  }, {
    summary: "아기는 매일 전신 목욕을 할 필요는 없고, 얼굴·목·기저귀 부위는 더러워질 때 부드럽게 닦아요.",
    steps: ["물을 먼저 준비해 팔꿈치로 너무 뜨겁지 않은지 확인하고, 머리와 목을 받쳐요."],
    avoid: ["잠깐이라도 아기를 물에 혼자 두지 마세요."],
    seekHelp: "목욕 후 피부가 반복해서 갈라지거나 발진이 악화하면 상담하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 씻기와 목욕", url: "https://www.nhs.uk/baby/caring-for-a-newborn/washing-and-bathing-your-baby/" },
    ],
  }),
  withCare({
    id: 'skin_16',
    category: 'skin',
    question: '아기 손톱, 발톱은 어떻게 깎아야 하나요?',
    urgency: 'info',
    tags: ['손톱', '발톱', '깎기', '관리'],
    applicableMonths: [],
    emoji: '✂️',
  }, {
    summary: "아기가 차분할 때 영아용 손톱깎이, 끝이 둥근 가위 또는 줄을 사용해요.",
    steps: ["손가락을 잡고 손톱 아래 살을 살짝 눌러 살과 손톱을 구분한 뒤 조금씩 정리해요."],
    avoid: ["손톱을 이로 물어 뜯거나 너무 바짝 자르지 마세요."],
    seekHelp: "다친 곳에서 피가 멈추지 않거나 붓고 빨개지면 의료진에게 상담하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 씻기와 목욕", url: "https://www.nhs.uk/baby/caring-for-a-newborn/washing-and-bathing-your-baby/" },
    ],
  }),
  withCare({
    id: 'skin_17',
    category: 'skin',
    question: '아기 피부에 혈관종이 있다고 하는데 괜찮은가요?',
    urgency: 'caution',
    tags: ['혈관종', '반점', '빨간', '종양'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '🔴',
  }, {
    summary: "영아 혈관종은 자라면서 옅어지는 경우가 많지만, 위치와 크기에 따라 일찍 진료받아야 해요.",
    steps: ["눈·코·입 주변, 빠르게 커지는 부위, 피부 혈관종이 5개 이상이라면 빠르게 소아청소년과에 상담하세요."],
    avoid: ["눈을 가리거나 수유를 방해하는 혈관종을 저절로 가라앉을 때까지 기다리지 마세요."],
    seekHelp: "상처가 나거나 피가 나면 진료받으세요. 숨쉬기 어려우면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 영아 혈관종 임상 지침", url: "https://doi.org/10.1542/peds.2018-3475" },
    ],
  }),
  withCare({
    id: 'skin_18',
    category: 'skin',
    question: '자외선 차단제는 아기에게 언제부터 바를 수 있나요?',
    urgency: 'info',
    tags: ['자외선', '차단제', '썬크림', '외출'],
    applicableMonths: [6, 7, 8, 9, 10, 11, 12],
    emoji: '☀️',
  }, {
    summary: "생후 6개월 미만 아기는 그늘과 피부를 가리는 옷·모자로 직사광선을 피하는 것이 우선이에요.",
    steps: ["6개월 이후에는 옷으로 가려지지 않는 피부에 광범위 차단제를 제품 안내대로 바르고, 물에 젖거나 땀을 흘린 뒤에는 안내에 따라 덧발라요."],
    avoid: ["차단제만 바르고 햇볕에 오래 머무르지 마세요."],
    seekHelp: "어린 아기가 햇볕에 심하게 타거나 물집이 생겼다면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 자외선 차단과 햇볕 화상", url: "https://www.healthychildren.org/English/safety-prevention/at-play/Pages/Sun-Safety.aspx" },
    ],
  }),

  // ============================================================
  // DIGESTION (소화) — 18 items
  // ============================================================
  withCare({
    id: 'digestion_01',
    category: 'digestion',
    question: '아기 변비는 며칠 동안 변을 안 보면 의심해야 하나요?',
    urgency: 'info',
    tags: ['변비', '배변', '모유', '분유'],
    applicableMonths: [],
    emoji: '💩',
  }, {
    summary: "배변 간격은 아기마다 달라요. 변이 딱딱하고 배변이 아픈지가 더 중요한 단서예요.",
    steps: ["신생아가 평소보다 변을 덜 보고 잘 못 먹는다면 수유와 젖은 기저귀 상태도 알려주세요."],
    avoid: ["며칠이라는 기준만으로 판단하거나 어린 아기에게 임의로 관장·변비약을 쓰지 마세요."],
    seekHelp: "배가 많이 붓거나 반복 구토, 혈변, 수유 감소가 있으면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 아기의 변비 판단", url: "https://www.healthychildren.org/English/ages-stages/baby/diapers-clothing/Pages/Infant-Constipation.aspx" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'digestion_02',
    category: 'digestion',
    question: '아기 변비에 좋은 마사지 방법이 있나요?',
    urgency: 'info',
    tags: ['변비', '마사지', '자전거', '배'],
    applicableMonths: [],
    emoji: '👐',
  }, {
    summary: "아기가 편안할 때 등을 대고 눕힌 뒤 두 다리를 자전거 타듯 부드럽게 움직여 볼 수 있어요.",
    steps: ["싫어하거나 더 울면 멈춰요. 딱딱한 변과 불편함이 이어지면 진료 시 배변 양상을 알려주세요."],
    avoid: ["배를 세게 누르거나 정해진 마사지로 진료를 미루지 마세요."],
    seekHelp: "배가 심하게 붓거나 구토·혈변이 있으면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 영아 변비와 부드러운 다리 운동", url: "https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-challenges/constipation-and-bottle-feeding/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'digestion_03',
    category: 'digestion',
    question: '아기 설사는 어떤 변이 설사인가요?',
    urgency: 'caution',
    tags: ['설사', '변', '횟수', '묽은'],
    applicableMonths: [],
    emoji: '💧',
  }, {
    summary: "아기 변이 평소보다 갑자기 물처럼 묽어지고 횟수도 늘면 설사일 수 있어요.",
    steps: ["수유량, 젖은 기저귀, 구토·열 여부를 함께 확인해요."],
    avoid: ["정해진 배수나 냄새만으로 설사나 감염을 판단하지 마세요."],
    seekHelp: "혈변, 반복 구토, 젖은 기저귀 감소 또는 어린 영아의 반복되는 물설사는 신속히 진료받으세요. 생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "시애틀 어린이병원 · 생후 0~12개월 설사", url: "https://www.seattlechildrens.org/conditions/a-z/diarrhea-0-12-months/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'digestion_04',
    category: 'digestion',
    question: '아기가 설사할 때 먹이는 건 어떻게 하나요?',
    urgency: 'caution',
    tags: ['설사', '수유', '경구수액', '탈수'],
    applicableMonths: [],
    emoji: '🍼',
  }, {
    summary: "수유할 수 있다면 모유나 정상 농도의 영아용 분유를 계속 제공해요.",
    steps: ["수분 보충액이 필요한지, 어떻게 먹일지는 아기의 나이와 상태를 의료진에게 알려 확인하세요. 이미 이유식을 먹고 있다면 받아들일 수 있는 평소 음식을 먹일 수 있어요."],
    avoid: ["분유를 묽게 타거나 주스·스포츠음료·지사제로 대신하지 마세요."],
    seekHelp: "계속 토해 먹지 못하거나 소변이 줄고 처지거나, 변에 피가 있으면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "시애틀 어린이병원 · 생후 0~12개월 설사", url: "https://www.seattlechildrens.org/conditions/a-z/diarrhea-0-12-months/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'digestion_05',
    category: 'digestion',
    question: '아기가 수유 후 자주 토해요. 정상인가요?',
    urgency: 'info',
    tags: ['구토', '토유', '역류', '수유'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '🤮',
  }, {
    summary: "아기가 잘 먹고 자라는 중이라면 수유 뒤 소량을 게우는 일은 흔해요.",
    steps: ["깨어 있을 때 수유 중간에 쉬게 하고, 수유 뒤 편안하게 세워 안아볼 수 있어요. 잠들 때는 등을 대고 단단하고 평평한 잠자리에 눕혀요."],
    avoid: ["잠자리의 머리 쪽을 높이거나 수유량·분유를 임의로 바꾸지 마세요."],
    seekHelp: "반복되는 분수토, 초록색·피 섞인 구토, 수유 거부 또는 체중 증가가 걱정되면 바로 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 영아 역류", url: "https://www.nhs.uk/conditions/reflux-in-babies/" },
      { title: "NIH · 안전한 아기 잠자리", url: "https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment" },
    ],
  }),
  {
    id: 'digestion_06',
    category: 'digestion',
    question: '분수토(프로젝타일 구토)는 위험한가요?',
    answer: "아기가 반복해서 세게 토하면 신속히 진료를 받으세요.\n\n1. 어린 영아에서 수유 후 힘차게 토하는 일이 반복되면 비후성 유문협착증 등 원인을 평가해야 해요.\n\n2. 토한 횟수와 색, 수유 가능 여부, 젖은 기저귀가 줄었는지 기록하세요.\n\n피해주세요: 토한 뒤 다시 배고파 보이더라도 반복되는 분수토를 단순 게워냄으로 넘기지 마세요.\n\n진료·도움: 녹색 또는 피 섞인 구토, 먹지 못함, 소변 감소, 처짐이 있으면 지체하지 말고 의료 도움을 받으세요.",
    urgency: 'emergency',
    tags: ['분수토', '구토', '비후성 유문협착증', '수술'],
    applicableMonths: [0, 1, 2],
    emoji: '🚨',
    care: {"summary":"아기가 반복해서 세게 토하면 신속히 진료를 받으세요.","steps":["어린 영아에서 수유 후 힘차게 토하는 일이 반복되면 비후성 유문협착증 등 원인을 평가해야 해요.","토한 횟수와 색, 수유 가능 여부, 젖은 기저귀가 줄었는지 기록하세요."],"avoid":["토한 뒤 다시 배고파 보이더라도 반복되는 분수토를 단순 게워냄으로 넘기지 마세요."],"seekHelp":"녹색 또는 피 섞인 구토, 먹지 못함, 소변 감소, 처짐이 있으면 지체하지 말고 의료 도움을 받으세요."},
    evidence: {"sources":[{"title":"AAP · 비후성 유문협착증","url":"https://www.healthychildren.org/English/health-issues/conditions/abdominal/Pages/Hypertrophic-Pyloric-Stenosis-HPS-Babies-Forceful-Vomiting.aspx"},{"title":"NHS · 영유아 응급 징후","url":"https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/"}],"checkedOn":"2026-11-13","scope":"반복되는 분수토와 진료 징후"},
  },
  withCare({
    id: 'digestion_07',
    category: 'digestion',
    question: '영아 산통(배앓이)은 무엇이고 어떻게 대처하나요?',
    urgency: 'caution',
    tags: ['산통', '배앓이', '울음', '영아'],
    applicableMonths: [0, 1, 2, 3],
    emoji: '😭',
  }, {
    summary: "아기가 겉으로 건강해도 달래기 어려운 울음이 반복될 수 있어요. 새로운 울음 양상은 다른 원인이 있는지 살펴요.",
    steps: ["안아 달래거나 조용한 환경을 만들어봐요. 보호자가 너무 힘들면 아기를 안전한 잠자리에 눕히고 잠시 도움을 요청해요."],
    avoid: ["아기를 세게 흔들거나 산통용 보충제·약을 임의로 먹이지 마세요."],
    seekHelp: "울음이 평소와 다르고 축 처지거나, 열·구토·혈변이 있으면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 영아 산통", url: "https://www.nhs.uk/conditions/colic/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'digestion_08',
    category: 'digestion',
    question: '아기 변에 피가 섞여 나왔어요. 어떻게 해야 하나요?',
    urgency: 'emergency',
    tags: ['혈변', '피', '장중첩증', '응급'],
    applicableMonths: [],
    emoji: '🩸',
  }, {
    summary: "아기 변에 피가 보이면 양이 적어도 소아청소년과에 연락해 진료 시점을 확인하세요.",
    steps: [
      "변의 색과 양, 젖은 기저귀 수, 수유·구토·발열 여부를 함께 확인해요.",
      "진료를 미루지 않는 선에서 기저귀 사진을 남겨 의료진에게 보여주세요.",
    ],
    avoid: ["집에서 원인을 단정하거나 특징적인 딸기잼 같은 혈변이 나타날 때까지 기다리지 마세요."],
    seekHelp: "피가 많거나, 심하게 울다가 창백해지거나, 구토와 함께 축 처지면 즉시 응급실로 가세요. 깨워도 반응이 떨어지거나 숨쉬기 어렵다면 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "영아 혈변과 함께 확인할 진료 신호",
    sources: [{"title":"AAP · 변에 피가 보일 때","url":"https://www.healthychildren.org/English/tips-tools/symptom-checker/Pages/symptomviewer.aspx?symptom=Stools+-+Blood+In"},{"title":"RCH · 장중첩증 임상 지침","url":"https://www.rch.org.au/clinicalguide/guideline_index/intussusception/"}],
  }),
  withCare({
    id: 'digestion_09',
    category: 'digestion',
    question: '아기가 가스가 많고 방귀를 자주 뀌어요.',
    urgency: 'info',
    tags: ['가스', '방귀', '트림', '배'],
    applicableMonths: [0, 1, 2, 3, 4, 5],
    emoji: '💨',
  }, {
    summary: "방귀 자체는 흔해요. 가스 때문에 불편해하면 수유 중 잠시 쉬고 트림을 도와볼 수 있어요.",
    steps: ["아기가 깨어 있고 편안할 때 다리를 부드럽게 움직여요."],
    avoid: ["방귀만 보고 저유당 분유나 특수 분유로 임의 변경하지 마세요."],
    seekHelp: "배가 단단하게 붓고 잘 먹지 못하거나, 구토나 발열이 함께 있으면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 트림 돕기", url: "https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/how-to-burp-your-baby/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'digestion_10',
    category: 'digestion',
    question: '아기 변 색깔이 초록색이에요. 괜찮은가요?',
    urgency: 'info',
    tags: ['변', '초록색', '녹변', '색깔'],
    applicableMonths: [],
    emoji: '🟢',
  }, {
    summary: "초록색 변은 건강한 아기에게도 흔히 보일 수 있어요.",
    steps: ["변 색과 함께 묽기, 평소와 다른 횟수, 아기의 수유와 반응을 확인해요."],
    avoid: ["색만 보고 분유나 모유 수유 방식을 바꾸지 마세요."],
    seekHelp: "붉은 피, 회백색 변, 물 같은 변이 반복되거나 소변이 줄면 진료 시점을 문의하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 아기 변 색깔", url: "https://www.healthychildren.org/English/ages-stages/baby/pages/The-Many-Colors-of-Poop.aspx" },
      { title: "시애틀 어린이병원 · 생후 0~12개월 설사", url: "https://www.seattlechildrens.org/conditions/a-z/diarrhea-0-12-months/" },
    ],
  }),
  withCare({
    id: 'digestion_11',
    category: 'digestion',
    question: '흰색(백색) 변이 나왔는데 괜찮은가요?',
    urgency: 'emergency',
    tags: ['흰변', '백색변', '담도', '폐쇄증'],
    applicableMonths: [0, 1, 2, 3],
    emoji: '⚪',
  }, {
    summary: "하얗거나 회백색, 점토색으로 보이는 변은 한 번이라도 바로 소아청소년과에 연락하세요.",
    steps: [
      "변 사진을 남기고 눈 흰자나 피부가 노래졌는지, 소변 색이 진해졌는지 의료진에게 알려주세요.",
      "옅은 변은 담즙이 장으로 잘 흐르지 않을 때 나타날 수 있어 빠른 평가가 중요해요.",
    ],
    avoid: ["변이 다시 나올 때까지 기다리거나 앱 사진만으로 판단하지 마세요."],
    seekHelp: "하얗거나 회백색 변이 의심되면 황달이 눈에 띄지 않아도 지체하지 말고 진료를 받아요.",
  }, {
    checkedOn: "2026-11-13", scope: "옅은 대변과 담도 폐쇄 조기 평가",
    sources: [{"title":"AAP · 아기 담도 폐쇄와 옅은 변","url":"https://www.healthychildren.org/English/health-issues/conditions/abdominal/Pages/Biliary-Atresia.aspx"}],
  }),
  withCare({
    id: 'digestion_12',
    category: 'digestion',
    question: '이유식 시작 후 변이 크게 달라졌어요.',
    urgency: 'info',
    tags: ['이유식', '변', '색깔', '변비'],
    applicableMonths: [5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '🥣',
  }, {
    summary: "이유식을 시작하면 먹은 음식에 따라 변 색과 질감이 달라질 수 있어요.",
    steps: ["최근에 먹인 음식과 변 색, 아기가 잘 먹고 평소처럼 반응하는지 살펴요.", "변이 단단해 배변할 때 아파하거나 물 같은 변이 반복되면 소아청소년과에 상담하세요."],
    avoid: ["피로 보이는 붉은 변이나 하얀 변을 음식 탓으로 단정하지 마세요."],
    seekHelp: "변에 피가 보이거나 하얗고 회백색인 변이 나오면 바로 의료진에게 연락해 진료 시점을 확인하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "이유식 이후 변 색과 진료가 필요한 변화",
    sources: [{ title: "AAP · 아기 변 색깔", url: "https://www.healthychildren.org/English/ages-stages/baby/pages/The-Many-Colors-of-Poop.aspx" }],
  }),
  withCare({
    id: 'digestion_13',
    category: 'digestion',
    question: '장중첩증이 의심되는 증상은 무엇인가요?',
    urgency: 'emergency',
    tags: ['장중첩증', '응급', '혈변', '울음'],
    applicableMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '🚑',
  }, {
    summary: "아기가 갑자기 심하게 울다가 잠잠해지는 일이 반복되고, 창백함·구토·처짐이 동반되면 응급실로 가세요.",
    steps: [
      "통증처럼 보이는 울음이 시작된 시각과 반복 양상, 구토·변 색을 의료진에게 알려주세요.",
      "울음 사이에 잠시 괜찮아 보여도 장중첩증이 의심되면 신속히 평가받아야 해요.",
    ],
    avoid: ["혈변이나 정해진 간격의 울음이 나타날 때까지 기다리지 마세요. 혈변은 늦게 나타나거나 없을 수 있어요."],
    seekHelp: "증상이 의심되면 즉시 응급실로 가세요. 깨워도 반응이 없거나 숨쉬기 어려우면 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "장중첩증에서 조기에 살펴야 할 증상",
    sources: [{"title":"RCH · 장중첩증 임상 지침","url":"https://www.rch.org.au/clinicalguide/guideline_index/intussusception/"}],
  }),
  withCare({
    id: 'digestion_14',
    category: 'digestion',
    question: '아기 트림을 잘 시키는 방법이 있나요?',
    urgency: 'info',
    tags: ['트림', '수유', '방법', '가스'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '👶',
  }, {
    summary: "수유 중이나 뒤에 아기가 불편해 보이면 잠시 멈추고 트림을 도와요.",
    steps: ["목과 머리를 받쳐 어깨에 기대거나 무릎에 앉혀 상체를 살짝 앞으로 하고 등을 부드럽게 쓸어요. 목을 누르지 않아요."],
    avoid: ["트림이 꼭 나와야 한다고 생각해 세게 두드리지 마세요. 재울 때는 등을 대고 눕혀요."],
    seekHelp: "수유 중 자주 숨이 차거나 구토·수유 곤란이 반복되면 상담하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 트림 돕기", url: "https://www.nhs.uk/best-start-in-life/baby/feeding-your-baby/bottle-feeding/bottle-feeding-your-baby/how-to-burp-your-baby/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  {
    id: 'digestion_15',
    category: 'digestion',
    question: '아기가 우유(분유) 알레르기가 있는 것 같아요.',
    answer: "우유 단백 알레르기는 증상만으로 단정하거나 분유 이름만 보고 치료 제품을 고르지 않아요.\n\n1. 반복되는 증상과 먹은 음식·제품을 기록해 소아과에서 평가받으세요.\n\n2. 필요한 분유 종류는 의료진이 정합니다. 부분 가수분해 제품과 치료용 고도 가수분해·아미노산 제품은 같지 않아요.\n\n피해주세요: HA 등 제품명만으로 분해 정도나 알레르기 치료 적합성을 판단하지 마세요. 모유 수유자의 식단이나 아기의 분유를 임의로 제한·변경하지 마세요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['우유', '알레르기', '분유', '단백질'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '🥛',

    care: {"summary":"우유 단백 알레르기는 증상만으로 단정하거나 분유 이름만 보고 치료 제품을 고르지 않아요.","steps":["반복되는 증상과 먹은 음식·제품을 기록해 소아과에서 평가받으세요.","필요한 분유 종류는 의료진이 정합니다. 부분 가수분해 제품과 치료용 고도 가수분해·아미노산 제품은 같지 않아요."],"avoid":["HA 등 제품명만으로 분해 정도나 알레르기 치료 적합성을 판단하지 마세요.","모유 수유자의 식단이나 아기의 분유를 임의로 제한·변경하지 마세요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 분유 종류와 우유 단백 알레르기","url":"https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/bottle-feeding/types-of-formula/"},{"title":"소방청 · 119 응급 안내·상담","url":"https://www.nfa.go.kr/nfa/news/pressrelease/explanation/?cntId=44&mode=view"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  {
    id: 'digestion_16',
    category: 'digestion',
    question: '위식도 역류(GERD)와 단순 토유는 어떻게 구분하나요?',
    answer: "게워냄과 역류질환은 아기의 불편감·수유·성장 상태를 함께 평가해야 해요.\n\n1. 수유를 힘들어하거나 통증이 의심되고 성장이 걱정되면 소아과에서 평가받으세요.\n\n2. 수유 뒤 깨어 있는 아기를 보호자가 안아 돌보는 것과 잠자리에 눕히는 것은 구분하세요.\n\n3. 잠잘 때는 등을 대고 단단하고 평평한 수면 면에 눕히세요.\n\n피해주세요: 역류를 막으려고 매트리스를 기울이거나 베개로 머리를 올려 재우지 마세요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['역류', 'GERD', '토유', '구토'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '😣',

    care: {"summary":"게워냄과 역류질환은 아기의 불편감·수유·성장 상태를 함께 평가해야 해요.","steps":["수유를 힘들어하거나 통증이 의심되고 성장이 걱정되면 소아과에서 평가받으세요.","수유 뒤 깨어 있는 아기를 보호자가 안아 돌보는 것과 잠자리에 눕히는 것은 구분하세요.","잠잘 때는 등을 대고 단단하고 평평한 수면 면에 눕히세요."],"avoid":["역류를 막으려고 매트리스를 기울이거나 베개로 머리를 올려 재우지 마세요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NIH · 안전한 아기 수면 환경","url":"https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment"},{"title":"NHS · 분유 종류와 우유 단백 알레르기","url":"https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/bottle-feeding/types-of-formula/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  withCare({
    id: 'digestion_17',
    category: 'digestion',
    question: '노로바이러스/로타바이러스 장염은 어떻게 대처하나요?',
    urgency: 'caution',
    tags: ['장염', '노로', '로타', '바이러스', '탈수'],
    applicableMonths: [],
    emoji: '🦠',
  }, {
    summary: "구토나 물설사가 있을 때는 젖은 기저귀와 수유를 확인해 탈수 신호를 살펴요.",
    steps: ["먹을 수 있으면 모유나 정상 농도의 영아용 분유를 이어가요. 경구수분보충액 사용은 의료진에게 확인하고, 기저귀를 갈고 나면 손을 씻어요."],
    avoid: ["일률적인 스푼 수나 시간 간격으로 먹이거나 스포츠음료로 대체하지 마세요."],
    seekHelp: "계속 토해 먹지 못하거나 소변이 줄고, 축 처지거나 피 섞인 변이 나오면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "CDC · 노로바이러스 장염과 탈수", url: "https://www.cdc.gov/norovirus/about/" },
      { title: "CDC · 로타바이러스 장염과 탈수", url: "https://www.cdc.gov/rotavirus/about/index.html" },
      { title: "시애틀 어린이병원 · 생후 0~12개월 설사", url: "https://www.seattlechildrens.org/conditions/a-z/diarrhea-0-12-months/" },
    ],
  }),
  withCare({
    id: 'digestion_18',
    category: 'digestion',
    question: '아기가 이물질을 삼킨 것 같아요!',
    urgency: 'emergency',
    tags: ['이물질', '삼킴', '응급', '배터리'],
    applicableMonths: [5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '⚠️',
  }, {
    summary: "버튼형 건전지, 자석, 날카로운 물건이나 정체를 모르는 물건을 삼켰다면 증상이 없어도 즉시 응급실로 가세요.",
    steps: [
      "무엇을 언제 삼켰는지 확인하고, 바로 가져갈 수 있다면 제품 포장이나 같은 물건을 의료진에게 보여주세요.",
      "침을 삼키지 못하거나 계속 토하는 증상이 있으면 지체하지 말고 응급실로 가세요.",
      "다른 물건을 삼킨 것으로 보일 때도 물건의 크기·종류와 아기 상태를 알려 의료진에게 진료 시점을 확인하세요.",
    ],
    avoid: ["억지로 토하게 하거나 음식으로 밀어 넣지 마세요. 먹거나 마시는 것은 응급 안내에 따르세요."],
    seekHelp: "숨을 쉬지 못하거나 숨쉬기 어렵다면 즉시 119에 연락하고 상담원의 응급처치 안내를 따르세요.",
  }, {
    checkedOn: "2026-11-13", scope: "건전지·자석·미확인 이물질의 긴급 평가",
    sources: [{"title":"RCH · 삼킨 이물질","url":"https://www.rch.org.au/kidsinfo/fact_sheets/Swallowed_ingested_foreign_bodies/"},{"title":"RCH · 이물질 삼킴 임상 지침","url":"https://www.rch.org.au/clinicalguide/guideline_index/Foreign_body_ingestion/"}],
  }),

  // ============================================================
  // RESPIRATORY (호흡기) — 17 items
  // ============================================================
  {
    id: 'respiratory_01',
    category: 'respiratory',
    question: '아기 코가 막혀서 숨을 잘 못 쉬어요.',
    answer: "코막힘이 있어도 머리를 높이거나 경사진 곳에서 재우지 마세요.\n\n1. 수유·호흡·반응이 평소와 같은지 먼저 확인하세요.\n\n2. 코막힘 때문에 먹기 어렵거나 증상이 걱정되면 소아과에서 아기에게 맞는 돌봄 방법을 안내받으세요.\n\n3. 잠잘 때는 등을 대고 단단하고 평평한 수면 면을 사용하세요.\n\n피해주세요: 베개나 수건을 받쳐 머리를 올려 재우지 마세요. 면봉을 코 안 깊이 넣거나 임의로 감기약을 사용하지 마세요.\n\n진료·도움: 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.",
    urgency: "caution",
    tags: ['코막힘', '호흡', '식염수', '흡입기'],
    applicableMonths: [],
    emoji: '👃',

    care: {"summary":"코막힘이 있어도 머리를 높이거나 경사진 곳에서 재우지 마세요.","steps":["수유·호흡·반응이 평소와 같은지 먼저 확인하세요.","코막힘 때문에 먹기 어렵거나 증상이 걱정되면 소아과에서 아기에게 맞는 돌봄 방법을 안내받으세요.","잠잘 때는 등을 대고 단단하고 평평한 수면 면을 사용하세요."],"avoid":["베개나 수건을 받쳐 머리를 올려 재우지 마세요.","면봉을 코 안 깊이 넣거나 임의로 감기약을 사용하지 마세요."],"seekHelp":"숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NIH · 안전한 아기 수면 환경","url":"https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment"},{"title":"소방청 · 119 응급 안내·상담","url":"https://www.nfa.go.kr/nfa/news/pressrelease/explanation/?cntId=44&mode=view"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  withCare({
    id: 'respiratory_02',
    category: 'respiratory',
    question: '아기가 기침을 해요. 어떻게 해야 하나요?',
    urgency: 'caution',
    tags: ['기침', '감기', '호흡', '수분'],
    applicableMonths: [],
    emoji: '😮‍💨',
  }, {
    summary: "아기가 기침할 때 먼저 호흡이 편한지, 평소처럼 수유하고 반응하는지 살펴요.",
    steps: ["코가 막히면 생리식염수로 코를 부드럽게 관리하고, 아기가 받아들일 수 있는 수유를 이어가요."],
    avoid: ["첫돌 전에는 꿀을 주지 말고, 영아에게 감기약을 임의로 먹이지 마세요."],
    seekHelp: "어린 아기의 기침이 심해지거나 수유가 줄면 진료받으세요. 숨쉬기 힘들어 가슴이 심하게 들어가거나, 숨이 멎거나, 입술이 파래지거나, 반응이 없으면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 소아 감기·기침·귀 감염", url: "https://www.nhs.uk/baby/health/colds-coughs-and-ear-infections-in-children/" },
      { title: "FDA · 소아 감기약 안전", url: "https://www.fda.gov/consumers/consumer-updates/should-you-give-kids-medicine-coughs-and-colds" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'respiratory_03',
    category: 'respiratory',
    question: '가래가 끓는 소리가 나요. 괜찮은가요?',
    urgency: 'caution',
    tags: ['가래', '소리', '기도', '호흡'],
    applicableMonths: [],
    emoji: '🫁',
  }, {
    summary: "그르렁 소리가 코에서 나는지, 숨쉴 때 가슴이 들어가거나 수유가 힘든지 함께 살펴요.",
    steps: ["깨어 있을 때 상태를 확인하고 소리가 지속되거나 새로 쌕쌕거리면 소아청소년과에 연락하세요."],
    avoid: ["가래를 빼겠다며 아기의 등을 세게 두드리거나 분당 호흡수 숫자만 보고 기다리지 마세요."],
    seekHelp: "숨쉬기 힘들어 가슴이 심하게 들어가거나, 숨이 멎거나, 입술이 파래지거나, 반응이 없으면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 영아 세기관지염", url: "https://www.nhs.uk/conditions/bronchiolitis/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'respiratory_04',
    category: 'respiratory',
    question: '세기관지염이란 무엇인가요?',
    urgency: 'caution',
    tags: ['세기관지염', 'RSV', '바이러스', '호흡'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '🫁',
  }, {
    summary: "세기관지염은 어린 아기에서 감기처럼 시작해 쌕쌕거림이나 수유 곤란으로 이어질 수 있어요.",
    steps: ["아기가 평소보다 많이 못 먹거나 젖은 기저귀가 줄면 신속히 연락하세요. 어린 영아와 미숙아는 더 주의 깊게 살펴요."],
    avoid: ["감기라고 단정하거나 남은 항생제·흡입제를 임의로 쓰지 마세요."],
    seekHelp: "숨쉬기 힘들어 가슴이 심하게 들어가거나, 숨이 멎거나, 입술이 파래지거나, 반응이 없으면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 영아 세기관지염", url: "https://www.nhs.uk/conditions/bronchiolitis/" },
    ],
  }),
  withCare({
    id: 'respiratory_05',
    category: 'respiratory',
    question: '크루프(급성 후두염)의 증상과 대처법은?',
    urgency: 'emergency',
    tags: ['크루프', '후두염', '기침', '컹컹'],
    applicableMonths: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '🐕',
  }, {
    summary: "컹컹거리는 기침과 숨을 들이쉴 때 거친 소리가 나면 크루프일 수 있어요. 소아청소년과에 신속히 연락하세요.",
    steps: [
      "아기가 깨어 있으면 편안하게 세워 안고 달래 주세요.",
      "가만히 있어도 거친 숨소리가 나거나 침을 삼키기 어려우면 즉시 응급 평가를 받아요.",
    ],
    avoid: ["뜨거운 수증기를 들이마시게 하지 마세요. 효과가 확인되지 않았고 화상을 입을 수 있어요."],
    seekHelp: "숨쉬기 매우 힘들어하거나 숨이 멈추거나, 입술이 파래지거나, 반응이 떨어지면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "크루프 의심 시 돌봄과 호흡곤란 신호",
    sources: [{"title":"NHS · 크루프","url":"https://www.nhs.uk/conditions/croup/"},{"title":"NHS · 영유아 응급 징후","url":"https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/"}],
  }),
  withCare({
    id: 'respiratory_06',
    category: 'respiratory',
    question: '중이염은 어떤 증상이 있나요?',
    urgency: 'caution',
    tags: ['중이염', '귀', '통증', '감기'],
    applicableMonths: [],
    emoji: '👂',
  }, {
    summary: "귀를 만지는 행동만으로 중이염을 판단하기 어려워요. 귀 통증처럼 보이는 보챔, 열, 귀에서 나오는 분비물을 살펴요.",
    steps: ["진료에서 고막을 확인하고 치료가 필요한지 결정해요."],
    avoid: ["집에 남은 항생제나 귀약을 임의로 쓰거나 귀 안쪽을 닦지 마세요."],
    seekHelp: "귀 뒤가 붓거나 귀에서 진물이 나고 아기가 많이 아파 보이면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 소아 감기·기침·귀 감염", url: "https://www.nhs.uk/baby/health/colds-coughs-and-ear-infections-in-children/" },
    ],
  }),
  withCare({
    id: 'respiratory_07',
    category: 'respiratory',
    question: '아기 감기에 감기약을 먹여도 되나요?',
    urgency: 'info',
    tags: ['감기약', '약', '영아', '처방'],
    applicableMonths: [],
    emoji: '💊',
  }, {
    summary: "영아에게 일반 감기약이나 어른 감기약을 임의로 먹이지 마세요.",
    steps: ["코막힘은 생리식염수로 부드럽게 관리하고 수유와 젖은 기저귀를 확인해요. 약이 필요한지는 아기의 월령을 알리고 의료진에게 확인하세요."],
    avoid: ["같은 성분이 든 여러 약을 함께 먹이거나 남의 처방약을 쓰지 마세요."],
    seekHelp: "생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요. 숨쉬기 힘들어 가슴이 심하게 들어가거나, 숨이 멎거나, 입술이 파래지거나, 반응이 없으면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "FDA · 소아 감기약 안전", url: "https://www.fda.gov/consumers/consumer-updates/should-you-give-kids-medicine-coughs-and-colds" },
      { title: "AAP · 영아의 발열", url: "https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'respiratory_08',
    category: 'respiratory',
    question: '아기 코에서 누런 콧물이 나와요.',
    urgency: 'info',
    tags: ['콧물', '누런', '감기', '부비동염'],
    applicableMonths: [],
    emoji: '🤧',
  }, {
    summary: "누렇거나 초록인 콧물은 감기 경과 중에도 나타날 수 있어요.",
    steps: ["열, 먹는 양, 숨쉬기와 증상이 좋아지는 흐름을 함께 살펴요."],
    avoid: ["콧물 색만 보고 항생제가 필요하다고 판단하지 마세요."],
    seekHelp: "증상이 계속 악화하거나 열이 이어지고 수유가 줄면 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS Healthier Together · 영아 감기와 콧물", url: "https://www.healthiertogether.nhs.uk/new-parent-and-baby/cough-and-cold" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'respiratory_09',
    category: 'respiratory',
    question: '아기가 숨쉴 때 쌕쌕 소리가 나요.',
    urgency: 'emergency',
    tags: ['천명', '쌕쌕', '호흡곤란', '기관지'],
    applicableMonths: [],
    emoji: '😤',
  }, {
    summary: "아기가 새로 쌕쌕거리거나 평소보다 숨쉬기 힘들어 보이면 소아청소년과에 신속히 연락하세요.",
    steps: [
      "가만히 있을 때의 숨소리, 가슴이 들어가는지, 평소처럼 먹는지를 함께 확인해요.",
      "먹거나 작은 물건을 만지던 중 갑자기 증상이 시작됐다면 의료진에게 바로 알려주세요.",
    ],
    avoid: ["습도 조절이나 집에 남아 있는 약만으로 지켜보며 진료를 늦추지 마세요."],
    seekHelp: "숨쉬기 매우 힘들어하거나 숨이 멈추거나, 입술이 파래지거나, 반응이 떨어지면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "쌕쌕거리는 호흡과 즉시 도움받아야 할 징후",
    sources: [{"title":"NHS · 세기관지염","url":"https://www.nhs.uk/conditions/bronchiolitis/"},{"title":"NHS · 영유아 응급 징후","url":"https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/"}],
  }),
  {
    id: 'respiratory_10',
    category: 'respiratory',
    question: '아기 호흡수가 빠른 것 같아요. 정상 호흡수는?',
    answer: "숨이 가빠 보이면 호흡수와 함께 가슴 움직임·입술 색·반응을 살펴보세요.\n\n1. 아기가 편안히 있을 때 가슴이나 배가 오르는 횟수를 1분 동안 세어 기록하세요.\n\n2. 빠른 호흡을 평가하는 기준은 아기의 나이와 증상에 따라 달라요. 편안할 때도 계속 빠르거나 평소보다 잘 먹지 못하면 신속히 의료진에 연락하세요.\n\n피해주세요: 호흡수가 특정 숫자보다 낮다는 이유로 도움 요청을 미루지 마세요.\n\n진료·도움: 가슴이 심하게 들어가거나, 숨이 멈추거나, 입술이 파래지거나, 반응이 떨어지면 바로 119에 연락하세요.",
    urgency: 'caution',
    tags: ['호흡수', '정상', '빈호흡', '관찰'],
    applicableMonths: [],
    emoji: '🫁',
    care: {"summary":"숨이 가빠 보이면 호흡수와 함께 가슴 움직임·입술 색·반응을 살펴보세요.","steps":["아기가 편안히 있을 때 가슴이나 배가 오르는 횟수를 1분 동안 세어 기록하세요.","빠른 호흡을 평가하는 기준은 아기의 나이와 증상에 따라 달라요. 편안할 때도 계속 빠르거나 평소보다 잘 먹지 못하면 신속히 의료진에 연락하세요."],"avoid":["호흡수가 특정 숫자보다 낮다는 이유로 도움 요청을 미루지 마세요."],"seekHelp":"가슴이 심하게 들어가거나, 숨이 멈추거나, 입술이 파래지거나, 반응이 떨어지면 바로 119에 연락하세요."},
    evidence: {"sources":[{"title":"WHO · 소아 호흡기 증상 평가","url":"https://www.who.int/docs/default-source/mca-documents/imci-chart-booklet.pdf"},{"title":"NHS · 영유아 응급 징후","url":"https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/"},{"title":"소방청 · 119 구급 안내","url":"https://www.nfa.go.kr/nfa/introduce/organizationidfo/firstaid/"}],"checkedOn":"2026-11-13","scope":"월령별 평가와 호흡곤란 행동 안내"},
  },
  withCare({
    id: 'respiratory_11',
    category: 'respiratory',
    question: '백일해가 의심될 때 증상은?',
    urgency: 'emergency',
    tags: ['백일해', '기침', '발작', '예방접종'],
    applicableMonths: [0, 1, 2, 3],
    emoji: '🚨',
  }, {
    summary: "아기는 백일해가 있어도 특징적인 기침이 없을 수 있어요. 반복되는 기침이나 백일해 환자와의 접촉이 걱정되면 바로 의료진에 연락하세요.",
    steps: [
      "기침이 이어지는지, 기침 뒤 토하는지, 호흡이 잠깐 멈추는지 확인해요.",
      "접촉 시기와 접종 이력을 의료진에게 알려주세요.",
    ],
    avoid: ["특유의 소리가 나거나 기침이 오래 이어질 때까지 기다리지 마세요."],
    seekHelp: "숨쉬기 매우 힘들어하거나 숨이 멈추거나, 입술이 파래지거나, 반응이 떨어지면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "영아 백일해에서 기침이 없을 때와 무호흡",
    sources: [{"title":"CDC · 백일해 증상","url":"https://www.cdc.gov/pertussis/signs-symptoms/"},{"title":"NHS · 영유아 응급 징후","url":"https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/"}],
  }),
  withCare({
    id: 'respiratory_12',
    category: 'respiratory',
    question: '가습기 사용 시 주의사항은?',
    urgency: 'info',
    tags: ['가습기', '습도', '관리', '안전'],
    applicableMonths: [],
    emoji: '💧',
  }, {
    summary: "가습기는 필요할 때만 쓰고 물통의 물을 매일 비우고 말린 뒤 새로 채워요.",
    steps: ["제품 설명서에 맞춰 씻고 충분히 헹궈요. 실내가 눅눅하거나 창문에 물방울이 맺히면 사용을 줄여요."],
    avoid: ["분무되는 물에 살균제·향료를 넣지 마세요. 뜨거운 증기와 기기는 아기 손이 닿지 않게 해요."],
    seekHelp: "가습기 사용 중 기침이나 호흡 증상이 생기면 사용을 중단하고 상담하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "미국 환경보호청 · 가습기 사용과 관리", url: "https://www.epa.gov/indoor-air-quality-iaq/use-and-care-home-humidifiers" },
    ],
  }),
  withCare({
    id: 'respiratory_13',
    category: 'respiratory',
    question: '아기 코골이가 심해요. 정상인가요?',
    urgency: 'info',
    tags: ['코골이', '수면', '호흡', '무호흡'],
    applicableMonths: [],
    emoji: '😴',
  }, {
    summary: "코골이가 지속되거나 자는 중 숨이 자주 끊기는 것 같으면 소아청소년과에 상담하세요.",
    steps: ["소리가 나는 시각과 자는 자세, 수유 중 숨쉬기 어려움도 알려주세요. 안전하다면 짧은 영상을 진료에 가져갈 수 있어요."],
    avoid: ["베개나 경사 쿠션으로 머리를 높여 재우지 마세요."],
    seekHelp: "숨쉬기 힘들어 가슴이 심하게 들어가거나, 숨이 멎거나, 입술이 파래지거나, 반응이 없으면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "케임브리지 대학병원 · 소아 수면 중 호흡", url: "https://www.cuh.nhs.uk/our-services/childrens-services-paediatrics/childrens-services-a-z/respiratory-paediatrics/childrens-sleep-service/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
      { title: "NIH · 안전한 아기 잠자리", url: "https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment" },
    ],
  }),
  withCare({
    id: 'respiratory_14',
    category: 'respiratory',
    question: '아기 코피가 났어요. 어떻게 해야 하나요?',
    urgency: 'caution',
    tags: ['코피', '출혈', '지혈', '건조'],
    applicableMonths: [],
    emoji: '🩸',
  }, {
    summary: "영아에게 코피가 나면 멎었더라도 소아청소년과에 연락해 진료 시점을 확인하세요.",
    steps: ["숨을 잘 쉬고 있다면 세워 안아 고개를 살짝 앞으로 두고, 콧방울의 부드러운 부분을 10분 정도 연속해서 눌러요."],
    avoid: ["고개를 뒤로 젖히거나 코 깊숙이 솜이나 약을 넣지 마세요."],
    seekHelp: "피가 많거나 압박해도 계속 흐르거나 머리를 부딪힌 뒤 발생했다면 응급 진료를 받아요. 숨쉬기 어려우면 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 코피", url: "https://www.nhs.uk/conditions/nosebleed/" },
    ],
  }),
  withCare({
    id: 'respiratory_15',
    category: 'respiratory',
    question: '아기가 재채기를 자주 해요. 감기인가요?',
    urgency: 'info',
    tags: ['재채기', '감기', '알레르기', '비염'],
    applicableMonths: [],
    emoji: '🤧',
  }, {
    summary: "신생아의 재채기는 콧속 자극을 내보내는 반사로 나타날 수 있어요.",
    steps: ["재채기와 함께 콧물·기침·발열이 있는지, 평소대로 수유하고 숨쉬는지 살펴요."],
    avoid: ["재채기만으로 감기나 알레르기로 단정해 약을 먹이지 마세요."],
    seekHelp: "생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요. 숨쉬기 힘들어 가슴이 심하게 들어가거나, 숨이 멎거나, 입술이 파래지거나, 반응이 없으면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 신생아의 반사와 콧소리", url: "https://www.healthychildren.org/English/tips-tools/symptom-checker/Pages/symptomviewer.aspx?symptom=Newborn+Reflexes+and+Behavior" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'respiratory_16',
    category: 'respiratory',
    question: '신생아 코에서 그르렁 소리가 나요.',
    urgency: 'info',
    tags: ['신생아', '코소리', '그르렁', '호흡'],
    applicableMonths: [0, 1, 2],
    emoji: '👶',
  }, {
    summary: "신생아의 코에서 소리가 나도 숨쉬기와 수유가 편한지 먼저 확인해요.",
    steps: ["콧속이 마르거나 막혀 수유가 어려우면 생리식염수로 부드럽게 관리할 수 있어요."],
    avoid: ["면봉을 코 깊숙이 넣거나 베개를 받쳐 재우지 마세요."],
    seekHelp: "젖을 빠는 중 자주 숨이 차거나 평소보다 못 먹으면 진료받으세요. 숨쉬기 힘들어 가슴이 심하게 들어가거나, 숨이 멎거나, 입술이 파래지거나, 반응이 없으면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 신생아의 반사와 콧소리", url: "https://www.healthychildren.org/English/tips-tools/symptom-checker/Pages/symptomviewer.aspx?symptom=Newborn+Reflexes+and+Behavior" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'respiratory_17',
    category: 'respiratory',
    question: '폐렴이 의심되는 증상은 무엇인가요?',
    urgency: 'emergency',
    tags: ['폐렴', '호흡곤란', '고열', '입원'],
    applicableMonths: [],
    emoji: '🏥',
  }, {
    summary: "아기가 빠르게 숨 쉬거나 가슴이 움푹 들어가고 평소보다 먹지 못하면 신속히 진료받으세요.",
    steps: [
      "아기가 편안할 때 호흡 양상, 체온, 수유량과 젖은 기저귀가 줄었는지 확인해요.",
      "폐렴은 증상만으로 집에서 판단하기 어려워 의료진이 상태를 평가해요.",
    ],
    avoid: ["고열이 없다는 이유로 진료를 미루거나 남은 항생제를 먹이지 마세요."],
    seekHelp: "숨쉬기 매우 힘들어하거나 숨이 멈추거나, 입술이 파래지거나, 반응이 떨어지면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "영아 폐렴 의심 시 평가와 호흡 위험 신호",
    sources: [{"title":"NHS · 폐렴","url":"https://www.nhs.uk/conditions/pneumonia/"},{"title":"NHS · 영유아 응급 징후","url":"https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/"}],
  }),

  // ============================================================
  // GENERAL (일반) — 18 items
  // ============================================================
  withCare({
    id: 'general_01',
    category: 'general',
    question: '신생아 황달은 언제 걱정해야 하나요?',
    urgency: 'caution',
    tags: ['황달', '신생아', '빌리루빈', '광선치료'],
    applicableMonths: [0, 1],
    emoji: '🟡',
  }, {
    summary: "출생 첫 24시간 안에 피부나 눈이 노래 보이면 즉시 의료진에게 알려 평가받으세요.",
    steps: ["이후에도 황달이 심해지거나 오래가면 수유·소변·변 색과 함께 의료진에게 알려요. 진한 소변이나 회백색 변도 빠른 평가가 필요한 신호예요."],
    avoid: ["겉으로 보이는 색만으로 수치를 판단하거나 햇볕으로 치료하려 하지 마세요."],
    seekHelp: "먹지 못하고 깨우기 어렵거나 호흡이 이상하면 즉시 도움을 받으세요. 반응이 없거나 숨쉬기 어려우면 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NICE · 신생아 황달 지침", url: "https://www.nice.org.uk/guidance/cg98/chapter/Recommendations" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'general_02',
    category: 'general',
    question: '탈수 증상은 어떻게 알 수 있나요?',
    urgency: 'emergency',
    tags: ['탈수', '수분', '소변', '응급'],
    applicableMonths: [],
    emoji: '💧',
  }, {
    summary: "젖은 기저귀가 평소보다 줄고, 입이 마르거나 아기가 잘 먹지 못하면 탈수를 의심하고 의료진에게 연락하세요.",
    steps: [
      "평소와 비교해 젖은 기저귀 수, 수유량, 구토·설사 여부를 기록해요.",
      "수유할 수 있다면 모유나 정상 농도로 조제한 영아용 분유를 이어가고, 경구수분보충액 사용은 의료진에게 확인하세요.",
    ],
    avoid: ["집에서 피부를 집어 탈수 단계를 판정하지 마세요. 분유를 묽게 타지 마세요."],
    seekHelp: "먹지 못하거나 소변이 크게 줄고 처지면 신속히 진료를 받으세요. 깨워도 반응이 없거나 숨쉬기 어렵다면 바로 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13", scope: "기저귀·수유·반응으로 알아보는 영아 탈수 징후",
    sources: [{"title":"AAP · 소아 탈수 징후","url":"https://www.healthychildren.org/English/health-issues/injuries-emergencies/Pages/Dehydration.aspx"},{"title":"NHS · 영유아 응급 징후","url":"https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/"}],
  }),
  withCare({
    id: 'general_03',
    category: 'general',
    question: '아기 체중이 잘 안 늘어요. 걱정해야 하나요?',
    urgency: 'caution',
    tags: ['체중', '성장', '수유량', '증가'],
    applicableMonths: [],
    emoji: '⚖️',
  }, {
    summary: "아기 체중은 한 번의 숫자보다 이전 측정값과 비교한 변화가 중요해요.",
    steps: ["출생·최근 체중과 측정 날짜, 수유, 젖은 기저귀를 기록해 진료에서 성장 흐름을 함께 확인해요."],
    avoid: ["월령별 하루 증가량을 목표로 억지로 먹이거나 분유 농도를 바꾸지 마세요."],
    seekHelp: "체중이 계속 줄거나, 잘 먹지 못하고 젖은 기저귀가 줄면 신속히 상담하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NICE · 체중 증가가 더딜 때", url: "https://www.nice.org.uk/guidance/ng75/chapter/recommendations" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'general_04',
    category: 'general',
    question: '수면 문제가 건강 문제와 관련이 있을 수 있나요?',
    urgency: 'info',
    tags: ['수면', '건강', '울음', '중이염'],
    applicableMonths: [],
    emoji: '😴',
  }, {
    summary: "아기 수면은 변할 수 있어요. 갑자기 자주 깨면서 수유나 반응도 달라졌는지 살펴요.",
    steps: ["발열·호흡·먹는 양·젖은 기저귀, 새로운 불편함이 있는지 확인해요."],
    avoid: ["통잠을 목표로 밤중 수유를 임의로 줄이거나 경사진 곳에 재우지 마세요."],
    seekHelp: "평소와 달리 깨우기 어렵거나 숨쉬기가 힘들면 119에 연락하세요. 생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 아기 수면 돕기", url: "https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/" },
      { title: "NIH · 안전한 아기 잠자리", url: "https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'general_05',
    category: 'general',
    question: '아기에게 약을 먹이는 좋은 방법이 있나요?',
    urgency: 'info',
    tags: ['약', '먹이기', '시럽', '가루'],
    applicableMonths: [],
    emoji: '💊',
  }, {
    summary: "아기에게 액상 약을 줄 때는 처방·제품에 적힌 용량과 농도를 확인하고 동봉된 경구용 주사기로 재요.",
    steps: ["아기를 세워 안고 볼 안쪽에 조금씩 넣어 삼킬 시간을 줘요. 가루약을 음식이나 물에 섞어도 되는지는 약사에게 확인하세요."],
    avoid: ["주방 숟가락으로 양을 재거나 약을 젖병 한 통에 섞지 마세요."],
    seekHelp: "약을 뱉거나 토했을 때, 복용량이 헷갈릴 때는 임의로 추가 투여하지 말고 처방 기관이나 약사에 문의하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 소아 액상 약 계량과 투여", url: "https://www.healthychildren.org/English/safety-prevention/at-home/medication-safety/Pages/Using-Liquid-Medicines.aspx" },
      { title: "미네소타 어린이병원 · 약을 먹이는 방법", url: "https://www.childrensmn.org/educationmaterials/parents/article/23163/helping-kids-take-medicine/" },
    ],
  }),
  withCare({
    id: 'general_06',
    category: 'general',
    question: '소아청소년과는 어떤 기준으로 선택해야 하나요?',
    urgency: 'info',
    tags: ['소아과', '병원', '선택', '검진'],
    applicableMonths: [],
    emoji: '🏥',
  }, {
    summary: "평소 검진과 예방접종을 이어갈 수 있는 소아청소년과를 찾고, 운영 시간을 미리 확인해요.",
    steps: ["야간·휴일에 진료 가능한 곳은 응급의료포털 E-Gen에서 확인하고, 방문 전 전화로 영아 진료 가능 여부를 확인해요."],
    avoid: ["응급 신호가 있는데 예약을 기다리거나 영업시간을 검색하며 시간을 보내지 마세요."],
    seekHelp: "숨쉬기 어렵거나 반응이 없고 경련하는 등 위급하면 119에 연락하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "보건복지부 · 응급의료포털 이용 안내", url: "https://www.korea.kr/news/policyNewsView.do?newsId=148931407" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'general_07',
    category: 'general',
    question: '영유아 건강검진은 언제 받아야 하나요?',
    urgency: 'info',
    tags: ['건강검진', '영유아', '일정', '무료'],
    applicableMonths: [],
    emoji: '📋',
  }, {
    summary: "국가 영유아 건강검진은 생후 14~35일, 4~6개월, 9~12개월부터 월령별로 이어져요.",
    steps: ["이후 건강검진은 18~24, 30~36, 42~48, 54~60, 66~71개월이에요. 국민건강보험공단에서 대상 기간과 구강검진 일정을 확인해 예약해요."],
    avoid: ["증상이 있으면 정기검진 날짜까지 기다리지 마세요."],
    seekHelp: "검진 대상이나 기간이 불확실하면 공단 또는 검진기관에 문의하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "국민건강보험공단 · 영유아 건강검진", url: "https://www.nhis.or.kr/renewal_popup/poster/20261013_poster_longdesc_1.html" },
    ],
  }),
  withCare({
    id: 'general_08',
    category: 'general',
    question: '아기가 이가 나올 때 어떤 증상이 있나요?',
    urgency: 'info',
    tags: ['이', '유치', '잇몸', '치발기'],
    applicableMonths: [4, 5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '🦷',
  }, {
    summary: "이앓이에는 침이 늘고 잇몸이 불편해 물려고 하는 행동이 나타날 수 있어요.",
    steps: ["깨끗한 손가락으로 잇몸을 부드럽게 문지르거나 냉장한 고무 치발기를 사용할 수 있어요."],
    avoid: ["얼린 치발기, 이앓이 목걸이, 벤조카인·리도카인 젤을 사용하지 마세요. 발열이나 설사를 이앓이 때문이라고 단정하지 마세요."],
    seekHelp: "발열이 있거나 잘 못 먹고 처지면 진료받으세요. 생후 3개월 미만에서 38°C 이상이거나 발열이 의심되면 바로 의료진에게 연락해 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "FDA · 이앓이 통증 완화와 피할 제품", url: "https://www.fda.gov/consumers/consumer-updates/safely-soothing-teething-pain-infants-and-children" },
      { title: "AAP · 영아의 발열", url: "https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx" },
    ],
  }),
  withCare({
    id: 'general_09',
    category: 'general',
    question: '대천문(숨구멍)은 언제 닫히나요? 만져도 되나요?',
    urgency: 'caution',
    tags: ['대천문', '숨구멍', '닫힘', '탈수'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '👶',
  }, {
    summary: "대천문은 아기 머리의 정상적인 부드러운 부분이에요. 닫히는 시기에는 개인차가 있어요.",
    steps: ["씻기거나 머리를 쓰다듬을 때 가볍게 닿는 것은 괜찮아요. 정기검진에서 머리 성장과 함께 살펴요."],
    avoid: ["대천문을 눌러 확인하거나, 닫히는 시기만으로 질환을 판단하지 마세요."],
    seekHelp: "아기가 차분하고 세워 안겼을 때에도 대천문이 불룩한 상태가 지속되면 즉시 응급 진료를 받아요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 신생아의 피부와 신체 변화", url: "https://www.healthychildren.org/English/ages-stages/baby/Pages/How-Your-Newborn-Looks.aspx" },
      { title: "미국 국립의학도서관 · 불룩한 대천문", url: "https://medlineplus.gov/ency/article/003310.htm" },
    ],
  }),
  withCare({
    id: 'general_10',
    category: 'general',
    question: '아기 배꼽이 튀어나왔어요(제대 탈장).',
    urgency: 'info',
    tags: ['배꼽', '탈장', '제대', '돌출'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '🔵',
  }, {
    summary: "아기가 울 때 배꼽이 불룩해지는 배꼽 탈장은 성장하면서 저절로 줄어드는 경우가 많아요.",
    steps: ["정기 진료에서 크기 변화와 평소 편안한 상태의 모양을 알려요."],
    avoid: ["동전을 붙이거나 테이프로 누르지 마세요."],
    seekHelp: "돌출된 부위가 붉거나 단단하고 아파하거나, 구토가 동반되면 즉시 응급 진료를 받아요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAP · 영유아 배꼽 탈장", url: "https://www.healthychildren.org/English/health-issues/conditions/abdominal/Pages/umbilical-hernia-in-children.aspx" },
    ],
  }),
  {
    id: 'general_11',
    category: 'general',
    question: '아기가 열 없이 경련(발작)을 했어요.',
    answer: "아기가 처음 경련을 했다면 멈췄더라도 바로 119에 연락하세요.\n\n1. 아기가 다치지 않도록 주변 물건을 치우고, 경련이 시작한 시각을 확인하세요.\n\n2. 경련이 멈추면 호흡을 확인하세요. 숨을 쉬고 있다면 옆으로 돌려 눕히고, 119 안내에 따라 곁에서 상태를 살펴보세요.\n\n피해주세요: 움직임을 억지로 막거나 입에 손가락·물건·음식을 넣지 마세요.\n\n진료·도움: 첫 경련이거나, 5분 이상 이어지거나, 회복하지 못한 채 반복되거나, 숨쉬기 어렵다면 바로 119에 도움을 요청하세요.",
    urgency: 'emergency',
    tags: ['경련', '발작', '뇌전증', '응급'],
    applicableMonths: [],
    emoji: '🚨',
    care: {"summary":"아기가 처음 경련을 했다면 멈췄더라도 바로 119에 연락하세요.","steps":["아기가 다치지 않도록 주변 물건을 치우고, 경련이 시작한 시각을 확인하세요.","경련이 멈추면 호흡을 확인하세요. 숨을 쉬고 있다면 옆으로 돌려 눕히고, 119 안내에 따라 곁에서 상태를 살펴보세요."],"avoid":["움직임을 억지로 막거나 입에 손가락·물건·음식을 넣지 마세요."],"seekHelp":"첫 경련이거나, 5분 이상 이어지거나, 회복하지 못한 채 반복되거나, 숨쉬기 어렵다면 바로 119에 도움을 요청하세요."},
    evidence: {"sources":[{"title":"NHS · 경련 시 응급처치","url":"https://www.nhs.uk/symptoms/what-to-do-if-someone-has-a-seizure-fit/"},{"title":"소방청 · 119 구급 안내","url":"https://www.nfa.go.kr/nfa/introduce/organizationidfo/firstaid/"}],"checkedOn":"2026-11-13","scope":"첫 경련과 응급처치"},
  },
  withCare({
    id: 'general_12',
    category: 'general',
    question: '비타민 D 보충제는 아기에게 꼭 필요한가요?',
    urgency: 'info',
    tags: ['비타민D', '보충제', '모유', '뼈'],
    applicableMonths: [],
    emoji: '☀️',
  }, {
    summary: "모유만 먹거나 혼합 수유하는 아기는 출생 직후부터 비타민 D 보충이 필요할 수 있어요.",
    steps: ["CDC는 모유 수유 영아와 분유 섭취량이 하루 약 950mL보다 적은 혼합 수유 영아에 하루 400 IU 보충을 안내해요. 아기의 수유 방식과 제품 농도를 소아청소년과에 알려 실제 보충량을 확인하세요."],
    avoid: ["제품마다 한 방울의 양이 다를 수 있어 다른 제품의 방울 수를 그대로 적용하거나 중복 복용하지 마세요."],
    seekHelp: "미숙아, 기저질환이 있는 아기, 잘못된 양을 먹인 경우에는 의료진에게 확인하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "CDC · 영유아 비타민 D", url: "https://www.cdc.gov/infant-toddler-nutrition/vitamins-minerals/vitamin-d.html" },
    ],
  }),
  withCare({
    id: 'general_13',
    category: 'general',
    question: '아기가 머리를 자주 부딪혀요. 걱정해야 하나요?',
    urgency: "emergency",
    tags: ['머리', '부딪힘', '낙상', '관찰'],
    applicableMonths: [5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '🤕',
  }, {
    summary: "머리를 부딪힌 뒤 경련하거나 깨워도 반응이 없으면 바로 119에 연락하세요.",
    steps: ["낙상 시각과 높이, 부딪힌 곳, 이후 반응과 구토 여부를 확인해요. 특히 어린 영아는 증상이 뚜렷하지 않을 수 있으니 진료가 필요한지 일찍 문의해요."],
    avoid: ["정해진 낙상 높이나 구토 횟수를 채울 때까지 기다리지 마세요."],
    seekHelp: "구토, 평소와 다른 처짐·보챔, 귀나 코에서 피나 맑은 액체가 나오면 즉시 평가받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 머리 외상과 뇌진탕", url: "https://www.nhs.uk/conditions/head-injury-and-concussion/" },
      { title: "리즈 대학병원 · 신생아 머리 외상", url: "https://www.leedsth.nhs.uk/patients/resources/head-injury-advice-for-newborns-2/" },
    ],
  }),
  withCare({
    id: 'general_14',
    category: 'general',
    question: '영아 돌연사 증후군(SIDS)을 예방하려면?',
    urgency: 'info',
    tags: ['SIDS', '돌연사', '수면', '안전'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    emoji: '🛏️',
  }, {
    summary: "낮잠과 밤잠 모두 아기를 등을 대고, 단단하고 평평한 별도 잠자리에 눕혀요.",
    steps: [
      "보호자와 같은 방에 아기 침대를 두고, 매트리스에는 꼭 맞는 시트만 씌워요.",
      "얼굴과 머리가 덮이지 않게 하고, 땀이 나거나 가슴이 뜨거우면 너무 덥지 않은지 살펴요.",
      "공갈젖꼭지는 선택 사항이에요. 직접 모유 수유 중이라면 수유가 안정된 뒤 고려해요.",
    ],
    avoid: ["베개, 느슨한 이불, 범퍼, 인형이나 경사진 수면용품을 잠자리에 두지 마세요."],
    seekHelp: "아기가 반응하지 않거나 정상적으로 숨 쉬지 않으면 즉시 119에 연락하고 안내를 따라요.",
  }, {
    checkedOn: "2026-11-13", scope: "영아 수면 중 위험을 낮추는 수면 자세와 환경",
    sources: [{"title":"NIH · 아기 안전 수면","url":"https://safetosleep.nichd.nih.gov/reduce-risk/reduce"}],
  }),
  withCare({
    id: 'general_15',
    category: 'general',
    question: '아기 눈에 눈곱이 많이 껴요.',
    urgency: 'info',
    tags: ['눈곱', '비루관', '눈물', '마사지'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '👁️',
  }, {
    summary: "눈물이 고이고 눈곱이 반복되면 눈물길이 좁거나 막혔을 수 있어요.",
    steps: ["손을 씻고 깨끗한 거즈를 물에 적셔 눈곱을 부드럽게 닦아요. 마사지가 필요한지와 방법은 진료에서 확인해요."],
    avoid: ["남은 안약이나 모유를 눈에 넣지 마세요."],
    seekHelp: "신생아 눈이 붉거나 눈꺼풀·눈 안쪽이 붓거나, 열이 나고 눈곱이 늘면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "AAPOS · 아기 눈물길 막힘", url: "https://www.aapos.org/glossary/nasolacrimal-duct-obstruction" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  {
    id: 'general_16',
    category: 'general',
    question: '응급실에 가야 할 때와 소아과에 갈 때를 어떻게 구분하나요?',
    answer: "응급 위험 신호가 있으면 바로 119에 도움을 요청하세요.\n\n1. 숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.\n\n2. 그 외에도 아기가 평소와 다르게 아파 보이거나 잘 먹지 못하면 소아과에 신속히 상담하세요.\n\n3. 생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요.\n\n피해주세요: 의식·호흡 문제가 있는데 전화 상담이나 진료 예약만 기다리지 마세요.\n\n진료·도움: 한국에서는 응급 신고와 응급의료 안내·상담을 119에서 받을 수 있어요.",
    urgency: "emergency",
    tags: ['응급실', '소아과', '구분', '판단'],
    applicableMonths: [],
    emoji: '🚑',

    care: {"summary":"응급 위험 신호가 있으면 바로 119에 도움을 요청하세요.","steps":["숨쉬기 어렵거나 입술이 파래지고, 반응이 떨어지거나 경련이 있으면 119에 도움을 요청하세요.","그 외에도 아기가 평소와 다르게 아파 보이거나 잘 먹지 못하면 소아과에 신속히 상담하세요.","생후 3개월 미만에서 발열이 있거나 의심되면 바로 의료진에게 연락해 진료를 받으세요. 해열제 반응을 기다리며 진료를 미루지 마세요."],"avoid":["의식·호흡 문제가 있는데 전화 상담이나 진료 예약만 기다리지 마세요."],"seekHelp":"한국에서는 응급 신고와 응급의료 안내·상담을 119에서 받을 수 있어요."},
    evidence: {"sources":[{"title":"소방청 · 119 응급 안내·상담","url":"https://www.nfa.go.kr/nfa/news/pressrelease/explanation/?cntId=44&mode=view"},{"title":"AAP · 영아의 발열","url":"https://www.healthychildren.org/English/health-issues/conditions/fever/pages/fever-and-your-baby.aspx"},{"title":"NHS · 소아 발열 시 돌봄","url":"https://www.nhs.uk/symptoms/fever-in-children/"}],"checkedOn":"2026-11-04","scope":"이 답변의 행동 안내와 주의사항"},},
  withCare({
    id: 'general_17',
    category: 'general',
    question: '아기 사시(눈 몰림)는 정상인가요?',
    urgency: 'caution',
    tags: ['사시', '눈', '시력', '안과'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '👀',
  }, {
    summary: "한쪽 눈이 계속 몰리거나 생후 3개월 이후에도 자주 몰리면 진료를 받아요.",
    steps: ["어느 쪽 눈인지, 계속인지 가끔인지 확인해 소아안과에 알려주세요."],
    avoid: ["코 모양 때문에 그렇게 보인다고 단정하거나 집에서 눈을 임의로 가리지 마세요."],
    seekHelp: "눈동자가 하얗게 보이거나 갑자기 생긴 눈 몰림에 다른 이상이 동반되면 신속히 진료받으세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 사시", url: "https://www.nhs.uk/conditions/squint/" },
      { title: "NHS · 영유아 응급 징후", url: "https://www.nhs.uk/baby/health/when-to-get-urgent-medical-help-for-babies-and-children-under-5/" },
    ],
  }),
  withCare({
    id: 'general_18',
    category: 'general',
    question: '아기가 고관절 탈구(DDH)인지 어떻게 확인하나요?',
    urgency: 'caution',
    tags: ['고관절', '탈구', 'DDH', '다리'],
    applicableMonths: [0, 1, 2, 3, 4, 5, 6],
    emoji: '🦵',
  }, {
    summary: "고관절 발달 이상은 겉으로 잘 보이지 않을 수 있어 출생 후 검진에서 확인해요.",
    steps: ["둔위였거나 가족력이 있으면 검진 때 알려 초음파가 필요한지 확인하세요. 한쪽 다리가 잘 벌어지지 않거나 길이가 달라 보이는 경우도 상담하세요."],
    avoid: ["허벅지 주름이나 소리만으로 단정하거나 다리를 억지로 벌려 검사하지 마세요."],
    seekHelp: "검진에서 이상 소견을 들었거나 다리 움직임이 달라 보이면 소아청소년과에 진료 시점을 문의하세요.",
  }, {
    checkedOn: "2026-11-13",
    sources: [
      { title: "NHS · 발달성 고관절 이형성증", url: "https://www.nhs.uk/conditions/developmental-dysplasia-of-the-hip/" },
    ],
  }),
];

export function getFAQsForMonth(month: number, category?: FAQCategory): HealthFAQItem[] {
  return healthFAQs.filter((faq) => {
    const monthMatch = faq.applicableMonths.length === 0 || faq.applicableMonths.includes(month);
    const categoryMatch = !category || faq.category === category;
    return monthMatch && categoryMatch;
  });
}

export function searchFAQs(keyword: string): HealthFAQItem[] {
  const lower = keyword.toLowerCase().trim();
  if (!lower) return [];
  return healthFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lower) ||
      faq.answer.toLowerCase().includes(lower) ||
      faq.tags.some((tag) => tag.toLowerCase().includes(lower))
  );
}
