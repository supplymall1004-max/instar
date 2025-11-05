/**
 * @file components/layout/bottom-nav.tsx
 * @description Mobile 전용 하단 네비게이션 컴포넌트
 * 높이 50px, 5개 아이콘: 홈, 검색, 만들기, 좋아요, 프로필
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusSquare, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";

const navItems = [
  { icon: Home, href: "/", label: "홈" },
  { icon: Search, href: "/search", label: "검색" },
  { icon: PlusSquare, href: "/create", label: "만들기" },
  { icon: Heart, href: "/notifications", label: "알림" },
  { icon: User, href: "/profile", label: "프로필" },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isLoaded, userId } = useAuth();
  
  // Clerk가 로드되지 않았으면 아무것도 렌더링하지 않음
  if (!isLoaded) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[50px] bg-white border-t border-instagram z-20 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const href = item.href === "/profile" && userId ? `/profile/${userId}` : item.href;
        const isActive = pathname === href || (item.href === "/profile" && pathname?.startsWith("/profile/"));

        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "flex items-center justify-center w-full h-full transition-colors",
              isActive
                ? "text-instagram-primary"
                : "text-instagram-secondary"
            )}
            aria-label={item.label}
          >
            <Icon className="w-6 h-6" />
          </Link>
        );
      })}
    </nav>
  );
}

