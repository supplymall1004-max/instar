/**
 * @file app/api/posts/[postId]/route.ts
 * @description 게시물 상세 API
 * GET: 게시물 상세 조회
 * DELETE: 게시물 삭제 (본인만)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";

/**
 * GET: 게시물 상세 조회
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.group("[Post Detail API] 게시물 상세 조회 시작");
    const { postId } = await params;

    const supabase = getServiceRoleClient();

    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        image_url,
        video_url,
        media_type,
        caption,
        created_at,
        updated_at,
        user:users(id, clerk_id, name, avatar_url)
      `
      )
      .eq("id", postId)
      .single();

    if (error) {
      console.error("[Post Detail API] 조회 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "Post not found", details: error.message },
        { status: 404 }
      );
    }

    // 좋아요 수, 댓글 수, 좋아요 상태 조회
    const user = await currentUser();
    const currentUserId = user
      ? await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single()
          .then((res) => res.data?.id)
      : null;

    let likesResult: any = { count: 0, error: null };
    let commentsResult: any = { count: 0, error: null };
    let isLikedResult: any = { data: null, error: null };

    try {
      [likesResult, commentsResult, isLikedResult] = await Promise.all([
        supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", postId),
        supabase.from("comments").select("id", { count: "exact", head: true }).eq("post_id", postId),
        currentUserId
          ? supabase
              .from("likes")
              .select("id")
              .eq("post_id", postId)
              .eq("user_id", currentUserId)
              .single()
          : Promise.resolve({ data: null, error: null }),
      ]);
    } catch (error) {
      console.error("[Post Detail API] 좋아요/댓글 수 조회 중 오류:", error);
      // 기본값 사용 (이미 설정됨)
    }

    const post = {
      ...data,
      likes_count: likesResult.count || 0,
      comments_count: commentsResult.count || 0,
      is_liked: currentUserId ? !!isLikedResult.data : false,
    };

    console.log("[Post Detail API] 조회 성공:", postId);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error("[Post Detail API] 예기치 않은 오류:", error);
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
 * DELETE: 게시물 삭제 (본인만)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    console.group("[Post Detail API] 게시물 삭제 시작");
    const { postId } = await params;

    // 인증 확인
    const user = await currentUser();
    if (!user) {
      console.error("[Post Detail API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getServiceRoleClient();

    // 게시물 소유자 확인
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("user_id, user:users(clerk_id)")
      .eq("id", postId)
      .single();

    if (postError || !post) {
      console.error("[Post Detail API] 게시물 조회 실패:", postError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Post not found", details: postError?.message },
        { status: 404 }
      );
    }

    // 권한 확인
    if ((post.user as any)?.clerk_id !== user.id) {
      console.error("[Post Detail API] 권한 없음");
      console.groupEnd();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 게시물 삭제
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      console.error("[Post Detail API] 삭제 실패:", deleteError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to delete post", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("[Post Detail API] 삭제 성공:", postId);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error("[Post Detail API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

