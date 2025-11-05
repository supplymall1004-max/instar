# Vercel 배포 단계별 가이드

## 방법 1: Vercel 웹사이트를 통한 배포 (가장 쉬운 방법)

### 1단계: GitHub에 코드 푸시 (필수)

1. GitHub에 새 레포지토리 생성 (또는 기존 레포지토리 사용)
2. 다음 명령어로 코드 푸시:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/사용자명/레포지토리명.git
git push -u origin main
```

### 2단계: Vercel에 프로젝트 연결

1. [Vercel 웹사이트](https://vercel.com) 접속
2. "Sign Up" 또는 "Log In" 클릭
3. "Add New Project" 클릭
4. GitHub 레포지토리 선택
5. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `pnpm build` (자동 설정됨)
   - **Output Directory**: `.next` (자동 설정됨)
   - **Install Command**: `pnpm install` (자동 설정됨)

### 3단계: 환경 변수 설정

Vercel 프로젝트 설정에서 "Environment Variables" 섹션으로 이동하여 다음 변수들을 추가:

#### Clerk 환경 변수
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=https://your-domain.vercel.app
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=https://your-domain.vercel.app
```

#### Supabase 환경 변수
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**중요**: 
- 각 환경 변수는 **Production**, **Preview**, **Development** 환경에 모두 추가해야 합니다.
- `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요!

### 4단계: 배포 실행

1. "Deploy" 버튼 클릭
2. 배포가 완료될 때까지 대기 (약 2-3분)
3. 배포 완료 후 제공되는 URL로 접속하여 테스트

---

## 방법 2: Vercel CLI를 통한 배포

### 1단계: Vercel CLI 설치

```bash
npm i -g vercel
```

또는 npx 사용 (설치 없이):

```bash
npx vercel
```

### 2단계: Vercel 로그인

```bash
vercel login
```

### 3단계: 프로젝트 배포

```bash
# 개발 환경 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 4단계: 환경 변수 설정

CLI로 환경 변수 추가:

```bash
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
# ... 나머지 환경 변수들도 동일하게 추가
```

또는 Vercel 웹사이트에서 한 번에 설정하는 것이 더 편리합니다.

---

## 배포 후 확인 사항

배포가 완료된 후 다음 기능들을 확인하세요:

- [ ] 홈페이지가 정상적으로 로드되는지
- [ ] 로그인/회원가입 기능이 작동하는지
- [ ] 게시물 작성 및 조회가 가능한지
- [ ] 이미지/동영상 업로드가 작동하는지
- [ ] 좋아요, 댓글 기능이 작동하는지
- [ ] 프로필 페이지가 정상적으로 표시되는지
- [ ] 검색 기능이 작동하는지
- [ ] 모바일에서도 정상적으로 작동하는지

---

## 문제 해결

### 배포 실패 시

1. **빌드 로그 확인**: Vercel Dashboard → Deployments → 실패한 배포 클릭 → Build Logs 확인
2. **환경 변수 확인**: 모든 환경 변수가 올바르게 설정되었는지 확인
3. **로컬 빌드 테스트**: `pnpm build` 명령어로 로컬에서 빌드가 성공하는지 확인

### 환경 변수 오류

- 환경 변수가 설정되지 않으면 빌드나 런타임 에러가 발생할 수 있습니다.
- 모든 환경 변수가 Production, Preview, Development 환경에 설정되어 있는지 확인하세요.

### 이미지 로딩 문제

- `next.config.ts`에서 Supabase 도메인(`*.supabase.co`)이 `remotePatterns`에 포함되어 있는지 확인하세요.
- 이미 설정되어 있습니다.

---

## 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Clerk 배포 가이드](https://clerk.com/docs/deployments/overview)
- [Supabase 배포 가이드](https://supabase.com/docs/guides/hosting)

