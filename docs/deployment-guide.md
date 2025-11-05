# 배포 가이드

이 문서는 Instagram SNS 프로젝트를 프로덕션 환경에 배포하기 위한 가이드입니다.

## 배포 준비 체크리스트

### 1. 환경 변수 설정 확인

#### Clerk 환경 변수
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Clerk Dashboard에서 프로덕션 키 사용
- `CLERK_SECRET_KEY`: Clerk Dashboard에서 프로덕션 시크릿 키 사용
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`: `/sign-in`
- `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`: 프로덕션 도메인
- `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`: 프로덕션 도메인

#### Supabase 환경 변수
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase 프로덕션 anon key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase 프로덕션 service role key (절대 공개하지 마세요!)
- `NEXT_PUBLIC_STORAGE_BUCKET`: `uploads`

### 2. Supabase 프로덕션 설정

1. **RLS (Row Level Security) 활성화**
   - 개발 환경에서는 비활성화되어 있음
   - 프로덕션에서는 각 테이블에 적절한 RLS 정책 필요

2. **Storage 버킷 공개 설정 확인**
   - `uploads` 버킷이 공개 버킷인지 확인
   - 또는 RLS 정책으로 접근 제어

3. **데이터베이스 마이그레이션 적용 확인**
   - 모든 마이그레이션 파일이 프로덕션에 적용되었는지 확인

### 3. Clerk 프로덕션 설정

1. **프로덕션 환경 키 사용**
   - 개발 키 대신 프로덕션 키 사용 필수
   - Clerk Dashboard에서 프로덕션 키 확인

2. **Allowed Origins 설정**
   - 프로덕션 도메인을 Allowed Origins에 추가
   - 예: `https://yourdomain.com`

3. **Redirect URLs 설정**
   - Sign-in, Sign-up 리다이렉트 URL 설정

### 4. Vercel 배포 설정

1. **프로젝트 연결**
   ```bash
   vercel --prod
   ```

2. **환경 변수 설정**
   - Vercel Dashboard → Settings → Environment Variables
   - 모든 환경 변수 추가

3. **빌드 설정**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`

4. **도메인 설정**
   - Vercel Dashboard → Settings → Domains
   - 커스텀 도메인 추가 (선택사항)

## 배포 후 확인 사항

- [ ] 홈페이지 로딩 확인
- [ ] 로그인/회원가입 기능 확인
- [ ] 게시물 작성 및 조회 확인
- [ ] 이미지 업로드 확인
- [ ] 좋아요, 댓글 기능 확인
- [ ] 프로필 페이지 확인
- [ ] 검색 기능 확인
- [ ] 반응형 레이아웃 확인 (모바일, 태블릿, 데스크톱)

## 주의사항

- **보안**: `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요!
- **RLS**: 프로덕션에서는 반드시 RLS 정책을 활성화하고 테스트하세요.
- **환경 변수**: 개발 환경 변수와 프로덕션 환경 변수를 구분하세요.

