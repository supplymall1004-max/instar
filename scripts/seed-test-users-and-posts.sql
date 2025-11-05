-- 테스트용 사용자 및 게시물 생성 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- 
-- 이 스크립트는:
-- 1. 테스트용 사용자 2명 생성
-- 2. 각 사용자에게 게시물 2-3개씩 추가

DO $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
  v_post1_id UUID;
  v_post2_id UUID;
  v_post3_id UUID;
  v_post4_id UUID;
  v_post5_id UUID;
  v_post6_id UUID;
BEGIN
  -- 테스트 사용자 1 생성 (이미 존재하면 조회)
  SELECT id INTO v_user1_id FROM users WHERE clerk_id = 'test_user_1' LIMIT 1;
  
  IF v_user1_id IS NULL THEN
    INSERT INTO users (clerk_id, name, avatar_url, bio, created_at)
    VALUES (
      'test_user_1',
      '테스트 사용자 1',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop',
      '테스트용 계정입니다 🎨',
      now() - INTERVAL '30 days'
    )
    RETURNING id INTO v_user1_id;
    RAISE NOTICE '테스트 사용자 1 생성 완료: %', v_user1_id;
  ELSE
    RAISE NOTICE '테스트 사용자 1 이미 존재: %', v_user1_id;
  END IF;

  -- 테스트 사용자 2 생성 (이미 존재하면 조회)
  SELECT id INTO v_user2_id FROM users WHERE clerk_id = 'test_user_2' LIMIT 1;
  
  IF v_user2_id IS NULL THEN
    INSERT INTO users (clerk_id, name, avatar_url, bio, created_at)
    VALUES (
      'test_user_2',
      '테스트 사용자 2',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop',
      '또 다른 테스트 계정입니다 📸',
      now() - INTERVAL '25 days'
    )
    RETURNING id INTO v_user2_id;
    RAISE NOTICE '테스트 사용자 2 생성 완료: %', v_user2_id;
  ELSE
    RAISE NOTICE '테스트 사용자 2 이미 존재: %', v_user2_id;
  END IF;

  -- 사용자 1의 게시물 생성 (3개)
  -- 중복 방지를 위해 캡션으로 확인
  SELECT id INTO v_post1_id FROM posts 
  WHERE user_id = v_user1_id AND caption = '아름다운 풍경 사진 🌄 #자연 #풍경' LIMIT 1;
  
  IF v_post1_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_user1_id,
      'https://images.unsplash.com/photo-1518837695004-2081043ba4b2?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1518837695004-2081043ba4b2?w=640&h=640&fit=crop',
      'image',
      '아름다운 풍경 사진 🌄 #자연 #풍경',
      now() - INTERVAL '5 days'
    )
    RETURNING id INTO v_post1_id;
  END IF;

  SELECT id INTO v_post2_id FROM posts 
  WHERE user_id = v_user1_id AND caption = '오늘의 하늘 ☁️ 날씨가 정말 좋아요!' LIMIT 1;
  
  IF v_post2_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_user1_id,
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=640&fit=crop',
      'image',
      '오늘의 하늘 ☁️ 날씨가 정말 좋아요!',
      now() - INTERVAL '3 days'
    )
    RETURNING id INTO v_post2_id;
  END IF;

  SELECT id INTO v_post3_id FROM posts 
  WHERE user_id = v_user1_id AND caption = '첫 번째 릴스 영상 🎬 #vlog #daily' LIMIT 1;
  
  IF v_post3_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_user1_id,
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&h=640&fit=crop',
      'video',
      '첫 번째 릴스 영상 🎬 #vlog #daily',
      now() - INTERVAL '1 day'
    )
    RETURNING id INTO v_post3_id;
  END IF;

  -- 사용자 2의 게시물 생성 (3개)
  SELECT id INTO v_post4_id FROM posts 
  WHERE user_id = v_user2_id AND caption = '카페에서 읽는 책 📚 #독서 #카페' LIMIT 1;
  
  IF v_post4_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_user2_id,
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=640&h=640&fit=crop',
      'image',
      '카페에서 읽는 책 📚 #독서 #카페',
      now() - INTERVAL '4 days'
    )
    RETURNING id INTO v_post4_id;
  END IF;

  SELECT id INTO v_post5_id FROM posts 
  WHERE user_id = v_user2_id AND caption = '맛있는 브런치 🥐 #브런치 #맛집' LIMIT 1;
  
  IF v_post5_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_user2_id,
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=640&h=640&fit=crop',
      'image',
      '맛있는 브런치 🥐 #브런치 #맛집',
      now() - INTERVAL '2 days'
    )
    RETURNING id INTO v_post5_id;
  END IF;

  SELECT id INTO v_post6_id FROM posts 
  WHERE user_id = v_user2_id AND caption = '저녁 노을이 아름다워요 🌅' LIMIT 1;
  
  IF v_post6_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_user2_id,
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=640&fit=crop',
      'image',
      '저녁 노을이 아름다워요 🌅',
      now() - INTERVAL '6 hours'
    )
    RETURNING id INTO v_post6_id;
  END IF;

  -- 게시물에 좋아요 추가 (서로 좋아요)
  -- 사용자 2가 사용자 1의 게시물에 좋아요
  IF v_post1_id IS NOT NULL THEN
    INSERT INTO likes (user_id, post_id, created_at)
    SELECT v_user2_id, v_post1_id, now() - INTERVAL '4 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM likes WHERE user_id = v_user2_id AND post_id = v_post1_id
    );
  END IF;

  IF v_post2_id IS NOT NULL THEN
    INSERT INTO likes (user_id, post_id, created_at)
    SELECT v_user2_id, v_post2_id, now() - INTERVAL '2 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM likes WHERE user_id = v_user2_id AND post_id = v_post2_id
    );
  END IF;

  -- 사용자 1이 사용자 2의 게시물에 좋아요
  IF v_post4_id IS NOT NULL THEN
    INSERT INTO likes (user_id, post_id, created_at)
    SELECT v_user1_id, v_post4_id, now() - INTERVAL '3 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM likes WHERE user_id = v_user1_id AND post_id = v_post4_id
    );
  END IF;

  IF v_post5_id IS NOT NULL THEN
    INSERT INTO likes (user_id, post_id, created_at)
    SELECT v_user1_id, v_post5_id, now() - INTERVAL '1 day'
    WHERE NOT EXISTS (
      SELECT 1 FROM likes WHERE user_id = v_user1_id AND post_id = v_post5_id
    );
  END IF;

  -- 댓글 추가
  -- 사용자 2가 사용자 1의 게시물에 댓글
  IF v_post1_id IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at)
    SELECT v_post1_id, v_user2_id, '정말 아름다운 사진이네요! 😍', now() - INTERVAL '4 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM comments 
      WHERE post_id = v_post1_id 
      AND user_id = v_user2_id 
      AND content = '정말 아름다운 사진이네요! 😍'
    );
  END IF;

  -- 사용자 1이 사용자 2의 게시물에 댓글
  IF v_post4_id IS NOT NULL THEN
    INSERT INTO comments (post_id, user_id, content, created_at)
    SELECT v_post4_id, v_user1_id, '어떤 책을 읽고 계신가요? 📖', now() - INTERVAL '3 days'
    WHERE NOT EXISTS (
      SELECT 1 FROM comments 
      WHERE post_id = v_post4_id 
      AND user_id = v_user1_id 
      AND content = '어떤 책을 읽고 계신가요? 📖'
    );
  END IF;

  RAISE NOTICE '========================================';
  RAISE NOTICE '테스트 데이터 생성 완료!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '생성된 사용자:';
  RAISE NOTICE '  - 사용자 1: % (clerk_id: test_user_1)', v_user1_id;
  RAISE NOTICE '  - 사용자 2: % (clerk_id: test_user_2)', v_user2_id;
  RAISE NOTICE '';
  RAISE NOTICE '생성된 게시물:';
  RAISE NOTICE '  - 사용자 1: %, %, %', v_post1_id, v_post2_id, v_post3_id;
  RAISE NOTICE '  - 사용자 2: %, %, %', v_post4_id, v_post5_id, v_post6_id;
  RAISE NOTICE '========================================';
END $$;

