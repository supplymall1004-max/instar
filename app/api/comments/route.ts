/**
 * @file app/api/comments/route.ts
 * @description 댓글 API
 * POST: 댓글 작성
 * GET: 댓글 목록 조회 (postId 파라미터)
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";

/**
 * POST: 댓글 작성
 * Body: { post_id: string, content: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[Comments API] 댓글 작성 시작");

    // 인증 확인
    const user = await currentUser();
    if (!user) {
      console.error("[Comments API] 인증 실패");
      console.groupEnd();
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 사용자 정보 조회 (Supabase users 테이블에서)
    const supabase = getServiceRoleClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", user.id)
      .single();

    if (userError || !userData) {
      console.error("[Comments API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { post_id, content } = body;

    if (!post_id || !content) {
      console.error("[Comments API] 필수 필드 누락:", { post_id: !!post_id, content: !!content });
      console.groupEnd();
      return NextResponse.json(
        { error: "post_id and content are required" },
        { status: 400 }
      );
    }

    // 댓글 내용 검증 (최대 길이 등)
    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      console.error("[Comments API] 댓글 내용이 비어있음");
      console.groupEnd();
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    if (trimmedContent.length > 1000) {
      console.error("[Comments API] 댓글 내용이 너무 김:", trimmedContent.length);
      console.groupEnd();
      return NextResponse.json(
        { error: "Content cannot exceed 1000 characters" },
        { status: 400 }
      );
    }

    // 댓글 생성
    const { data, error: insertError } = await supabase
      .from("comments")
      .insert({
        post_id,
        user_id: userData.id,
        content: trimmedContent,
      })
      .select(`
        *,
        user:users(id, clerk_id, name, avatar_url)
      `)
      .single();

    if (insertError) {
      console.error("[Comments API] 댓글 생성 실패:", insertError);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to create comment", details: insertError.message },
        { status: 500 }
      );
    }

    console.log("[Comments API] 댓글 작성 성공:", data.id);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data,
      message: "Comment created successfully",
    });
  } catch (error) {
    console.error("[Comments API] 예기치 않은 오류:", error);
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
 * GET: 댓글 목록 조회
 * Query: post_id (필수), page (선택), pageSize (선택)
 */
export async function GET(request: NextRequest) {
  try {
    console.group("[Comments API] 댓글 목록 조회 시작");

    const searchParams = request.nextUrl.searchParams;
    const post_id = searchParams.get("post_id");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);

    if (!post_id) {
      console.error("[Comments API] 필수 파라미터 누락: post_id");
      console.groupEnd();
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // 댓글 목록 조회 (최신순)
    const { data, error, count } = await supabase
      .from("comments")
      .select(
        `
        *,
        user:users!comments_user_id_fkey(id, clerk_id, name, avatar_url)
      `,
        { count: "exact" }
      )
      .eq("post_id", post_id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      console.error("[Comments API] 댓글 목록 조회 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to fetch comments", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Comments API] 댓글 목록 조회 성공:", { count: data?.length, total: count });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      },
    });
  } catch (error) {
    console.error("[Comments API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

