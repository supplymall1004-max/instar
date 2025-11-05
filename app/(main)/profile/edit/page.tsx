/**
 * @file app/(main)/profile/edit/page.tsx
 * @description 프로필 편집 페이지
 */

"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileEditPage() {
  const { userId: clerkUserId, isLoaded } = useAuth();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // 사용자 정보 로드
  useEffect(() => {
    if (!isLoaded || !clerkUserId) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("users")
          .select("id, name, username, bio, avatar_url")
          .eq("clerk_id", clerkUserId)
          .single();

        if (fetchError) {
          console.error("[ProfileEditPage] 사용자 조회 실패:", fetchError);
          setError("사용자 정보를 불러오는데 실패했습니다.");
          return;
        }

        if (data) {
          setName(data.name || "");
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("[ProfileEditPage] 오류:", error);
        setError("사용자 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [isLoaded, clerkUserId, supabase]);

  const handleSave = async () => {
    if (!isLoaded || !clerkUserId) return;

    setSaving(true);
    setError(null);

    try {
      console.group("[ProfileEditPage] 프로필 저장 시작");
      console.log("Name:", name);
      console.log("Username:", username);
      console.log("Bio:", bio);

      const { error: updateError } = await supabase
        .from("users")
        .update({
          name: name.trim() || null,
          username: username.trim() || null,
          bio: bio.trim() || null,
        })
        .eq("clerk_id", clerkUserId);

      if (updateError) {
        console.error("[ProfileEditPage] 프로필 저장 실패:", updateError);
        setError(updateError.message || "프로필 저장에 실패했습니다.");
        console.groupEnd();
        return;
      }

      console.log("[ProfileEditPage] 프로필 저장 성공");
      console.groupEnd();

      // 프로필 페이지로 이동
      router.push(`/profile/${clerkUserId}`);
    } catch (error) {
      console.error("[ProfileEditPage] 프로필 저장 중 오류:", error);
      setError("프로필 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="max-w-[630px] mx-auto px-4 py-8">
        <Skeleton className="h-8 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!clerkUserId) {
    return (
      <div className="max-w-[630px] mx-auto px-4 py-8">
        <p className="text-red-500">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[630px] mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold text-instagram-primary mb-6">프로필 편집</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* 프로필 이미지 */}
          <div className="flex items-center gap-6">
            <Avatar
              src={avatarUrl}
              alt={name || "프로필"}
              size="lg"
              fallback={name || "U"}
              className="w-20 h-20"
            />
            <div>
              <p className="font-semibold text-instagram-primary mb-1">
                {username || name || "사용자"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-sm"
                onClick={() => {
                  alert("프로필 이미지 변경 기능은 준비 중입니다.");
                }}
              >
                프로필 사진 변경
              </Button>
            </div>
          </div>

          {/* 이름 */}
          <div>
            <label className="block text-sm font-medium text-instagram-primary mb-2">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-instagram rounded-md bg-white text-instagram-primary focus:outline-none focus:ring-2 focus:ring-instagram-primary"
              placeholder="이름을 입력하세요"
            />
          </div>

          {/* 사용자명 */}
          <div>
            <label className="block text-sm font-medium text-instagram-primary mb-2">
              사용자명
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-instagram rounded-md bg-white text-instagram-primary focus:outline-none focus:ring-2 focus:ring-instagram-primary"
              placeholder="사용자명을 입력하세요"
            />
          </div>

          {/* 소개 */}
          <div>
            <label className="block text-sm font-medium text-instagram-primary mb-2">
              소개
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={150}
              className="w-full px-3 py-2 border border-instagram rounded-md bg-white text-instagram-primary focus:outline-none focus:ring-2 focus:ring-instagram-primary resize-none"
              placeholder="소개를 입력하세요"
            />
            <p className="text-xs text-instagram-secondary mt-1 text-right">
              {bio.length}/150
            </p>
          </div>

          {/* 저장 버튼 */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
            >
              취소
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-instagram-blue text-white hover:bg-instagram-blue/90"
            >
              {saving ? "저장 중..." : "저장"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

