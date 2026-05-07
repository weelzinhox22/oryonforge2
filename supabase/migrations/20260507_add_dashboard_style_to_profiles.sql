-- 20260507_add_dashboard_style_to_profiles.sql
-- Ensure dashboard_style column exists and is initialized

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'dashboard_style') THEN
        ALTER TABLE profiles ADD COLUMN dashboard_style TEXT DEFAULT 'premium' CHECK (dashboard_style IN ('premium', 'minimalist'));
    END IF;
END $$;

-- Update existing profiles that might have NULL
UPDATE profiles SET dashboard_style = 'premium' WHERE dashboard_style IS NULL;
