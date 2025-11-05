# 빠른 환경 변수 설정 가이드 (요약)

## Vercel에서 환경 변수 추가하는 방법

1. **Vercel Dashboard 접속** → 프로젝트 선택 → **Settings** → **Environment Variables**

2. **각 환경 변수 추가**:
   - **Key** 입력란에 변수 이름 입력
   - **Value** 입력란에 값 입력
   - **Environment** 체크박스 선택 (Production, Preview, Development)
   - **"Add"** 버튼 클릭

## 필요한 환경 변수 목록

### Clerk (5개)

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=https://your-app.vercel.app
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=https://your-app.vercel.app
```

**가져오는 곳**: [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys

### Supabase (4개)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_STORAGE_BUCKET=uploads
```

**가져오는 곳**: [supabase.com](https://supabase.com) → 프로젝트 → Settings → API

## 중요 팁

1. **모든 환경 변수는 Production, Preview, Development 모두에 추가**
2. **환경 변수 추가 후 반드시 재배포 필요**
3. **Clerk 키는 프로덕션 키(`pk_live_...`) 사용 필수**
4. **배포 URL은 Vercel 프로젝트 페이지에서 확인**

