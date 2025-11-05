/**
 * @file components/ui/skeleton.tsx
 * @description 로딩 스켈레톤 UI 컴포넌트
 * Shimmer 효과가 포함된 애니메이션
 */

import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200 dark:bg-gray-800 relative overflow-hidden",
        className
      )}
      {...props}
    >
      {/* Shimmer 효과 */}
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
    </div>
  );
}

export { Skeleton };

