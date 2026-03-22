import { supabase } from '../supabase';

export async function getMonthInfo(month: number) {
  const { data, error } = await supabase
    .from('months_info')
    .select('*')
    .eq('month', month)
    .single();
  if (error) {
    console.warn('getMonthInfo error:', error.message);
    return null;
  }
  return data;
}

export async function getAllMonthsInfo() {
  const { data, error } = await supabase
    .from('months_info')
    .select('*')
    .order('month');
  if (error) {
    console.warn('getAllMonthsInfo error:', error.message);
    return [];
  }
  return data;
}

export async function getWonderWeeks(days: number) {
  const { data, error } = await supabase
    .from('wonder_weeks')
    .select('*')
    .lte('start_day', days)
    .gte('end_day', days);
  if (error) {
    console.warn('getWonderWeeks error:', error.message);
    return [];
  }
  return data;
}

export async function getAllWonderWeeks() {
  const { data, error } = await supabase
    .from('wonder_weeks')
    .select('*')
    .order('start_day');
  if (error) {
    console.warn('getAllWonderWeeks error:', error.message);
    return [];
  }
  return data;
}

export async function getActivities(month: number, category?: string) {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('month_id', month);
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) {
    console.warn('getActivities error:', error.message);
    return [];
  }
  return data;
}

export interface SearchResult {
  id: number;
  title: string;
  content: string;
  category: string;
  month_id: number;
  source: 'activities' | 'parenting_tips';
}

export async function searchContent(keyword: string): Promise<SearchResult[]> {
  const trimmed = keyword.trim();
  if (!trimmed || trimmed.length > 100) return [];

  const safeKeyword = trimmed.replace(/[%_]/g, '\\$&');

  const [activitiesResult, tipsResult] = await Promise.all([
    supabase
      .from('activities')
      .select('*')
      .or(`title.ilike.%${safeKeyword}%,content.ilike.%${safeKeyword}%`),
    supabase
      .from('parenting_tips')
      .select('*')
      .or(`title.ilike.%${safeKeyword}%,content.ilike.%${safeKeyword}%`),
  ]);

  if (activitiesResult.error) {
    console.warn('searchContent activities error:', activitiesResult.error.message);
  }
  if (tipsResult.error) {
    console.warn('searchContent tips error:', tipsResult.error.message);
  }

  const activities: SearchResult[] = (activitiesResult.data || []).map((item) => ({
    ...item,
    source: 'activities' as const,
  }));

  const tips: SearchResult[] = (tipsResult.data || []).map((item) => ({
    ...item,
    source: 'parenting_tips' as const,
  }));

  return [...activities, ...tips];
}

export async function getParentingTips(month: number, category?: string) {
  let query = supabase
    .from('parenting_tips')
    .select('*')
    .eq('month_id', month);
  if (category) {
    query = query.eq('category', category);
  }
  const { data, error } = await query;
  if (error) {
    console.warn('getParentingTips error:', error.message);
    return [];
  }
  return data;
}
