/**
 * @file app/api/likes/route.ts
 * @description 좋아요 API
 * POST: 좋아요 추가/제거 (토글)
 * GET: 좋아요 상태 확인
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { auth, clerkClient, currentUser } from "@clerk/nextjs/server";

/**
 * POST: 좋아요 추가/제거 (토글)
 * Body: { post_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[Likes API] 좋아요 토글 시작");

    // 인증 확인 (여러 방법 시도)
    let user = await currentUser();
    let userId = user?.id;
    
    // currentUser()가 실패하면 auth() 시도
    if (!userId) {
      console.log("[Likes API] currentUser() 실패, auth() 시도");
      const authResult = await auth();
      console.log("Auth result:", { userId: authResult?.userId, sessionId: authResult?.sessionId });
      userId = authResult?.userId;
      
      // auth()로 userId를 얻었으면 Clerk에서 사용자 정보 가져오기
      if (userId && !user) {
        console.log("[Likes API] Clerk client로 사용자 정보 조회");
        const client = await clerkClient();
        user = await client.users.getUser(userId);
      }
    }
    
    if (!userId || !user) {
      console.error("[Likes API] 인증 실패:");
      console.error("- userId:", userId);
      console.error("- user:", user ? "존재" : "없음");
      console.groupEnd();
      return NextResponse.json(
        { 
          error: "Unauthorized",
          message: "로그인이 필요합니다. 먼저 로그인해주세요."
        }, 
        { status: 401 }
      );
    }
    
    console.log("[Likes API] 인증 성공, userId:", userId);

    // 사용자 정보 조회 (Supabase users 테이블에서)
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[Likes API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      console.error("[Likes API] 필수 필드 누락: post_id");
      console.groupEnd();
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    // 기존 좋아요 확인
    const { data: existingLike, error: checkError } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userData.id)
      .eq("post_id", post_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116은 "not found" 에러 (정상)
      console.error("[Likes API] 좋아요 확인 실패:", checkError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to check like", details: checkError.message },
        { status: 500 }
      );
    }

    if (existingLike) {
      // 좋아요 제거
      const { error: deleteError } = await supabase
        .from("likes")
        .delete()
        .eq("id", existingLike.id);

      if (deleteError) {
        console.error("[Likes API] 좋아요 제거 실패:", deleteError);
        console.groupEnd();
        return NextResponse.json(
          { error: "Failed to unlike", details: deleteError.message },
          { status: 500 }
        );
      }

      console.log("[Likes API] 좋아요 제거 성공:", post_id);
      console.groupEnd();

      return NextResponse.json({
        success: true,
        is_liked: false,
        message: "Unlike successful",
      });
    } else {
      // 좋아요 추가
      const { data, error: insertError } = await supabase
        .from("likes")
        .insert({
          user_id: userData.id,
          post_id,
        })
        .select()
        .single();

      if (insertError) {
        console.error("[Likes API] 좋아요 추가 실패:", insertError);
        console.groupEnd();
        return NextResponse.json(
          { error: "Failed to like", details: insertError.message },
          { status: 500 }
        );
      }

      console.log("[Likes API] 좋아요 추가 성공:", post_id);
      console.groupEnd();

      return NextResponse.json({
        success: true,
        is_liked: true,
        data,
        message: "Like successful",
      });
    }
  } catch (error) {
    console.error("[Likes API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET: 좋아요 상태 확인
 * Query: post_id (필수), user_id (선택, 현재 사용자 기본)
 */
export async function GET(request: NextRequest) {
  try {
    console.group("[Likes API] 좋아요 상태 확인 시작");

    // 인증 확인 (여러 방법 시도)
    let user = await currentUser();
    let userId = user?.id;
    
    // currentUser()가 실패하면 auth() 시도
    if (!userId) {
      console.log("[Likes API] currentUser() 실패, auth() 시도");
      const authResult = await auth();
      userId = authResult?.userId;
      
      // auth()로 userId를 얻었으면 Clerk에서 사용자 정보 가져오기
      if (userId && !user) {
        const client = await clerkClient();
        user = await client.users.getUser(userId);
      }
    }
    
    if (!userId || !user) {
      console.error("[Likes API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    console.log("[Likes API] 인증 성공, userId:", userId);

    const searchParams = request.nextUrl.searchParams;
    const post_id = searchParams.get("post_id");

    if (!post_id) {
      console.error("[Likes API] 필수 파라미터 누락: post_id");
      console.groupEnd();
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    // 사용자 정보 조회
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[Likes API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 좋아요 상태 확인
    const { data: like, error: likeError } = await supabase
      .from("likes")
      .select("id")
      .eq("user_id", userData.id)
      .eq("post_id", post_id)
      .single();

    if (likeError && likeError.code !== "PGRST116") {
      console.error("[Likes API] 좋아요 확인 실패:", likeError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to check like", details: likeError.message },
        { status: 500 }
      );
    }

    const is_liked = !!like;

    console.log("[Likes API] 좋아요 상태 확인 성공:", { post_id, is_liked });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      is_liked,
    });
  } catch (error) {
    console.error("[Likes API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

