-- 20260507_add_email_to_profiles.sql

-- 1. Add Email Column
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Sync existing emails from auth.users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;

-- 3. Update the trigger function to include email on new signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Update the view to include email
-- 4. Update the views to include email and maintain dependencies
DROP VIEW IF EXISTS profile_display_with_titles CASCADE;

CREATE OR REPLACE VIEW profile_display_with_titles AS
SELECT 
    p.*,
    a.title_name as active_title
FROM profiles p
LEFT JOIN achievements a ON p.selected_achievement_id = a.id;

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
