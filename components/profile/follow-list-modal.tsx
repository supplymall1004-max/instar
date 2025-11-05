/**
 * @file components/profile/follow-list-modal.tsx
 * @description 팔로워/팔로잉 목록 모달 컴포넌트
 */

"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";
import { X } from "lucide-react";

interface User {
  id: string;
  clerk_id: string;
  name: string;
  username?: string;
  avatar_url?: string;
}

interface FollowListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string; // Clerk user ID
  type: "followers" | "following";
  title: string;
}

export function FollowListModal({
  open,
  onOpenChange,
  userId,
  type,
  title,
}: FollowListModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && userId) {
      fetchUsers();
    } else {
      // 모달이 닫히면 상태 초기화
      setUsers([]);
      setError(null);
    }
  }, [open, userId, type]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      console.group(`[FollowListModal] ${type} 목록 조회 시작`);
      console.log("User ID:", userId);
      console.log("Type:", type);

      const response = await fetch(`/api/follows/list?userId=${encodeURIComponent(userId)}&type=${type}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        console.error(`[FollowListModal] ${type} 목록 조회 실패:`, result.error || result.message);
        setError(result.error || result.message || `${title} 목록을 불러오는데 실패했습니다.`);
        console.groupEnd();
        return;
      }

      console.log(`[FollowListModal] ${type} 목록 조회 성공:`, result.data?.length || 0);
      console.groupEnd();

      setUsers(result.data || []);
    } catch (error) {
      console.error(`[FollowListModal] ${type} 목록 조회 중 오류:`, error);
      setError(`${title} 목록을 불러오는 중 오류가 발생했습니다.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] p-0 max-h-[80vh] overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        {/* 헤더 */}
        <div className="border-b border-instagram px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-instagram-primary">{title}</h2>
          <button
            onClick={() => onOpenChange(false)}
            className="text-instagram-primary hover:opacity-50 transition-opacity"
            aria-label="닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 목록 */}
        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="space-y-2 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-4">
              <ErrorMessage
                message={error}
                onRetry={fetchUsers}
              />
            </div>
          )}

          {!loading && !error && users.length === 0 && (
            <div className="text-center py-12 px-4">
              <p className="text-instagram-secondary text-sm">{title}이 없습니다.</p>
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="divide-y divide-instagram">
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.clerk_id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-instagram-card transition-colors"
                >
                  <Avatar
                    src={user.avatar_url}
                    alt={user.name || user.username || "User"}
                    size="md"
                    fallback={user.name || user.username}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-instagram-primary truncate">
                      {user.username || user.name}
                    </p>
                    {user.username && user.name && (
                      <p className="text-sm text-instagram-secondary truncate">{user.name}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

