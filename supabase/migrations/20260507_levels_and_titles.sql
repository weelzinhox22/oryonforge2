-- Levels and Titles System Migration (Fixed Types)
-- 1. Add XP and Level columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS title TEXT DEFAULT 'Recruta';

-- 2. Function to calculate title based on level
CREATE OR REPLACE FUNCTION get_title_by_level(lvl INTEGER) 
RETURNS TEXT AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql;

-- 3. Trigger Function to update profile XP and Level
CREATE OR REPLACE FUNCTION update_profile_level()
RETURNS TRIGGER AS $$
DECLARE
    new_xp INTEGER;
    new_lvl INTEGER;
BEGIN
    -- Calculate total XP (sum of points from all approved activity logs)
    SELECT COALESCE(SUM(points), 0) INTO new_xp 
    FROM activity_logs 
    WHERE user_id = NEW.user_id;

    -- Level calculation: 1 level every 4 points (approx 1 level per activity)
    -- Explicitly cast to INTEGER for the function call
    new_lvl := LEAST(50, FLOOR(new_xp / 4.0) + 1)::INTEGER;

    -- Update profile
    UPDATE profiles 
    SET 
        total_xp = new_xp,
        level = new_lvl,
        title = get_title_by_level(new_lvl)
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create Trigger on activity_logs
DROP TRIGGER IF EXISTS tr_update_profile_level ON activity_logs;
CREATE TRIGGER tr_update_profile_level
AFTER INSERT OR UPDATE ON activity_logs
FOR EACH ROW
EXECUTE FUNCTION update_profile_level();

-- 5. Initialize existing users with correct type casting
DO $$
DECLARE
    r RECORD;
    calculated_xp INTEGER;
    calculated_lvl INTEGER;
BEGIN
    FOR r IN SELECT id FROM profiles LOOP
        SELECT COALESCE(SUM(points), 0) INTO calculated_xp FROM activity_logs WHERE user_id = r.id;
        calculated_lvl := LEAST(50, FLOOR(calculated_xp / 4.0) + 1)::INTEGER;
        
        UPDATE profiles SET
            total_xp = calculated_xp,
            level = calculated_lvl,
            title = get_title_by_level(calculated_lvl)
        WHERE id = r.id;
    END LOOP;
END $$;
