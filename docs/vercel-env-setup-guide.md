# Vercel 환경 변수 설정 가이드

## 1단계: Vercel Dashboard 접속

1. 브라우저에서 [vercel.com](https://vercel.com) 접속
2. 우측 상단의 **"Sign In"** 또는 **"Log In"** 클릭
3. GitHub 계정으로 로그인 (또는 다른 계정으로 로그인)

## 2단계: 프로젝트 선택

1. 로그인 후 대시보드에서 배포한 프로젝트를 찾아 클릭
2. 프로젝트 페이지로 이동

## 3단계: Settings 메뉴로 이동

1. 프로젝트 페이지 상단 메뉴에서 **"Settings"** 탭 클릭
2. 왼쪽 사이드바에서 **"Environment Variables"** 클릭
   - 또는 Settings 페이지에서 스크롤하여 "Environment Variables" 섹션 찾기

## 4단계: Clerk 환경 변수 가져오기

### 4-1. Clerk Dashboard 접속

1. 새 탭에서 [dashboard.clerk.com](https://dashboard.clerk.com) 접속
2. 로그인
3. 프로젝트 선택 (또는 새로 생성)

### 4-2. API Keys 확인

1. 왼쪽 사이드바에서 **"API Keys"** 클릭
2. **프로덕션 환경** 키 확인:
   - **Publishable Key**: `pk_live_...`로 시작하는 키
   - **Secret Key**: `sk_live_...`로 시작하는 키
   - ⚠️ **주의**: 개발 키(`pk_test_...`, `sk_test_...`)가 아닌 프로덕션 키를 사용해야 합니다!

### 4-3. Clerk 환경 변수 추가

Vercel의 "Environment Variables" 페이지로 돌아와서 다음 변수들을 추가:

#### 1) NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- **Key**: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- **Value**: Clerk Dashboard의 "Publishable Key" (프로덕션: `pk_live_...`)
- **Environment**: Production, Preview, Development 모두 체크
- **"Add"** 버튼 클릭

#### 2) CLERK_SECRET_KEY
- **Key**: `CLERK_SECRET_KEY`
- **Value**: Clerk Dashboard의 "Secret Key" (프로덕션: `sk_live_...`)
- **Environment**: Production, Preview, Development 모두 체크
- **"Add"** 버튼 클릭

#### 3) NEXT_PUBLIC_CLERK_SIGN_IN_URL
- **Key**: `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- **Value**: `/sign-in`
- **Environment**: Production, Preview, Development 모두 체크
- **"Add"** 버튼 클릭

#### 4) NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL
- **Key**: `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL`
- **Value**: Vercel 배포 URL (예: `https://your-project-name.vercel.app`)
  - Vercel 프로젝트 페이지에서 배포 URL 확인
  - 또는 커스텀 도메인 사용 시 해당 도메인 입력
- **Environment**: Production만 체크 (또는 모두 체크)
- **"Add"** 버튼 클릭

#### 5) NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL
- **Key**: `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL`
- **Value**: Vercel 배포 URL (예: `https://your-project-name.vercel.app`)
  - 위와 동일한 URL 사용
- **Environment**: Production만 체크 (또는 모두 체크)
- **"Add"** 버튼 클릭

## 5단계: Supabase 환경 변수 가져오기

### 5-1. Supabase Dashboard 접속

1. 새 탭에서 [supabase.com](https://supabase.com) 접속
2. 로그인
3. 프로젝트 선택

### 5-2. API Settings 확인

1. 왼쪽 사이드바에서 **"Settings"** (⚙️ 아이콘) 클릭
2. **"API"** 메뉴 클릭

### 5-3. Supabase 환경 변수 가져오기

API Settings 페이지에서 다음 정보 확인:

#### 1) NEXT_PUBLIC_SUPABASE_URL
- **Key**: `NEXT_PUBLIC_SUPABASE_URL`
- **Value**: "Project URL" 섹션의 URL (예: `https://xxxxx.supabase.co`)
- **Environment**: Production, Preview, Development 모두 체크
- **"Add"** 버튼 클릭

#### 2) NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value**: "Project API keys" 섹션의 **"anon" "public"** 키
  - "Reveal" 버튼을 클릭하여 키 표시
- **Environment**: Production, Preview, Development 모두 체크
- **"Add"** 버튼 클릭

#### 3) SUPABASE_SERVICE_ROLE_KEY
- **Key**: `SUPABASE_SERVICE_ROLE_KEY`
- **Value**: "Project API keys" 섹션의 **"service_role" "secret"** 키
  - ⚠️ **중요**: 이 키는 관리자 권한이므로 절대 공개하지 마세요!
  - "Reveal" 버튼을 클릭하여 키 표시
- **Environment**: Production, Preview, Development 모두 체크
- **"Add"** 버튼 클릭

#### 4) NEXT_PUBLIC_STORAGE_BUCKET
- **Key**: `NEXT_PUBLIC_STORAGE_BUCKET`
- **Value**: `uploads`
- **Environment**: Production, Preview, Development 모두 체크
- **"Add"** 버튼 클릭

## 6단계: 환경 변수 확인

모든 환경 변수를 추가한 후:

1. Vercel "Environment Variables" 페이지에서 추가된 변수 목록 확인
2. 각 변수가 Production, Preview, Development에 올바르게 설정되었는지 확인

## 7단계: 배포 재시도

### 방법 1: 자동 재배포 (권장)

1. GitHub에 코드를 푸시하면 Vercel이 자동으로 재배포합니다:
   ```bash
   git add .
   git commit -m "Update middleware"
   git push
   ```

### 방법 2: 수동 재배포

1. Vercel 프로젝트 페이지에서 **"Deployments"** 탭 클릭
2. 최신 배포 항목의 **"⋯"** (점 3개) 메뉴 클릭
3. **"Redeploy"** 클릭
4. **"Use existing Build Cache"** 체크 해제 (환경 변수 변경사항 반영)
5. **"Redeploy"** 버튼 클릭

## 8단계: 배포 확인

1. 배포가 완료될 때까지 대기 (약 2-3분)
2. 배포 완료 후 제공된 URL로 접속
3. 홈페이지가 정상적으로 로드되는지 확인
4. 로그인/회원가입 기능 테스트

## 문제 해결

### 환경 변수가 적용되지 않는 경우

1. **배포 재시도**: 환경 변수 추가 후 반드시 재배포해야 합니다
2. **캐시 확인**: "Use existing Build Cache" 체크 해제 후 재배포
3. **키 확인**: Clerk와 Supabase에서 올바른 키를 복사했는지 확인
4. **공백 확인**: 키 값 앞뒤에 공백이 없는지 확인

### 여전히 오류가 발생하는 경우

1. Vercel Dashboard → Deployments → 최신 배포 → "Logs" 확인
2. 오류 메시지에서 어떤 환경 변수가 누락되었는지 확인
3. Clerk Dashboard와 Supabase Dashboard에서 키가 올바른지 재확인

## 환경 변수 체크리스트

다음 환경 변수가 모두 설정되어 있는지 확인:

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (프로덕션: `pk_live_...`)
- [ ] `CLERK_SECRET_KEY` (프로덕션: `sk_live_...`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (= `/sign-in`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` (= 배포 URL)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` (= 배포 URL)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (= Supabase 프로젝트 URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (= Supabase anon key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (= Supabase service_role key)
- [ ] `NEXT_PUBLIC_STORAGE_BUCKET` (= `uploads`)

## 참고 사항

### 환경 변수 이름 규칙

- `NEXT_PUBLIC_`로 시작하는 변수는 클라이언트 사이드에서도 사용 가능
- `NEXT_PUBLIC_`가 없는 변수는 서버 사이드에서만 사용 가능

### 보안 주의사항

- `SUPABASE_SERVICE_ROLE_KEY`는 절대 공개하지 마세요!
- `CLERK_SECRET_KEY`도 공개하지 마세요!
- GitHub에 `.env` 파일을 커밋하지 마세요 (이미 `.gitignore`에 포함됨)

### 프로덕션 vs 개발 키

- **프로덕션**: `pk_live_...`, `sk_live_...` (Clerk)
- **개발**: `pk_test_...`, `sk_test_...` (Clerk)
- Vercel 배포 시에는 반드시 프로덕션 키를 사용하세요!

