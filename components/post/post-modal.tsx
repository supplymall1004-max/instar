/**
 * @file components/post/post-modal.tsx
 * @description 게시물 상세 모달 컴포넌트 (Desktop)
 * Instagram 스타일의 모달로 게시물과 댓글을 표시
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X, Heart, MessageCircle, Send, Bookmark, MoreVertical, Trash2, Flag, Share2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Post } from "@/types";
import { CommentList, CommentForm } from "@/components/comment/comment-list";
import { formatRelativeTime } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/date";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
  initialPost?: Post;
}

export function PostModal({ open, onOpenChange, postId, initialPost }: PostModalProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded, userId: clerkUserId } = useAuth();
  const [post, setPost] = useState<Post | null>(initialPost || null);
  const [loading, setLoading] = useState(!initialPost);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(initialPost?.is_liked || false);
  const [likesCount, setLikesCount] = useState(initialPost?.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);

  // 본인 게시물인지 확인 (post가 변경될 때마다 업데이트)
  const isOwnPost = useMemo(() => {
    return post ? clerkUserId === post.user?.clerk_id : false;
  }, [clerkUserId, post?.user?.clerk_id]);

  // 키보드 네비게이션: Escape 키로 모달 닫기
  useKeyboardNavigation({
    onEscape: () => {
      if (open) {
        onOpenChange(false);
      }
    },
    enabled: open,
  });

  const fetchPost = async () => {
    setLoading(true);
    setError(null);

    try {
      console.group("[PostModal] 게시물 상세 조회 시작");
      console.log("Post ID:", postId);

      const response = await fetch(`/api/posts/${postId}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostModal] 게시물 조회 실패:", result.error || result.message);
        setError(result.error || result.message || "게시물을 불러오는데 실패했습니다.");
        console.groupEnd();
        return;
      }

      console.log("[PostModal] 게시물 조회 성공");
      console.groupEnd();

      const fetchedPost = result.data;
      setPost(fetchedPost);
      setIsLiked(fetchedPost.is_liked || false);
      setLikesCount(fetchedPost.likes_count || 0);

      // 북마크 상태 확인
      if (isSignedIn && isLoaded) {
        try {
          const bookmarkResponse = await fetch(`/api/bookmarks?postId=${postId}`);
          const bookmarkResult = await bookmarkResponse.json();
          if (bookmarkResult.success) {
            setIsBookmarked(bookmarkResult.is_bookmarked || false);
          }
        } catch (error) {
          console.error("[PostModal] 북마크 상태 확인 실패:", error);
        }
      }
    } catch (error) {
      console.error("[PostModal] 게시물 조회 중 오류:", error);
      setError("게시물을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && !initialPost) {
      fetchPost();
    } else if (open && initialPost) {
      setPost(initialPost);
      setIsLiked(initialPost.is_liked || false);
      setLikesCount(initialPost.likes_count || 0);
      setLoading(false);
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, postId]);

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

  // 게시물 삭제
  const handleDelete = async () => {
    if (!isOwnPost || !isSignedIn || isDeleting || !post) return;

    if (!confirm("정말 이 게시물을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      console.group("[PostModal] 게시물 삭제 시작");
      console.log("Post ID:", postId);

      const response = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostModal] 게시물 삭제 실패:", result.error || result.message);
        alert("게시물 삭제에 실패했습니다.");
        console.groupEnd();
        return;
      }

      console.log("[PostModal] 게시물 삭제 성공");
      console.groupEnd();

      // 모달 닫기 및 페이지 새로고침
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error("[PostModal] 게시물 삭제 중 오류:", error);
      alert("게시물 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 북마크 토글
  const handleBookmark = async () => {
    if (isBookmarking || !isLoaded || !isSignedIn || !postId) return;

    setIsBookmarking(true);
    const previousBookmarked = isBookmarked;

    // Optimistic update
    setIsBookmarked(!isBookmarked);

    try {
      const url = isBookmarked ? "/api/bookmarks" : "/api/bookmarks";
      const method = isBookmarked ? "DELETE" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostModal] 북마크 토글 실패:", result.error || result.message);
        // 실패 시 원래 상태로 복구
        setIsBookmarked(previousBookmarked);
        return;
      }

      setIsBookmarked(result.is_bookmarked ?? !previousBookmarked);
    } catch (error) {
      console.error("[PostModal] 북마크 토글 중 오류:", error);
      // 에러 발생 시 원래 상태로 복구
      setIsBookmarked(previousBookmarked);
    } finally {
      setIsBookmarking(false);
    }
  };

  // 공유 기능 (클립보드에 URL 복사)
  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${postId}`;
      
      // Modern Clipboard API 사용 (가능한 경우)
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
        alert("링크가 클립보드에 복사되었습니다.");
        return;
      }
      
      // 대체 방법: 레거시 execCommand 사용
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand("copy");
        if (successful) {
          alert("링크가 클립보드에 복사되었습니다.");
        } else {
          throw new Error("execCommand failed");
        }
      } finally {
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error("[PostModal] 공유 실패:", error);
      alert("링크 복사에 실패했습니다. 브라우저가 클립보드 기능을 지원하지 않을 수 있습니다.");
    }
  };

  const handleLike = async () => {
    // 이미 처리 중이면 무시
    if (isLiking) return;
    
    // 로그인 확인
    if (!isLoaded) {
      console.log("[PostModal] Clerk 로딩 중...");
      return;
    }
    
    if (!isSignedIn) {
      console.log("[PostModal] 로그인하지 않은 사용자");
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        router.push(`/sign-in?redirect_url=${encodeURIComponent(currentPath)}`);
      } else {
        router.push("/sign-in");
      }
      return;
    }

    // Optimistic update
    const previousLiked = isLiked;
    const previousCount = likesCount;
    
    setIsLiked(!previousLiked);
    setLikesCount(previousLiked ? previousCount - 1 : previousCount + 1);
    setIsLiking(true);

    try {
      console.group("[PostModal] 좋아요 토글 시작");
      console.log("Post ID:", postId);
      console.log("현재 상태:", previousLiked ? "좋아요" : "좋아요 안함");

      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: postId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostModal] 좋아요 토글 실패:", result.error || result.message);
        // 실패 시 원래 상태로 복구
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
        console.groupEnd();
        return;
      }

      console.log("[PostModal] 좋아요 토글 성공:", result.is_liked ? "좋아요 추가" : "좋아요 제거");
      console.groupEnd();
    } catch (error) {
      console.error("[PostModal] 좋아요 토글 중 오류:", error);
      // 에러 발생 시 원래 상태로 복구
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-w-[1050px] p-0 h-[90vh] max-h-[800px] overflow-hidden">
        {/* 접근성을 위한 DialogTitle (시각적으로 숨김) */}
        <DialogTitle className="sr-only">
          {post ? `게시물: ${post.user?.username || post.user?.name || "Unknown"}의 게시물` : "게시물 상세"}
        </DialogTitle>
        <div className="flex h-full">
          {/* 좌측: 미디어 영역 (50%) */}
          <div className="w-1/2 bg-black flex items-center justify-center relative">
            {loading ? (
              <div className="text-white">로딩 중...</div>
            ) : error || !post ? (
              <div className="text-white text-center px-4">
                <p className="text-red-400 mb-4">{error || "게시물을 찾을 수 없습니다."}</p>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                {post.media_type === 'video' && post.video_url ? (
                  <video
                    src={post.video_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={post.image_url || ""}
                    alt={post.caption || "Post image"}
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                  />
                )}
              </div>
            )}
          </div>

          {/* 우측: 댓글 영역 (50%) */}
          <div className="w-1/2 flex flex-col bg-white">
            {/* 헤더 */}
            {post && (
              <>
                <div className="border-b border-instagram px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {post.user?.clerk_id ? (
                      <>
                        <Link 
                          href={`/profile/${post.user.clerk_id}`}
                          className="cursor-pointer"
                        >
                          <Avatar
                            src={post.user?.avatar_url}
                            alt={post.user?.name || post.user?.username || "User"}
                            size="sm"
                            fallback={post.user?.name || post.user?.username}
                            className="cursor-pointer"
                          />
                        </Link>
                        <Link
                          href={`/profile/${post.user.clerk_id}`}
                          className="font-semibold text-instagram-primary hover:opacity-50 cursor-pointer"
                        >
                          {post.user?.username || post.user?.name || "Unknown"}
                        </Link>
                      </>
                    ) : (
                      <>
                        <Avatar
                          src={post.user?.avatar_url}
                          alt={post.user?.name || post.user?.username || "User"}
                          size="sm"
                          fallback={post.user?.name || post.user?.username}
                        />
                        <span className="font-semibold text-instagram-primary">
                          {post.user?.username || post.user?.name || "Unknown"}
                        </span>
                      </>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-instagram-primary hover:opacity-50" aria-label="더보기 메뉴">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      {isOwnPost ? (
                        <>
                          <DropdownMenuItem
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {isDeleting ? "삭제 중..." : "삭제"}
                          </DropdownMenuItem>
                        </>
                      ) : (
                        <>
                          <DropdownMenuItem
                            onClick={handleShare}
                            className="cursor-pointer"
                          >
                            <Share2 className="w-4 h-4 mr-2" />
                            공유
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
                            onClick={() => {
                              alert("신고 기능은 준비 중입니다.");
                            }}
                          >
                            <Flag className="w-4 h-4 mr-2" />
                            신고
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 댓글 목록 */}
                <div className="flex-1 overflow-y-auto">
                  <CommentList
                    postId={postId}
                    onCommentDelete={handleCommentDelete}
                  />
                </div>

                {/* 액션 버튼 */}
                <div className="border-t border-instagram px-4 py-2">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handleLike}
                        disabled={isLiking}
                        className="hover:opacity-50 transition-all active:scale-125"
                        aria-label={isLiked ? "좋아요 취소" : "좋아요"}
                        aria-pressed={isLiked}
                      >
                        <Heart
                          className={`w-6 h-6 transition-all ${
                            isLiked ? "fill-instagram-like text-instagram-like" : "text-instagram-primary"
                          }`}
                        />
                      </button>
                      <button className="hover:opacity-50 transition-opacity">
                        <MessageCircle className="w-6 h-6 text-instagram-primary" />
                      </button>
                      <button 
                        onClick={handleShare}
                        className="hover:opacity-50 transition-opacity"
                        aria-label="게시물 공유"
                        title="게시물 링크 복사"
                      >
                        <Send className="w-6 h-6 text-instagram-primary" />
                      </button>
                    </div>
                    <button 
                      onClick={handleBookmark}
                      disabled={isBookmarking || !isLoaded || !isSignedIn}
                      className="hover:opacity-50 transition-opacity"
                      aria-label={isBookmarked ? "북마크 취소" : "북마크"}
                      aria-pressed={isBookmarked}
                      title={isBookmarked ? "북마크 취소" : "북마크"}
                    >
                      <Bookmark 
                        className={`w-6 h-6 transition-all ${
                          isBookmarked ? "fill-instagram-primary text-instagram-primary" : "text-instagram-primary"
                        }`}
                      />
                    </button>
                  </div>

                  {/* 좋아요 수 */}
                  {likesCount > 0 && (
                    <div className="font-semibold text-instagram-primary mb-2">
                      좋아요 {formatNumber(likesCount)}개
                    </div>
                  )}

                  {/* 캡션 */}
                  {post.caption && (
                    <div className="text-instagram-primary mb-2">
                      {post.user?.clerk_id ? (
                        <Link
                          href={`/profile/${post.user.clerk_id}`}
                          className="font-semibold mr-2 hover:opacity-50"
                        >
                          {post.user?.username || post.user?.name || "Unknown"}
                        </Link>
                      ) : (
                        <span className="font-semibold mr-2">
                          {post.user?.username || post.user?.name || "Unknown"}
                        </span>
                      )}
                      <span>{post.caption}</span>
                    </div>
                  )}

                  {/* 시간 */}
                  <div className="text-instagram-secondary text-xs">
                    {formatRelativeTime(post.created_at)}
                  </div>
                </div>

                {/* 댓글 작성 폼 */}
                <div className="border-t border-instagram">
                  <CommentForm postId={postId} onSubmit={handleCommentAdd} />
                </div>
              </>
            )}
          </div>

          {/* 닫기 버튼 */}
          <button
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors z-10"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

