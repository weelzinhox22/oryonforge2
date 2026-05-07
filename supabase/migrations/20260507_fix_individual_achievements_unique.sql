-- Clean up duplicate individual achievements
DELETE FROM user_achievements
WHERE id IN (
    SELECT id FROM (
        SELECT ua.id, ROW_NUMBER() OVER(PARTITION BY ua.user_id, ua.achievement_id ORDER BY ua.unlocked_at ASC) as row_num
        FROM user_achievements ua
        JOIN achievements a ON ua.achievement_id = a.id
        WHERE a.category = 'individual'
    ) t WHERE t.row_num > 1
);

-- Make sure individual achievements don't have a group_id attached to them, cementing them as global
UPDATE user_achievements
SET group_id = NULL
WHERE achievement_id IN (SELECT id FROM achievements WHERE category = 'individual');

-- Replace the achievement processing function to properly check for uniqueness
CREATE OR REPLACE FUNCTION process_user_achievements_logic(u_id UUID, g_id UUID, log_created_at TIMESTAMPTZ)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with creator permissions
SET search_path = public
AS $$
DECLARE
    ach_record RECORD;
    is_met BOOLEAN;
    current_points INTEGER;
    current_workouts INTEGER;
    current_streak INTEGER;
    current_distance NUMERIC;
    current_likes_received INTEGER;
    current_comments_made INTEGER;
    group_rank INTEGER;
BEGIN
    -- Get base stats for individual achievements
    SELECT COALESCE(SUM(points), 0), COUNT(*) INTO current_points, current_workouts
    FROM activity_logs WHERE user_id = u_id;
    
    current_streak := calculate_user_streak(u_id);
    
    SELECT COALESCE(SUM(distance_km), 0) INTO current_distance
    FROM activity_logs WHERE user_id = u_id;

    -- Social stats (Resilient check)
    current_likes_received := 0;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_likes') THEN
        SELECT COUNT(*) INTO current_likes_received 
        FROM activity_likes al 
        JOIN activity_logs log ON al.activity_log_id = log.id 
        WHERE log.user_id = u_id;
    END IF;

    current_comments_made := 0;
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'activity_comments') THEN
        SELECT COUNT(*) INTO current_comments_made 
        FROM activity_comments 
        WHERE user_id = u_id;
    END IF;

    -- Loop through all potential individual achievements
    FOR ach_record IN SELECT * FROM achievements WHERE category = 'individual' LOOP
        is_met := FALSE;
        
        CASE ach_record.requirement_type
            WHEN 'points' THEN is_met := current_points >= ach_record.requirement_value;
            WHEN 'workouts' THEN is_met := current_workouts >= ach_record.requirement_value;
            WHEN 'streak' THEN is_met := current_streak >= ach_record.requirement_value;
            WHEN 'distance' THEN is_met := current_distance >= ach_record.requirement_value;
            WHEN 'daily_logs' THEN 
                SELECT COUNT(*) >= ach_record.requirement_value INTO is_met 
                FROM activity_logs 
                WHERE user_id = u_id AND created_at::DATE = log_created_at::DATE;
            WHEN 'specific_workout' THEN
                SELECT COUNT(*) >= ach_record.requirement_value INTO is_met
                FROM activity_logs
                WHERE user_id = u_id AND (activity_type NOT ILIKE '%corrida%' AND activity_type NOT ILIKE '%bike%');
            WHEN 'leg_workouts' THEN
                SELECT COUNT(*) >= ach_record.requirement_value INTO is_met
                FROM activity_logs
                WHERE user_id = u_id AND activity_type ILIKE '%perna%';
            WHEN 'duration_short' THEN
                SELECT EXISTS(SELECT 1 FROM activity_logs WHERE user_id = u_id AND duration_minutes < ach_record.requirement_value) INTO is_met;
            ELSE
                is_met := FALSE;
        END CASE;

        IF is_met THEN
            -- Enforce that individual achievements are won only once per user, regardless of group
            IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = u_id AND achievement_id = ach_record.id) THEN
                INSERT INTO user_achievements (user_id, achievement_id)
                VALUES (u_id, ach_record.id);
            END IF;
        END IF;
    END LOOP;

    -- Handle Group Achievements
    IF g_id IS NOT NULL THEN
        WITH group_ranking AS (
            SELECT user_id, SUM(points) as total
            FROM activity_logs
            WHERE group_id = g_id
            GROUP BY user_id
            ORDER BY total DESC
        )
        SELECT position INTO group_rank
        FROM (SELECT user_id, row_number() OVER (ORDER BY total DESC) as position FROM group_ranking) r
        WHERE user_id = u_id;

        FOR ach_record IN SELECT * FROM achievements WHERE category = 'group' LOOP
            is_met := FALSE;
            
            CASE ach_record.requirement_type
                WHEN 'rank_top1' THEN is_met := group_rank = 1;
                WHEN 'rank_top3' THEN is_met := group_rank <= 3;
                WHEN 'likes_received' THEN is_met := current_likes_received >= ach_record.requirement_value;
                WHEN 'comments' THEN is_met := current_comments_made >= ach_record.requirement_value;
                WHEN 'groups_created' THEN
                    SELECT COUNT(*) >= ach_record.requirement_value INTO is_met
                    FROM groups WHERE admin_id = u_id;
                ELSE
                    is_met := FALSE;
            END CASE;

            IF is_met THEN
                -- Enforce that group achievements are won only once per group
                IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = u_id AND achievement_id = ach_record.id AND group_id = g_id) THEN
                    INSERT INTO user_achievements (user_id, achievement_id, group_id)
                    VALUES (u_id, ach_record.id, g_id);
                END IF;
            END IF;
        END LOOP;
    END IF;
END;
$$;
