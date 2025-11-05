-- 릴스 및 태그된 게시물 예시 데이터 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요

DO $$
DECLARE
  v_user_id UUID;
  v_other_user_id UUID;
  v_post1_id UUID;
  v_post2_id UUID;
  v_post3_id UUID;
  v_post4_id UUID;
  v_reel1_id UUID;
  v_reel2_id UUID;
  v_reel3_id UUID;
  v_tagged_post1_id UUID;
  v_tagged_post2_id UUID;
  v_tagged_post3_id UUID;
  v_tagged_post4_id UUID;
BEGIN
  -- 첫 번째 사용자 조회 (본인)
  SELECT id INTO v_user_id FROM users LIMIT 1;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '사용자가 없습니다. 먼저 사용자를 생성하세요.';
  END IF;

  -- 두 번째 사용자 조회 (다른 사용자, 없으면 첫 번째 사용자 사용)
  SELECT id INTO v_other_user_id FROM users WHERE id != v_user_id LIMIT 1;
  IF v_other_user_id IS NULL THEN
    v_other_user_id := v_user_id;
  END IF;

  -- 기존 게시물 조회 (릴스용으로 사용할 게시물)
  SELECT id INTO v_post1_id FROM posts WHERE user_id = v_user_id LIMIT 1;
  SELECT id INTO v_post2_id FROM posts WHERE user_id = v_user_id OFFSET 1 LIMIT 1;
  SELECT id INTO v_post3_id FROM posts WHERE user_id = v_user_id OFFSET 2 LIMIT 1;
  
  -- 릴스 생성 (동영상 게시물 3개)
  -- 동영상 게시물도 image_url이 NOT NULL이므로 썸네일 이미지를 제공
  -- 릴스 1
  INSERT INTO posts (user_id, video_url, image_url, media_type, caption, created_at)
  VALUES (
    v_user_id,
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&h=640&fit=crop',
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=640&h=640&fit=crop',
    'video',
    '첫 번째 릴스 🎬',
    now() - INTERVAL '2 days'
  )
  RETURNING id INTO v_reel1_id;

  -- 릴스 2
  INSERT INTO posts (user_id, video_url, image_url, media_type, caption, created_at)
  VALUES (
    v_user_id,
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=640&fit=crop',
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=640&h=640&fit=crop',
    'video',
    '두 번째 릴스 ✨',
    now() - INTERVAL '1 day'
  )
  RETURNING id INTO v_reel2_id;

  -- 릴스 3
  INSERT INTO posts (user_id, video_url, image_url, media_type, caption, created_at)
  VALUES (
    v_user_id,
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=640&fit=crop',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=640&h=640&fit=crop',
    'video',
    '세 번째 릴스 🎥',
    now() - INTERVAL '12 hours'
  )
  RETURNING id INTO v_reel3_id;

  -- 다른 사용자의 게시물 조회 (태그용)
  SELECT id INTO v_tagged_post1_id FROM posts WHERE user_id = v_other_user_id LIMIT 1;
  SELECT id INTO v_tagged_post2_id FROM posts WHERE user_id = v_other_user_id OFFSET 1 LIMIT 1;
  SELECT id INTO v_tagged_post3_id FROM posts WHERE user_id = v_other_user_id OFFSET 2 LIMIT 1;
  
  -- 태그된 게시물이 없으면 새로 생성
  IF v_tagged_post1_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_other_user_id,
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=640&h=640&fit=crop',
      'image',
      '태그된 게시물 1 📸',
      now() - INTERVAL '3 days'
    )
    RETURNING id INTO v_tagged_post1_id;
  END IF;

  IF v_tagged_post2_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_other_user_id,
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=640&h=640&fit=crop',
      'image',
      '태그된 게시물 2 📷',
      now() - INTERVAL '2 days'
    )
    RETURNING id INTO v_tagged_post2_id;
  END IF;

  IF v_tagged_post3_id IS NULL THEN
    INSERT INTO posts (user_id, image_url, video_url, media_type, caption, created_at)
    VALUES (
      v_other_user_id,
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=640&fit=crop',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=640&h=640&fit=crop',
      'image',
      '태그된 게시물 3 🖼️',
      now() - INTERVAL '1 day'
    )
    RETURNING id INTO v_tagged_post3_id;
  END IF;

  -- 태그된 게시물 4 (없으면 생성)
  IF v_post1_id IS NOT NULL THEN
    -- 기존 게시물에 태그 추가
    INSERT INTO post_tags (post_id, tagged_user_id, created_at)
    VALUES (v_post1_id, v_user_id, now() - INTERVAL '1 day')
    ON CONFLICT (post_id, tagged_user_id) DO NOTHING;
  END IF;

  -- 태그 추가 (다른 사용자의 게시물에 본인을 태그)
  INSERT INTO post_tags (post_id, tagged_user_id, created_at)
  VALUES 
    (v_tagged_post1_id, v_user_id, now() - INTERVAL '3 days'),
    (v_tagged_post2_id, v_user_id, now() - INTERVAL '2 days'),
    (v_tagged_post3_id, v_user_id, now() - INTERVAL '1 day')
  ON CONFLICT (post_id, tagged_user_id) DO NOTHING;

  RAISE NOTICE '릴스 및 태그된 게시물 생성 완료!';
  RAISE NOTICE '릴스: %, %, %', v_reel1_id, v_reel2_id, v_reel3_id;
  RAISE NOTICE '태그된 게시물: %, %, %', v_tagged_post1_id, v_tagged_post2_id, v_tagged_post3_id;
END $$;

