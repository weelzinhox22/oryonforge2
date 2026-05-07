-- Migration to add a helper view for the activity feed
-- This view simplifies fetching the recent activities with usernames and group names

CREATE OR REPLACE VIEW activity_feed AS
SELECT 
    al.id,
    al.user_id,
    p.username,
    al.group_id,
    g.name as group_name,
    al.activity_type,
    al.points,
    al.created_at
FROM activity_logs al
JOIN profiles p ON al.user_id = p.id
JOIN groups g ON al.group_id = g.id;

-- Ensure it's ordered by most recent by default in queries
-- Note: Views don't store order, but we join with profiles and groups to make frontend fetching easier.
