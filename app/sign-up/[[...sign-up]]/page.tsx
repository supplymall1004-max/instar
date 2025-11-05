/**
 * @file app/sign-up/[[...sign-up]]/page.tsx
 * @description Clerk 회원가입 페이지
 * Clerk의 동적 라우팅을 사용하여 회원가입 페이지를 처리합니다.
 */

import { SignUp } from "@clerk/nextjs";

interface SignUpPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const redirectUrl = params.redirect_url as string | undefined;

  return (
    <div className="min-h-screen bg-instagram flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        <SignUp 
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
