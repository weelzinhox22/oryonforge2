-- Migration: Add detailed activity rules and enrich existing tables
-- Date: 2026-05-06

-- 1. Enrich groups table
ALTER TABLE public.groups
ADD COLUMN IF NOT EXISTS max_points_per_day INTEGER DEFAULT 4,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('draft', 'active', 'finished')) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS cover_url TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Enrich group_members table
ALTER TABLE public.group_members
ADD COLUMN IF NOT EXISTS total_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date DATE,
ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('active', 'removed', 'left')) DEFAULT 'active';

-- 3. Enrich activity_logs table
ALTER TABLE public.activity_logs
ADD COLUMN IF NOT EXISTS activity_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS proof_type TEXT CHECK (proof_type IN ('image', 'video')),
ADD COLUMN IF NOT EXISTS metadata JSONB;

-- 4. Create activity_rules table
CREATE TABLE IF NOT EXISTS public.activity_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES public.groups(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL,
  unit TEXT CHECK (unit IN ('minutes', 'km')) NOT NULL,
  required_amount NUMERIC NOT NULL,
  points_per_unit INTEGER NOT NULL DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, activity_type)
);

-- RLS for activity_rules
ALTER TABLE public.activity_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Activity rules are viewable by everyone" 
  ON public.activity_rules FOR SELECT 
  USING (true);

CREATE POLICY "Activity rules can be managed by group admins" 
  ON public.activity_rules FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members 
      WHERE group_members.group_id = activity_rules.group_id 
      AND group_members.user_id = auth.uid() 
      AND group_members.role = 'admin'
    )
  );

-- Trigger to auto-update updated_at on groups
CREATE OR REPLACE FUNCTION update_groups_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;

CREATE TRIGGER update_groups_updated_at
BEFORE UPDATE ON public.groups
FOR EACH ROW
EXECUTE FUNCTION update_groups_updated_at_column();
