-- Storage RLS 비활성화 (개발 환경용)
-- 개발 단계에서는 RLS를 비활성화하여 빠른 개발 진행
-- 프로덕션 배포 전에 적절한 RLS 정책 적용 필요

-- 기존 Storage 정책 삭제
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- Storage objects 테이블의 RLS 비활성화
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

