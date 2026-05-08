-- 20260508_rainy_day_retroactive.sql
-- 1. Add weather_status if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_logs' AND column_name = 'weather_status') THEN
        ALTER TABLE activity_logs ADD COLUMN weather_status TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'achievements' AND column_name = 'metadata') THEN
        ALTER TABLE achievements ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
END $$;

-- 2. Add the rainy day and login achievements
INSERT INTO achievements (title, description, category, requirement_type, requirement_value, icon_url, metadata)
VALUES 
(
    'Treinou Até na Chuva', 
    'Registrou atividade em 3 dias chuvosos.', 
    'individual', 
    'rainy_workouts', 
    3, 
    'https://cdn-icons-png.flaticon.com/512/3351/3351187.png',
    '{"reward_xp": 100}'
),
(
    'Só Observando', 
    'Entrou no app 30 vezes sem registrar atividade.', 
    'individual', 
    'app_opens_no_activity', 
    30, 
    'https://cdn-icons-png.flaticon.com/512/702/702455.png',
    '{"reward_xp": 50}'
),
(
    'Maratonista de Aplicativo', 
    'Abriu o app 100 vezes.', 
    'individual', 
    'app_opens', 
    100, 
    'https://cdn-icons-png.flaticon.com/512/3112/3112946.png',
    '{"reward_xp": 200}'
)
ON CONFLICT (title) DO UPDATE SET 
    requirement_type = EXCLUDED.requirement_type,
    requirement_value = EXCLUDED.requirement_value;

-- 2.5 Add Login Tracking Table
CREATE TABLE IF NOT EXISTS user_logins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_logins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own logins" ON user_logins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own logins" ON user_logins FOR SELECT USING (auth.uid() = user_id);

-- 3. Update Achievement Engine for rainy_workouts and other requested types
CREATE OR REPLACE FUNCTION process_user_achievements_logic(u_id UUID, g_id UUID, log_created_at TIMESTAMPTZ)
RETURNS VOID 
LANGUAGE plpgsql
SECURITY DEFINER 
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
    current_uploads INTEGER;
    current_activity_types_count INTEGER;
    current_rainy_days INTEGER;
    current_app_opens INTEGER;
    current_days_active INTEGER;
    group_rank INTEGER;
    last_workout_date DATE;
BEGIN
    -- Get base stats for individual achievements
    SELECT COALESCE(SUM(points), 0), COUNT(*) INTO current_points, current_workouts
    FROM activity_logs WHERE user_id = u_id;
    
    current_streak := calculate_user_streak(u_id);
    
    SELECT COALESCE(SUM(distance_km), 0) INTO current_distance
    FROM activity_logs WHERE user_id = u_id;

    SELECT COUNT(*) INTO current_uploads
    FROM activity_logs WHERE user_id = u_id AND proof_url IS NOT NULL;

    SELECT COUNT(DISTINCT activity_type) INTO current_activity_types_count
    FROM activity_logs WHERE user_id = u_id;

    SELECT COUNT(DISTINCT created_at::DATE) INTO current_rainy_days
    FROM activity_logs WHERE user_id = u_id AND weather_status = 'rain';

    SELECT COUNT(*) INTO current_app_opens
    FROM user_logins WHERE user_id = u_id;

    SELECT COUNT(DISTINCT created_at::DATE) INTO current_days_active
    FROM activity_logs WHERE user_id = u_id;

    -- Social stats
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
            WHEN 'uploads' THEN is_met := current_uploads >= ach_record.requirement_value;
            WHEN 'activity_types' THEN is_met := current_activity_types_count >= ach_record.requirement_value;
            WHEN 'rainy_workouts' THEN is_met := current_rainy_days >= ach_record.requirement_value;
            WHEN 'app_opens' THEN is_met := current_app_opens >= ach_record.requirement_value;
            WHEN 'app_opens_no_activity' THEN is_met := current_app_opens >= ach_record.requirement_value AND current_days_active = 0;
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
            WHEN 'gym_workouts' THEN
                SELECT COUNT(*) >= ach_record.requirement_value INTO is_met
                FROM activity_logs
                WHERE user_id = u_id AND (activity_type ILIKE '%musculação%' OR activity_type ILIKE '%academia%' OR activity_type ILIKE '%gym%');
            WHEN 'walks' THEN
                SELECT COUNT(*) >= ach_record.requirement_value INTO is_met
                FROM activity_logs
                WHERE user_id = u_id AND (activity_type ILIKE '%caminhada%' OR activity_type ILIKE '%walk%');
            WHEN 'duration_short' THEN
                SELECT EXISTS(SELECT 1 FROM activity_logs WHERE user_id = u_id AND duration_minutes < ach_record.requirement_value) INTO is_met;
            WHEN 'comeback' THEN
                SELECT MAX(created_at::DATE) INTO last_workout_date
                FROM activity_logs
                WHERE user_id = u_id AND created_at < log_created_at;
                
                IF last_workout_date IS NOT NULL THEN
                    is_met := (log_created_at::DATE - last_workout_date) >= 10;
                ELSE
                    is_met := FALSE;
                END IF;
            ELSE
                is_met := FALSE;
        END CASE;

        IF is_met THEN
            IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = u_id AND achievement_id = ach_record.id AND group_id IS NULL) THEN
                INSERT INTO user_achievements (user_id, achievement_id, group_id)
                VALUES (u_id, ach_record.id, NULL);
            END IF;
        END IF;
    END LOOP;

    -- Handle Group Achievements (Top Ranking)
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
                WHEN 'rank_top2' THEN is_met := group_rank = 2;
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
                IF NOT EXISTS (SELECT 1 FROM user_achievements WHERE user_id = u_id AND achievement_id = ach_record.id AND group_id = g_id) THEN
                    INSERT INTO user_achievements (user_id, achievement_id, group_id)
                    VALUES (u_id, ach_record.id, g_id);
                END IF;
            END IF;
        END LOOP;
    END IF;
END;
$$;

-- 4. Retroactive logs for everyone for 2026-05-06
INSERT INTO activity_logs (user_id, group_id, activity_type, duration_minutes, points, status, created_at, weather_status, proof_url, activity_date)
SELECT 
    gm.user_id, 
    gm.group_id, 
    'Treino Coletivo (Chuva)', 
    45, 
    50, 
    'approved', 
    '2026-05-06 18:00:00+00', 
    'rain',
    'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?q=80&w=800',
    '2026-05-06'
FROM group_members gm
ON CONFLICT DO NOTHING;

-- 5. Final re-calculation
DO $$
DECLARE
    log_record RECORD;
BEGIN
    FOR log_record IN SELECT DISTINCT user_id, group_id, created_at FROM activity_logs LOOP
        PERFORM process_user_achievements_logic(log_record.user_id, log_record.group_id, log_record.created_at);
    END LOOP;
END $$;
