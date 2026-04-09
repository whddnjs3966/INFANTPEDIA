export interface SleepTrainingMethod {
  id: string;
  name: string;
  description: string;
  suitableAge: string;
  pros: string[];
  cons: string[];
  steps: string[];
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  emoji: string;
}

export interface SleepIssue {
  issue: string;
  solution: string;
  emoji: string;
}

export interface SleepGuideData {
  month: number;
  totalSleep: string;
  nightSleep: string;
  napInfo: string;
  sleepSignals: string[];
  sleepEnvironment: string[];
  commonIssues: SleepIssue[];
  suitableMethods: string[];
}

export const sleepTrainingMethods: SleepTrainingMethod[] = [
  {
    id: 'pick-up-put-down',
    name: '안아재우기',
    description:
      '아기가 울면 안아서 달래고, 진정되면 다시 내려놓는 방법입니다. 부모의 스킨십을 유지하면서도 아기가 스스로 잠드는 연습을 합니다.',
    suitableAge: '0개월 이후',
    pros: [
      '부모와 아기 모두 스트레스가 적어요',
      '신생아부터 적용 가능해요',
      '유대감 형성에 도움이 돼요',
    ],
    cons: [
      '시간이 오래 걸릴 수 있어요',
      '부모의 체력 소모가 커요',
      '일관성을 유지하기 어려울 수 있어요',
    ],
    steps: [
      '졸린 신호가 보이면 잠자리에 눕혀주세요',
      '아기가 울면 안아서 달래주세요',
      '울음이 그치면 다시 내려놓으세요',
      '아기가 울면 다시 안아주세요',
      '스스로 잠들 때까지 반복하세요',
    ],
    duration: '7~14일',
    difficulty: 'easy',
    emoji: '🤱',
  },
  {
    id: 'fade-out',
    name: '페이드아웃',
    description:
      '부모의 개입을 점진적으로 줄여가는 방법입니다. 처음에는 토닥거려 재우다가 점차 손만 올려놓기, 옆에 있기 등으로 줄여갑니다.',
    suitableAge: '4개월 이후',
    pros: [
      '아기의 울음이 비교적 적어요',
      '점진적이라 부모 부담이 적어요',
      '아기가 서서히 적응할 수 있어요',
    ],
    cons: [
      '효과가 나타나기까지 시간이 걸려요',
      '단계를 줄이는 타이밍이 어려울 수 있어요',
      '중간에 후퇴할 수 있어요',
    ],
    steps: [
      '첫 며칠: 토닥거리며 재워주세요',
      '다음 며칠: 손만 가볍게 올려놓으세요',
      '그 다음: 아기 옆에 조용히 앉아 있으세요',
      '점차 거리를 늘려가세요',
      '최종적으로 방에서 나와 혼자 잠들게 하세요',
    ],
    duration: '7~14일',
    difficulty: 'medium',
    emoji: '🌙',
  },
  {
    id: 'ferber',
    name: '퍼버법',
    description:
      '아기를 눕히고 점점 긴 간격으로 확인하러 가는 방법입니다. 처음 3분, 다음 5분, 그 다음 10분 간격으로 늘려갑니다.',
    suitableAge: '4개월 이후',
    pros: [
      '비교적 빠르게 효과가 나타나요',
      '체계적인 방법이라 따라하기 쉬워요',
      '과학적으로 검증된 방법이에요',
    ],
    cons: [
      '초반 울음이 많을 수 있어요',
      '부모가 심리적으로 힘들 수 있어요',
      '주변 가족의 이해가 필요해요',
    ],
    steps: [
      '졸린 신호가 보이면 침대에 눕히고 방을 나오세요',
      '3분 후 돌아가서 1분간 달래주세요 (안지는 마세요)',
      '다시 나와서 5분 기다린 후 확인하세요',
      '다음에는 10분 기다린 후 확인하세요',
      '최대 대기시간(10~15분)으로 잠들 때까지 반복하세요',
    ],
    duration: '3~7일',
    difficulty: 'medium',
    emoji: '⏰',
  },
  {
    id: 'camping-out',
    name: '캠핑아웃',
    description:
      '아기 옆에 의자를 놓고 앉아 있다가 매일 조금씩 의자를 문 쪽으로 옮기는 방법입니다. 아기가 부모의 존재를 느끼면서 혼자 잠드는 연습을 합니다.',
    suitableAge: '6개월 이후',
    pros: [
      '아기가 안심감을 느낄 수 있어요',
      '울음이 비교적 적어요',
      '분리 불안이 있는 아기에게 좋아요',
    ],
    cons: [
      '시간이 오래 걸려요 (2~3주)',
      '매일 의자 위치를 기억해야 해요',
      '인내심이 많이 필요해요',
    ],
    steps: [
      '아기 침대 바로 옆에 의자를 놓고 앉으세요',
      '눈을 마주치지 말고 조용히 앉아 있으세요',
      '2~3일마다 의자를 50cm씩 문 쪽으로 옮기세요',
      '점차 문 밖으로 의자를 이동하세요',
      '최종적으로 방 밖에서 아기가 혼자 잠들게 하세요',
    ],
    duration: '14~21일',
    difficulty: 'medium',
    emoji: '🪑',
  },
  {
    id: 'cry-it-out',
    name: '울려재우기(CIO)',
    description:
      '아기를 침대에 눕히고 잠들 때까지 개입하지 않는 방법입니다. 가장 빠르게 효과를 볼 수 있지만 부모에게 심리적 부담이 큽니다.',
    suitableAge: '6개월 이후',
    pros: [
      '가장 빠르게 효과가 나타나요 (2~3일)',
      '방법이 단순하고 명확해요',
      '일관성을 유지하기 쉬워요',
    ],
    cons: [
      '아기의 울음이 많고 길어요',
      '부모의 심리적 부담이 가장 커요',
      '주변의 시선이 부담될 수 있어요',
    ],
    steps: [
      '편안한 수면 루틴을 진행하세요 (목욕, 수유, 자장가 등)',
      '졸리지만 깨어 있는 상태에서 침대에 눕히세요',
      '\"잘 자\" 인사 후 방을 나오세요',
      '아기가 잠들 때까지 개입하지 마세요',
      '안전을 위해 모니터로 확인하세요',
    ],
    duration: '2~3일',
    difficulty: 'hard',
    emoji: '😤',
  },
];

const sleepGuideDataByMonth: SleepGuideData[] = [
  {
    month: 0,
    totalSleep: '16~18시간',
    nightSleep: '8~9시간',
    napInfo: '수시로, 1~2시간 간격',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '고개 돌리기',
      '주먹 쥐기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '딱딱한 매트리스 사용',
      '아기 전용 침대에서 바로 눕히기',
      '이불, 베개, 인형 없이 재우기',
    ],
    commonIssues: [
      {
        issue: '밤낮이 바뀌었어요',
        solution: '낮에는 밝은 환경에서, 밤에는 어둡고 조용한 환경에서 지내며 자연스럽게 리듬을 만들어 주세요.',
        emoji: '🔄',
      },
      {
        issue: '내려놓으면 바로 깨요',
        solution: '깊은 수면에 빠질 때까지 (약 20분) 안아주다 내려놓거나, 속싸개를 활용해 보세요.',
        emoji: '😫',
      },
      {
        issue: '밤중 수유로 자주 깨요',
        solution: '신생아는 2~3시간 간격 수유가 정상이에요. 밤수유 시 조명을 최소화하고 조용히 해주세요.',
        emoji: '🍼',
      },
    ],
    suitableMethods: ['pick-up-put-down'],
  },
  {
    month: 1,
    totalSleep: '15~17시간',
    nightSleep: '8~9시간',
    napInfo: '4~5회, 각 30분~2시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '칭얼거림',
      '시선이 멍해짐',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '속싸개로 감싸기 (모로반사 방지)',
      '백색 소음 활용하기',
      '수유 후 바로 재우지 않기',
    ],
    commonIssues: [
      {
        issue: '밤중에 3~4번 깨요',
        solution: '이 시기에는 정상이에요. 수유 후 바로 눕히고 수면-수유 연결을 최소화하세요.',
        emoji: '🌙',
      },
      {
        issue: '안아야만 잠들어요',
        solution: '졸린 상태에서 내려놓는 연습을 조금씩 해보세요. 속싸개와 백색소음이 도움돼요.',
        emoji: '🤱',
      },
      {
        issue: '낮잠을 잘 안 자요',
        solution: '깨어있는 시간이 1시간을 넘지 않도록 하고, 졸림 신호를 잘 관찰해주세요.',
        emoji: '😴',
      },
    ],
    suitableMethods: ['pick-up-put-down'],
  },
  {
    month: 2,
    totalSleep: '14~16시간',
    nightSleep: '8~10시간',
    napInfo: '4~5회, 각 30분~2시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '칭얼거림',
      '귀 잡아당기기',
      '고개를 이리저리 돌리기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '속싸개 사용 (뒤집기 전까지)',
      '수면 루틴 시작하기 (목욕→수유→자장가)',
      '암막 커튼으로 어둡게 하기',
    ],
    commonIssues: [
      {
        issue: '밤에 긴 잠을 못 자요',
        solution: '저녁 수면 루틴을 만들어 보세요. 매일 같은 시간에 목욕→수유→자장가 순서로 해보세요.',
        emoji: '🌃',
      },
      {
        issue: '낮잠이 30분밖에 안 돼요',
        solution: '이 시기엔 짧은 낮잠이 정상이에요. 백색소음과 어두운 환경이 도움될 수 있어요.',
        emoji: '⏱️',
      },
      {
        issue: '수유하면서 잠들어요',
        solution: '수유 후 기저귀를 갈아주거나 살짝 깨운 상태에서 눕혀보세요.',
        emoji: '🍼',
      },
      {
        issue: '저녁에 많이 울어요 (영아산통)',
        solution: '자전거 다리 운동, 배 마사지, 백색소음을 시도해 보세요. 보통 3~4개월에 사라져요.',
        emoji: '😢',
      },
    ],
    suitableMethods: ['pick-up-put-down'],
  },
  {
    month: 3,
    totalSleep: '14~16시간',
    nightSleep: '9~10시간',
    napInfo: '3~4회, 각 30분~2시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '칭얼거림',
      '활동량이 줄어듦',
      '엄마에게 얼굴을 파묻기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '일정한 수면 루틴 유지하기',
      '암막 커튼 사용하기',
      '백색 소음 활용하기',
      '수면 시 조용한 환경 만들기',
    ],
    commonIssues: [
      {
        issue: '4개월 수면 퇴행이 시작됐어요',
        solution: '수면 구조가 바뀌는 시기예요. 일관된 루틴을 유지하고, 너무 피곤하기 전에 재워주세요.',
        emoji: '📉',
      },
      {
        issue: '낮잠 시간이 불규칙해요',
        solution: '깨어있는 시간을 1.5~2시간으로 유지하며 일정한 스케줄을 만들어보세요.',
        emoji: '⏰',
      },
      {
        issue: '속싸개를 벗어나요',
        solution: '뒤집기 조짐이 보이면 속싸개를 졸업할 시기예요. 수면조끼로 바꿔보세요.',
        emoji: '👶',
      },
    ],
    suitableMethods: ['pick-up-put-down'],
  },
  {
    month: 4,
    totalSleep: '14~15시간',
    nightSleep: '10~11시간',
    napInfo: '3~4회, 각 30분~1.5시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '칭얼거림',
      '눈이 충혈됨',
      '관심이 줄어듦',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '속싸개 졸업 → 수면조끼 사용',
      '암막 커튼 사용하기',
      '백색 소음 활용하기',
      '일정한 취침 시간 설정하기',
    ],
    commonIssues: [
      {
        issue: '4개월 수면 퇴행이 심해요',
        solution: '수면 사이클이 성인처럼 바뀌는 과정이에요. 2~4주 정도 지속되며, 수면교육을 시작할 수 있어요.',
        emoji: '📉',
      },
      {
        issue: '밤중 수유가 다시 늘었어요',
        solution: '습관성 수유인지 확인하세요. 배고파서가 아니라면 토닥여 다시 재워보세요.',
        emoji: '🍼',
      },
      {
        issue: '낮잠을 30분만 자요',
        solution: '30분에 깨면 10분 정도 기다려보세요. 다시 잠들 수도 있어요.',
        emoji: '😴',
      },
      {
        issue: '잠투정이 심해요',
        solution: '깨어있는 시간이 2시간을 넘지 않도록 해주세요. 과피로가 잠투정의 주요 원인이에요.',
        emoji: '😤',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber'],
  },
  {
    month: 5,
    totalSleep: '14~15시간',
    nightSleep: '10~11시간',
    napInfo: '3회, 각 30분~1.5시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '칭얼거림',
      '특정 물건 찾기 (인형 등)',
      '엄마에게 안기려 함',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '백색 소음 활용하기',
      '수면 의식 일정하게 유지하기',
      '안전한 수면 환경 확인하기 (뒤집기 시작)',
    ],
    commonIssues: [
      {
        issue: '뒤집기를 하면서 자다 깨요',
        solution: '충분히 뒤집기 연습을 시켜주세요. 엎드려 자는 것이 익숙해지면 괜찮아져요.',
        emoji: '🔄',
      },
      {
        issue: '세 번째 낮잠을 거부해요',
        solution: '2회 낮잠으로 전환을 고려해볼 시기예요. 하지만 너무 일찍 줄이지 마세요.',
        emoji: '😤',
      },
      {
        issue: '밤에 자주 깨서 놀아요',
        solution: '조용하고 어두운 환경을 유지하세요. 반응하지 않으면 다시 잠들어요.',
        emoji: '🎮',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber'],
  },
  {
    month: 6,
    totalSleep: '13~14시간',
    nightSleep: '10~11시간',
    napInfo: '2~3회, 각 30분~1.5시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '짜증내기',
      '안기려 함',
      '움직임이 느려짐',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '백색 소음 활용하기',
      '수면 의식: 목욕→마사지→수유→자장가',
      '안전한 수면 공간 재확인하기',
    ],
    commonIssues: [
      {
        issue: '밤중 수유가 아직 있어요',
        solution: '6개월 이후에는 밤중 수유를 줄여볼 수 있어요. 서서히 수유량을 줄이거나 물로 대체해 보세요.',
        emoji: '🍼',
      },
      {
        issue: '이앓이로 잠을 못 자요',
        solution: '이가 나는 시기에는 잇몸 마사지기나 치발기를 활용하세요. 일시적이니 곧 나아져요.',
        emoji: '🦷',
      },
      {
        issue: '낮잠 전환기예요 (3→2회)',
        solution: '세 번째 낮잠을 자연스럽게 없애세요. 취침 시간을 조금 앞당겨 보세요.',
        emoji: '🔄',
      },
      {
        issue: '분리 불안으로 울어요',
        solution: '짧은 이별 연습을 해보세요. \"잘 자, 곧 올게\" 인사 후 나오세요.',
        emoji: '😢',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber', 'camping-out', 'cry-it-out'],
  },
  {
    month: 7,
    totalSleep: '13~14시간',
    nightSleep: '10~11시간',
    napInfo: '2회, 각 1~2시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '짜증내기',
      '눈이 풀리기',
      '머리를 바닥에 대기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '백색 소음 활용하기',
      '안전한 침대 환경 (잡고 일어설 수 있음)',
      '잠자리 루틴 15~20분으로 유지하기',
    ],
    commonIssues: [
      {
        issue: '서려고 해서 잠을 안 자요',
        solution: '낮에 충분히 서는 연습을 시켜주세요. 잠자리에서는 눕혀주되 반복하세요.',
        emoji: '🧍',
      },
      {
        issue: '분리 불안이 심해졌어요',
        solution: '까꿍놀이로 \"돌아온다\"는 개념을 알려주세요. 짧은 분리를 점차 늘려가세요.',
        emoji: '😢',
      },
      {
        issue: '밤에 깨서 놀아요',
        solution: '어둡고 조용한 환경을 유지하세요. 놀아주지 않으면 다시 잠들어요.',
        emoji: '🎮',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber', 'camping-out', 'cry-it-out'],
  },
  {
    month: 8,
    totalSleep: '13~14시간',
    nightSleep: '10~11시간',
    napInfo: '2회, 각 1~2시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '안기려 함',
      '활동이 느려짐',
      '특정 물건(이불, 인형) 찾기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '애착 물건(작은 인형 등) 허용 가능',
      '침대 안전 점검 (잡고 일어서기 대비)',
      '일관된 수면 루틴 유지하기',
    ],
    commonIssues: [
      {
        issue: '8개월 수면 퇴행이 왔어요',
        solution: '발달 급성장, 분리 불안, 이앓이가 겹칠 수 있어요. 일관된 루틴을 유지하면 2~3주 내 지나가요.',
        emoji: '📉',
      },
      {
        issue: '잡고 일어서서 못 내려와요',
        solution: '낮에 앉는 연습을 충분히 시켜주세요. 눕혀주되 반복적으로 해주세요.',
        emoji: '🧍',
      },
      {
        issue: '밤중 수유를 끊고 싶어요',
        solution: '서서히 수유량을 줄이거나, 수유 간격을 늘려보세요. 토닥여 재우는 연습을 해보세요.',
        emoji: '🍼',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber', 'camping-out', 'cry-it-out'],
  },
  {
    month: 9,
    totalSleep: '13~14시간',
    nightSleep: '10~11시간',
    napInfo: '2회, 각 1~1.5시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '칭얼거리며 안기기',
      '움직임이 느려짐',
      '손가락 빨기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '백색 소음 또는 자장가 활용',
      '안전한 수면 공간 유지 (활동량 증가 대비)',
      '애착 물건으로 안정감 주기',
    ],
    commonIssues: [
      {
        issue: '낮잠 시간이 짧아졌어요',
        solution: '오전 낮잠은 길게, 오후 낮잠은 짧게 유도해 보세요. 깨어있는 시간을 3~3.5시간으로 조절하세요.',
        emoji: '⏱️',
      },
      {
        issue: '기어다니느라 잠을 안 자요',
        solution: '잠자기 30분 전부터 조용한 활동으로 전환하세요. 수면 루틴으로 진정시켜주세요.',
        emoji: '🏃',
      },
      {
        issue: '분리 불안이 심해요',
        solution: '일관된 잠자리 인사를 해주세요. \"잘 자, 내일 보자\" 같은 짧은 인사가 도움돼요.',
        emoji: '😢',
      },
      {
        issue: '자다가 앉거나 서요',
        solution: '말없이 다시 눕혀주세요. 반복하되 감정적으로 반응하지 마세요.',
        emoji: '🧍',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber', 'camping-out', 'cry-it-out'],
  },
  {
    month: 10,
    totalSleep: '13~14시간',
    nightSleep: '10~12시간',
    napInfo: '2회, 각 1~1.5시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '칭얼거림',
      '관심이 줄어듦',
      '짜증을 내며 물건 던지기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '수면 루틴 15~20분 유지하기',
      '취침 시간 일정하게 유지하기 (저녁 7~8시)',
      '애착 물건 활용하기',
    ],
    commonIssues: [
      {
        issue: '서거나 걸으려고 해서 안 자요',
        solution: '낮에 충분히 활동하게 해주세요. 잠자리에서는 조용히 눕혀주기를 반복하세요.',
        emoji: '🚶',
      },
      {
        issue: '오전 낮잠을 거부해요',
        solution: '아직 2회 낮잠이 필요해요. 깨어있는 시간을 3~4시간으로 조절해보세요.',
        emoji: '😤',
      },
      {
        issue: '밤에 깨서 울어요',
        solution: '간단히 토닥여주되, 자극을 최소화하세요. 5분 정도 기다려보면 스스로 잠들 수 있어요.',
        emoji: '🌙',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber', 'camping-out', 'cry-it-out'],
  },
  {
    month: 11,
    totalSleep: '13~14시간',
    nightSleep: '10~12시간',
    napInfo: '2회, 각 1~1.5시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '짜증내기',
      '엄마에게 안기기',
      '이불이나 인형 찾기',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '취침 전 활동적인 놀이 피하기',
      '스크린 노출 피하기 (취침 1시간 전)',
      '일관된 수면 의식 유지하기',
    ],
    commonIssues: [
      {
        issue: '낮잠 거부가 심해요',
        solution: '깨어있는 시간을 3.5~4시간으로 유지하세요. 환경을 어둡게 하고 루틴을 따라주세요.',
        emoji: '😤',
      },
      {
        issue: '밤에 깨서 놀고 싶어해요',
        solution: '어둡고 조용한 환경을 유지하세요. 놀아주지 않으면 5~10분 내로 다시 잠들어요.',
        emoji: '🎮',
      },
      {
        issue: '자기 전에 기어나오려 해요',
        solution: '침대에서 나오면 조용히 다시 데려다 눕혀주세요. 감정적 반응 없이 반복하세요.',
        emoji: '🏃',
      },
      {
        issue: '걸음마 시작으로 수면 퇴행이에요',
        solution: '새로운 발달 단계의 일시적 퇴행이에요. 일관된 루틴이 가장 중요해요.',
        emoji: '📉',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber', 'camping-out', 'cry-it-out'],
  },
  {
    month: 12,
    totalSleep: '12~14시간',
    nightSleep: '10~12시간',
    napInfo: '1~2회, 각 1~2시간',
    sleepSignals: [
      '눈 비비기',
      '하품하기',
      '짜증 내며 떼쓰기',
      '안기려 함',
      '평소보다 조용해짐',
    ],
    sleepEnvironment: [
      '실내 온도 22~24°C 유지',
      '암막 커튼 사용하기',
      '취침 전 차분한 활동하기 (책 읽기)',
      '일정한 취침/기상 시간 유지하기',
      '안전한 수면 환경 유지하기 (걸어다니는 시기)',
    ],
    commonIssues: [
      {
        issue: '낮잠을 1회로 줄여야 하나요?',
        solution: '12개월 전후로 2→1회 전환이 시작돼요. 오후 낮잠이 너무 짧거나 거부하면 1회로 줄여보세요.',
        emoji: '🔄',
      },
      {
        issue: '취침 시간에 울고 떼써요',
        solution: '충분한 수면 루틴과 예고를 해주세요. \"책 한 권 읽고 잘 거야\" 같은 예고가 효과적이에요.',
        emoji: '😢',
      },
      {
        issue: '밤에 깨서 우유를 찾아요',
        solution: '밤수유 습관이 남아있다면 물로 대체하거나, 토닥여 다시 재워보세요.',
        emoji: '🍼',
      },
      {
        issue: '분리 불안이 다시 심해졌어요',
        solution: '12개월 전후 분리 불안이 다시 올 수 있어요. 짧은 이별 연습과 일관된 인사를 해주세요.',
        emoji: '😢',
      },
      {
        issue: '걸어다니면서 잠을 안 자요',
        solution: '취침 30분 전부터 조용한 놀이로 전환하세요. 지나친 흥분을 피해주세요.',
        emoji: '🚶',
      },
    ],
    suitableMethods: ['pick-up-put-down', 'fade-out', 'ferber', 'camping-out', 'cry-it-out'],
  },
];

export function getSleepGuideForMonth(month: number): SleepGuideData | undefined {
  return sleepGuideDataByMonth.find((data) => data.month === month);
}

export function getSuitableMethodsForMonth(month: number): SleepTrainingMethod[] {
  const guide = getSleepGuideForMonth(month);
  if (!guide) return [];
  return sleepTrainingMethods.filter((method) =>
    guide.suitableMethods.includes(method.id)
  );
}
