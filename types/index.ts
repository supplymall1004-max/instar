/**
 * @file types/index.ts
 * @description Instagram SNS 프로젝트의 TypeScript 타입 정의
 */

/**
 * 사용자 타입 (Clerk 연동)
 */
export interface User {
  id: string;
  clerk_id: string;
  username?: string;
  name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
}

/**
 * 게시물 타입
 */
export interface Post {
  id: string;
  user_id: string;
  image_url?: string | null;
  video_url?: string | null;
  media_type?: 'image' | 'video';
  caption?: string;
  created_at: string;
  updated_at?: string;
  // 조인된 데이터
  user?: User;
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
}

/**
 * 댓글 타입
 */
export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  // 조인된 데이터
  user?: User;
}

/**
 * 좋아요 타입
 */
export interface Like {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

/**
 * 팔로우 타입
 */
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

/**
 * API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 페이지네이션 응답 타입
 */
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

/**
 * 게시물 목록 조회 파라미터
 */
export interface GetPostsParams {
  page?: number;
  pageSize?: number;
  userId?: string;
}

/**
 * 댓글 목록 조회 파라미터
 */
export interface GetCommentsParams {
  postId: string;
  page?: number;
  pageSize?: number;
}

