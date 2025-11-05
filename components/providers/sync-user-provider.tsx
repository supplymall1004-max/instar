"use client";

import { useSyncUser } from "@/hooks/use-sync-user";

/**
 * Clerk 사용자를 Supabase DB에 자동으로 동기화하는 프로바이더
 *
 * RootLayout에 추가하여 로그인한 모든 사용자를 자동으로 Supabase에 동기화합니다.
 * 동기화 중 오류가 발생해도 레이아웃은 정상적으로 렌더링됩니다.
 * useSyncUser는 내부적으로 에러를 처리하므로 안전하게 호출할 수 있습니다.
 */
export function SyncUserProvider({ children }: { children: React.ReactNode }) {
  useSyncUser();
  return <>{children}</>;
}
