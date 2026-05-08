-- 20260508_fix_group_deletion_cascade.sql
-- 1. Enable RLS for Group Deletion (Admin only)
DROP POLICY IF EXISTS "Admins can delete groups" ON groups;
CREATE POLICY "Admins can delete groups" ON groups 
FOR DELETE TO authenticated USING (auth.uid() = admin_id);

-- 2. Fix Foreign Key constraints to use ON DELETE CASCADE
-- We use a DO block to safely handle constraint names and missing columns
DO $$ 
BEGIN 
    -- activity_logs
    ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_group_id_fkey;
    ALTER TABLE activity_logs ADD CONSTRAINT activity_logs_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

    -- user_achievements
    ALTER TABLE user_achievements DROP CONSTRAINT IF EXISTS user_achievements_group_id_fkey;
    ALTER TABLE user_achievements ADD CONSTRAINT user_achievements_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

    -- group_members
    ALTER TABLE group_members DROP CONSTRAINT IF EXISTS group_members_group_id_fkey;
    ALTER TABLE group_members ADD CONSTRAINT group_members_group_id_fkey 
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;

    -- notifications (Handle missing group_id column)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = 'group_id') THEN
        ALTER TABLE notifications ADD COLUMN group_id UUID REFERENCES groups(id) ON DELETE CASCADE;
    ELSE
        ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_group_id_fkey;
        ALTER TABLE notifications ADD CONSTRAINT notifications_group_id_fkey 
        FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE;
    END IF;
END $$;
