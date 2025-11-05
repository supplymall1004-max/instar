/**
 * @file components/post/post-detail.tsx
 * @description 게시물 상세 컴포넌트
 * 게시물 이미지, 좋아요, 댓글 등을 표시하는 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import { Post } from "@/types";
import { PostCard } from "./post-card";
import { CommentList, CommentForm } from "@/components/comment/comment-list";
import { useRouter } from "next/navigation";
import { ErrorMessage } from "@/components/ui/error-message";

interface PostDetailProps {
  postId: string;
  initialPost?: Post;
}

export function PostDetail({ postId, initialPost }: PostDetailProps) {
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);

  const fetchPost = async () => {
    setLoading(true);
    setError(null);

    try {
      console.group("[PostDetail] 게시물 상세 조회 시작");
      console.log("Post ID:", postId);

      const response = await fetch(`/api/posts/${postId}`);

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostDetail] 게시물 조회 실패:", result.error || result.message);
        setError(result.error || result.message || "게시물을 불러오는데 실패했습니다.");
        console.groupEnd();
        return;
      }

      console.log("[PostDetail] 게시물 조회 성공");
      console.groupEnd();

      setPost(result.data);
    } catch (error) {
      console.error("[PostDetail] 게시물 조회 중 오류:", error);
      setError("게시물을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialPost) {
      fetchPost();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleCommentAdd = () => {
    // 댓글 수 증가
    if (post) {
      setPost({
        ...post,
        comments_count: (post.comments_count || 0) + 1,
      });
    }
  };

  const handleCommentDelete = () => {
    // 댓글 수 감소
    if (post) {
      setPost({
        ...post,
        comments_count: Math.max(0, (post.comments_count || 0) - 1),
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-instagram-secondary">로딩 중...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <ErrorMessage
        message={error || "게시물을 찾을 수 없습니다."}
        onRetry={() => {
          setError(null);
          fetchPost();
        }}
        className="min-h-[400px]"
      />
    );
  }

  return (
    <div className="max-w-[630px] mx-auto">
      {/* 게시물 카드 */}
      <div>
        <PostCard post={post} />
      </div>

      {/* 댓글 영역 (게시물 아래) */}
      <div className="bg-white border-t border-instagram">
        {/* 댓글 목록 */}
        <CommentList
          postId={postId}
          onCommentDelete={handleCommentDelete}
        />

        {/* 댓글 작성 폼 */}
        <CommentForm postId={postId} onSubmit={handleCommentAdd} />
      </div>
    </div>
  );
}

