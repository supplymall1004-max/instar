# 문제 해결 가이드

## 500 Internal Server Error 해결

### 1. 환경 변수 확인

터미널에서 다음 명령어로 환경 변수를 확인하세요:

```bash
node scripts/check-env.js
```

모든 환경 변수가 설정되어 있어야 합니다.

### 2. 데이터베이스 마이그레이션 확인

Supabase Dashboard → SQL Editor에서 다음 쿼리를 실행하여 테이블이 존재하는지 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN ('users', 'posts', 'likes', 'comments', 'follows');
```

모든 테이블이 표시되어야 합니다.

### 3. 서버 로그 확인

개발 서버를 실행한 터미널에서 오류 메시지를 확인하세요:

```bash
pnpm dev
```

오류 메시지 예시:
- `[Posts API] 조회 실패: ...`
- `column users.username does not exist`
- `relation "posts" does not exist`

### 4. 브라우저 콘솔 확인

브라우저 개발자 도구(F12) → Console 탭에서 오류 메시지를 확인하세요.

### 5. 네트워크 탭 확인

브라우저 개발자 도구 → Network 탭에서 실패한 요청을 확인하고, Response를 확인하세요.

### 6. 일반적인 해결 방법

#### 테이블이 없는 경우

Supabase Dashboard → SQL Editor에서 마이그레이션 파일을 순서대로 실행:

1. `setup_schema.sql`
2. `20251105013534_add_user_fields.sql`
3. `20251105013535_create_posts_table.sql`
4. `20251105013536_create_likes_table.sql`
5. `20251105013537_create_comments_table.sql`
6. `20251105013538_create_follows_table.sql`
7. `20251105013539_create_posts_storage.sql`

#### 환경 변수 문제

`.env` 파일이 프로젝트 루트에 있는지 확인하고, 다음 변수들이 모두 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

#### 서버 재시작

환경 변수를 변경한 후에는 서버를 재시작해야 합니다:

1. 터미널에서 `Ctrl+C`로 서버 중지
2. `pnpm dev`로 서버 재시작

### 7. 추가 도움

위 방법으로 해결되지 않으면:

1. 터미널의 전체 오류 메시지를 복사
2. 브라우저 콘솔의 오류 메시지를 복사
3. 어떤 페이지에서 오류가 발생하는지 확인 (/, /post/..., /profile/...)
4. 위 정보를 모두 제공하면 더 정확한 해결책을 제시할 수 있습니다.

