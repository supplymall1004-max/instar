import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * Clerk 사용자를 Supabase users 테이블에 동기화하는 API
 *
 * 클라이언트에서 로그인 후 이 API를 호출하여 사용자 정보를 Supabase에 저장합니다.
 * 이미 존재하는 경우 업데이트하고, 없으면 새로 생성합니다.
 */
export async function POST() {
  try {
    // Clerk 인증 확인 (여러 방법 시도)
    console.group("[Sync User API] 인증 확인 시작");
    
    // 방법 1: currentUser() 사용 (권장)
    let clerkUser = await currentUser();
    let userId = clerkUser?.id;

    // 방법 2: currentUser()가 실패하면 auth() 사용
    if (!userId) {
      console.log("[Sync User API] currentUser() 실패, auth() 시도");
      const authResult = await auth();
      console.log("Auth result:", { userId: authResult?.userId, sessionId: authResult?.sessionId });
      userId = authResult?.userId;

      // auth()로 userId를 얻었으면 Clerk에서 사용자 정보 가져오기
      if (userId && !clerkUser) {
        console.log("[Sync User API] Clerk client로 사용자 정보 조회");
        const client = await clerkClient();
        clerkUser = await client.users.getUser(userId);
      }
    }

    if (!userId || !clerkUser) {
      console.error("[Sync User API] 인증 실패:");
      console.error("- userId:", userId);
      console.error("- clerkUser:", clerkUser ? "존재" : "없음");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Sync User API] 인증 성공, userId:", userId);
    console.log("Clerk user:", { 
      id: clerkUser.id, 
      name: clerkUser.fullName || clerkUser.username || "Unknown" 
    });
    console.groupEnd();

    // Supabase에 사용자 정보 동기화
    console.group("[Sync User API] Supabase 동기화 시작");
    const supabase = getServiceRoleClient();
    console.log("Supabase 클라이언트 생성 완료");

    const syncData = {
      clerk_id: clerkUser.id,
      name:
        clerkUser.fullName ||
        clerkUser.username ||
        clerkUser.emailAddresses[0]?.emailAddress ||
        "Unknown",
    };
    console.log("동기화할 데이터:", syncData);

    const { data, error } = await supabase
      .from("users")
      .upsert(syncData, {
        onConflict: "clerk_id",
      })
      .select()
      .single();

    if (error) {
      console.error("[Sync User API] Supabase 동기화 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to sync user", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Sync User API] Supabase 동기화 성공:", data);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      user: data,
    });
  } catch (error) {
    console.error("[Sync User API] 예기치 않은 오류:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack trace");
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
