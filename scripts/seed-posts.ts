/**
 * @file scripts/seed-posts.ts
 * @description 게시물 시드 데이터 생성 스크립트
 * 임의의 게시물 5개를 생성합니다.
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// 환경 변수 로드
config({ path: ".env.local" });
config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("환경 변수가 설정되지 않았습니다.");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
  console.error("SUPABASE_SERVICE_ROLE_KEY:", !!supabaseKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const samplePosts = [
  {
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    caption: "오늘 날씨가 정말 좋네요! 🌞 산책하기 완벽한 날입니다. #일상 #산책 #좋은날씨",
  },
  {
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80",
    caption: "맛있는 커피와 함께하는 아침 ☕️ 새벽 기상이지만 에너지가 넘칩니다! #커피 #아침 #일상",
  },
  {
    image_url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80",
    caption: "자연 속에서 힐링하는 시간 🌲 숲속의 신선한 공기를 마시니 마음이 편안해집니다. #자연 #힐링 #휴식",
  },
  {
    image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
    caption: "도시의 야경이 아름답네요 🌃 밤이 되면 세상이 또 다른 모습으로 변하죠. #야경 #도시 #밤",
  },
  {
    image_url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    caption: "새로운 하루를 시작합니다! 🌅 오늘도 화이팅! #일상 #아침 #새로운시작",
  },
];

async function seedPosts() {
  try {
    console.log("📝 게시물 시드 데이터 생성 시작...\n");

    // 1. 사용자 확인 (없으면 생성)
    let { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, clerk_id, name")
      .limit(1);

    if (usersError) {
      console.error("❌ 사용자 조회 실패:", usersError);
      throw usersError;
    }

    let userId: string;

    if (!users || users.length === 0) {
      console.log("⚠️  사용자가 없습니다. 임시 사용자를 생성합니다...");
      const testClerkId = `test_user_${Date.now()}`;
      const { data: newUser, error: createError } = await supabase
        .from("users")
        .insert({
          clerk_id: testClerkId,
          name: "테스트 사용자",
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error("❌ 사용자 생성 실패:", createError);
        throw createError;
      }

      userId = newUser.id;
      console.log("✅ 임시 사용자 생성 완료:", newUser.id);
    } else {
      userId = users[0].id;
      console.log("✅ 기존 사용자 사용:", users[0].name || users[0].clerk_id);
    }

    // 2. 기존 게시물 확인
    const { data: existingPosts } = await supabase
      .from("posts")
      .select("id")
      .eq("user_id", userId);

    if (existingPosts && existingPosts.length > 0) {
      console.log(`\n⚠️  이미 게시물이 ${existingPosts.length}개 있습니다.`);
      console.log("새로운 게시물을 추가합니다...\n");
    }

    // 3. 게시물 생성
    const postsToInsert = samplePosts.map((post, index) => ({
      user_id: userId,
      image_url: post.image_url,
      caption: post.caption,
      created_at: new Date(Date.now() - (samplePosts.length - index) * 6 * 60 * 60 * 1000).toISOString(), // 시간 간격 두기
    }));

    const { data: insertedPosts, error: insertError } = await supabase
      .from("posts")
      .insert(postsToInsert)
      .select();

    if (insertError) {
      console.error("❌ 게시물 생성 실패:", insertError);
      throw insertError;
    }

    console.log("\n✅ 게시물 생성 완료!");
    console.log(`📊 총 ${insertedPosts?.length || 0}개의 게시물이 생성되었습니다.\n`);

    if (insertedPosts) {
      insertedPosts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.caption?.substring(0, 30)}...`);
        console.log(`   ID: ${post.id}`);
        console.log(`   이미지: ${post.image_url.substring(0, 50)}...\n`);
      });
    }

    console.log("🎉 시드 데이터 생성이 완료되었습니다!");
  } catch (error) {
    console.error("\n❌ 오류 발생:", error);
    process.exit(1);
  }
}

seedPosts();

