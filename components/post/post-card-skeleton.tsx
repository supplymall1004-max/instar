/**
 * @file components/post/post-card-skeleton.tsx
 * @description 게시물 카드 로딩 스켈레톤 UI
 */

import { Skeleton } from "@/components/ui/skeleton";

export function PostCardSkeleton() {
  return (
    <article className="bg-instagram-card border border-instagram rounded-sm mb-4">
      {/* 헤더 */}
      <header className="flex items-center justify-between px-4 py-3 h-[60px]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-24 h-4" />
        </div>
        <Skeleton className="w-5 h-5" />
      </header>

      {/* 이미지 */}
      <div className="relative aspect-square w-full">
        <Skeleton className="w-full h-full" />
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 h-[48px]">
        <div className="flex items-center gap-4">
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-6 h-6" />
          <Skeleton className="w-6 h-6" />
        </div>
        <Skeleton className="w-6 h-6" />
      </div>

      {/* 컨텐츠 */}
      <div className="px-4 pb-4 space-y-2">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-full h-4" />
        <Skeleton className="w-3/4 h-4" />
        <Skeleton className="w-24 h-3" />
      </div>
    </article>
  );
}

