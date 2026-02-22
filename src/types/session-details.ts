export interface SessionMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ExtractedFieldValue {
  value: string | number
  confidence?: number
  status?: 'valid' | 'invalid' | 'pending'
}

export interface SessionMetadataContent {
  messages?: SessionMessage[]
  extractedFields?: Record<string, ExtractedFieldValue>
  webhook_delivered?: boolean
  webhook_url?: string
  [key: string]: unknown
}

export interface SessionDetails {
  id: string
  agent_id: string
  agent_title?: string
  status: 'active' | 'completed' | 'abandoned'
  metadata: SessionMetadataContent
  created_at: string
  updated_at: string
}
