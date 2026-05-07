-- Consolidated Titles and Feed View Migration
-- 1. Prerequisites (Columns)
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS title_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_achievement_id UUID REFERENCES achievements(id);

-- 2. Seed title_name for existing achievements
UPDATE achievements SET title_name = 'o insano' WHERE title = 'Modo Insano' AND title_name IS NULL;
UPDATE achievements SET title_name = 'o imparável' WHERE title = 'O Imparável' AND title_name IS NULL;
UPDATE achievements SET title_name = 'o viciado' WHERE title = 'O Viciado' AND title_name IS NULL;
UPDATE achievements SET title_name = 'maratonista' WHERE title = 'Maratonista de Aplicativo' AND title_name IS NULL;
UPDATE achievements SET title_name = 'o sobrevivente' WHERE title = 'O Sobrevivente' AND title_name IS NULL;
UPDATE achievements SET title_name = 'monstro do cardio' WHERE title = 'Monstro do Cardio' AND title_name IS NULL;
UPDATE achievements SET title_name = 'patrão' WHERE title = 'Patrão do Ranking' AND title_name IS NULL;
UPDATE achievements SET title_name = 'fake natty' WHERE title = 'Fake Natty' AND title_name IS NULL;
UPDATE achievements SET title_name = 'gym rat' WHERE title = 'Gym Rat' AND title_name IS NULL;
UPDATE achievements SET title_name = 'disciplinado' WHERE title = 'Disciplina Militar' AND title_name IS NULL;
UPDATE achievements SET title_name = 'o brabo' WHERE title = 'Brabo Demais' AND title_name IS NULL;
UPDATE achievements SET title_name = 'projeto verão' WHERE title = 'Projeto Verão' AND title_name IS NULL;

-- 3. Create Views
CREATE OR REPLACE VIEW profile_display_with_titles AS
SELECT 
    p.*,
    a.title_name as active_title
FROM profiles p
LEFT JOIN achievements a ON p.selected_achievement_id = a.id;

DROP VIEW IF EXISTS activity_feed;

CREATE OR REPLACE VIEW activity_feed AS
SELECT 
    al.id,
    al.user_id,
    p.username,
    al.group_id,
    g.name as group_name,
    al.activity_type,
    al.points,
    al.created_at,
    p.avatar_url,
    p.active_title
FROM activity_logs al
JOIN profile_display_with_titles p ON al.user_id = p.id
JOIN groups g ON al.group_id = g.id;

-- 4. Heatmap Function
CREATE OR REPLACE FUNCTION get_user_activity_heatmap(target_user_id UUID)
RETURNS TABLE (activity_date DATE, activity_count BIGINT) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        created_at::DATE as activity_date,
        COUNT(*)::BIGINT as activity_count
    FROM activity_logs
    WHERE user_id = target_user_id
    AND created_at > NOW() - INTERVAL '365 days'
    GROUP BY 1
    ORDER BY 1 ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
