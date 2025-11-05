-- 동영상 지원 추가
-- posts 테이블에 video_url 및 media_type 컬럼 추가
-- Storage 버킷에 동영상 MIME 타입 추가

-- 1. posts 테이블에 video_url 및 media_type 컬럼 추가
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS media_type TEXT DEFAULT 'image' CHECK (media_type IN ('image', 'video'));

-- 2. 기존 게시물은 모두 이미지로 설정
UPDATE public.posts SET media_type = 'image' WHERE media_type IS NULL;

-- 3. media_type에 기본값 설정
ALTER TABLE public.posts ALTER COLUMN media_type SET DEFAULT 'image';

-- 4. image_url 또는 video_url 중 하나는 필수
ALTER TABLE public.posts
ADD CONSTRAINT check_media_url
CHECK (
  (media_type = 'image' AND image_url IS NOT NULL) OR
  (media_type = 'video' AND video_url IS NOT NULL)
);

-- 5. posts Storage 버킷에 동영상 MIME 타입 추가
UPDATE storage.buckets
SET 
  file_size_limit = 52428800,  -- 50MB로 증가 (동영상용)
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'
  ]::text[]
WHERE id = 'posts';

