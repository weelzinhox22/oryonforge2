-- Add UI preferences to user profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ui_preferences JSONB DEFAULT '{"nav_style": "standard"}'::jsonb;

-- Comment for clarity
COMMENT ON COLUMN profiles.ui_preferences IS 'Stores user UI preferences like navigation style (standard or hamburger).';
