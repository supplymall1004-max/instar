/**
 * @file lib/utils/date.ts
 * @description 시간 포맷팅 유틸리티 함수
 */

/**
 * 상대 시간 포맷팅 (예: "3시간 전", "2일 전")
 * @param date - 날짜 문자열 또는 Date 객체
 */
export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) {
    return '방금 전';
  } else if (diffMin < 60) {
    return `${diffMin}분 전`;
  } else if (diffHour < 24) {
    return `${diffHour}시간 전`;
  } else if (diffDay < 7) {
    return `${diffDay}일 전`;
  } else if (diffWeek < 4) {
    return `${diffWeek}주 전`;
  } else if (diffMonth < 12) {
    return `${diffMonth}개월 전`;
  } else {
    return `${diffYear}년 전`;
  }
}

/**
 * 절대 시간 포맷팅 (예: "2024년 1월 15일")
 * @param date - 날짜 문자열 또는 Date 객체
 */
export function formatAbsoluteDate(date: string | Date): string {
  const target = typeof date === 'string' ? new Date(date) : date;
  return target.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * 숫자 포맷팅 (예: 1234 → "1,234")
 * @param num - 포맷팅할 숫자
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('ko-KR').format(num);
}

