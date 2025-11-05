-- 데이터베이스 상태 확인 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. 테이블 존재 확인
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('users', 'posts', 'likes', 'comments', 'follows') 
    THEN '✅ 존재'
    ELSE '❌ 없음'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows')
ORDER BY table_name;

-- 2. users 테이블 컬럼 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. posts 테이블 컬럼 확인
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'posts'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. 사용자 수 확인
SELECT COUNT(*) as user_count FROM users;

-- 5. 게시물 수 확인
SELECT COUNT(*) as post_count FROM posts;

-- 6. RLS 상태 확인
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('users', 'posts', 'likes', 'comments', 'follows')
ORDER BY tablename;

