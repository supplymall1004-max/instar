/**
 * @file components/comment/comment-form.tsx
 * @description 댓글 작성 폼 컴포넌트
 * 댓글 입력 및 제출 기능
 */

"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

interface CommentFormProps {
  postId: string;
  onSubmit?: (comment: any) => void;
  onError?: (error: string) => void;
}

export function CommentForm({ postId, onSubmit, onError }: CommentFormProps) {
  const { userId } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) {
      if (onError) {
        onError("로그인이 필요합니다.");
      }
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.group("[CommentForm] 댓글 작성 시작");
      console.log("Post ID:", postId);
      console.log("Content:", trimmedContent);

      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
          content: trimmedContent,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[CommentForm] 댓글 작성 실패:", result.error || result.message);
        if (onError) {
          onError(result.error || result.message || "댓글 작성에 실패했습니다.");
        }
        console.groupEnd();
        return;
      }

      console.log("[CommentForm] 댓글 작성 성공:", result.data);
      console.groupEnd();

      // 성공 처리
      setContent("");
      if (onSubmit) {
        onSubmit(result.data);
      }
    } catch (error) {
      console.error("[CommentForm] 댓글 작성 중 오류:", error);
      if (onError) {
        onError("댓글 작성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 키만 누르면 제출, Shift+Enter는 줄바꿈
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  if (!userId) {
    return (
      <div className="px-4 py-3 border-t border-instagram">
        <p className="text-sm text-instagram-secondary text-center">
          댓글을 작성하려면 로그인이 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-instagram">
      <div className="flex items-center gap-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="댓글 달기..."
          className="flex-1 resize-none border-none focus:outline-none text-sm text-instagram-primary placeholder:text-instagram-secondary"
          rows={1}
          style={{
            minHeight: "24px",
            maxHeight: "100px",
          }}
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={!content.trim() || isSubmitting}
          className="text-instagram-blue font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-70 transition-opacity"
        >
          {isSubmitting ? (
            "게시 중..."
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </div>
    </form>
  );
}

