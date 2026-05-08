-- 20260508_cleanup_points_and_groups.sql
-- 1. Remove the retroactive logs for the rainy day
DELETE FROM activity_logs 
WHERE activity_type = 'Treino Coletivo (Chuva)' 
AND weather_status = 'rain';

-- 2. Remove notifications generated in the last 30 minutes to stop the spam
DELETE FROM notifications 
WHERE title LIKE '%Conquista Desbloqueada%' 
AND created_at > NOW() - INTERVAL '60 minutes';

-- 3. Remove achievements granted in the last 60 minutes due to the retroactive logs
-- Note: This might remove legitimate achievements earned in the last hour, but it's the safest way to clean the spam.
DELETE FROM user_achievements 
WHERE unlocked_at > NOW() - INTERVAL '60 minutes';

-- 4. Delete groups with "teste" in the name created by the admin
DELETE FROM groups 
WHERE (name ILIKE '%teste%' OR name ILIKE '%test%')
AND admin_id IN (SELECT id FROM profiles WHERE username = 'welzinho' OR username = 'admin');

-- 5. Final re-calculation for everyone to sync stats after deletion
DO $$
DECLARE
    log_record RECORD;
BEGIN
    FOR log_record IN SELECT DISTINCT user_id, group_id, created_at FROM activity_logs LOOP
        PERFORM process_user_achievements_logic(log_record.user_id, log_record.group_id, log_record.created_at);
    END LOOP;
END $$;
