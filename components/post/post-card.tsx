/**
 * @file components/post/post-card.tsx
 * @description 게시물 카드 컴포넌트
 * Instagram 스타일의 게시물 카드 UI
 */

"use client";

import { useState, useRef, memo, useMemo, useEffect } from "react";
import { MoreVertical, Heart, MessageCircle, Send, Bookmark, Trash2, Flag, Share2 } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/utils/date";
import { formatNumber } from "@/lib/utils/date";
import { Post } from "@/types";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PostCardProps {
  post: Post;
  onImageClick?: (postId: string) => void;
}

export const PostCard = memo(function PostCard({ post, onImageClick }: PostCardProps) {
  const router = useRouter();
  const { isSignedIn, isLoaded, userId: clerkUserId } = useAuth();
  const [isLiked, setIsLiked] = useState(post.is_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const lastTapRef = useRef(0);

  // 본인 게시물인지 확인 (useMemo로 최적화)
  const isOwnPost = useMemo(() => clerkUserId === post.user?.clerk_id, [clerkUserId, post.user?.clerk_id]);

  // 북마크 상태 확인
  useEffect(() => {
    if (!isLoaded || !isSignedIn || !clerkUserId) return;

    const checkBookmarkStatus = async () => {
      try {
        const response = await fetch(`/api/bookmarks?postId=${post.id}`);
        const result = await response.json();
        if (result.success) {
          setIsBookmarked(result.is_bookmarked || false);
        }
      } catch (error) {
        console.error("[PostCard] 북마크 상태 확인 실패:", error);
      }
    };

    checkBookmarkStatus();
  }, [isLoaded, isSignedIn, clerkUserId, post.id]);

  const handleLike = async () => {
    // 이미 처리 중이면 무시
    if (isLiking) return;
    
    // 로그인 확인
    if (!isLoaded) {
      console.log("[PostCard] Clerk 로딩 중...");
      return;
    }
    
    if (!isSignedIn) {
      console.log("[PostCard] 로그인하지 않은 사용자");
      // 로그인 페이지로 리다이렉트 (현재 페이지를 유지하기 위해 redirect_url 설정)
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
      console.group("[PostCard] 좋아요 토글 시작");
      console.log("Post ID:", post.id);
      console.log("현재 상태:", previousLiked ? "좋아요" : "좋아요 안함");

      const response = await fetch("/api/likes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          post_id: post.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostCard] 좋아요 토글 실패:", result.error || result.message);
        // 실패 시 원래 상태로 복구
        setIsLiked(previousLiked);
        setLikesCount(previousCount);
        console.groupEnd();
        return;
      }

      console.log("[PostCard] 좋아요 토글 성공:", result.is_liked ? "좋아요 추가" : "좋아요 제거");
      console.groupEnd();
    } catch (error) {
      console.error("[PostCard] 좋아요 토글 중 오류:", error);
      // 에러 발생 시 원래 상태로 복구
      setIsLiked(previousLiked);
      setLikesCount(previousCount);
    } finally {
      setIsLiking(false);
    }
  };

  // 더블탭 좋아요 (모바일)
  const handleDoubleTap = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (lastTapRef.current && now - lastTapRef.current < DOUBLE_TAP_DELAY) {
      if (!isLiked) {
        handleLike();
        setShowBigHeart(true);
        setTimeout(() => setShowBigHeart(false), 1000);
      }
      lastTapRef.current = 0; // 더블탭 처리 후 리셋
    } else {
      lastTapRef.current = now;
      // 단일 클릭은 300ms 후에 처리
      setTimeout(() => {
        if (lastTapRef.current === now) {
          handleImageClick();
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  const handleImageClick = () => {
    if (onImageClick) {
      onImageClick(post.id);
    } else {
      // 기본 동작: 페이지 이동
      router.push(`/post/${post.id}`);
    }
  };

  // 게시물 삭제
  const handleDelete = async () => {
    if (!isOwnPost || !isSignedIn || isDeleting) return;

    if (!confirm("정말 이 게시물을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);
    try {
      console.group("[PostCard] 게시물 삭제 시작");
      console.log("Post ID:", post.id);

      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostCard] 게시물 삭제 실패:", result.error || result.message);
        alert("게시물 삭제에 실패했습니다.");
        console.groupEnd();
        return;
      }

      console.log("[PostCard] 게시물 삭제 성공");
      console.groupEnd();

      // 페이지 새로고침 또는 피드에서 제거
      router.refresh();
    } catch (error) {
      console.error("[PostCard] 게시물 삭제 중 오류:", error);
      alert("게시물 삭제 중 오류가 발생했습니다.");
    } finally {
      setIsDeleting(false);
    }
  };

  // 북마크 토글
  const handleBookmark = async () => {
    if (isBookmarking || !isLoaded || !isSignedIn) return;

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
          post_id: post.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[PostCard] 북마크 토글 실패:", result.error || result.message);
        // 실패 시 원래 상태로 복구
        setIsBookmarked(previousBookmarked);
        return;
      }

      setIsBookmarked(result.is_bookmarked ?? !previousBookmarked);
    } catch (error) {
      console.error("[PostCard] 북마크 토글 중 오류:", error);
      // 에러 발생 시 원래 상태로 복구
      setIsBookmarked(previousBookmarked);
    } finally {
      setIsBookmarking(false);
    }
  };

  // 공유 기능 (클립보드에 URL 복사)
  const handleShare = async () => {
    try {
      const url = `${window.location.origin}/post/${post.id}`;
      
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
      console.error("[PostCard] 공유 실패:", error);
      alert("링크 복사에 실패했습니다. 브라우저가 클립보드 기능을 지원하지 않을 수 있습니다.");
    }
  };

  const caption = post.caption || "";
  const shouldShowMore = caption.length > 100 && !showFullCaption;
  const displayCaption = shouldShowMore ? caption.slice(0, 100) + "..." : caption;

  return (
    <article className="bg-instagram-card border border-instagram rounded-sm mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px]">
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
              <div>
                <Link
                  href={`/profile/${post.user.clerk_id}`}
                  className="font-semibold text-instagram-primary hover:opacity-50 cursor-pointer"
                >
                  {post.user?.username || post.user?.name || "Unknown"}
                </Link>
              </div>
            </>
          ) : (
            <>
              <Avatar
                src={post.user?.avatar_url}
                alt={post.user?.name || post.user?.username || "User"}
                size="sm"
                fallback={post.user?.name || post.user?.username}
              />
              <div>
                <span className="font-semibold text-instagram-primary">
                  {post.user?.username || post.user?.name || "Unknown"}
                </span>
              </div>
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
      </header>

      {/* 미디어 (이미지 또는 동영상) */}
      <div 
        className="relative aspect-square w-full bg-gray-100 cursor-pointer" 
        onClick={handleDoubleTap}
      >
        {post.media_type === 'video' && post.video_url ? (
          <video
            src={post.video_url}
            controls
            className="w-full h-full object-cover select-none"
            onClick={(e) => {
              // 동영상 컨트롤 클릭 시에는 더블탭 이벤트 방지
              e.stopPropagation();
            }}
          />
        ) : (
          <img
            src={post.image_url || ""}
            alt={post.caption || "Post image"}
            className="w-full h-full object-cover select-none"
            loading="lazy"
            decoding="async"
          />
        )}
        {/* 더블탭 큰 하트 애니메이션 (이미지만) */}
        {showBigHeart && post.media_type !== 'video' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <Heart className="w-24 h-24 fill-instagram-like text-instagram-like animate-fadeInOut" />
          </div>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 h-[48px]">
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
          <Link 
            href={`/post/${post.id}`} 
            className="hover:opacity-50 transition-opacity"
            aria-label="댓글 보기"
          >
            <MessageCircle className="w-6 h-6 text-instagram-primary" />
          </Link>
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

      {/* 컨텐츠 */}
      <div className="px-4 pb-4 space-y-2">
        {/* 좋아요 수 */}
        {likesCount > 0 && (
          <div className="font-semibold text-instagram-primary">
            좋아요 {formatNumber(likesCount)}개
          </div>
        )}

        {/* 캡션 */}
        {caption && (
          <div className="text-instagram-primary">
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
            <span>{displayCaption}</span>
            {shouldShowMore && (
              <button
                onClick={() => setShowFullCaption(true)}
                className="text-instagram-secondary ml-1 hover:opacity-50"
              >
                더 보기
              </button>
            )}
          </div>
        )}

        {/* 댓글 미리보기 */}
        {post.comments_count && post.comments_count > 0 && (
          <Link
            href={`/post/${post.id}`}
            className="text-instagram-secondary text-sm hover:opacity-50"
          >
            댓글 {formatNumber(post.comments_count)}개 모두 보기
          </Link>
        )}

        {/* 시간 */}
        <div className="text-instagram-secondary text-xs">
          {formatRelativeTime(post.created_at)}
        </div>
      </div>
      </article>
    );
});

