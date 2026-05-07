-- Add adjustment_points to group_members for admin manual overrides
ALTER TABLE group_members ADD COLUMN IF NOT EXISTS adjustment_points INTEGER DEFAULT 0;

COMMENT ON COLUMN group_members.adjustment_points IS 'Manual point adjustments made by group admins.';
