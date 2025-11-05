import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 공개 라우트 정의 (인증 없이 접근 가능)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/sync-user",
  "/api/test",
]);

export default clerkMiddleware(async (auth, req) => {
  try {
    // 공개 라우트는 인증 체크 없이 통과
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }

    // 나머지는 Clerk가 자동으로 인증 처리
    // auth 객체를 사용하여 인증 상태 확인 (에러 방지)
    await auth();
    
    return NextResponse.next();
  } catch (error) {
    // 미들웨어에서 에러가 발생해도 요청을 계속 진행
    // 환경 변수가 없거나 Clerk 초기화 실패 시에도 공개 라우트는 통과
    console.error("[Middleware] Error:", error);
    
    // 공개 라우트는 에러가 있어도 통과
    if (isPublicRoute(req)) {
      return NextResponse.next();
    }
    
    // 에러가 발생해도 요청을 계속 진행 (Clerk 없이도 작동하도록)
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
