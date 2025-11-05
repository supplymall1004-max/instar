/**
 * @file app/(main)/layout.tsx
 * @description 메인 레이아웃 (Instagram 스타일)
 * Sidebar (Desktop/Tablet), Header (Mobile), BottomNav (Mobile) 포함
 */

"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-instagram">
      <Sidebar />
      <Header />
      <main className="md:ml-[72px] lg:ml-[244px] pt-[60px] md:pt-0 pb-[50px] md:pb-0">
        <div className="max-w-[630px] mx-auto py-4 px-4 animate-pageFadeIn">
          {children}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}

