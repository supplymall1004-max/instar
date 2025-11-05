# 데이터베이스 설정 가이드

## Phase 1: 데이터베이스 스키마 적용

Instagram SNS 프로젝트의 데이터베이스 스키마를 Supabase에 적용하는 방법입니다.

### 준비 사항

1. Supabase 프로젝트가 생성되어 있어야 합니다.
2. Supabase Dashboard에 접근할 수 있어야 합니다.

### 마이그레이션 적용 방법

#### 방법 1: Supabase Dashboard SQL Editor 사용 (권장)

1. **Supabase Dashboard 접속**
   - [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴에서 **SQL Editor** 클릭
   - **New query** 클릭

3. **마이그레이션 파일 순서대로 실행**
   
   다음 순서로 마이그레이션 파일을 실행하세요:

   ```
   1. 20251105013534_add_user_fields.sql
   2. 20251105013535_create_posts_table.sql
   3. 20251105013536_create_likes_table.sql
   4. 20251105013537_create_comments_table.sql
   5. 20251105013538_create_follows_table.sql
   6. 20251105013539_create_posts_storage.sql
   ```

4. **각 파일 실행**
   - 각 마이그레이션 파일의 내용을 복사
   - SQL Editor에 붙여넣기
   - **Run** 버튼 클릭
   - 성공 메시지 확인

#### 방법 2: Supabase CLI 사용

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase 프로젝트에 로그인
supabase login

# 프로젝트 연결
supabase link --project-ref your-project-ref

# 마이그레이션 적용
supabase db push
```

### 생성되는 테이블

#### 1. users 테이블 (확장)
- `username` (TEXT, UNIQUE): 사용자명
- `avatar_url` (TEXT): 프로필 이미지 URL
- `bio` (TEXT): 자기소개

#### 2. posts 테이블
- `id` (UUID, PK): 게시물 ID
- `user_id` (UUID, FK → users): 작성자 ID
- `image_url` (TEXT): 이미지 URL
- `caption` (TEXT): 캡션
- `created_at` (TIMESTAMPTZ): 생성 시간
- `updated_at` (TIMESTAMPTZ): 수정 시간

#### 3. likes 테이블
- `id` (UUID, PK): 좋아요 ID
- `user_id` (UUID, FK → users): 좋아요한 사용자 ID
- `post_id` (UUID, FK → posts): 게시물 ID
- `created_at` (TIMESTAMPTZ): 생성 시간
- UNIQUE 제약조건: (user_id, post_id)

#### 4. comments 테이블
- `id` (UUID, PK): 댓글 ID
- `post_id` (UUID, FK → posts): 게시물 ID
- `user_id` (UUID, FK → users): 작성자 ID
- `content` (TEXT): 댓글 내용
- `created_at` (TIMESTAMPTZ): 생성 시간

#### 5. follows 테이블
- `id` (UUID, PK): 팔로우 관계 ID
- `follower_id` (UUID, FK → users): 팔로우하는 사용자 ID
- `following_id` (UUID, FK → users): 팔로우받는 사용자 ID
- `created_at` (TIMESTAMPTZ): 생성 시간
- UNIQUE 제약조건: (follower_id, following_id)
- CHECK 제약조건: follower_id != following_id

### 생성되는 Storage 버킷

#### posts 버킷
- **이름**: `posts`
- **타입**: Public (공개)
- **파일 크기 제한**: 5MB
- **허용 파일 형식**: JPEG, JPG, PNG, WebP

### 확인 사항

마이그레이션 적용 후 다음을 확인하세요:

1. **테이블 생성 확인**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

2. **Storage 버킷 확인**
   - Supabase Dashboard → **Storage** 메뉴
   - `posts` 버킷이 생성되어 있는지 확인

3. **인덱스 확인**
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE schemaname = 'public' 
   ORDER BY tablename, indexname;
   ```

### 주의사항

- **RLS (Row Level Security)**: 개발 환경에서는 RLS가 비활성화되어 있습니다. 프로덕션 배포 전에 적절한 RLS 정책을 설정해야 합니다.
- **데이터 백업**: 마이그레이션 적용 전에 기존 데이터를 백업하세요.
- **순서 중요**: 마이그레이션 파일은 반드시 순서대로 실행해야 합니다 (외래키 의존성 때문).

### 문제 해결

#### 오류: "relation already exists"
- 이미 테이블이 존재하는 경우입니다.
- 마이그레이션 파일의 `CREATE TABLE IF NOT EXISTS` 구문이 자동으로 처리합니다.
- 그래도 문제가 발생하면 해당 테이블을 먼저 삭제하세요.

#### 오류: "foreign key constraint"
- 외래키 제약조건 오류입니다.
- 마이그레이션 파일이 순서대로 실행되었는지 확인하세요.
- `users` 테이블이 먼저 생성되어 있어야 합니다.

#### 오류: "permission denied"
- 권한 문제입니다.
- Supabase 프로젝트의 관리자 권한이 있는지 확인하세요.

### 추가 리소스

- [Supabase SQL Editor 가이드](https://supabase.com/docs/guides/database/overview)
- [Supabase 마이그레이션 가이드](https://supabase.com/docs/guides/cli/local-development#database-migrations)
- [PostgreSQL 문서](https://www.postgresql.org/docs/)

