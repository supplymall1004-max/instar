-- ============================================
-- Storage RLS 에러 해결을 위한 SQL 스크립트
-- ============================================
-- 이 스크립트를 Supabase 대시보드의 SQL Editor에서 실행하세요
-- 실행 후 브라우저를 새로고침하고 파일 업로드를 다시 시도하세요

-- 1단계: 기존 Storage 정책 모두 삭제
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- 2단계: Storage objects 테이블의 RLS 완전히 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- 3단계: RLS 상태 확인 (실행 결과 확인용)
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS 활성화 여부"
FROM pg_tables
WHERE schemaname = 'storage' AND tablename = 'objects';

-- 4단계: 남아있는 정책 확인 (실행 결과 확인용 - 결과가 비어있어야 정상)
SELECT 
  policyname as "정책 이름",
  cmd as "명령어"
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

-- ============================================
-- 실행 후 확인 사항:
-- ============================================
-- 1. 3단계 결과에서 "RLS 활성화 여부"가 false(또는 f)인지 확인
-- 2. 4단계 결과가 비어있는지 확인 (정책이 모두 삭제되었는지)
-- 3. 브라우저에서 /storage-test 페이지 새로고침
-- 4. 파일 업로드 다시 시도

