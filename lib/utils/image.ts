/**
 * @file lib/utils/image.ts
 * @description 이미지 처리 유틸리티 함수
 */

/**
 * 이미지 파일 유효성 검증
 * @param file - 검증할 파일
 * @param maxSizeMB - 최대 파일 크기 (MB)
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  // 파일 타입 검증
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPEG, PNG, WebP 형식만 업로드 가능합니다.',
    };
  }

  // 파일 크기 검증
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`,
    };
  }

  return { valid: true };
}

/**
 * 이미지 URL 생성 (Supabase Storage)
 * @param bucket - 버킷 이름
 * @param path - 파일 경로
 */
export function getImageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL이 설정되지 않았습니다.');
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * 이미지 프리로드
 * @param url - 이미지 URL
 */
export function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * 고유한 파일명 생성
 * @param originalName - 원본 파일명
 */
export function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop() || 'jpg';
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Supabase Storage 이미지 업로드 경로 생성
 * @param userId - 사용자 ID (UUID)
 * @param postId - 게시물 ID (UUID)
 * @param filename - 파일명
 */
export function generateStoragePath(
  userId: string,
  postId: string,
  filename: string
): string {
  return `${userId}/${postId}/${filename}`;
}

