/**
 * @file components/post/post-feed.tsx
 * @description 게시물 피드 컴포넌트
 * 게시물 목록을 표시하고 무한 스크롤을 지원
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { PostCard } from "./post-card";
import { PostCardSkeleton } from "./post-card-skeleton";
import { PostModal } from "./post-modal";
import { ErrorMessage } from "@/components/ui/error-message";
import { Post } from "@/types";
import { useRouter } from "next/navigation";
import { safeFetch, extractErrorMessage } from "@/lib/utils/error-handler";

interface PostFeedProps {
  initialPosts?: Post[];
  userId?: string;
}

export function PostFeed({ initialPosts = [], userId }: PostFeedProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [modalPostId, setModalPostId] = useState<string | null>(null);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  const fetchPosts = async (pageNum: number) => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);
    try {
      console.group("[PostFeed] 게시물 조회");
      const params = new URLSearchParams({
        page: String(pageNum),
        pageSize: "10",
      });
      if (userId) {
        params.append("userId", userId);
      }

      const { data, error: fetchError, result } = await safeFetch<Post[]>(
        `/api/posts?${params.toString()}`
      );

      if (fetchError || !data) {
        console.error("[PostFeed] 조회 실패:", fetchError);
        // 첫 페이지 로딩 시에만 에러 표시
        if (pageNum === 1) {
          setError(fetchError || "게시물을 불러오는데 실패했습니다.");
        }
        setHasMore(false);
        console.groupEnd();
        return;
      }

      // 성공 처리
      const newPosts = Array.isArray(data) ? data : [];
      setPosts((prev) => {
        if (prev.length === 0) {
          return newPosts;
        }
        // 중복 제거: 이미 존재하는 ID는 제외
        const existingIds = new Set(prev.map((p) => p.id));
        const uniqueNewPosts = newPosts.filter((p: Post) => !existingIds.has(p.id));
        return [...prev, ...uniqueNewPosts];
      });

      // 페이지네이션 정보 확인
      setHasMore(result?.pagination?.hasMore ?? false);

      setPage(pageNum + 1);
      console.log("[PostFeed] 조회 성공:", newPosts.length);
      console.groupEnd();
    } finally {
      setLoading(false);
    }
  };

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchPosts(page);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading, page]); // eslint-disable-line react-hooks/exhaustive-deps

  // 초기 로딩
  useEffect(() => {
    if (posts.length === 0) {
      fetchPosts(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 화면 크기 체크 (Desktop: 768px 이상)
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    // 초기 체크
    checkScreenSize();

    // 리사이즈 이벤트 리스너
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // useCallback으로 함수 메모이제이션 (최적화) - 모든 Hooks는 조건부 return 전에 배치
  const handleImageClick = useCallback((postId: string) => {
    if (isDesktop) {
      // 데스크톱: 모달 열기
      const post = posts.find((p) => p.id === postId);
      setModalPost(post || null);
      setModalPostId(postId);
    } else {
      // 모바일: 페이지 이동
      router.push(`/post/${postId}`);
    }
  }, [isDesktop, posts, router]);

  if (posts.length === 0 && loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          setError(null);
          fetchPosts(1);
        }}
      />
    );
  }

  if (posts.length === 0 && !loading && !error) {
    return (
      <div className="text-center py-12 text-instagram-secondary">
        <p className="mb-2">게시물이 없습니다.</p>
        <p className="text-sm text-instagram-secondary">
          첫 게시물을 작성해보세요!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onImageClick={handleImageClick} />
        ))}
        {loading && <PostCardSkeleton />}
        {hasMore && <div ref={observerTarget} className="h-4" />}
      </div>

      {/* Desktop 모달 */}
      {isDesktop && modalPostId && (
        <PostModal
          open={!!modalPostId}
          onOpenChange={(open) => {
            if (!open) {
              setModalPostId(null);
              setModalPost(null);
            }
          }}
          postId={modalPostId}
          initialPost={modalPost || undefined}
        />
      )}
    </>
  );
}

