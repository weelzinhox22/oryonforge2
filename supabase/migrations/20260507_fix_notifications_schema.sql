-- Migration: Fix Notifications Schema and Consolidate Social Triggers
-- This script fixes the "column metadata does not exist" error and cleans up duplicate triggers.

-- 0. Enable Extension if not already (for uuid_generate_v4 if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Fix Notifications Table Schema
DO $$ 
BEGIN
    -- Add metadata column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'metadata') THEN
        ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;

    -- Ensure user_id references profiles(id) for consistency
    ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
    ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

    -- Ensure content is NOT NULL
    ALTER TABLE notifications ALTER COLUMN content SET NOT NULL;
END $$;

-- 2. Consolidate Kudos (Like) Trigger
CREATE OR REPLACE FUNCTION notify_on_activity_like()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    liker_name TEXT;
BEGIN
    -- Get the owner of the activity
    SELECT user_id INTO post_owner_id FROM activity_logs WHERE id = NEW.activity_log_id;
    
    -- Get the name of the person who liked
    SELECT username INTO liker_name FROM profiles WHERE id = NEW.user_id;

    -- Don't notify if liking own post
    IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link, metadata)
        VALUES (
            post_owner_id,
            'kudo',
            'Novo Kudos! 🔥',
            liker_name || ' curtiu seu treino.',
            '/dashboard', 
            jsonb_build_object('activity_id', NEW.activity_log_id, 'liker_id', NEW.user_id)
        );
    END IF;
    
    -- Also re-check achievements for the person who RECEIVED the kudo
    BEGIN
        PERFORM process_user_achievements_logic(
            post_owner_id,
            (SELECT group_id FROM activity_logs WHERE id = NEW.activity_log_id),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        -- Don't break if achievement engine fails
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup ALL possible old triggers and create the new one
DROP TRIGGER IF EXISTS tr_notify_kudo ON activity_likes;
DROP TRIGGER IF EXISTS on_activity_like ON activity_likes;
DROP TRIGGER IF EXISTS tr_recheck_achievements_likes ON activity_likes;
DROP TRIGGER IF EXISTS tr_social_activity_like ON activity_likes;
CREATE TRIGGER tr_social_activity_like
AFTER INSERT ON activity_likes
FOR EACH ROW EXECUTE FUNCTION notify_on_activity_like();

-- 3. Consolidate Comment Trigger
CREATE OR REPLACE FUNCTION notify_on_activity_comment()
RETURNS TRIGGER AS $$
DECLARE
    post_owner_id UUID;
    commenter_name TEXT;
BEGIN
    -- Get the owner of the activity
    SELECT user_id INTO post_owner_id FROM activity_logs WHERE id = NEW.activity_log_id;
    
    -- Get the name of the person who commented
    SELECT username INTO commenter_name FROM profiles WHERE id = NEW.user_id;

    -- Don't notify if commenting on own post
    IF post_owner_id IS NOT NULL AND post_owner_id != NEW.user_id THEN
        INSERT INTO notifications (user_id, type, title, content, link, metadata)
        VALUES (
            post_owner_id,
            'comment',
            'Novo incentivo! 💬',
            commenter_name || ' comentou no seu treino.',
            '/dashboard',
            jsonb_build_object('activity_id', NEW.activity_log_id, 'comment_id', NEW.id)
        );
    END IF;
    
    -- Also re-check achievements for the person who COMMENTED
    BEGIN
        PERFORM process_user_achievements_logic(
            NEW.user_id,
            (SELECT group_id FROM activity_logs WHERE id = NEW.activity_log_id),
            NOW()
        );
    EXCEPTION WHEN OTHERS THEN
        -- Don't break if achievement engine fails
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup ALL possible old triggers and create the new one
DROP TRIGGER IF EXISTS tr_notify_comment ON activity_comments;
DROP TRIGGER IF EXISTS on_activity_comment ON activity_comments;
DROP TRIGGER IF EXISTS tr_recheck_achievements_comments ON activity_comments;
DROP TRIGGER IF EXISTS tr_social_activity_comment ON activity_comments;
CREATE TRIGGER tr_social_activity_comment
AFTER INSERT ON activity_comments
FOR EACH ROW EXECUTE FUNCTION notify_on_activity_comment();

-- 4. Final RLS Policy Sync
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can see their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;

CREATE POLICY "notifications_select_own" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notifications_delete_own" ON notifications FOR DELETE USING (auth.uid() = user_id);
