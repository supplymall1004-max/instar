# Instagram SNS 프로젝트 - 개발 TODO

## 프로젝트 개요
- **목표**: Instagram 웹 UI/UX 재현, 2-3일 내 MVP 완성
- **기술 스택**: Next.js 15, TypeScript, Tailwind CSS, Supabase, Clerk
- **현재 상태**: 기본 보일러플레이트 (users 테이블만 존재)

---

## Phase 0: 프로젝트 기반 설정 ✅

### 0-1. 환경 설정 및 스타일링 ✅
- [x] Tailwind CSS Instagram 컬러 스키마 추가 (`app/globals.css`)
  - [x] Instagram 브랜드 컬러 변수 정의 (#0095f6, #ed4956 등)
  - [x] 배경색 변수 정의 (#fafafa, #ffffff, #dbdbdb)
  - [x] 텍스트 컬러 변수 정의 (#262626, #8e8e8e)
- [x] 타이포그래피 스타일 정의
  - [x] 폰트 크기 변수 (12px, 14px, 16px, 20px)
  - [x] 폰트 굵기 변수 (400, 600, 700)
- [x] 반응형 브레이크포인트 유틸리티 함수 생성 (`lib/utils/responsive.ts`)

### 0-2. TypeScript 타입 정의 ✅
- [x] `types/index.ts` 파일 생성
  - [x] `User` 타입 (Clerk 연동)
  - [x] `Post` 타입
  - [x] `Comment` 타입
  - [x] `Like` 타입
  - [x] `Follow` 타입
  - [x] API 응답 타입들

### 0-3. 공통 컴포넌트 및 유틸리티 ✅
- [x] `components/ui/avatar.tsx` - 프로필 이미지 컴포넌트
- [x] `components/ui/skeleton.tsx` - 로딩 스켈레톤 UI
- [x] `lib/utils/image.ts` - 이미지 처리 유틸리티
- [x] `lib/utils/date.ts` - 시간 포맷팅 유틸리티 ("3시간 전" 등)

---

## Phase 1: 데이터베이스 스키마 설계 및 생성 ✅

### 1-1. 데이터베이스 테이블 생성 ✅
- [x] `supabase/migrations/20251105013534_add_user_fields.sql`
  - [x] users 테이블에 username, avatar_url, bio 필드 추가
  - [x] username 인덱스 생성
- [x] `supabase/migrations/20251105013535_create_posts_table.sql`
  - [x] posts 테이블 생성 (id, user_id, image_url, caption, created_at, updated_at)
  - [x] 외래키 제약조건 (users 테이블 참조)
  - [x] 인덱스 생성 (user_id, created_at)
  - [x] updated_at 자동 업데이트 트리거
  - [x] RLS 비활성화 (개발 환경)
- [x] `supabase/migrations/20251105013536_create_likes_table.sql`
  - [x] likes 테이블 생성 (id, user_id, post_id, created_at)
  - [x] 복합 유니크 제약조건 (user_id, post_id)
  - [x] 외래키 제약조건 (users, posts 테이블 참조)
  - [x] 인덱스 생성 (user_id, post_id, created_at)
  - [x] RLS 비활성화 (개발 환경)
- [x] `supabase/migrations/20251105013537_create_comments_table.sql`
  - [x] comments 테이블 생성 (id, post_id, user_id, content, created_at)
  - [x] 외래키 제약조건 (users, posts 테이블 참조)
  - [x] 인덱스 생성 (post_id, user_id, created_at)
  - [x] RLS 비활성화 (개발 환경)
- [x] `supabase/migrations/20251105013538_create_follows_table.sql`
  - [x] follows 테이블 생성 (id, follower_id, following_id, created_at)
  - [x] 복합 유니크 제약조건 (follower_id, following_id)
  - [x] 외래키 제약조건 (users 테이블 참조)
  - [x] 자기 자신 팔로우 방지 체크 제약조건
  - [x] 인덱스 생성 (follower_id, following_id, created_at)
  - [x] RLS 비활성화 (개발 환경)

### 1-2. Supabase Storage 설정 ✅
- [x] `supabase/migrations/20251105013539_create_posts_storage.sql`
  - [x] `posts` 버킷 생성 (공개 버킷)
  - [x] 파일 크기 제한 설정 (5MB)
  - [x] 허용 파일 형식 설정 (JPEG, JPG, PNG, WebP)
  - [x] Storage RLS 비활성화 (개발 환경)
- [x] 이미지 업로드 경로 구조 정의
  - [x] 경로 구조 문서화 (`docs/storage-structure.md`)
  - [x] 경로 형식: `{user_id}/{post_id}/{filename}`
  - [x] 예시 코드 포함

---

## Phase 2: 레이아웃 구조 구현 ✅

### 2-1. Route Group 및 레이아웃 구조 ✅
- [x] `app/(main)/layout.tsx` 생성
  - [x] Sidebar 컴포넌트 통합 (Desktop/Tablet)
  - [x] Header 컴포넌트 통합 (Mobile)
  - [x] BottomNav 컴포넌트 통합 (Mobile)
  - [x] 반응형 레이아웃 로직 (Desktop: ml-244px, Tablet: ml-72px, Mobile: ml-0)
  - [x] 메인 콘텐츠 영역 최대 너비 630px 설정
  - [x] Instagram 배경색 적용

### 2-2. Sidebar 컴포넌트 ✅
- [x] `components/layout/sidebar.tsx` 생성
  - [x] Desktop: 244px 너비, 아이콘 + 텍스트 메뉴
  - [x] Tablet: 72px 너비, 아이콘만 표시 (IG 로고)
  - [x] Mobile: 숨김 처리 (hidden md:flex)
  - [x] 메뉴 항목: 홈, 검색, 만들기, 알림, 프로필
  - [x] Active 상태 표시 (볼드, 프로필 페이지 경로 포함)
  - [x] Hover 효과 (hover:bg-gray-50)
  - [x] Clerk 인증 연동 (프로필 링크에 userId 포함)

### 2-3. Mobile Header 컴포넌트 ✅
- [x] `components/layout/header.tsx` 생성
  - [x] 높이 60px, 고정 헤더 (fixed top-0)
  - [x] Instagram 로고 (왼쪽)
  - [x] 알림, DM, 프로필 아이콘 (오른쪽)
  - [x] Mobile에서만 표시 (md:hidden)
  - [x] Clerk 인증 연동 (프로필 링크에 userId 포함)

### 2-4. Bottom Navigation 컴포넌트 ✅
- [x] `components/layout/bottom-nav.tsx` 생성
  - [x] 높이 50px, 하단 고정 (fixed bottom-0)
  - [x] 5개 아이콘: 홈, 검색, 만들기, 알림, 프로필
  - [x] Active 상태 표시 (프로필 페이지 경로 포함)
  - [x] Mobile에서만 표시 (md:hidden)
  - [x] Clerk 인증 연동 (프로필 링크에 userId 포함)
  - [x] 접근성 (aria-label 추가)

---

## Phase 3: 홈 피드 페이지 구현 ✅

### 3-1. PostCard 컴포넌트 기본 구조 ✅
- [x] `components/post/post-card.tsx` 생성
  - [x] 헤더 섹션 (프로필 이미지, 사용자명, 시간, 메뉴)
  - [x] 이미지 영역 (1:1 정사각형, aspect-square)
  - [x] 액션 버튼 섹션 (좋아요, 댓글, 공유, 북마크)
  - [x] 컨텐츠 섹션 (좋아요 수, 캡션, 댓글 미리보기)
  - [x] 반응형 스타일링 (Instagram 스타일)

### 3-2. PostCard 상세 기능 ✅
- [x] 좋아요 버튼 클릭 핸들러 (optimistic update)
  - [x] 하트 애니메이션 (active:scale-125)
  - [x] 빈 하트 ↔ 빨간 하트 토글
- [x] 더블탭 좋아요 기능 (모바일)
  - [x] 더블탭 감지 로직 (300ms 딜레이)
  - [x] 큰 하트 애니메이션 (fadeInOut, 1초)
  - [x] fadeInOut 키프레임 애니메이션 추가
- [x] 캡션 "더 보기" 토글 기능 (100자 초과 시)
- [x] 댓글 미리보기 (댓글 수 표시, "댓글 N개 모두 보기" 링크)
  - [x] 실제 댓글 목록은 Phase 6에서 구현 예정
- [x] 이미지 클릭 시 상세 페이지 이동
  - [x] Mobile: 상세 페이지로 이동
  - [x] Desktop: 상세 페이지로 이동 (Phase 9에서 모달 구현 예정)

### 3-3. PostCard Skeleton UI ✅
- [x] `components/post/post-card-skeleton.tsx` 생성
  - [x] Shimmer 애니메이션 효과 (Skeleton 컴포넌트 사용)
  - [x] PostCard와 동일한 레이아웃
  - [x] 헤더, 이미지, 액션 버튼, 컨텐츠 영역 모두 포함

### 3-4. PostFeed 컴포넌트 ✅
- [x] `components/post/post-feed.tsx` 생성
  - [x] 게시물 목록 렌더링
  - [x] Skeleton UI 표시 (로딩 중, 3개 표시)
  - [x] 빈 상태 처리 ("게시물이 없습니다.")
  - [x] 무한 스크롤 구현 (Intersection Observer)
  - [x] 페이지네이션 로직 (10개씩)

### 3-5. 게시물 API 구현 ✅
- [x] `app/api/posts/route.ts` 생성
  - [x] GET: 게시물 목록 조회 (페이지네이션)
    - [x] 쿼리 파라미터: page, pageSize, userId
    - [x] 사용자 정보 조인 (users 테이블)
    - [x] 좋아요 수, 댓글 수 집계
    - [x] 시간 역순 정렬 (created_at DESC)
  - [x] POST: 게시물 생성
    - [x] Clerk 인증 확인
    - [x] 이미지 URL, 캡션 저장
    - [x] 사용자 정보 조인 반환
- [x] `app/api/posts/[postId]/route.ts` 생성
  - [x] GET: 게시물 상세 조회
    - [x] 사용자 정보 조인
    - [x] 좋아요 수, 댓글 수 집계
  - [x] DELETE: 게시물 삭제 (본인만)
    - [x] 권한 확인 (Clerk user ID 비교)
    - [x] 상세 로깅

### 3-6. 홈 페이지 구현 ✅
- [x] `app/(main)/page.tsx` 구현
  - [x] PostFeed 컴포넌트 통합
  - [x] 최대 너비 630px 설정
  - [x] 무한 스크롤 (Intersection Observer)
  - [x] 페이지네이션 로직 (10개씩)

---

## Phase 4: 좋아요 기능 구현 ✅

### 4-1. 좋아요 API ✅
- [x] `app/api/likes/route.ts` 생성
  - [x] POST: 좋아요 추가
  - [x] DELETE: 좋아요 제거
  - [x] GET: 좋아요 상태 확인

### 4-2. 좋아요 UI 및 애니메이션 ✅
- [x] PostCard에 좋아요 상태 표시
  - [x] 빈 하트 ↔ 빨간 하트 토글
  - [x] 클릭 시 scale(1.3) → scale(1) 애니메이션
- [x] 더블탭 좋아요 (모바일)
  - [x] 큰 하트 컴포넌트 생성
  - [x] 1초 후 fade out 애니메이션

### 4-3. 좋아요 수 실시간 업데이트 ✅
- [x] 클라이언트 상태 관리 (optimistic update)
- [x] 좋아요 수 포맷팅 (1,234개 형식)

---

## Phase 5: 게시물 작성 기능 ✅

### 5-1. CreatePostModal 컴포넌트 ✅
- [x] `components/post/create-post-modal.tsx` 생성
  - [x] Dialog 기반 모달
  - [x] 이미지 선택 및 미리보기
  - [x] 캡션 입력 필드 (최대 2,200자)
  - [x] 업로드 버튼 및 로딩 상태

### 5-2. 이미지 업로드 기능 ✅
- [x] Supabase Storage 업로드 로직
  - [x] 파일 크기 검증 (최대 5MB)
  - [x] 이미지 형식 검증 (jpg, png, webp)
  - [x] 업로드 진행률 표시
- [x] 이미지 미리보기 UI
  - [x] 1:1 비율 맞춤

### 5-3. 게시물 생성 API 통합 ✅
- [x] 모달에서 API 호출
- [x] 성공 시 피드 새로고침
- [x] 에러 처리 및 사용자 피드백

---

## Phase 6: 댓글 기능 구현 ✅

### 6-1. Comment 컴포넌트 ✅
- [x] `components/comment/comment-item.tsx` 생성
  - [x] 프로필 이미지, 사용자명, 내용
  - [x] 삭제 버튼 (본인만)
  - [x] 시간 표시

### 6-2. CommentList 컴포넌트 ✅
- [x] `components/comment/comment-list.tsx` 생성
  - [x] 댓글 목록 렌더링
  - [x] 스크롤 가능한 영역
  - [x] 빈 상태 처리

### 6-3. CommentForm 컴포넌트 ✅
- [x] `components/comment/comment-form.tsx` 생성
  - [x] 입력 필드 ("댓글 달기...")
  - [x] "게시" 버튼
  - [x] Enter 키 제출
  - [x] 로딩 상태

### 6-4. 댓글 API ✅
- [x] `app/api/comments/route.ts` 생성
  - [x] POST: 댓글 작성
  - [x] GET: 댓글 목록 조회 (postId 파라미터)
- [x] `app/api/comments/[commentId]/route.ts` 생성
  - [x] DELETE: 댓글 삭제 (본인만)

### 6-5. PostCard에 댓글 통합 ✅
- [x] 댓글 미리보기 (댓글 수 표시)
- [x] "댓글 N개 모두 보기" 링크
- [x] 게시물 상세 페이지에 댓글 작성 폼 통합

---

## Phase 7: 프로필 페이지 구현 ✅

### 7-1. 프로필 헤더 컴포넌트 ✅
- [x] `components/profile/profile-header.tsx` 생성
  - [x] 프로필 이미지 (150px Desktop / 90px Mobile)
  - [x] 사용자명, 통계 (게시물/팔로워/팔로잉)
  - [x] "팔로우" / "팔로잉" 버튼
  - [x] 본인 프로필: "프로필 편집" 버튼
  - [x] Bio 표시

### 7-2. 프로필 API ✅
- [x] `app/api/users/[userId]/route.ts` 생성
  - [x] GET: 사용자 정보 조회
  - [x] 통계 포함 (게시물 수, 팔로워 수, 팔로잉 수)
- [x] `app/api/posts/route.ts` 수정
  - [x] userId 쿼리 파라미터로 필터링 추가 (이미 구현됨)

### 7-3. PostGrid 컴포넌트 ✅
- [x] `components/profile/post-grid.tsx` 생성
  - [x] 3열 그리드 레이아웃
  - [x] 1:1 정사각형 썸네일
  - [x] Hover 시 좋아요/댓글 수 표시
  - [x] 클릭 시 상세 페이지 이동

### 7-4. 프로필 페이지 구현 ✅
- [x] `app/(main)/profile/[userId]/page.tsx` 생성
  - [x] ProfileHeader 통합
  - [x] PostGrid 통합
  - [x] 탭 메뉴 (게시물, 릴스, 태그됨) - UI만
  - [x] 본인 프로필 처리

---

## Phase 8: 팔로우 기능 구현 ✅

### 8-1. 팔로우 API ✅
- [x] `app/api/follows/route.ts` 생성
  - [x] POST: 팔로우 추가
  - [x] DELETE: 팔로우 제거
  - [x] GET: 팔로우 상태 확인

### 8-2. 팔로우 버튼 UI ✅
- [x] ProfileHeader에 팔로우 버튼 통합
  - [x] "팔로우" 상태 (파란색 버튼)
  - [x] "팔로잉" 상태 (회색 버튼)
  - [x] Hover 시 "언팔로우" (빨간 테두리)
- [x] 클릭 시 즉시 UI 업데이트 (optimistic update)

### 8-3. 팔로워/팔로잉 통계 업데이트 ✅
- [x] 팔로우/언팔로우 시 실시간 통계 업데이트
- [x] 클라이언트 상태 관리

---

## Phase 9: 게시물 상세 모달/페이지 ✅

### 9-1. PostModal 컴포넌트 (Desktop) ✅
- [x] `components/post/post-modal.tsx` 생성
  - [x] Dialog 기반 모달
  - [x] 좌측: 이미지 (50%)
  - [x] 우측: 댓글 목록 및 작성 폼 (50%)
  - [x] 닫기 버튼
  - [x] 좋아요 기능 통합
  - [x] 액션 버튼 (좋아요, 댓글, 공유, 북마크)
  - [x] 캡션 및 시간 표시
  - [ ] 이미지 네비게이션 (여러 이미지 시, 1차 제외) - 현재는 단일 이미지만 지원

### 9-2. 게시물 상세 페이지 (Mobile) ✅
- [x] `app/(main)/post/[postId]/page.tsx` 생성
  - [x] 전체 페이지 레이아웃
  - [x] 이미지 (상단)
  - [x] 댓글 영역 (하단)
  - [x] 뒤로가기 버튼
- [x] `components/post/post-detail.tsx` 생성
  - [x] 게시물 상세 컴포넌트
  - [x] 댓글 목록 및 작성 폼 통합

### 9-3. PostCard 클릭 핸들링 ✅
- [x] Desktop: 모달 열기
- [x] Mobile: 상세 페이지 이동
- [x] 라우팅 통합
- [x] 화면 크기 체크 로직 (768px 기준)
- [x] PostFeed에서 모달 상태 관리

---

## Phase 10: 반응형 최적화 및 애니메이션 ✅

### 10-1. 반응형 레이아웃 테스트 ✅
- [x] Desktop (1024px+) 테스트
  - [x] Sidebar 244px 확인 (components/layout/sidebar.tsx: `w-[244px]` lg: 브레이크포인트)
  - [x] PostCard 최대 630px 확인 (app/(main)/layout.tsx: `max-w-[630px]`)
- [x] Tablet (768px ~ 1023px) 테스트
  - [x] Icon-only Sidebar 72px 확인 (components/layout/sidebar.tsx: `w-[72px]` md: ~ lg:)
- [x] Mobile (< 768px) 테스트
  - [x] Header, BottomNav 표시 확인 (header.tsx: `md:hidden`, bottom-nav.tsx: `md:hidden`)
  - [x] Sidebar 숨김 확인 (sidebar.tsx: `hidden md:flex`)

### 10-2. 애니메이션 추가 ✅
- [x] 좋아요 하트 애니메이션 (scale) - PostCard에 구현됨
- [x] 더블탭 큰 하트 애니메이션 (fade) - PostCard에 구현됨
- [x] 모달 열기/닫기 애니메이션 - Dialog 컴포넌트에 구현됨
- [x] Skeleton Shimmer 애니메이션 - globals.css에 구현됨
- [x] 페이지 전환 애니메이션 (fade in 효과) - layout.tsx에 구현됨

### 10-3. 로딩 상태 개선 ✅
- [x] 모든 API 호출에 로딩 상태 추가
  - [x] PostFeed: 로딩 상태 및 에러 처리
  - [x] PostDetail: 로딩 상태 및 에러 처리
  - [x] PostModal: 로딩 상태 및 에러 처리
  - [x] CommentList: 로딩 상태 및 에러 처리
  - [x] SearchPage: 로딩 상태 및 에러 처리 (Skeleton UI 추가)
- [x] Skeleton UI 일관성 확인
  - [x] SearchPage에 Skeleton UI 추가
  - [x] 기존 Skeleton 컴포넌트 일관성 유지
- [x] 에러 상태 처리
  - [x] ErrorMessage 컴포넌트 생성 (일관된 에러 UI)
  - [x] 모든 주요 컴포넌트에 에러 처리 추가
  - [x] 재시도 기능 추가

---

## Phase 11: 최종 마무리 및 배포

### 11-1. 에러 핸들링 ✅
- [x] API 에러 처리 통합 (lib/utils/error-handler.ts: safeFetch 함수 생성)
- [x] 사용자 친화적 에러 메시지 (HTTP 상태 코드별 메시지 매핑)
- [x] 네트워크 에러 처리 (네트워크 연결 확인 메시지)

### 11-2. 성능 최적화
- [x] 이미지 lazy loading (PostCard, PostGrid, PostModal에 loading="lazy" 추가)
- [x] 무한 스크롤 최적화 (PostFeed에 useCallback 사용)
- [x] 불필요한 리렌더링 방지 (React.memo, useMemo)
  - [x] PostCard에 React.memo 적용
  - [x] PostGrid에 React.memo 적용
  - [x] CommentItem에 React.memo 적용
  - [x] useMemo로 isOwnPost, isOwnComment 계산 최적화

### 11-3. 접근성 (a11y)
- [x] 키보드 네비게이션 (Tab, Enter, Escape 키 지원)
  - [x] hooks/use-keyboard-navigation.ts 훅 생성
  - [x] PostModal에 Escape 키로 모달 닫기 추가
  - [x] CreatePostModal에 Escape 키로 모달 닫기 추가
- [x] ARIA 라벨 추가
  - [x] 좋아요 버튼에 aria-label, aria-pressed 추가
  - [x] 공유 버튼에 aria-label, title 추가
  - [x] 북마크 버튼에 aria-label, title 추가
  - [x] 댓글 링크에 aria-label 추가
- [ ] 색상 대비 확인 (수동 테스트 필요)

### 11-4. 테스트
- [ ] 모든 주요 기능 E2E 테스트
- [ ] 반응형 테스트 (다양한 화면 크기)
- [ ] 브라우저 호환성 테스트

### 11-5. 배포 준비 ✅
- [x] 환경 변수 설정 확인 (docs/deployment-guide.md에 문서화)
- [x] Supabase 프로덕션 설정 (docs/deployment-guide.md에 문서화)
- [x] Clerk 프로덕션 설정 (docs/deployment-guide.md에 문서화)
- [x] Vercel 배포 설정 (docs/deployment-guide.md에 문서화)

---

## 2차 확장 기능 (MVP 이후)

### Phase 12: 추가 기능 (선택사항)
- [x] 검색 기능 (사용자) - app/(main)/search/page.tsx에 구현됨
- [ ] 검색 기능 (해시태그) - 미구현
- [ ] 탐색 페이지 - 미구현
- [x] 릴스 기능 (동영상 게시물) - 프로필 페이지의 "릴스" 탭에 구현됨
- [ ] 메시지 (DM) - 미구현
- [ ] 알림 시스템 - 기본 페이지만 구현됨
- [ ] 스토리 기능 - 미구현
- [x] 동영상 지원 - CreatePostModal, PostCard, PostModal, PostGrid에 구현됨
- [ ] 여러 이미지 업로드 - 현재는 단일 이미지/동영상만 지원
- [x] 공유 버튼 기능 (Send 버튼 클릭 시 클립보드에 게시물 URL 복사)
- [x] 북마크 기능
  - [x] 북마크 테이블 및 마이그레이션 생성 (supabase/migrations/20251108000000_create_bookmarks_table.sql)
  - [x] 북마크 API 구현 (app/api/bookmarks/route.ts)
  - [x] 북마크 UI 연결 (PostCard, PostModal)
- [x] 프로필 편집 페이지 - app/(main)/profile/edit/page.tsx에 구현됨
- [x] 팔로워/팔로잉 목록 모달
  - [x] 팔로워/팔로잉 목록 API 구현 (app/api/follows/list/route.ts)
  - [x] FollowListModal 컴포넌트 생성 (components/profile/follow-list-modal.tsx)
  - [x] ProfileHeader에 통합

---

## 참고사항

### 개발 우선순위
1. **필수**: Phase 0 ~ Phase 11 (MVP 완성)
2. **선택**: Phase 12 (추가 기능)

### 기술적 고려사항
- Server Actions 우선 사용 (API Routes 대신)
- RLS는 개발 중 비활성화, 프로덕션에서 활성화
- 모든 API 호출에 로깅 추가 (디버깅용)
- TypeScript strict 모드 유지

### 파일 구조 참고
```
app/
├── (main)/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── profile/[userId]/page.tsx
│   └── post/[postId]/page.tsx
├── api/
│   ├── posts/
│   ├── likes/
│   ├── comments/
│   └── follows/
components/
├── layout/
├── post/
├── comment/
├── profile/
└── ui/
types/
└── index.ts
lib/
├── utils/
└── supabase/
```

ㅍㄷㄱㅊ디 --ㅔ갱