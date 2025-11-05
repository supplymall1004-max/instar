/**
 * @file app/error.tsx
 * @description 전역 에러 핸들러
 */

"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-instagram flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h2 className="text-2xl font-bold text-instagram-primary mb-4">
          문제가 발생했습니다
        </h2>
        <p className="text-instagram-secondary mb-4">
          {error.message || "알 수 없는 오류가 발생했습니다."}
        </p>
        {error.digest && (
          <p className="text-xs text-instagram-secondary mb-4">
            오류 ID: {error.digest}
          </p>
        )}
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2 bg-instagram-primary text-white rounded-lg hover:opacity-90"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="px-4 py-2 bg-instagram-secondary text-white rounded-lg hover:opacity-90"
          >
            홈으로
          </Link>
        </div>
      </div>
    </div>
  );
}

