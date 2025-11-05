/**
 * @file app/(main)/search/page.tsx
 * @description 검색 페이지
 * 사용자 검색 기능을 제공합니다.
 */

"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorMessage } from "@/components/ui/error-message";
import Link from "next/link";

interface User {
  id: string;
  clerk_id: string;
  name: string;
  username?: string;
  avatar_url?: string;
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 검색어가 변경될 때마다 API 호출 (debounce)
  useEffect(() => {
    // 기존 타이머 취소
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 검색어가 비어있으면 결과 초기화
    if (!searchQuery.trim()) {
      setUsers([]);
      setLoading(false);
      return;
    }

    // 300ms 후에 검색 실행 (debounce)
    setLoading(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        console.group("[SearchPage] 사용자 검색 시작");
        console.log("검색어:", searchQuery);

        const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery.trim())}`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          console.error("[SearchPage] 검색 실패:", result.error || result.message);
          setError(result.error || result.message || "검색 중 오류가 발생했습니다.");
          setUsers([]);
          console.groupEnd();
          return;
        }

        console.log("[SearchPage] 검색 성공:", result.data?.length || 0);
        setUsers(result.data || []);
        setError(null);
        console.groupEnd();
      } catch (error) {
        console.error("[SearchPage] 검색 중 오류:", error);
        setError("검색 중 오류가 발생했습니다.");
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  return (
    <div className="max-w-[630px] mx-auto px-4 py-4">
      {/* 검색 입력창 */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-instagram-secondary" />
          <input
            type="text"
            placeholder="검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-instagram-card border border-instagram rounded-lg text-instagram-primary placeholder:text-instagram-secondary focus:outline-none focus:ring-2 focus:ring-instagram-primary"
            autoFocus
          />
        </div>
      </div>

      {/* 검색 결과 */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => {
            setError(null);
            // 검색 재시도
            if (searchQuery.trim()) {
              setLoading(true);
              fetch(`/api/users/search?query=${encodeURIComponent(searchQuery.trim())}`)
                .then((res) => res.json())
                .then((result) => {
                  if (result.success) {
                    setUsers(result.data || []);
                    setError(null);
                  } else {
                    setError(result.error || result.message || "검색 중 오류가 발생했습니다.");
                    setUsers([]);
                  }
                })
                .catch((err) => {
                  console.error("[SearchPage] 검색 재시도 중 오류:", err);
                  setError("검색 중 오류가 발생했습니다.");
                  setUsers([]);
                })
                .finally(() => setLoading(false));
            }
          }}
        />
      )}

      {loading && (
        <div className="space-y-2 py-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && searchQuery.trim() && users.length === 0 && (
        <div className="text-center py-8">
          <p className="text-instagram-secondary text-sm">검색 결과가 없습니다.</p>
        </div>
      )}

      {!loading && !error && users.length > 0 && (
        <div className="space-y-1">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/profile/${user.clerk_id}`}
              className="flex items-center gap-3 px-4 py-3 hover:bg-instagram-card rounded-lg transition-colors"
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

      {/* 검색어가 없을 때 */}
      {!searchQuery.trim() && !loading && (
        <div className="text-center py-12">
          <p className="text-instagram-secondary text-sm">사용자 이름이나 이름을 검색해보세요.</p>
        </div>
      )}
    </div>
  );
}

