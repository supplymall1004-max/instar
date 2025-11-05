-- Storage 버킷 생성 및 RLS 비활성화 (개발 환경용)
-- 개발 단계에서는 RLS를 비활성화하여 빠른 개발 진행
-- 프로덕션 배포 전에 적절한 RLS 정책 적용 필요

-- 1. uploads 버킷 생성 (이미 존재하면 무시됨)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,  -- private bucket
  6291456,  -- 6MB 제한 (6 * 1024 * 1024)
  NULL  -- 모든 파일 타입 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 6291456;

-- 2. 기존 Storage 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Users can upload to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;

-- 3. Storage objects 테이블의 RLS 비활성화 (개발 환경용)
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
