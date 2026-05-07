-- Fix views by making them Security Invoker views
-- This ensures that querying these views respects the RLS policies of the underlying tables
-- and removes the "unrestricted" security warning in Supabase.

-- We must drop the views first to alter their security_invoker property
DROP VIEW IF EXISTS activity_feed CASCADE;
DROP VIEW IF EXISTS profile_display_with_titles CASCADE;

-- Recreate profile_display_with_titles with security_invoker = true
CREATE OR REPLACE VIEW profile_display_with_titles WITH (security_invoker = true) AS
SELECT 
    p.*,
    a.title_name as active_title
FROM profiles p
LEFT JOIN achievements a ON p.selected_achievement_id = a.id;

-- Recreate activity_feed with security_invoker = true
CREATE OR REPLACE VIEW activity_feed WITH (security_invoker = true) AS
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

-- Explicitly ensure RLS is enabled on the underlying tables just in case
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
