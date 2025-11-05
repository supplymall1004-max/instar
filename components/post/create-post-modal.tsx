/**
 * @file components/post/create-post-modal.tsx
 * @description 게시물 작성 모달 컴포넌트
 * Instagram 스타일의 게시물 작성 UI
 */

"use client";

import { useState, useRef } from "react";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { validateMediaFile, generateUniqueFilename, generateStoragePath } from "@/lib/utils/media";
import { useClerkSupabaseClient } from "@/lib/supabase/clerk-client";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface CreatePostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreatePostModal({ open, onOpenChange, onSuccess }: CreatePostModalProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const supabase = useClerkSupabaseClient();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 키보드 네비게이션: Escape 키로 모달 닫기
  useKeyboardNavigation({
    onEscape: () => {
      if (open && !uploading) {
        onOpenChange(false);
      }
    },
    enabled: open,
  });

  const MAX_CAPTION_LENGTH = 2200;
  const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB (동영상 포함)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 검증
    const validation = validateMediaFile(file, MAX_FILE_SIZE / (1024 * 1024)); // MB 단위로 변환
    if (!validation.valid) {
      setError(validation.error || "파일 선택 실패");
      return;
    }

    setError(null);
    setSelectedFile(file);
    setMediaType(validation.type || null);

    // 미리보기 생성
    if (validation.type === 'image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (validation.type === 'video') {
      // 동영상은 URL.createObjectURL 사용
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !userId || !mediaType) {
      setError("파일을 선택하세요.");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.group("[CreatePostModal] 게시물 업로드 시작");

      // 1. 사용자 정보 조회 (Supabase user_id 필요)
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", userId)
        .single();

      if (userError || !userData) {
        console.error("[CreatePostModal] 사용자 조회 실패:", userError);
        setError("사용자 정보를 찾을 수 없습니다.");
        setUploading(false);
        console.groupEnd();
        return;
      }

      // 2. 임시 게시물 생성 (post_id 필요)
      const { data: tempPost, error: postError } = await supabase
        .from("posts")
        .insert({
          user_id: userData.id,
          image_url: mediaType === 'image' ? "" : null, // 임시로 빈 값
          video_url: mediaType === 'video' ? "" : null, // 임시로 빈 값
          media_type: mediaType,
          caption: caption || null,
        })
        .select()
        .single();

      if (postError || !tempPost) {
        console.error("[CreatePostModal] 게시물 생성 실패:", postError);
        setError("게시물 생성에 실패했습니다.");
        setUploading(false);
        console.groupEnd();
        return;
      }

      console.log("[CreatePostModal] 임시 게시물 생성 성공:", tempPost.id);

      // 3. 미디어 파일 업로드 (Storage)
      const filename = generateUniqueFilename(selectedFile.name);
      const storagePath = generateStoragePath(userData.id, tempPost.id, filename);

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(storagePath, selectedFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(`[CreatePostModal] ${mediaType === 'image' ? '이미지' : '동영상'} 업로드 실패:`, uploadError);
        // 임시 게시물 삭제
        await supabase.from("posts").delete().eq("id", tempPost.id);
        setError(`${mediaType === 'image' ? '이미지' : '동영상'} 업로드에 실패했습니다.`);
        setUploading(false);
        console.groupEnd();
        return;
      }

      // 4. 미디어 URL 가져오기
      const { data: urlData } = supabase.storage
        .from("posts")
        .getPublicUrl(storagePath);

      const mediaUrl = urlData.publicUrl;

      // 5. 게시물에 미디어 URL 업데이트
      const updateData: { image_url?: string | null; video_url?: string | null } = {};
      if (mediaType === 'image') {
        updateData.image_url = mediaUrl;
        updateData.video_url = null;
      } else {
        updateData.video_url = mediaUrl;
        updateData.image_url = null;
      }

      const { error: updateError } = await supabase
        .from("posts")
        .update(updateData)
        .eq("id", tempPost.id);

      if (updateError) {
        console.error(`[CreatePostModal] ${mediaType === 'image' ? '이미지' : '동영상'} URL 업데이트 실패:`, updateError);
        setError("게시물 업데이트에 실패했습니다.");
        setUploading(false);
        console.groupEnd();
        return;
      }

      console.log("[CreatePostModal] 게시물 업로드 성공:", tempPost.id);
      console.groupEnd();

      // 성공 처리
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      onOpenChange(false);

      // 피드 새로고침
      if (onSuccess) {
        onSuccess();
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error("[CreatePostModal] 예기치 않은 오류:", error);
      setError("게시물 업로드 중 오류가 발생했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      setMediaType(null);
      setCaption("");
      setError(null);
      // 동영상 URL 정리
      if (previewUrl && mediaType === 'video') {
        URL.revokeObjectURL(previewUrl);
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-center text-lg font-semibold">
            새 게시물 만들기
          </DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* 이미지 선택 영역 */}
          {!previewUrl ? (
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-instagram rounded-lg p-12">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-instagram-primary hover:bg-instagram-primary/90"
              >
                사진 또는 동영상 선택
              </Button>
              <p className="text-sm text-instagram-secondary mt-2">
                이미지: JPEG, PNG, WebP<br />
                동영상: MP4, WebM (최대 50MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* 미디어 미리보기 */}
              <div className="relative aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                {mediaType === 'image' && previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : mediaType === 'video' && previewUrl ? (
                  <video
                    src={previewUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : null}
                <button
                  onClick={() => {
                    if (previewUrl && mediaType === 'video') {
                      URL.revokeObjectURL(previewUrl);
                    }
                    setSelectedFile(null);
                    setPreviewUrl(null);
                    setMediaType(null);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = "";
                    }
                  }}
                  className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* 캡션 입력 */}
              <div className="space-y-2">
                <textarea
                  value={caption}
                  onChange={(e) => {
                    if (e.target.value.length <= MAX_CAPTION_LENGTH) {
                      setCaption(e.target.value);
                    }
                  }}
                  placeholder="캡션 작성..."
                  className="w-full min-h-[120px] p-3 border border-instagram rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-instagram-primary"
                  rows={4}
                />
                <div className="flex justify-between items-center text-sm text-instagram-secondary">
                  <span>{caption.length} / {MAX_CAPTION_LENGTH}</span>
                </div>
              </div>

              {/* 에러 메시지 */}
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* 업로드 버튼 */}
              <Button
                onClick={handleUpload}
                disabled={uploading || !selectedFile}
                className="w-full bg-instagram-primary hover:bg-instagram-primary/90 disabled:opacity-50"
              >
                {uploading ? "업로드 중..." : "게시하기"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

