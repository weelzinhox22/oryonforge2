-- Fix RLS Recursion on groups and group_members
-- When enabling RLS, existing policies often cause infinite recursion because 
-- groups policy queries group_members, and group_members policy queries groups or itself.

-- 1. Create a SECURITY DEFINER function to safely check membership without triggering RLS recursively
DROP FUNCTION IF EXISTS public.is_group_member(UUID) CASCADE;

CREATE OR REPLACE FUNCTION public.is_group_member(group_id_to_check UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER -- Bypasses RLS internally
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_id = group_id_to_check 
    AND user_id = auth.uid()
  );
$$;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Groups are viewable by members" ON groups;
DROP POLICY IF EXISTS "Members can view own memberships" ON group_members;
DROP POLICY IF EXISTS "Members can view group memberships" ON group_members;

-- 3. Recreate policies safely using the helper function
-- Groups: You can see the group if you are a member
CREATE POLICY "Groups are viewable by members" 
ON groups FOR SELECT 
USING ( public.is_group_member(id) );

-- Group Members: You can see members of any group you are also a member of
CREATE POLICY "Members can view group memberships" 
ON group_members FOR SELECT 
USING ( public.is_group_member(group_id) );

-- Allow users to insert themselves into a group when joining (if not using RPC)
-- Or just allow insert if they are the authenticated user.
-- Usually joining is done via join_group_by_code RPC which is SECURITY DEFINER.
-- But if client-side inserts happen, we need:
CREATE POLICY "Users can insert own memberships" 
ON group_members FOR INSERT 
WITH CHECK ( auth.uid() = user_id );

-- 4. Just in case, ensure the tables still have RLS
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
