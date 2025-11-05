/**
 * @file lib/utils/media.ts
 * @description 미디어 파일 (이미지, 동영상) 처리 유틸리티 함수
 */

/**
 * 미디어 파일 유효성 검증 (이미지 및 동영상)
 * @param file - 검증할 파일
 * @param maxSizeMB - 최대 파일 크기 (MB)
 */
export function validateMediaFile(
  file: File,
  maxSizeMB: number = 50
): { valid: boolean; error?: string; type?: 'image' | 'video' } {
  // 파일 타입 검증
  const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'];
  const allowedTypes = [...allowedImageTypes, ...allowedVideoTypes];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPEG, PNG, WebP 이미지 또는 MP4, WebM 동영상만 업로드 가능합니다.',
    };
  }

  // 파일 타입 확인
  const isImage = allowedImageTypes.includes(file.type);
  const isVideo = allowedVideoTypes.includes(file.type);
  const mediaType = isImage ? 'image' : isVideo ? 'video' : undefined;

  if (!mediaType) {
    return {
      valid: false,
      error: '지원하지 않는 파일 형식입니다.',
    };
  }

  // 파일 크기 검증
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다.`,
      type: mediaType,
    };
  }

  return { valid: true, type: mediaType };
}

/**
 * 이미지 파일 유효성 검증 (기존 호환성 유지)
 * @param file - 검증할 파일
 * @param maxSizeMB - 최대 파일 크기 (MB)
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const result = validateMediaFile(file, maxSizeMB);
  if (!result.valid) {
    return result;
  }
  if (result.type !== 'image') {
    return {
      valid: false,
      error: '이미지 파일만 업로드 가능합니다.',
    };
  }
  return { valid: true };
}

/**
 * 고유한 파일명 생성
 * @param originalFilename - 원본 파일명
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalFilename.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
}

/**
 * Storage 경로 생성
 * @param userId - 사용자 ID
 * @param postId - 게시물 ID
 * @param filename - 파일명
 */
export function generateStoragePath(userId: string, postId: string, filename: string): string {
  return `${userId}/${postId}/${filename}`;
}

