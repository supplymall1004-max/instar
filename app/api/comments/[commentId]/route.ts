/**
 * @file app/api/comments/[commentId]/route.ts
 * @description 댓글 상세 API
 * DELETE: 댓글 삭제 (본인만)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";

/**
 * DELETE: 댓글 삭제 (본인만)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    console.group("[Comment Detail API] 댓글 삭제 시작");
    const { commentId } = await params;

    // 인증 확인
    const user = await currentUser();
    if (!user) {
      console.error("[Comment Detail API] 인증 실패");
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
      console.error("[Comment Detail API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 댓글 조회
    const { data: comment, error: commentError } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();

    if (commentError || !comment) {
      console.error("[Comment Detail API] 댓글 조회 실패:", commentError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Comment not found", details: commentError?.message },
        { status: 404 }
      );
    }

    // 권한 확인 (본인만 삭제 가능)
    if (comment.user_id !== userData.id) {
      console.error("[Comment Detail API] 권한 없음:", {
        commentUserId: comment.user_id,
        currentUserId: userData.id,
      });
      console.groupEnd();
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 댓글 삭제
    const { error: deleteError } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (deleteError) {
      console.error("[Comment Detail API] 댓글 삭제 실패:", deleteError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to delete comment", details: deleteError.message },
        { status: 500 }
      );
    }

    console.log("[Comment Detail API] 댓글 삭제 성공:", commentId);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error) {
    console.error("[Comment Detail API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

