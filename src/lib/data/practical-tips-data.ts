import type { HealthEvidence } from "./health-faq-data";
import { parentingTipRevisions } from "./parenting-tip-revisions";

export const tipSources = {
  sleep: { title: "NHS · 아기 수면과 밤 돌봄", url: "https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/" },
  safe: { title: "NIH · 안전한 수면 환경", url: "https://safetosleep.nichd.nih.gov/reduce-risk/safe-sleep-environment" },
  bottle: { title: "NHS · 젖병 수유 방법", url: "https://www.nhs.uk/baby/breastfeeding-and-bottle-feeding/bottle-feeding/advice/" },
  cry: { title: "NHS · 우는 아기 달래기", url: "https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/" },
  play: { title: "CDC · 2개월 아기와 상호작용", url: "https://www.cdc.gov/act-early/milestones/2-months.html" },
  solids: { title: "CDC · 이유식 시작과 음식 소개", url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/when-what-and-how-to-introduce-solid-foods.html" },
  choke: { title: "CDC · 음식으로 인한 질식 예방", url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html" },
  teeth: { title: "NHS · 이앓이 돌봄", url: "https://www.nhs.uk/baby/babys-development/teething/tips-for-helping-your-teething-baby/" },
  separation: { title: "HSE · 분리불안 돌봄", url: "https://www2.hse.ie/babies-children/checks-milestones/social-emotional-behavioural/separation-anxiety/" },
  car: { title: "NHTSA · 아기 카시트 선택과 설치", url: "https://www.nhtsa.gov/vehicle-safety/car-seats-and-booster-seats" },
  sun: { title: "NHS · 아기의 여름 안전", url: "https://www.nhs.uk/baby/first-aid-and-safety/safety/safety-in-the-sun/" },
  hygiene: { title: "CDC · 수유용품 세척", url: "https://www.cdc.gov/hygiene/about/clean-sanitize-store-infant-feeding-items.html" },
} as const;

export interface PracticalTip {
  key: string;
  title: string;
  takeaway: string;
  steps: string[];
  caution: string;
  sourceKeys: (keyof typeof tipSources)[];
  minMonth: number;
  category: "sleep_tips" | "feeding_tips" | "crying_tips" | "outing_tips";
}

// Editorial examples based on public guidance, not individual medical instructions.
// Age selection is a browsing aid; readiness and individual care instructions take priority.
export const practicalTips: PracticalTip[] = [
  { key: "night-light", category: "sleep_tips", minMonth: 0, title: "밤 수유 뒤, 아기가 또렷해진다면", takeaway: "조명과 대화를 낮 모드와 다르게 해보세요.", steps: ["수유할 수 있을 만큼만 조명을 켜고, 말소리는 작게 유지해요.", "필요한 수유·기저귀 돌봄을 마치면 놀이를 시작하지 않고 잠자리로 돌아가요."], caution: "밤에도 수유가 필요할 수 있어요. 통잠을 위해 수유를 미루거나 끊지 마세요.", sourceKeys: ["sleep"] },
  { key: "transfer", category: "sleep_tips", minMonth: 0, title: "안고 있다가 나도 졸리기 시작할 때", takeaway: "소파에서 버티기 전에 아기 잠자리로 옮겨요.", steps: ["수유·안기를 시작하기 전에 아기 잠자리를 비워두세요.", "졸음이 오면 아기를 단단하고 평평한 별도 수면 면에 등을 대고 눕혀요. 가능하면 다른 보호자와 교대해요."], caution: "소파·안락의자에서 아기를 안은 채 잠들지 마세요. 베개·인형·느슨한 이불도 잠자리에서 치워요.", sourceKeys: ["safe"] },
  { key: "sleep-reset", category: "sleep_tips", minMonth: 0, title: "재우는 방법을 계속 바꾸고 있다면", takeaway: "목욕부터 모두 하기보다, 짧은 마무리를 골라요.", steps: ["조명 낮추기와 조용한 목소리처럼 부담 없는 행동을 골라 같은 순서로 해봐요.", "목욕이 오히려 아기를 흥분시키면 취침 직전 순서에서 빼도 괜찮아요."], caution: "정해진 순서를 지키느라 배고픔·불편함에 대한 돌봄을 늦추지 마세요. 잠드는 시각과 방법에는 개인차가 있어요.", sourceKeys: ["sleep", "cry"] },
  { key: "short-nap", category: "sleep_tips", minMonth: 3, title: "짧은 낮잠 한 번에 일과가 밀렸을 때", takeaway: "오늘의 시각보다 아기의 다음 상태를 살펴요.", steps: ["잠든 시각·깬 시각과 깬 뒤 상태를 간단히 남겨요.", "이후 놀이와 외출을 줄이거나 조용한 돌봄으로 바꿔봐요. 예시 시간표를 맞추려고 깨어 있게 하지 않아요."], caution: "짧은 낮잠만으로 수면 문제를 판단하지 않아요. 수유·성장·컨디션이 함께 걱정되면 의료진과 상의해요.", sourceKeys: ["sleep"] },
  { key: "empty-bed", category: "sleep_tips", minMonth: 0, title: "잠자리엔 무엇까지 넣어도 될까요?", takeaway: "애착 인형은 깨어 있을 때, 잠자리는 비워요.", steps: ["재우기 전에 베개·범퍼·인형·느슨한 담요가 남아 있는지 확인해요.", "단단하고 평평한 수면 면에 맞는 시트만 사용하고, 등을 대고 눕혀요."], caution: "기울인 쿠션이나 자세 고정 제품으로 잠자는 자세를 만들지 마세요.", sourceKeys: ["safe"] },
  { key: "travel-bed", category: "sleep_tips", minMonth: 0, title: "숙소에 아기 침대가 있다고 해도", takeaway: "예약 전에 실제 수면 면과 침구를 확인해요.", steps: ["숙소에 아기용 잠자리 사진을 요청해 단단하고 평평한지 확인해요.", "푹신한 덧매트·베개·인형을 더하지 않아요. 이동 중 카시트에서 잠들면 도착 후 안전한 잠자리로 옮겨요."], caution: "성인 침대의 가장자리를 베개로 막아 아기 침대처럼 사용하지 마세요.", sourceKeys: ["safe"] },
  { key: "bottle-flow", category: "feeding_tips", minMonth: 0, title: "젖병을 먹다 우유가 입가로 샐 때", takeaway: "더 먹이기보다 자세와 흐르는 속도를 확인해요.", steps: ["머리와 목을 받쳐 상체를 약간 세워 안고, 젖병은 거의 수평으로 기울여요.", "아기가 쉬려 하면 수유를 잠깐 멈춰요. 젖꼭지 구멍이 너무 크거나 유속이 빠른지도 확인해요."], caution: "젖병을 받쳐 혼자 먹게 하지 마세요. 사레가 반복되거나 호흡·먹는 상태가 걱정되면 진료를 받아요.", sourceKeys: ["bottle"] },
  { key: "bottle-end", category: "feeding_tips", minMonth: 0, title: "젖병에 조금 남았는데 더 먹여야 할까요?", takeaway: "남은 눈금보다 아기가 멈추려는 신호를 봐요.", steps: ["빨기를 멈추거나 고개를 돌리면 쉬게 하고, 남은 양을 억지로 마무리하지 않아요.", "다음 수유를 위해 먹다 남은 우유를 보관하지 않고 버려요."], caution: "섭취가 계속 줄거나 젖은 기저귀·성장 상태가 걱정되면 의료진과 상의해요. 개별 수유 안내가 있으면 우선해요.", sourceKeys: ["bottle"] },
  { key: "latch", category: "feeding_tips", minMonth: 0, title: "수유할 때마다 통증을 참고 있다면", takeaway: "참고 견디기보다 젖물림을 함께 확인받아요.", steps: ["통증이 언제 생기는지, 아기가 먹는 동안 어떤 모습인지 간단히 적어두세요.", "수유 자세·젖물림을 의료진이나 수유 전문가에게 직접 보여주고 도움을 요청해요."], caution: "통증이 계속되거나 상처·먹는 상태가 걱정되면 진료를 받아요. 참고 견뎌야 정상인 것은 아니에요.", sourceKeys: ["cry"] },
  { key: "feeding-kit", category: "feeding_tips", minMonth: 0, title: "수유용품, 씻은 뒤 어디에 두나요?", takeaway: "물기를 닦기보다 깨끗한 곳에서 충분히 말려요.", steps: ["젖병·젖꼭지·부품은 분리해 세척하고, 깨끗한 전용 공간에서 공기 중에 말려요.", "완전히 마른 뒤 깨끗한 손으로 조립·보관해요. 제품별 세척·소독 방법도 확인해요."], caution: "행주로 문질러 말리지 않아요. 미숙아·면역이 약한 아기는 의료진의 별도 위생 안내를 따라요.", sourceKeys: ["hygiene"] },
  { key: "ready", category: "feeding_tips", minMonth: 4, title: "음식에 손을 뻗으면 이유식을 시작할까요?", takeaway: "관심만 보지 말고 앉기·머리 조절·삼키기도 봐요.", steps: ["일반적인 시작 시기는 생후 약 6개월이에요. 지지받아 앉고 머리와 목을 조절하는지 살펴요.", "음식을 입 밖으로 밀어내기보다 삼키는지 등 준비 상태를 함께 확인하고, 이른 시작이 필요하면 의료진과 상의해요."], caution: "숟가락이나 음식에 관심을 보이는 것 하나만으로 준비 완료로 판단하지 않아요. 생후 4개월 전 시작은 권하지 않아요.", sourceKeys: ["solids"] },
  { key: "first-food", category: "feeding_tips", minMonth: 6, title: "첫 음식, 꼭 쌀미음부터 시작해야 할까요?", takeaway: "정해진 재료 순서보다 안전한 질감과 다양성이 중요해요.", steps: ["준비가 된 아기에게 부드럽게 으깨거나 퓌레로 만든 음식을 시도해요.", "곡류만 반복하기보다 고기·채소 등 여러 식품군을 안전하게 소개해요. 새 재료는 처음에 한 가지씩 확인해요."], caution: "모유·분유를 바로 대체하는 식사가 아니에요. 아기의 먹는 능력과 개별 영양 안내에 맞춰요.", sourceKeys: ["solids"] },
  { key: "allergen", category: "feeding_tips", minMonth: 6, title: "새 음식 반응을 나중에 확인하기 어렵다면", takeaway: "재료·먹은 시각·반응을 한 줄로 남겨요.", steps: ["처음 먹는 재료는 한 가지씩 소개하고, 재료명·시각과 피부·구토 등 변화를 기록해요.", "심한 습진이나 계란 알레르기가 있는 아기의 땅콩 도입은 먼저 의료진과 상의해요."], caution: "통견과류나 되직한 땅콩버터 덩어리는 주지 않아요. 호흡곤란·의식 저하가 생기면 119로 즉시 도움을 요청해요.", sourceKeys: ["solids", "choke"] },
  { key: "texture", category: "feeding_tips", minMonth: 6, title: "음식 크기만 작게 자르면 안전할까요?", takeaway: "작기만 한 조각보다 부드러움·모양을 함께 봐요.", steps: ["먹는 능력에 맞게 충분히 익혀 으깨거나 적절한 질감으로 준비해요.", "단단한 생채소·둥근 과일 통째·통견과류·뼈와 질긴 고기 등 위험한 재료와 모양을 먼저 걸러요."], caution: "먹을 때는 똑바로 앉히고 곁에서 계속 지켜봐요. 이동 중 차나 유모차에서 음식을 주지 마세요.", sourceKeys: ["solids", "choke"] },
  { key: "new-food", category: "feeding_tips", minMonth: 6, title: "처음 준 음식을 바로 뱉어냈을 때", takeaway: "새 질감에 익숙해지는 과정일 수 있어요.", steps: ["한 번의 반응을 좋아함·싫어함으로 단정하지 않고, 먹는 능력에 맞는 질감을 확인해요.", "억지로 더 넣지 않고 다른 날 편안한 식사 기회에 다시 소개해요."], caution: "지속적인 삼킴 어려움·반복되는 기침이나 먹는 상태가 걱정되면 전문가에게 확인받아요.", sourceKeys: ["solids", "bottle"] },
  { key: "self-feed", category: "feeding_tips", minMonth: 6, title: "혼자 먹겠다고 숟가락을 잡아당길 때", takeaway: "안전한 자세에서 탐색할 여유를 남겨요.", steps: ["안전한 의자에 똑바로 앉힌 뒤 아기가 잡을 수 있는 식기를 준비해요.", "아기의 먹는 능력에 맞는 부드러운 음식을 주고 가까이서 관찰해요. 급하게 입에 넣지 않아요."], caution: "스스로 먹는다고 질식 위험이 사라지지 않아요. 음식을 문 채 기거나 걷게 하지 마세요.", sourceKeys: ["choke", "solids"] },
  { key: "milk-transition", category: "feeding_tips", minMonth: 10, title: "돌 전후, 우유를 미리 바꿔도 될까요?", takeaway: "첫돌 전에는 일반 우유를 주 음료로 바꾸지 않아요.", steps: ["첫돌 전에는 모유·영아용 분유를 일반 우유로 대체하지 않아요.", "돌 이후의 음료 전환과 양은 식사·성장 상태, 알레르기 등 개별 상황을 함께 살펴 의료진과 상의해요."], caution: "식단 예시의 숫자만 보고 수유를 끊거나 우유를 정해진 양까지 억지로 먹이지 않아요.", sourceKeys: ["solids"] },
  { key: "overstim", category: "crying_tips", minMonth: 0, title: "달래려고 할수록 더 보챈다면", takeaway: "음악·장난감·흔들기를 한꺼번에 더하지 않아요.", steps: ["켜둔 화면·소리를 줄이고, 한 보호자가 조용한 목소리로 안아봐요.", "아기가 편안해하는지 보면서 방법을 하나씩 바꿔요. 더 자극하면 계속 깨어 있을 수 있어요."], caution: "평소와 다른 울음·발열·수유 저하를 단순 보챔으로 넘기지 마세요. 아기를 세게 흔들면 안 돼요.", sourceKeys: ["cry"] },
  { key: "parent-pause", category: "crying_tips", minMonth: 0, title: "울음 때문에 나도 한계가 느껴질 때", takeaway: "아기를 안전하게 눕힌 뒤 도움을 요청해요.", steps: ["아기를 비어 있는 안전한 아기 잠자리에 등을 대고 눕혀요.", "잠깐 떨어져 마음을 가라앉히고, 믿을 수 있는 사람에게 교대를 요청해요. 다시 상태를 확인해요."], caution: "아기를 흔들거나 소파·침대 위에 혼자 두지 마세요. 호흡곤란·반응 저하 등 응급 징후는 119로 도움을 요청해요.", sourceKeys: ["play", "safe"] },
  { key: "turn-talk", category: "crying_tips", minMonth: 0, title: "계속 말을 걸어야 발달에 좋을까요?", takeaway: "아기가 대답할 빈틈도 대화의 일부예요.", steps: ["편안하게 깨어 있을 때 얼굴을 보며 아기가 낸 소리를 따라 해봐요.", "말을 멈추고 표정이나 소리를 기다려요. 고개를 돌리거나 피곤해하면 쉬어요."], caution: "반응을 끌어내려고 큰 소리·화면 자극을 더하거나, 발달을 시험하듯 반복하지 않아요.", sourceKeys: ["play"] },
  { key: "tummy", category: "crying_tips", minMonth: 0, title: "터미타임을 싫어해서 자꾸 미뤄진다면", takeaway: "길게 버티기보다 깨어 있을 때 짧게 나눠요.", steps: ["아기가 깨어 있고 보호자가 바로 곁에서 지켜볼 때 짧게 엎드려 놀게 해요.", "눈높이에서 얼굴이나 장난감을 보여주고, 힘들어하면 쉬었다 다음 기회에 해봐요."], caution: "잠들면 등을 대고 안전한 잠자리로 옮겨요. 엎드린 자세는 수면 자세가 아니에요.", sourceKeys: ["play", "safe"] },
  { key: "teether", category: "crying_tips", minMonth: 4, title: "치발기는 얼마나 차갑게 해야 할까요?", takeaway: "제품 안내에 따라 냉장하고, 냉동은 피하세요.", steps: ["냉장 가능한 제품인지 확인하고 설명서에 적힌 방법대로 식혀요.", "사용 전 손상된 부분을 확인하고 보호자가 지켜보는 동안 사용해요."], caution: "얼린 치발기나 목에 거는 끈은 사용하지 않아요. 발열·설사를 이앓이로 단정하지 말고 상태를 확인받아요.", sourceKeys: ["teeth"] },
  { key: "goodbye", category: "crying_tips", minMonth: 5, title: "잠깐 헤어질 때마다 몰래 나가게 된다면", takeaway: "짧고 익숙한 작별 인사를 만들어봐요.", steps: ["익숙한 보호자가 함께 있는 상황에서 짧은 분리부터 시도해요.", "같은 말과 포옹으로 인사하고, 돌아온 뒤 따뜻하게 반겨요. 새 장소와 사람에게 익숙해질 시간을 줘요."], caution: "울지 않는 것을 목표로 억지로 떨어뜨리거나 혼자 두지 않아요. 월령만으로 분리불안을 판단하지 않아요.", sourceKeys: ["separation"] },
  { key: "handover", category: "crying_tips", minMonth: 0, title: "보호자가 바뀔 때 설명할 것이 많다면", takeaway: "오늘 잘 먹고·쉬고·진정했던 방법만 공유해요.", steps: ["수유·잠·불편했던 상황과 도움이 됐던 돌봄을 짧게 메모해요.", "교대할 때 그 메모와 안전한 잠자리 위치를 함께 확인해요."], caution: "가족 모두가 똑같은 방법을 써야 울음이 멈추는 것은 아니에요. 평소와 다른 증상도 꼭 공유해요.", sourceKeys: ["cry", "sleep", "safe"] },
  { key: "bag", category: "outing_tips", minMonth: 0, title: "기저귀 가방에서 늘 필요한 걸 못 찾는다면", takeaway: "갈아입기 한 번에 필요한 물건을 한 묶음으로요.", steps: ["기저귀·닦을 용품·여벌옷을 꺼내기 쉬운 한 칸에 묶어봐요.", "수유용품과 사용한 물건을 분리하고, 외출 후 쓴 물건만 채워두면 다음 준비가 간단해져요."], caution: "정해진 필수 개수는 없어요. 외출 길이·수유 방식에 맞춰 준비하는 생활 아이디어예요.", sourceKeys: [] },
  { key: "shade", category: "outing_tips", minMonth: 0, title: "유모차에 담요를 덮어 햇빛을 가린다면", takeaway: "담요 대신 통풍되는 차양과 그늘을 활용해요.", steps: ["유모차 차양과 그늘을 이용하고 안쪽 공기가 통하는지 확인해요.", "더운 날은 아기의 상태를 자주 살피고, 햇빛이 강한 시간대의 외출을 조절해요."], caution: "담요로 유모차를 덮으면 열이 갇힐 수 있어요. 특히 생후 6개월 미만은 직사광선을 피해주세요.", sourceKeys: ["sun"] },
  { key: "car-seat", category: "outing_tips", minMonth: 0, title: "카시트 각도와 벨트, 숫자로 외우고 있다면", takeaway: "제품 설명서와 아기 체격에 맞춰 확인해요.", steps: ["아기에게 맞는 뒤보기 카시트를 고르고 제조사의 키·체중 제한과 설치 방법을 확인해요.", "차량 설명서도 함께 보고, 하네스 위치와 조임은 해당 제품 안내에 맞춰요."], caution: "모든 제품에 같은 각도·손가락 개수를 적용하지 않아요. 카시트를 집 안의 일상 잠자리로 사용하지 마세요.", sourceKeys: ["car", "safe"] },
  { key: "toy-check", category: "outing_tips", minMonth: 0, title: "외출 장난감에 끈을 달기 전 확인할 것", takeaway: "분리되는 작은 부품과 목에 걸릴 끈을 먼저 봐요.", steps: ["씹거나 당겼을 때 떨어지는 부품, 깨진 부분, 작은 물건이 있는지 확인해요.", "장난감·치발기를 아기의 목에 걸지 않고, 제품이 정한 사용 방식으로만 사용해요."], caution: "잠자리에는 장난감과 끈을 남기지 않아요. 치발기를 목에 매다는 것은 위험해요.", sourceKeys: ["teeth", "safe"] },
  { key: "food-out", category: "outing_tips", minMonth: 6, title: "이동 중 보채서 간식을 주고 싶을 때", takeaway: "차를 멈추고 안전하게 앉아 먹을 자리를 찾아요.", steps: ["출발 전에 안전한 식사 장소와 의자를 확인해요.", "식사·간식은 아기를 똑바로 앉히고 보호자가 바로 지켜보는 자리에서 줘요."], caution: "차나 유모차로 이동하면서 먹이지 않아요. 보챔을 멈추려고 입에 음식을 넣지 마세요.", sourceKeys: ["choke"] },
  { key: "room-scan", category: "outing_tips", minMonth: 5, title: "낯선 공간에 내려놓기 전, 바닥부터 봐요", takeaway: "작은 물건과 수면 공간을 먼저 확인해요.", steps: ["아기 손이 닿을 곳에 작은 부품·음식 조각이 없는지 낮은 위치에서 확인해요.", "잠을 잘 장소는 놀이 공간과 구분해 안전한 수면 면을 준비해요."], caution: "작은 물건을 입에 넣거나 음식 조각을 집어 먹지 않도록 곁에서 관찰해요. 익숙하지 않은 공간에서는 더 자주 확인해요.", sourceKeys: ["choke", "safe"] },
];

export function practicalEvidence(tip: PracticalTip): HealthEvidence | undefined {
  if (!tip.sourceKeys.length) return undefined;
  return { sources: tip.sourceKeys.map(key => tipSources[key]), checkedOn: "2026-11-06", scope: "이 팁의 돌봄·안전 표현. 생활 구성 예시는 편집 제안" };
}
export function practicalContent(tip: PracticalTip) {
  return [tip.takeaway, ...tip.steps.map((step, i) => `${i + 1}. ${step}`), `주의: ${tip.caution}`].join("\n\n");
}
export function getPracticalTip(key: string) { return practicalTips.find(tip => tip.key === key); }
export function getMonthPracticalTips(month: number) {
  return parentingTipRevisions.filter(item => item.month === month).flatMap(item => {
    const tip = getPracticalTip(item.key);
    return tip ? [{ id: item.id, month_id: month, category: item.category, title: tip.title, content: practicalContent(tip), practical: tip, evidence: practicalEvidence(tip) }] : [];
  });
}
