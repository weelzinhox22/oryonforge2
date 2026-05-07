-- Automated Achievement Engine
-- This script implements the logic to automatically grant achievements based on user activity.

-- 1. Helper function to calculate user streak (if not already exists)
CREATE OR REPLACE FUNCTION calculate_user_streak(user_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
    streak INTEGER := 0;
    last_date DATE;
    current_row RECORD;
BEGIN
    FOR current_row IN 
        SELECT DISTINCT created_at::DATE as active_date
        FROM activity_logs
        WHERE user_id = user_id_param
        ORDER BY active_date DESC
    LOOP
        IF last_date IS NULL THEN
            IF current_row.active_date = CURRENT_DATE OR current_row.active_date = CURRENT_DATE - 1 THEN
                streak := 1;
                last_date := current_row.active_date;
            ELSE
                RETURN 0;
            END IF;
        ELSIF current_row.active_date = last_date - 1 THEN
            streak := streak + 1;
            last_date := current_row.active_date;
        ELSE
            EXIT;
        END IF;
    END LOOP;
    RETURN streak;
END;
$$ LANGUAGE plpgsql;

-- 2. Main function to check and grant achievements
CREATE OR REPLACE FUNCTION process_user_achievements_logic(u_id UUID, g_id UUID, log_created_at TIMESTAMPTZ)
RETURNS VOID AS $$
DECLARE
    ach_record RECORD;
    val_to_check INTEGER;
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
    IF to_regclass('activity_likes') IS NOT NULL THEN
        SELECT COUNT(*) INTO current_likes_received 
        FROM activity_likes al 
        JOIN activity_logs log ON al.activity_log_id = log.id 
        WHERE log.user_id = u_id;
    END IF;

    current_comments_made := 0;
    IF to_regclass('activity_comments') IS NOT NULL THEN
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
            INSERT INTO user_achievements (user_id, achievement_id)
            VALUES (u_id, ach_record.id)
            ON CONFLICT (user_id, achievement_id, group_id) DO NOTHING;
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
                INSERT INTO user_achievements (user_id, achievement_id, group_id)
                VALUES (u_id, ach_record.id, g_id)
                ON CONFLICT (user_id, achievement_id, group_id) DO NOTHING;
            END IF;
        END LOOP;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger Function (Wrapper for the logic)
CREATE OR REPLACE FUNCTION trigger_process_user_achievements()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM process_user_achievements_logic(NEW.user_id, NEW.group_id, NEW.created_at);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS tr_process_user_achievements ON activity_logs;
CREATE TRIGGER tr_process_user_achievements
AFTER INSERT OR UPDATE ON activity_logs
FOR EACH ROW
EXECUTE FUNCTION trigger_process_user_achievements();

-- 5. Batch processing for existing logs
DO $$
DECLARE
    log_record RECORD;
BEGIN
    FOR log_record IN SELECT DISTINCT user_id, group_id, created_at FROM activity_logs LOOP
        PERFORM process_user_achievements_logic(log_record.user_id, log_record.group_id, log_record.created_at);
    END LOOP;
END $$;
