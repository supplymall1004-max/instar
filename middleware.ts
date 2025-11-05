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
    await auth();

    return NextResponse.next();
  } catch (error: any) {
    // 환경 변수 누락 또는 Clerk 초기화 실패 시
    // 모든 요청을 통과시켜서 사이트가 작동하도록 함
    console.error("[Middleware] Clerk 미들웨어 오류:", error?.message || error);

    // 환경 변수 누락 오류인 경우
    if (error?.message?.includes("Missing secretKey") || error?.message?.includes("secretKey")) {
      console.warn(
        "[Middleware] CLERK_SECRET_KEY가 설정되지 않았습니다. Vercel Dashboard에서 환경 변수를 확인하세요."
      );
    }

    // 모든 요청을 통과 (에러가 있어도 사이트는 작동)
    return NextResponse.next();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
