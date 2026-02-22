export interface AgentPublicChatVisitorView {
  id: string
  user_id: string
  title: string
  description?: string
  status: string
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AgentConfig {
  id: string
  name: string
  avatar?: string
  brandColors?: { primary?: string; accent?: string }
  productHint?: string
  requiredFields: FieldConfig[]
  consentRequired?: boolean
  consentText?: string
}

export interface FieldConfig {
  id: string
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'file'
  options?: string[]
  required: boolean
}

export interface SessionState {
  collectedFields: Record<string, string | number | File | null>
  remainingFields: string[]
  progress: number
}
