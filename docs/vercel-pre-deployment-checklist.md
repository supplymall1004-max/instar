# Vercel 배포 전 체크리스트

## ✅ 빌드 확인

- [x] `pnpm build` 성공
- [x] TypeScript 오류 없음
- [x] ESLint 경고만 있음 (치명적 오류 없음)

## ✅ 코드 수정 완료

- [x] 미들웨어 환경 변수 오류 핸들링 추가
- [x] 로그아웃 버튼 추가 (사이드바)
- [x] 사용하지 않는 import 제거

## 🔍 Vercel 환경 변수 확인 (필수)

다음 환경 변수가 Vercel Dashboard에 모두 설정되어 있는지 확인하세요:

### Clerk 환경 변수 (5개)
- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (프로덕션: `pk_live_...`)
- [ ] `CLERK_SECRET_KEY` (프로덕션: `sk_live_...`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (= `/sign-in`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` (= `https://instar-pied.vercel.app`)
- [ ] `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` (= `https://instar-pied.vercel.app`)

### Supabase 환경 변수 (4개)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` (= Supabase 프로젝트 URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (= Supabase anon key)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (= Supabase service_role key)
- [ ] `NEXT_PUBLIC_STORAGE_BUCKET` (= `uploads`)

**중요**: 각 환경 변수는 **Production**, **Preview**, **Development** 환경에 모두 추가해야 합니다.

## 📝 배포 단계

### 1. 코드 푸시
```bash
git add .
git commit -m "Add logout button and improve middleware error handling"
git push
```

### 2. Vercel 자동 배포 확인
- GitHub 푸시 후 Vercel이 자동으로 배포를 시작합니다
- Vercel Dashboard → Deployments에서 배포 상태 확인

### 3. 환경 변수 재확인
- Vercel Dashboard → Settings → Environment Variables
- 모든 환경 변수가 올바르게 설정되어 있는지 확인
- 환경 변수를 수정했다면 수동 재배포 필요

### 4. 배포 후 확인
- [ ] 홈페이지 로딩 확인 (`https://instar-pied.vercel.app`)
- [ ] 로그인/회원가입 기능 확인
- [ ] 로그아웃 버튼 표시 확인 (로그인 후)
- [ ] 게시물 작성 및 조회 확인
- [ ] 좋아요, 댓글 기능 확인

## ⚠️ 주의사항

1. **환경 변수 누락 시**: 미들웨어가 오류 없이 작동하지만, Clerk 인증 기능은 작동하지 않습니다
2. **프로덕션 키 사용**: 개발 키(`pk_test_...`, `sk_test_...`)가 아닌 프로덕션 키(`pk_live_...`, `sk_live_...`)를 사용해야 합니다
3. **재배포**: 환경 변수를 추가/수정한 후에는 반드시 재배포해야 합니다

## 🐛 문제 발생 시

1. **Vercel 로그 확인**: Dashboard → Deployments → 최신 배포 → Logs
2. **환경 변수 재확인**: Settings → Environment Variables
3. **빌드 로그 확인**: 배포 실패 시 빌드 로그에서 오류 확인

