export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface AgentPublicChatVisitorViewRow {
  id: string
  user_id: string
  title: string
  description: string | null
  slug: string | null
  status: string
  config: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface SessionsRow {
  id: string
  agent_id: string
  status: 'active' | 'completed' | 'abandoned'
  metadata: Json
  created_at: string
  updated_at: string
}

export interface ContentSourcesRow {
  id: string
  user_id: string
  agent_id: string | null
  name: string
  type: 'url' | 'file' | 'text'
  status: 'pending' | 'processing' | 'ready' | 'error'
  url: string | null
  file_path: string | null
  last_updated: string
  created_at: string
  metadata: Record<string, unknown> | null
}

export interface Database {
  public: {
    Tables: {
      content_sources: {
        Row: ContentSourcesRow
        Insert: Omit<ContentSourcesRow, 'id' | 'last_updated' | 'created_at'> & {
          id?: string
          last_updated?: string
          created_at?: string
        }
        Update: Partial<ContentSourcesRow>
      }
      agent_public_chat_visitor_view: {
        Row: AgentPublicChatVisitorViewRow
        Insert: Omit<AgentPublicChatVisitorViewRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<AgentPublicChatVisitorViewRow>
      }
      sessions: {
        Row: SessionsRow
        Insert: Omit<SessionsRow, 'id' | 'created_at' | 'updated_at'> & {
          id?: string
          created_at?: string
          updated_at?: string
        }
        Update: Partial<SessionsRow>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
