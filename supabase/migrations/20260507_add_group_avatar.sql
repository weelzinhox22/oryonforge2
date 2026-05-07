-- Add avatar_url to groups
ALTER TABLE groups ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN groups.avatar_url IS 'URL of the group avatar icon.';
