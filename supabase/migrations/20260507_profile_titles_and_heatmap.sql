-- 20260507_profile_titles_and_heatmap_access.sql

-- 1. Update achievements table to include title_name
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS title_name TEXT;

-- Seed title_name for existing achievements
UPDATE achievements SET title_name = 'o insano' WHERE title = 'Modo Insano';
UPDATE achievements SET title_name = 'o imparável' WHERE title = 'O Imparável';
UPDATE achievements SET title_name = 'o viciado' WHERE title = 'O Viciado';
UPDATE achievements SET title_name = 'maratonista' WHERE title = 'Maratonista de Aplicativo';
UPDATE achievements SET title_name = 'o sobrevivente' WHERE title = 'O Sobrevivente';
UPDATE achievements SET title_name = 'monstro do cardio' WHERE title = 'Monstro do Cardio';
UPDATE achievements SET title_name = 'patrão' WHERE title = 'Patrão do Ranking';
UPDATE achievements SET title_name = 'fake natty' WHERE title = 'Fake Natty';
UPDATE achievements SET title_name = 'gym rat' WHERE title = 'Gym Rat';
UPDATE achievements SET title_name = 'disciplinado' WHERE title = 'Disciplina Militar';
UPDATE achievements SET title_name = 'o brabo' WHERE title = 'Brabo Demais';
UPDATE achievements SET title_name = 'projeto verão' WHERE title = 'Projeto Verão';

-- 2. Add selected_title_id to profiles
-- This links to the achievement that provides the title
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS selected_achievement_id UUID REFERENCES achievements(id);

-- 3. Create a view or function to get the full display name with title
-- This will be useful for the frontend
CREATE OR REPLACE VIEW profile_display_with_titles AS
SELECT 
    p.*,
    a.title_name as active_title
FROM profiles p
LEFT JOIN achievements a ON p.selected_achievement_id = a.id;

-- 4. Ensure activity_logs are viewable by group members
-- (This is already mostly done, but let's make sure profiles are public enough)
-- profiles are already public (SELECT USING (true))

-- 5. Add a function to get activity heatmap data
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
