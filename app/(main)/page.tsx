/**
 * @file app/(main)/page.tsx
 * @description 홈 피드 페이지
 * Instagram 스타일의 메인 피드
 */

"use client";

import { PostFeed } from "@/components/post/post-feed";

export default function HomePage() {
  return (
    <div className="max-w-[630px] mx-auto">
      <PostFeed />
    </div>
  );
}

