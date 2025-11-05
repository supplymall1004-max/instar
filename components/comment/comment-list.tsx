/**
 * @file components/comment/comment-list.tsx
 * @description 댓글 목록 컴포넌트
 * 게시물의 댓글 목록을 표시하는 컴포넌트
 */

"use client";

import { useEffect, useState } from "react";
import { CommentItem } from "./comment-item";
import { Comment } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface CommentListProps {
  postId: string;
  initialComments?: Comment[];
  onCommentDelete?: (commentId: string) => void;
}

export function CommentList({ postId, initialComments, onCommentDelete }: CommentListProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [loading, setLoading] = useState(!initialComments);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    try {
      console.group("[CommentList] 댓글 목록 조회 시작");
      console.log("Post ID:", postId);

      const response = await fetch(`/api/comments?post_id=${postId}&pageSize=50`);

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[CommentList] 댓글 목록 조회 실패:", result.error || result.message);
        setError(result.error || result.message || "댓글을 불러오는데 실패했습니다.");
        console.groupEnd();
        return;
      }

      console.log("[CommentList] 댓글 목록 조회 성공:", result.data.length);
      console.groupEnd();

      setComments(result.data || []);
    } catch (error) {
      console.error("[CommentList] 댓글 목록 조회 중 오류:", error);
      setError("댓글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialComments) {
      fetchComments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const handleCommentDelete = (commentId: string) => {
    // 댓글 목록에서 제거
    setComments((prev) => prev.filter((c) => c.id !== commentId));

    // 부모 컴포넌트에 알림
    if (onCommentDelete) {
      onCommentDelete(commentId);
    }
  };


  if (loading) {
    return (
      <div className="px-4 py-3 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3">
        <p className="text-sm text-red-500">{error}</p>
        <button
          onClick={fetchComments}
          className="text-sm text-instagram-blue mt-2 hover:opacity-70"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="px-4 py-8">
        <p className="text-sm text-instagram-secondary text-center">
          아직 댓글이 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="max-h-[400px] overflow-y-auto px-4 py-3 space-y-1">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onDelete={handleCommentDelete}
        />
      ))}
    </div>
  );
}

// CommentForm과 통합된 버전도 export
export { CommentForm } from "./comment-form";

