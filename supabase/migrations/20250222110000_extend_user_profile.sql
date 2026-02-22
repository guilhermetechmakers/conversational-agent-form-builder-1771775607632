-- Extend user_profile for account settings (name, email, timezone, language, avatar_url)
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en';
ALTER TABLE user_profile ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add unique constraint on user_id for upsert
CREATE UNIQUE INDEX IF NOT EXISTS user_profile_user_id_key ON user_profile (user_id);
