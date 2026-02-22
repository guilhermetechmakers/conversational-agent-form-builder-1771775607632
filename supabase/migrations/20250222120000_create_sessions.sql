-- sessions table for chat session storage
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID NOT NULL REFERENCES agent_public_chat_visitor_view(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for agent_id lookups
CREATE INDEX IF NOT EXISTS sessions_agent_id_idx ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users can read sessions for agents they own
CREATE POLICY "sessions_read_own_agents" ON sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM agent_public_chat_visitor_view a
      WHERE a.id = sessions.agent_id AND a.user_id = auth.uid()
    )
  );

-- Allow insert for agents (via service or anon for public chat)
CREATE POLICY "sessions_insert" ON sessions
  FOR INSERT WITH CHECK (true);

-- Users can update sessions for their agents
CREATE POLICY "sessions_update_own_agents" ON sessions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM agent_public_chat_visitor_view a
      WHERE a.id = sessions.agent_id AND a.user_id = auth.uid()
    )
  );

-- Users can delete sessions for their agents
CREATE POLICY "sessions_delete_own_agents" ON sessions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM agent_public_chat_visitor_view a
      WHERE a.id = sessions.agent_id AND a.user_id = auth.uid()
    )
  );
