-- Post Tags 테이블 생성
-- 게시물에 태그된 사용자 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS public.post_tags (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    tagged_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 테이블 소유자 설정
ALTER TABLE public.post_tags OWNER TO postgres;

-- Row Level Security (RLS) 비활성화 (개발 환경)
ALTER TABLE public.post_tags DISABLE ROW LEVEL SECURITY;

-- 복합 유니크 제약조건 (같은 게시물에 같은 사용자를 중복 태그 방지)
CREATE UNIQUE INDEX IF NOT EXISTS idx_post_tags_unique ON public.post_tags(post_id, tagged_user_id);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_post_tags_post_id ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tagged_user_id ON public.post_tags(tagged_user_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_created_at ON public.post_tags(created_at DESC);

-- 권한 부여
GRANT ALL ON TABLE public.post_tags TO anon;
GRANT ALL ON TABLE public.post_tags TO authenticated;
GRANT ALL ON TABLE public.post_tags TO service_role;

