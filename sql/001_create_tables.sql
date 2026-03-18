-- ============================================
-- InfantPedia Database Schema
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. months_info 테이블 (월령별 핵심 메타데이터)
CREATE TABLE IF NOT EXISTS months_info (
  id SERIAL PRIMARY KEY,
  month INT NOT NULL UNIQUE CHECK (month >= 0 AND month <= 12),
  wake_window_min INT,
  wake_window_max INT,
  feed_amount_min INT,
  feed_amount_max INT,
  daily_feed_total INT,
  nap_count VARCHAR(50),
  total_sleep_hours VARCHAR(50),
  feed_count VARCHAR(50),
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. wonder_weeks 테이블 (원더윅스 일정)
CREATE TABLE IF NOT EXISTS wonder_weeks (
  id SERIAL PRIMARY KEY,
  week_number INT NOT NULL,
  start_day INT NOT NULL,
  end_day INT NOT NULL,
  title VARCHAR(100),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CHECK (start_day < end_day)
);

-- 3. activities 테이블 (발달/놀이/수면/이유식 콘텐츠)
CREATE TABLE IF NOT EXISTS activities (
  id SERIAL PRIMARY KEY,
  month_id INT NOT NULL REFERENCES months_info(month),
  category VARCHAR(50) NOT NULL CHECK (category IN ('development', 'play', 'sleep', 'food')),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 (쿼리 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_months_info_month ON months_info(month);
CREATE INDEX IF NOT EXISTS idx_wonder_weeks_days ON wonder_weeks(start_day, end_day);
CREATE INDEX IF NOT EXISTS idx_activities_month_category ON activities(month_id, category);

-- RLS 활성화 (Row Level Security)
ALTER TABLE months_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE wonder_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- 익명 읽기 허용 정책 (공개 백과사전)
CREATE POLICY "Allow anonymous read" ON months_info FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON wonder_weeks FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON activities FOR SELECT USING (true);
