-- content_sources table for document/knowledge base
CREATE TABLE IF NOT EXISTS content_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES agent_public_chat_visitor_view(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('url', 'file', 'text')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'error')),
  url TEXT,
  file_path TEXT,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE content_sources ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "content_sources_read_own" ON content_sources
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own data
CREATE POLICY "content_sources_insert_own" ON content_sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own data
CREATE POLICY "content_sources_update_own" ON content_sources
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own data
CREATE POLICY "content_sources_delete_own" ON content_sources
  FOR DELETE USING (auth.uid() = user_id);
