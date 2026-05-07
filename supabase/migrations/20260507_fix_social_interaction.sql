-- Fix Social Interaction System
-- This script fixes FKs and RLS for likes and comments.

-- 1. Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Likes are viewable by group members" ON activity_likes;
DROP POLICY IF EXISTS "Users can like activities in their groups" ON activity_likes;
DROP POLICY IF EXISTS "Users can unlike their own likes" ON activity_likes;
DROP POLICY IF EXISTS "Comments are viewable by group members" ON activity_comments;
DROP POLICY IF EXISTS "Users can comment on activities in their groups" ON activity_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON activity_comments;

-- 2. Ensure tables reference profiles(id) for easier joining
-- We use a transaction-safe way to update FKs if they already exist
DO $$ 
BEGIN
    -- Fix activity_likes FK
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activity_likes_user_id_fkey') THEN
        ALTER TABLE activity_likes DROP CONSTRAINT activity_likes_user_id_fkey;
    END IF;
    ALTER TABLE activity_likes ADD CONSTRAINT activity_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

    -- Fix activity_comments FK
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'activity_comments_user_id_fkey') THEN
        ALTER TABLE activity_comments DROP CONSTRAINT activity_comments_user_id_fkey;
    END IF;
    ALTER TABLE activity_comments ADD CONSTRAINT activity_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- 3. Simplified but secure RLS Policies
-- LIKES
CREATE POLICY "Likes are viewable by group members" ON activity_likes
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_likes.activity_log_id AND gm.user_id = auth.uid()
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

-- COMMENTS
CREATE POLICY "Comments are viewable by group members" ON activity_comments
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_comments.activity_log_id AND gm.user_id = auth.uid()
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
