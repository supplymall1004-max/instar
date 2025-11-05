/**
 * @file app/sign-in/[[...sign-in]]/page.tsx
 * @description Clerk 로그인 페이지
 * Clerk의 동적 라우팅을 사용하여 로그인 페이지를 처리합니다.
 */

import { SignIn } from "@clerk/nextjs";

interface SignInPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const redirectUrl = params.redirect_url as string | undefined;

  return (
    <div className="min-h-screen bg-instagram flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <SignIn 
          fallbackRedirectUrl={redirectUrl || "/"}
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-white shadow-lg",
            },
          }}
        />
      </div>
    </div>
  );
}

