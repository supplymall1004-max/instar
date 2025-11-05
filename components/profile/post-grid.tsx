/**
 * @file components/profile/post-grid.tsx
 * @description 프로필 게시물 그리드 컴포넌트
 * 3열 그리드로 게시물 썸네일을 표시
 */

"use client";

import { Post } from "@/types";
import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle } from "lucide-react";

interface PostGridProps {
  posts: Post[];
}

export const PostGrid = memo(function PostGrid({ posts }: PostGridProps) {
  const router = useRouter();
  const [hoveredPostId, setHoveredPostId] = useState<string | null>(null);

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-16 h-16 border-2 border-instagram rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-instagram-secondary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-instagram-secondary text-lg font-light">게시물 없음</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1 md:gap-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="relative aspect-square bg-gray-100 cursor-pointer group"
          onMouseEnter={() => setHoveredPostId(post.id)}
          onMouseLeave={() => setHoveredPostId(null)}
          onClick={() => router.push(`/post/${post.id}`)}
        >
          {post.media_type === 'video' && post.video_url ? (
            <video
              src={post.video_url}
              className="w-full h-full object-cover"
              muted
            />
          ) : (
            <img
              src={post.image_url || ""}
              alt={post.caption || "Post"}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          )}
          {/* Hover 오버레이 */}
          {hoveredPostId === post.id && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2 text-white">
                <Heart className="w-6 h-6 fill-white" />
                <span className="font-semibold">{post.likes_count || 0}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <MessageCircle className="w-6 h-6 fill-white" />
                <span className="font-semibold">{post.comments_count || 0}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

