export interface ToothInfo {
  id: string;
  name: string;
  shortName: string;
  position: 'upper' | 'lower';
  side: 'center' | 'lateral' | 'canine' | 'first_molar' | 'second_molar';
  eruptionMonth: string;
  eruptionOrder: number;
  emoji: string;
}

export interface TeethingRemedy {
  title: string;
  description: string;
  emoji: string;
  effectiveness: 'high' | 'medium';
}

export interface BrushingStep {
  step: number;
  title: string;
  description: string;
  emoji: string;
}

export interface DentalGuideData {
  teethTimeline: ToothInfo[];
  teethingSymptoms: string[];
  teethingRemedies: TeethingRemedy[];
  brushingGuide: {
    startAge: string;
    toothpasteAge: string;
    fluorideNote: string;
    steps: BrushingStep[];
    frequency: string;
    duration: string;
  };
  dentalVisit: {
    firstVisit: string;
    frequency: string;
    whatToExpect: string[];
  };
  commonIssues: { issue: string; solution: string; emoji: string }[];
  monthlyNote: Record<number, string>;
}

const teethTimeline: ToothInfo[] = [
  // 1. 하악 중절치 (아래 앞니 2개) - 6~10개월
  {
    id: 'lower-center-left',
    name: '하악 중절치 (아래 앞니)',
    shortName: '아래 앞니',
    position: 'lower',
    side: 'center',
    eruptionMonth: '6~10개월',
    eruptionOrder: 1,
    emoji: '🦷',
  },
  {
    id: 'lower-center-right',
    name: '하악 중절치 (아래 앞니)',
    shortName: '아래 앞니',
    position: 'lower',
    side: 'center',
    eruptionMonth: '6~10개월',
    eruptionOrder: 1,
    emoji: '🦷',
  },
  // 2. 상악 중절치 (위 앞니 2개) - 8~12개월
  {
    id: 'upper-center-left',
    name: '상악 중절치 (위 앞니)',
    shortName: '위 앞니',
    position: 'upper',
    side: 'center',
    eruptionMonth: '8~12개월',
    eruptionOrder: 2,
    emoji: '🦷',
  },
  {
    id: 'upper-center-right',
    name: '상악 중절치 (위 앞니)',
    shortName: '위 앞니',
    position: 'upper',
    side: 'center',
    eruptionMonth: '8~12개월',
    eruptionOrder: 2,
    emoji: '🦷',
  },
  // 3. 상악 측절치 (위 옆니 2개) - 9~13개월
  {
    id: 'upper-lateral-left',
    name: '상악 측절치 (위 옆니)',
    shortName: '위 옆니',
    position: 'upper',
    side: 'lateral',
    eruptionMonth: '9~13개월',
    eruptionOrder: 3,
    emoji: '🦷',
  },
  {
    id: 'upper-lateral-right',
    name: '상악 측절치 (위 옆니)',
    shortName: '위 옆니',
    position: 'upper',
    side: 'lateral',
    eruptionMonth: '9~13개월',
    eruptionOrder: 3,
    emoji: '🦷',
  },
  // 4. 하악 측절치 (아래 옆니 2개) - 10~16개월
  {
    id: 'lower-lateral-left',
    name: '하악 측절치 (아래 옆니)',
    shortName: '아래 옆니',
    position: 'lower',
    side: 'lateral',
    eruptionMonth: '10~16개월',
    eruptionOrder: 4,
    emoji: '🦷',
  },
  {
    id: 'lower-lateral-right',
    name: '하악 측절치 (아래 옆니)',
    shortName: '아래 옆니',
    position: 'lower',
    side: 'lateral',
    eruptionMonth: '10~16개월',
    eruptionOrder: 4,
    emoji: '🦷',
  },
  // 5. 상악 제1유구치 (위 첫째 어금니 2개) - 13~19개월
  {
    id: 'upper-first-molar-left',
    name: '상악 제1유구치 (위 첫째 어금니)',
    shortName: '위 첫째 어금니',
    position: 'upper',
    side: 'first_molar',
    eruptionMonth: '13~19개월',
    eruptionOrder: 5,
    emoji: '🦷',
  },
  {
    id: 'upper-first-molar-right',
    name: '상악 제1유구치 (위 첫째 어금니)',
    shortName: '위 첫째 어금니',
    position: 'upper',
    side: 'first_molar',
    eruptionMonth: '13~19개월',
    eruptionOrder: 5,
    emoji: '🦷',
  },
  // 6. 하악 제1유구치 (아래 첫째 어금니 2개) - 14~18개월
  {
    id: 'lower-first-molar-left',
    name: '하악 제1유구치 (아래 첫째 어금니)',
    shortName: '아래 첫째 어금니',
    position: 'lower',
    side: 'first_molar',
    eruptionMonth: '14~18개월',
    eruptionOrder: 6,
    emoji: '🦷',
  },
  {
    id: 'lower-first-molar-right',
    name: '하악 제1유구치 (아래 첫째 어금니)',
    shortName: '아래 첫째 어금니',
    position: 'lower',
    side: 'first_molar',
    eruptionMonth: '14~18개월',
    eruptionOrder: 6,
    emoji: '🦷',
  },
  // 7. 상악 유견치 (위 송곳니 2개) - 16~22개월
  {
    id: 'upper-canine-left',
    name: '상악 유견치 (위 송곳니)',
    shortName: '위 송곳니',
    position: 'upper',
    side: 'canine',
    eruptionMonth: '16~22개월',
    eruptionOrder: 7,
    emoji: '🦷',
  },
  {
    id: 'upper-canine-right',
    name: '상악 유견치 (위 송곳니)',
    shortName: '위 송곳니',
    position: 'upper',
    side: 'canine',
    eruptionMonth: '16~22개월',
    eruptionOrder: 7,
    emoji: '🦷',
  },
  // 8. 하악 유견치 (아래 송곳니 2개) - 17~23개월
  {
    id: 'lower-canine-left',
    name: '하악 유견치 (아래 송곳니)',
    shortName: '아래 송곳니',
    position: 'lower',
    side: 'canine',
    eruptionMonth: '17~23개월',
    eruptionOrder: 8,
    emoji: '🦷',
  },
  {
    id: 'lower-canine-right',
    name: '하악 유견치 (아래 송곳니)',
    shortName: '아래 송곳니',
    position: 'lower',
    side: 'canine',
    eruptionMonth: '17~23개월',
    eruptionOrder: 8,
    emoji: '🦷',
  },
  // 9. 하악 제2유구치 (아래 둘째 어금니 2개) - 23~31개월
  {
    id: 'lower-second-molar-left',
    name: '하악 제2유구치 (아래 둘째 어금니)',
    shortName: '아래 둘째 어금니',
    position: 'lower',
    side: 'second_molar',
    eruptionMonth: '23~31개월',
    eruptionOrder: 9,
    emoji: '🦷',
  },
  {
    id: 'lower-second-molar-right',
    name: '하악 제2유구치 (아래 둘째 어금니)',
    shortName: '아래 둘째 어금니',
    position: 'lower',
    side: 'second_molar',
    eruptionMonth: '23~31개월',
    eruptionOrder: 9,
    emoji: '🦷',
  },
  // 10. 상악 제2유구치 (위 둘째 어금니 2개) - 25~33개월
  {
    id: 'upper-second-molar-left',
    name: '상악 제2유구치 (위 둘째 어금니)',
    shortName: '위 둘째 어금니',
    position: 'upper',
    side: 'second_molar',
    eruptionMonth: '25~33개월',
    eruptionOrder: 10,
    emoji: '🦷',
  },
  {
    id: 'upper-second-molar-right',
    name: '상악 제2유구치 (위 둘째 어금니)',
    shortName: '위 둘째 어금니',
    position: 'upper',
    side: 'second_molar',
    eruptionMonth: '25~33개월',
    eruptionOrder: 10,
    emoji: '🦷',
  },
];

const teethingSymptoms: string[] = [
  '잇몸이 빨갛게 붓고 부어오름',
  '침을 평소보다 많이 흘림',
  '칭얼거리고 보채는 횟수 증가',
  '손에 닿는 물건을 자꾸 입에 넣고 물기',
  '미열 (38도 이하)이 날 수 있음',
  '수면 패턴이 불규칙해지고 자주 깸',
  '식욕이 감소하고 수유를 거부할 수 있음',
];

const teethingRemedies: TeethingRemedy[] = [
  {
    title: '차가운 치발기 사용',
    description: '냉장고에 넣어 시원하게 한 치발기를 물려주세요. 차가운 온도가 잇몸 통증을 완화해줍니다. 냉동은 너무 차가우니 냉장만 하세요.',
    emoji: '🧊',
    effectiveness: 'high',
  },
  {
    title: '잇몸 마사지',
    description: '깨끗이 씻은 손가락으로 아기 잇몸을 부드럽게 문질러주세요. 거즈를 감싸서 마사지하면 더 효과적입니다.',
    emoji: '👆',
    effectiveness: 'high',
  },
  {
    title: '냉장 수건 물기',
    description: '깨끗한 수건을 물에 적셔 냉장고에 넣은 후 아기가 물 수 있게 해주세요. 자연스럽게 씹는 욕구도 해소됩니다.',
    emoji: '🧣',
    effectiveness: 'high',
  },
  {
    title: '이앓이 전용 젤',
    description: '소아과 또는 약국에서 구입한 이앓이 전용 젤을 잇몸에 소량 발라주세요. 반드시 영유아용 제품을 사용하세요.',
    emoji: '💊',
    effectiveness: 'medium',
  },
  {
    title: '아기용 해열진통제',
    description: '통증이 심해 수유나 수면에 지장이 있을 때, 소아과 의사와 상담 후 아기용 해열진통제를 사용할 수 있습니다.',
    emoji: '🩺',
    effectiveness: 'medium',
  },
  {
    title: '차가운 과일 (이유식 시작 후)',
    description: '이유식을 시작한 아기라면 냉장 보관한 바나나, 오이 등을 메쉬 피더에 넣어 물려줄 수 있어요.',
    emoji: '🍌',
    effectiveness: 'medium',
  },
];

const brushingSteps: BrushingStep[] = [
  {
    step: 1,
    title: '자세 잡기',
    description: '아기를 무릎에 눕히거나 안은 상태에서 머리를 살짝 뒤로 젖혀 입안이 잘 보이도록 합니다.',
    emoji: '🧸',
  },
  {
    step: 2,
    title: '거즈 또는 칫솔 준비',
    description: '첫 이가 나기 전에는 젖은 거즈로, 이가 나면 실리콘 핑거 칫솔이나 영아용 칫솔을 사용하세요.',
    emoji: '🪥',
  },
  {
    step: 3,
    title: '치약 적정량',
    description: '3세 미만은 쌀알 크기만큼의 불소 치약을, 치약 없이 물로만 닦아도 괜찮습니다.',
    emoji: '✨',
  },
  {
    step: 4,
    title: '잇몸과 이 닦기',
    description: '잇몸 라인을 따라 부드럽게 원을 그리며 닦아주세요. 이의 앞면, 뒷면, 씹는 면 모두 닦아줍니다.',
    emoji: '🔄',
  },
  {
    step: 5,
    title: '혀 닦기',
    description: '거즈나 혀 클리너로 혀도 살짝 닦아주면 구강 건강에 좋습니다.',
    emoji: '👅',
  },
  {
    step: 6,
    title: '마무리',
    description: '깨끗한 물을 적신 거즈로 입안을 한 번 더 닦아주고, 칭찬해주세요! 양치 습관은 즐거운 경험으로 만들어주는 것이 중요합니다.',
    emoji: '🎉',
  },
];

const monthlyNotes: Record<number, string> = {
  0: '아직 이가 나지 않는 시기예요. 수유 후 젖은 거즈로 잇몸을 살짝 닦아주면 좋습니다.',
  1: '잇몸 관리가 중요한 시기예요. 수유 후 깨끗한 거즈로 잇몸을 닦아주는 습관을 들여보세요.',
  2: '아직 이가 나기 전이지만, 거즈로 잇몸을 닦아주는 것이 나중에 양치 습관을 들이는 데 도움이 됩니다.',
  3: '잇몸을 만지는 것에 익숙해지도록 해주세요. 이가 나기 시작하면 양치가 더 수월해집니다.',
  4: '일부 아기는 이 시기부터 이앓이 증상이 시작될 수 있어요. 잇몸이 부어보이는지 확인해보세요.',
  5: '이가 나기 직전 잇몸이 단단해지고 하얗게 보일 수 있어요. 치발기를 준비해두세요.',
  6: '이 시기에 아래 앞니가 나기 시작할 수 있어요! 첫 이가 나면 핑거 칫솔로 닦아주기 시작하세요.',
  7: '아래 앞니가 올라오는 중일 수 있어요. 이앓이로 칭얼거리면 차가운 치발기가 도움이 됩니다.',
  8: '위 앞니가 나기 시작할 수 있는 시기예요. 앞니가 나면 음식물이 끼지 않도록 잘 닦아주세요.',
  9: '위 옆니도 올라올 수 있어요. 이제 윗니와 아랫니를 모두 신경 써서 닦아주세요.',
  10: '아래 옆니가 나기 시작할 수 있어요. 앞니 4~6개가 나 있을 수 있으며, 밤중 수유 후에도 입안을 닦아주세요.',
  11: '여러 개의 이가 나 있을 수 있어요. 영아용 칫솔로 바꿔 아침, 저녁 양치를 시작해보세요.',
  12: '첫 돌이에요! 이 시기에 첫 치과 검진을 받는 것이 권장됩니다. 보통 6~8개의 이가 나 있을 수 있어요.',
};

const commonIssues: { issue: string; solution: string; emoji: string }[] = [
  {
    issue: '이가 늦게 나요 (12개월 이후에도 없음)',
    solution: '개인차가 크므로 13개월까지는 정상 범위입니다. 그 이후에도 이가 나지 않으면 소아치과 상담을 받아보세요.',
    emoji: '⏰',
  },
  {
    issue: '이가 나는 순서가 달라요',
    solution: '교과서적 순서와 다르게 나는 것은 매우 흔합니다. 순서보다 이가 고르게 나는지가 더 중요합니다.',
    emoji: '🔀',
  },
  {
    issue: '수유 후 충치가 걱정돼요',
    solution: '특히 밤중 수유 후에는 젖은 거즈로 이와 잇몸을 닦아주세요. 젖병을 물고 잠들지 않도록 해주세요.',
    emoji: '🍼',
  },
  {
    issue: '양치를 싫어해요',
    solution: '노래를 부르거나 양치 놀이를 하며 즐거운 경험으로 만들어주세요. 아기가 칫솔을 직접 잡아보게 하는 것도 좋습니다.',
    emoji: '😤',
  },
  {
    issue: '잇몸에서 피가 나요',
    solution: '이가 나는 과정에서 소량의 출혈은 정상입니다. 잇몸이 많이 붓거나 출혈이 계속되면 소아치과를 방문하세요.',
    emoji: '🩸',
  },
  {
    issue: '이앓이 열이 높아요',
    solution: '이앓이로 인한 열은 보통 38도 이하입니다. 38.5도 이상의 고열은 다른 원인일 수 있으니 소아과를 방문하세요.',
    emoji: '🌡️',
  },
];

const dentalGuideData: DentalGuideData = {
  teethTimeline,
  teethingSymptoms,
  teethingRemedies,
  brushingGuide: {
    startAge: '첫 이가 나오면 바로 시작 (보통 6개월 전후)',
    toothpasteAge: '첫 이가 나면 불소 치약 사용 가능 (쌀알 크기)',
    fluorideNote: '3세 미만은 쌀알 크기(약 0.1g), 3~6세는 콩알 크기의 불소 치약을 사용하세요. 불소는 충치 예방에 효과적이지만 과량 섭취하지 않도록 주의합니다.',
    steps: brushingSteps,
    frequency: '하루 2회 (아침, 자기 전)',
    duration: '약 2분간 꼼꼼하게',
  },
  dentalVisit: {
    firstVisit: '첫 이가 나온 후 6개월 이내 또는 만 1세 이전에 첫 치과 방문을 권장합니다.',
    frequency: '6개월마다 정기 검진',
    whatToExpect: [
      '치아와 잇몸 상태 확인',
      '충치 위험도 평가',
      '불소 도포 (필요시)',
      '올바른 양치법 교육',
      '식습관 및 구강 관리 상담',
      '이 나는 순서와 발달 확인',
    ],
  },
  commonIssues,
  monthlyNote: monthlyNotes,
};

// Helper: parse eruption month range start (e.g. "6~10개월" => 6)
function parseEruptionStart(eruptionMonth: string): number {
  const match = eruptionMonth.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 999;
}

export function getDentalGuide(): DentalGuideData {
  return dentalGuideData;
}

export function getTeethForMonth(month: number): ToothInfo[] {
  return teethTimeline.filter((tooth) => {
    const start = parseEruptionStart(tooth.eruptionMonth);
    return start <= month;
  });
}

export function getMonthlyDentalNote(month: number): string {
  if (month in monthlyNotes) {
    return monthlyNotes[month];
  }
  return monthlyNotes[12] || '';
}
