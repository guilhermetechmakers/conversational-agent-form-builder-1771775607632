import type { SessionMetadataContent } from '@/types/session-details'

export type SessionStatus = 'active' | 'completed' | 'abandoned'

export type ConversionStatus = 'converted' | 'not_converted' | 'pending'

export interface SessionListItem {
  id: string
  agent_id: string
  agent_title?: string
  status: SessionStatus
  metadata: SessionMetadataContent & {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    conversion_status?: ConversionStatus
  }
  created_at: string
  updated_at: string
}

export interface SessionsListFilters {
  agentId: string
  status: SessionStatus | 'all'
  dateFrom: string
  dateTo: string
  conversionStatus: ConversionStatus | 'all'
  utmSource: string
  search: string
}

export interface SessionsListParams {
  page: number
  limit: number
  filters: SessionsListFilters
}

export interface SessionsListResult {
  sessions: SessionListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
}
