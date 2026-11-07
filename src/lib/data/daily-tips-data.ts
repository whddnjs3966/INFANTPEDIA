import { practicalTips, practicalContent, type PracticalTip } from "./practical-tips-data";
export interface DailyTip { id: number; category: string; categoryEmoji: string; title: string; content: string; practical: PracticalTip; }
const labels = { sleep_tips: "잠", feeding_tips: "먹기", crying_tips: "교감·달래기", outing_tips: "외출" };
// Retire the legacy 40 unsourced random medical tips. The selected month limits eligibility.
export const dailyTips: DailyTip[] = practicalTips.map((tip, index) => ({ id: 1000 + index, category: labels[tip.category], categoryEmoji: "", title: tip.title, content: practicalContent(tip), practical: tip }));
export function getTipsForMonth(month: number) { return dailyTips.filter(tip => tip.practical.minMonth <= month); }
export function getRandomTip(month = 0): DailyTip { const eligible = getTipsForMonth(month); return eligible[Math.floor(Math.random() * eligible.length)]; }
