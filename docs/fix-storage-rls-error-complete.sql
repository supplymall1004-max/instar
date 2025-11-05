-- ============================================
-- Storage RLS 에러 완전 해결을 위한 강력한 SQL 스크립트
-- ============================================
-- 이 스크립트는 모든 Storage 관련 정책을 찾아서 삭제하고 RLS를 비활성화합니다

-- 1단계: storage.objects 테이블의 모든 정책 확인 및 삭제
DO $$
DECLARE
  r RECORD;
BEGIN
  -- 모든 정책 찾기
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  ) LOOP
    -- 각 정책 삭제
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', r.policyname);
    RAISE NOTICE '정책 삭제됨: %', r.policyname;
  END LOOP;
END $$;

-- 2단계: storage.objects 테이블의 RLS 완전히 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 3단계: storage.buckets 테이블의 RLS도 확인 및 비활성화 (필요시)
ALTER TABLE storage.buckets DISABLE ROW LEVEL SECURITY;

-- 4단계: 모든 storage 스키마의 테이블에 대해 RLS 비활성화
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'storage'
  ) LOOP
    BEGIN
      EXECUTE format('ALTER TABLE storage.%I DISABLE ROW LEVEL SECURITY', r.tablename);
      RAISE NOTICE 'RLS 비활성화됨: storage.%', r.tablename;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE NOTICE '테이블에 RLS가 없거나 오류 발생: storage.% - %', r.tablename, SQLERRM;
    END;
  END LOOP;
END $$;

-- 5단계: 최종 확인 (실행 결과 확인용)
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS 활성화 여부"
FROM pg_tables
WHERE schemaname = 'storage'
ORDER BY tablename;

-- 6단계: 남아있는 정책 확인 (결과가 비어있어야 정상)
SELECT 
  schemaname,
  tablename,
  policyname as "정책 이름",
  cmd as "명령어"
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

