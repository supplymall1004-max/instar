/**
 * @file components/profile/profile-header.tsx
 * @description 프로필 헤더 컴포넌트
 * 프로필 이미지, 사용자 정보, 통계, 팔로우 버튼 등을 표시
 */

"use client";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "@/types";
import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FollowListModal } from "./follow-list-modal";

interface ProfileHeaderProps {
  user: User & {
    stats?: {
      posts: number;
      followers: number;
      following: number;
    };
    is_following?: boolean;
    is_own_profile?: boolean;
  };
  onFollowChange?: (isFollowing: boolean) => void;
}

export function ProfileHeader({ user, onFollowChange }: ProfileHeaderProps) {
  const { userId: clerkUserId } = useAuth();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(user.is_following || false);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState(user.stats || { posts: 0, followers: 0, following: 0 });
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);

  const handleFollow = async () => {
    if (!clerkUserId || user.is_own_profile || isLoading) return;

    setIsLoading(true);
    const previousState = isFollowing;
    const previousFollowers = stats.followers;

    // Optimistic update
    setIsFollowing(!previousState);
    setStats({
      ...stats,
      followers: previousState ? previousFollowers - 1 : previousFollowers + 1,
    });

    try {
      console.group("[ProfileHeader] 팔로우 토글 시작");
      console.log("User ID:", user.clerk_id);
      console.log("현재 상태:", previousState ? "팔로잉" : "팔로우 안함");

      const response = await fetch("/api/follows", {
        method: previousState ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          following_id: user.clerk_id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error("[ProfileHeader] 팔로우 토글 실패:", result.error || result.message);
        // 실패 시 원래 상태로 복구
        setIsFollowing(previousState);
        setStats({
          ...stats,
          followers: previousFollowers,
        });
        console.groupEnd();
        return;
      }

      console.log("[ProfileHeader] 팔로우 토글 성공:", !previousState ? "팔로우 추가" : "팔로우 제거");
      console.groupEnd();

      if (onFollowChange) {
        onFollowChange(!previousState);
      }
    } catch (error) {
      console.error("[ProfileHeader] 팔로우 토글 중 오류:", error);
      // 에러 발생 시 원래 상태로 복구
      setIsFollowing(previousState);
      setStats({
        ...stats,
        followers: previousFollowers,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 space-y-4">
      {/* 프로필 정보 (Mobile: 세로, Desktop: 가로) */}
      <div className="flex flex-col md:flex-row md:items-center gap-6">
        {/* 프로필 이미지 */}
        <div className="flex justify-center md:justify-start">
          <Avatar
            src={user.avatar_url}
            alt={user.name || user.username || "User"}
            size="lg"
            fallback={user.name || user.username}
            className="w-[90px] h-[90px] md:w-[150px] md:h-[150px]"
          />
        </div>

        {/* 사용자 정보 */}
        <div className="flex-1 space-y-4">
          {/* 사용자명 및 버튼 */}
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <h1 className="text-2xl font-light text-instagram-primary">
              {user.username || user.name || "Unknown"}
            </h1>
            <div className="flex gap-2">
              {user.is_own_profile ? (
                <Button
                  variant="outline"
                  className="border-instagram rounded-md px-4 py-1.5 text-sm font-semibold"
                  onClick={() => router.push(`/profile/${user.clerk_id}/edit`)}
                >
                  프로필 편집
                </Button>
              ) : (
                <Button
                  onClick={handleFollow}
                  disabled={isLoading}
                  className={`rounded-md px-4 py-1.5 text-sm font-semibold transition-all ${
                    isFollowing
                      ? "bg-gray-100 hover:bg-red-50 border-2 border-gray-300 hover:border-red-500 text-instagram-primary hover:text-red-600 shadow-sm"
                      : "bg-white border-2 border-instagram-blue text-instagram-blue hover:bg-blue-50 shadow-md hover:shadow-lg"
                  }`}
                >
                  {isLoading
                    ? "처리 중..."
                    : isFollowing
                      ? "팔로잉"
                      : "팔로우"}
                </Button>
              )}
            </div>
          </div>

          {/* 통계 */}
          <div className="flex gap-6 md:gap-8">
            <div className="text-center md:text-left">
              <span className="font-semibold text-instagram-primary">
                {stats.posts}
              </span>
              <span className="text-instagram-secondary ml-1">게시물</span>
            </div>
            <button
              onClick={() => setFollowersModalOpen(true)}
              className="text-center md:text-left hover:opacity-50 transition-opacity"
            >
              <span className="font-semibold text-instagram-primary">
                {stats.followers}
              </span>
              <span className="text-instagram-secondary ml-1">팔로워</span>
            </button>
            <button
              onClick={() => setFollowingModalOpen(true)}
              className="text-center md:text-left hover:opacity-50 transition-opacity"
            >
              <span className="font-semibold text-instagram-primary">
                {stats.following}
              </span>
              <span className="text-instagram-secondary ml-1">팔로잉</span>
            </button>
          </div>

          {/* Bio */}
          {user.bio && (
            <div className="space-y-1">
              <p className="font-semibold text-instagram-primary">{user.name}</p>
              <p className="text-instagram-primary">{user.bio}</p>
            </div>
          )}
        </div>
      </div>

      {/* 팔로워/팔로잉 목록 모달 */}
      {user.clerk_id && (
        <>
          <FollowListModal
            open={followersModalOpen}
            onOpenChange={setFollowersModalOpen}
            userId={user.clerk_id}
            type="followers"
            title="팔로워"
          />
          <FollowListModal
            open={followingModalOpen}
            onOpenChange={setFollowingModalOpen}
            userId={user.clerk_id}
            type="following"
            title="팔로잉"
          />
        </>
      )}
    </div>
  );
}

