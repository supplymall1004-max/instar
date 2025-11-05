/**
 * @file components/layout/header.tsx
 * @description Mobile 전용 헤더 컴포넌트
 * 높이 60px, Instagram 로고 + 알림/DM/프로필 아이콘
 */

"use client";

import Link from "next/link";
import { Heart, MessageCircle, User } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

export function Header() {
  const { isLoaded, userId } = useAuth();
  
  // Clerk가 로드되지 않았으면 아무것도 렌더링하지 않음
  if (!isLoaded) {
    return null;
  }

  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-[60px] bg-white border-b border-instagram z-20 flex items-center justify-between px-4">
      <Link href="/" className="flex items-center">
        <h1 className="text-xl font-bold text-instagram-primary">Instagram</h1>
      </Link>
      <div className="flex items-center gap-4">
        <Link href="/notifications" className="text-instagram-primary">
          <Heart className="w-6 h-6" />
        </Link>
        <Link href="/messages" className="text-instagram-primary">
          <MessageCircle className="w-6 h-6" />
        </Link>
        <Link
          href={userId ? `/profile/${userId}` : "/profile"}
          className="text-instagram-primary"
        >
          <User className="w-6 h-6" />
        </Link>
      </div>
    </header>
  );
}

