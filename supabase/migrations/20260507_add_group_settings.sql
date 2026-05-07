-- Add configuration columns to groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS daily_points_limit INTEGER DEFAULT 4;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived'));

-- RLS for group updates
CREATE POLICY "Admins can update group settings" ON groups 
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = groups.id 
    AND group_members.user_id = auth.uid() 
    AND group_members.role IN ('admin', 'manager')
  )
);
