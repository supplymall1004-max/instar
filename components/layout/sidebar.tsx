/**
 * @file components/layout/sidebar.tsx
 * @description Instagram 스타일 사이드바 컴포넌트
 * Desktop: 244px 너비, 아이콘 + 텍스트
 * Tablet: 72px 너비, 아이콘만 표시
 * Mobile: 숨김
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Heart, User, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth, SignOutButton } from "@clerk/nextjs";
import { CreatePostModal } from "@/components/post/create-post-modal";

const menuItems = [
  { icon: Home, label: "홈", href: "/" },
  { icon: Search, label: "검색", href: "/search" },
  { icon: PlusSquare, label: "만들기", href: "/create" },
  { icon: Heart, label: "알림", href: "/notifications" },
  { icon: User, label: "프로필", href: "/profile" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  const [createPostOpen, setCreatePostOpen] = useState(false);
  
  // Clerk가 로드되지 않았으면 아무것도 렌더링하지 않음
  if (!isLoaded) {
    return null;
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen bg-white border-r border-instagram z-10">
      {/* Desktop: 244px 너비 */}
      <div className="hidden lg:flex flex-col w-[244px] px-2 pt-8">
        <div className="mb-8 px-2">
          <h1 className="text-2xl font-bold text-instagram-primary">Instagram</h1>
        </div>
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = item.href === "/profile" && userId ? `/profile/${userId}` : item.href;
            // Active 상태 확인 (프로필 페이지는 /profile/로 시작하는 경로도 포함)
            const isActive = item.href === "/profile" 
              ? pathname === href || pathname?.startsWith("/profile/")
              : pathname === item.href;

            // "만들기" 메뉴는 모달 열기
            if (item.href === "/create") {
              return (
                <button
                  key={item.href}
                  onClick={() => setCreatePostOpen(true)}
                  className={cn(
                    "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors w-full text-left",
                    isActive
                      ? "font-bold text-instagram-primary"
                      : "text-instagram-primary hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-base">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors",
                  isActive
                    ? "font-bold text-instagram-primary"
                    : "text-instagram-primary hover:bg-gray-50"
                )}
              >
                <Icon className="w-6 h-6" />
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
          {/* 로그아웃 버튼 (로그인된 경우만 표시) */}
          {userId && (
            <SignOutButton>
              <button
                className={cn(
                  "flex items-center gap-4 px-3 py-3 rounded-lg transition-colors w-full text-left text-instagram-primary hover:bg-gray-50"
                )}
              >
                <LogOut className="w-6 h-6" />
                <span className="text-base">로그아웃</span>
              </button>
            </SignOutButton>
          )}
        </nav>
      </div>

      {/* Tablet: 72px 너비, 아이콘만 */}
      <div className="lg:hidden flex flex-col w-[72px] items-center pt-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-instagram-primary">IG</h1>
        </div>
        <nav className="flex flex-col gap-1 w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const href = item.href === "/profile" && userId ? `/profile/${userId}` : item.href;
            // Active 상태 확인 (프로필 페이지는 /profile/로 시작하는 경로도 포함)
            const isActive = item.href === "/profile" 
              ? pathname === href || pathname?.startsWith("/profile/")
              : pathname === item.href;

            // "만들기" 메뉴는 모달 열기
            if (item.href === "/create") {
              return (
                <button
                  key={item.href}
                  onClick={() => setCreatePostOpen(true)}
                  className={cn(
                    "flex items-center justify-center w-full py-3 rounded-lg transition-colors",
                    isActive
                      ? "font-bold text-instagram-primary"
                      : "text-instagram-primary hover:bg-gray-50"
                  )}
                  title={item.label}
                >
                  <Icon className="w-6 h-6" />
                </button>
              );
            }

            return (
              <Link
                key={item.href}
                href={href}
                className={cn(
                  "flex items-center justify-center w-full py-3 rounded-lg transition-colors",
                  isActive
                    ? "font-bold text-instagram-primary"
                    : "text-instagram-primary hover:bg-gray-50"
                )}
                title={item.label}
              >
                <Icon className="w-6 h-6" />
              </Link>
            );
          })}
          {/* 로그아웃 버튼 (로그인된 경우만 표시) */}
          {userId && (
            <SignOutButton>
              <button
                className={cn(
                  "flex items-center justify-center w-full py-3 rounded-lg transition-colors text-instagram-primary hover:bg-gray-50"
                )}
                title="로그아웃"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </SignOutButton>
          )}
        </nav>
      </div>
      <CreatePostModal
        open={createPostOpen}
        onOpenChange={setCreatePostOpen}
      />
    </aside>
  );
}

