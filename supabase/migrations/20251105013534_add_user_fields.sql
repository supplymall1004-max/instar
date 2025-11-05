-- Users 테이블에 추가 필드 추가
-- username, avatar_url, bio 필드를 추가하여 Instagram 프로필 정보를 저장

-- username 필드 추가 (고유값)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- avatar_url 필드 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- bio 필드 추가
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- username 인덱스 생성 (이미 UNIQUE 제약조건으로 인덱스가 생성되지만 명시적으로 추가)
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username) WHERE username IS NOT NULL;

