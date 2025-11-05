/**
 * @file components/ui/avatar.tsx
 * @description 프로필 이미지 컴포넌트
 */

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: string;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

export function Avatar({
  src,
  alt = "프로필 이미지",
  size = "md",
  fallback,
  className,
  ...props
}: AvatarProps) {
  const [imgError, setImgError] = React.useState(false);

  const handleError = () => {
    setImgError(true);
  };

  if (imgError || !src) {
    return (
      <div
        className={cn(
          "rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-semibold",
          sizeClasses[size],
          className
        )}
        {...(props as React.HTMLAttributes<HTMLDivElement>)}
      >
        {fallback ? (
          fallback.charAt(0).toUpperCase()
        ) : (
          <svg
            className="w-1/2 h-1/2"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("rounded-full object-cover", sizeClasses[size], className)}
      onError={handleError}
      {...props}
    />
  );
}

