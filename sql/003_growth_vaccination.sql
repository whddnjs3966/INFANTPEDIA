-- ============================================
-- Growth Standards & Vaccination Schedule Tables
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 1. growth_standards 테이블 (WHO 성장 기준 데이터)
CREATE TABLE IF NOT EXISTS growth_standards (
  id SERIAL PRIMARY KEY,
  month INT NOT NULL CHECK (month >= 0 AND month <= 12),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female')),
  metric VARCHAR(20) NOT NULL CHECK (metric IN ('height', 'weight', 'head')),
  p3 DECIMAL(5,2) NOT NULL,
  p50 DECIMAL(5,2) NOT NULL,
  p97 DECIMAL(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(month, gender, metric)
);

-- 2. vaccination_schedule 테이블 (국가예방접종 일정)
CREATE TABLE IF NOT EXISTS vaccination_schedule (
  id SERIAL PRIMARY KEY,
  vaccine_id VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  name_en VARCHAR(20) NOT NULL,
  description TEXT,
  dose_number INT NOT NULL,
  dose_label VARCHAR(20) NOT NULL,
  month_start INT NOT NULL,
  month_end INT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_growth_standards_lookup ON growth_standards(month, gender, metric);
CREATE INDEX IF NOT EXISTS idx_vaccination_schedule_vaccine ON vaccination_schedule(vaccine_id);

-- RLS
ALTER TABLE growth_standards ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccination_schedule ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read" ON growth_standards FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON vaccination_schedule FOR SELECT USING (true);

-- ============================================
-- Seed: WHO Growth Standards (50th percentile)
-- ============================================

-- Male Height
INSERT INTO growth_standards (month, gender, metric, p3, p50, p97) VALUES
(0,'male','height',46.3,49.9,53.4),(1,'male','height',51.1,54.7,58.4),
(2,'male','height',54.7,58.4,62.2),(3,'male','height',57.6,61.4,65.3),
(4,'male','height',60.0,63.9,67.8),(5,'male','height',61.9,65.9,69.9),
(6,'male','height',63.6,67.6,71.6),(7,'male','height',65.1,69.2,73.2),
(8,'male','height',66.5,70.6,74.7),(9,'male','height',67.7,72.0,76.2),
(10,'male','height',69.0,73.3,77.6),(11,'male','height',70.2,74.5,78.9),
(12,'male','height',71.3,75.7,80.2);

-- Male Weight
INSERT INTO growth_standards (month, gender, metric, p3, p50, p97) VALUES
(0,'male','weight',2.5,3.3,4.3),(1,'male','weight',3.4,4.5,5.7),
(2,'male','weight',4.3,5.6,7.1),(3,'male','weight',5.0,6.4,8.0),
(4,'male','weight',5.6,7.0,8.7),(5,'male','weight',6.0,7.5,9.3),
(6,'male','weight',6.4,7.9,9.8),(7,'male','weight',6.7,8.3,10.2),
(8,'male','weight',6.9,8.6,10.5),(9,'male','weight',7.1,8.9,10.9),
(10,'male','weight',7.4,9.2,11.2),(11,'male','weight',7.6,9.4,11.5),
(12,'male','weight',7.7,9.6,11.8);

-- Male Head Circumference
INSERT INTO growth_standards (month, gender, metric, p3, p50, p97) VALUES
(0,'male','head',32.1,34.5,36.9),(1,'male','head',35.1,37.3,39.5),
(2,'male','head',36.9,39.1,41.3),(3,'male','head',38.3,40.5,42.7),
(4,'male','head',39.4,41.6,43.8),(5,'male','head',40.3,42.6,44.8),
(6,'male','head',41.0,43.3,45.6),(7,'male','head',41.7,44.0,46.3),
(8,'male','head',42.2,44.5,46.9),(9,'male','head',42.6,45.0,47.4),
(10,'male','head',43.0,45.4,47.8),(11,'male','head',43.4,45.8,48.2),
(12,'male','head',43.6,46.1,48.5);

-- Female Height
INSERT INTO growth_standards (month, gender, metric, p3, p50, p97) VALUES
(0,'female','height',45.6,49.1,52.7),(1,'female','height',50.0,53.7,57.4),
(2,'female','height',53.2,57.1,61.0),(3,'female','height',55.8,59.8,63.8),
(4,'female','height',57.9,62.1,66.2),(5,'female','height',59.6,64.0,68.2),
(6,'female','height',61.0,65.7,70.0),(7,'female','height',62.5,67.3,71.6),
(8,'female','height',63.7,68.7,73.2),(9,'female','height',64.9,70.1,74.7),
(10,'female','height',66.1,71.5,76.1),(11,'female','height',67.2,72.8,77.5),
(12,'female','height',68.2,74.0,78.9);

-- Female Weight
INSERT INTO growth_standards (month, gender, metric, p3, p50, p97) VALUES
(0,'female','weight',2.4,3.2,4.2),(1,'female','weight',3.2,4.2,5.4),
(2,'female','weight',3.9,5.1,6.5),(3,'female','weight',4.5,5.8,7.4),
(4,'female','weight',5.0,6.4,8.1),(5,'female','weight',5.4,6.9,8.7),
(6,'female','weight',5.7,7.3,9.2),(7,'female','weight',6.0,7.6,9.6),
(8,'female','weight',6.3,7.9,10.0),(9,'female','weight',6.5,8.2,10.4),
(10,'female','weight',6.7,8.5,10.7),(11,'female','weight',6.9,8.7,11.0),
(12,'female','weight',7.0,8.9,11.3);

-- Female Head Circumference
INSERT INTO growth_standards (month, gender, metric, p3, p50, p97) VALUES
(0,'female','head',31.7,33.9,36.1),(1,'female','head',34.3,36.5,38.8),
(2,'female','head',36.0,38.3,40.5),(3,'female','head',37.2,39.5,41.9),
(4,'female','head',38.2,40.6,43.0),(5,'female','head',39.0,41.5,43.9),
(6,'female','head',39.7,42.2,44.6),(7,'female','head',40.4,42.8,45.3),
(8,'female','head',40.9,43.4,45.9),(9,'female','head',41.3,43.8,46.3),
(10,'female','head',41.7,44.2,46.7),(11,'female','head',42.0,44.6,47.1),
(12,'female','head',42.3,44.9,47.5);

-- ============================================
-- Seed: Vaccination Schedule
-- ============================================
INSERT INTO vaccination_schedule (vaccine_id, name, name_en, description, dose_number, dose_label, month_start, month_end, note) VALUES
('bcg','결핵','BCG','피내용, 출생 후 4주 이내 접종',1,'1회',0,1,NULL),
('hepb','B형간염','HepB','총 3회 접종',1,'1차',0,0,NULL),
('hepb','B형간염','HepB','총 3회 접종',2,'2차',1,1,NULL),
('hepb','B형간염','HepB','총 3회 접종',3,'3차',6,6,NULL),
('dtap','디프테리아/파상풍/백일해','DTaP','총 3회 기초접종',1,'1차',2,2,NULL),
('dtap','디프테리아/파상풍/백일해','DTaP','총 3회 기초접종',2,'2차',4,4,NULL),
('dtap','디프테리아/파상풍/백일해','DTaP','총 3회 기초접종',3,'3차',6,6,NULL),
('ipv','폴리오','IPV','총 3회 기초접종',1,'1차',2,2,NULL),
('ipv','폴리오','IPV','총 3회 기초접종',2,'2차',4,4,NULL),
('ipv','폴리오','IPV','총 3회 기초접종',3,'3차',6,6,NULL),
('hib','b형헤모필루스인플루엔자','Hib','기초접종 3회 + 추가접종 1회',1,'1차',2,2,NULL),
('hib','b형헤모필루스인플루엔자','Hib','기초접종 3회 + 추가접종 1회',2,'2차',4,4,NULL),
('hib','b형헤모필루스인플루엔자','Hib','기초접종 3회 + 추가접종 1회',3,'3차',6,6,NULL),
('hib','b형헤모필루스인플루엔자','Hib','기초접종 3회 + 추가접종 1회',4,'추가',12,12,'12~15개월'),
('pcv','폐렴구균','PCV','기초접종 3회 + 추가접종 1회',1,'1차',2,2,NULL),
('pcv','폐렴구균','PCV','기초접종 3회 + 추가접종 1회',2,'2차',4,4,NULL),
('pcv','폐렴구균','PCV','기초접종 3회 + 추가접종 1회',3,'3차',6,6,NULL),
('pcv','폐렴구균','PCV','기초접종 3회 + 추가접종 1회',4,'추가',12,12,'12~15개월'),
('rv','로타바이러스','RV','경구 투여, 제품에 따라 2~3회',1,'1차',2,2,NULL),
('rv','로타바이러스','RV','경구 투여, 제품에 따라 2~3회',2,'2차',4,4,NULL),
('rv','로타바이러스','RV','경구 투여, 제품에 따라 2~3회',3,'3차',6,6,'로타텍만 해당'),
('flu','인플루엔자','Flu','6개월 이상, 매년 계절접종',1,'매년',6,12,'첫 해 4주 간격 2회'),
('mmr','홍역/유행성이하선염/풍진','MMR','12~15개월 1차 접종',1,'1차',12,12,NULL),
('var','수두','VAR','12~15개월 1차 접종',1,'1차',12,12,NULL),
('hepa','A형간염','HepA','12~23개월 1차 접종',1,'1차',12,12,NULL),
('je','일본뇌염','JE','불활성화 또는 생백신 선택',1,'1차',12,12,'12~23개월');
