-- 북마크 테이블 생성
-- 사용자가 게시물을 북마크할 수 있는 기능

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- 중복 북마크 방지
  UNIQUE(user_id, post_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_post_id ON public.bookmarks(post_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- RLS 비활성화 (개발 환경)
-- ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

