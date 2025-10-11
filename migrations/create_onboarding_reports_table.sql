-- 온보딩 레포트 테이블 생성
-- Supabase Studio의 SQL Editor에서 실행하세요

-- 테이블 생성
CREATE TABLE IF NOT EXISTS public.onboarding_reports (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  report_data JSONB NOT NULL,
  version TEXT NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS onboarding_reports_user_id_idx ON public.onboarding_reports(user_id);
CREATE INDEX IF NOT EXISTS onboarding_reports_created_at_idx ON public.onboarding_reports(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE public.onboarding_reports ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 사용자는 자신의 레포트만 조회 가능
CREATE POLICY "Users can view their own reports"
  ON public.onboarding_reports
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 레포트만 생성 가능
CREATE POLICY "Users can create their own reports"
  ON public.onboarding_reports
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 사용자는 자신의 레포트만 업데이트 가능
CREATE POLICY "Users can update their own reports"
  ON public.onboarding_reports
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 코멘트 추가 (테이블 및 컬럼 설명)
COMMENT ON TABLE public.onboarding_reports IS '사용자 온보딩 레포트 - 독서 성향 분석 결과';
COMMENT ON COLUMN public.onboarding_reports.id IS '레포트 ID (rep_timestamp_userid)';
COMMENT ON COLUMN public.onboarding_reports.user_id IS '사용자 ID';
COMMENT ON COLUMN public.onboarding_reports.report_data IS '레포트 전체 데이터 (JSON)';
COMMENT ON COLUMN public.onboarding_reports.version IS '레포트 포맷 버전';
COMMENT ON COLUMN public.onboarding_reports.created_at IS '생성 시간';
COMMENT ON COLUMN public.onboarding_reports.updated_at IS '수정 시간';

-- 확인 쿼리
SELECT
  'onboarding_reports 테이블이 성공적으로 생성되었습니다!' AS message,
  COUNT(*) AS report_count
FROM public.onboarding_reports;
