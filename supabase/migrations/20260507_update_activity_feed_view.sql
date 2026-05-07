-- Migration to update activity_feed view with titles
-- Dependency: profile_display_with_titles view

-- Ensure profile_display_with_titles exists (in case it wasn't created yet)
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
