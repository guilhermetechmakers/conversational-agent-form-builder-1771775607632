-- Extend agent_public_chat_visitor_view with config and slug for Agent Builder
ALTER TABLE agent_public_chat_visitor_view
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- Index for slug lookups (public URLs)
CREATE UNIQUE INDEX IF NOT EXISTS agent_public_chat_visitor_view_slug_user_id_idx
  ON agent_public_chat_visitor_view(user_id, slug)
  WHERE slug IS NOT NULL;
