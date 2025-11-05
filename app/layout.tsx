import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";

import { SyncUserProvider } from "@/components/providers/sync-user-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS 템플릿",
  description: "Next.js + Clerk + Supabase 보일러플레이트",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko">
        <body className="antialiased">
          <SyncUserProvider>
            {children}
          </SyncUserProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
