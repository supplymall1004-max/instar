-- Posts Storage 버킷 생성 및 RLS 비활성화 (개발 환경용)
-- 게시물 이미지를 저장하는 버킷

-- 1. posts 버킷 생성 (이미 존재하면 업데이트)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'posts',
  'posts',
  true,  -- public bucket (게시물 이미지는 공개)
  5242880,  -- 5MB 제한 (5 * 1024 * 1024)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]  -- 이미지 파일만 허용
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[];

-- 2. Storage objects 테이블의 RLS는 이미 setup_storage.sql에서 비활성화됨
-- 개발 환경에서는 RLS 비활성화 상태 유지

