/**
 * @file app/api/bookmarks/route.ts
 * @description 북마크 API
 * POST: 북마크 추가
 * DELETE: 북마크 제거
 * GET: 북마크 목록 조회
 */

import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";

/**
 * GET: 북마크 목록 조회
 * Query: postId (특정 게시물의 북마크 상태 확인)
 */
export async function GET(request: NextRequest) {
  try {
    console.group("[Bookmarks API] 북마크 조회 시작");

    const user = await currentUser();
    if (!user) {
      console.error("[Bookmarks API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceRoleClient();
    
    // 사용자 정보 조회
    const { data: userData } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (!userData) {
      console.error("[Bookmarks API] 사용자 조회 실패");
      console.groupEnd();
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get("postId");

    if (postId) {
      // 특정 게시물의 북마크 상태 확인
      const { data, error } = await supabase
        .from("bookmarks")
        .select("id")
        .eq("user_id", userData.id)
        .eq("post_id", postId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116은 "not found" 에러
        console.error("[Bookmarks API] 북마크 조회 실패:", error);
        console.groupEnd();
        return NextResponse.json(
          { error: "북마크 조회 실패", details: error.message },
          { status: 500 }
        );
      }

      console.log("[Bookmarks API] 북마크 상태 확인:", !!data);
      console.groupEnd();

      return NextResponse.json({
        success: true,
        is_bookmarked: !!data,
      });
    }

    // 전체 북마크 목록 조회
    const { data, error } = await supabase
      .from("bookmarks")
      .select(`
        id,
        post_id,
        created_at,
        post:posts(
          id,
          user_id,
          image_url,
          video_url,
          media_type,
          caption,
          created_at,
          user:users(id, clerk_id, name, username, avatar_url)
        )
      `)
      .eq("user_id", userData.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[Bookmarks API] 북마크 목록 조회 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "북마크 목록 조회 실패", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Bookmarks API] 북마크 목록 조회 성공:", data?.length || 0);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error) {
    console.error("[Bookmarks API] 예기치 않은 오류:", error);
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
 * POST: 북마크 추가
 * Body: { post_id: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[Bookmarks API] 북마크 추가 시작");

    const user = await currentUser();
    if (!user) {
      console.error("[Bookmarks API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceRoleClient();
    
    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[Bookmarks API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      console.error("[Bookmarks API] post_id 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    // 게시물 존재 확인
    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", post_id)
      .single();

    if (postError || !postData) {
      console.error("[Bookmarks API] 게시물 조회 실패:", postError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Post not found", details: postError?.message },
        { status: 404 }
      );
    }

    // 북마크 추가 (중복 시 무시)
    const { data, error } = await supabase
      .from("bookmarks")
      .insert({
        user_id: userData.id,
        post_id: post_id,
      })
      .select()
      .single();

    if (error) {
      // 중복 북마크인 경우 (UNIQUE 제약조건 위반)
      if (error.code === '23505') {
        console.log("[Bookmarks API] 이미 북마크된 게시물");
        console.groupEnd();
        return NextResponse.json({
          success: true,
          message: "Already bookmarked",
          is_bookmarked: true,
        });
      }

      console.error("[Bookmarks API] 북마크 추가 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "북마크 추가 실패", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Bookmarks API] 북마크 추가 성공");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: data,
      is_bookmarked: true,
    });
  } catch (error) {
    console.error("[Bookmarks API] 예기치 않은 오류:", error);
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
 * DELETE: 북마크 제거
 * Body: { post_id: string }
 */
export async function DELETE(request: NextRequest) {
  try {
    console.group("[Bookmarks API] 북마크 제거 시작");

    const user = await currentUser();
    if (!user) {
      console.error("[Bookmarks API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceRoleClient();
    
    // 사용자 정보 조회
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[Bookmarks API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      console.error("[Bookmarks API] post_id 누락");
      console.groupEnd();
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    // 북마크 제거
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userData.id)
      .eq("post_id", post_id);

    if (error) {
      console.error("[Bookmarks API] 북마크 제거 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "북마크 제거 실패", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Bookmarks API] 북마크 제거 성공");
    console.groupEnd();

    return NextResponse.json({
      success: true,
      is_bookmarked: false,
    });
  } catch (error) {
    console.error("[Bookmarks API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

