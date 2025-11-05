/**
 * @file lib/utils/responsive.ts
 * @description 반응형 브레이크포인트 유틸리티 함수
 */

/**
 * 브레이크포인트 정의
 */
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1024,
} as const;

/**
 * 현재 화면 크기가 모바일인지 확인
 * @param width - 화면 너비 (기본값: window.innerWidth)
 */
export function isMobile(width?: number): boolean {
  if (typeof window === 'undefined') return false;
  return (width ?? window.innerWidth) < breakpoints.mobile;
}

/**
 * 현재 화면 크기가 태블릿인지 확인
 * @param width - 화면 너비 (기본값: window.innerWidth)
 */
export function isTablet(width?: number): boolean {
  if (typeof window === 'undefined') return false;
  const w = width ?? window.innerWidth;
  return w >= breakpoints.mobile && w < breakpoints.tablet;
}

/**
 * 현재 화면 크기가 데스크톱인지 확인
 * @param width - 화면 너비 (기본값: window.innerWidth)
 */
export function isDesktop(width?: number): boolean {
  if (typeof window === 'undefined') return false;
  return (width ?? window.innerWidth) >= breakpoints.desktop;
}

