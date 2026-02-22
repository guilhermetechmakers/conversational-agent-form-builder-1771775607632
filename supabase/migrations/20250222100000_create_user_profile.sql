-- user_profile table
CREATE TABLE IF NOT EXISTS user_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profile ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "user_profile_read_own" ON user_profile
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "user_profile_insert_own" ON user_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "user_profile_update_own" ON user_profile
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "user_profile_delete_own" ON user_profile
  FOR DELETE USING (auth.uid() = user_id);
