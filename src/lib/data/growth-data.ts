// WHO Child Growth Standards (0-12 months)
// Source: WHO Multicentre Growth Reference Study (MGRS)
// Values are 50th percentile (median) for each month

export interface GrowthDataPoint {
  month: number;
  label: string;
  maleHeight: number; // cm
  femaleHeight: number; // cm
  maleWeight: number; // kg
  femaleWeight: number; // kg
  maleHead: number; // cm (head circumference)
  femaleHead: number; // cm
}

// WHO 50th percentile growth data
export const growthData: GrowthDataPoint[] = [
  { month: 0, label: "출생", maleHeight: 49.9, femaleHeight: 49.1, maleWeight: 3.3, femaleWeight: 3.2, maleHead: 34.5, femaleHead: 33.9 },
  { month: 1, label: "1개월", maleHeight: 54.7, femaleHeight: 53.7, maleWeight: 4.5, femaleWeight: 4.2, maleHead: 37.3, femaleHead: 36.5 },
  { month: 2, label: "2개월", maleHeight: 58.4, femaleHeight: 57.1, maleWeight: 5.6, femaleWeight: 5.1, maleHead: 39.1, femaleHead: 38.3 },
  { month: 3, label: "3개월", maleHeight: 61.4, femaleHeight: 59.8, maleWeight: 6.4, femaleWeight: 5.8, maleHead: 40.5, femaleHead: 39.5 },
  { month: 4, label: "4개월", maleHeight: 63.9, femaleHeight: 62.1, maleWeight: 7.0, femaleWeight: 6.4, maleHead: 41.6, femaleHead: 40.6 },
  { month: 5, label: "5개월", maleHeight: 65.9, femaleHeight: 64.0, maleWeight: 7.5, femaleWeight: 6.9, maleHead: 42.6, femaleHead: 41.5 },
  { month: 6, label: "6개월", maleHeight: 67.6, femaleHeight: 65.7, maleWeight: 7.9, femaleWeight: 7.3, maleHead: 43.3, femaleHead: 42.2 },
  { month: 7, label: "7개월", maleHeight: 69.2, femaleHeight: 67.3, maleWeight: 8.3, femaleWeight: 7.6, maleHead: 44.0, femaleHead: 42.8 },
  { month: 8, label: "8개월", maleHeight: 70.6, femaleHeight: 68.7, maleWeight: 8.6, femaleWeight: 7.9, maleHead: 44.5, femaleHead: 43.4 },
  { month: 9, label: "9개월", maleHeight: 72.0, femaleHeight: 70.1, maleWeight: 8.9, femaleWeight: 8.2, maleHead: 45.0, femaleHead: 43.8 },
  { month: 10, label: "10개월", maleHeight: 73.3, femaleHeight: 71.5, maleWeight: 9.2, femaleWeight: 8.5, maleHead: 45.4, femaleHead: 44.2 },
  { month: 11, label: "11개월", maleHeight: 74.5, femaleHeight: 72.8, maleWeight: 9.4, femaleWeight: 8.7, maleHead: 45.8, femaleHead: 44.6 },
  { month: 12, label: "12개월", maleHeight: 75.7, femaleHeight: 74.0, maleWeight: 9.6, femaleWeight: 8.9, maleHead: 46.1, femaleHead: 44.9 },
];

// 3rd and 97th percentile ranges for reference bands
export const growthRanges: Record<string, Record<string, { month: number; p3: number; p97: number }[]>> = {
  male: {
    height: [
      { month: 0, p3: 46.3, p97: 53.4 },
      { month: 1, p3: 51.1, p97: 58.4 },
      { month: 2, p3: 54.7, p97: 62.2 },
      { month: 3, p3: 57.6, p97: 65.3 },
      { month: 4, p3: 60.0, p97: 67.8 },
      { month: 5, p3: 61.9, p97: 69.9 },
      { month: 6, p3: 63.6, p97: 71.6 },
      { month: 7, p3: 65.1, p97: 73.2 },
      { month: 8, p3: 66.5, p97: 74.7 },
      { month: 9, p3: 67.7, p97: 76.2 },
      { month: 10, p3: 69.0, p97: 77.6 },
      { month: 11, p3: 70.2, p97: 78.9 },
      { month: 12, p3: 71.3, p97: 80.2 },
    ],
    weight: [
      { month: 0, p3: 2.5, p97: 4.3 },
      { month: 1, p3: 3.4, p97: 5.7 },
      { month: 2, p3: 4.3, p97: 7.1 },
      { month: 3, p3: 5.0, p97: 8.0 },
      { month: 4, p3: 5.6, p97: 8.7 },
      { month: 5, p3: 6.0, p97: 9.3 },
      { month: 6, p3: 6.4, p97: 9.8 },
      { month: 7, p3: 6.7, p97: 10.2 },
      { month: 8, p3: 6.9, p97: 10.5 },
      { month: 9, p3: 7.1, p97: 10.9 },
      { month: 10, p3: 7.4, p97: 11.2 },
      { month: 11, p3: 7.6, p97: 11.5 },
      { month: 12, p3: 7.7, p97: 11.8 },
    ],
    head: [
      { month: 0, p3: 32.1, p97: 36.9 },
      { month: 1, p3: 35.1, p97: 39.5 },
      { month: 2, p3: 36.9, p97: 41.3 },
      { month: 3, p3: 38.3, p97: 42.7 },
      { month: 4, p3: 39.4, p97: 43.8 },
      { month: 5, p3: 40.3, p97: 44.8 },
      { month: 6, p3: 41.0, p97: 45.6 },
      { month: 7, p3: 41.7, p97: 46.3 },
      { month: 8, p3: 42.2, p97: 46.9 },
      { month: 9, p3: 42.6, p97: 47.4 },
      { month: 10, p3: 43.0, p97: 47.8 },
      { month: 11, p3: 43.4, p97: 48.2 },
      { month: 12, p3: 43.6, p97: 48.5 },
    ],
  },
  female: {
    height: [
      { month: 0, p3: 45.6, p97: 52.7 },
      { month: 1, p3: 50.0, p97: 57.4 },
      { month: 2, p3: 53.2, p97: 61.0 },
      { month: 3, p3: 55.8, p97: 63.8 },
      { month: 4, p3: 57.9, p97: 66.2 },
      { month: 5, p3: 59.6, p97: 68.2 },
      { month: 6, p3: 61.0, p97: 70.0 },
      { month: 7, p3: 62.5, p97: 71.6 },
      { month: 8, p3: 63.7, p97: 73.2 },
      { month: 9, p3: 64.9, p97: 74.7 },
      { month: 10, p3: 66.1, p97: 76.1 },
      { month: 11, p3: 67.2, p97: 77.5 },
      { month: 12, p3: 68.2, p97: 78.9 },
    ],
    weight: [
      { month: 0, p3: 2.4, p97: 4.2 },
      { month: 1, p3: 3.2, p97: 5.4 },
      { month: 2, p3: 3.9, p97: 6.5 },
      { month: 3, p3: 4.5, p97: 7.4 },
      { month: 4, p3: 5.0, p97: 8.1 },
      { month: 5, p3: 5.4, p97: 8.7 },
      { month: 6, p3: 5.7, p97: 9.2 },
      { month: 7, p3: 6.0, p97: 9.6 },
      { month: 8, p3: 6.3, p97: 10.0 },
      { month: 9, p3: 6.5, p97: 10.4 },
      { month: 10, p3: 6.7, p97: 10.7 },
      { month: 11, p3: 6.9, p97: 11.0 },
      { month: 12, p3: 7.0, p97: 11.3 },
    ],
    head: [
      { month: 0, p3: 31.7, p97: 36.1 },
      { month: 1, p3: 34.3, p97: 38.8 },
      { month: 2, p3: 36.0, p97: 40.5 },
      { month: 3, p3: 37.2, p97: 41.9 },
      { month: 4, p3: 38.2, p97: 43.0 },
      { month: 5, p3: 39.0, p97: 43.9 },
      { month: 6, p3: 39.7, p97: 44.6 },
      { month: 7, p3: 40.4, p97: 45.3 },
      { month: 8, p3: 40.9, p97: 45.9 },
      { month: 9, p3: 41.3, p97: 46.3 },
      { month: 10, p3: 41.7, p97: 46.7 },
      { month: 11, p3: 42.0, p97: 47.1 },
      { month: 12, p3: 42.3, p97: 47.5 },
    ],
  },
};

// Korean National Immunization Schedule (국가예방접종)
// Source: 질병관리청 (KDCA)
export interface Vaccination {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  doses: VaccinationDose[];
}

export interface VaccinationDose {
  doseNumber: number;
  doseLabel: string;
  monthStart: number;
  monthEnd: number;
  note?: string;
}

export const vaccinations: Vaccination[] = [
  {
    id: "bcg",
    name: "결핵",
    nameEn: "BCG",
    description: "피내용, 출생 후 4주 이내 접종",
    doses: [
      { doseNumber: 1, doseLabel: "1회", monthStart: 0, monthEnd: 1 },
    ],
  },
  {
    id: "hepb",
    name: "B형간염",
    nameEn: "HepB",
    description: "총 3회 접종",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 0, monthEnd: 0 },
      { doseNumber: 2, doseLabel: "2차", monthStart: 1, monthEnd: 1 },
      { doseNumber: 3, doseLabel: "3차", monthStart: 6, monthEnd: 6 },
    ],
  },
  {
    id: "dtap",
    name: "디프테리아/파상풍/백일해",
    nameEn: "DTaP",
    description: "총 3회 기초접종 (2, 4, 6개월)",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 2, monthEnd: 2 },
      { doseNumber: 2, doseLabel: "2차", monthStart: 4, monthEnd: 4 },
      { doseNumber: 3, doseLabel: "3차", monthStart: 6, monthEnd: 6 },
    ],
  },
  {
    id: "ipv",
    name: "폴리오",
    nameEn: "IPV",
    description: "총 3회 기초접종 (2, 4, 6개월)",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 2, monthEnd: 2 },
      { doseNumber: 2, doseLabel: "2차", monthStart: 4, monthEnd: 4 },
      { doseNumber: 3, doseLabel: "3차", monthStart: 6, monthEnd: 6 },
    ],
  },
  {
    id: "hib",
    name: "b형헤모필루스인플루엔자",
    nameEn: "Hib",
    description: "기초접종 3회 + 추가접종 1회",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 2, monthEnd: 2 },
      { doseNumber: 2, doseLabel: "2차", monthStart: 4, monthEnd: 4 },
      { doseNumber: 3, doseLabel: "3차", monthStart: 6, monthEnd: 6 },
      { doseNumber: 4, doseLabel: "추가", monthStart: 12, monthEnd: 12, note: "12~15개월" },
    ],
  },
  {
    id: "pcv",
    name: "폐렴구균",
    nameEn: "PCV",
    description: "기초접종 3회 + 추가접종 1회",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 2, monthEnd: 2 },
      { doseNumber: 2, doseLabel: "2차", monthStart: 4, monthEnd: 4 },
      { doseNumber: 3, doseLabel: "3차", monthStart: 6, monthEnd: 6 },
      { doseNumber: 4, doseLabel: "추가", monthStart: 12, monthEnd: 12, note: "12~15개월" },
    ],
  },
  {
    id: "rv",
    name: "로타바이러스",
    nameEn: "RV",
    description: "경구 투여, 제품에 따라 2~3회",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 2, monthEnd: 2 },
      { doseNumber: 2, doseLabel: "2차", monthStart: 4, monthEnd: 4 },
      { doseNumber: 3, doseLabel: "3차", monthStart: 6, monthEnd: 6, note: "로타텍만 해당" },
    ],
  },
  {
    id: "flu",
    name: "인플루엔자",
    nameEn: "Flu",
    description: "6개월 이상, 매년 계절접종",
    doses: [
      { doseNumber: 1, doseLabel: "매년", monthStart: 6, monthEnd: 12, note: "첫 해 4주 간격 2회" },
    ],
  },
  {
    id: "mmr",
    name: "홍역/유행성이하선염/풍진",
    nameEn: "MMR",
    description: "12~15개월 1차 접종",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 12, monthEnd: 12 },
    ],
  },
  {
    id: "var",
    name: "수두",
    nameEn: "VAR",
    description: "12~15개월 1차 접종",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 12, monthEnd: 12 },
    ],
  },
  {
    id: "hepa",
    name: "A형간염",
    nameEn: "HepA",
    description: "12~23개월 1차 접종",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 12, monthEnd: 12 },
    ],
  },
  {
    id: "je",
    name: "일본뇌염",
    nameEn: "JE",
    description: "불활성화 또는 생백신 선택",
    doses: [
      { doseNumber: 1, doseLabel: "1차", monthStart: 12, monthEnd: 12, note: "12~23개월" },
    ],
  },
];

// Helper: get vaccinations for a specific month
export function getVaccinationsForMonth(month: number) {
  const results: { vaccine: Vaccination; dose: VaccinationDose }[] = [];
  for (const v of vaccinations) {
    for (const d of v.doses) {
      if (month >= d.monthStart && month <= d.monthEnd) {
        results.push({ vaccine: v, dose: d });
      }
    }
  }
  return results;
}

// Helper: get upcoming vaccinations (current + next month)
export function getUpcomingVaccinations(currentMonth: number) {
  return getVaccinationsForMonth(currentMonth).concat(
    getVaccinationsForMonth(currentMonth + 1)
  );
}
