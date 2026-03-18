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
