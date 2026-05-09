-- ============================================
-- Activity Context Feedback (Fun Facts)
-- ============================================

CREATE OR REPLACE FUNCTION get_activity_context_feedback(
  u_id UUID,
  g_id UUID,
  log_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_created_at TIMESTAMPTZ;
  v_hour INTEGER;
  v_period TEXT;
  v_is_first BOOLEAN;
  v_period_count INTEGER;
  v_total_count INTEGER;
  v_period_percent INTEGER;
  v_user_streak_in_period INTEGER;
  v_result JSONB;
BEGIN
  -- Get the activity details
  SELECT created_at INTO v_created_at 
  FROM activity_logs 
  WHERE id = log_id;

  v_hour := EXTRACT(HOUR FROM v_created_at);

  -- Determine period
  IF v_hour >= 5 AND v_hour < 12 THEN
    v_period := 'morning';
  ELSIF v_hour >= 12 AND v_hour < 18 THEN
    v_period := 'afternoon';
  ELSE
    v_period := 'night';
  END IF;

  -- Check if first of the day in group
  SELECT NOT EXISTS (
    SELECT 1 FROM activity_logs 
    WHERE group_id = g_id 
    AND created_at::DATE = v_created_at::DATE
    AND id != log_id
    AND created_at < v_created_at
  ) INTO v_is_first;

  -- Calculate period percentage (last 30 days)
  SELECT COUNT(*) INTO v_total_count
  FROM activity_logs
  WHERE group_id = g_id
  AND created_at > NOW() - INTERVAL '30 days';

  IF v_period = 'morning' THEN
    SELECT COUNT(*) INTO v_period_count FROM activity_logs
    WHERE group_id = g_id AND created_at > NOW() - INTERVAL '30 days'
    AND EXTRACT(HOUR FROM created_at) >= 5 AND EXTRACT(HOUR FROM created_at) < 12;
  ELSIF v_period = 'afternoon' THEN
    SELECT COUNT(*) INTO v_period_count FROM activity_logs
    WHERE group_id = g_id AND created_at > NOW() - INTERVAL '30 days'
    AND EXTRACT(HOUR FROM created_at) >= 12 AND EXTRACT(HOUR FROM created_at) < 18;
  ELSE
    SELECT COUNT(*) INTO v_period_count FROM activity_logs
    WHERE group_id = g_id AND created_at > NOW() - INTERVAL '30 days'
    AND (EXTRACT(HOUR FROM created_at) >= 18 OR EXTRACT(HOUR FROM created_at) < 5);
  END IF;

  IF v_total_count > 0 THEN
    v_period_percent := (v_period_count * 100) / v_total_count;
  ELSE
    v_period_percent := 0;
  END IF;

  -- User streak in this specific period (last 7 days)
  SELECT COUNT(DISTINCT created_at::DATE) INTO v_user_streak_in_period
  FROM activity_logs
  WHERE user_id = u_id
  AND created_at > NOW() - INTERVAL '7 days'
  AND (
    (v_period = 'morning' AND EXTRACT(HOUR FROM created_at) >= 5 AND EXTRACT(HOUR FROM created_at) < 12) OR
    (v_period = 'afternoon' AND EXTRACT(HOUR FROM created_at) >= 12 AND EXTRACT(HOUR FROM created_at) < 18) OR
    (v_period = 'night' AND (EXTRACT(HOUR FROM created_at) >= 18 OR EXTRACT(HOUR FROM created_at) < 5))
  );

  v_result := jsonb_build_object(
    'is_first', v_is_first,
    'period', v_period,
    'period_percent', v_period_percent,
    'user_period_count', v_user_streak_in_period,
    'hour', v_hour
  );

  RETURN v_result;
END;
$$;
