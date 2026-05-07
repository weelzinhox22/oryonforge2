-- ========================================================
-- DEFINITIVE FIX FOR RLS RECURSION
-- ========================================================

-- 1. Drop ALL policies on group_members and groups to ensure a clean slate
DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    -- Drop all policies for group_members
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'group_members' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON group_members', pol.policyname);
    END LOOP;
    
    -- Drop all policies for groups
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'groups' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON groups', pol.policyname);
    END LOOP;

    -- Drop all policies for activity_logs
    FOR pol IN SELECT policyname FROM pg_policies WHERE tablename = 'activity_logs' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON activity_logs', pol.policyname);
    END LOOP;
END $$;

-- 2. Drop the helper function if it exists
DROP FUNCTION IF EXISTS public.is_group_member(UUID) CASCADE;

-- 3. Create a non-recursive policy for group_members
-- This policy is simple and never queries another table or itself recursively.
-- It allows any authenticated user to see who is in a group.
-- (Privacy note: This only reveals UUIDs of users/groups. The actual details are protected in their respective tables).
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "authenticated_view_members" 
ON group_members FOR SELECT 
TO authenticated 
USING ( true );

-- 4. Create a non-recursive policy for groups
-- This policy queries group_members. Since group_members' policy is just 'true', there is no recursion.
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "members_view_groups" 
ON groups FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid()
  )
);

-- 5. Additional safety for inserts/updates
CREATE POLICY "users_insert_own_membership" 
ON group_members FOR INSERT 
TO authenticated 
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "admins_update_memberships" 
ON group_members FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = group_members.group_id
    AND user_id = auth.uid()
    AND role = 'admin'
  )
);

CREATE POLICY "admins_update_groups" 
ON groups FOR UPDATE 
TO authenticated 
USING ( admin_id = auth.uid() );

-- 6. Fix activity_logs
DROP POLICY IF EXISTS "view_group_logs" ON activity_logs;
CREATE POLICY "view_group_logs" 
ON activity_logs FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = activity_logs.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "insert_own_logs" 
ON activity_logs FOR INSERT 
TO authenticated 
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "admins_manage_logs" 
ON activity_logs FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = activity_logs.group_id
    AND user_id = auth.uid()
    AND role IN ('admin', 'manager')
  )
);

-- ========================================================
-- VALIDATION VIEW
-- ========================================================
-- Ensure the activity_feed view (if it exists) is working correctly
-- This view should be SECURITY INVOKER to respect the new policies.
ALTER VIEW IF EXISTS activity_feed SET (security_invoker = on);
