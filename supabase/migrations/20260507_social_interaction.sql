-- Social Interaction System
-- This script adds Kudos (likes) and Comments to activities.

-- 1. Create Likes Table
CREATE TABLE IF NOT EXISTS activity_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    activity_log_id UUID REFERENCES activity_logs ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, activity_log_id)
);

-- 2. Create Comments Table
CREATE TABLE IF NOT EXISTS activity_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
    activity_log_id UUID REFERENCES activity_logs ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Likes
CREATE POLICY "Likes are viewable by group members" ON activity_likes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_log_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can like activities in their groups" ON activity_likes
FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_log_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can unlike their own likes" ON activity_likes
FOR DELETE USING (auth.uid() = user_id);

-- 5. RLS Policies for Comments
CREATE POLICY "Comments are viewable by group members" ON activity_comments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_log_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can comment on activities in their groups" ON activity_comments
FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_log_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "Users can delete their own comments" ON activity_comments
FOR DELETE USING (auth.uid() = user_id);

-- 6. View for Activity Feed with social counts
DROP VIEW IF EXISTS activity_feed;
CREATE OR REPLACE VIEW activity_feed AS
SELECT 
    al.id,
    al.user_id,
    p.username,
    p.avatar_url,
    p.level,
    p.title as user_title,
    al.group_id,
    al.activity_type,
    al.points,
    al.proof_url,
    al.created_at,
    (SELECT COUNT(*) FROM activity_likes WHERE activity_log_id = al.id) as likes_count,
    (SELECT COUNT(*) FROM activity_comments WHERE activity_log_id = al.id) as comments_count,
    EXISTS(SELECT 1 FROM activity_likes WHERE activity_log_id = al.id AND user_id = auth.uid()) as user_has_liked
FROM activity_logs al
JOIN profiles p ON al.user_id = p.id;

-- 7. Trigger to re-check achievements when social actions happen
CREATE OR REPLACE FUNCTION trigger_recheck_achievements_social()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the logic for the user who RECEIVED the like/comment or MADE the comment
    -- For 'O Fotogênico' (likes received)
    IF TG_TABLE_NAME = 'activity_likes' THEN
        PERFORM process_user_achievements_logic(
            (SELECT user_id FROM activity_logs WHERE id = NEW.activity_log_id),
            (SELECT group_id FROM activity_logs WHERE id = NEW.activity_log_id),
            NOW()
        );
    END IF;
    
    -- For 'Shape Falante' (comments made)
    IF TG_TABLE_NAME = 'activity_comments' THEN
        PERFORM process_user_achievements_logic(
            NEW.user_id,
            (SELECT group_id FROM activity_logs WHERE id = NEW.activity_log_id),
            NOW()
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_recheck_achievements_likes
AFTER INSERT ON activity_likes
FOR EACH ROW EXECUTE FUNCTION trigger_recheck_achievements_social();

CREATE TRIGGER tr_recheck_achievements_comments
AFTER INSERT ON activity_comments
FOR EACH ROW EXECUTE FUNCTION trigger_recheck_achievements_social();
