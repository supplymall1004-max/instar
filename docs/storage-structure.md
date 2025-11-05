# Supabase Storage 구조

## 이미지 업로드 경로 구조

게시물 이미지는 다음 경로 구조를 따릅니다:

```
{user_id}/{post_id}/{filename}
```

### 예시

```
a1b2c3d4-e5f6-7890-abcd-ef1234567890/550e8400-e29b-41d4-a716-446655440000/image.jpg
```

### 경로 구성 요소

1. **user_id**: UUID 형식의 사용자 ID (Supabase users 테이블의 id)
2. **post_id**: UUID 형식의 게시물 ID (posts 테이블의 id)
3. **filename**: 원본 파일명 또는 고유한 파일명

### 파일명 생성 규칙

업로드 시 파일명은 다음과 같이 생성됩니다:

```typescript
const timestamp = Date.now();
const randomString = Math.random().toString(36).substring(2, 15);
const extension = file.name.split('.').pop();
const filename = `${timestamp}-${randomString}.${extension}`;
```

### 버킷 정보

- **버킷 이름**: `posts`
- **공개 여부**: Public (게시물 이미지는 공개)
- **파일 크기 제한**: 5MB
- **허용 파일 형식**: JPEG, JPG, PNG, WebP

### URL 생성

Supabase Storage의 공개 URL은 다음과 같이 생성됩니다:

```
{SUPABASE_URL}/storage/v1/object/public/posts/{user_id}/{post_id}/{filename}
```

### 예시 코드

```typescript
import { getServiceRoleClient } from '@/lib/supabase/service-role';
import { validateImageFile } from '@/lib/utils/image';

async function uploadPostImage(
  userId: string,
  postId: string,
  file: File
): Promise<string> {
  // 파일 검증
  const validation = validateImageFile(file, 5);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // 파일명 생성
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = file.name.split('.').pop();
  const filename = `${timestamp}-${randomString}.${extension}`;

  // 경로 생성
  const filePath = `${userId}/${postId}/${filename}`;

  // Supabase Storage 업로드
  const supabase = getServiceRoleClient();
  const { data, error } = await supabase.storage
    .from('posts')
    .upload(filePath, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }

  // 공개 URL 반환
  const { data: { publicUrl } } = supabase.storage
    .from('posts')
    .getPublicUrl(filePath);

  return publicUrl;
}
```

