-- Migration: Definitive Social Interaction Fix
-- This script ensures likes and comments work without RLS or Trigger issues.

-- 1. Drop existing triggers to avoid issues during table updates
DROP TRIGGER IF EXISTS tr_recheck_achievements_likes ON activity_likes;
DROP TRIGGER IF EXISTS tr_recheck_achievements_comments ON activity_comments;

-- 2. Drop existing policies
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'activity_likes' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON activity_likes', pol.policyname);
    END LOOP;
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'activity_comments' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON activity_comments', pol.policyname);
    END LOOP;
END $$;

-- 3. Simplified RLS for Likes
-- We allow all authenticated users to see likes (safe, just IDs)
-- We allow users to insert their own likes if they are in the group
ALTER TABLE activity_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_likes_select" ON activity_likes
FOR SELECT TO authenticated USING (true);

CREATE POLICY "social_likes_insert" ON activity_likes
FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_log_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "social_likes_delete" ON activity_likes
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4. Simplified RLS for Comments
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_comments_select" ON activity_comments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "social_comments_insert" ON activity_comments
FOR INSERT TO authenticated 
WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
        SELECT 1 FROM activity_logs al
        JOIN group_members gm ON al.group_id = gm.group_id
        WHERE al.id = activity_log_id AND gm.user_id = auth.uid()
    )
);

CREATE POLICY "social_comments_delete" ON activity_comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 5. Robust Achievement Trigger
-- We wrap the achievement logic in a sub-block to prevent social actions from failing
-- if the achievement engine has an issue.
CREATE OR REPLACE FUNCTION trigger_recheck_achievements_social_safe()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    BEGIN
        IF TG_TABLE_NAME = 'activity_likes' THEN
            PERFORM process_user_achievements_logic(
                (SELECT user_id FROM activity_logs WHERE id = NEW.activity_log_id),
                (SELECT group_id FROM activity_logs WHERE id = NEW.activity_log_id),
                NOW()
            );
        ELSIF TG_TABLE_NAME = 'activity_comments' THEN
            PERFORM process_user_achievements_logic(
                NEW.user_id,
                (SELECT group_id FROM activity_logs WHERE id = NEW.activity_log_id),
                NOW()
            );
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Log error or just ignore to allow the social action to proceed
        RAISE NOTICE 'Achievement logic failed in social trigger: %', SQLERRM;
    END;
    RETURN NEW;
END;
$$;

CREATE TRIGGER tr_recheck_achievements_likes
AFTER INSERT ON activity_likes
FOR EACH ROW EXECUTE FUNCTION trigger_recheck_achievements_social_safe();

CREATE TRIGGER tr_recheck_achievements_comments
AFTER INSERT ON activity_comments
FOR EACH ROW EXECUTE FUNCTION trigger_recheck_achievements_social_safe();

-- 6. Refresh the View
ALTER VIEW IF EXISTS activity_feed SET (security_invoker = on);
