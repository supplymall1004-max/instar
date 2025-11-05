/**
 * @file components/ui/error-message.tsx
 * @description 에러 메시지 표시 컴포넌트
 * 일관된 에러 메시지 UI 제공
 */

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorMessage({ message, onRetry, className }: ErrorMessageProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <p className="text-red-500 mb-2 font-semibold">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-instagram-blue hover:opacity-70 text-sm font-semibold mt-2"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}

