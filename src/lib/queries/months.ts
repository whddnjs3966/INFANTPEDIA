import { practicalTips, practicalContent, practicalEvidence } from "../data/practical-tips-data";
import { activityReleaseCorrections } from '../data/activity-release-corrections';
import { reviewedPublicContent } from '../utils/reviewed-public-content';
import type { HealthEvidence, HealthFAQItem } from '../data/health-faq-data';
import { supabase } from '../supabase';

export interface QueryOptions {
  throwOnError?: boolean;
  signal?: AbortSignal;
}

function queryFailed(error: { message: string }, options: QueryOptions) {
  if (options.signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  if (process.env.NODE_ENV === 'development') console.warn('Content query failed:', error.message);
  if (options.throwOnError) throw new Error('정보를 불러오지 못했어요. 연결을 확인하고 다시 시도해 주세요.');
}

export async function getMonthInfo(month: number, options: QueryOptions = {}) {
  let query = supabase.from('months_info').select('*').eq('month', month);
  if (options.signal) query = query.abortSignal(options.signal);
  const { data, error } = await query.single();
  if (error) { queryFailed(error, options); return null; }
  return data;
}

export async function getAllMonthsInfo() {
  const { data, error } = await supabase.from('months_info').select('*').order('month');
  if (error) { queryFailed(error, {}); return []; }
  return data;
}

export async function getWonderWeeks(days: number) {
  const { data, error } = await supabase.from('wonder_weeks').select('*').lte('start_day', days).gte('end_day', days);
  if (error) { queryFailed(error, {}); return []; }
  return data;
}

export async function getAllWonderWeeks(options: QueryOptions = {}) {
  let query = supabase.from('wonder_weeks').select('*').order('start_day');
  if (options.signal) query = query.abortSignal(options.signal);
  const { data, error } = await query;
  if (error) { queryFailed(error, options); return []; }
  return data;
}

export async function getActivities(month: number, category?: string, options: QueryOptions = {}) {
  let query = supabase.from('activities').select('*').eq('month_id', month);
  if (category) query = query.eq('category', category);
  if (options.signal) query = query.abortSignal(options.signal);
  const { data, error } = await query;
  if (error) { queryFailed(error, options); return []; }
  return data?.map(item => reviewedPublicContent('activities',item)) ?? [];
}

export interface SearchResult {
  id: number | string;
  title: string;
  content: string;
  category: string;
  month_id: number;
  source: 'activities' | 'parenting_tips' | 'guides' | 'health_faq' | 'milestones';
  href?: string;
  applicableMonths?: number[];
  evidence?: HealthEvidence;
  care?: HealthFAQItem["care"];
  urgency?: HealthFAQItem["urgency"];
}

export interface ContentSearchResponse {
  results: SearchResult[];
  remoteUnavailable: boolean;
}

const guideHref = (tab: string, month: number) => `/encyclopedia?tab=${tab}&month=${month}`;

// Imported only when searching so the home dashboard does not download every guide.
async function searchLocalGuides(keyword: string, currentMonth: number): Promise<SearchResult[]> {
  const [health, sleep, feeding, play, milestone, dental, food] = await Promise.all([
    import('../data/health-faq-data'), import('../data/sleep-guide-data'),
    import('../data/feeding-guide-data'), import('../data/recommended-activities-data'),
    import('../data/milestone-data'), import('../data/dental-guide-data'), import('../data/baby-food-guide-data'),
  ]);
  const candidates: SearchResult[] = [];
  const preferredMonth = (months: number[]) => !months.length || months.includes(currentMonth) ? currentMonth : months[0];
  for (const faq of health.healthFAQs) {
    const month = preferredMonth(faq.applicableMonths);
    candidates.push({id:faq.id,title:faq.question,content:faq.answer,category:'health',month_id:month,source:'health_faq',href:guideHref('health',month),applicableMonths:faq.applicableMonths,evidence:faq.evidence,care:faq.care,urgency:faq.urgency});
  }
  for (const item of play.allMonthActivities) for (const activity of item.activities) {
    candidates.push({id:activity.id,title:activity.title,content:[activity.description, `준비물: ${activity.materials.join(', ')}`, `권장 시간: ${activity.duration}`].join('\n\n'),category:'play',month_id:item.month,source:'guides',href:guideHref('activities',item.month),applicableMonths:[item.month]});
  }
  for (const item of milestone.getAllMilestoneData()) for (const change of item.milestones) {
    candidates.push({id:change.id,title:change.title,content:change.description,category:'development',month_id:item.month,source:'milestones',href:guideHref('milestone',item.month),applicableMonths:[item.month]});
  }
  for (let month=0;month<=12;month++) {
    const sleepGuide = sleep.getSleepGuideForMonth(month);
    if (sleepGuide) {
      candidates.push({id:`sleep-summary-${month}`,title:`${month}개월 수면 가이드`,content:`총 수면: ${sleepGuide.totalSleep}\n밤 수면: ${sleepGuide.nightSleep}\n낮잠: ${sleepGuide.napInfo}\n\n졸림 신호\n${sleepGuide.sleepSignals.join('\n')}\n\n수면 환경\n${sleepGuide.sleepEnvironment.join('\n')}`,category:'sleep',month_id:month,source:'guides',href:guideHref('sleep',month),applicableMonths:[month]});
      for (const [index,issue] of sleepGuide.commonIssues.entries()) candidates.push({id:`sleep-${month}-${index}`,title:issue.issue,content:issue.solution,category:'sleep',month_id:month,source:'guides',href:guideHref('sleep',month),applicableMonths:[month]});
    }
    const feedingGuide = feeding.getFeedingGuideForMonth(month);
    if (feedingGuide) {
      candidates.push({id:`feeding-summary-${month}`,title:`${month}개월 수유 가이드`,content:[feedingGuide.feedingType,...feedingGuide.feedingCues,`트림 안내\n${feedingGuide.burpingTips.join('\n')}`].join('\n\n'),category:'feeding',month_id:month,source:'guides',href:guideHref('feeding',month),applicableMonths:[month],evidence:feeding.feedingCueEvidence});
      for (const [index,issue] of feedingGuide.troubleshooting.entries()) candidates.push({id:`feeding-${month}-${index}`,title:issue.issue,content:issue.solution,category:'feeding',month_id:month,source:'guides',href:guideHref('feeding',month),applicableMonths:[month]});
      for(const position of feedingGuide.positions)candidates.push({id:`feeding-position-${position.id}`,title:`수유 자세 · ${position.name}`,content:`${position.description}\n\n${position.suitableFor}`,category:'feeding',month_id:month,source:'guides',href:guideHref('feeding',month),applicableMonths:[month]});
      for (const [kind, topic] of Object.entries(feeding.milkSafety)) {
        candidates.push({id:`feeding-${kind === 'breastMilk' ? 'storage' : 'formula'}-${month}`,title:kind === 'breastMilk' ? '모유 보관 가이드' : topic.title,content:topic.entries.map(({label,text})=>`${label}\n${text}`).join('\n\n'),category:'feeding',month_id:month,source:'guides',href:guideHref('feeding',month),applicableMonths:[month],evidence:topic.evidence});
      }
      candidates.push({id:`feeding-bottle-${month}`,title:'젖병 소독과 관리',content:feedingGuide.bottleCleaning.map(step=>`${step.title}\n${step.description}`).join('\n\n'),category:'feeding',month_id:month,source:'guides',href:guideHref('feeding',month),applicableMonths:[month],evidence:feeding.bottleCleaningEvidence});
      candidates.push({id:`feeding-mixed-${month}`,title:'혼합수유 팁',content:feedingGuide.mixedFeedingTips.join('\n\n'),category:'feeding',month_id:month,source:'guides',href:guideHref('feeding',month),applicableMonths:[month]});
    }
  }
  for(const method of sleep.sleepTrainingMethods){
    const months=Array.from({length:13},(_,month)=>month).filter(month=>sleep.getSleepGuideForMonth(month)?.suitableMethods.includes(method.id));
    const month=preferredMonth(months);
    candidates.push({id:`sleep-method-${method.id}`,title:`수면교육 · ${method.name}`,content:[method.description,`적용 시기: ${method.suitableAge}`,`예상 기간: ${method.duration}`,...method.steps,`장점: ${method.pros.join(', ')}`,`주의할 점: ${method.cons.join(', ')}`].join('\n\n'),category:'sleep',month_id:month,source:'guides',href:guideHref('sleep',month),applicableMonths:months});
  }
  const dentalGuide = dental.getDentalGuide();
  for (const [index,issue] of dentalGuide.commonIssues.entries()) candidates.push({id:`dental-${index}`,title:issue.issue,content:issue.solution,category:'dental',month_id:currentMonth,source:'guides',href:guideHref('dental',currentMonth),applicableMonths:[]});
  candidates.push({id:'dental-brushing',title:'양치 가이드',content:[dentalGuide.brushingGuide.startAge,dentalGuide.brushingGuide.toothpasteAge,dentalGuide.brushingGuide.fluorideNote,...dentalGuide.brushingGuide.steps.map(step=>`${step.title}\n${step.description}`)].join('\n\n'),category:'dental',month_id:currentMonth,source:'guides',href:guideHref('dental',currentMonth),applicableMonths:[]});
  candidates.push({id:'dental-teething',title:'이앓이 증상과 대처법',content:[...dentalGuide.teethingSymptoms,...dentalGuide.teethingRemedies.map(remedy=>`${remedy.title}\n${remedy.description}`)].join('\n\n'),category:'dental',month_id:currentMonth,source:'guides',href:guideHref('dental',currentMonth),applicableMonths:[]});
  candidates.push({id:'dental-visit',title:'첫 치과 방문 가이드',content:[dentalGuide.dentalVisit.firstVisit,dentalGuide.dentalVisit.frequency,...dentalGuide.dentalVisit.whatToExpect].join('\n\n'),category:'dental',month_id:currentMonth,source:'guides',href:guideHref('dental',currentMonth),applicableMonths:[]});
  const foodGuide = food.getBabyFoodGuide();
  for (const [index,stage] of foodGuide.stages.entries()) {
    const months = Array.from({length:stage.endMonth-stage.startMonth+1},(_,i)=>i+stage.startMonth).filter(m=>m<=12);
    const month = preferredMonth(months);
    const details = stage.startMonth < 6 ? [] : [`형태: ${stage.texture}`, `식사 기회: ${stage.frequency}`, `재료 예시: ${stage.newIngredients.map(ingredient => ingredient.name).join(', ')}`, ...stage.cookingTips, ...stage.cautionPoints];
    candidates.push({id:`babyfood-stage-${index}`,title:stage.startMonth < 6 ? stage.stage : `이유식 ${stage.stage}`,content:[stage.description,...details].join('\n\n'),category:'food',month_id:month,source:'guides',href:guideHref('babyfood',month),applicableMonths:months,evidence:food.solidFoodEvidence});
  }
  const foodMonth = Math.max(currentMonth, 6);
  const foodMonths = [6, 7, 8, 9, 10, 11, 12];
  const allergy = foodGuide.allergyGuide;
  candidates.push({id:'babyfood-allergy',title:allergy.title,content:[allergy.emergencyAction,...allergy.emergencySigns,allergy.description,`주의 식품: ${allergy.highRiskFoods.join(', ')}`,allergy.introduction,allergy.higherRisk].join('\n\n'),category:'food',month_id:currentMonth,source:'guides',href:guideHref('babyfood',foodMonth),applicableMonths:[],evidence:allergy.evidence});
  const storage = food.babyFoodStorage;
  candidates.push({id:'babyfood-storage',title:storage.title,content:storage.entries.map(({label,text})=>`${label}\n${text}`).join('\n\n'),category:'food',month_id:foodMonth,source:'guides',href:guideHref('babyfood',foodMonth),applicableMonths:foodMonths,evidence:storage.evidence});
  candidates.push({id:'babyfood-general',title:'이유식 기본 안내',content:foodGuide.generalTips.join('\n\n'),category:'food',month_id:currentMonth,source:'guides',href:guideHref('babyfood',foodMonth),applicableMonths:[],evidence:food.solidFoodEvidence});

  for (const tip of practicalTips) {
    const months = Array.from({length: 13 - tip.minMonth}, (_, i) => i + tip.minMonth);
    const month = months.includes(currentMonth) ? currentMonth : tip.minMonth;
    candidates.push({id: 'practical:' + tip.key, title: tip.title, content: practicalContent(tip), category: tip.category, month_id: month, source: 'parenting_tips', href: '/tips?month=' + month + '&tip=' + encodeURIComponent(tip.key), applicableMonths: months, evidence: practicalEvidence(tip)});
  }
  const needle=keyword.toLocaleLowerCase('ko');
  const merged=new Map<string,SearchResult>();
  for(const item of candidates){
    if(!`${item.title} ${item.content}`.toLocaleLowerCase('ko').includes(needle))continue;
    const key=`${item.source}\n${item.category}\n${item.title}\n${item.content}`;
    const existing=merged.get(key);
    if(!existing){merged.set(key,item);continue;}
    existing.applicableMonths=existing.applicableMonths?.length===0||item.applicableMonths?.length===0 ? [] : [...new Set([...(existing.applicableMonths||[existing.month_id]),...(item.applicableMonths||[item.month_id])])].sort((a,b)=>a-b);
    existing.month_id=preferredMonth(existing.applicableMonths);
    if(existing.href)existing.href=existing.href.replace(/month=\d+/,`month=${existing.month_id}`);
  }
  return [...merged.values()];
}

export async function searchContentWithStatus(keyword: string, options: { signal?: AbortSignal; currentMonth?: number; onLocalResults?: (results: SearchResult[]) => void } = {}): Promise<ContentSearchResponse> {
  const trimmed=keyword.trim();
  if(!trimmed || trimmed.length>100)return {results:[],remoteUnavailable:false};
  const currentMonth=Math.max(0,Math.min(12,options.currentMonth ?? 0));
  if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
  const remoteController=new AbortController();
  const abortRemote=()=>remoteController.abort();
  options.signal?.addEventListener('abort',abortRemote,{once:true});
  const timeout=setTimeout(abortRemote,6000);
  // Quote PostgREST filter values so commas/parentheses in user text stay literal.
  const pattern=JSON.stringify(`%${trimmed.replace(/[\\%_]/g,'\\$&')}%`);
  const needle=trimmed.toLocaleLowerCase('ko');
  const matchesText=(text: string)=>text.toLocaleLowerCase('ko').includes(needle);
  const revisedIds=activityReleaseCorrections.filter(row=>matchesText(row.title)||matchesText(row.after)).map(row=>row.id);
  const activityFilter=`title.ilike.${pattern},content.ilike.${pattern}${revisedIds.length ? `,id.in.(${revisedIds.join(',')})` : ''}`;
  let activitiesQuery=supabase.from('activities').select('*').or(activityFilter).limit(100);
  let tipsQuery=supabase.from('parenting_tips').select('*').or(`title.ilike.${pattern},content.ilike.${pattern}`).limit(100);
  activitiesQuery=activitiesQuery.abortSignal(remoteController.signal);tipsQuery=tipsQuery.abortSignal(remoteController.signal);
  const priority=(r:SearchResult)=>(matchesText(r.title)?2:0)+(!r.applicableMonths?.length||r.applicableMonths.includes(currentMonth)?1:0);
  const compare=(a:SearchResult,b:SearchResult)=>priority(b)-priority(a);
  const localTask=searchLocalGuides(trimmed,currentMonth).then(results=>{results.sort(compare);if(!options.signal?.aborted)options.onLocalResults?.(results);return results;});
  const request=Promise.all([activitiesQuery,tipsQuery,localTask]);
  const [activitiesResult,tipsResult,local]=await request.finally(()=>{clearTimeout(timeout);options.signal?.removeEventListener('abort',abortRemote);});
  if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
  const activityResults: SearchResult[] = [];
  for (const item of activitiesResult.data || []) {
    const row = reviewedPublicContent('activities', item);
    // A newer editorial revision may be returned by ID but should still match the search term.
    if (revisedIds.includes(row.id) && ![item.title, item.content, row.title, row.content].some(matchesText)) continue;
    activityResults.push({ ...row, source: 'activities', applicableMonths: [row.month_id], href: `${guideHref('encyclopedia', row.month_id)}&entry=${row.id}` });
  }
  const tipTabs:Record<string,string>={sleeping:'sleep',sleep_tips:'sleep',feeding:'feeding',feeding_tips:'feeding',crying:'health',crying_tips:'health',outing:'activities',outing_tips:'activities'};
  const tips:SearchResult[]=(tipsResult.data||[]).map(item=>({...reviewedPublicContent('parenting_tips',item),source:'parenting_tips' as const,applicableMonths:[item.month_id],href:guideHref(tipTabs[item.category]||'encyclopedia',item.month_id)}));
  const results=[...local,...activityResults,...tips].sort(compare);
  return {results,remoteUnavailable:!!(activitiesResult.error||tipsResult.error)};
}

// Backward-compatible result-only interface for other callers.
export async function searchContent(keyword: string): Promise<SearchResult[]> {
  return (await searchContentWithStatus(keyword)).results;
}

export async function getParentingTips(month: number, category?: string, options: QueryOptions = {}) {
  let query = supabase.from('parenting_tips').select('*').eq('month_id', month);
  if (category) query = query.eq('category', category);
  if (options.signal) query = query.abortSignal(options.signal);
  const { data, error } = await query;
  if (error) { queryFailed(error, options); return []; }
  return data?.map(item => reviewedPublicContent('parenting_tips',item)) ?? [];
}
