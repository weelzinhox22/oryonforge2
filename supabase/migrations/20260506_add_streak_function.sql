-- ============================================
-- CALCULATE USER STREAK
-- ============================================

CREATE OR REPLACE FUNCTION get_user_streak(user_id_param UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  streak_count INTEGER := 0;
  current_date_to_check DATE := CURRENT_DATE;
  has_activity_today BOOLEAN;
  has_activity_yesterday BOOLEAN;
BEGIN
  -- Check if there's any activity today
  SELECT EXISTS (
    SELECT 1 FROM activity_logs 
    WHERE user_id = user_id_param 
    AND created_at::DATE = CURRENT_DATE
  ) INTO has_activity_today;

  -- Check if there's any activity yesterday
  SELECT EXISTS (
    SELECT 1 FROM activity_logs 
    WHERE user_id = user_id_param 
    AND created_at::DATE = CURRENT_DATE - INTERVAL '1 day'
  ) INTO has_activity_yesterday;

  -- If no activity today nor yesterday, streak is 0
  IF NOT has_activity_today AND NOT has_activity_yesterday THEN
    RETURN 0;
  END IF;

  -- Start checking from the most recent active day
  IF NOT has_activity_today THEN
    current_date_to_check := CURRENT_DATE - INTERVAL '1 day';
  END IF;

  -- Loop backwards and count consecutive days
  LOOP
    IF EXISTS (
      SELECT 1 FROM activity_logs 
      WHERE user_id = user_id_param 
      AND created_at::DATE = current_date_to_check
    ) THEN
      streak_count := streak_count + 1;
      current_date_to_check := current_date_to_check - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;

  RETURN streak_count;
END;
$$;
