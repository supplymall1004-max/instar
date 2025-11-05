/**
 * @file app/(main)/notifications/page.tsx
 * @description 알림 페이지
 * 사용자의 알림 목록을 표시합니다.
 */

"use client";

import { Heart } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-[630px] mx-auto px-4 py-4">
      <div className="bg-instagram-card border border-instagram rounded-sm p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <Heart className="w-16 h-16 text-instagram-secondary mb-4" />
          <h2 className="text-xl font-semibold text-instagram-primary mb-2">
            알림
          </h2>
          <p className="text-instagram-secondary text-sm">
            아직 알림이 없습니다.
          </p>
          <p className="text-instagram-secondary text-sm mt-2">
            다른 사용자가 회원님의 게시물이나 스토리에 좋아요를 누르거나 댓글을 달면 여기에 표시됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

