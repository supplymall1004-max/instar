/**
 * @file app/api/follows/list/route.ts
 * @description 팔로워/팔로잉 목록 조회 API
 * GET: 팔로워 또는 팔로잉 목록 조회
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * GET: 팔로워/팔로잉 목록 조회
 * Query: userId (필수, Clerk user ID), type (필수, 'followers' | 'following')
 */
export async function GET(request: NextRequest) {
  try {
    console.group("[Follows List API] 목록 조회 시작");

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId"); // Clerk user ID
    const type = searchParams.get("type"); // 'followers' 또는 'following'

    if (!userId || !type) {
      console.error("[Follows List API] 필수 파라미터 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "userId and type are required" },
        { status: 400 }
      );
    }

    if (type !== 'followers' && type !== 'following') {
      console.error("[Follows List API] 잘못된 type:", type);
      console.groupEnd();
      return NextResponse.json(
        { error: "type must be 'followers' or 'following'" },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // 사용자 정보 조회 (Clerk ID로)
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (userError || !userData) {
      console.error("[Follows List API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    let query;
    if (type === 'followers') {
      // 팔로워 목록: 이 사용자를 팔로우하는 사람들
      query = supabase
        .from("follows")
        .select(`
          id,
          follower_id,
          created_at,
          follower:users!follows_follower_id_fkey(id, clerk_id, name, username, avatar_url)
        `)
        .eq("following_id", userData.id)
        .order("created_at", { ascending: false });
    } else {
      // 팔로잉 목록: 이 사용자가 팔로우하는 사람들
      query = supabase
        .from("follows")
        .select(`
          id,
          following_id,
          created_at,
          following:users!follows_following_id_fkey(id, clerk_id, name, username, avatar_url)
        `)
        .eq("follower_id", userData.id)
        .order("created_at", { ascending: false });
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Follows List API] 목록 조회 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "목록 조회 실패", details: error.message },
        { status: 500 }
      );
    }

    // 데이터 정규화
    const users = (data || []).map((item: any) => {
      if (type === 'followers') {
        const user = Array.isArray(item.follower) ? item.follower[0] : item.follower;
        return user;
      } else {
        const user = Array.isArray(item.following) ? item.following[0] : item.following;
        return user;
      }
    }).filter((user: any) => user != null);

    console.log(`[Follows List API] ${type} 목록 조회 성공:`, users.length);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: users,
      type,
    });
  } catch (error) {
    console.error("[Follows List API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

