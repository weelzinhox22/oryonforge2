-- Migration: Repair Social Tables and Foreign Keys
-- This script ensures activity_likes and activity_comments are correctly linked to profiles.

-- 1. Fix activity_likes
DO $$ 
BEGIN
    -- Ensure columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_likes' AND column_name = 'user_id') THEN
        ALTER TABLE activity_likes ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_likes' AND column_name = 'activity_log_id') THEN
        ALTER TABLE activity_likes ADD COLUMN activity_log_id UUID;
    END IF;

    -- Fix Foreign Keys to point to profiles(id)
    ALTER TABLE activity_likes DROP CONSTRAINT IF EXISTS activity_likes_user_id_fkey;
    ALTER TABLE activity_likes ADD CONSTRAINT activity_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

    ALTER TABLE activity_likes DROP CONSTRAINT IF EXISTS activity_likes_activity_log_id_fkey;
    ALTER TABLE activity_likes ADD CONSTRAINT activity_likes_activity_log_id_fkey FOREIGN KEY (activity_log_id) REFERENCES activity_logs(id) ON DELETE CASCADE;
    
    -- Ensure Unique Constraint
    ALTER TABLE activity_likes DROP CONSTRAINT IF EXISTS activity_likes_user_id_activity_log_id_key;
    ALTER TABLE activity_likes ADD CONSTRAINT activity_likes_user_id_activity_log_id_key UNIQUE(user_id, activity_log_id);
END $$;

-- 2. Fix activity_comments
DO $$ 
BEGIN
    -- Ensure columns exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_comments' AND column_name = 'user_id') THEN
        ALTER TABLE activity_comments ADD COLUMN user_id UUID;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_comments' AND column_name = 'activity_log_id') THEN
        ALTER TABLE activity_comments ADD COLUMN activity_log_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_comments' AND column_name = 'content') THEN
        ALTER TABLE activity_comments ADD COLUMN content TEXT;
    END IF;

    -- Fix Foreign Keys to point to profiles(id)
    ALTER TABLE activity_comments DROP CONSTRAINT IF EXISTS activity_comments_user_id_fkey;
    ALTER TABLE activity_comments ADD CONSTRAINT activity_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

    ALTER TABLE activity_comments DROP CONSTRAINT IF EXISTS activity_comments_activity_log_id_fkey;
    ALTER TABLE activity_comments ADD CONSTRAINT activity_comments_activity_log_id_fkey FOREIGN KEY (activity_log_id) REFERENCES activity_logs(id) ON DELETE CASCADE;
END $$;

-- 3. Reset RLS (using the most permissive safe version)
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "social_likes_select" ON activity_likes;
DROP POLICY IF EXISTS "social_likes_insert" ON activity_likes;
DROP POLICY IF EXISTS "social_likes_delete" ON activity_likes;

CREATE POLICY "social_likes_select" ON activity_likes FOR SELECT USING (true);
CREATE POLICY "social_likes_insert" ON activity_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "social_likes_delete" ON activity_likes FOR DELETE USING (auth.uid() = user_id);

ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "social_comments_select" ON activity_comments;
DROP POLICY IF EXISTS "social_comments_insert" ON activity_comments;
DROP POLICY IF EXISTS "social_comments_delete" ON activity_comments;

CREATE POLICY "social_comments_select" ON activity_comments FOR SELECT USING (true);
CREATE POLICY "social_comments_insert" ON activity_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "social_comments_delete" ON activity_comments FOR DELETE USING (auth.uid() = user_id);
