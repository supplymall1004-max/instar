-- 테스트용 팔로우 관계 생성 스크립트
-- Supabase Dashboard > SQL Editor에서 실행하세요
-- 
-- 이 스크립트는 test_user_1과 test_user_2를 서로 팔로우하도록 설정합니다.

DO $$
DECLARE
  v_user1_id UUID;
  v_user2_id UUID;
  v_follow_exists BOOLEAN;
BEGIN
  -- 테스트 사용자 1 조회
  SELECT id INTO v_user1_id FROM users WHERE clerk_id = 'test_user_1' LIMIT 1;
  
  IF v_user1_id IS NULL THEN
    RAISE EXCEPTION 'test_user_1을 찾을 수 없습니다. 먼저 seed-test-users-and-posts.sql을 실행하세요.';
  END IF;

  -- 테스트 사용자 2 조회
  SELECT id INTO v_user2_id FROM users WHERE clerk_id = 'test_user_2' LIMIT 1;
  
  IF v_user2_id IS NULL THEN
    RAISE EXCEPTION 'test_user_2를 찾을 수 없습니다. 먼저 seed-test-users-and-posts.sql을 실행하세요.';
  END IF;

  -- 사용자 1이 사용자 2를 팔로우 (follower_id = user1, following_id = user2)
  SELECT EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = v_user1_id AND following_id = v_user2_id
  ) INTO v_follow_exists;

  IF NOT v_follow_exists THEN
    INSERT INTO follows (follower_id, following_id, created_at)
    VALUES (v_user1_id, v_user2_id, now() - INTERVAL '10 days');
    RAISE NOTICE '사용자 1이 사용자 2를 팔로우했습니다.';
  ELSE
    RAISE NOTICE '사용자 1이 사용자 2를 이미 팔로우하고 있습니다.';
  END IF;

  -- 사용자 2가 사용자 1을 팔로우 (follower_id = user2, following_id = user1)
  SELECT EXISTS (
    SELECT 1 FROM follows 
    WHERE follower_id = v_user2_id AND following_id = v_user1_id
  ) INTO v_follow_exists;

  IF NOT v_follow_exists THEN
    INSERT INTO follows (follower_id, following_id, created_at)
    VALUES (v_user2_id, v_user1_id, now() - INTERVAL '8 days');
    RAISE NOTICE '사용자 2가 사용자 1을 팔로우했습니다.';
  ELSE
    RAISE NOTICE '사용자 2가 사용자 1을 이미 팔로우하고 있습니다.';
  END IF;

  -- 팔로우 관계 확인
  RAISE NOTICE '========================================';
  RAISE NOTICE '팔로우 관계 설정 완료!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '사용자 1 ID: %', v_user1_id;
  RAISE NOTICE '사용자 2 ID: %', v_user2_id;
  RAISE NOTICE '';
  RAISE NOTICE '팔로우 관계:';
  RAISE NOTICE '  - 사용자 1 → 사용자 2 (팔로잉)';
  RAISE NOTICE '  - 사용자 2 → 사용자 1 (팔로잉)';
  RAISE NOTICE '  → 서로 팔로우 관계입니다!';
  RAISE NOTICE '========================================';
END $$;

