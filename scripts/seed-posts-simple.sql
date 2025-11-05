-- 간단한 게시물 시드 데이터 SQL
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 먼저 사용자 확인 (없으면 첫 번째 사용자 사용)
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  -- 기존 사용자 가져오기
  SELECT id INTO test_user_id FROM users LIMIT 1;
  
  IF test_user_id IS NULL THEN
    RAISE EXCEPTION '사용자가 없습니다. 먼저 로그인하거나 사용자를 생성하세요.';
  END IF;
  
  -- 게시물 5개 생성
  INSERT INTO posts (user_id, image_url, caption, created_at)
  VALUES
    (
      test_user_id,
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      '오늘 날씨가 정말 좋네요! 🌞 산책하기 완벽한 날입니다. #일상 #산책 #좋은날씨',
      now() - interval '2 days'
    ),
    (
      test_user_id,
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
      '맛있는 커피와 함께하는 아침 ☕️ 새벽 기상이지만 에너지가 넘칩니다! #커피 #아침 #일상',
      now() - interval '1 day'
    ),
    (
      test_user_id,
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
      '자연 속에서 힐링하는 시간 🌲 숲속의 신선한 공기를 마시니 마음이 편안해집니다. #자연 #힐링 #휴식',
      now() - interval '12 hours'
    ),
    (
      test_user_id,
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80',
      '도시의 야경이 아름답네요 🌃 밤이 되면 세상이 또 다른 모습으로 변하죠. #야경 #도시 #밤',
      now() - interval '6 hours'
    ),
    (
      test_user_id,
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
      '새로운 하루를 시작합니다! 🌅 오늘도 화이팅! #일상 #아침 #새로운시작',
      now() - interval '1 hour'
    );
  
  RAISE NOTICE '게시물 5개 생성 완료!';
END $$;

