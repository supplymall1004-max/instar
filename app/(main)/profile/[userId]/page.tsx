/**
 * @file app/(main)/profile/[userId]/page.tsx
 * @description 프로필 페이지
 * 사용자 프로필 정보와 게시물 그리드를 표시
 */

import { notFound } from "next/navigation";
import { ProfileHeader } from "@/components/profile/profile-header";
import { ProfileTabs } from "@/components/profile/profile-tabs";
import { Post } from "@/types";
import { getServiceRoleClient } from "@/lib/supabase/service-role";
import { currentUser } from "@clerk/nextjs/server";

interface PageProps {
  params: Promise<{ userId: string }>;
}

export default async function ProfilePage({ params }: PageProps) {
  const { userId } = await params;

  try {
    console.group("[ProfilePage] 프로필 조회 시작");
    console.log("User ID:", userId);

    const supabase = getServiceRoleClient();

    // 사용자 정보 조회 (clerk_id 또는 id로 조회)
    // UUID 형식인지 확인 (UUID는 36자, Clerk ID는 보통 더 짧음)
    const isUUID = userId.length === 36 && userId.includes('-');
    
    let user;
    let userError;
    
    if (isUUID) {
      // UUID인 경우: id로 조회 (Supabase users 테이블의 id)
      console.log("[ProfilePage] UUID 형식 감지, id로 조회 시도");
      const result = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();
      user = result.data;
      userError = result.error;
    } else {
      // Clerk ID인 경우: clerk_id로 조회
      console.log("[ProfilePage] Clerk ID 형식 감지, clerk_id로 조회 시도");
      const result = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", userId)
        .single();
      user = result.data;
      userError = result.error;
    }

    if (userError || !user) {
      console.error("[ProfilePage] 사용자 조회 실패:", userError);
      console.groupEnd();
      notFound();
    }
    
    console.log("[ProfilePage] 사용자 조회 성공:", { id: user.id, clerk_id: user.clerk_id });

    // 통계 조회
    const [postsResult, followersResult, followingResult] = await Promise.all([
      supabase.from("posts").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("following_id", user.id),
      supabase
        .from("follows")
        .select("id", { count: "exact", head: true })
        .eq("follower_id", user.id),
    ]);

    // 현재 사용자가 이 사용자를 팔로우하는지 확인
    const currentUserData = await currentUser();
    let isFollowing = false;

    if (currentUserData) {
      const { data: currentUserSupabase } = await supabase
        .from("users")
        .select("id")
        .eq("clerk_id", currentUserData.id)
        .single();

      if (currentUserSupabase) {
        const { data: followCheck } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", currentUserSupabase.id)
          .eq("following_id", user.id)
          .single();

        isFollowing = !!followCheck;
      }
    }

    const userWithStats = {
      ...user,
      stats: {
        posts: postsResult.count || 0,
        followers: followersResult.count || 0,
        following: followingResult.count || 0,
      },
      is_following: isFollowing,
      is_own_profile: currentUserData?.id === userId,
    };

    // 게시물 조회 헬퍼 함수
    const fetchPostsWithStats = async (postsData: any[]): Promise<Post[]> => {
      return Promise.all(
        postsData.map(async (post: any) => {
          try {
            let likesResult: any = { count: 0, error: null };
            let commentsResult: any = { count: 0, error: null };

            try {
              [likesResult, commentsResult] = await Promise.all([
                supabase.from("likes").select("id", { count: "exact", head: true }).eq("post_id", post.id),
                supabase.from("comments").select("id", { count: "exact", head: true }).eq("post_id", post.id),
              ]);
            } catch (queryError) {
              console.error(`[ProfilePage] 게시물 ${post.id}의 좋아요/댓글 수 조회 중 오류:`, queryError);
            }

            return {
              ...post,
              likes_count: likesResult.count || 0,
              comments_count: commentsResult.count || 0,
            };
          } catch (error) {
            console.error(`[ProfilePage] 게시물 ${post.id} 처리 중 오류:`, error);
            return {
              ...post,
              likes_count: 0,
              comments_count: 0,
            };
          }
        })
      );
    };

    // 일반 게시물 가져오기 (이미지만)
    const { data: postsData } = await supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        image_url,
        video_url,
        media_type,
        caption,
        created_at,
        updated_at,
        user:users(id, clerk_id, name, avatar_url)
      `
      )
      .eq("user_id", user.id)
      .eq("media_type", "image")
      .order("created_at", { ascending: false })
      .limit(100);

    // 릴스 가져오기 (동영상만)
    const { data: reelsData } = await supabase
      .from("posts")
      .select(
        `
        id,
        user_id,
        image_url,
        video_url,
        media_type,
        caption,
        created_at,
        updated_at,
        user:users(id, clerk_id, name, avatar_url)
      `
      )
      .eq("user_id", user.id)
      .eq("media_type", "video")
      .order("created_at", { ascending: false })
      .limit(100);

    // 태그된 게시물 가져오기
    const { data: taggedPostsData } = await supabase
      .from("post_tags")
      .select(
        `
        post_id,
        post:posts(
          id,
          user_id,
          image_url,
          video_url,
          media_type,
          caption,
          created_at,
          updated_at,
          user:users(id, clerk_id, name, avatar_url)
        )
      `
      )
      .eq("tagged_user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    // 각 게시물의 좋아요 수, 댓글 수 조회
    const posts: Post[] = await fetchPostsWithStats(postsData || []);
    const reels: Post[] = await fetchPostsWithStats(reelsData || []);
    
    // 태그된 게시물 처리
    const taggedPostsRaw = taggedPostsData || [];
    const taggedPostsProcessed = taggedPostsRaw
      .map((item: any) => {
        const post = Array.isArray(item.post) ? item.post[0] : item.post;
        return post;
      })
      .filter((post: any) => post != null);
    const taggedPosts: Post[] = await fetchPostsWithStats(taggedPostsProcessed);

    console.log("[ProfilePage] 프로필 조회 성공");
    console.groupEnd();

    return (
    <div className="max-w-[935px] mx-auto px-4 pb-16">
      {/* 프로필 헤더 */}
      <ProfileHeader user={userWithStats} />

      {/* 탭 메뉴 및 콘텐츠 */}
      <ProfileTabs posts={posts} reels={reels} taggedPosts={taggedPosts} />
    </div>
    );
  } catch (error) {
    console.error("[ProfilePage] 예기치 않은 오류:", error);
    notFound();
  }
}

