-- 랜딩페이지 이메일 구독자 테이블
CREATE TABLE IF NOT EXISTS landing_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 활성화
ALTER TABLE landing_subscribers ENABLE ROW LEVEL SECURITY;

-- 익명 사용자도 INSERT 가능하도록 정책 추가
CREATE POLICY "Allow anonymous insert" ON landing_subscribers
  FOR INSERT TO anon
  WITH CHECK (true);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_landing_subscribers_email ON landing_subscribers(email);
