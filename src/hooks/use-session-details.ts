import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SessionDetails } from '@/types/session-details'
import type { DashboardSession } from '@/types/dashboard'

const AGENTS_TABLE = 'agent_public_chat_visitor_view'

export function useSessionDetails(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['session-details', sessionId],
    queryFn: async (): Promise<SessionDetails | null> => {
      if (!supabase || !sessionId) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data: session, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (error || !session) return null

      const row = session as DashboardSession & { agent_id: string }
      const { data: agent } = await supabase
        .from(AGENTS_TABLE)
        .select('id, title')
        .eq('id', row.agent_id)
        .single()

      const agentData = agent as { id: string; title: string } | null
      const agentTitle = agentData?.title

      const metadata = (row.metadata ?? {}) as SessionDetails['metadata']
      if (!metadata.messages && Array.isArray((metadata as Record<string, unknown>).transcript)) {
        const transcript = (metadata as Record<string, unknown>).transcript as Array<{
          role: string
          content: string
          timestamp?: string
        }>
        metadata.messages = transcript.map((m, i) => ({
          id: `msg-${i}`,
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
          timestamp: m.timestamp ?? new Date().toISOString(),
        }))
      }

      return {
        id: row.id,
        agent_id: row.agent_id,
        agent_title: agentTitle,
        status: row.status,
        metadata,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    },
    enabled: !!sessionId,
  })
}
