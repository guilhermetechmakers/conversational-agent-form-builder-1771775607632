export type FieldType = 'text' | 'email' | 'number' | 'select' | 'multiselect' | 'date' | 'phone' | 'textarea'

export interface FieldValidation {
  regex?: string
  min?: number
  max?: number
  required?: boolean
  options?: string[]
}

export interface AgentField {
  id: string
  key: string
  label: string
  type: FieldType
  placeholder?: string
  validation?: FieldValidation
  conditionalLogic?: { fieldId: string; operator: string; value: string }[]
}

export type ToneSetting = 'friendly' | 'professional' | 'casual' | 'formal' | 'empathetic'

export interface PersonaConfig {
  name?: string
  avatarUrl?: string
  systemInstructions?: string
  tone?: ToneSetting
}

export interface AppearanceConfig {
  primaryColor?: string
  layout?: 'compact' | 'full'
}

export interface LLMConfig {
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface ContextAttachment {
  id: string
  type: 'file' | 'url'
  name: string
  url?: string
  addedAt: string
}

export interface AgentConfig {
  fields?: AgentField[]
  fieldOrder?: string[]
  persona?: PersonaConfig
  appearance?: AppearanceConfig
  llm?: LLMConfig
  contextAttachments?: ContextAttachment[]
  versions?: { id: string; createdAt: string; label?: string }[]
}

export interface AgentBuilderData {
  id: string
  user_id: string
  title: string
  description?: string | null
  slug?: string | null
  status: string
  config?: AgentConfig | null
  created_at: string
  updated_at: string
}
