-- Add device_info column to activity_logs
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS device_info TEXT;

COMMENT ON COLUMN activity_logs.device_info IS 'Information about the device used to register the activity (e.g., iPhone 15, Android 14)';
