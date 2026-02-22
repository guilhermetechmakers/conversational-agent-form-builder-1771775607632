import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type {
  SessionListItem,
  SessionsListParams,
  SessionsListResult,
} from '@/types/sessions-list'

const AGENTS_TABLE = 'agent_public_chat_visitor_view'
const SESSIONS_TABLE = 'sessions'

function getSessionPreview(metadata: SessionListItem['metadata']): string {
  const messages = metadata?.messages
  if (!messages || messages.length === 0) return 'No messages'
  const last = messages[messages.length - 1]
  const content = last.content ?? ''
  return content.length > 80 ? `${content.slice(0, 80)}…` : content
}

function getExtractedKeyFields(metadata: SessionListItem['metadata']): Record<string, string> {
  const fields = metadata?.extractedFields
  if (!fields || typeof fields !== 'object') return {}
  const result: Record<string, string> = {}
  for (const [k, v] of Object.entries(fields)) {
    if (v && typeof v === 'object' && 'value' in v) {
      result[k] = String((v as { value: unknown }).value)
    }
  }
  return result
}

export function useSessions(params: SessionsListParams) {
  return useQuery({
    queryKey: ['sessions-list', params],
    queryFn: async (): Promise<SessionsListResult> => {
      if (!supabase) {
        return { sessions: [], total: 0, page: 1, limit: params.limit, totalPages: 0 }
      }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return { sessions: [], total: 0, page: 1, limit: params.limit, totalPages: 0 }
      }

      const { data: agents } = await supabase
        .from(AGENTS_TABLE)
        .select('id, title')
        .eq('user_id', user.id)

      const agentsList = (agents ?? []) as { id: string; title: string }[]
      const agentIds = agentsList.map((a) => a.id)
      if (agentIds.length === 0) {
        return { sessions: [], total: 0, page: params.page, limit: params.limit, totalPages: 0 }
      }

      const { page, limit, filters } = params
      const { agentId, status, dateFrom, dateTo } = filters
      const hasClientFilters =
        (filters.conversionStatus && filters.conversionStatus !== 'all') ||
        (filters.utmSource && filters.utmSource !== 'all') ||
        (filters.search?.trim().length ?? 0) > 0

      const maxFetch = hasClientFilters ? 2000 : limit
      const from = (page - 1) * limit

      let query = supabase
        .from(SESSIONS_TABLE)
        .select('*', { count: hasClientFilters ? undefined : 'exact' })
        .in('agent_id', agentIds)
        .order('created_at', { ascending: false })

      if (agentId && agentId !== 'all') {
        query = query.eq('agent_id', agentId)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }
      if (dateFrom) {
        query = query.gte('created_at', `${dateFrom}T00:00:00.000Z`)
      }
      if (dateTo) {
        query = query.lte('created_at', `${dateTo}T23:59:59.999Z`)
      }

      if (!hasClientFilters) {
        query = query.range(from, from + limit - 1)
      } else {
        query = query.limit(maxFetch)
      }

      const { data, error, count } = await query

      if (error) throw error

      const agentMap = new Map(agentsList.map((a) => [a.id, a.title]))
      const rows = (data ?? []) as Array<{
        id: string
        agent_id: string
        status: string
        metadata: unknown
        created_at: string
        updated_at: string
      }>

      let sessions: SessionListItem[] = rows.map((r) => ({
        id: r.id,
        agent_id: r.agent_id,
        agent_title: agentMap.get(r.agent_id),
        status: r.status as SessionListItem['status'],
        metadata: (r.metadata ?? {}) as SessionListItem['metadata'],
        created_at: r.created_at,
        updated_at: r.updated_at,
      }))

      if (filters.conversionStatus && filters.conversionStatus !== 'all') {
        sessions = sessions.filter((s) => {
          const cs = (s.metadata as Record<string, unknown>)?.conversion_status
          return String(cs) === filters.conversionStatus
        })
      }
      if (filters.utmSource && filters.utmSource !== 'all') {
        sessions = sessions.filter((s) => {
          const us = (s.metadata as Record<string, unknown>)?.utm_source
          return String(us) === filters.utmSource
        })
      }
      if (filters.search?.trim()) {
        const q = filters.search.toLowerCase()
        sessions = sessions.filter((s) => {
          const preview = getSessionPreview(s.metadata)
          const fields = getExtractedKeyFields(s.metadata)
          const fieldStr = Object.values(fields).join(' ').toLowerCase()
          return preview.toLowerCase().includes(q) || fieldStr.includes(q)
        })
      }

      const total = hasClientFilters ? sessions.length : (count ?? 0)
      let paginatedSessions = sessions
      let totalPages = 1
      if (hasClientFilters) {
        totalPages = Math.ceil(total / limit) || 1
        const from = (page - 1) * limit
        paginatedSessions = sessions.slice(from, from + limit)
      }

      return {
        sessions: paginatedSessions,
        total,
        page,
        limit,
        totalPages,
      }
    },
  })
}

export function useBulkExportSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (sessionIds: string[]) => {
      if (!supabase || sessionIds.length === 0) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from(SESSIONS_TABLE)
        .select('*')
        .in('id', sessionIds)

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions-list'] })
    },
  })
}

export function useBulkResendWebhooks() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_sessionIds: string[]) => {
      // Placeholder: would call Edge Function for webhook resend
      await new Promise((r) => setTimeout(r, 500))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions-list'] })
    },
  })
}
