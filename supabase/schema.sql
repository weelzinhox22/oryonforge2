-- ============================================
-- ORYON FORGE — Database Schema
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  admin_id UUID REFERENCES auth.users NOT NULL,
  period_days INTEGER DEFAULT 30,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  invite_code TEXT UNIQUE DEFAULT upper(substr(md5(random()::text), 1, 6)),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Groups are viewable by members" ON groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = groups.id AND group_members.user_id = auth.uid())
);

-- Group Members
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES groups ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'manager', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (group_id, user_id)
);

ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can view own memberships" ON group_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Members can view group memberships" ON group_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.user_id = auth.uid())
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  group_id UUID REFERENCES groups NOT NULL,
  activity_type TEXT NOT NULL,
  duration_minutes INTEGER,
  distance_km NUMERIC(6,2),
  points INTEGER NOT NULL DEFAULT 0,
  proof_url TEXT,
  device_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can insert own logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view group logs" ON activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM group_members WHERE group_members.group_id = activity_logs.group_id AND group_members.user_id = auth.uid())
);

-- ============================================
-- RPC Functions
-- ============================================

-- Create Group
CREATE OR REPLACE FUNCTION create_group(
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

-- Join Group by Code
CREATE OR REPLACE FUNCTION join_group_by_code(invite_code_param TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  found_group_id UUID;
BEGIN
  SELECT id INTO found_group_id FROM groups WHERE invite_code = upper(invite_code_param);

  IF found_group_id IS NULL THEN
    RAISE EXCEPTION 'Código de convite inválido.';
  END IF;

  IF EXISTS (SELECT 1 FROM group_members WHERE group_id = found_group_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Você já é membro deste grupo.';
  END IF;

  INSERT INTO group_members (group_id, user_id, role)
  VALUES (found_group_id, auth.uid(), 'member');

  RETURN found_group_id;
END;
$$;

-- Trigger: auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, username, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
