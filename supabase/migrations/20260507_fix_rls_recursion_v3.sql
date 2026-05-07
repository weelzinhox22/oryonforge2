-- Fix RLS Recursion (Version 3) - The Definitive Fix
-- Instead of using SECURITY DEFINER functions which can be tricky and still cause recursion if FORCE RLS is on,
-- we use the standard architectural pattern for Supabase membership tables:
-- 1. Make the membership table (group_members) readable by all authenticated users.
--    (It only contains UUIDs, so it's not a privacy leak. The actual group details remain protected).
-- 2. Make the groups table query group_members securely.
-- This completely breaks the dependency cycle and eliminates infinite recursion.

-- 1. Drop the function to avoid any residual usage
DROP FUNCTION IF EXISTS public.is_group_member(UUID) CASCADE;

-- 2. Drop existing policies to start fresh
DROP POLICY IF EXISTS "Groups are viewable by members" ON groups;
DROP POLICY IF EXISTS "Members can view own memberships" ON group_members;
DROP POLICY IF EXISTS "Members can view group memberships" ON group_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;
DROP POLICY IF EXISTS "Activity logs are viewable by group members" ON activity_logs;
DROP POLICY IF EXISTS "Group members are viewable by authenticated users" ON group_members;

-- 3. The Mapping Table (group_members) is readable by all authenticated users
-- This prevents any recursive loops when other tables need to check memberships
CREATE POLICY "Group members are viewable by authenticated users" 
ON group_members FOR SELECT 
USING ( auth.role() = 'authenticated' );

-- 4. Groups Table is securely protected. 
-- You can only see the group details if your user_id is linked to the group_id in group_members.
CREATE POLICY "Groups are viewable by members" 
ON groups FOR SELECT 
USING (
  id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- 5. Activity Logs Table is also securely protected using the same pattern.
CREATE POLICY "Activity logs are viewable by group members" 
ON activity_logs FOR SELECT 
USING (
  group_id IN (
    SELECT group_id FROM group_members WHERE user_id = auth.uid()
  )
);

-- Ensure RLS is active
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
