import type { HealthEvidence } from "./health-faq-data";

type IngredientSafety = { prep: string; allergen?: string; checkLabel?: boolean };

const ingredientSafety = {
  "쌀미음": { prep: "쌀을 푹 익혀 삼키기 쉬운 질감으로 으깨요." },
  "쌀죽": { prep: "쌀을 푹 익혀 삼키기 쉬운 질감으로 으깨요." },
  "진밥": { prep: "밥은 부드럽게 짓고 큰 밥 덩어리는 풀어줘요." },
  "무른밥": { prep: "밥은 부드럽게 짓고 큰 밥 덩어리는 풀어줘요." },
  "감자": { prep: "채소와 뿌리채소는 충분히 익혀 으깨거나 부드럽게 다져요." },
  "고구마": { prep: "채소와 뿌리채소는 충분히 익혀 으깨거나 부드럽게 다져요." },
  "브로콜리": { prep: "채소와 뿌리채소는 충분히 익혀 으깨거나 부드럽게 다져요." },
  "애호박": { prep: "채소와 뿌리채소는 충분히 익혀 으깨거나 부드럽게 다져요." },
  "당근": { prep: "채소와 뿌리채소는 충분히 익혀 으깨거나 부드럽게 다져요." },
  "시금치": { prep: "채소와 뿌리채소는 충분히 익혀 으깨거나 부드럽게 다져요." },
  "단호박": { prep: "채소와 뿌리채소는 충분히 익혀 으깨거나 부드럽게 다져요." },
  "소고기": { prep: "고기는 지방과 질긴 부분을 떼고 충분히 익혀 부드럽게 다져요." },
  "닭가슴살": { prep: "고기는 지방과 질긴 부분을 떼고 충분히 익혀 부드럽게 다져요." },
  "배": { prep: "사과와 배는 씨·껍질을 제거하고 익혀 부드럽게 으깨요." },
  "사과": { prep: "사과와 배는 씨·껍질을 제거하고 익혀 부드럽게 으깨요." },
  "바나나": { prep: "잘 익은 바나나를 부드럽게 으깨요." },
  "두부": { prep: "부드러운 두부를 익혀 으깨거나 잘게 나눠요.", allergen: "대두" },
  "오트밀": { prep: "무가당 오트밀을 충분히 익혀 부드러운 죽으로 만들어요.", checkLabel: true },
  "대구": { prep: "생선을 완전히 익혀 껍질과 가시를 모두 제거하고 살을 잘게 풀어요.", allergen: "생선" },
  "연어": { prep: "생선을 완전히 익혀 껍질과 가시를 모두 제거하고 살을 잘게 풀어요.", allergen: "생선" },
  "달걀": { prep: "달걀은 흰자와 노른자를 완전히 익혀 으깨거나 부드럽게 잘라요.", allergen: "달걀" },
  "살균유 치즈": { prep: "살균유로 만든 저염 치즈를 골라 잘게 갈거나 얇게 나눠요.", allergen: "우유", checkLabel: true },
  "미역": { prep: "미역을 불려 충분히 익힌 뒤 질긴 부분을 제거하고 잘게 다져요." },
  "밀 식빵": { prep: "꿀이 들어 있지 않은 빵을 골라 질긴 가장자리를 떼고, 뭉치거나 딱딱하지 않게 작게 나눠요.", allergen: "밀", checkLabel: true },
  "밀 파스타면": { prep: "면을 충분히 삶아 부드럽게 하고 짧게 잘라요.", allergen: "밀", checkLabel: true },
  "우유(조리용)": { prep: "조리에는 살균 우유를 사용해요.", allergen: "우유" },
  "살균 전지우유(컵)": { prep: "만 12개월부터 무가당 살균 전지우유를 컵으로 제공할 수 있어요.", allergen: "우유" },
  "새우": { prep: "새우의 껍질과 꼬리를 제거하고 완전히 익힌 뒤 잘게 다져요.", allergen: "갑각류" },
} satisfies Record<string, IngredientSafety>;

export interface MealItem {
  meal: string;
  menu: string;
  emoji: string;
  ingredients: (keyof typeof ingredientSafety)[];
}

interface WeeklyMealPlan {
  day: string;
  meals: MealItem[];
}

export interface MealPlanData {
  month: number;
  stage: string;
  weeklyPlan: WeeklyMealPlan[];
}

export const mealPlanSafety = {
  introduction: "앉아서 보호자가 지켜보는 동안, 아기가 씹고 삼킬 수 있는 질감으로 제공해요. 처음 먹는 알레르기 유발 재료는 한 가지씩 소량부터 확인한 뒤 메뉴에 섞어요.",
  underOne: "첫돌 전에는 꿀을 주지 않고, 마시는 우유 대신 모유나 영아용 분유를 계속 제공해요.",
  preparation: "통견과류나 단단하고 둥근 음식은 피하고, 음식에 소금·설탕이나 시판 양념을 넣지 않아요.",
  packageCheck: "가공 재료는 제품에 따라 달걀·우유·밀 등 원재료와 혼입 가능성이 달라요. 포장의 알레르기 표시를 확인하세요.",
  emergency: "입술·혀가 붓거나 숨쉬기 어렵거나, 갑자기 축 늘어지면 바로 119에 연락하세요.",
};

export const mealPlanEvidence: HealthEvidence = {
  checkedOn: "2026-11-13",
  scope: "이유식 식재료·질감·질식 예방·알레르기 표시와 안전한 조리",
  sources: [
    { title: "질병관리청 · 영유아 식이영양", url: "https://health.kdca.go.kr/healthinfo/biz/health/gnrlzHealthInfo/gnrlzHealthInfoView.do?cntnts_sn=5212" },
    { title: "NHS · 안전한 이유식 재료 준비", url: "https://www.nhs.uk/best-start-in-life/baby/weaning/safe-weaning/preparing-food-safely/" },
    { title: "NHS · 영유아 식품 알레르기", url: "https://www.nhs.uk/baby/weaning-and-feeding/food-allergies-in-babies-and-young-children/" },
    { title: "CDC · 피하거나 제한할 음식", url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/foods-and-drinks-to-avoid-or-limit.html" },
    { title: "FDA · 수은 함량이 낮은 생선 고르기", url: "https://www.fda.gov/media/152848/download" },
    { title: "FoodSafety.gov · 고기·달걀·생선의 안전한 조리", url: "https://www.foodsafety.gov/food-safety-charts/safe-minimum-internal-temperatures" },
  ],
};

export function getMealSafety(meal: MealItem) {
  const entries: IngredientSafety[] = meal.ingredients.map(name => ingredientSafety[name]);
  return {
    allergens: [...new Set(entries.flatMap(entry => entry.allergen ? [entry.allergen] : []))],
    prep: [...new Set(entries.map(entry => entry.prep))],
    checkLabel: entries.some(entry => entry.checkLabel),
  };
}

export const mealPlans: MealPlanData[] = [
  {
    "month": 6,
    "stage": "처음 먹기",
    "weeklyPlan": [
      {
        "day": "월",
        "meals": [
          {
            "meal": "오전",
            "menu": "브로콜리죽",
            "emoji": "🥦",
            "ingredients": ["쌀죽", "브로콜리"]
          },
          {
            "meal": "오후",
            "menu": "쌀미음",
            "emoji": "🍚",
            "ingredients": ["쌀미음"]
          }
        ]
      },
      {
        "day": "화",
        "meals": [
          {
            "meal": "오전",
            "menu": "애호박죽",
            "emoji": "🥒",
            "ingredients": ["쌀죽", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "감자미음",
            "emoji": "🥔",
            "ingredients": ["쌀미음", "감자"]
          }
        ]
      },
      {
        "day": "수",
        "meals": [
          {
            "meal": "오전",
            "menu": "당근죽",
            "emoji": "🥕",
            "ingredients": ["쌀죽", "당근"]
          },
          {
            "meal": "오후",
            "menu": "고구마미음",
            "emoji": "🍠",
            "ingredients": ["쌀미음", "고구마"]
          }
        ]
      },
      {
        "day": "목",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기미음",
            "emoji": "🥩",
            "ingredients": ["쌀죽", "소고기"]
          },
          {
            "meal": "오후",
            "menu": "브로콜리죽",
            "emoji": "🥦",
            "ingredients": ["쌀죽", "브로콜리"]
          }
        ]
      },
      {
        "day": "금",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기당근죽",
            "emoji": "🥩",
            "ingredients": ["쌀죽", "소고기", "당근"]
          },
          {
            "meal": "오후",
            "menu": "애호박죽",
            "emoji": "🥒",
            "ingredients": ["쌀죽", "애호박"]
          }
        ]
      },
      {
        "day": "토",
        "meals": [
          {
            "meal": "오전",
            "menu": "닭가슴살죽",
            "emoji": "🍗",
            "ingredients": ["쌀죽", "닭가슴살"]
          },
          {
            "meal": "오후",
            "menu": "감자죽",
            "emoji": "🥔",
            "ingredients": ["쌀죽", "감자"]
          }
        ]
      },
      {
        "day": "일",
        "meals": [
          {
            "meal": "오전",
            "menu": "배죽",
            "emoji": "🍐",
            "ingredients": ["쌀죽", "배"]
          },
          {
            "meal": "오후",
            "menu": "쌀죽",
            "emoji": "🍚",
            "ingredients": ["쌀죽"]
          }
        ]
      }
    ]
  },
  {
    "month": 7,
    "stage": "맛과 질감 넓히기",
    "weeklyPlan": [
      {
        "day": "월",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기감자죽",
            "emoji": "🥩",
            "ingredients": ["쌀죽", "소고기", "감자"]
          },
          {
            "meal": "오후",
            "menu": "두부브로콜리죽",
            "emoji": "🥦",
            "ingredients": ["쌀죽", "두부", "브로콜리"]
          }
        ]
      },
      {
        "day": "화",
        "meals": [
          {
            "meal": "오전",
            "menu": "닭가슴살애호박죽",
            "emoji": "🍗",
            "ingredients": ["쌀죽", "닭가슴살", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "고구마사과죽",
            "emoji": "🍠",
            "ingredients": ["쌀죽", "고구마", "사과"]
          }
        ]
      },
      {
        "day": "수",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기당근애호박죽",
            "emoji": "🥕",
            "ingredients": ["쌀죽", "소고기", "당근", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "바나나오트밀",
            "emoji": "🍌",
            "ingredients": ["오트밀", "바나나"]
          }
        ]
      },
      {
        "day": "목",
        "meals": [
          {
            "meal": "오전",
            "menu": "대구감자죽",
            "emoji": "🐟",
            "ingredients": ["쌀죽", "대구", "감자"]
          },
          {
            "meal": "오후",
            "menu": "완숙 달걀죽",
            "emoji": "🥚",
            "ingredients": ["쌀죽", "달걀"]
          }
        ]
      },
      {
        "day": "금",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기시금치죽",
            "emoji": "🥬",
            "ingredients": ["쌀죽", "소고기", "시금치"]
          },
          {
            "meal": "오후",
            "menu": "단호박죽",
            "emoji": "🎃",
            "ingredients": ["쌀죽", "단호박"]
          }
        ]
      },
      {
        "day": "토",
        "meals": [
          {
            "meal": "오전",
            "menu": "닭가슴살배죽",
            "emoji": "🍗",
            "ingredients": ["쌀죽", "닭가슴살", "배"]
          },
          {
            "meal": "오후",
            "menu": "두부당근죽",
            "emoji": "🥕",
            "ingredients": ["쌀죽", "두부", "당근"]
          }
        ]
      },
      {
        "day": "일",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기애호박죽",
            "emoji": "🥩",
            "ingredients": ["쌀죽", "소고기", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "감자치즈죽",
            "emoji": "🧀",
            "ingredients": ["쌀죽", "감자", "살균유 치즈"]
          }
        ]
      }
    ]
  },
  {
    "month": 8,
    "stage": "맛과 질감 넓히기",
    "weeklyPlan": [
      {
        "day": "월",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기애호박죽",
            "emoji": "🥩",
            "ingredients": ["쌀죽", "소고기", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "부드럽게 익힌 두부 + 감자죽",
            "emoji": "🥔",
            "ingredients": ["쌀죽", "두부", "감자"]
          }
        ]
      },
      {
        "day": "화",
        "meals": [
          {
            "meal": "오전",
            "menu": "닭가슴살리소토",
            "emoji": "🍗",
            "ingredients": ["쌀죽", "닭가슴살", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "바나나·완숙 달걀 쌀죽",
            "emoji": "🍌",
            "ingredients": ["쌀죽", "바나나", "달걀"]
          }
        ]
      },
      {
        "day": "수",
        "meals": [
          {
            "meal": "오전",
            "menu": "연어감자매시",
            "emoji": "🐟",
            "ingredients": ["감자", "연어", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "푹 익힌 당근 + 애호박죽",
            "emoji": "🥕",
            "ingredients": ["쌀죽", "당근", "애호박"]
          }
        ]
      },
      {
        "day": "목",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기미역죽",
            "emoji": "🥩",
            "ingredients": ["쌀죽", "소고기", "미역"]
          },
          {
            "meal": "오후",
            "menu": "으깬 고구마와 바나나",
            "emoji": "🍠",
            "ingredients": ["고구마", "바나나"]
          }
        ]
      },
      {
        "day": "금",
        "meals": [
          {
            "meal": "오전",
            "menu": "달걀찜 + 애호박죽",
            "emoji": "🥚",
            "ingredients": ["쌀죽", "달걀", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "으깬 두부와 브로콜리죽",
            "emoji": "🥦",
            "ingredients": ["쌀죽", "두부", "브로콜리"]
          }
        ]
      },
      {
        "day": "토",
        "meals": [
          {
            "meal": "오전",
            "menu": "닭가슴살애호박죽",
            "emoji": "🍗",
            "ingredients": ["쌀죽", "닭가슴살", "애호박"]
          },
          {
            "meal": "오후",
            "menu": "감자매시 + 익혀 으깬 사과",
            "emoji": "🍎",
            "ingredients": ["감자", "사과"]
          }
        ]
      },
      {
        "day": "일",
        "meals": [
          {
            "meal": "오전",
            "menu": "소고기단호박죽",
            "emoji": "🎃",
            "ingredients": ["쌀죽", "소고기", "단호박"]
          },
          {
            "meal": "오후",
            "menu": "오트밀 + 익혀 으깬 배",
            "emoji": "🍐",
            "ingredients": ["오트밀", "배"]
          }
        ]
      }
    ]
  },
  {
    "month": 9,
    "stage": "스스로 먹어보기",
    "weeklyPlan": [
      {
        "day": "월",
        "meals": [
          {
            "meal": "아침",
            "menu": "소고기애호박진밥",
            "emoji": "🥩",
            "ingredients": ["진밥", "소고기", "애호박"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살감자수프",
            "emoji": "🍗",
            "ingredients": ["감자", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "두부시금치무른밥",
            "emoji": "🥬",
            "ingredients": ["무른밥", "두부", "시금치"]
          }
        ]
      },
      {
        "day": "화",
        "meals": [
          {
            "meal": "아침",
            "menu": "달걀애호박볶음밥",
            "emoji": "🥚",
            "ingredients": ["무른밥", "달걀", "애호박"]
          },
          {
            "meal": "점심",
            "menu": "소고기미역무른밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "미역"]
          },
          {
            "meal": "저녁",
            "menu": "익혀 가시를 뺀 대구·애호박 무른밥",
            "emoji": "🐟",
            "ingredients": ["무른밥", "대구", "애호박"]
          }
        ]
      },
      {
        "day": "수",
        "meals": [
          {
            "meal": "아침",
            "menu": "감자치즈옴렛",
            "emoji": "🧀",
            "ingredients": ["감자", "달걀", "살균유 치즈"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살리소토",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "소고기당근무른밥",
            "emoji": "🥕",
            "ingredients": ["무른밥", "소고기", "당근"]
          }
        ]
      },
      {
        "day": "목",
        "meals": [
          {
            "meal": "아침",
            "menu": "오트밀 + 으깬 바나나",
            "emoji": "🍌",
            "ingredients": ["오트밀", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "소고기브로콜리 무른밥",
            "emoji": "🥦",
            "ingredients": ["무른밥", "소고기", "브로콜리"]
          },
          {
            "meal": "저녁",
            "menu": "으깬 두부 + 애호박밥",
            "emoji": "🥣",
            "ingredients": ["무른밥", "두부", "애호박"]
          }
        ]
      },
      {
        "day": "금",
        "meals": [
          {
            "meal": "아침",
            "menu": "달걀찜과 애호박 무른밥",
            "emoji": "🥚",
            "ingredients": ["무른밥", "달걀", "애호박"]
          },
          {
            "meal": "점심",
            "menu": "연어감자매시",
            "emoji": "🐟",
            "ingredients": ["감자", "연어", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "닭가슴살애호박수프",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "애호박"]
          }
        ]
      },
      {
        "day": "토",
        "meals": [
          {
            "meal": "아침",
            "menu": "고구마·완숙 달걀 쌀죽",
            "emoji": "🍠",
            "ingredients": ["쌀죽", "고구마", "달걀"]
          },
          {
            "meal": "점심",
            "menu": "소고기단호박밥",
            "emoji": "🎃",
            "ingredients": ["무른밥", "소고기", "단호박"]
          },
          {
            "meal": "저녁",
            "menu": "두부애호박무른밥",
            "emoji": "🥣",
            "ingredients": ["무른밥", "두부", "애호박"]
          }
        ]
      },
      {
        "day": "일",
        "meals": [
          {
            "meal": "아침",
            "menu": "바나나오트밀",
            "emoji": "🍌",
            "ingredients": ["오트밀", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살감자밥",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "감자"]
          },
          {
            "meal": "저녁",
            "menu": "소고기시금치밥",
            "emoji": "🥬",
            "ingredients": ["무른밥", "소고기", "시금치"]
          }
        ]
      }
    ]
  },
  {
    "month": 10,
    "stage": "스스로 먹어보기",
    "weeklyPlan": [
      {
        "day": "월",
        "meals": [
          {
            "meal": "아침",
            "menu": "소고기애호박밥 + 달걀찜",
            "emoji": "🥩",
            "ingredients": ["진밥", "소고기", "애호박", "달걀"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살애호박진밥",
            "emoji": "🍗",
            "ingredients": ["진밥", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "두부시금치밥 + 으깬 바나나",
            "emoji": "🥬",
            "ingredients": ["진밥", "두부", "시금치", "바나나"]
          }
        ]
      },
      {
        "day": "화",
        "meals": [
          {
            "meal": "아침",
            "menu": "완숙 달걀 감자옴렛 + 밀 식빵",
            "emoji": "🥚",
            "ingredients": ["감자", "달걀", "밀 식빵"]
          },
          {
            "meal": "점심",
            "menu": "소고기미역밥",
            "emoji": "🥩",
            "ingredients": ["진밥", "소고기", "미역"]
          },
          {
            "meal": "저녁",
            "menu": "익힌 대구 + 애호박밥",
            "emoji": "🐟",
            "ingredients": ["진밥", "대구", "애호박"]
          }
        ]
      },
      {
        "day": "수",
        "meals": [
          {
            "meal": "아침",
            "menu": "치즈리소토",
            "emoji": "🧀",
            "ingredients": ["진밥", "살균유 치즈", "애호박"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살애호박볶음밥",
            "emoji": "🍗",
            "ingredients": ["진밥", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "소고기브로콜리 진밥",
            "emoji": "🥦",
            "ingredients": ["진밥", "소고기", "브로콜리"]
          }
        ]
      },
      {
        "day": "목",
        "meals": [
          {
            "meal": "아침",
            "menu": "오트밀 + 바나나",
            "emoji": "🍌",
            "ingredients": ["오트밀", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "으깬 두부와 애호박진밥",
            "emoji": "🥣",
            "ingredients": ["진밥", "두부", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "소고기단호박진밥",
            "emoji": "🎃",
            "ingredients": ["진밥", "소고기", "단호박"]
          }
        ]
      },
      {
        "day": "금",
        "meals": [
          {
            "meal": "아침",
            "menu": "고구마·완숙 달걀 쌀죽",
            "emoji": "🍠",
            "ingredients": ["쌀죽", "고구마", "달걀"]
          },
          {
            "meal": "점심",
            "menu": "연어파스타",
            "emoji": "🐟",
            "ingredients": ["밀 파스타면", "연어", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "닭가슴살애호박밥",
            "emoji": "🍗",
            "ingredients": ["진밥", "닭가슴살", "애호박"]
          }
        ]
      },
      {
        "day": "토",
        "meals": [
          {
            "meal": "아침",
            "menu": "달걀·살균 우유로 익힌 밀 식빵",
            "emoji": "🍞",
            "ingredients": ["밀 식빵", "달걀", "우유(조리용)"]
          },
          {
            "meal": "점심",
            "menu": "소고기감자조림 + 밥",
            "emoji": "🥩",
            "ingredients": ["진밥", "소고기", "감자"]
          },
          {
            "meal": "저녁",
            "menu": "두부애호박볶음 + 밥",
            "emoji": "🥣",
            "ingredients": ["진밥", "두부", "애호박"]
          }
        ]
      },
      {
        "day": "일",
        "meals": [
          {
            "meal": "아침",
            "menu": "달걀애호박볶음밥",
            "emoji": "🥚",
            "ingredients": ["진밥", "달걀", "애호박"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살수프 + 빵",
            "emoji": "🍗",
            "ingredients": ["밀 식빵", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "소고기시금치밥",
            "emoji": "🥬",
            "ingredients": ["진밥", "소고기", "시금치"]
          }
        ]
      }
    ]
  },
  {
    "month": 11,
    "stage": "스스로 먹어보기",
    "weeklyPlan": [
      {
        "day": "월",
        "meals": [
          {
            "meal": "아침",
            "menu": "소고기애호박 무른밥 + 으깬 바나나",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "애호박", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "닭볶음밥",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "두부조림 + 밥 + 애호박",
            "emoji": "🥣",
            "ingredients": ["무른밥", "두부", "애호박"]
          }
        ]
      },
      {
        "day": "화",
        "meals": [
          {
            "meal": "아침",
            "menu": "완전히 익힌 달걀과 무른밥",
            "emoji": "🥚",
            "ingredients": ["무른밥", "달걀"]
          },
          {
            "meal": "점심",
            "menu": "소고기애호박 무른밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "익힌 대구 + 밥 + 익힌 시금치",
            "emoji": "🐟",
            "ingredients": ["무른밥", "대구", "시금치"]
          }
        ]
      },
      {
        "day": "수",
        "meals": [
          {
            "meal": "아침",
            "menu": "부드러운 밀 식빵과 살균유 치즈",
            "emoji": "🧀",
            "ingredients": ["밀 식빵", "살균유 치즈"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살비빔밥",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "소고기미역국 + 밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "미역"]
          }
        ]
      },
      {
        "day": "목",
        "meals": [
          {
            "meal": "아침",
            "menu": "감자수프 + 빵",
            "emoji": "🥔",
            "ingredients": ["감자", "밀 식빵", "우유(조리용)"]
          },
          {
            "meal": "점심",
            "menu": "두부애호박볶음밥",
            "emoji": "🥣",
            "ingredients": ["무른밥", "두부", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "닭가슴살스프 + 밥",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "애호박"]
          }
        ]
      },
      {
        "day": "금",
        "meals": [
          {
            "meal": "아침",
            "menu": "바나나·완숙 달걀 쌀죽",
            "emoji": "🍌",
            "ingredients": ["쌀죽", "바나나", "달걀"]
          },
          {
            "meal": "점심",
            "menu": "소고기애호박 무른밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "달걀찜 + 애호박밥",
            "emoji": "🥚",
            "ingredients": ["무른밥", "달걀", "애호박"]
          }
        ]
      },
      {
        "day": "토",
        "meals": [
          {
            "meal": "아침",
            "menu": "으깬 고구마와 바나나",
            "emoji": "🍠",
            "ingredients": ["고구마", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "새우볶음밥",
            "emoji": "🦐",
            "ingredients": ["무른밥", "새우", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "소고기감자조림 + 밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "감자"]
          }
        ]
      },
      {
        "day": "일",
        "meals": [
          {
            "meal": "아침",
            "menu": "오트밀죽과 으깬 바나나",
            "emoji": "🍌",
            "ingredients": ["오트밀", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살파스타",
            "emoji": "🍗",
            "ingredients": ["밀 파스타면", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "으깬 두부와 애호박 무른밥",
            "emoji": "🥣",
            "ingredients": ["무른밥", "두부", "애호박"]
          }
        ]
      }
    ]
  },
  {
    "month": 12,
    "stage": "가족과 함께 먹기",
    "weeklyPlan": [
      {
        "day": "월",
        "meals": [
          {
            "meal": "아침",
            "menu": "완전히 익힌 달걀과 밥 + 살균 전지우유",
            "emoji": "🥚",
            "ingredients": ["무른밥", "달걀", "살균 전지우유(컵)"]
          },
          {
            "meal": "점심",
            "menu": "소고기애호박밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "닭구이 + 밥 + 시금치",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "시금치"]
          }
        ]
      },
      {
        "day": "화",
        "meals": [
          {
            "meal": "아침",
            "menu": "밀 식빵과 살균유 치즈 + 바나나·살균 전지우유",
            "emoji": "🧀",
            "ingredients": ["밀 식빵", "살균유 치즈", "살균 전지우유(컵)", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "소고기비빔밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "익혀 가시를 뺀 대구와 애호박밥",
            "emoji": "🐟",
            "ingredients": ["무른밥", "대구", "애호박"]
          }
        ]
      },
      {
        "day": "수",
        "meals": [
          {
            "meal": "아침",
            "menu": "감자옴렛 + 살균 전지우유",
            "emoji": "🥔",
            "ingredients": ["감자", "달걀", "살균 전지우유(컵)"]
          },
          {
            "meal": "점심",
            "menu": "닭볶음밥 + 애호박",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "두부조림 + 밥 + 익힌 시금치",
            "emoji": "🥣",
            "ingredients": ["무른밥", "두부", "시금치"]
          }
        ]
      },
      {
        "day": "목",
        "meals": [
          {
            "meal": "아침",
            "menu": "바나나·완숙 달걀 쌀죽 + 살균 전지우유",
            "emoji": "🍌",
            "ingredients": ["쌀죽", "바나나", "달걀", "살균 전지우유(컵)"]
          },
          {
            "meal": "점심",
            "menu": "소고기미역국 + 밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "미역"]
          },
          {
            "meal": "저녁",
            "menu": "완숙 달걀찜과 애호박밥",
            "emoji": "🥚",
            "ingredients": ["무른밥", "달걀", "애호박"]
          }
        ]
      },
      {
        "day": "금",
        "meals": [
          {
            "meal": "아침",
            "menu": "으깬 고구마 + 살균 전지우유 + 으깬 바나나",
            "emoji": "🍠",
            "ingredients": ["고구마", "살균 전지우유(컵)", "바나나"]
          },
          {
            "meal": "점심",
            "menu": "연어파스타",
            "emoji": "🐟",
            "ingredients": ["밀 파스타면", "연어", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "닭가슴살스프 + 빵",
            "emoji": "🍗",
            "ingredients": ["밀 식빵", "닭가슴살", "애호박"]
          }
        ]
      },
      {
        "day": "토",
        "meals": [
          {
            "meal": "아침",
            "menu": "완전히 익힌 달걀 밀 식빵 + 살균 전지우유",
            "emoji": "🍞",
            "ingredients": ["밀 식빵", "달걀", "우유(조리용)", "살균 전지우유(컵)"]
          },
          {
            "meal": "점심",
            "menu": "소고기감자조림 + 밥",
            "emoji": "🥩",
            "ingredients": ["무른밥", "소고기", "감자"]
          },
          {
            "meal": "저녁",
            "menu": "두부애호박볶음 + 밥",
            "emoji": "🥣",
            "ingredients": ["무른밥", "두부", "애호박"]
          }
        ]
      },
      {
        "day": "일",
        "meals": [
          {
            "meal": "아침",
            "menu": "오트밀 + 으깬 바나나 + 살균 전지우유",
            "emoji": "🍌",
            "ingredients": ["오트밀", "바나나", "살균 전지우유(컵)"]
          },
          {
            "meal": "점심",
            "menu": "닭가슴살애호박밥",
            "emoji": "🍗",
            "ingredients": ["무른밥", "닭가슴살", "애호박"]
          },
          {
            "meal": "저녁",
            "menu": "소고기시금치밥",
            "emoji": "🥬",
            "ingredients": ["무른밥", "소고기", "시금치"]
          }
        ]
      }
    ]
  }
];

export function getMealPlanForMonth(month: number): MealPlanData | undefined {
  return mealPlans.find(plan => plan.month === month);
}
