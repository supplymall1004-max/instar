/**
 * @file app/(main)/post/[postId]/page.tsx
 * @description 게시물 상세 페이지 (Mobile)
 * 전체 페이지 레이아웃으로 게시물과 댓글을 표시
 */

import { notFound } from "next/navigation";
import { PostDetail } from "@/components/post/post-detail";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";
import { Post } from "@/types";

interface PageProps {
  params: Promise<{ postId: string }>;
}

export default async function PostDetailPage({ params }: PageProps) {
  const { postId } = await params;

  try {
    console.group("[PostDetailPage] 게시물 상세 조회 시작");
    console.log("Post ID:", postId);

    const supabase = getServiceRoleClient();

    // 게시물 조회
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

    if (error || !data) {
      console.error("[PostDetailPage] 게시물 조회 실패:", error);
      console.groupEnd();
      notFound();
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
      console.error("[PostDetailPage] 좋아요/댓글 수 조회 중 오류:", error);
      // 기본값 사용 (이미 설정됨)
    }

    const post: Post = {
      ...data,
      user: Array.isArray(data.user) ? (data.user[0] as any) : (data.user as any),
      likes_count: likesResult.count || 0,
      comments_count: commentsResult.count || 0,
      is_liked: currentUserId ? !!isLikedResult.data : false,
    } as Post;

    console.log("[PostDetailPage] 게시물 조회 성공");
    console.groupEnd();

    return (
    <div className="min-h-screen bg-instagram">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-instagram flex items-center px-4 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-instagram-primary hover:opacity-50 transition-opacity"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold">게시물</span>
        </Link>
      </header>

      {/* Content */}
      <div className="md:hidden pt-[60px]">
        <PostDetail postId={postId} initialPost={post} />
      </div>

      {/* Desktop: 모달 형태로 표시 (Phase 9-1에서 구현 예정) */}
      <div className="hidden md:block">
        <PostDetail postId={postId} initialPost={post} />
      </div>
    </div>
    );
  } catch (error) {
    console.error("[PostDetailPage] 예기치 않은 오류:", error);
    notFound();
  }
}

