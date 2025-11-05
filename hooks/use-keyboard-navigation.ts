/**
 * @file hooks/use-keyboard-navigation.ts
 * @description 키보드 네비게이션 지원 훅
 * Tab, Enter, Escape 키 지원
 */

import { useEffect, useCallback } from 'react';

interface KeyboardNavigationOptions {
  onEnter?: () => void;
  onEscape?: () => void;
  onTab?: (e: KeyboardEvent) => void;
  enabled?: boolean;
}

/**
 * 키보드 네비게이션 훅
 * @param options - 키보드 이벤트 핸들러 옵션
 */
export function useKeyboardNavigation(options: KeyboardNavigationOptions = {}) {
  const { onEnter, onEscape, onTab, enabled = true } = options;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      // Tab 키: 기본 동작 허용 (접근성)
      if (e.key === 'Tab' && onTab) {
        onTab(e);
      }

      // Enter 키: 포커스된 요소가 버튼이나 링크가 아닐 때만 처리
      if (e.key === 'Enter' && onEnter) {
        const target = e.target as HTMLElement;
        if (
          target.tagName !== 'BUTTON' &&
          target.tagName !== 'A' &&
          !target.isContentEditable
        ) {
          e.preventDefault();
          onEnter();
        }
      }

      // Escape 키: 모달 닫기 등
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
      }
    },
    [enabled, onEnter, onEscape, onTab]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

