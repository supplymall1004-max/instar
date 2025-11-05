/**
 * @file components/profile/profile-tabs.tsx
 * @description 프로필 페이지 탭 컴포넌트
 * 게시물, 릴스, 태그됨 탭을 관리
 */

"use client";

import { useState } from "react";
import { PostGrid } from "./post-grid";
import { Post } from "@/types";

interface ProfileTabsProps {
  posts: Post[];
  reels: Post[];
  taggedPosts: Post[];
}

type TabType = "posts" | "reels" | "tagged";

export function ProfileTabs({ posts, reels, taggedPosts }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("posts");

  const getCurrentPosts = () => {
    switch (activeTab) {
      case "reels":
        return reels;
      case "tagged":
        return taggedPosts;
      default:
        return posts;
    }
  };

  return (
    <>
      {/* 탭 메뉴 */}
      <div className="border-t border-instagram flex justify-center">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("posts")}
            className={`
              py-3 border-t-2 text-sm font-semibold transition-colors
              ${
                activeTab === "posts"
                  ? "border-instagram-primary text-instagram-primary"
                  : "border-transparent text-instagram-secondary hover:text-instagram-primary"
              }
            `}
          >
            게시물
          </button>
          <button
            onClick={() => setActiveTab("reels")}
            className={`
              py-3 border-t-2 text-sm font-semibold transition-colors
              ${
                activeTab === "reels"
                  ? "border-instagram-primary text-instagram-primary"
                  : "border-transparent text-instagram-secondary hover:text-instagram-primary"
              }
            `}
          >
            릴스
          </button>
          <button
            onClick={() => setActiveTab("tagged")}
            className={`
              py-3 border-t-2 text-sm font-semibold transition-colors
              ${
                activeTab === "tagged"
                  ? "border-instagram-primary text-instagram-primary"
                  : "border-transparent text-instagram-secondary hover:text-instagram-primary"
              }
            `}
          >
            태그됨
          </button>
        </div>
      </div>

      {/* 게시물 그리드 */}
      <div className="mt-4">
        {getCurrentPosts().length > 0 ? (
          <PostGrid posts={getCurrentPosts()} />
        ) : (
          <div className="text-center py-12 text-instagram-secondary">
            <p className="text-sm">
              {activeTab === "reels"
                ? "아직 릴스가 없습니다."
                : activeTab === "tagged"
                ? "태그된 게시물이 없습니다."
                : "게시물이 없습니다."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}

