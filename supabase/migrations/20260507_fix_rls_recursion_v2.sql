-- Fix RLS Recursion (Version 2)
-- Using plpgsql instead of sql to strictly prevent the PostgreSQL query planner 
-- from inlining the SECURITY DEFINER function, which can re-introduce recursion.

-- 1. Drop the old function
DROP FUNCTION IF EXISTS public.is_group_member(UUID) CASCADE;

-- 2. Create the function using plpgsql
CREATE OR REPLACE FUNCTION public.is_group_member(group_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = group_id_to_check 
    AND user_id = auth.uid()
  );
END;
$$;

-- 3. Ensure the base policies are solid
DROP POLICY IF EXISTS "Groups are viewable by members" ON groups;
DROP POLICY IF EXISTS "Members can view own memberships" ON group_members;
DROP POLICY IF EXISTS "Members can view group memberships" ON group_members;
DROP POLICY IF EXISTS "Users can view their own memberships" ON group_members;
DROP POLICY IF EXISTS "Users can view members of their groups" ON group_members;

-- 3a. Users can ALWAYS view their own memberships instantly (fast path)
CREATE POLICY "Users can view their own memberships" 
ON group_members FOR SELECT 
USING ( user_id = auth.uid() );

-- 3b. Users can view other members of groups they belong to (uses the safe function)
CREATE POLICY "Users can view members of their groups" 
ON group_members FOR SELECT 
USING ( public.is_group_member(group_id) );

-- 3c. Groups are viewable if the user is a member
CREATE POLICY "Groups are viewable by members" 
ON groups FOR SELECT 
USING ( public.is_group_member(id) );

-- 4. Enable RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
