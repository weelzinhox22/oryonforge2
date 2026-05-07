-- Migration: Fix ambiguous create_group RPC function
-- Date: 2026-05-06

-- Drop the old 6-parameter version of create_group if it exists from a previous iteration
DROP FUNCTION IF EXISTS public.create_group(text, text, integer, text, boolean, jsonb);

-- Ensure the 3-parameter version is the only one in use
CREATE OR REPLACE FUNCTION public.create_group(
  group_name TEXT,
  group_description TEXT DEFAULT NULL,
  group_period_days INTEGER DEFAULT 30
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_group_id UUID;
BEGIN
  INSERT INTO groups (name, description, admin_id, period_days, start_date, end_date)
  VALUES (
    group_name,
    group_description,
    auth.uid(),
    group_period_days,
    NOW(),
    NOW() + (group_period_days || ' days')::INTERVAL
  )
  RETURNING id INTO new_group_id;

  INSERT INTO group_members (group_id, user_id, role)
  VALUES (new_group_id, auth.uid(), 'admin');

  RETURN new_group_id;
END;
$$;
