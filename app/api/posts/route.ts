/**
 * @file app/api/posts/route.ts
 * @description 게시물 API
 * GET: 게시물 목록 조회 (페이지네이션)
 * POST: 게시물 생성
 */

import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";

const PAGE_SIZE = 10;

/**
 * GET: 게시물 목록 조회
 * 쿼리 파라미터:
 * - page: 페이지 번호 (기본값: 1)
 * - pageSize: 페이지 크기 (기본값: 10)
 * - userId: 특정 사용자의 게시물만 조회 (선택)
 */
export async function GET(request: NextRequest) {
  try {
    console.group("[Posts API] 게시물 목록 조회 시작");
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || String(PAGE_SIZE), 10);
    const userId = searchParams.get("userId");

    let supabase;
    try {
      supabase = getServiceRoleClient();
    } catch (error) {
      console.error("[Posts API] Supabase 클라이언트 생성 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { 
          error: "Database configuration error", 
          details: error instanceof Error ? error.message : String(error),
          message: "Supabase 환경 변수가 설정되지 않았거나 올바르지 않습니다. .env 파일을 확인하세요."
        },
        { status: 500 }
      );
    }

    // 쿼리 빌더 시작
    // Foreign key 이름이 다를 수 있으므로 직접 조인 사용
    let query = supabase
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
      `,
        { count: "exact" }
      )
      .order("created_at", { ascending: false });

    // userId 필터링
    if (userId) {
      query = query.eq("user_id", userId);
    }

    // 페이지네이션
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      console.error("[Posts API] 조회 실패:", error);
      console.groupEnd();
      
      // 테이블이 없는 경우 (마이그레이션 미적용)
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          data: [],
          pagination: {
            page,
            pageSize,
            total: 0,
            hasMore: false,
          },
          message: "데이터베이스 테이블이 아직 생성되지 않았습니다. 마이그레이션을 적용하세요."
        });
      }
      
      return NextResponse.json(
        { error: "게시물 조회 실패", details: error.message },
        { status: 500 }
      );
    }

    // 현재 사용자 정보 조회 (좋아요 상태 확인용)
    let currentUserId: string | null = null;
    try {
      const user = await currentUser();
      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("id")
          .eq("clerk_id", user.id)
          .single();
        if (userData) {
          currentUserId = userData.id;
        }
      }
    } catch (error) {
      // 인증 실패는 무시 (비로그인 사용자)
      console.log("[Posts API] 사용자 인증 확인 실패 (비로그인 가능):", error);
    }

    // 각 게시물의 좋아요 수, 댓글 수, 좋아요 상태 조회
    const posts = await Promise.all(
      (data || []).map(async (post: any) => {
        try {
          let likesResult: any = { count: 0, error: null };
          let commentsResult: any = { count: 0, error: null };
          let isLikedResult: any = { data: null, error: null };

          try {
            [likesResult, commentsResult, isLikedResult] = await Promise.all([
              supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
              supabase.from("comments").select("id", { count: "exact", head: true }).eq("post_id", post.id),
              currentUserId
                ? supabase
                    .from("likes")
                    .select("id")
                    .eq("post_id", post.id)
                    .eq("user_id", currentUserId)
                    .single()
                : Promise.resolve({ data: null, error: null }),
            ]);
          } catch (queryError) {
            console.error(`[Posts API] 게시물 ${post.id}의 좋아요/댓글 수 조회 중 오류:`, queryError);
            // 기본값 사용 (이미 설정됨)
          }

          return {
            ...post,
            likes_count: likesResult.count || 0,
            comments_count: commentsResult.count || 0,
            is_liked: currentUserId ? !!isLikedResult.data : false,
          };
        } catch (error) {
          // 개별 게시물 처리 중 오류 발생 시 기본값 반환
          console.error(`[Posts API] 게시물 ${post.id} 처리 중 오류:`, error);
          return {
            ...post,
            likes_count: 0,
            comments_count: 0,
            is_liked: false,
          };
        }
      })
    );

    console.log("[Posts API] 조회 성공:", { count: posts.length, total: count });
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        pageSize,
        total: count || 0,
        hasMore: (count || 0) > to + 1,
      },
    });
  } catch (error) {
    console.error("[Posts API] 예기치 않은 오류:", error);
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
 * POST: 게시물 생성
 * Body: { image_url: string, caption?: string }
 */
export async function POST(request: NextRequest) {
  try {
    console.group("[Posts API] 게시물 생성 시작");

    // 인증 확인
    const user = await currentUser();
    if (!user) {
      console.error("[Posts API] 인증 실패");
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
      console.error("[Posts API] 사용자 조회 실패:", userError);
      console.groupEnd();
      return NextResponse.json(
        { error: "User not found", details: userError?.message },
        { status: 404 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { image_url, video_url, media_type, caption } = body;

    if (!image_url && !video_url) {
      console.error("[Posts API] 필수 필드 누락: image_url 또는 video_url");
      console.groupEnd();
      return NextResponse.json(
        { error: "image_url or video_url is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        user_id: userData.id,
        image_url: image_url || null,
        video_url: video_url || null,
        media_type: media_type || (image_url ? 'image' : 'video'),
        caption: caption || null,
      })
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
      .single();

    if (error) {
      console.error("[Posts API] 게시물 생성 실패:", error);
      console.groupEnd();
      return NextResponse.json(
        { error: "Failed to create post", details: error.message },
        { status: 500 }
      );
    }

    console.log("[Posts API] 게시물 생성 성공:", data.id);
    console.groupEnd();

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        likes_count: 0,
        comments_count: 0,
      },
    });
  } catch (error) {
    console.error("[Posts API] 예기치 않은 오류:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

