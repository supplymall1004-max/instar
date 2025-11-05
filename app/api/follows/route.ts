/**
 * @file app/api/follows/route.ts
 * @description 팔로우 API
 * POST: 팔로우 추가
 * DELETE: 팔로우 제거
 * GET: 팔로우 상태 확인
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";

/**
 * POST: 팔로우 추가
 * Body: { following_id: string } (Clerk user ID)
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[Follows API] 팔로우 추가 시작");

    // 인증 확인
    const user = await currentUser();
    if (!user) {
      console.error("[Follows API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자 정보 조회
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[Follows API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { following_id } = body; // Clerk user ID

    if (!following_id) {
      console.error("[Follows API] 필수 필드 누락: following_id");
      console.groupEnd();
      return NextResponse.json(
        { error: "following_id is required" },
        { status: 400 }
      );
    }

    // 팔로우 대상 사용자 조회
    const { data: followingUser, error: followingError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", following_id)
      .single();

    if (followingError || !followingUser) {
      console.error("[Follows API] 팔로우 대상 사용자 조회 실패:", followingError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Following user not found", details: followingError?.message },
        { status: 404 }
      );
    }

    // 자기 자신 팔로우 방지
    if (userData.id === followingUser.id) {
      console.error("[Follows API] 자기 자신 팔로우 시도");
      console.groupEnd();
      return NextResponse.json(
        { error: "Cannot follow yourself" },
        { status: 400 }
      );
    }

    // 기존 팔로우 확인
    const { data: existingFollow } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userData.id)
      .eq("following_id", followingUser.id)
      .single();

    if (existingFollow) {
      console.log("[Follows API] 이미 팔로우 중");
      console.groupEnd();
      return NextResponse.json({
        success: true,
        is_following: true,
        message: "Already following",
      });
    }

    // 팔로우 추가
    const { data, error: insertError } = await supabase
      .from("follows")
      .insert({
        follower_id: userData.id,
        following_id: followingUser.id,
      })
      .select()
      .single();

    if (insertError) {
      console.error("[Follows API] 팔로우 추가 실패:", insertError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to follow", details: insertError.message },
        { status: 500 }
      );
    }

    console.log("[Follows API] 팔로우 추가 성공");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      is_following: true,
      data,
      message: "Follow successful",
    });
  } catch (error) {
    console.error("[Follows API] 예기치 않은 오류:", error);
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
 * DELETE: 팔로우 제거
 * Body: { following_id: string } (Clerk user ID)
 */
export async function DELETE(request: NextRequest) {
  try {
    console.group("[Follows API] 팔로우 제거 시작");

    // 인증 확인
    const user = await currentUser();
    if (!user) {
      console.error("[Follows API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자 정보 조회
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[Follows API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { following_id } = body; // Clerk user ID

    if (!following_id) {
      console.error("[Follows API] 필수 필드 누락: following_id");
      console.groupEnd();
      return NextResponse.json(
        { error: "following_id is required" },
        { status: 400 }
      );
    }

    // 팔로우 대상 사용자 조회
    const { data: followingUser, error: followingError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", following_id)
      .single();

    if (followingError || !followingUser) {
      console.error("[Follows API] 팔로우 대상 사용자 조회 실패:", followingError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Following user not found", details: followingError?.message },
        { status: 404 }
      );
    }

    // 팔로우 제거
    const { error: deleteError } = await supabase
      .from("follows")
      .delete()
      .eq("follower_id", userData.id)
      .eq("following_id", followingUser.id);

    if (deleteError) {
      console.error("[Follows API] 팔로우 제거 실패:", deleteError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to unfollow", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("[Follows API] 팔로우 제거 성공");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      is_following: false,
      message: "Unfollow successful",
    });
  } catch (error) {
    console.error("[Follows API] 예기치 않은 오류:", error);
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
 * GET: 팔로우 상태 확인
 * Query: following_id (필수, Clerk user ID)
 */
export async function GET(request: NextRequest) {
  try {
    console.group("[Follows API] 팔로우 상태 확인 시작");

    // 인증 확인
    const user = await currentUser();
    if (!user) {
      console.error("[Follows API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const following_id = searchParams.get("following_id"); // Clerk user ID

    if (!following_id) {
      console.error("[Follows API] 필수 파라미터 누락: following_id");
      console.groupEnd();
      return NextResponse.json(
        { error: "following_id is required" },
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
      console.error("[Follows API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 팔로우 대상 사용자 조회
    const { data: followingUser, error: followingError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", following_id)
      .single();

    if (followingError || !followingUser) {
      console.error("[Follows API] 팔로우 대상 사용자 조회 실패:", followingError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Following user not found", details: followingError?.message },
        { status: 404 }
      );
    }

    // 팔로우 상태 확인
    const { data: follow, error: followError } = await supabase
      .from("follows")
      .select("id")
      .eq("follower_id", userData.id)
      .eq("following_id", followingUser.id)
      .single();

    if (followError && followError.code !== "PGRST116") {
      console.error("[Follows API] 팔로우 확인 실패:", followError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to check follow", details: followError.message },
        { status: 500 }
      );
    }

    const is_following = !!follow;

    console.log("[Follows API] 팔로우 상태 확인 성공:", { following_id, is_following });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      is_following,
    });
  } catch (error) {
    console.error("[Follows API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

