export type ContentSourceType = 'url' | 'file' | 'text'

export type ContentSourceStatus = 'pending' | 'processing' | 'ready' | 'error'

export interface ContentSource {
  id: string
  user_id: string
  agent_id?: string | null
  name: string
  type: ContentSourceType
  status: ContentSourceStatus
  url?: string | null
  file_path?: string | null
  last_updated: string
  created_at: string
  metadata?: Record<string, unknown> | null
}

export interface ContentSourceInsert {
  user_id: string
  agent_id?: string | null
  name: string
  type: ContentSourceType
  status?: ContentSourceStatus
  url?: string | null
  file_path?: string | null
  metadata?: Record<string, unknown> | null
}
