-- Update UI preferences with tutorial state
UPDATE profiles 
SET ui_preferences = ui_preferences || '{"has_seen_tutorial": false}'::jsonb
WHERE ui_preferences->>'has_seen_tutorial' IS NULL;

-- Ensure default includes the new field
ALTER TABLE profiles 
ALTER COLUMN ui_preferences SET DEFAULT '{"nav_style": "standard", "has_seen_tutorial": false}'::jsonb;
