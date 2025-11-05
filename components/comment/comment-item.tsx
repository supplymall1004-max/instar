/**
 * @file components/comment/comment-item.tsx
 * @description 댓글 아이템 컴포넌트
 * 개별 댓글을 표시하는 컴포넌트
 */

"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils/date";
import { Comment } from "@/types";
import { Trash2 } from "lucide-react";
import { useState, memo, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";

interface CommentItemProps {
  comment: Comment;
  onDelete?: (commentId: string) => void;
}

export const CommentItem = memo(function CommentItem({ comment, onDelete }: CommentItemProps) {
  const { userId: clerkUserId } = useAuth();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 본인 댓글인지 확인 (useMemo로 최적화)
  const isOwnComment = useMemo(
    () => comment.user?.clerk_id === clerkUserId,
    [comment.user?.clerk_id, clerkUserId]
  );

  const handleDelete = async () => {
    if (!onDelete || isDeleting) return;

    setIsDeleting(true);
    try {
      console.group("[CommentItem] 댓글 삭제 시작");
      console.log("Comment ID:", comment.id);

      const response = await fetch(`/api/comments/${comment.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[CommentItem] 댓글 삭제 실패:", result.error || result.message);
        alert("댓글 삭제에 실패했습니다.");
        console.groupEnd();
        return;
      }

      console.log("[CommentItem] 댓글 삭제 성공");
      console.groupEnd();

      // 부모 컴포넌트에 삭제 알림
      if (onDelete) {
        onDelete(comment.id);
      }
    } catch (error) {
      console.error("[CommentItem] 댓글 삭제 중 오류:", error);
      alert("댓글 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="flex items-start gap-3 py-2">
      {/* 프로필 이미지 */}
      <Avatar
        src={comment.user?.avatar_url}
        alt={comment.user?.name || comment.user?.username || "User"}
        size="sm"
        fallback={comment.user?.name || comment.user?.username}
      />

      {/* 댓글 내용 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <div className="flex-1">
            <span className="font-semibold text-instagram-primary mr-2">
              {comment.user?.username || comment.user?.name || "Unknown"}
            </span>
            <span className="text-instagram-primary">{comment.content}</span>
          </div>
          {isOwnComment && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-instagram-secondary hover:text-red-500 transition-colors flex-shrink-0"
              disabled={isDeleting}
              aria-label="댓글 삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-instagram-secondary text-xs">
            {formatRelativeTime(comment.created_at)}
          </span>
          {showDeleteConfirm && (
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-red-500 hover:text-red-600 font-semibold"
              >
                {isDeleting ? "삭제 중..." : "삭제"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-instagram-secondary hover:text-instagram-primary"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

