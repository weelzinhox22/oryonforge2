-- Migration: Support for Feminine Titles
-- 1. Add gender to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'male' CHECK (gender IN ('male', 'female'));

-- 2. Add feminine title to achievements
ALTER TABLE achievements ADD COLUMN IF NOT EXISTS title_name_female TEXT;

-- 3. Update existing achievements with feminine versions
UPDATE achievements SET title_name_female = 'a insana' WHERE title_name = 'o insano';
UPDATE achievements SET title_name_female = 'a imparável' WHERE title_name = 'o imparável';
UPDATE achievements SET title_name_female = 'a viciada' WHERE title_name = 'o viciado';
UPDATE achievements SET title_name_female = 'maratonista' WHERE title_name = 'maratonista';
UPDATE achievements SET title_name_female = 'a sobrevivente' WHERE title_name = 'o sobrevivente';
UPDATE achievements SET title_name_female = 'monstra do cardio' WHERE title_name = 'monstro do cardio';
UPDATE achievements SET title_name_female = 'patroa' WHERE title_name = 'patrão';
UPDATE achievements SET title_name_female = 'fake natty' WHERE title_name = 'fake natty';
UPDATE achievements SET title_name_female = 'gym rat' WHERE title_name = 'gym rat';
UPDATE achievements SET title_name_female = 'disciplinada' WHERE title_name = 'disciplinado';
UPDATE achievements SET title_name_female = 'a braba' WHERE title_name = 'o brabo';
UPDATE achievements SET title_name_female = 'projeto verão' WHERE title_name = 'projeto verão';

-- 4. Update the military title function to handle gender
CREATE OR REPLACE FUNCTION get_title_by_level(lvl INTEGER, gender_param TEXT DEFAULT 'male') 
RETURNS TEXT AS $$
BEGIN
    IF gender_param = 'female' THEN
        IF lvl >= 46 THEN RETURN 'Marechal';
        ELSIF lvl >= 41 THEN RETURN 'General';
        ELSIF lvl >= 36 THEN RETURN 'Coronel';
        ELSIF lvl >= 31 THEN RETURN 'Major';
        ELSIF lvl >= 26 THEN RETURN 'Capitã';
        ELSIF lvl >= 21 THEN RETURN 'Tenente';
        ELSIF lvl >= 16 THEN RETURN 'Sargenta';
        ELSIF lvl >= 11 THEN RETURN 'Cabo';
        ELSIF lvl >= 6 THEN RETURN 'Soldada';
        ELSE RETURN 'Recruta';
        END IF;
    ELSE
        IF lvl >= 46 THEN RETURN 'Marechal';
        ELSIF lvl >= 41 THEN RETURN 'General';
        ELSIF lvl >= 36 THEN RETURN 'Coronel';
        ELSIF lvl >= 31 THEN RETURN 'Major';
        ELSIF lvl >= 26 THEN RETURN 'Capitão';
        ELSIF lvl >= 21 THEN RETURN 'Tenente';
        ELSIF lvl >= 16 THEN RETURN 'Sargento';
        ELSIF lvl >= 11 THEN RETURN 'Cabo';
        ELSIF lvl >= 6 THEN RETURN 'Soldado';
        ELSE RETURN 'Recruta';
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 5. Update the profile update trigger to use gender
CREATE OR REPLACE FUNCTION update_profile_level()
RETURNS TRIGGER AS $$
DECLARE
    new_xp INTEGER;
    new_lvl INTEGER;
    user_gender TEXT;
BEGIN
    -- Get user gender
    SELECT gender INTO user_gender FROM profiles WHERE id = NEW.user_id;

    -- Calculate total XP
    SELECT COALESCE(SUM(points), 0) INTO new_xp 
    FROM activity_logs 
    WHERE user_id = NEW.user_id;

    -- Level calculation
    new_lvl := LEAST(50, FLOOR(new_xp / 4.0) + 1)::INTEGER;

    -- Update profile
    UPDATE profiles 
    SET 
        total_xp = new_xp,
        level = new_lvl,
        title = get_title_by_level(new_lvl, user_gender)
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Update the view to choose the correct achievement title based on gender
-- Drop views in correct order to avoid column mismatch errors
DROP VIEW IF EXISTS activity_feed;
DROP VIEW IF EXISTS profile_display_with_titles;

CREATE VIEW profile_display_with_titles AS
SELECT 
    p.*,
    CASE 
        WHEN p.gender = 'female' AND a.title_name_female IS NOT NULL THEN a.title_name_female 
        ELSE a.title_name 
    END as active_title
FROM profiles p
LEFT JOIN achievements a ON p.selected_achievement_id = a.id;

-- Re-create activity_feed as it depends on the view above
CREATE VIEW activity_feed AS
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
