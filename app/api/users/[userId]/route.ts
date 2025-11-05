/**
 * @file app/api/users/[userId]/route.ts
 * @description 사용자 프로필 API
 * GET: 사용자 정보 조회 (통계 포함)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";

/**
 * GET: 사용자 정보 조회
 * 통계 포함 (게시물 수, 팔로워 수, 팔로잉 수)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    console.group("[User Profile API] 사용자 정보 조회 시작");
    const { userId } = await params;

    const supabase = getServiceRoleClient();

    // 사용자 정보 조회 (clerk_id로 조회)
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (userError || !user) {
      console.error("[User Profile API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 통계 조회
    const [postsResult, followersResult, followingResult] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", user.id),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", user.id),
    ]);

    // 현재 사용자가 이 사용자를 팔로우하는지 확인
    const currentUserData = await currentUser();
    let isFollowing = false;

    if (currentUserData) {
      const { data: currentUserSupabase } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentUserData.id)
        .single();

      if (currentUserSupabase) {
        const { data: followCheck } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserSupabase.id)
          .eq("following_id", user.id)
          .single();

        isFollowing = !!followCheck;
      }
    }

    const profile = {
      ...user,
      stats: {
        posts: postsResult.count || 0,
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
      },
      is_following: isFollowing,
      is_own_profile: currentUserData?.id === userId,
    };

    console.log("[User Profile API] 사용자 정보 조회 성공:", userId);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("[User Profile API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

