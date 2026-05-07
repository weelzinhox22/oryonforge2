-- ============================================
-- ADD GROUP SETTINGS
-- ============================================

ALTER TABLE groups 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
ADD COLUMN IF NOT EXISTS requires_approval BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS daily_points_limit INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS challenge_type TEXT DEFAULT 'geral',
ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Update the create_group function to handle new fields
CREATE OR REPLACE FUNCTION create_group_v2(
  group_name TEXT,
  group_description TEXT DEFAULT NULL,
  group_period_days INTEGER DEFAULT 30,
  group_visibility TEXT DEFAULT 'public',
  group_requires_approval BOOLEAN DEFAULT false,
  group_daily_points_limit INTEGER DEFAULT 4,
  group_challenge_type TEXT DEFAULT 'geral',
  group_cover_url TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_group_id UUID;
BEGIN
  INSERT INTO groups (
    name, 
    description, 
    admin_id, 
    period_days, 
    start_date, 
    end_date,
    visibility,
    requires_approval,
    daily_points_limit,
    challenge_type,
    cover_url
  )
  VALUES (
    group_name,
    group_description,
    auth.uid(),
    group_period_days,
    NOW(),
    NOW() + (group_period_days || ' days')::INTERVAL,
    group_visibility,
    group_requires_approval,
    group_daily_points_limit,
    group_challenge_type,
    group_cover_url
  )
  RETURNING id INTO new_group_id;

  INSERT INTO group_members (group_id, user_id, role)
  VALUES (new_group_id, auth.uid(), 'admin');

  RETURN new_group_id;
END;
$$;
