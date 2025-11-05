# 디버깅 가이드

## Internal Server Error 해결 방법

### 1. 환경 변수 확인

`.env` 파일에 다음 환경 변수가 모두 설정되어 있는지 확인하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

### 2. 데이터베이스 마이그레이션 확인

Supabase Dashboard → **SQL Editor**에서 다음 쿼리로 테이블 확인:

```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- users 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- posts 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'posts'
ORDER BY ordinal_position;
```

### 3. 필수 마이그레이션 파일 실행 순서

다음 순서로 마이그레이션을 실행했는지 확인:

1. `setup_schema.sql` - users 테이블 생성
2. `20251105013534_add_user_fields.sql` - username, avatar_url, bio 추가
3. `20251105013535_create_posts_table.sql` - posts 테이블 생성
4. `20251105013536_create_likes_table.sql` - likes 테이블 생성
5. `20251105013537_create_comments_table.sql` - comments 테이블 생성
6. `20251105013538_create_follows_table.sql` - follows 테이블 생성
7. `20251105013539_create_posts_storage.sql` - Storage 버킷 생성

### 4. 개발 서버 로그 확인

터미널에서 개발 서버를 실행하면 자세한 오류 메시지가 표시됩니다:

```bash
pnpm dev
```

터미널에 표시되는 오류 메시지를 확인하세요.

### 5. 브라우저 콘솔 확인

브라우저 개발자 도구(F12) → Console 탭에서 오류 메시지를 확인하세요.

### 6. 네트워크 탭 확인

브라우저 개발자 도구 → Network 탭에서 실패한 요청을 확인하고, Response를 확인하세요.

